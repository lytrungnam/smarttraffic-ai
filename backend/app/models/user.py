
import uuid
from datetime import datetime, timezone


from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc():
    return datetime.now(timezone.utc)


class UserBase(SQLModel):
    email: EmailStr = Field(
        unique=True,
        index=True,
        max_length=255,
    )

    is_active: bool = True
    is_superuser: bool = False

    full_name: str | None = Field(
        default=None,
        max_length=255,
    )


class User(UserBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    hashed_password: str

    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )



class UserCreate(UserBase):
    password: str = Field(
        min_length=8,
        max_length=40,
    )
class UserRegister(SQLModel):
    email: EmailStr = Field(
        max_length=255,
    )

    password: str = Field(
        min_length=8,
        max_length=40,
    )

    full_name: str | None = Field(
        default=None,
        max_length=255,
    )
    


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(
        default=None,
        max_length=255,
    )

    full_name: str | None = Field(
        default=None,
        max_length=255,
    )

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=40,
    )

    is_active: bool | None = None
    is_superuser: bool | None = None
    
class UserUpdateMe(SQLModel):
    full_name: str | None = Field(
        default=None,
        max_length=255,
    )

    email: EmailStr | None = Field(
        default=None,
        max_length=255,
    )


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None

class UpdatePassword(SQLModel):
    current_password: str = Field(
        min_length=8,
        max_length=40,
    )

    new_password: str = Field(
        min_length=8,
        max_length=40,
    )
class NewPassword(SQLModel):
    token: str
    new_password: str = Field(
        min_length=8,
        max_length=40,
    )


class Message(SQLModel):
    message: str