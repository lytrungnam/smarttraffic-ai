from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.camera import Camera
from app.models.detection import Detection
from app.services.detection_service import serialize_detection
from app.services.vehicle_classes import (
    TRAFFIC_VEHICLE_CLASSES,
    normalize_vehicle_class,
)


def get_detection_summary(session: Session):
    total = session.exec(
        select(func.count(Detection.id))
    ).one()

    today = datetime.utcnow().date()

    detections_today = session.exec(
        select(func.count(Detection.id)).where(
            func.date(Detection.created_at) == today
        )
    ).one()

    vehicle_type_rows = session.exec(
        select(
            Detection.vehicle_type,
            func.count(Detection.id),
        )
        .group_by(Detection.vehicle_type)
        .order_by(func.count(Detection.id).desc())
    ).all()

    latest_detections = session.exec(
        select(Detection)
        .order_by(Detection.created_at.desc())
        .limit(5)
    ).all()

    unique_plates = session.exec(
        select(
            func.count(
                func.distinct(Detection.plate_number)
            )
        )
    ).one()

    vehicle_type_counts = dict.fromkeys(TRAFFIC_VEHICLE_CLASSES, 0)
    for vehicle_type, count in vehicle_type_rows:
        normalized_type = normalize_vehicle_class(vehicle_type)
        if normalized_type:
            vehicle_type_counts[normalized_type] += count

    online_camera_count = session.exec(
        select(func.count(Camera.id)).where(Camera.is_active == True)  # noqa: E712
    ).one()

    total_vehicle_count = sum(
        vehicle_type_counts.values()
    )

    return {
        "total_detections": total,
        "detections_today": detections_today,
        "unique_plates": unique_plates,
        "vehicle_type_counts": vehicle_type_counts,
        "total_vehicle_count": total_vehicle_count,
        "latest_detections": [
            serialize_detection(detection)
            for detection in latest_detections
        ],
        "online_camera_count": online_camera_count,
    }
