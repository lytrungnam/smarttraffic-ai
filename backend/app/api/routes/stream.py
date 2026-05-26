"""
Mobile camera stream endpoints.

GET  /stream/config  — trả về config cho mobile client (WS URL, dimensions)
WS   /stream/mobile  — nhận base64 JPEG từ mobile, chạy AI, gửi kết quả về
"""

import asyncio
import base64

import cv2
import numpy as np
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect

from app.ai.ocr_reader import read_plate_text
from app.ai.plate_detector import detect_plate
from app.ai.vehicle_detector import detect_vehicles
from app.ai.vehicle_matcher import get_vehicle_type_from_plate
from app.services.websocket_service import manager

router = APIRouter(prefix="/stream", tags=["stream"])

# ── Config endpoint ────────────────────────────────────────────────────────────

@router.get("/config")
async def stream_config(request: Request):
    """
    Trả về config để mobile client biết địa chỉ WS của server.
    Dùng Host header để tự phát hiện IP local thay vì hardcode.
    """
    host_header = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or "localhost:8000"
    )
    server_ip = host_header.split(":")[0]

    return {
        "ws_url": f"ws://{server_ip}:8000/api/v1/stream/mobile",
        "server_ip": server_ip,
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


# ── Mobile WebSocket ───────────────────────────────────────────────────────────

@router.websocket("/mobile")
async def mobile_stream(websocket: WebSocket):
    """
    WebSocket dành riêng cho mobile camera.
    Mobile gửi: base64 JPEG mỗi 500ms
    Backend trả về: { plates, vehicle_count, processing_ms, source: "mobile" }
    Backend cũng broadcast kết quả tới tất cả dashboard client (ws/detections).
    """
    await websocket.accept()

    loop = asyncio.get_running_loop()
    frames_received = 0

    try:
        while True:
            data = await websocket.receive_text()
            frames_received += 1

            frame = _decode_frame(data)
            if frame is None:
                await websocket.send_json({"error": "invalid_frame"})
                continue

            import time
            t0 = time.monotonic()

            # AI chạy blocking trong thread pool để không block event loop
            plates = await loop.run_in_executor(None, _run_ai, frame)

            processing_ms = round((time.monotonic() - t0) * 1000)

            result = {
                "plates": plates,
                "vehicle_count": len(plates),
                "processing_ms": processing_ms,
                "source": "mobile",
                "tracks": [],
                "events": [],
            }

            # Gửi kết quả về mobile client
            await websocket.send_json(result)

            # Broadcast tới tất cả dashboard /ws/detections clients
            if plates:
                await manager.broadcast(result)

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"[MOBILE WS] Error after {frames_received} frames: {exc}")
