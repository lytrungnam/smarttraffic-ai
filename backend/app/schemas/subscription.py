from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

PlanName = str


class SubscriptionActivate(BaseModel):
    plan: PlanName


class SubscriptionPublic(BaseModel):
    id: UUID | None = None
    user_id: UUID | None = None
    plan: str = "free_trial"
    status: str = "inactive"
    started_at: datetime | None = None
    expires_at: datetime | None = None
    payment_provider: str | None = None
    payment_status: str | None = None
    message: str | None = None
