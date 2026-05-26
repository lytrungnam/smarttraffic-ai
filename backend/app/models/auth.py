import uuid
import datetime as dt

from sqlalchemy import Column, Date
from sqlmodel import Field, SQLModel


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class WalletSession(SQLModel, table=True):
    __tablename__ = "wallet_session"

    wallet_address: str = Field(primary_key=True, max_length=42)
    nonce: str = Field(max_length=64)
    nonce_expired_at: dt.datetime = Field()


class Subscription(SQLModel, table=True):
    __tablename__ = "subscription"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    wallet_address: str = Field(index=True, max_length=42)
    camera_limit: int = Field(default=1)
    plan: str = Field(default="free", max_length=16)
    tx_hash: str | None = Field(default=None, max_length=66)
    amount_paid: float = Field(default=0.0)
    chain_id: int = Field(default=0)
    created_at: dt.datetime = Field(default_factory=_now)
    expired_at: dt.datetime | None = Field(default=None)


class UsageSession(SQLModel, table=True):
    __tablename__ = "usage_session"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    wallet_address: str = Field(index=True, max_length=42)
    # "date" as field name clashes with the date type — use explicit column name
    session_date: dt.date = Field(sa_column=Column("date", Date, index=True))
    used_minutes: int = Field(default=0)
    last_active: dt.datetime = Field(default_factory=_now)
