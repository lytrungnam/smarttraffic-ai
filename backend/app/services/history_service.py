import math

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.detection import Detection
from app.services.detection_service import serialize_detection


def get_paginated_history(
    session: Session,
    page: int,
    limit: int,
    search: str | None,
    vehicle_type: str | None,
) -> dict:
    filters = []

    if search:
        filters.append(Detection.plate_number.ilike(f"%{search.strip()}%"))

    if vehicle_type:
        filters.append(Detection.vehicle_type.ilike(vehicle_type.strip()))

    count_statement = select(func.count(Detection.id))
    statement = select(Detection)

    if filters:
        count_statement = count_statement.where(*filters)
        statement = statement.where(*filters)

    total = session.exec(count_statement).one()
    pages = max(1, math.ceil(total / limit))
    offset = (page - 1) * limit

    detections = session.exec(
        statement.order_by(Detection.created_at.desc()).offset(offset).limit(limit)
    ).all()

    return {
        "items": [serialize_detection(d) for d in detections],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages,
    }
