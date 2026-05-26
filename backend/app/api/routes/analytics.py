from fastapi import APIRouter
from sqlmodel import Session

from app.core.db import engine
from app.services.analytics_service import get_detection_summary

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
def analytics_summary():

    with Session(engine) as session:

        result = get_detection_summary(session)

    return result