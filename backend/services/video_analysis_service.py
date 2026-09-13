import os
import io
import time
import json
import threading
import logging
import numpy as np
import cv2
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from .yolo_service import get_yolo_service, detect_objects, track_objects
from .video_alert_service import create_person_detection_alert
from models.video_report import create_video_report
from utils.video_utils import (
    save_upload_file, encode_frame_jpeg, crop_frame,
    get_video_info, get_mime_type, VIDEO_DIR, EVIDENCE_DIR,
)
from services.cloudinary_service import upload_image
from models.media_file import create_media_file
from models.video import create_video
from models.notification import create_notification

logger = logging.getLogger(__name__)

def _get_video_capture(source):
    import platform
    if isinstance(source, str) and source.isdigit():
        source = int(source)
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        system = platform.system()
        if system == "Windows":
            cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        elif system == "Darwin":
            cap = cv2.VideoCapture(source, cv2.CAP_AVFOUNDATION)
    return cap


def _get_env(key: str, default=None):
    val = os.getenv(key, default)
    return val

class VideoAnalysisService:
    def __init__(self):
        self._lock = threading.Lock()
        self._active_streams: Dict[str, bool] = {}
        self._model_cache = None
        self._confidence = float(_get_env("VIDEO_PERSON_CONFIDENCE", "0.25"))
        self._inference_fps = float(_get_env("VIDEO_INFERENCE_FPS", "10"))

    def load_model(self):
        if self._model_cache is None:
            self._model_cache = get_yolo_service()
        return self._model_cache

    def analyze_camera_frame(self, frame_bytes: bytes, source_name: str = "Laptop Camera",
                             frame_number: Optional[int] = None,
                             video_timestamp: str = None,
                             case_id: Optional[str] = None,
                             on_detection: Optional[Callable] = None) -> List[Dict[str, Any]]:
        model = self.load_model()
        if model is None:
            return []

        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return []

        objects = track_objects(model, frame, self._confidence)

        now = datetime.utcnow()
        ts_str = now.isoformat()

        targets = [o for o in objects if o["class"] == "person"]
        
        person_count = len(targets)
        track_ids = [o["track_id"] for o in targets if o["track_id"] is not None]
        
        detections: List[Dict[str, Any]] = []

        if person_count > 0:
            # We'll use the bounding box and confidence of the most confident person as a representative for the alert
            best_target = max(targets, key=lambda x: x["confidence"])
            bbox = best_target["bounding_box"]

            full_ok, full_buf = encode_frame_jpeg(frame, quality=80)
            full_frame_info = None
            person_crop_info = None

            if full_ok:
                full_frame_info = full_buf

            crop = crop_frame(frame, bbox)
            if crop is not None and crop.size > 0:
                crop_ok, crop_buf = encode_frame_jpeg(crop, quality=90)
                if crop_ok:
                    person_crop_info = crop_buf

            report = None
            try:
                report = create_person_detection_alert(
                    source_type="CAMERA",
                    source_name=source_name,
                    person_count=person_count,
                    track_ids=track_ids,
                    confidence=best_target["confidence"],
                    bounding_box=bbox,
                    frame_number=frame_number,
                    timestamp=ts_str,
                    video_timestamp=video_timestamp,
                    full_frame_bytes=full_frame_info,
                    person_crop_bytes=person_crop_info,
                    case_id=case_id,
                    class_name="person",
                )
            except Exception as e:
                logger.error(f"Person detection alert creation failed: {e}")

            # Prepare the detections array to return to the frontend
            for p in targets:
                # We return the shared person_crop_url from the report to all targets just so the frontend gets it
                person_crop_url = report.get("personCropUrl") if report else None
                detections.append({
                    "class": p["class"],
                    "confidence": p["confidence"],
                    "bounding_box": p["bounding_box"],
                    "track_id": p["track_id"],
                    "event_type": "PERSON_DETECTED",
                    "personCropUrl": person_crop_url,
                })
        else:
            from services.video_alert_service import should_alert
            should_alert("CAMERA", source_name, 0)

        return detections

    def analyze_uploaded_video(self, video_path: str, source_name: str,
                               case_id: Optional[str] = None,
                               on_progress: Optional[Callable] = None) -> Dict[str, Any]:
        model = self.load_model()
        if model is None:
            return {"status": "error", "message": "AI video engine is unavailable."}

        info = get_video_info(video_path)
        total_frames = info["frame_count"]
        fps = info["fps"]
        if total_frames == 0:
            return {"status": "error", "message": "Unsupported or corrupted video file."}

        sample_interval = max(1, int(fps / self._inference_fps)) if fps > 0 else 1

        cap = _get_video_capture(video_path)
        frame_idx = 0
        detection_count = 0
        alert_count = 0
        processed = 0

        now_iso = datetime.utcnow().isoformat()

        if on_progress:
            on_progress({"status": "processing", "message": "Starting analysis...", "progress": 0})

        retry_count = 0
        while True:
            try:
                ret, frame = cap.read()
                if not ret:
                    retry_count += 1
                    if retry_count > 10:
                        break
                    time.sleep(0.1)
                    continue
                retry_count = 0
            except Exception as e:
                logger.error(f"Error reading frame: {e}")
                break

            if frame_idx % sample_interval == 0:
                persons = track_objects(model, frame, self._confidence)

                ts_str = now_iso
                if fps > 0:
                    secs = frame_idx / fps
                    mins = int(secs // 60)
                    secs_rem = secs % 60
                    ts_str = f"{mins:02d}:{secs_rem:05.2f}"

                targets = [o for o in persons if o["class"] == "person"]
                
                person_count = len(targets)
                track_ids = [o["track_id"] for o in targets if o["track_id"] is not None]

                if person_count > 0:
                    best_target = max(targets, key=lambda x: x["confidence"])
                    bbox = best_target["bounding_box"]
                    
                    full_ok, full_buf = encode_frame_jpeg(frame, quality=80)
                    full_frame_info = None
                    person_crop_info = None

                    if full_ok:
                        full_frame_info = full_buf

                    crop = crop_frame(frame, bbox)
                    if crop is not None and crop.size > 0:
                        crop_ok, crop_buf = encode_frame_jpeg(crop, quality=90)
                        if crop_ok:
                            person_crop_info = crop_buf

                    report = create_person_detection_alert(
                        source_type="UPLOADED_VIDEO",
                        source_name=source_name,
                        person_count=person_count,
                        track_ids=track_ids,
                        frame_number=frame_idx,
                        video_timestamp=ts_str,
                        timestamp=now_iso,
                        bounding_box=bbox,
                        confidence=round(best_target["confidence"], 4),
                        full_frame_bytes=full_frame_info,
                        person_crop_bytes=person_crop_info,
                        case_id=case_id,
                        class_name="person",
                    )

                    detection_count += person_count
                    if report:
                        alert_count += 1

                    if on_progress:
                        on_progress({
                            "status": "processing",
                            "message": f"People detected: {detection_count}, Alerts: {alert_count}",
                            "frame": frame_idx,
                            "total_frames": total_frames,
                            "detection_count": detection_count,
                            "alert_count": alert_count,
                        })

                processed += 1
                progress = int((frame_idx / total_frames) * 100) if total_frames else 0
                if on_progress:
                    on_progress({
                        "status": "processing",
                        "message": f"Analyzing frame {frame_idx} / {total_frames}",
                        "progress": progress,
                        "frame": frame_idx,
                        "total_frames": total_frames,
                        "detection_count": detection_count,
                        "alert_count": alert_count,
                    })

            frame_idx += 1

        cap.release()

        if on_progress:
            on_progress({
                "status": "completed",
                "message": "Analysis complete",
                "progress": 100,
                "detection_count": detection_count,
                "alert_count": alert_count,
            })

        return {
            "status": "completed",
            "total_frames": total_frames,
            "processed_frames": processed,
            "detections": detection_count,
            "alerts": alert_count,
        }

    def analyze_uploaded_video_async(self, video_path: str, source_name: str,
                                     case_id: Optional[str] = None,
                                     job_id: str = None) -> Dict[str, Any]:
        model = self.load_model()
        if model is None:
            return {"status": "error", "message": "AI video engine is unavailable."}

        info = get_video_info(video_path)
        total_frames = info["frame_count"]
        fps = info["fps"]
        if total_frames == 0:
            return {"status": "error", "message": "Unsupported or corrupted video file."}

        sample_interval = max(1, int(fps / self._inference_fps)) if fps > 0 else 1
        cap = _get_video_capture(video_path)
        
        class_counts = {"person": set()}
        timeline = []
        last_event_sec = -10
        total_detections = 0
        
        full_frame_info = None

        frame_idx = 0
        retry_count = 0
        while True:
            try:
                ret, frame = cap.read()
                if not ret:
                    retry_count += 1
                    if retry_count > 10:
                        break
                    time.sleep(0.1)
                    continue
                retry_count = 0
            except Exception as e:
                logger.error(f"Error reading frame: {e}")
                break

            if frame_idx % sample_interval == 0:
                objects = track_objects(model, frame, self._confidence)
                
                sec = int(frame_idx / fps) if fps > 0 else 0
                ts_str = f"{sec // 60:02d}:{sec % 60:02d}"

                frame_objs = {}
                for o in objects:
                    c = o["class"]
                    if c == "person" and o["track_id"] is not None:
                        class_counts["person"].add(o["track_id"])
                    elif c != "person":
                        frame_objs[c] = frame_objs.get(c, 0) + 1
                        
                    if sec - last_event_sec >= 5:
                        timeline.append({"time": ts_str, "event": f"{c.capitalize()} detected"})
                        last_event_sec = sec
                        if full_frame_info is None:
                            full_ok, full_buf = encode_frame_jpeg(frame, quality=80)
                            if full_ok:
                                full_frame_info = full_buf

                for c, count in frame_objs.items():
                    if c not in class_counts:
                        class_counts[c] = 0
                    class_counts[c] = max(class_counts[c], count)

                total_detections += len(objects)

            frame_idx += 1

        cap.release()
        
        person_count = len(class_counts["person"])
        
        objects_detected_list = []
        if person_count > 0: objects_detected_list.append({"class": "person", "count": person_count, "label": f"{person_count} approximate"})
        
        for c, count in class_counts.items():
            if c != "person" and count > 0:
                objects_detected_list.append({"class": c, "count": count, "label": str(count)})
        
        # Keep timeline as JSON string
        formatted_timeline = json.dumps(timeline)
        
        full_frame_file_id = None
        full_frame_url = None
        if full_frame_info:
            res = upload_image(full_frame_info, folder="bhairav/video-evidence")
            if res:
                doc = create_media_file({
                    "originalName": f"summary_frame_{job_id or 'vid'}.jpg",
                    "mimeType": "image/jpeg",
                    "resourceType": "image",
                    "cloudinaryPublicId": res.get("public_id"),
                    "cloudinaryAssetId": res.get("asset_id"),
                    "secureUrl": res.get("secure_url"),
                    "format": res.get("format"),
                    "bytes": res.get("bytes"),
                    "folder": "bhairav/video-evidence",
                    "caseId": case_id,
                    "dataClassification": "EVIDENCE"
                })
                full_frame_file_id = doc["fileId"]
                full_frame_url = doc["secureUrl"]

        report = create_video_report({
            "eventType": "VIDEO_ANALYSIS_SUMMARY",
            "sourceType": "UPLOADED_VIDEO",
            "sourceName": source_name,
            "caseId": case_id,
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": 0.0,
            "status": "COMPLETED",
            "objectsDetected": objects_detected_list,
            "humanCount": person_count,
            "timeline": formatted_timeline,
            "videoDurationSec": total_frames / fps if fps > 0 else 0,
            "fullFrameFileId": full_frame_file_id,
            "fullFrameUrl": full_frame_url,
            "dataClassification": "EVIDENCE_ANALYSIS",
        })

        create_notification({
            "type": "VIDEO_ANALYSIS_COMPLETED",
            "title": "Video Analysis Complete",
            "message": f"Processed {total_frames} frames. Detected {person_count} humans.",
            "caseId": case_id,
            "userId": "Officer",
        })

        return {
            "status": "completed",
            "total_frames": total_frames,
            "detections": total_detections,
            "human_count": person_count
        }

video_analysis_service = VideoAnalysisService()
