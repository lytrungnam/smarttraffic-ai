import logging
from pathlib import Path

from app.core.config import settings

_plate_model = None
logger = logging.getLogger(__name__)


def get_plate_model_path() -> Path:
    return Path(__file__).resolve().parent / "weights" / "plate_best.pt"


def _get_plate_model():
    global _plate_model
    if _plate_model is None:
        model_path = get_plate_model_path()
        if not model_path.exists():
            raise FileNotFoundError(
                f"Plate YOLO weights not found: {model_path}"
            )

        logger.info("[AI] Loading YOLO plate model")
        logger.info("[AI] Plate weights: %s", model_path)
        from ultralytics import YOLO

        _plate_model = YOLO(
            str(model_path)
        )
    return _plate_model


def detect_plate(frame):

    results = _get_plate_model()(
        frame,
        conf=settings.PLATE_CONFIDENCE_THRESHOLD,
        verbose=False,
    )

    plates = []

    for result in results:

        for box in result.boxes:

            conf = float(
                box.conf[0]
            )

            if conf < settings.PLATE_CONFIDENCE_THRESHOLD:
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
