import cv2
import numpy as np
import logging
import asyncio
from typing import Optional, Tuple
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class VideoSource(ABC):
    @abstractmethod
    async def open(self) -> bool:
        """Opens the video source. Returns True if successful."""
        pass

    @abstractmethod
    async def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """Reads a frame from the source. Returns (success, frame)."""
        pass
        
    @abstractmethod
    async def close(self):
        """Closes the video source and releases resources."""
        pass

class CV2VideoSource(VideoSource):
    """Generic OpenCV-based video source for Files, Webcams, and RTSP streams."""
    def __init__(self, source_reference: str):
        self.source_reference = source_reference
        self.cap = None

    async def open(self) -> bool:
        try:
            # For webcam index, convert to int
            src = int(self.source_reference) if self.source_reference.isdigit() else self.source_reference
            
            def _open():
                # Setting apiPreference can sometimes help with RTSP on certain OS, but we leave it default for broad compatibility
                return cv2.VideoCapture(src)
                
            self.cap = await asyncio.to_thread(_open)
            return self.cap.isOpened()
        except Exception as e:
            logger.error(f"Failed to open video source {self.source_reference}: {e}")
            return False

    async def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if not self.cap or not self.cap.isOpened():
            return False, None
            
        def _read():
            return self.cap.read()
            
        ret, frame = await asyncio.to_thread(_read)
        return ret, frame
        
    async def close(self):
        if self.cap:
            def _release():
                self.cap.release()
            await asyncio.to_thread(_release)

class VideoFileSource(CV2VideoSource):
    pass
    
class RTSPSource(CV2VideoSource):
    pass
    
class WebcamSource(CV2VideoSource):
    pass

class SimulatedSource(VideoSource):
    """Fallback source that generates synthetic deterministic frames."""
    def __init__(self, camera_id: str, video_id: str = "SIM-01"):
        self.camera_id = camera_id
        self.video_id = video_id
        self.frame_index = 0
        
    async def open(self) -> bool:
        return True
        
    async def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        from app.services.video_engine import _generate_synthetic_frame
        
        # Simulate ~30 fps reading delay to prevent CPU spinning
        await asyncio.sleep(1 / 30.0)
        
        frame = _generate_synthetic_frame(self.camera_id, self.video_id, self.frame_index)
        self.frame_index += 1
        return True, frame
        
    async def close(self):
        pass
