from typing import Any

from sqlmodel import Session, select

from app.core.security import (
    get_password_hash,
    verify_password,
)

from app.models.user import (
    User,
    UserCreate,
    UserUpdate,
)


def create_user(
    *,
    session: Session,
    user_create: UserCreate,
) -> User:
    db_obj = User.model_validate(
        user_create,
        update={
            "hashed_password": get_password_hash(
                user_create.password
            )
        },
    )

    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)

    return db_obj


def update_user(
    *,
    session: Session,
    db_user: User,
    user_in: UserUpdate,
) -> Any:
    user_data = user_in.model_dump(
        exclude_unset=True
    )

    extra_data = {}

    if "password" in user_data:
        password = user_data["password"]

        hashed_password = get_password_hash(
            password
        )

        extra_data["hashed_password"] = (
            hashed_password
        )

    db_user.sqlmodel_update(
        user_data,
        update=extra_data,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


def get_user_by_email(
    *,
    session: Session,
    email: str,
) -> User | None:
    statement = select(User).where(
        User.email == email
    )

    session_user = session.exec(
        statement
    ).first()

    return session_user


DUMMY_HASH = (
    "$argon2id$v=19$m=65536,t=3,p=4$"
    "MjQyZWE1MzBjYjJlZTI0Yw$"
    "YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3"
    "ZGRkY2U2OWFjNjk"
)


def authenticate(
    *,
    session: Session,
    email: str,
    password: str,
) -> User | None:
    db_user = get_user_by_email(
        session=session,
        email=email,
    )

    if not db_user:
        verify_password(
            password,
            DUMMY_HASH,
        )

        return None

    verified, updated_password_hash = (
        verify_password(
            password,
            db_user.hashed_password,
        )
    )

    if not verified:
        return None

    if updated_password_hash:
        db_user.hashed_password = (
            updated_password_hash
        )

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    return db_user


# Camera CRUD helpers
from app.models.camera import Camera


def get_camera_by_id(*, session: Session, camera_id: str) -> Camera | None:
    return session.get(Camera, camera_id)


def get_camera_by_name(*, session: Session, name: str) -> Camera | None:
    statement = select(Camera).where(Camera.name == name)
    return session.exec(statement).first()


def get_cameras(*, session: Session, skip: int = 0, limit: int = 100) -> list[Camera]:
    statement = select(Camera).offset(skip).limit(limit)
    return session.exec(statement).all()


def create_camera(*, session: Session, camera: dict) -> Camera:
    # `camera` expected to contain: name, location, source_url, camera_type, is_active
    db_obj = Camera(
        name=camera.get("name"),
        location=camera.get("location"),
        stream_url=camera.get("source_url"),
        camera_type=camera.get("camera_type", "webcam"),
        is_active=camera.get("is_active", True),
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_camera(*, session: Session, db_camera: Camera, updates: dict) -> Camera:
    # Map updates to model fields
    data = {}
    if "name" in updates:
        data["name"] = updates["name"]
    if "location" in updates:
        data["location"] = updates["location"]
    if "source_url" in updates:
        data["stream_url"] = updates["source_url"]
    if "camera_type" in updates:
        data["camera_type"] = updates["camera_type"]
    if "status" in updates:
        data["is_active"] = updates["status"] == "active"

    db_camera.sqlmodel_update(data)
    session.add(db_camera)
    session.commit()
    session.refresh(db_camera)
    return db_camera


def delete_camera(*, session: Session, db_camera: Camera) -> None:
    session.delete(db_camera)
    session.commit()
