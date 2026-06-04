import asyncio
import logging
import time
from pathlib import Path

import cv2
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import app.services.frame_buffer as fb
from app.api.deps import SessionDep
from app.core.config import settings
from app.models.detection import Detection
from app.services.detection_service import process_detection, serialize_detection
from app.services.history_service import get_paginated_history
from app.services.websocket_service import manager

router = APIRouter(
    prefix="/detections",
    tags=["detections"],
)

logger = logging.getLogger(__name__)
logger.info("[UPLOAD] MAX_VIDEO_UPLOAD_MB=%s", settings.MAX_VIDEO_UPLOAD_MB)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov"}
VIDEO_CONTENT_TYPES = {
    "video/mp4",
    "video/avi",
    "video/quicktime",
    "video/x-msvideo",
}
VIDEO_SAMPLE_EVERY_N_FRAMES = 10
VIDEO_MAX_SAMPLED_FRAMES = 30
VIDEO_MAX_SAVED_DETECTIONS = 10


def _safe_file_stem(filename: str | None) -> str:
    stem = Path(filename or "upload").stem
    safe_stem = "".join(char if char.isalnum() else "_" for char in stem)
    return safe_stem or "upload"


def _get_upload_kind(file: UploadFile) -> str:
    extension = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()

    if extension in IMAGE_EXTENSIONS or content_type in IMAGE_CONTENT_TYPES:
        return "image"

    if extension in VIDEO_EXTENSIONS or content_type in VIDEO_CONTENT_TYPES:
        return "video"

    raise HTTPException(
        status_code=400,
        detail="Unsupported file type. Supported formats: JPG, PNG, MP4, AVI, MOV.",
    )


async def _save_detection_results(
    *,
    db: SessionDep,
    results: list[dict],
    evidence_bytes: bytes,
    evidence_label: str,
    max_remaining: int | None = None,
) -> list[dict]:
    saved = []
    storage_dir = Path("storage/detections")
    storage_dir.mkdir(parents=True, exist_ok=True)

    for index, result in enumerate(results):
        if max_remaining is not None and len(saved) >= max_remaining:
            break

        plate_text = result.get("plate_number", "UNKNOWN")

        if not plate_text or plate_text == "UNKNOWN":
            continue

        timestamp = int(time.time())
        safe_plate_text = "".join(
            char if char.isalnum() else "_"
            for char in plate_text
        )
        image_path = (
            storage_dir
            / f"{safe_plate_text}_{timestamp}_{evidence_label}_{index}.jpg"
        )

        with open(image_path, "wb") as f:
            f.write(evidence_bytes)

        detection = Detection(
            plate_number=plate_text,
            vehicle_type=result.get("vehicle_type", "unclassified"),
            confidence=float(result.get("confidence", 0)),
            image_path=str(image_path),
            status="detected",
        )

        db.add(detection)
        db.commit()
        db.refresh(detection)

        payload = serialize_detection(detection)
        await manager.broadcast(payload)
        saved.append(payload)

    return saved


# =====================================
# HISTORY API
# =====================================

@router.get("/history")
async def get_detection_history(
    db: SessionDep,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    vehicle_type: str | None = Query(default=None),
):
    return get_paginated_history(db, page, limit, search, vehicle_type)


# =====================================
# UPLOAD IMAGE/VIDEO → AI DETECTION
# =====================================

@router.post("/upload")
async def upload_detection(
    db: SessionDep,
    file: UploadFile = File(...),
):
    upload_kind = _get_upload_kind(file)
    contents = await file.read()

    video_size_mb = len(contents) / (1024 * 1024)

    if upload_kind == "video" and video_size_mb > settings.MAX_VIDEO_UPLOAD_MB:
        raise HTTPException(
            status_code=413,
            detail=(
                "Video upload exceeds the configured limit of "
                f"{settings.MAX_VIDEO_UPLOAD_MB}MB."
            ),
        )

    if upload_kind == "video":
        return await _process_video_upload(db, file, contents)

    return await _process_image_upload(db, contents)


async def _process_image_upload(db: SessionDep, contents: bytes):
    try:
        inference = await process_detection(contents)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    results = inference["results"]
    debug = inference["debug"]

    debug["input_type"] = "image"

    saved = await _save_detection_results(
        db=db,
        results=results,
        evidence_bytes=contents,
        evidence_label="upload",
    )

    debug["final_count"] = len(saved)

    return {
        "results": saved,
        "total": len(saved),
        "debug": debug,
    }


async def _process_video_upload(
    db: SessionDep,
    file: UploadFile,
    contents: bytes,
):
    upload_dir = Path("storage/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix.lower() or ".mp4"
    video_path = (
        upload_dir
        / f"{_safe_file_stem(file.filename)}_{int(time.time())}{extension}"
    )
    with open(video_path, "wb") as f:
        f.write(contents)

    capture = cv2.VideoCapture(str(video_path))
    video_opened = capture.isOpened()
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    if not video_opened:
        capture.release()
        raise HTTPException(
            status_code=400,
            detail="Video could not be opened by OpenCV.",
        )

    saved = []
    frame_index = 0
    sampled_frames = 0
    processed_frames = 0
    vehicle_count = 0
    plate_count = 0
    ocr_count = 0

    try:
        while sampled_frames < VIDEO_MAX_SAMPLED_FRAMES:
            success, frame = capture.read()
            if not success:
                break

            if frame_index % VIDEO_SAMPLE_EVERY_N_FRAMES != 0:
                frame_index += 1
                continue

            sampled_frames += 1
            processed_frames += 1

            encode_success, buffer = cv2.imencode(".jpg", frame)
            if not encode_success:
                frame_index += 1
                continue

            frame_bytes = buffer.tobytes()
            inference = await process_detection(frame_bytes)
            debug = inference["debug"]
            vehicle_count += int(debug.get("vehicle_count", 0))
            plate_count += int(debug.get("plate_count", 0))
            ocr_count += int(debug.get("ocr_count", 0))

            remaining = VIDEO_MAX_SAVED_DETECTIONS - len(saved)
            if remaining <= 0:
                break

            saved.extend(
                await _save_detection_results(
                    db=db,
                    results=inference["results"],
                    evidence_bytes=frame_bytes,
                    evidence_label=f"video_frame_{frame_index}",
                    max_remaining=remaining,
                )
            )

            if len(saved) >= VIDEO_MAX_SAVED_DETECTIONS:
                break

            frame_index += 1
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        capture.release()

    video_debug = {
        "input_type": "video",
        "video_opened": video_opened,
        "total_frames": total_frames,
        "sampled_frames": sampled_frames,
        "processed_frames": processed_frames,
        "vehicle_count": vehicle_count,
        "plate_count": plate_count,
        "ocr_count": ocr_count,
        "final_count": len(saved),
    }

    response = {
        "results": saved,
        "total": len(saved),
        "debug": video_debug,
    }

    if not saved:
        response["message"] = (
            "No license plate was detected in sampled video frames. "
            "Try a clearer video or shorter clip."
        )

    return response


# =====================================
# MJPEG STREAM
# =====================================

@router.get("/stream")
async def video_stream():
    async def generate():
        while True:
            await fb.frame_ready.wait()
            fb.frame_ready.clear()

            if fb.latest_frame:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + fb.latest_frame
                    + b"\r\n"
                )

            await asyncio.sleep(0.03)

    return StreamingResponse(
        generate(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


# =====================================
# TEST WEBSOCKET + DB
# =====================================

@router.post("/test-broadcast")
async def test_broadcast(
    db: SessionDep,
):
    detection = Detection(
        plate_number="43A-99999",
        vehicle_type="car",
        confidence=99.8,
        location="Da Nang",
        status="detected",
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)

    payload = serialize_detection(detection)
    await manager.broadcast(payload)

    return payload
