import logging
from pathlib import Path

from app.core.config import settings

_model = None
logger = logging.getLogger(__name__)


def get_vehicle_model_path() -> Path:
    return Path(__file__).resolve().parent / "weights" / "vehicle_best.pt"


def _get_model():
    global _model
    if _model is None:
        model_path = get_vehicle_model_path()
        if not model_path.exists():
            raise FileNotFoundError(
                f"Vehicle YOLO weights not found: {model_path}"
            )

        logger.info("[AI] Loading YOLO vehicle model")
        logger.info("[AI] Vehicle weights: %s", model_path)
        from ultralytics import YOLO

        _model = YOLO(
            str(model_path)
        )
    return _model


def detect_vehicles(frame):

    results = _get_model()(
        frame,
        conf=settings.VEHICLE_CONFIDENCE_THRESHOLD,
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
