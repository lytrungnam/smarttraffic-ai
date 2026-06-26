"""
Mobile camera stream endpoints.

GET  /stream/config  — trả về config cho mobile client
WS   /stream/mobile  — nhận base64 JPEG từ mobile, chạy AI, lưu DB, gửi kết quả về
"""

import asyncio
import base64
import time
import uuid
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from sqlmodel import Session

from app.ai.ocr_reader import read_plate_text
from app.ai.plate_detector import detect_plate
from app.ai.vehicle_detector import detect_vehicles
from app.ai.vehicle_matcher import get_vehicle_type_from_plate
from app.core.db import engine
from app.models.detection import Detection
from app.services.websocket_service import manager

router = APIRouter(prefix="/stream", tags=["stream"])

AI_FRAME_W = 960
AI_FRAME_H = 540


@router.get("/config")
async def stream_config(request: Request):
    host_header = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or "localhost:8000"
    )

    proto = request.headers.get("x-forwarded-proto")

    if not proto:
        proto = request.url.scheme

    ws_scheme = "wss" if proto == "https" else "ws"

    return {
        "ws_url": f"{ws_scheme}://{host_header}/api/v1/stream/mobile",
        "server_host": host_header,
        "recommended_width": 1280,
        "recommended_height": 720,
        "frame_interval_ms": 500,
        "max_file_size_mb": 2,
    }


def _decode_frame(data: str) -> Optional[np.ndarray]:
    try:
        if not data:
            return None

        if "," in data:
            data = data.split(",", 1)[1]

        img_bytes = base64.b64decode(data)
        arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        return frame
    except Exception:
        return None


def _normalize_camera_id(value: Optional[str]) -> Optional[uuid.UUID]:
    if not value:
        return None

    try:
        return uuid.UUID(str(value))
    except Exception:
        return None


def _normalize_confidence(raw: float) -> float:
    try:
        value = float(raw)
    except Exception:
        return 0.0

    if value <= 1.0:
        return round(value * 100, 1)

    return round(value, 1)


def _normalize_plate_text(value: Optional[str]) -> str:
    if not value:
        return "UNKNOWN"

    text = str(value).strip().upper()

    if not text:
        return "UNKNOWN"

    return text


def _run_ai(frame: np.ndarray) -> list[dict]:
    frame = cv2.resize(frame, (AI_FRAME_W, AI_FRAME_H))

    vehicles = detect_vehicles(frame)
    plates = detect_plate(frame)

    results: list[dict] = []

    for plate in plates:
        box = plate.get("box")

        if not box or len(box) != 4:
            continue

        x1, y1, x2, y2 = map(int, box)

        x1 = max(0, min(x1, AI_FRAME_W - 1))
        y1 = max(0, min(y1, AI_FRAME_H - 1))
        x2 = max(0, min(x2, AI_FRAME_W))
        y2 = max(0, min(y2, AI_FRAME_H))

        if x2 <= x1 or y2 <= y1:
            continue

        crop = frame[y1:y2, x1:x2]

        plate_text = _normalize_plate_text(read_plate_text(crop))
        vehicle_type = get_vehicle_type_from_plate([x1, y1, x2, y2], vehicles)
        confidence = _normalize_confidence(float(plate.get("confidence") or 0))

        results.append(
            {
                "plate_number": plate_text,
                "vehicle_type": vehicle_type or "unknown",
                "confidence": confidence,
                "status": "detected",
                "box": [x1, y1, x2, y2],
                "box_source_width": AI_FRAME_W,
                "box_source_height": AI_FRAME_H,
            }
        )

    return results


def _save_detections_to_db(
    plates: list[dict],
    camera_id: Optional[uuid.UUID],
) -> int:
    if not plates:
        return 0

    saved = 0

    with Session(engine) as session:
        for plate in plates:
            plate_number = _normalize_plate_text(plate.get("plate_number"))

            if plate_number == "UNKNOWN":
                continue

            detection = Detection(
                plate_number=plate_number,
                vehicle_type=plate.get("vehicle_type") or "unknown",
                confidence=float(plate.get("confidence") or 0),
                location="Mobile Camera",
                status=plate.get("status") or "detected",
                camera_id=camera_id,
            )

            session.add(detection)
            saved += 1

        if saved > 0:
            session.commit()

    return saved


@router.websocket("/mobile")
async def mobile_stream(websocket: WebSocket):
    await websocket.accept()

    loop = asyncio.get_running_loop()
    frames_received = 0

    camera_id = _normalize_camera_id(websocket.query_params.get("camera_id"))

    print(f"[MOBILE WS] connected camera_id={camera_id}")

    try:
        while True:
            data = await websocket.receive_text()
            frames_received += 1

            frame = _decode_frame(data)

            if frame is None:
                await websocket.send_json(
                    {
                        "error": "invalid_frame",
                        "frames_received": frames_received,
                        "source": "mobile",
                    }
                )
                continue

            t0 = time.monotonic()

            plates = await loop.run_in_executor(None, _run_ai, frame)

            processing_ms = round((time.monotonic() - t0) * 1000)

            saved_count = 0

            if plates:
                saved_count = await loop.run_in_executor(
                    None,
                    _save_detections_to_db,
                    plates,
                    camera_id,
                )

            result = {
                "plates": plates,
                "vehicle_count": len(plates),
                "processing_ms": processing_ms,
                "frames_received": frames_received,
                "saved_count": saved_count,
                "source": "mobile",
                "tracks": [],
                "events": [],
            }

            await websocket.send_json(result)

            valid_plates = [
                plate
                for plate in plates
                if _normalize_plate_text(plate.get("plate_number")) != "UNKNOWN"
            ]

            if valid_plates:
                await manager.broadcast(result)

            if frames_received % 20 == 0:
                print(
                    f"[MOBILE WS] frames={frames_received} "
                    f"plates={len(plates)} saved={saved_count} "
                    f"processing_ms={processing_ms}"
                )

    except WebSocketDisconnect:
        print(f"[MOBILE WS] disconnected after {frames_received} frames")

    except Exception as exc:
        print(f"[MOBILE WS] error after {frames_received} frames: {exc}")
        try:
            await websocket.close()
        except Exception:
            pass