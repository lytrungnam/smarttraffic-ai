import asyncio
import time
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import app.services.frame_buffer as fb
from app.api.deps import SessionDep
from app.models.detection import Detection
from app.services.detection_service import process_detection, serialize_detection
from app.services.history_service import get_paginated_history
from app.services.websocket_service import manager

router = APIRouter(
    prefix="/detections",
    tags=["detections"],
)


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
# UPLOAD IMAGE → AI DETECTION
# =====================================

@router.post("/upload")
async def upload_detection(
    db: SessionDep,
    file: UploadFile = File(...),
):
    contents = await file.read()
    try:
        inference = await process_detection(contents)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    results = inference["results"]
    debug = inference["debug"]

    saved = []

    storage_dir = Path("storage/detections")
    storage_dir.mkdir(parents=True, exist_ok=True)

    for index, result in enumerate(results):
        plate_text = result.get("plate_number", "UNKNOWN")

        if not plate_text or plate_text == "UNKNOWN":
            continue

        timestamp = int(time.time())
        safe_plate_text = "".join(
            char if char.isalnum() else "_"
            for char in plate_text
        )
        image_path = storage_dir / f"{safe_plate_text}_{timestamp}_{index}_upload.jpg"

        with open(image_path, "wb") as f:
            f.write(contents)

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

    debug["final_count"] = len(saved)

    return {
        "results": saved,
        "total": len(saved),
        "debug": debug,
    }


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
