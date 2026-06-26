"""
Mobile camera stream endpoints.

GET  /stream/config  — trả về config cho mobile client (WS URL, dimensions)
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

# Kích thước frame chuẩn sau khi resize trong AI pipeline
AI_FRAME_W = 960
AI_FRAME_H = 540


# ── Config endpoint ────────────────────────────────────────────────────────────

@router.get("/config")
async def stream_config(request: Request):
    """
    Trả về WebSocket URL cho mobile client.

    - Local http  → ws://
    - Production https (Railway / Vercel) → wss://
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

def _decode_frame(data: str) -> Optional[np.ndarray]:
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


def _normalize_camera_id(value: Optional[str]) -> Optional[uuid.UUID]:
    """
    Nhận camera_id từ query params.
    - UUID thật → lưu DB (foreign key hợp lệ)
    - Số tạm thời (vd: 99) → trả None để tránh lỗi foreign key
    """
    if not value:
        return None
    try:
        return uuid.UUID(str(value))
    except Exception:
        return None


def _normalize_confidence(raw: float) -> float:
    """
    Chuẩn hóa confidence về dạng 0–100.
    - Model trả 0.95 (float 0-1) → 95.0
    - Model trả 95 (int/float 0-100) → 95.0
    """
    if raw <= 1.0:
        return round(raw * 100, 1)
    return round(float(raw), 1)


def _run_ai(frame: np.ndarray) -> list[dict]:
    """
    Chạy full AI pipeline trên một frame.
    Blocking — phải gọi qua loop.run_in_executor.

    Trả về list[dict] với schema:
    {
        plate_number: str,
        vehicle_type: str,
        confidence: float (0-100),
        status: str,
        box: [x1, y1, x2, y2],
        box_source_width: int,
        box_source_height: int,
    }
    """
    frame = cv2.resize(frame, (AI_FRAME_W, AI_FRAME_H))

    vehicles = detect_vehicles(frame)
    plates = detect_plate(frame)

    results: list[dict] = []

    for plate in plates:
        x1, y1, x2, y2 = plate["box"]
        crop = frame[y1:y2, x1:x2]

        plate_text = read_plate_text(crop) or "UNKNOWN"
        vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)
        confidence = _normalize_confidence(float(plate["confidence"]))

        results.append(
            {
                "plate_number": plate_text,
                "vehicle_type": vehicle_type,
                "confidence": confidence,
                "status": "detected",
                "box": [int(x1), int(y1), int(x2), int(y2)],
                "box_source_width": AI_FRAME_W,
                "box_source_height": AI_FRAME_H,
            }
        )

    return results


def _save_detections_to_db(
    plates: list[dict],
    camera_id: Optional[uuid.UUID],
) -> None:
    """
    Lưu kết quả nhận diện từ mobile camera vào PostgreSQL.
    Bỏ qua UNKNOWN và chỉ commit khi có ít nhất 1 record hợp lệ.
    """
    if not plates:
        return

    with Session(engine) as session:
        saved = 0

        for plate in plates:
            plate_number = plate.get("plate_number") or "UNKNOWN"

            # Không lưu kết quả OCR không đọc được
            if plate_number == "UNKNOWN":
                continue

            # Confidence đã ở dạng 0-100, lưu DB cũng vậy
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
            print(f"[MOBILE DB] saved {saved} detection(s)")


# ── Mobile WebSocket ───────────────────────────────────────────────────────────

@router.websocket("/mobile")
async def mobile_stream(websocket: WebSocket):
    """
    WebSocket dành riêng cho mobile camera.

    Mobile gửi:
        base64 JPEG mỗi 500ms

    Backend trả về:
        {
            plates: [{ plate_number, vehicle_type, confidence(0-100),
                       status, box, box_source_width, box_source_height }],
            vehicle_count: int,
            processing_ms: int,
            frames_received: int,
            source: "mobile",
        }

    Nếu có biển số hợp lệ:
        - lưu vào DB detections
        - broadcast tới /ws/detections (dashboard)
    """
    await websocket.accept()

    loop = asyncio.get_running_loop()
    frames_received = 0

    camera_id = _normalize_camera_id(
        websocket.query_params.get("camera_id")
    )

    print(f"[MOBILE WS] connected  camera_id={camera_id}")

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
            plates = await loop.run_in_executor(None, _run_ai, frame)

            processing_ms = round((time.monotonic() - t0) * 1000)

            # Lưu DB bất đồng bộ (không block response)
            if plates:
                await loop.run_in_executor(
                    None,
                    _save_detections_to_db,
                    plates,
                    camera_id,
                )

            result = {
                "plates": plates,
                "vehicle_count": len(plates),
                "processing_ms": processing_ms,
                "source": "mobile",
                "frames_received": frames_received,
                "tracks": [],
                "events": [],
            }

            # Gửi kết quả về mobile client
            await websocket.send_json(result)

            # Broadcast tới dashboard /ws/detections
            if plates:
                await manager.broadcast(result)

    except WebSocketDisconnect:
        print(f"[MOBILE WS] disconnected after {frames_received} frames")
    except Exception as exc:
        print(f"[MOBILE WS] error after {frames_received} frames: {exc}")
