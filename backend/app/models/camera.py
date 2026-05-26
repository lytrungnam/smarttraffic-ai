import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc():
    return datetime.now(timezone.utc)


class CameraBase(SQLModel):
    name: str = Field(max_length=255)
    location: str = Field(max_length=255)

    stream_url: str
    camera_type: str = Field(default="traffic")

    is_active: bool = True


class Camera(CameraBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    detections: list["Detection"] = Relationship(
        back_populates="camera",
    )


class CameraCreate(CameraBase):
    pass


class CameraUpdate(SQLModel):
    name: Optional[str] = None
    location: Optional[str] = None

    stream_url: Optional[str] = None

    is_active: Optional[bool] = None


class CameraPublic(CameraBase):
    id: uuid.UUID
    created_at: datetime