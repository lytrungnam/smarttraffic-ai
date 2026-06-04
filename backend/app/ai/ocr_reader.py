import logging
import re
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

logger = logging.getLogger(__name__)

UNKNOWN_TEXT = "UNKNOWN"
UNKNOWN_PLATE = "UNKNOWN_PLATE"

_reader = None


@dataclass
class OCRResult:
    plate_text: str
    raw_ocr_text: str
    normalized_text: str
    confidence: float
    accepted: bool
    reason: str
    candidates: list[dict]


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
    """Normalize without converting valid Vietnamese series letters to digits."""
    text = text.upper()
    return re.sub(r"[^A-Z0-9]", "", text)


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

    best_result = OCRResult(
        plate_text=unknown_value,
        raw_ocr_text="",
        normalized_text="",
        confidence=0.0,
        accepted=False,
        reason="no OCR text detected",
        candidates=[],
    )
    candidates: list[dict] = []

    try:
        reader = _get_reader()
        for variant_name, image in _prepare_ocr_images(plate_image):
            raw_results = reader.readtext(image, detail=1, paragraph=False)
            logger.info(
                "[OCR] %s variant=%s raw_result=%s",
                context,
                variant_name,
                raw_results,
            )

            for raw_result in raw_results:
                raw_text = str(raw_result[1])
                confidence = float(raw_result[2])
                normalized = normalize_plate(raw_text)
                accepted, reason = _is_plate_like(normalized)
                candidate = {
                    "variant": variant_name,
                    "raw_text": raw_text,
                    "normalized_text": normalized,
                    "confidence": confidence,
                    "accepted": accepted,
                    "reason": reason,
                }
                candidates.append(candidate)

                logger.info(
                    "[OCR] %s raw=%r normalized=%r confidence=%.3f "
                    "accepted=%s reason=%s",
                    context,
                    raw_text,
                    normalized,
                    confidence,
                    accepted,
                    reason,
                )

                if not accepted:
                    if confidence > best_result.confidence:
                        best_result = OCRResult(
                            plate_text=unknown_value,
                            raw_ocr_text=raw_text,
                            normalized_text=normalized,
                            confidence=confidence,
                            accepted=False,
                            reason=reason,
                            candidates=candidates,
                        )
                    continue

                if confidence >= best_result.confidence:
                    best_result = OCRResult(
                        plate_text=format_vn_plate(normalized),
                        raw_ocr_text=raw_text,
                        normalized_text=normalized,
                        confidence=confidence,
                        accepted=True,
                        reason=reason,
                        candidates=candidates,
                    )

    except Exception as exc:
        logger.exception("[OCR] %s failed: %s", context, exc)
        return OCRResult(unknown_value, "", "", 0.0, False, str(exc), candidates)

    if not best_result.accepted:
        logger.warning(
            "[OCR] %s unreadable: raw=%r normalized=%r reason=%s",
            context,
            best_result.raw_ocr_text,
            best_result.normalized_text,
            best_result.reason,
        )

    best_result.candidates = candidates
    return best_result


def read_plate_text(plate_image: np.ndarray | None) -> str:
    result = read_plate_ocr(plate_image, unknown_value=UNKNOWN_TEXT)
    return result.plate_text
