import os
import io
import uuid
import cv2
import numpy as np
from typing import Optional, Tuple, List, Dict, Any

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
VIDEO_DIR = os.path.join(UPLOAD_DIR, "videos")
EVIDENCE_DIR = os.path.join(UPLOAD_DIR, "evidence")

def ensure_dirs():
    os.makedirs(VIDEO_DIR, exist_ok=True)
    os.makedirs(EVIDENCE_DIR, exist_ok=True)

def save_upload_file(file_bytes: bytes, original_filename: str, subdir: str = "videos") -> str:
    ensure_dirs()
    ext = os.path.splitext(original_filename)[1] or ".ts"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, subdir, filename)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return filename

def save_image_bytes(img_bytes: bytes, subdir: str = "evidence", ext: str = ".jpg") -> str:
    ensure_dirs()
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, subdir, filename)
    with open(path, "wb") as f:
        f.write(img_bytes)
    return filename

def get_file_path(stored_filename: str, subdir: str = "evidence") -> str:
    path = os.path.join(UPLOAD_DIR, subdir, stored_filename)
    return path

def file_exists(stored_filename: str, subdir: str = "evidence") -> bool:
    path = os.path.join(UPLOAD_DIR, subdir, stored_filename)
    return os.path.exists(path)

def encode_frame_jpeg(frame, quality: int = 85) -> Tuple[bool, bytes]:
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    result, buf = cv2.imencode(".jpg", frame, encode_param)
    return result, buf.tobytes()

def crop_frame(frame, bbox: Dict[str, int]) -> np.ndarray:
    x1 = max(0, bbox["x1"])
    y1 = max(0, bbox["y1"])
    x2 = bbox["x2"]
    y2 = bbox["y2"]
    return frame[y1:y2, x1:x2]

def get_video_info(video_path: str) -> Dict[str, Any]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"fps": 0, "frame_count": 0, "width": 0, "height": 0, "duration": 0}
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps > 0 else 0
    cap.release()
    return {
        "fps": round(fps, 2) if fps else 0,
        "frame_count": frame_count,
        "width": width,
        "height": height,
        "duration": round(duration, 2),
    }

def allowed_video_extensions():
    return {".mp4", ".webm", ".ogg", ".avi", ".mkv", ".mov", ".wmv", ".flv"}

def is_allowed_video(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_video_extensions()

def get_mime_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    mimes = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".ogg": "video/ogg",
        ".avi": "video/x-msvideo",
        ".mkv": "video/x-matroska",
        ".mov": "video/quicktime",
        ".wmv": "video/x-ms-wmv",
        ".flv": "video/x-flv",
    }
    return mimes.get(ext, "application/octet-stream")
