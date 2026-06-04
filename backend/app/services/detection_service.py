from pathlib import Path

from app.ai.inference import run_inference
from app.models.detection import Detection


def serialize_detection(detection: Detection) -> dict:
    payload = {
        "id": str(detection.id),
        "plate_number": detection.plate_number,
        "vehicle_type": detection.vehicle_type,
        "confidence": detection.confidence,
        "location": detection.location,
        "status": detection.status,
        "image_path": detection.image_path,
        "created_at": detection.created_at.isoformat() if detection.created_at else None,
    }

    if detection.image_path:
        original_path = Path(detection.image_path)
        annotated_path = original_path.with_name(
            f"{original_path.stem}_annotated.jpg"
        )
        if annotated_path.exists():
            payload["annotated_image_path"] = str(annotated_path)
            payload["annotated_evidence_path"] = str(annotated_path)

    return payload


async def process_detection(file_bytes: bytes) -> dict:
    return run_inference(file_bytes)
