import cv2
import time

from app.ai.vehicle_detector import (
    detect_vehicles,
)

from app.ai.plate_detector import (
    detect_plate,
)

from app.ai.ocr_reader import (
    read_plate_text,
)

# webcam
# cap = cv2.VideoCapture(0)

# video file
cap = cv2.VideoCapture(
    "video.mp4"
)

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