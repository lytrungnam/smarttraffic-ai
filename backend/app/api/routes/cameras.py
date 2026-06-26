import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_user
from app.schemas.camera import (
    CameraCreate,
    CameraPublic,
    CameraUpdate,
    CamerasPublic,
)
from app.models.camera import Camera
from app import crud

router = APIRouter(prefix="/cameras", tags=["Cameras"])


ALLOWED_CAMERA_TYPES = {
    "webcam",
    "rtsp",
    "ip_camera",
    "video_file",
    "mobile",
    "traffic",
}


def camera_to_public(db_camera: Camera) -> CameraPublic:
    return CameraPublic.model_validate(
        {
            "id": db_camera.id,
            "name": db_camera.name,
            "location": db_camera.location,
            "source_url": db_camera.stream_url,
            "camera_type": db_camera.camera_type,
            "status": "active" if db_camera.is_active else "inactive",
            "created_at": db_camera.created_at,
        }
    )


def normalize_camera_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Frontend:
      source_url, status

    Database:
      stream_url, is_active
    """

    if "source_url" in payload:
        payload["stream_url"] = payload.pop("source_url")

    if "status" in payload:
        status = payload.pop("status")
        payload["is_active"] = status == "active"

    if payload.get("camera_type") == "mobile":
        payload["stream_url"] = payload.get("stream_url") or "mobile"

    return payload


def validate_camera_payload(payload: dict[str, Any]) -> None:
    name = payload.get("name")
    camera_type = payload.get("camera_type")
    stream_url = payload.get("stream_url")

    if name is not None and name.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Camera name cannot be empty",
        )

    if camera_type and camera_type not in ALLOWED_CAMERA_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid camera type: {camera_type}",
        )

    if camera_type and camera_type != "mobile":
        if stream_url is not None and stream_url.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Source URL cannot be empty",
            )


@router.get("/", response_model=CamerasPublic)
def list_cameras(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    count = session.exec(select(func.count()).select_from(Camera)).one()
    cameras = session.exec(select(Camera).offset(skip).limit(limit)).all()

    return CamerasPublic(
        data=[camera_to_public(camera) for camera in cameras],
        count=count,
    )


@router.post(
    "/",
    response_model=CameraPublic,
    dependencies=[Depends(get_current_active_user)],
)
def create_camera(
    session: SessionDep,
    camera_in: CameraCreate,
) -> Any:
    camera_dict = camera_in.model_dump(exclude_unset=True)
    camera_dict = normalize_camera_payload(camera_dict)

    validate_camera_payload(camera_dict)

    existing = crud.get_camera_by_name(
        session=session,
        name=camera_dict["name"],
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Camera with this name already exists",
        )

    camera_dict["is_active"] = camera_dict.get("is_active", True)

    db_camera = crud.create_camera(
        session=session,
        camera=camera_dict,
    )

    return camera_to_public(db_camera)


@router.get("/{camera_id}", response_model=CameraPublic)
def get_camera(
    camera_id: uuid.UUID,
    session: SessionDep,
) -> Any:
    db_camera = crud.get_camera_by_id(
        session=session,
        camera_id=camera_id,
    )

    if not db_camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    return camera_to_public(db_camera)


@router.put(
    "/{camera_id}",
    response_model=CameraPublic,
    dependencies=[Depends(get_current_active_user)],
)
def update_camera(
    camera_id: uuid.UUID,
    session: SessionDep,
    camera_in: CameraUpdate,
) -> Any:
    db_camera = crud.get_camera_by_id(
        session=session,
        camera_id=camera_id,
    )

    if not db_camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    updates = camera_in.model_dump(exclude_unset=True)
    updates = normalize_camera_payload(updates)

    validate_camera_payload(updates)

    if "name" in updates:
        existing = crud.get_camera_by_name(
            session=session,
            name=updates["name"],
        )

        if existing and existing.id != db_camera.id:
            raise HTTPException(
                status_code=409,
                detail="Camera with this name already exists",
            )

    db_camera = crud.update_camera(
        session=session,
        db_camera=db_camera,
        updates=updates,
    )

    return camera_to_public(db_camera)


@router.delete(
    "/{camera_id}",
    dependencies=[Depends(get_current_active_user)],
)
def delete_camera(
    camera_id: uuid.UUID,
    session: SessionDep,
) -> Any:
    db_camera = crud.get_camera_by_id(
        session=session,
        camera_id=camera_id,
    )

    if not db_camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    crud.delete_camera(
        session=session,
        db_camera=db_camera,
    )

    return {"message": "Camera deleted"}