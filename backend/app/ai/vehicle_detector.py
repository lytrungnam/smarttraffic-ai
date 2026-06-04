import logging
from pathlib import Path

from app.core.config import settings

_model = None
logger = logging.getLogger(__name__)
EXPECTED_VEHICLE_CLASSES = {
    "bicycle",
    "bus",
    "car",
    "motorcycle",
    "train",
    "truck",
}
VEHICLE_CLASS_ALIASES = {
    "motorbike": "motorcycle",
    "bike": "bicycle",
}


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
        import ultralytics
        from ultralytics import YOLO

        logger.info("[AI] Ultralytics version: %s", ultralytics.__version__)
        _model = YOLO(
            str(model_path)
        )
        names = _get_model_names(_model)
        logger.info("[AI] Vehicle model classes: %s", names)
        missing = sorted(EXPECTED_VEHICLE_CLASSES - set(names.values()))
        if missing:
            logger.warning(
                "[AI] Vehicle model missing expected classes after normalization: %s",
                missing,
            )
    return _model


def _get_model_names(model) -> dict[int, str]:
    raw_names = getattr(model, "names", {}) or {}
    return {
        int(class_id): _normalize_vehicle_label(label)
        for class_id, label in raw_names.items()
    }


def _normalize_vehicle_label(label: str) -> str:
    normalized = str(label).strip().lower().replace(" ", "_")
    return VEHICLE_CLASS_ALIASES.get(normalized, normalized)


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

            label = _normalize_vehicle_label(
                result.names.get(cls, str(cls))
                if isinstance(result.names, dict)
                else result.names[cls]
            )

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
