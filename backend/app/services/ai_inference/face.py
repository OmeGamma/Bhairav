"""
Bhairav Face Detector

Implements face detection using OpenCV Haar cascades or deep learning models.
Does NOT implement unrestricted identity recognition.
"""

from typing import List, Dict, Any, Optional
import logging
import numpy as np
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class FaceDetectionResult:
    """Face detection result."""
    
    def __init__(
        self,
        bbox: tuple,
        confidence: float,
        model_name: str = "OpenCV"
    ):
        self.face_detection_id = str(uuid.uuid4())
        self.bbox = bbox
        self.confidence = confidence
        self.model_name = model_name
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "face_detection_id": self.face_detection_id,
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3]
            },
            "confidence": self.confidence,
            "model_name": self.model_name
        }


class FaceDetector:
    """
    Face detector using OpenCV Haar cascades or deep learning models.
    
    IMPORTANT: This implements FACE DETECTION only, not identity recognition.
    Identity recognition requires authorized watchlist workflow.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Configuration
        self.model_type = config.get("model_type", "haar")  # haar, dlib, retinaface
        self.confidence_threshold = config.get("confidence_threshold", 0.5)
        self.scale_factor = config.get("scale_factor", 1.1)
        self.min_neighbors = config.get("min_neighbors", 5)
        
        # Model instance
        self.face_cascade = None
        self.model_loaded = False
        self.load_error = None
        
        # Try to load face detection model
        self._load_model()
    
    def _load_model(self) -> None:
        """Load face detection model."""
        try:
            import cv2
            
            if self.model_type == "haar":
                # Load Haar cascade classifier
                self.face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                
                if self.face_cascade.empty():
                    raise Exception("Failed to load Haar cascade file")
                
                self.model_loaded = True
                logger.info("OpenCV Haar cascade face detector loaded")
            
            elif self.model_type == "dlib":
                import dlib
                self.face_detector = dlib.get_frontal_face_detector()
                self.model_loaded = True
                logger.info("Dlib face detector loaded")
            
            else:
                logger.warning(f"Unknown face detector type: {self.model_type}")
                self.load_error = f"Unknown model type: {self.model_type}"
                
        except ImportError as e:
            self.load_error = f"{self.model_type} package not installed: {e}"
            logger.warning(f"Face detector not available: {self.load_error}")
        except Exception as e:
            self.load_error = str(e)
            logger.error(f"Failed to load face detector: {e}")
    
    async def detect(
        self,
        frame: np.ndarray,
        person_bbox: Optional[tuple] = None
    ) -> List[FaceDetectionResult]:
        """
        Detect faces in a frame.
        
        Args:
            frame: Video frame as numpy array (BGR format)
            person_bbox: Optional person bounding box to limit search area
        
        Returns:
            List of FaceDetectionResult objects
        """
        if not self.model_loaded:
            logger.debug("Face detector not loaded")
            return []
        
        try:
            import cv2
            
            # If person bbox provided, limit search to that region
            if person_bbox:
                x1, y1, x2, y2 = [int(coord) for coord in person_bbox]
                search_region = frame[y1:y2, x1:x2]
                offset_x, offset_y = x1, y1
            else:
                search_region = frame
                offset_x, offset_y = 0, 0
            
            if search_region.size == 0:
                return []
            
            # Convert to grayscale
            gray = cv2.cvtColor(search_region, cv2.COLOR_BGR2GRAY)
            
            faces = []
            
            if self.model_type == "haar" and self.face_cascade:
                # Detect faces using Haar cascade
                face_rects = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=self.scale_factor,
                    minNeighbors=self.min_neighbors,
                    minSize=(30, 30)
                )
                
                for (x, y, w, h) in face_rects:
                    # Calculate confidence based on face size and neighbors
                    confidence = min(0.95, 0.5 + (w * h) / (100 * 100) * 0.3)
                    
                    if confidence >= self.confidence_threshold:
                        # Adjust coordinates with offset
                        abs_x = offset_x + x
                        abs_y = offset_y + y
                        
                        faces.append(FaceDetectionResult(
                            bbox=(float(abs_x), float(abs_y), float(abs_x + w), float(abs_y + h)),
                            confidence=confidence,
                            model_name="OpenCV-Haar"
                        ))
            
            elif self.model_type == "dlib":
                # Detect faces using dlib
                face_rects = self.face_detector(gray, 1)
                
                for rect in face_rects:
                    confidence = 0.85  # Dlib doesn't provide confidence
                    
                    # Adjust coordinates with offset
                    abs_x = offset_x + rect.left()
                    abs_y = offset_y + rect.top()
                    abs_x2 = offset_x + rect.right()
                    abs_y2 = offset_y + rect.bottom()
                    
                    faces.append(FaceDetectionResult(
                        bbox=(float(abs_x), float(abs_y), float(abs_x2), float(abs_y2)),
                        confidence=confidence,
                        model_name="Dlib"
                    ))
            
            logger.debug(f"Detected {len(faces)} faces")
            return faces
            
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            return []
    
    def get_info(self) -> Dict[str, Any]:
        """Get face detector information."""
        return {
            "model_name": self.model_type,
            "model_version": "1.0",
            "task": "face_detection",
            "device": "CPU",
            "status": "READY" if self.model_loaded else "ERROR",
            "confidence_threshold": self.confidence_threshold,
            "load_error": self.load_error,
            "note": "Face detection only - does not perform identity recognition"
        }
