import csv
import io
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.security import get_current_wallet
from app.models.auth import Subscription
from app.models.detection import Detection
from app.services.detection_service import serialize_detection

router = APIRouter(prefix="/wallet-history", tags=["wallet-history"])


def _get_plan(db, wallet: str) -> str:
    sub = db.exec(select(Subscription).where(Subscription.wallet_address == wallet)).first()
    return sub.plan if sub else "free"


# ── GET /wallet-history ────────────────────────────────────────────────────

@router.get("")
def get_history(
    db: SessionDep = None,
    wallet: str = Depends(get_current_wallet),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    plan = _get_plan(db, wallet)
    now = datetime.now(timezone.utc)

    if plan == "free":
        cutoff = now - timedelta(hours=24)
        if date_from:
            try:
                requested_from = datetime.fromisoformat(date_from)
                if requested_from.tzinfo is None:
                    requested_from = requested_from.replace(tzinfo=timezone.utc)
                if requested_from < cutoff:
                    raise HTTPException(
                        status_code=403,
                        detail={
                            "error": "history_limited",
                            "message": "Free plan chỉ xem 24h gần nhất",
                        },
                    )
            except ValueError:
                raise HTTPException(status_code=422, detail="Invalid date_from format")
        effective_from = cutoff
    else:
        max_from = now - timedelta(days=30)
        effective_from = max_from
        if date_from:
            try:
                requested_from = datetime.fromisoformat(date_from)
                if requested_from.tzinfo is None:
                    requested_from = requested_from.replace(tzinfo=timezone.utc)
                effective_from = max(requested_from, max_from)
            except ValueError:
                raise HTTPException(status_code=422, detail="Invalid date_from format")

    stmt = select(Detection).where(Detection.created_at >= effective_from)

    if date_to:
        try:
            dt_to = datetime.fromisoformat(date_to)
            if dt_to.tzinfo is None:
                dt_to = dt_to.replace(tzinfo=timezone.utc)
            stmt = stmt.where(Detection.created_at <= dt_to)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid date_to format")

    total = len(db.exec(stmt).all())
    offset = (page - 1) * limit
    records = db.exec(stmt.order_by(Detection.created_at.desc()).offset(offset).limit(limit)).all()

    return {
        "items": [serialize_detection(r) for r in records],
        "page": page,
        "limit": limit,
        "total": total,
        "plan": plan,
        "history_days": 1 if plan == "free" else 30,
    }


# ── GET /wallet-history/export ─────────────────────────────────────────────

@router.get("/export")
def export_history(
    db: SessionDep = None,
    wallet: str = Depends(get_current_wallet),
):
    plan = _get_plan(db, wallet)
    if plan != "pro":
        raise HTTPException(
            status_code=403,
            detail={"error": "export_not_available", "upgrade_url": "/upgrade"},
        )

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    records = db.exec(
        select(Detection)
        .where(Detection.created_at >= cutoff)
        .order_by(Detection.created_at.desc())
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "plate_number", "vehicle_type", "confidence", "location", "status", "image_path", "created_at"])
    for r in records:
        writer.writerow([r.id, r.plate_number, r.vehicle_type, r.confidence, r.location, r.status, r.image_path, r.created_at])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=detection-history-30days.csv"},
    )
