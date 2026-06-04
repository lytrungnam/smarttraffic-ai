import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class UserSubscription(SQLModel, table=True):
    __tablename__ = "user_subscription"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    plan: str = Field(default="free_trial", max_length=32)
    status: str = Field(default="active", max_length=16)
    started_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    expires_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    payment_provider: str = Field(default="momo_demo", max_length=32)
    payment_status: str = Field(default="paid_demo", max_length=32)
