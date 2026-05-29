import asyncio
import sentry_sdk

from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles

from starlette.middleware.cors import (
    CORSMiddleware,
)

from sqlmodel import SQLModel

from app.api.main import api_router

from app.core.config import settings

from app.core.db import engine, init_db

from app.services.detection_engine import (
    real_ai_detection_loop,
)


def custom_generate_unique_id(
    route: APIRoute,
) -> str:

    return f"{route.tags[0]}-{route.name}"


# =========================
# SENTRY
# =========================
if (
    settings.SENTRY_DSN
    and settings.ENVIRONMENT != "local"
):
    sentry_sdk.init(
        dsn=str(settings.SENTRY_DSN),
        enable_tracing=True,
    )


# =========================
# FASTAPI APP
# =========================
app = FastAPI(

    title=settings.PROJECT_NAME,

    openapi_url=(
        f"{settings.API_V1_STR}/openapi.json"
    ),

    generate_unique_id_function=(
        custom_generate_unique_id
    ),
)


# =========================
# STATIC STORAGE
# =========================
app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage",
)


# =========================
# STARTUP EVENT
# =========================
@app.on_event("startup")
async def startup_event():
    from sqlmodel import Session

    # create PostgreSQL tables + seed first superuser
    with Session(engine) as session:
        init_db(session)

    # start realtime AI engine
    asyncio.create_task(
        real_ai_detection_loop()
    )


# =========================
# CORS
# =========================
app.add_middleware(

    CORSMiddleware,

    allow_origins=settings.all_cors_origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# API ROUTES
# =========================
app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)
