import cv2
import numpy as np

from app.ai.vehicle_detector import detect_vehicles
from app.ai.plate_detector import detect_plate
from app.ai.ocr_reader import read_plate_text
from app.ai.vehicle_matcher import get_vehicle_type_from_plate


def run_inference(image_bytes: bytes) -> list[dict]:
    arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if frame is None:
        return []

    vehicles = detect_vehicles(frame)
    plates = detect_plate(frame)

    results = []

    for plate in plates:
        x1, y1, x2, y2 = plate["box"]
        crop = frame[y1:y2, x1:x2]
        text = read_plate_text(crop)
        vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)

        results.append({
            "plate_number": text,
            "vehicle_type": vehicle_type,
            "confidence": plate["confidence"],
        })

    return results
