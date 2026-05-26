import asyncio
import json
from collections import defaultdict
from datetime import date, datetime, timezone

from fastapi import WebSocket
from sqlmodel import Session, select

from app.core.config import settings
from app.core.db import engine
from app.core.security import verify_wallet_jwt
from app.models.auth import Subscription, UsageSession

# active connections per wallet: wallet_address -> set of camera_ids
_active: dict[str, set[int]] = defaultdict(set)


async def camera_gate(websocket: WebSocket, camera_id: int, token: str) -> str | None:
    """
    Validate JWT + plan limits before accepting a WebSocket connection.
    Returns wallet_address on success, None if connection was rejected.
    """
    # 1 — JWT
    try:
        payload = verify_wallet_jwt(token)
        wallet = payload["sub"]
    except Exception:
        await websocket.close(code=4001, reason="Unauthorized")
        return None

    with Session(engine) as db:
        # 2 — Free plan time limit
        sub = db.exec(select(Subscription).where(Subscription.wallet_address == wallet)).first()
        plan = sub.plan if sub else "free"
        camera_limit = sub.camera_limit if sub else 1

        if plan == "free":
            today = date.today()
            usage = db.exec(
                select(UsageSession).where(
                    UsageSession.wallet_address == wallet,
                    UsageSession.session_date == today,
                )
            ).first()
            used = usage.used_minutes if usage else 0
            if used >= settings.FREE_DAILY_LIMIT_MINUTES:
                await websocket.close(
                    code=4002,
                    reason=json.dumps({
                        "error": "daily_limit_exceeded",
                        "message": "Bạn đã dùng hết 2 giờ hôm nay",
                        "reset_at": "00:00 ngày mai",
                        "upgrade_url": "/upgrade",
                    }),
                )
                return None

        # 3 — Camera slot limit
        if len(_active[wallet]) >= camera_limit and camera_id not in _active[wallet]:
            await websocket.close(
                code=4003,
                reason=json.dumps({
                    "error": "camera_limit_exceeded",
                    "current_limit": camera_limit,
                    "upgrade_url": "/upgrade",
                }),
            )
            return None

    _active[wallet].add(camera_id)
    return wallet


async def track_usage(wallet: str, camera_id: int) -> None:
    """Background coroutine: increments used_minutes every 60s while WS is active."""
    try:
        while True:
            await asyncio.sleep(60)
            with Session(engine) as db:
                today = date.today()
                usage = db.exec(
                    select(UsageSession).where(
                        UsageSession.wallet_address == wallet,
                        UsageSession.session_date == today,
                    )
                ).first()
                if usage:
                    usage.used_minutes += 1
                    usage.last_active = datetime.now(timezone.utc)
                    db.add(usage)
                else:
                    db.add(UsageSession(
                        wallet_address=wallet,
                        session_date=today,
                        used_minutes=1,
                        last_active=datetime.now(timezone.utc),
                    ))
                db.commit()
    except asyncio.CancelledError:
        pass
    finally:
        _active[wallet].discard(camera_id)
        if not _active[wallet]:
            del _active[wallet]
