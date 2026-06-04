from fastapi import APIRouter

from app.api.routes import (
    analytics,
    detection,
    login,
    private,
    stream,
    subscriptions,
    users,
    utils,
    ws,
)
from app.core.config import settings

api_router = APIRouter()

# Auth
api_router.include_router(login.router)

# Users
api_router.include_router(users.router)

# Utils
api_router.include_router(utils.router)

# Detection
api_router.include_router(detection.router)

# Analytics
api_router.include_router(analytics.router)

# WebSocket
api_router.include_router(ws.router)

# Subscriptions
api_router.include_router(subscriptions.router)

# Mobile camera stream
api_router.include_router(stream.router)

# Local only
if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
