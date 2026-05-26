import re
import secrets
from datetime import datetime, timedelta, timezone

from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import (
    blacklist_token,
    create_wallet_jwt,
    get_current_wallet,
)
from app.models.auth import Subscription, WalletSession

router = APIRouter(prefix="/auth", tags=["wallet-auth"])

_ETH_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")


def _validate_address(address: str) -> str:
    if not _ETH_ADDRESS_RE.match(address):
        raise HTTPException(status_code=422, detail="Invalid Ethereum address")
    return address.lower()


# ── GET /auth/nonce ────────────────────────────────────────────────────────

@router.get("/nonce")
def get_nonce(wallet: str = Query(...), db: SessionDep = None):
    address = _validate_address(wallet)
    nonce = secrets.token_hex(16)
    expired_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    existing = db.get(WalletSession, address)
    if existing:
        existing.nonce = nonce
        existing.nonce_expired_at = expired_at
        db.add(existing)
    else:
        db.add(WalletSession(wallet_address=address, nonce=nonce, nonce_expired_at=expired_at))

    db.commit()
    return {"nonce": nonce}


# ── POST /auth/verify ──────────────────────────────────────────────────────

class VerifyBody(BaseModel):
    wallet_address: str
    signature: str
    nonce: str


@router.post("/verify")
def verify_signature(body: VerifyBody, db: SessionDep = None):
    address = _validate_address(body.wallet_address)

    session = db.get(WalletSession, address)
    if not session:
        raise HTTPException(status_code=400, detail="Nonce not found — request a new one")

    if datetime.now(timezone.utc) > session.nonce_expired_at.replace(tzinfo=timezone.utc):
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=400, detail="Nonce expired — request a new one")

    if session.nonce != body.nonce:
        raise HTTPException(status_code=400, detail="Nonce mismatch")

    message = f"SmartTraffic AI\nXác thực ví của bạn.\nNonce: {body.nonce}"
    try:
        msg = encode_defunct(text=message)
        recovered = Account.recover_message(msg, signature=body.signature)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if recovered.lower() != address:
        raise HTTPException(status_code=401, detail="Signature does not match wallet address")

    # Consume nonce
    db.delete(session)
    db.commit()

    # Auto-create free subscription if not exists
    sub = db.exec(select(Subscription).where(Subscription.wallet_address == address)).first()
    if not sub:
        sub = Subscription(
            wallet_address=address,
            camera_limit=1,
            plan="free",
            amount_paid=0.0,
            chain_id=0,
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    token = create_wallet_jwt(address)
    return {
        "access_token": token,
        "wallet_address": address,
        "plan": sub.plan,
        "camera_limit": sub.camera_limit,
    }


# ── POST /auth/logout ──────────────────────────────────────────────────────

class _CredDep:
    pass


from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer(auto_error=False)


@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)):
    if credentials:
        blacklist_token(credentials.credentials)
    return {"success": True}
