import os
import time

import cv2

from app.ai.ocr_reader import (
    read_plate_text,
)
from app.ai.plate_detector import (
    detect_plate,
)
from app.ai.vehicle_detector import (
    detect_vehicles,
)


def _opencv_capture_source(source: str) -> int | str:
    stripped_source = source.strip()
    if stripped_source.isdigit():
        return int(stripped_source)
    return stripped_source


camera_source = os.getenv("CAMERA_SOURCE")
if not camera_source:
    raise SystemExit(
        "CAMERA_SOURCE is required. Examples: CAMERA_SOURCE=0 for webcam, "
        "CAMERA_SOURCE=rtsp://... for IP camera, or CAMERA_SOURCE=sample.mp4."
    )

cap = cv2.VideoCapture(
    _opencv_capture_source(camera_source)
)
if not cap.isOpened():
    raise SystemExit(f"Unable to open CAMERA_SOURCE={camera_source!r}")

# save unique plates only
saved_plates = set()

while True:

    success, frame = cap.read()

    if not success:
        break

    # =========================
    # VEHICLE DETECTION
    # =========================
    vehicle_results = detect_vehicles(
        frame
    )

    for vehicle in vehicle_results:

        x1, y1, x2, y2 = vehicle["box"]

        label = vehicle["label"]

        confidence = vehicle["confidence"]

        # draw vehicle box
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2,
        )

        # draw vehicle text
        cv2.putText(
            frame,
            f"{label} {confidence}%",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2,
        )

    # =========================
    # PLATE DETECTION
    # =========================
    plate_results = detect_plate(
        frame
    )

    for plate in plate_results:

        x1, y1, x2, y2 = plate["box"]

        # crop plate
        plate_crop = frame[
            y1:y2,
            x1:x2,
        ]

        # OCR
        plate_text = read_plate_text(
            plate_crop
        )

        print(
            "Plate Text:",
            plate_text,
        )

        # =========================
        # SAVE DETECTION IMAGE
        # =========================
        if (
            plate_text != "UNKNOWN"
            and plate_text not in saved_plates
        ):

            saved_plates.add(
                plate_text
            )

            timestamp = int(
                time.time()
            )

            image_path = (
                f"storage/detections/"
                f"{plate_text}_{timestamp}.jpg"
            )

            cv2.imwrite(
                image_path,
                frame,
            )

            print(
                f"Saved: {image_path}"
            )

        # draw plate box
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 0, 255),
            2,
        )

        # draw OCR text
        cv2.putText(
            frame,
            plate_text,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2,
        )

    # =========================
    # SHOW FRAME
    # =========================
    cv2.imshow(
        "SmartTraffic AI",
        frame,
    )

    # press q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()

cv2.destroyAllWindows()
