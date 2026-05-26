from app.ai.inference import run_inference
from app.models.detection import Detection


def serialize_detection(detection: Detection) -> dict:
    return {
        "id": str(detection.id),
        "plate_number": detection.plate_number,
        "vehicle_type": detection.vehicle_type,
        "confidence": detection.confidence,
        "location": detection.location,
        "status": detection.status,
        "image_path": detection.image_path,
        "created_at": detection.created_at.isoformat() if detection.created_at else None,
    }


async def process_detection(file_bytes: bytes) -> list[dict]:
    return run_inference(file_bytes)
