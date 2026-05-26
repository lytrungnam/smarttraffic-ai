from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from web3 import Web3

from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import get_current_wallet
from app.models.auth import Subscription, UsageSession

router = APIRouter(prefix="/payment", tags=["payment"])

_PRICE_MAP = {
    3: settings.PRICE_3_CAMERAS_MATIC,
    5: settings.PRICE_5_CAMERAS_MATIC,
}


def _get_or_create_sub(db, wallet: str) -> Subscription:
    sub = db.exec(select(Subscription).where(Subscription.wallet_address == wallet)).first()
    if not sub:
        sub = Subscription(wallet_address=wallet, camera_limit=1, plan="free", amount_paid=0.0, chain_id=0)
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


def _today_usage(db, wallet: str) -> int:
    today = date.today()
    usage = db.exec(
        select(UsageSession).where(
            UsageSession.wallet_address == wallet,
            UsageSession.session_date == today,
        )
    ).first()
    return usage.used_minutes if usage else 0


# ── GET /payment/status ────────────────────────────────────────────────────

@router.get("/status")
def payment_status(db: SessionDep = None, wallet: str = Depends(get_current_wallet)):
    sub = _get_or_create_sub(db, wallet)
    today_minutes = _today_usage(db, wallet)

    is_pro = sub.plan == "pro"
    daily_limit = None if is_pro else settings.FREE_DAILY_LIMIT_MINUTES
    remaining = None if is_pro else max(0, settings.FREE_DAILY_LIMIT_MINUTES - today_minutes)

    return {
        "plan": sub.plan,
        "camera_limit": sub.camera_limit,
        "expired_at": sub.expired_at.isoformat() if sub.expired_at else None,
        "today_used_minutes": today_minutes,
        "today_limit_minutes": daily_limit,
        "remaining_minutes": remaining,
        "features": {
            "max_cameras": sub.camera_limit,
            "history_days": 30 if is_pro else 1,
            "export_csv": is_pro,
            "usage_limit_per_day": "Không giới hạn" if is_pro else "2 giờ/ngày",
        },
    }


# ── POST /payment/verify ───────────────────────────────────────────────────

class PaymentVerifyBody(BaseModel):
    tx_hash: str
    camera_count: int  # 3 or 5


@router.post("/verify")
def verify_payment(
    body: PaymentVerifyBody,
    db: SessionDep = None,
    wallet: str = Depends(get_current_wallet),
):
    if body.camera_count not in _PRICE_MAP:
        raise HTTPException(status_code=422, detail="camera_count must be 3 or 5")

    # Check tx_hash not already used
    existing = db.exec(
        select(Subscription).where(Subscription.tx_hash == body.tx_hash)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transaction already used")

    expected_matic = _PRICE_MAP[body.camera_count]
    expected_wei = Web3.to_wei(expected_matic, "ether")

    try:
        w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
        tx = w3.eth.get_transaction(body.tx_hash)
        receipt = w3.eth.get_transaction_receipt(body.tx_hash)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"RPC error: {e}")

    errors = []
    if receipt.status != 1:
        errors.append("Transaction failed on-chain")
    if tx["to"].lower() != settings.PAYMENT_WALLET.lower():
        errors.append("Wrong recipient wallet")
    if tx["from"].lower() != wallet:
        errors.append("Sender does not match authenticated wallet")
    if tx["value"] < expected_wei:
        errors.append(f"Insufficient amount: expected {expected_matic} MATIC")
    if tx.get("chainId") != settings.ACCEPTED_CHAIN_ID:
        errors.append("Wrong chain — use Polygon Mainnet")

    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    # Upsert subscription
    sub = _get_or_create_sub(db, wallet)
    sub.plan = "pro"
    sub.camera_limit = body.camera_count
    sub.tx_hash = body.tx_hash
    sub.amount_paid = expected_matic
    sub.chain_id = settings.ACCEPTED_CHAIN_ID
    sub.expired_at = None  # pro = no expiry
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {
        "success": True,
        "plan": sub.plan,
        "camera_limit": sub.camera_limit,
        "message": f"Nâng cấp thành công! Bạn có {sub.camera_limit} cameras, dùng 24/7.",
    }
