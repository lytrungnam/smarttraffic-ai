import cv2
import numpy as np

from app.ai.ocr_reader import read_plate_text
from app.ai.plate_detector import detect_plate, get_plate_model_path
from app.ai.vehicle_detector import detect_vehicles, get_vehicle_model_path
from app.ai.vehicle_matcher import get_vehicle_type_from_plate


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


def _safe_crop(frame, box: list[int]):
    height, width = frame.shape[:2]
    x1, y1, x2, y2 = box
    x1 = max(0, min(width, x1))
    x2 = max(0, min(width, x2))
    y1 = max(0, min(height, y1))
    y2 = max(0, min(height, y2))
    if x2 <= x1 or y2 <= y1:
        return None
    return frame[y1:y2, x1:x2]


def _debug_payload(frame, vehicles: list[dict], plates: list[dict], ocr_count: int, final_count: int):
    return {
        "image_read": frame is not None,
        "image_shape": list(frame.shape) if frame is not None else None,
        "vehicle_count": len(vehicles),
        "plate_count": len(plates),
        "ocr_count": ocr_count,
        "final_count": final_count,
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

    for plate in plates:
        crop = _safe_crop(frame, plate["box"])
        if crop is None:
            continue

        text = read_plate_text(crop)
        vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)
        if vehicle_type == "unclassified":
            vehicle_type = _nearest_vehicle_type(plate["box"], vehicles)

        if text and text != "UNKNOWN":
            ocr_count += 1

        results.append({
            "plate_number": text,
            "vehicle_type": vehicle_type,
            "confidence": plate["confidence"],
            "box": plate["box"],
        })

    if not plates:
        text = read_plate_text(frame)
        if text and text != "UNKNOWN":
            ocr_count += 1
            results.append({
                "plate_number": text,
                "vehicle_type": "unclassified",
                "confidence": 0,
                "box": None,
            })

    final_results = [
        result
        for result in results
        if result.get("plate_number") and result.get("plate_number") != "UNKNOWN"
    ]

    return {
        "results": results,
        "debug": _debug_payload(
            frame,
            vehicles,
            plates,
            ocr_count,
            len(final_results),
        ),
    }
