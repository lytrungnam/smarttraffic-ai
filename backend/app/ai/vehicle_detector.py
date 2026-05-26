from ultralytics import YOLO


model = YOLO(
    "app/ai/weights/vehicle_best.pt"
)


def detect_vehicles(frame):

    results = model(
        frame,
        verbose=False,
    )

    detections = []

    for result in results:

        for box in result.boxes:

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            cls = int(box.cls[0])

            conf = float(box.conf[0])

            label = result.names[cls]

            detections.append({

                "label": label,

                "confidence": round(
                    conf * 100,
                    2,
                ),

                "box": [
                    x1,
                    y1,
                    x2,
                    y2,
                ],
            })

    return detections