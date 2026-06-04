import logging
import re
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)

UNKNOWN_TEXT = "UNKNOWN"
UNKNOWN_PLATE = "UNKNOWN_PLATE"

_reader = None
_paddle_reader = None
_paddle_unavailable = False


@dataclass
class OCRResult:
    plate_text: str
    raw_ocr_text: str
    normalized_text: str
    confidence: float
    accepted: bool
    reason: str
    candidates: list[dict] = field(default_factory=list)
    engine_used: str = "none"
    easyocr_candidates: list[dict] = field(default_factory=list)
    paddleocr_candidates: list[dict] = field(default_factory=list)


def _get_reader():
    global _reader
    if _reader is None:
        logger.info("[AI] Loading EasyOCR reader")
        import easyocr

        _reader = easyocr.Reader(
            ["en"],
            gpu=False,
            model_storage_directory=str(Path("/app/.EasyOCR")),
        )
    return _reader


def _get_paddle_reader():
    global _paddle_reader, _paddle_unavailable

    if _paddle_unavailable:
        return None

    if _paddle_reader is None:
        try:
            logger.info("[AI] Loading PaddleOCR reader")
            from paddleocr import PaddleOCR

            _paddle_reader = PaddleOCR(
                use_angle_cls=True,
                lang="en",
                show_log=False,
            )
        except Exception as exc:
            _paddle_unavailable = True
            logger.warning(
                "[OCR] PaddleOCR unavailable; falling back to EasyOCR: %s",
                exc,
            )
            return None

    return _paddle_reader


def _is_paddle_unavailable() -> bool:
    return _paddle_unavailable


# =====================================
# VIETNAM PROVINCE CODES
# =====================================

PROVINCE_CODES = {
    "11": "Cao Bang",
    "12": "Lang Son",
    "14": "Quang Ninh",
    "15": "Hai Phong",
    "17": "Thai Binh",
    "18": "Nam Dinh",
    "19": "Phu Tho",
    "20": "Thai Nguyen",
    "21": "Yen Bai",
    "22": "Tuyen Quang",
    "23": "Ha Giang",
    "24": "Lao Cai",
    "25": "Lai Chau",
    "26": "Son La",
    "27": "Dien Bien",
    "28": "Hoa Binh",
    "29": "Ha Noi",
    "30": "Ha Noi",
    "31": "Ha Noi",
    "32": "Ha Noi",
    "33": "Ha Noi",
    "40": "Ha Noi",
    "34": "Hai Duong",
    "35": "Ninh Binh",
    "36": "Thanh Hoa",
    "37": "Nghe An",
    "38": "Ha Tinh",
    "43": "Da Nang",
    "47": "Dak Lak",
    "48": "Dak Nong",
    "49": "Lam Dong",
    "50": "Ho Chi Minh",
    "51": "Ho Chi Minh",
    "52": "Ho Chi Minh",
    "53": "Ho Chi Minh",
    "54": "Ho Chi Minh",
    "55": "Ho Chi Minh",
    "56": "Ho Chi Minh",
    "57": "Ho Chi Minh",
    "58": "Ho Chi Minh",
    "59": "Ho Chi Minh",
    "60": "Dong Nai",
    "61": "Binh Duong",
    "62": "Long An",
    "63": "Tien Giang",
    "64": "Vinh Long",
    "65": "Can Tho",
    "66": "Dong Thap",
    "67": "An Giang",
    "68": "Kien Giang",
    "69": "Ca Mau",
    "70": "Tay Ninh",
    "71": "Ben Tre",
    "72": "Ba Ria Vung Tau",
    "73": "Quang Binh",
    "74": "Quang Tri",
    "75": "Hue",
    "76": "Quang Ngai",
    "77": "Binh Dinh",
    "78": "Phu Yen",
    "79": "Ho Chi Minh",
    "81": "Gia Lai",
    "82": "Kon Tum",
    "83": "Soc Trang",
    "84": "Tra Vinh",
    "85": "Ninh Thuan",
    "86": "Binh Thuan",
    "88": "Vinh Phuc",
    "89": "Hung Yen",
    "90": "Ha Nam",
    "92": "Quang Nam",
    "93": "Binh Phuoc",
    "94": "Bac Lieu",
    "95": "Hau Giang",
    "97": "Bac Kan",
    "98": "Bac Giang",
    "99": "Bac Ninh",
}


def normalize_plate(text: str) -> str:
    text = text.upper()
    return re.sub(r"[^A-Z0-9]", "", text)


def _apply_safe_substitutions(text: str) -> str:
    return (
        text.replace("O", "0")
        .replace("I", "1")
        .replace("S", "5")
        .replace("G", "6")
    )


def _normalization_options(text: str) -> list[tuple[str, bool]]:
    normalized = normalize_plate(text)
    substituted = _apply_safe_substitutions(normalized)
    if substituted != normalized:
        return [(normalized, False), (substituted, True)]
    return [(normalized, False)]


def _is_plate_like(text: str) -> tuple[bool, str]:
    if not text:
        return False, "empty normalized OCR text"

    if len(text) < 5:
        return False, "normalized OCR text too short"

    if len(text) > 10:
        return False, "normalized OCR text too long"

    digit_count = sum(char.isdigit() for char in text)
    letter_count = sum(char.isalpha() for char in text)

    if digit_count == 0:
        return False, "normalized OCR text has no digits"

    if letter_count == 0 and digit_count < 5:
        return False, "numeric-only OCR text is too short"

    return True, "accepted plate-like OCR text"


def _candidate_from_text(
    *,
    engine: str,
    variant: str,
    raw_text: str,
    confidence: float,
) -> list[dict]:
    candidates = []
    for normalized, used_substitution in _normalization_options(raw_text):
        accepted, reason = _is_plate_like(normalized)
        candidates.append(
            {
                "engine": engine,
                "variant": variant,
                "raw_text": raw_text,
                "normalized_text": normalized,
                "confidence": confidence,
                "accepted": accepted,
                "reason": reason,
                "used_substitution": used_substitution,
            }
        )
    return candidates


def format_vn_plate(text: str) -> str:
    if len(text) == 8:
        return f"{text[:3]}-{text[3:6]}.{text[6:]}"

    if len(text) == 9:
        return f"{text[:3]}-{text[3:6]}.{text[6:]}"

    return text


def _sharpen(image: np.ndarray) -> np.ndarray:
    sharpen_kernel = np.array(
        [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
        dtype=np.float32,
    )
    return cv2.filter2D(image, -1, sharpen_kernel)


def _prepare_ocr_images(plate_image: np.ndarray) -> list[tuple[str, np.ndarray]]:
    variants: list[tuple[str, np.ndarray]] = []
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))

    for scale in (3, 4):
        resized = cv2.resize(
            plate_image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC,
        )

        if len(resized.shape) == 3:
            rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        else:
            rgb = resized
            gray = resized

        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        contrasted = clahe.apply(denoised)
        sharpened = _sharpen(contrasted)
        bilateral = cv2.bilateralFilter(sharpened, 7, 50, 50)

        adaptive = cv2.adaptiveThreshold(
            bilateral,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            31,
            7,
        )
        adaptive_inverse = cv2.adaptiveThreshold(
            bilateral,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            31,
            7,
        )
        _, otsu = cv2.threshold(
            bilateral,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU,
        )

        variants.extend(
            [
                (f"rgb_resized_{scale}x", rgb),
                (f"gray_{scale}x", gray),
                (f"gray_denoised_{scale}x", denoised),
                (f"clahe_{scale}x", contrasted),
                (f"sharpened_{scale}x", sharpened),
                (f"bilateral_{scale}x", bilateral),
                (f"adaptive_threshold_{scale}x", adaptive),
                (f"adaptive_inverse_{scale}x", adaptive_inverse),
                (f"otsu_threshold_{scale}x", otsu),
            ]
        )

    return variants


def _run_easyocr(
    variants: list[tuple[str, np.ndarray]],
    *,
    context: str,
) -> list[dict]:
    candidates: list[dict] = []
    reader = _get_reader()
    for variant_name, image in variants:
        raw_results = reader.readtext(image, detail=1, paragraph=False)
        logger.info(
            "[OCR] %s engine=easyocr variant=%s raw_result=%s",
            context,
            variant_name,
            raw_results,
        )

        for raw_result in raw_results:
            raw_text = str(raw_result[1])
            confidence = float(raw_result[2])
            new_candidates = _candidate_from_text(
                engine="easyocr",
                variant=variant_name,
                raw_text=raw_text,
                confidence=confidence,
            )
            candidates.extend(new_candidates)
            for candidate in new_candidates:
                logger.info(
                    "[OCR] %s engine=easyocr raw=%r normalized=%r "
                    "confidence=%.3f accepted=%s reason=%s",
                    context,
                    raw_text,
                    candidate["normalized_text"],
                    confidence,
                    candidate["accepted"],
                    candidate["reason"],
                )

    return candidates


def _iter_paddle_text_results(raw_results) -> list[tuple[str, float]]:
    text_results: list[tuple[str, float]] = []

    if not raw_results:
        return text_results

    for page_result in raw_results:
        if isinstance(page_result, dict):
            texts = page_result.get("rec_texts") or []
            scores = page_result.get("rec_scores") or []
            for text, score in zip(texts, scores, strict=False):
                text_results.append((str(text), float(score)))
            continue

        if not page_result:
            continue

        for item in page_result:
            if (
                isinstance(item, (list, tuple))
                and len(item) >= 2
                and isinstance(item[1], (list, tuple))
                and len(item[1]) >= 2
            ):
                text_results.append((str(item[1][0]), float(item[1][1])))
            elif (
                isinstance(item, (list, tuple))
                and len(item) >= 2
                and isinstance(item[0], str)
            ):
                text_results.append((str(item[0]), float(item[1])))

    return text_results


def _run_paddleocr(
    variants: list[tuple[str, np.ndarray]],
    *,
    context: str,
) -> list[dict]:
    candidates: list[dict] = []
    reader = _get_paddle_reader()
    if reader is None:
        return candidates

    for variant_name, image in variants:
        try:
            raw_results = reader.ocr(image, cls=True)
        except Exception as exc:
            logger.warning(
                "[OCR] %s PaddleOCR failed for variant=%s: %s",
                context,
                variant_name,
                exc,
            )
            continue

        logger.info(
            "[OCR] %s engine=paddleocr variant=%s raw_result=%s",
            context,
            variant_name,
            raw_results,
        )

        for raw_text, confidence in _iter_paddle_text_results(raw_results):
            new_candidates = _candidate_from_text(
                engine="paddleocr",
                variant=variant_name,
                raw_text=raw_text,
                confidence=confidence,
            )
            candidates.extend(new_candidates)
            for candidate in new_candidates:
                logger.info(
                    "[OCR] %s engine=paddleocr raw=%r normalized=%r "
                    "confidence=%.3f accepted=%s reason=%s",
                    context,
                    raw_text,
                    candidate["normalized_text"],
                    confidence,
                    candidate["accepted"],
                    candidate["reason"],
                )

    return candidates


def _best_candidate(candidates: list[dict]) -> dict | None:
    if not candidates:
        return None

    accepted_candidates = [
        candidate for candidate in candidates if candidate["accepted"]
    ]
    if accepted_candidates:
        return max(
            accepted_candidates,
            key=lambda candidate: (
                candidate["confidence"],
                len(candidate["normalized_text"]),
            ),
        )

    return max(candidates, key=lambda candidate: candidate["confidence"])


def _result_from_candidates(
    *,
    candidates: list[dict],
    easyocr_candidates: list[dict],
    paddleocr_candidates: list[dict],
    unknown_value: str,
    default_reason: str,
) -> OCRResult:
    best = _best_candidate(candidates)
    if best is None:
        return OCRResult(
            plate_text=unknown_value,
            raw_ocr_text="",
            normalized_text="",
            confidence=0.0,
            accepted=False,
            reason=default_reason,
            candidates=candidates,
            engine_used="none",
            easyocr_candidates=easyocr_candidates,
            paddleocr_candidates=paddleocr_candidates,
        )

    accepted = bool(best["accepted"])
    return OCRResult(
        plate_text=(
            format_vn_plate(best["normalized_text"])
            if accepted
            else unknown_value
        ),
        raw_ocr_text=best["raw_text"],
        normalized_text=best["normalized_text"],
        confidence=float(best["confidence"]),
        accepted=accepted,
        reason=str(best["reason"]),
        candidates=candidates,
        engine_used=str(best["engine"]) if accepted else "none",
        easyocr_candidates=easyocr_candidates,
        paddleocr_candidates=paddleocr_candidates,
    )


def read_plate_ocr(
    plate_image: np.ndarray | None,
    *,
    context: str = "plate",
    unknown_value: str = UNKNOWN_PLATE,
) -> OCRResult:
    if plate_image is None or plate_image.size == 0:
        logger.warning("[OCR] %s rejected: empty plate crop", context)
        return OCRResult(unknown_value, "", "", 0.0, False, "empty plate crop", [])

    logger.info("[OCR] %s crop_shape=%s", context, tuple(plate_image.shape))
    engine = settings.OCR_ENGINE
    variants = _prepare_ocr_images(plate_image)
    easyocr_candidates: list[dict] = []
    paddleocr_candidates: list[dict] = []

    try:
        if engine in ("easyocr", "hybrid"):
            easyocr_candidates = _run_easyocr(variants, context=context)

        easyocr_result = _result_from_candidates(
            candidates=easyocr_candidates,
            easyocr_candidates=easyocr_candidates,
            paddleocr_candidates=[],
            unknown_value=unknown_value,
            default_reason="no EasyOCR text detected",
        )

        if engine == "easyocr" or (
            engine == "hybrid" and easyocr_result.accepted
        ):
            result = easyocr_result
        else:
            if engine in ("paddleocr", "hybrid"):
                paddleocr_candidates = _run_paddleocr(
                    variants,
                    context=context,
                )
            if (
                engine == "paddleocr"
                and _is_paddle_unavailable()
                and not easyocr_candidates
            ):
                easyocr_candidates = _run_easyocr(variants, context=context)
            result = _result_from_candidates(
                candidates=[*easyocr_candidates, *paddleocr_candidates],
                easyocr_candidates=easyocr_candidates,
                paddleocr_candidates=paddleocr_candidates,
                unknown_value=unknown_value,
                default_reason="no OCR text detected",
            )
    except Exception as exc:
        logger.exception("[OCR] %s failed: %s", context, exc)
        result = _result_from_candidates(
            candidates=[*easyocr_candidates, *paddleocr_candidates],
            easyocr_candidates=easyocr_candidates,
            paddleocr_candidates=paddleocr_candidates,
            unknown_value=unknown_value,
            default_reason=str(exc),
        )

    if not result.accepted:
        logger.warning(
            "[OCR] %s unreadable: raw=%r normalized=%r reason=%s",
            context,
            result.raw_ocr_text,
            result.normalized_text,
            result.reason,
        )

    return result


def read_plate_text(plate_image: np.ndarray | None) -> str:
    result = read_plate_ocr(plate_image, unknown_value=UNKNOWN_TEXT)
    return result.plate_text
