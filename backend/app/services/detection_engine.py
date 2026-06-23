import asyncio
import logging
import time

import cv2
from sqlmodel import Session

import app.services.frame_buffer as fb
from app.ai.inference import _build_annotated_evidence
from app.ai.ocr_reader import (
    read_plate_text,
)
from app.ai.plate_detector import (
    detect_plate,
)
from app.ai.vehicle_detector import (
    detect_vehicles,
)
from app.ai.vehicle_matcher import (
    get_vehicle_type_from_plate,
)
from app.core.config import settings
from app.core.db import engine
from app.models.detection import (
    Detection,
)
from app.services.tracking_service import PersistentTracker
from app.services.websocket_service import (
    manager,
)

logger = logging.getLogger(__name__)

# =====================================
# MODULE-LEVEL SINGLETONS
# =====================================

saved_plates: set[str] = set()
tracker = PersistentTracker()


# =====================================
# REALTIME AI DETECTION LOOP
# =====================================


def _opencv_capture_source(source: str) -> int | str:
    stripped_source = source.strip()
    if stripped_source.isdigit():
        return int(stripped_source)
    return stripped_source


async def real_ai_detection_loop():
    if not settings.CAMERA_SOURCE:
        logger.warning(
            "CAMERA_SOURCE is not set; realtime AI detection loop will not start"
        )
        return

    cap_source = _opencv_capture_source(settings.CAMERA_SOURCE)
    cap = cv2.VideoCapture(cap_source)
    if not cap.isOpened():
        logger.warning(
            "Unable to open CAMERA_SOURCE=%r; realtime AI detection loop stopped",
            settings.CAMERA_SOURCE,
        )
        cap.release()
        return

    frame_count = 0

    consecutive_failures = 0
    backoff = 1
    try:
        while True:

            ret, frame = cap.read()

            if not ret:
                consecutive_failures += 1
                logger.debug("[AI] frame read failed (count=%d)", consecutive_failures)

                # Attempt reconnect for camera streams (RTSP/IP). For file sources, reset to start.
                if consecutive_failures > 5:
                    logger.info("[AI] attempting to reopen capture source after failures")
                    try:
                        cap.release()
                    except Exception:
                        pass
                    await asyncio.sleep(backoff)
                    cap = cv2.VideoCapture(cap_source)
                    if cap.isOpened():
                        logger.info("[AI] re-opened capture source successfully")
                        consecutive_failures = 0
                        backoff = 1
                    else:
                        backoff = min(backoff * 2, 32)
                        logger.warning("[AI] reopen failed, backing off %s seconds", backoff)
                    await asyncio.sleep(0.5)
                    continue

                # For transient read errors (e.g., file loop), try rewinding and sleep briefly
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                await asyncio.sleep(0.5)
                continue

            # reset failures counter on successful read
            consecutive_failures = 0

            # Loop file sources and wait briefly for transient camera read failures.
            if not ret:

                cap.set(
                    cv2.CAP_PROP_POS_FRAMES,
                    0,
                )
                await asyncio.sleep(0.5)

                continue

            # =====================================
            # OPTIMIZE PERFORMANCE
            # =====================================

            frame = cv2.resize(
                frame,
                (960, 540),
            )

            # update MJPEG stream buffer
            _, jpeg = cv2.imencode(
                ".jpg",
                frame,
                [cv2.IMWRITE_JPEG_QUALITY, 70],
            )
            fb.latest_frame = jpeg.tobytes()
            fb.frame_ready.set()

            frame_count += 1

            # skip frames
            if frame_count % 3 != 0:
                continue

            # =====================================
            # AI DETECTION
            # =====================================

            vehicles = detect_vehicles(frame)
            plates = detect_plate(frame)

            # =====================================
            # OCR + PLATE→VEHICLE ENRICHMENT
            # =====================================

            # Build plate-to-text mapping, then attach to matching vehicle.
            plate_results: list[dict] = []
            vehicle_plate_map: dict[int, dict] = {}

            for plate in plates:
                x1, y1, x2, y2 = plate["box"]
                plate_crop = frame[y1:y2, x1:x2]
                plate_text = read_plate_text(plate_crop) or "UNKNOWN"

                vehicle_type = get_vehicle_type_from_plate(plate["box"], vehicles)

                # find which vehicle index owns this plate
                px1, py1, px2, py2 = plate["box"]
                for vi, v in enumerate(vehicles):
                    vx1, vy1, vx2, vy2 = v["box"]
                    if px1 >= vx1 and py1 >= vy1 and px2 <= vx2 and py2 <= vy2:
                        existing = vehicle_plate_map.get(vi)
                        if (
                            existing is None
                            or plate["confidence"] > existing["confidence"]
                        ):
                            vehicle_plate_map[vi] = {
                                "plate_text": plate_text,
                                "confidence": plate["confidence"],
                            }
                        break

                realtime_detection = {
                    "plate_number": plate_text,
                    "vehicle_type": vehicle_type,
                    "confidence": plate["confidence"],
                    "status": "detected",
                }

                # =====================================
                # SAVE UNIQUE DETECTIONS
                # =====================================

                if plate_text != "UNKNOWN" and plate_text not in saved_plates:
                    saved_plates.add(plate_text)

                    timestamp = int(time.time())
                    safe_plate = "".join([c if c.isalnum() else "_" for c in plate_text])
                    image_path = f"storage/detections/{safe_plate}_{timestamp}.jpg"

                    # encode evidence bytes and save original
                    encode_success, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                    if encode_success:
                        evidence_bytes = buffer.tobytes()
                        try:
                            with open(image_path, 'wb') as f:
                                f.write(evidence_bytes)
                        except Exception:
                            cv2.imwrite(image_path, frame)
                    else:
                        cv2.imwrite(image_path, frame)

                    # try to build annotated evidence (best-effort)
                    try:
                        annotation_data = {"vehicles": vehicles, "plates": plates}
                        annotated_bytes = _build_annotated_evidence(evidence_bytes, annotation_data)
                        annotated_path = None
                        if annotated_bytes:
                            annotated_path = f"storage/detections/{safe_plate}_{timestamp}_annotated.jpg"
                            with open(annotated_path, 'wb') as f:
                                f.write(annotated_bytes)
                    except Exception:
                        annotated_path = None

                    with Session(engine) as session:
                        detection = Detection(
                            plate_number=plate_text,
                            vehicle_type=vehicle_type,
                            confidence=float(plate["confidence"]),
                            image_path=image_path,
                            status="detected",
                        )
                        session.add(detection)
                        session.commit()
                        session.refresh(detection)
                        realtime_detection.update({
                            "id": str(detection.id),
                            "location": detection.location,
                            "image_path": detection.image_path,
                            "created_at": (
                                detection.created_at.isoformat()
                                if detection.created_at else None
                            ),
                        })

                        if annotated_path:
                            realtime_detection.update({
                                "annotated_image_path": annotated_path,
                                "annotated_evidence_path": annotated_path,
                            })

                    print(f"[SAVED] {plate_text} ({vehicle_type})")

                print({"plate_number": plate_text, "vehicle_type": vehicle_type,
                       "confidence": plate["confidence"]})

                plate_results.append(realtime_detection)

            # =====================================
            # TRACKER UPDATE
            # =====================================

            # Enrich vehicle dicts with plate_text for the tracker
            enriched_vehicles: list[dict] = []
            for vi, v in enumerate(vehicles):
                ev = dict(v)
                pi = vehicle_plate_map.get(vi)
                if pi:
                    ev["plate_text"] = pi["plate_text"]
                    ev["confidence"] = max(v.get("confidence", 0), pi["confidence"])
                enriched_vehicles.append(ev)

            track_infos, events = tracker.update(enriched_vehicles, frame)

            # =====================================
            # REALTIME WEBSOCKET
            # =====================================

            data = {
                "vehicle_count": len(vehicles),
                "plates": plate_results,
                "tracks": track_infos,
                "events": events,
            }

            await manager.broadcast(data)

            await asyncio.sleep(
                0.03
            )

    finally:
        cap.release()
