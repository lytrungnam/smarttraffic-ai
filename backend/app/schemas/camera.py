from typing import List, Optional
from sqlmodel import SQLModel, Field
import uuid
from datetime import datetime


class CameraBase(SQLModel):
	name: str = Field(max_length=255)
	location: str = Field(max_length=255)
	source_url: str
	camera_type: str = Field(default="webcam")


class CameraCreate(CameraBase):
	pass


class CameraUpdate(SQLModel):
	name: Optional[str] = None
	location: Optional[str] = None
	source_url: Optional[str] = None
	camera_type: Optional[str] = None
	status: Optional[str] = None


class CameraPublic(CameraBase):
	id: uuid.UUID
	status: str
	created_at: Optional[datetime] = None


class CamerasPublic(SQLModel):
	data: List[CameraPublic]
	count: int
