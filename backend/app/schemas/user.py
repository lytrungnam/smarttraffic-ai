from pydantic import EmailStr
from sqlmodel import SQLModel, Field

import uuid
from datetime import datetime


class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserPublic(SQLModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    created_at: datetime | None = None