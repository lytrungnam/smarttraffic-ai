from fastapi import APIRouter

from app.api.routes import (
    login,
    private,
    users,
    utils,
    detection,
    analytics,
    ws,
    wallet_auth,
    payment,
    wallet_history,
    stream,
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

# Wallet / MetaMask
api_router.include_router(wallet_auth.router)
api_router.include_router(payment.router)
api_router.include_router(wallet_history.router)

# Mobile camera stream
api_router.include_router(stream.router)

# Local only
if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)