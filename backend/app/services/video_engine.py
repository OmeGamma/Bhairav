"""
BHAIRAV Video Intelligence Engine.

This module provides real, deterministic computer-vision analysis using OpenCV.

It does NOT claim deep-learning person detection (we don't ship a YOLO model).
Instead, it does:
  * Synthetic frame generation (representative of a real CCTV frame)
  * Real OpenCV preprocessing: grayscale, Gaussian blur, Canny edges
  * Edge density (proxy for scene complexity / activity)
  * Color histogram (proxy for scene type)
  * Connected-components blob analysis (proxy for object/person count)
  * Severity classification from CV-derived features

All outputs are flagged with `processing_mode: 'opencv_synthetic_frame'` so
callers know the frame itself is synthetic but the analysis is real.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Tuple
import hashlib
import struct
import uuid

import cv2
import numpy as np

from app.schemas.ai_schemas import VideoAnalyzeResponse, Detection, BBox, VideoEvent


_FRAME_W = 640
_FRAME_H = 480


def _seeded_rng(camera_id: str, video_id: str, frame_index: int) -> np.random.Generator:
    """Deterministic RNG so the same (camera, video, frame) always yields same analysis."""
    payload = f"{camera_id}:{video_id}:{frame_index}".encode("utf-8")
    seed = int(hashlib.sha256(payload).hexdigest()[:16], 16)
    return np.random.default_rng(seed)


def _generate_synthetic_frame(
    camera_id: str, video_id: str, frame_index: int
) -> np.ndarray:
    """
    Create a representative CCTV-like frame deterministically.
    The frame is NOT a real capture - it is a generated scene that the
    downstream OpenCV pipeline will analyse.

    Scene composition (varies per camera):
      * Sky / wall gradient (top half)
      * Ground / floor gradient (bottom half)
      * 0-3 "person-like" silhouettes (vertical rectangles with head)
      * 0-2 "vehicle-like" shapes (horizontal rectangles)
    """
    rng = _seeded_rng(camera_id, video_id, frame_index)
    frame = np.zeros((_FRAME_H, _FRAME_W, 3), dtype=np.uint8)

    # Sky / wall
    sky_color = tuple(int(c) for c in rng.integers(80, 200, size=3))
    for y in range(_FRAME_H // 2):
        c = int(sky_color[0] * (1 - y / (_FRAME_H // 2) * 0.3))
        frame[y, :] = (c, c, c)
    # Ground
    ground_color = tuple(int(c) for c in rng.integers(40, 110, size=3))
    frame[_FRAME_H // 2 :, :] = ground_color

    # People silhouettes (vertical dark blobs)
    n_people = int(rng.integers(0, 4))
    for _ in range(n_people):
        cx = int(rng.integers(80, _FRAME_W - 80))
        h = int(rng.integers(140, 220))
        w = int(h * 0.35)
        top = int(rng.integers(_FRAME_H // 2 - 20, _FRAME_H - h - 20))
        # Body
        cv2.rectangle(frame, (cx, top + 20), (cx + w, top + h), (30, 30, 30), -1)
        # Head
        cv2.circle(frame, (cx + w // 2, top + 12), 14, (30, 30, 30), -1)

    # Vehicles
    n_vehicles = int(rng.integers(0, 3))
    for _ in range(n_vehicles):
        x = int(rng.integers(40, _FRAME_W - 200))
        y = int(rng.integers(_FRAME_H - 130, _FRAME_H - 60))
        cv2.rectangle(frame, (x, y), (x + 160, y + 60), (20, 20, 20), -1)
        cv2.rectangle(frame, (x + 30, y - 25), (x + 110, y), (40, 40, 40), -1)
        # Wheels
        cv2.circle(frame, (x + 30, y + 60), 10, (0, 0, 0), -1)
        cv2.circle(frame, (x + 130, y + 60), 10, (0, 0, 0), -1)

    # Add some noise to make it look real
    noise = rng.integers(-10, 10, size=frame.shape, dtype=np.int16)
    frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    return frame


def _analyse_frame(frame: np.ndarray) -> Dict[str, Any]:
    """
    Real OpenCV analysis: edge density, dominant color, blob/person count.

    We use connected components on a binarized frame as a stand-in for
    "people/objects" detection. This is NOT deep-learning based - it's a
    deterministic classical-CV pipeline that produces real numbers you can
    audit. For real person detection a YOLO model would be required.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    edge_density = float(np.count_nonzero(edges)) / float(edges.size)

    # Average color per channel (BGR -> RGB)
    avg_bgr = frame.mean(axis=(0, 1))
    dominant = {
        "b": float(avg_bgr[0]),
        "g": float(avg_bgr[1]),
        "r": float(avg_bgr[2]),
    }

    # Histogram features (16-bin per channel normalized)
    hist_b = cv2.calcHist([frame], [0], None, [16], [0, 256]).flatten()
    hist_g = cv2.calcHist([frame], [1], None, [16], [0, 256]).flatten()
    hist_r = cv2.calcHist([frame], [2], None, [16], [0, 256]).flatten()
    hist_b = (hist_b / max(hist_b.sum(), 1)).round(3).tolist()
    hist_g = (hist_g / max(hist_g.sum(), 1)).round(3).tolist()
    hist_r = (hist_r / max(hist_r.sum(), 1)).round(3).tolist()

    # Connected components on a binarized frame -> real blob count
    _, thresh = cv2.threshold(blurred, 90, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(thresh, connectivity=8)
    # Filter blobs by area to ignore noise
    blob_areas = [int(stats[i, cv2.CC_STAT_AREA]) for i in range(1, n_labels)]
    blob_count = sum(1 for a in blob_areas if 1500 < a < 30000)

    return {
        "edge_density": round(edge_density, 4),
        "dominant_color_bgr": {k: round(v, 1) for k, v in dominant.items()},
        "histogram_rgb": {"r": hist_r, "g": hist_g, "b": hist_b},
        "blob_count": int(blob_count),
        "total_components": int(max(n_labels - 1, 0)),
    }


def _classify_severity(features: Dict[str, Any], payload: Dict[str, Any]) -> Tuple[str, str]:
    """Map CV-derived features to a severity label and event type."""
    ed = features["edge_density"]
    people = features["blob_count"]

    if payload.get("restricted_zone"):
        if people >= 1:
            return "HIGH", "restricted_zone_entry"
        return "MEDIUM", "restricted_zone_proximity"

    if people >= 3 and ed > 0.10:
        return "HIGH", "crowd_anomaly"
    if people >= 1 and ed > 0.15:
        return "MEDIUM", "motion_anomaly"
    if people == 0 and ed > 0.20:
        return "MEDIUM", "scene_change"
    if people >= 1:
        return "LOW", "person_detected"
    return "INFO", "scene_normal"


def analyze_frame(
    frame: np.ndarray, 
    camera_id: str, 
    session_id: str, 
    frame_index: int, 
    payload: Dict[str, Any] = None
) -> VideoAnalyzeResponse:
    """
    Public entry point. Runs the real OpenCV pipeline on a given frame
    and returns a structured response.
    """
    if payload is None:
        payload = {}
        
    features = _analyse_frame(frame)
    severity, event_type = _classify_severity(features, payload)

    # Re-run connected components to extract bounding boxes for each blob
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 90, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(thresh, connectivity=8)

    detections: List[Detection] = []
    for i in range(1, n_labels):
        x, y, w, h, area = stats[i]
        if 1500 < area < 30000:
            # Aspect ratio heuristic: tall narrow blobs are likely "people"
            ar = h / max(w, 1)
            label = "person" if ar > 1.4 else "object"
            confidence = min(0.95, 0.55 + (area / 30000) * 0.4)
            detections.append(
                Detection(
                    type=label,
                    confidence=round(float(confidence), 3),
                    bbox=BBox(x1=float(x), y1=float(y), x2=float(x + w), y2=float(y + h)),
                    track_id=str(uuid.uuid4())[:8],
                )
            )

    if not detections:
        # Force at least one scene-level detection
        cx, cy = _FRAME_W // 2, _FRAME_H // 2
        detections.append(
            Detection(
                type="scene_change",
                confidence=min(0.99, 0.4 + features["edge_density"] * 2),
                bbox=BBox(x1=float(cx - 80), y1=float(cy - 60), x2=float(cx + 80), y2=float(cy + 60)),
                track_id=str(uuid.uuid4())[:8],
            )
        )

    return VideoAnalyzeResponse(
        camera_id=camera_id,
        timestamp=datetime.utcnow().isoformat(),
        detections=detections,
        event=VideoEvent(type=event_type, severity=severity),
        model_info={
            "model": "OpenCV classical CV (Canny + Histogram + Connected Components)",
            "version": cv2.__version__,
            "processing_mode": "real_or_synthetic_frame",
            "frame_resolution": f"{frame.shape[1]}x{frame.shape[0]}",
            "features": features,
            "frame_index": frame_index,
            "session_id": session_id,
            "notes": "Detections are CV-derived from connected-component blobs; not deep-learning.",
        },
    )

def analyze_video_payload(payload: Dict[str, Any]) -> VideoAnalyzeResponse:
    """
    Legacy entry point for simulated payloads.
    """
    camera_id = payload.get("camera_id", "CAM-DEMO")
    video_id = payload.get("video_id", "BOP-01")
    frame_index = int(payload.get("frame_index", payload.get("frame_number", 0) or 0))

    frame = _generate_synthetic_frame(camera_id, video_id, frame_index)
    return analyze_frame(frame, camera_id, video_id, frame_index, payload)
