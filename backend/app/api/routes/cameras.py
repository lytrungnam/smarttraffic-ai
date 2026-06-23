import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.core.db import engine
from app.schemas.camera import (
    CameraCreate,
    CameraPublic,
    CameraUpdate,
    CamerasPublic,
)
from app.models.camera import Camera
from app import crud

router = APIRouter(prefix="/cameras", tags=["Cameras"])


@router.get("/", response_model=CamerasPublic)
def list_cameras(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    # count
    count = session.exec(select(func.count()).select_from(Camera)).one()
    cameras = session.exec(select(Camera).offset(skip).limit(limit)).all()

    data = []
    for c in cameras:
        data.append(
            CameraPublic.model_validate(
                {
                    "id": c.id,
                    "name": c.name,
                    "location": c.location,
                    "source_url": c.stream_url,
                    "camera_type": c.camera_type,
                    "status": "active" if c.is_active else "inactive",
                    "created_at": c.created_at,
                }
            )
        )

    return CamerasPublic(data=data, count=count)


@router.post("/", response_model=CameraPublic, dependencies=[Depends(get_current_active_superuser)])
def create_camera(session: SessionDep, camera_in: CameraCreate) -> Any:
    # Validation
    if not camera_in.name or camera_in.name.strip() == "":
        raise HTTPException(status_code=400, detail="Camera name cannot be empty")
    existing = crud.get_camera_by_name(session=session, name=camera_in.name)
    if existing:
        raise HTTPException(status_code=409, detail="Camera with this name already exists")

    # translate to DB model fields
    camera_dict = camera_in.model_dump()
    camera_dict["is_active"] = True
    db_camera = crud.create_camera(session=session, camera=camera_dict)

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


@router.get("/{camera_id}", response_model=CameraPublic)
def get_camera(camera_id: uuid.UUID, session: SessionDep) -> Any:
    db_camera = crud.get_camera_by_id(session=session, camera_id=camera_id)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
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


@router.put("/{camera_id}", response_model=CameraPublic, dependencies=[Depends(get_current_active_superuser)])
def update_camera(camera_id: uuid.UUID, session: SessionDep, camera_in: CameraUpdate) -> Any:
    db_camera = crud.get_camera_by_id(session=session, camera_id=camera_id)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    if camera_in.name:
        existing = crud.get_camera_by_name(session=session, name=camera_in.name)
        if existing and existing.id != db_camera.id:
            raise HTTPException(status_code=409, detail="Camera with this name already exists")

    updates = camera_in.model_dump(exclude_unset=True)
    db_camera = crud.update_camera(session=session, db_camera=db_camera, updates=updates)

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


@router.delete("/{camera_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_camera(camera_id: uuid.UUID, session: SessionDep) -> Any:
    db_camera = crud.get_camera_by_id(session=session, camera_id=camera_id)
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    crud.delete_camera(session=session, db_camera=db_camera)
    return {"message": "Camera deleted"}
