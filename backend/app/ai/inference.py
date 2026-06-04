import logging
import time
from pathlib import Path

import cv2
import numpy as np

from app.ai.ocr_reader import UNKNOWN_PLATE, UNKNOWN_TEXT, read_plate_ocr
from app.ai.plate_detector import detect_plate, get_plate_model_path
from app.ai.vehicle_detector import detect_vehicles, get_vehicle_model_path
from app.ai.vehicle_matcher import get_vehicle_type_from_plate
from app.core.config import settings

logger = logging.getLogger(__name__)


def _nearest_vehicle_type(plate_box: list[int], vehicles: list[dict]) -> str:
    if not vehicles:
        return "unclassified"

    px1, py1, px2, py2 = plate_box
    plate_cx = (px1 + px2) / 2
    plate_cy = (py1 + py2) / 2

    nearest_vehicle = min(
        vehicles,
        key=lambda vehicle: (
            ((vehicle["box"][0] + vehicle["box"][2]) / 2 - plate_cx) ** 2
            + ((vehicle["box"][1] + vehicle["box"][3]) / 2 - plate_cy) ** 2
        ),
    )
    return nearest_vehicle.get("label") or "unclassified"


def _crop_with_padding(frame, box: list[int], padding_ratio: float = 0.2):
    height, width = frame.shape[:2]
    x1, y1, x2, y2 = box
    box_width = max(1, x2 - x1)
    box_height = max(1, y2 - y1)
    pad_x = int(box_width * padding_ratio)
    pad_y = int(box_height * padding_ratio)
    x1 -= pad_x
    x2 += pad_x
    y1 -= pad_y
    y2 += pad_y
    x1 = max(0, min(width, x1))
    x2 = max(0, min(width, x2))
    y1 = max(0, min(height, y1))
    y2 = max(0, min(height, y2))
    if x2 <= x1 or y2 <= y1:
        return None
    return frame[y1:y2, x1:x2]


def _save_debug_crop(crop, index: int) -> str | None:
    if not settings.DEBUG_SAVE_PLATE_CROPS:
        return None

    debug_dir = Path("storage/debug_plates")
    debug_dir.mkdir(parents=True, exist_ok=True)
    path = debug_dir / f"plate_{int(time.time())}_{index}.jpg"
    cv2.imwrite(str(path), crop)
    logger.info("[OCR] saved debug plate crop: %s", path)
    return str(path)


def _debug_payload(
    frame,
    vehicles: list[dict],
    plates: list[dict],
    ocr_count: int,
    final_count: int,
    ocr_debug: dict | None = None,
):
    ocr_debug = ocr_debug or {}
    return {
        "image_read": frame is not None,
        "image_shape": list(frame.shape) if frame is not None else None,
        "vehicle_count": len(vehicles),
        "plate_count": len(plates),
        "ocr_count": ocr_count,
        "final_count": final_count,
        "crop_count": ocr_debug.get("crop_count", 0),
        "raw_ocr_candidates": ocr_debug.get("raw_ocr_candidates", []),
        "ocr_engine_used": ocr_debug.get("ocr_engine_used", "none"),
        "easyocr_candidates": ocr_debug.get("easyocr_candidates", []),
        "paddleocr_candidates": ocr_debug.get("paddleocr_candidates", []),
        "best_ocr_text": ocr_debug.get("best_ocr_text"),
        "best_ocr_confidence": ocr_debug.get("best_ocr_confidence", 0),
        "weights": {
            "vehicle": str(get_vehicle_model_path()),
            "plate": str(get_plate_model_path()),
        },
    }


def run_inference(image_bytes: bytes) -> dict:
    arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "results": [],
            "debug": _debug_payload(frame, [], [], 0, 0),
        }

    vehicles = detect_vehicles(frame)
    plates = detect_plate(frame)

    results = []
    ocr_count = 0
    ocr_debug = {
        "crop_count": 0,
        "raw_ocr_candidates": [],
        "ocr_engine_used": "none",
        "easyocr_candidates": [],
        "paddleocr_candidates": [],
        "best_ocr_text": None,
        "best_ocr_confidence": 0,
    }

    def update_ocr_debug(ocr):
        ocr_debug["raw_ocr_candidates"].append(
            {
                "plate_text": ocr.plate_text,
                "raw_ocr_text": ocr.raw_ocr_text,
                "normalized_ocr_text": ocr.normalized_text,
                "confidence": ocr.confidence,
                "accepted": ocr.accepted,
                "reason": ocr.reason,
                "candidates": ocr.candidates,
                "engine_used": ocr.engine_used,
            }
        )
        ocr_debug["easyocr_candidates"].extend(ocr.easyocr_candidates)
        ocr_debug["paddleocr_candidates"].extend(ocr.paddleocr_candidates)
        if ocr.accepted and ocr.engine_used != "none":
            ocr_debug["ocr_engine_used"] = ocr.engine_used
        if ocr.confidence >= float(ocr_debug["best_ocr_confidence"]):
            ocr_debug["best_ocr_text"] = ocr.normalized_text or ocr.raw_ocr_text
            ocr_debug["best_ocr_confidence"] = ocr.confidence

    for index, plate in enumerate(plates):
        crop = _crop_with_padding(frame, plate["box"])
        if crop is None:
            logger.warning("[OCR] plate_%s skipped: invalid crop box=%s", index, plate["box"])
            continue

        ocr_debug["crop_count"] += 1
        debug_crop_path = _save_debug_crop(crop, index)
        ocr = read_plate_ocr(
            crop,
            context=f"upload_plate_{index}",
            unknown_value=UNKNOWN_PLATE,
        )
        update_ocr_debug(ocr)
        vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)
        if vehicle_type == "unclassified":
            vehicle_type = _nearest_vehicle_type(plate["box"], vehicles)

        if ocr.accepted and ocr.plate_text != UNKNOWN_PLATE:
            ocr_count += 1

        results.append({
            "plate_number": ocr.plate_text,
            "raw_ocr_text": ocr.raw_ocr_text,
            "normalized_ocr_text": ocr.normalized_text,
            "ocr_confidence": ocr.confidence,
            "ocr_reason": ocr.reason,
            "vehicle_type": vehicle_type,
            "confidence": plate["confidence"],
            "box": plate["box"],
            "debug_crop_path": debug_crop_path,
        })

    if not plates:
        ocr = read_plate_ocr(
            frame,
            context="upload_full_image_fallback",
            unknown_value=UNKNOWN_TEXT,
        )
        if ocr.accepted and ocr.plate_text != UNKNOWN_TEXT:
            ocr_count += 1
            update_ocr_debug(ocr)
            results.append({
                "plate_number": ocr.plate_text,
                "raw_ocr_text": ocr.raw_ocr_text,
                "normalized_ocr_text": ocr.normalized_text,
                "ocr_confidence": ocr.confidence,
                "ocr_reason": ocr.reason,
                "vehicle_type": "unclassified",
                "confidence": 0,
                "box": None,
            })

    final_results = [
        result
        for result in results
        if result.get("plate_number") and result.get("plate_number") != UNKNOWN_TEXT
    ]

    return {
        "results": results,
        "debug": _debug_payload(
            frame,
            vehicles,
            plates,
            ocr_count,
            len(final_results),
            ocr_debug,
        ),
    }
