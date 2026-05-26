"""
Persistent multi-object tracker with Kalman prediction, Hungarian matching,
appearance-based Re-ID, and entry/exit event generation.

Dependencies: filterpy, scipy
Optional:     torchreid (heavy — falls back to HOG histogram if absent)
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal

import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment

try:
    from filterpy.kalman import KalmanFilter
    FILTERPY_OK = True
except ImportError:
    FILTERPY_OK = False

try:
    import torch
    import torchreid
    _reid_model = torchreid.models.build_model(
        name="osnet_x0_25", num_classes=1000, pretrained=True
    )
    _reid_model.eval()
    REID_OK = True
except Exception:
    REID_OK = False

# ── Config ─────────────────────────────────────────────────────────────────

MAX_AGE          = 90     # frames before a track is declared lost
MIN_HITS         = 3      # frames needed to promote tentative → active
IOU_THRESHOLD    = 0.3
REID_THRESHOLD   = 0.70   # cosine similarity threshold for recovery

TrackState = Literal["tentative", "active", "occluded", "lost"]

_next_id = 1


def _new_id() -> int:
    global _next_id
    i = _next_id
    _next_id += 1
    return i


# ── Kalman helpers ──────────────────────────────────────────────────────────

def _bbox_to_z(bbox: list[int]) -> np.ndarray:
    """[x1,y1,x2,y2] → [cx, cy, s, r]"""
    x1, y1, x2, y2 = bbox
    w = x2 - x1
    h = y2 - y1
    cx = x1 + w / 2
    cy = y1 + h / 2
    s = w * h
    r = w / max(h, 1e-6)
    return np.array([[cx], [cy], [s], [r]], dtype=float)


def _z_to_bbox(z: np.ndarray) -> list[int]:
    """[cx, cy, s, r] → [x1,y1,x2,y2]"""
    cx, cy, s, r = z.flatten()[:4]
    w = float(np.sqrt(abs(s * r)))
    h = float(np.sqrt(abs(s / max(r, 1e-6))))
    return [int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2)]


def _make_kf() -> "KalmanFilter":
    kf = KalmanFilter(dim_x=8, dim_z=4)
    # state transition: constant velocity
    kf.F = np.eye(8)
    for i in range(4):
        kf.F[i, i + 4] = 1.0
    # measurement matrix
    kf.H = np.zeros((4, 8))
    for i in range(4):
        kf.H[i, i] = 1.0
    kf.R[2:, 2:] *= 10.0
    kf.P[4:, 4:] *= 1000.0
    kf.P *= 10.0
    kf.Q[-1, -1] *= 0.01
    kf.Q[4:, 4:] *= 0.01
    return kf


# Fallback Kalman using pure numpy (when filterpy absent)
class _SimpleKF:
    def __init__(self, bbox: list[int]):
        self.x = np.zeros((8, 1), dtype=float)
        self.x[:4] = _bbox_to_z(bbox)
        self.P = np.eye(8) * 10.0
        self.P[4:, 4:] *= 100.0
        self.F = np.eye(8)
        for i in range(4):
            self.F[i, i + 4] = 1.0
        self.H = np.zeros((4, 8))
        for i in range(4):
            self.H[i, i] = 1.0
        self.Q = np.eye(8) * 0.1
        self.Q[4:, 4:] *= 0.01
        self.R = np.eye(4) * 1.0
        self.R[2:, 2:] *= 10.0

    def predict(self):
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q

    def update(self, z: np.ndarray):
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x += K @ (z - self.H @ self.x)
        self.P = (np.eye(8) - K @ self.H) @ self.P


def _make_kalman(bbox: list[int]):
    if FILTERPY_OK:
        kf = _make_kf()
        kf.x[:4] = _bbox_to_z(bbox)
        return kf
    return _SimpleKF(bbox)


# ── IoU ─────────────────────────────────────────────────────────────────────

def _iou(a: list[int], b: list[int]) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1 = max(ax1, bx1)
    iy1 = max(ay1, by1)
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    inter = (ix2 - ix1) * (iy2 - iy1)
    aa = (ax2 - ax1) * (ay2 - ay1)
    ba = (bx2 - bx1) * (by2 - by1)
    return inter / (aa + ba - inter + 1e-6)


# ── Re-ID embeddings ─────────────────────────────────────────────────────────

def _hog_embedding(crop: np.ndarray) -> np.ndarray:
    """Fallback: HOG descriptor on 64×128 crop."""
    img = cv2.resize(crop, (64, 128))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    hog = cv2.HOGDescriptor((64, 128), (16, 16), (8, 8), (8, 8), 9)
    desc = hog.compute(img).flatten().astype(np.float32)
    norm = np.linalg.norm(desc)
    return desc / (norm + 1e-6)


def _torchreid_embedding(crop: np.ndarray) -> np.ndarray:
    import torch
    img = cv2.resize(crop, (128, 256))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])
    img = (img - mean) / std
    tensor = torch.tensor(img.transpose(2, 0, 1)).unsqueeze(0).float()
    with torch.no_grad():
        feat = _reid_model(tensor)
    vec = feat.squeeze().cpu().numpy()
    return vec / (np.linalg.norm(vec) + 1e-6)


def _extract_embedding(frame: np.ndarray, bbox: list[int]) -> np.ndarray:
    x1, y1, x2, y2 = bbox
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    if x2 <= x1 or y2 <= y1:
        return np.zeros(512 if REID_OK else 3780, dtype=np.float32)
    crop = frame[y1:y2, x1:x2]
    if REID_OK:
        try:
            return _torchreid_embedding(crop)
        except Exception:
            pass
    return _hog_embedding(crop)


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-6))


# ── Track dataclass ──────────────────────────────────────────────────────────

@dataclass
class Track:
    track_id: int
    state: TrackState
    kf: object                           # KalmanFilter instance
    bbox: list[int]                      # last confirmed bbox
    predicted_bbox: list[int]            # Kalman predicted bbox
    velocity: list[float]                # [vx, vy] in px/frame
    occluded_frames: int = 0
    hits: int = 1
    plate_text: str | None = None
    plate_confidence: float = 0.0
    first_seen: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    trajectory: list[list[int]] = field(default_factory=list)
    reid_embedding: np.ndarray | None = None
    _embed_age: int = 0                  # frames since last embedding update


# ── PersistentTracker ────────────────────────────────────────────────────────

class PersistentTracker:
    def __init__(
        self,
        max_age: int = MAX_AGE,
        min_hits: int = MIN_HITS,
        iou_threshold: float = IOU_THRESHOLD,
    ):
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        self.tracks: list[Track] = []
        self._archived: list[dict] = []   # completed tracks for DB/export

    # ── public API ────────────────────────────────────────────────────────

    def update(
        self, detections: list[dict], frame: np.ndarray
    ) -> tuple[list[dict], list[dict]]:
        """
        Parameters
        ----------
        detections : list of {"box": [x1,y1,x2,y2], "label": str, "confidence": float}
        frame      : BGR numpy frame

        Returns
        -------
        (track_infos, events)
        """
        det_boxes = [d["box"] for d in detections]

        # ── Step 1: Kalman predict ────────────────────────────────────────
        for t in self.tracks:
            if t.state in ("active", "occluded", "tentative"):
                t.kf.predict()
                raw = t.kf.x[:4].flatten()
                t.predicted_bbox = _z_to_bbox(raw)
                flat = t.kf.x.flatten()
                t.velocity = [round(float(flat[4]), 2), round(float(flat[5]), 2)]

        active_tracks = [t for t in self.tracks if t.state != "lost"]

        # ── Step 2: Hungarian matching (IoU) ─────────────────────────────
        matched, unmatched_dets, unmatched_tracks = self._match(
            active_tracks, det_boxes
        )

        # Update matched
        for t_idx, d_idx in matched:
            trk = active_tracks[t_idx]
            box = det_boxes[d_idx]
            det = detections[d_idx]
            trk.kf.update(_bbox_to_z(box))
            trk.bbox = box
            trk.predicted_bbox = box
            trk.occluded_frames = 0
            trk.hits += 1
            trk.last_seen = datetime.now(timezone.utc)
            trk.trajectory.append(_bbox_center(box))
            if len(trk.trajectory) > 200:
                trk.trajectory = trk.trajectory[-200:]

            # Update plate if confidence improves
            conf = det.get("confidence", 0)
            if conf > trk.plate_confidence:
                trk.plate_text = det.get("plate_text") or det.get("label")
                trk.plate_confidence = conf

            # Refresh embedding every 10 frames
            trk._embed_age += 1
            if trk.reid_embedding is None or trk._embed_age >= 10:
                trk.reid_embedding = _extract_embedding(frame, box)
                trk._embed_age = 0

            if trk.state == "tentative" and trk.hits >= self.min_hits:
                trk.state = "active"
            elif trk.state in ("occluded",):
                trk.state = "active"

        # Unmatched tracks → occluded
        for t_idx in unmatched_tracks:
            trk = active_tracks[t_idx]
            trk.occluded_frames += 1
            if trk.state == "active":
                trk.state = "occluded"

        # ── Step 3: Re-ID for unmatched detections ────────────────────────
        remaining_dets = list(unmatched_dets)
        occluded_tracks = [t for t in active_tracks if t.state == "occluded"]

        if occluded_tracks and remaining_dets:
            recovered_dets = set()
            for t in occluded_tracks:
                if t.reid_embedding is None:
                    continue
                best_sim, best_d = 0.0, -1
                for d_idx in remaining_dets:
                    emb = _extract_embedding(frame, det_boxes[d_idx])
                    sim = _cosine_sim(t.reid_embedding, emb)
                    pred_dist = _center_dist(t.predicted_bbox, det_boxes[d_idx])
                    if sim > REID_THRESHOLD and pred_dist < 150 and sim > best_sim:
                        best_sim, best_d = sim, d_idx
                if best_d >= 0:
                    box = det_boxes[best_d]
                    print(
                        f"[TRACKER] Track #{t.track_id} recovered "
                        f"after {t.occluded_frames} frames occlusion "
                        f"(sim={best_sim:.2f})"
                    )
                    t.kf.update(_bbox_to_z(box))
                    t.bbox = box
                    t.predicted_bbox = box
                    t.occluded_frames = 0
                    t.state = "active"
                    t.last_seen = datetime.now(timezone.utc)
                    t.trajectory.append(_bbox_center(box))
                    recovered_dets.add(best_d)
                    remaining_dets.remove(best_d)

        # New tracks for still-unmatched detections
        for d_idx in remaining_dets:
            box = det_boxes[d_idx]
            det = detections[d_idx]
            kf = _make_kalman(box)
            emb = _extract_embedding(frame, box)
            trk = Track(
                track_id=_new_id(),
                state="tentative",
                kf=kf,
                bbox=box,
                predicted_bbox=box,
                velocity=[0.0, 0.0],
                reid_embedding=emb,
                plate_text=det.get("plate_text") or det.get("label"),
                plate_confidence=det.get("confidence", 0),
            )
            trk.trajectory.append(_bbox_center(box))
            self.tracks.append(trk)

        # ── Step 4: Cleanup ───────────────────────────────────────────────
        events: list[dict] = []
        still_alive: list[Track] = []

        for t in self.tracks:
            if t.state == "lost":
                continue
            if t.occluded_frames > self.max_age:
                t.state = "lost"
                ev = self._make_exit_event(t)
                if ev:
                    events.append(ev)
                    self._archived.append(ev)
            else:
                still_alive.append(t)

        self.tracks = still_alive

        # Build output
        track_infos = [self._serialize(t) for t in self.tracks if t.state != "tentative"]
        return track_infos, events

    # ── helpers ───────────────────────────────────────────────────────────

    def _match(
        self, tracks: list[Track], det_boxes: list[list[int]]
    ) -> tuple[list[tuple[int, int]], list[int], list[int]]:
        if not tracks or not det_boxes:
            return [], list(range(len(det_boxes))), list(range(len(tracks)))

        iou_mat = np.zeros((len(tracks), len(det_boxes)), dtype=np.float32)
        for ti, t in enumerate(tracks):
            for di, box in enumerate(det_boxes):
                iou_mat[ti, di] = _iou(t.predicted_bbox, box)

        row_ind, col_ind = linear_sum_assignment(-iou_mat)
        matched, unmatched_t, unmatched_d = [], [], []

        for ti, di in zip(row_ind, col_ind):
            if iou_mat[ti, di] >= self.iou_threshold:
                matched.append((ti, di))
            else:
                unmatched_t.append(ti)
                unmatched_d.append(di)

        for ti in range(len(tracks)):
            if ti not in row_ind:
                unmatched_t.append(ti)
        for di in range(len(det_boxes)):
            if di not in col_ind:
                unmatched_d.append(di)

        return matched, unmatched_d, unmatched_t

    def _make_exit_event(self, t: Track) -> dict | None:
        if t.state == "tentative":
            return None
        duration = (t.last_seen - t.first_seen).total_seconds()
        return {
            "type": "exit",
            "track_id": t.track_id,
            "plate": t.plate_text,
            "duration_sec": round(duration, 1),
            "first_seen": t.first_seen.isoformat(),
            "last_seen": t.last_seen.isoformat(),
        }

    def _serialize(self, t: Track) -> dict:
        traj = t.trajectory[-10:] if t.trajectory else []
        duration = (datetime.now(timezone.utc) - t.first_seen).total_seconds()
        return {
            "track_id": t.track_id,
            "state": t.state,
            "bbox": t.bbox,
            "predicted_bbox": t.predicted_bbox if t.state == "occluded" else None,
            "plate_text": t.plate_text,
            "plate_confidence": round(t.plate_confidence, 2),
            "occluded_frames": t.occluded_frames,
            "velocity": t.velocity,
            "trajectory_last10": traj,
            "time_in_frame_sec": round(duration, 1),
        }

    def get_archived(self) -> list[dict]:
        return list(self._archived)


# ── helpers ──────────────────────────────────────────────────────────────────

def _bbox_center(box: list[int]) -> list[int]:
    x1, y1, x2, y2 = box
    return [int((x1 + x2) / 2), int((y1 + y2) / 2)]


def _center_dist(a: list[int], b: list[int]) -> float:
    ca = _bbox_center(a)
    cb = _bbox_center(b)
    return float(np.sqrt((ca[0] - cb[0]) ** 2 + (ca[1] - cb[1]) ** 2))
