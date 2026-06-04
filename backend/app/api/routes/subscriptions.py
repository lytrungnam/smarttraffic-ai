from datetime import timedelta
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.subscription import UserSubscription, get_datetime_utc
from app.schemas.subscription import SubscriptionActivate, SubscriptionPublic

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

ALLOWED_PLANS = {"free_trial", "basic", "pro", "enterprise"}
PAID_DEMO_PLANS = {"basic", "pro"}
PLAN_DURATIONS = {
    "free_trial": timedelta(days=7),
    "basic": timedelta(days=30),
    "pro": timedelta(days=30),
}


def _serialize(subscription: UserSubscription | None) -> SubscriptionPublic:
    if subscription is None:
        return SubscriptionPublic(
            message="No active subscription. Choose a plan to start using SmartTraffic AI."
        )

    return SubscriptionPublic(
        id=subscription.id,
        user_id=subscription.user_id,
        plan=subscription.plan,
        status=subscription.status,
        started_at=subscription.started_at,
        expires_at=subscription.expires_at,
        payment_provider=subscription.payment_provider,
        payment_status=subscription.payment_status,
    )


def _get_current_subscription(
    db: SessionDep,
    user_id: UUID,
) -> UserSubscription | None:
    return db.exec(
        select(UserSubscription)
        .where(UserSubscription.user_id == user_id)
        .order_by(UserSubscription.started_at.desc())
    ).first()


@router.get("/me", response_model=SubscriptionPublic)
def get_my_subscription(
    db: SessionDep,
    current_user: CurrentUser,
):
    subscription = _get_current_subscription(db, current_user.id)
    return _serialize(subscription)


@router.post("/activate-demo", response_model=SubscriptionPublic)
def activate_demo_subscription(
    body: SubscriptionActivate,
    db: SessionDep,
    current_user: CurrentUser,
):
    plan = body.plan
    if plan not in ALLOWED_PLANS:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")

    if plan == "enterprise" and not current_user.is_superuser:
        raise HTTPException(
            status_code=400,
            detail="Enterprise plan requires contact sales or admin activation.",
        )

    now = get_datetime_utc()
    expires_at = None
    if plan in PLAN_DURATIONS:
        expires_at = now + PLAN_DURATIONS[plan]

    existing = _get_current_subscription(db, current_user.id)
    if existing:
        existing.plan = plan
        existing.status = "active"
        existing.started_at = now
        existing.expires_at = expires_at
        existing.payment_provider = "momo_demo"
        existing.payment_status = "paid_demo"
        subscription = existing
    else:
        subscription = UserSubscription(
            user_id=current_user.id,
            plan=plan,
            status="active",
            started_at=now,
            expires_at=expires_at,
            payment_provider="momo_demo",
            payment_status="paid_demo",
        )
        db.add(subscription)

    db.commit()
    db.refresh(subscription)

    response = _serialize(subscription)
    response.message = (
        "Thanh toán demo thành công. Gói dịch vụ đã được kích hoạt."
        if plan in PAID_DEMO_PLANS
        else "Gói dịch vụ đã được kích hoạt."
    )
    return response
