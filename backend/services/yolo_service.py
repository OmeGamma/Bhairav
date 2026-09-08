import os
import threading
import numpy as np
import cv2

_yolo_lock = threading.Lock()
_yolo_instance = None
_yolo_model = None
_yolo_status = {
    "initialized": False,
    "device": "cpu",
    "model_name": None,
    "error": None,
}

def _get_env(key: str, default=None):
    val = os.getenv(key, default)
    return val

def initialize_yolo():
    global _yolo_instance, _yolo_model, _yolo_status
    with _yolo_lock:
        if _yolo_instance is not None:
            return _yolo_instance
        try:
            from ultralytics import YOLO
            import torch

            model_name = _get_env("VIDEO_MODEL", "yolo11n.pt")
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            candidate_paths = [
                model_name,
                os.path.join(backend_dir, "..", model_name),
                os.path.join(backend_dir, "..", "models", model_name),
                os.path.join(backend_dir, "models", model_name),
            ]
            model_path = next((p for p in candidate_paths if os.path.exists(p)), model_name)
            _yolo_instance = YOLO(model_path)

            cuda_available = torch.cuda.is_available()
            if cuda_available:
                _yolo_status["device"] = "cuda"
            else:
                _yolo_status["device"] = "cpu"

            _yolo_model = model_name
            _yolo_status["initialized"] = True
            _yolo_status["model_name"] = model_name
            _yolo_status["error"] = None

            print(f"Bhairav Video Intelligence")
            print(f"Ultralytics YOLO initialized")
            print(f"Device: {_yolo_status['device']}")

        except Exception as e:
            _yolo_status["initialized"] = False
            _yolo_status["error"] = str(e)
            _yolo_status["device"] = "cpu"
            _yolo_status["model_name"] = _get_env("VIDEO_MODEL", "yolo11n.pt")
            print(f"YOLO initialization failed: {e}")
            print("Video Intelligence will report AI engine unavailable.")

    return _yolo_instance

def get_yolo_service():
    return initialize_yolo()

def get_yolo_status():
    return dict(_yolo_status)

def detect_persons(model, frame, confidence_threshold=0.50):
    if model is None:
        return []

    results = model(frame, verbose=False)
    persons = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            if conf < confidence_threshold:
                continue

            cls_name = model.names.get(cls_id, str(cls_id))
            if cls_name != "person":
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            track_id = None
            if hasattr(box, 'id') and box.id is not None:
                track_id = int(box.id[0])

            persons.append({
                "class": "person",
                "confidence": round(conf, 4),
                "bounding_box": {
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2),
                },
                "track_id": track_id,
            })

    return persons

def track_persons(model, frame, confidence_threshold=0.50):
    if model is None:
        return []

    results = model.track(frame, persist=True, verbose=False)
    persons = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            if conf < confidence_threshold:
                continue

            cls_name = model.names.get(cls_id, str(cls_id))
            if cls_name != "person":
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            track_id = None
            if hasattr(box, 'id') and box.id is not None:
                track_id = int(box.id[0])

            persons.append({
                "class": "person",
                "confidence": round(conf, 4),
                "bounding_box": {
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2),
                },
                "track_id": track_id,
            })

    return persons

def is_yolo_available():
    status = get_yolo_status()
    return status.get("initialized", False)
