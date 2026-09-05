"""
Bhairav Object Detector

Implements object detection using YOLO models.
Supports CPU/GPU inference with automatic fallback.
"""

from typing import List, Dict, Any, Optional
import logging
import numpy as np
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class DetectionResult:
    """Single detection result."""
    
    def __init__(
        self,
        label: str,
        confidence: float,
        bbox: tuple,
        model_name: str = "YOLO",
        model_version: str = "v8"
    ):
        self.detection_id = str(uuid.uuid4())
        self.label = label
        self.confidence = confidence
        self.bbox = bbox  # (x1, y1, x2, y2)
        self.model_name = model_name
        self.model_version = model_version
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "detection_id": self.detection_id,
            "label": self.label,
            "confidence": self.confidence,
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3]
            },
            "model_name": self.model_name,
            "model_version": self.model_version
        }


class ObjectDetector:
    """
    Object detector using YOLO models.
    
    Supports:
    - YOLOv8, YOLOv11 via ultralytics
    - CPU/GPU automatic selection
    - Configurable confidence thresholds
    - Class filtering
    """
    
    # COCO dataset class names (standard YOLO classes)
    COCO_CLASSES = [
        "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
        "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
        "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
        "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
        "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
        "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
        "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
        "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
        "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
        "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
    ]
    
    # Classes relevant for border surveillance
    SURVEILLANCE_CLASSES = [
        "person", "bicycle", "car", "motorcycle", "bus", "truck", "boat"
    ]
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Configuration
        self.model_name = config.get("model_name", "yolov8n.pt")
        self.confidence_threshold = config.get("confidence_threshold", 0.40)
        self.device = config.get("device", "auto")  # auto, cpu, cuda, 0, 1, etc.
        self.classes = config.get("classes", self.SURVEILLANCE_CLASSES)
        
        # Model instance
        self.model = None
        self.model_loaded = False
        self.load_error = None
        
        # Try to load the model
        self._load_model()
    
    def _load_model(self) -> None:
        """Load YOLO model with automatic CPU/GPU selection."""
        try:
            from ultralytics import YOLO
            
            logger.info(f"Loading YOLO model: {self.model_name}")
            
            # Determine device
            device = self._determine_device()
            
            # Load model
            self.model = YOLO(self.model_name)
            self.model.to(device)
            
            # Update device info
            self.device = str(self.model.device)
            
            self.model_loaded = True
            logger.info(f"YOLO model loaded successfully on device: {self.device}")
            
        except ImportError:
            self.load_error = "ultralytics package not installed"
            logger.warning(f"YOLO not available: {self.load_error}")
            logger.info("Falling back to OpenCV-based detection")
        except Exception as e:
            self.load_error = str(e)
            logger.error(f"Failed to load YOLO model: {e}")
            logger.info("Falling back to OpenCV-based detection")
    
    def _determine_device(self) -> str:
        """Determine the best available device for inference."""
        if self.device != "auto":
            return self.device
        
        try:
            import torch
            if torch.cuda.is_available():
                return "cuda:0"
        except ImportError:
            pass
        
        return "cpu"
    
    async def detect(self, frame: np.ndarray) -> List[DetectionResult]:
        """
        Run object detection on a frame.
        
        Args:
            frame: Video frame as numpy array (BGR format)
        
        Returns:
            List of DetectionResult objects
        """
        if not self.model_loaded:
            return await self._fallback_detection(frame)
        
        try:
            # Run inference
            results = self.model(
                frame,
                conf=self.confidence_threshold,
                classes=[self.COCO_CLASSES.index(c) for c in self.classes if c in self.COCO_CLASSES],
                verbose=False
            )
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        if class_id < len(self.COCO_CLASSES):
                            label = self.COCO_CLASSES[class_id]
                            
                            # Filter to surveillance classes
                            if label in self.classes:
                                detections.append(DetectionResult(
                                    label=label,
                                    confidence=confidence,
                                    bbox=(float(x1), float(y1), float(x2), float(y2)),
                                    model_name="YOLO",
                                    model_version="v8"
                                ))
            
            return detections
            
        except Exception as e:
            logger.error(f"YOLO detection error: {e}")
            return await self._fallback_detection(frame)
    
    async def _fallback_detection(self, frame: np.ndarray) -> List[DetectionResult]:
        """
        Fallback detection using OpenCV when YOLO is unavailable.
        Uses connected components as a proxy for object detection.
        """
        try:
            import cv2
            
            # Convert to grayscale and blur
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Threshold
            _, thresh = cv2.threshold(blurred, 90, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Connected components
            n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(thresh, connectivity=8)
            
            detections = []
            for i in range(1, n_labels):
                x, y, w, h, area = stats[i]
                
                # Filter by area
                if 1500 < area < 30000:
                    # Aspect ratio heuristic
                    aspect_ratio = h / max(w, 1)
                    
                    if aspect_ratio > 1.4:
                        label = "person"
                    elif aspect_ratio < 0.7:
                        label = "car"
                    else:
                        label = "object"
                    
                    confidence = min(0.95, 0.55 + (area / 30000) * 0.4)
                    
                    detections.append(DetectionResult(
                        label=label,
                        confidence=confidence,
                        bbox=(float(x), float(y), float(x + w), float(y + h)),
                        model_name="OpenCV",
                        model_version="fallback"
                    ))
            
            logger.debug(f"Fallback detection: {len(detections)} objects")
            return detections
            
        except Exception as e:
            logger.error(f"Fallback detection error: {e}")
            return []
    
    def get_info(self) -> Dict[str, Any]:
        """Get detector information."""
        return {
            "model_name": self.model_name,
            "model_version": "v8",
            "task": "object_detection",
            "device": self.device,
            "status": "READY" if self.model_loaded else "FALLBACK",
            "classes": self.classes,
            "confidence_threshold": self.confidence_threshold,
            "load_error": self.load_error,
            "available_classes": self.COCO_CLASSES
        }
