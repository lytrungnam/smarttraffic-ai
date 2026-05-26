import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class DetectionBase(SQLModel):

    plate_number: str = Field(
        index=True
    )

    vehicle_type: str

    confidence: float

    location: Optional[str] = None

    status: str = Field(
        default="detected"
    )

    image_path: Optional[str] = None

    cropped_plate_path: Optional[str] = None

    violation_type: Optional[str] = None

    speed: Optional[float] = None

class Detection(DetectionBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
    )

    camera_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="camera.id",
    )

    camera: Optional["Camera"] = Relationship(
        back_populates="detections",
    )


class DetectionCreate(DetectionBase):
    camera_id: uuid.UUID


class DetectionUpdate(SQLModel):
    plate_number: Optional[str] = None

    vehicle_type: Optional[str] = None
    confidence: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None
    image_path: Optional[str] = None

    violation_type: Optional[str] = None
    speed: Optional[float] = None


class DetectionPublic(DetectionBase):
    id: uuid.UUID

    camera_id: uuid.UUID | None

    created_at: datetime
