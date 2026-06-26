from datetime import datetime
from typing import List, Optional
import uuid

from sqlmodel import Field, SQLModel


ALLOWED_CAMERA_TYPES = (
    "webcam",
    "rtsp",
    "ip_camera",
    "video_file",
    "mobile",
)


class CameraBase(SQLModel):
    name: str = Field(max_length=255)

    location: str = Field(max_length=255)

    # Frontend field
    source_url: str = Field(default="")

    # webcam | rtsp | ip_camera | video_file | mobile
    camera_type: str = Field(
        default="webcam",
        max_length=50,
    )


class CameraCreate(CameraBase):
    pass


class CameraUpdate(SQLModel):
    name: Optional[str] = None

    location: Optional[str] = None

    source_url: Optional[str] = None

    camera_type: Optional[str] = None

    # active | inactive
    status: Optional[str] = None


class CameraPublic(CameraBase):
    id: uuid.UUID

    status: str

    created_at: Optional[datetime] = None


class CamerasPublic(SQLModel):
    data: List[CameraPublic]

    count: int