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


# ── Config endpoint ────────────────────────────────────────────────────────────

@router.get("/config")
async def stream_config(request: Request):
    """
    Trả về WebSocket URL cho mobile client.

    Local:
      http://localhost:8000 -> ws://localhost:8000

    Deploy Railway/Vercel:
      https://... -> wss://...
    """
    host_header = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or "localhost:8000"
    )

    proto = request.headers.get("x-forwarded-proto", "http")
    ws_scheme = "wss" if proto == "https" else "ws"

    return {
        "ws_url": f"{ws_scheme}://{host_header}/api/v1/stream/mobile",
        "server_host": host_header,
        "recommended_width": 1280,
        "recommended_height": 720,
        "frame_interval_ms": 500,
        "max_file_size_mb": 2,
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _decode_frame(data: str) -> np.ndarray | None:
    """Base64 data URL hoặc raw base64 → numpy BGR frame."""
    try:
        if "," in data:
            data = data.split(",", 1)[1]

        img_bytes = base64.b64decode(data)
        arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        return frame
    except Exception:
        return None


def _normalize_camera_id(value: Optional[str]) -> uuid.UUID | None:
    """
    Nhận camera_id từ query params.

    Nếu frontend truyền UUID thật thì lưu vào DB.
    Nếu frontend truyền số tạm thời thì bỏ qua để tránh lỗi foreign key.
    """
    if not value:
        return None

    try:
        return uuid.UUID(str(value))
    except Exception:
        return None


def _run_ai(frame: np.ndarray) -> list[dict]:
    """Chạy full AI pipeline trên một frame. Blocking — gọi qua executor."""
    frame = cv2.resize(frame, (960, 540))

    vehicles = detect_vehicles(frame)
    plates = detect_plate(frame)

    results: list[dict] = []

    for plate in plates:
        x1, y1, x2, y2 = plate["box"]
        crop = frame[y1:y2, x1:x2]

        plate_text = read_plate_text(crop) or "UNKNOWN"
        vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)

        results.append(
            {
                "plate_number": plate_text,
                "vehicle_type": vehicle_type,
                "confidence": round(float(plate["confidence"]), 2),
                "status": "detected",
            }
        )

    return results


def _save_detections_to_db(
    plates: list[dict],
    camera_id: uuid.UUID | None,
) -> None:
    """Lưu kết quả nhận diện từ mobile camera vào PostgreSQL."""
    if not plates:
        return

    with Session(engine) as session:
        saved_count = 0

        for plate in plates:
            plate_number = plate.get("plate_number") or "UNKNOWN"

            # Không lưu kết quả OCR rỗng/không đọc được
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
            saved_count += 1

        if saved_count > 0:
            session.commit()


# ── Mobile WebSocket ───────────────────────────────────────────────────────────

@router.websocket("/mobile")
async def mobile_stream(websocket: WebSocket):
    """
    WebSocket dành riêng cho mobile camera.

    Mobile gửi:
      base64 JPEG mỗi 500ms

    Backend trả về:
      { plates, vehicle_count, processing_ms, source: "mobile" }

    Nếu nhận diện được biển số:
      - lưu vào DB
      - broadcast tới Dashboard WebSocket
    """
    await websocket.accept()

    loop = asyncio.get_running_loop()
    frames_received = 0

    camera_id = _normalize_camera_id(
        websocket.query_params.get("camera_id")
    )

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
                    }
                )
                continue

            t0 = time.monotonic()

            # AI chạy trong thread pool để không block event loop
            plates = await loop.run_in_executor(
                None,
                _run_ai,
                frame,
            )

            # Lưu DB nếu có biển số hợp lệ
            if plates:
                await loop.run_in_executor(
                    None,
                    _save_detections_to_db,
                    plates,
                    camera_id,
                )

            processing_ms = round((time.monotonic() - t0) * 1000)

            result = {
                "plates": plates,
                "vehicle_count": len(plates),
                "processing_ms": processing_ms,
                "source": "mobile",
                "frames_received": frames_received,
                "tracks": [],
                "events": [],
            }

            await websocket.send_json(result)

            if plates:
                await manager.broadcast(result)

    except WebSocketDisconnect:
        print(f"[MOBILE WS] disconnected after {frames_received} frames")
    except Exception as exc:
        print(f"[MOBILE WS] Error after {frames_received} frames: {exc}")