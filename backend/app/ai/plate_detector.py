from ultralytics import YOLO


plate_model = YOLO(
    "app/ai/weights/plate_best.pt"
)


def detect_plate(frame):

    results = plate_model(
        frame,
        verbose=False,
    )

    plates = []

    for result in results:

        for box in result.boxes:

            conf = float(
                box.conf[0]
            )

            if conf < 0.4:
                continue

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            plates.append({

                "box": [
                    x1,
                    y1,
                    x2,
                    y2,
                ],

                "confidence": round(
                    conf * 100,
                    2,
                ),
            })

    return plates