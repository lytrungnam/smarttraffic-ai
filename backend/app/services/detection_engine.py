import asyncio
import cv2
import time

from sqlmodel import Session

from app.ai.vehicle_detector import (
    detect_vehicles,
)

from app.ai.plate_detector import (
    detect_plate,
)

from app.ai.ocr_reader import (
    read_plate_text,
)

from app.ai.vehicle_matcher import (
    get_vehicle_type_from_plate,
)

from app.core.db import engine

from app.models.detection import (
    Detection,
)

import app.services.frame_buffer as fb

from app.services.websocket_service import (
    manager,
)

from app.services.tracking_service import PersistentTracker

# =====================================
# MODULE-LEVEL SINGLETONS
# =====================================

saved_plates: set[str] = set()
tracker = PersistentTracker()


# =====================================
# REALTIME AI DETECTION LOOP
# =====================================

async def real_ai_detection_loop():

    cap = cv2.VideoCapture(
        "video.mp4"
    )

    frame_count = 0

    while True:

        ret, frame = cap.read()

        # loop video forever
        if not ret:

            cap.set(
                cv2.CAP_PROP_POS_FRAMES,
                0,
            )

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

        # Build plate→text mapping, then attach to matching vehicle
        plate_results: list[dict] = []
        vehicle_plate_map: dict[int, dict] = {}  # vehicle index → plate info

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
                    if existing is None or plate["confidence"] > existing["confidence"]:
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
                image_path = f"storage/detections/{plate_text}_{timestamp}.jpg"
                cv2.imwrite(image_path, frame)

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

    cap.release()
