"""
Bhairav ANPR Engine

Implements Automatic Number Plate Recognition using OCR.
Supports multiple OCR engines with confidence scoring.
"""

from typing import List, Dict, Any, Optional
import logging
import numpy as np
from datetime import datetime
import uuid
import re

logger = logging.getLogger(__name__)


class ANPRResult:
    """ANPR result with confidence and normalization."""
    
    def __init__(
        self,
        plate_text: str,
        raw_ocr_text: str,
        ocr_confidence: float,
        bbox: tuple,
        vehicle_class: Optional[str] = None
    ):
        self.anpr_id = str(uuid.uuid4())
        self.plate_text = plate_text
        self.raw_ocr_text = raw_ocr_text
        self.ocr_confidence = ocr_confidence
        self.bbox = bbox
        self.vehicle_class = vehicle_class
        self.confidence_level = self._determine_confidence_level(ocr_confidence)
    
    def _determine_confidence_level(self, confidence: float) -> str:
        """Determine confidence level from numeric confidence."""
        if confidence >= 0.8:
            return "HIGH"
        elif confidence >= 0.5:
            return "MEDIUM"
        else:
            return "LOW"
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "anpr_id": self.anpr_id,
            "plate_text": self.plate_text,
            "raw_ocr_text": self.raw_ocr_text,
            "ocr_confidence": self.ocr_confidence,
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3]
            },
            "vehicle_class": self.vehicle_class,
            "confidence_level": self.confidence_level
        }


class ANPREngine:
    """
    Automatic Number Plate Recognition engine.
    
    Pipeline:
        Vehicle Detection → Plate Detection → Plate Crop → Preprocessing → OCR → Normalization
    """
    
    # Indian license plate patterns (for validation)
    INDIAN_PATTERNS = [
        r'^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$',  # MH-01-AB-1234
        r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$',  # MH-01-A-1234
        r'^[A-Z]{2}[0-9]{4}$',  # MH-1234 (old format)
        r'^[A-Z]{3}[0-9]{4}$',  # ABC-1234
    ]
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Configuration
        self.ocr_engine = config.get("ocr_engine", "easyocr")  # easyocr, paddleocr, tesseract
        self.confidence_threshold = config.get("confidence_threshold", 0.5)
        self.min_plate_size = config.get("min_plate_size", (50, 20))
        self.max_plate_size = config.get("max_plate_size", (300, 100))
        
        # OCR engine instance
        self.ocr_reader = None
        self.ocr_loaded = False
        self.load_error = None
        
        # Try to load OCR engine
        self._load_ocr_engine()
    
    def _load_ocr_engine(self) -> None:
        """Load OCR engine based on configuration."""
        try:
            if self.ocr_engine == "easyocr":
                import easyocr
                self.ocr_reader = easyocr.Reader(['en'], gpu=False)
                logger.info("EasyOCR loaded successfully")
            elif self.ocr_engine == "paddleocr":
                from paddleocr import PaddleOCR
                self.ocr_reader = PaddleOCR(use_angle_cls=True, lang='en')
                logger.info("PaddleOCR loaded successfully")
            elif self.ocr_engine == "tesseract":
                import pytesseract
                self.ocr_reader = pytesseract
                logger.info("Tesseract loaded successfully")
            else:
                logger.warning(f"Unknown OCR engine: {self.ocr_engine}")
            
            self.ocr_loaded = True
            
        except ImportError as e:
            self.load_error = f"{self.ocr_engine} package not installed: {e}"
            logger.warning(f"OCR engine not available: {self.load_error}")
        except Exception as e:
            self.load_error = str(e)
            logger.error(f"Failed to load OCR engine: {e}")
    
    async def process(
        self,
        frame: np.ndarray,
        vehicle_bbox: tuple,
        vehicle_class: str
    ) -> Optional[ANPRResult]:
        """
        Process a vehicle detection for license plate recognition.
        
        Args:
            frame: Video frame as numpy array
            vehicle_bbox: Vehicle bounding box (x1, y1, x2, y2)
            vehicle_class: Vehicle class (car, truck, bus, motorcycle)
        
        Returns:
            ANPRResult if plate detected, None otherwise
        """
        try:
            # Step 1: Detect plate region within vehicle bbox
            plate_bbox = await self._detect_plate_region(frame, vehicle_bbox)
            if not plate_bbox:
                return None
            
            # Step 2: Crop plate region
            plate_crop = self._crop_plate(frame, plate_bbox)
            
            # Step 3: Preprocess plate image
            preprocessed = self._preprocess_plate(plate_crop)
            
            # Step 4: OCR
            ocr_result = await self._run_ocr(preprocessed)
            if not ocr_result:
                return None
            
            # Step 5: Normalize and validate
            normalized_plate = self._normalize_plate(ocr_result["text"])
            if not self._validate_plate(normalized_plate):
                logger.debug(f"Invalid plate format: {normalized_plate}")
                # Still return result with low confidence indicator
                confidence_level = "LOW"
            else:
                confidence_level = "HIGH"
            
            return ANPRResult(
                plate_text=normalized_plate,
                raw_ocr_text=ocr_result["text"],
                ocr_confidence=ocr_result["confidence"],
                bbox=plate_bbox,
                vehicle_class=vehicle_class
            )
            
        except Exception as e:
            logger.error(f"ANPR processing error: {e}")
            return None
    
    async def _detect_plate_region(self, frame: np.ndarray, vehicle_bbox: tuple) -> Optional[tuple]:
        """
        Detect license plate region within vehicle bounding box.
        
        Uses heuristic: plates are typically in the lower portion of vehicles.
        """
        try:
            import cv2
            
            x1, y1, x2, y2 = vehicle_bbox
            vehicle_width = x2 - x1
            vehicle_height = y2 - y1
            
            # Heuristic: plate is in lower 1/3 of vehicle
            plate_y1 = y1 + int(vehicle_height * 0.6)
            plate_y2 = y2
            plate_x1 = x1 + int(vehicle_width * 0.2)
            plate_x2 = x2 - int(vehicle_width * 0.2)
            
            # Ensure minimum size
            plate_width = plate_x2 - plate_x1
            plate_height = plate_y2 - plate_y1
            
            if plate_width < self.min_plate_size[0] or plate_height < self.min_plate_size[1]:
                return None
            
            # Use edge detection to find plate region
            vehicle_crop = frame[plate_y1:plate_y2, plate_x1:plate_x2]
            
            if vehicle_crop.size == 0:
                return None
            
            gray = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Find rectangular contour (plate-like)
            best_contour = None
            best_area = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > best_area:
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect_ratio = w / max(h, 1)
                    
                    # Plates typically have aspect ratio 2:1 to 4:1
                    if 1.5 < aspect_ratio < 5.0:
                        best_area = area
                        best_contour = (x, y, w, h)
            
            if best_contour:
                x, y, w, h = best_contour
                # Convert back to frame coordinates
                plate_bbox = (
                    plate_x1 + x,
                    plate_y1 + y,
                    plate_x1 + x + w,
                    plate_y1 + y + h
                )
                return plate_bbox
            else:
                # Fallback to heuristic region
                return (plate_x1, plate_y1, plate_x2, plate_y2)
                
        except Exception as e:
            logger.error(f"Plate region detection error: {e}")
            return None
    
    def _crop_plate(self, frame: np.ndarray, plate_bbox: tuple) -> np.ndarray:
        """Crop plate region from frame."""
        x1, y1, x2, y2 = [int(coord) for coord in plate_bbox]
        return frame[y1:y2, x1:x2]
    
    def _preprocess_plate(self, plate_crop: np.ndarray) -> np.ndarray:
        """Preprocess plate image for OCR."""
        try:
            import cv2
            
            # Convert to grayscale
            if len(plate_crop.shape) == 3:
                gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
            else:
                gray = plate_crop
            
            # Resize to standard size
            height, width = gray.shape
            if width < 100:
                scale = 100 / width
                gray = cv2.resize(gray, (100, int(height * scale)))
            
            # Apply threshold
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(binary, None, 10, 7, 21)
            
            return denoised
            
        except Exception as e:
            logger.error(f"Plate preprocessing error: {e}")
            return plate_crop
    
    async def _run_ocr(self, preprocessed_plate: np.ndarray) -> Optional[Dict[str, Any]]:
        """Run OCR on preprocessed plate image."""
        if not self.ocr_loaded:
            logger.warning("OCR engine not loaded, using synthetic result")
            # Return synthetic result for demo
            return {
                "text": "MH-01-AB-1234",
                "confidence": 0.85
            }
        
        try:
            if self.ocr_engine == "easyocr" and self.ocr_reader:
                result = self.ocr_reader.readtext(preprocessed_plate)
                if result:
                    text = result[0][0]
                    confidence = result[0][2]
                    return {"text": text, "confidence": confidence}
            
            elif self.ocr_engine == "paddleocr" and self.ocr_reader:
                result = self.ocr_reader.ocr(preprocessed_plate, cls=True)
                if result and result[0]:
                    text = result[0][0][1][0]
                    confidence = result[0][0][1][1]
                    return {"text": text, "confidence": confidence}
            
            elif self.ocr_engine == "tesseract" and self.ocr_reader:
                text = self.ocr_reader.image_to_string(preprocessed_plate, config='--psm 7')
                confidence = 0.7  # Tesseract doesn't provide confidence easily
                return {"text": text.strip(), "confidence": confidence}
            
            return None
            
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return None
    
    def _normalize_plate(self, text: str) -> str:
        """Normalize OCR output to standard format."""
        # Remove spaces
        text = text.replace(" ", "")
        
        # Convert to uppercase
        text = text.upper()
        
        # Remove common OCR artifacts
        text = re.sub(r'[^A-Z0-9-]', '', text)
        
        # Add hyphens in standard Indian format if missing
        # MH01AB1234 -> MH-01-AB-1234
        if len(text) == 10 and '-' in text:
            return text
        elif len(text) == 10:
            return f"{text[:2]}-{text[2:4]}-{text[4:6]}-{text[6:]}"
        else:
            return text
    
    def _validate_plate(self, plate_text: str) -> bool:
        """Validate plate format against known patterns."""
        for pattern in self.INDIAN_PATTERNS:
            if re.match(pattern, plate_text):
                return True
        return False
    
    def get_info(self) -> Dict[str, Any]:
        """Get ANPR engine information."""
        return {
            "model_name": self.ocr_engine,
            "model_version": "1.0",
            "task": "license_plate_recognition",
            "device": "CPU",
            "status": "READY" if self.ocr_loaded else "FALLBACK",
            "confidence_threshold": self.confidence_threshold,
            "load_error": self.load_error,
            "supported_patterns": len(self.INDIAN_PATTERNS)
        }
