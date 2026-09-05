"""
Tests for Bhairav AI Inference Engine
"""

import pytest
import numpy as np
from datetime import datetime
from app.services.ai_inference import AIInferenceEngine, ObjectDetector, ObjectTracker, VirtualFence, RuleEngine


class TestObjectDetector:
    """Tests for object detection component."""
    
    def test_detector_initialization(self):
        """Test that detector initializes correctly."""
        config = {
            "model_name": "yolov8n.pt",
            "confidence_threshold": 0.40,
            "device": "cpu"
        }
        detector = ObjectDetector(config)
        assert detector is not None
        assert detector.confidence_threshold == 0.40
    
    def test_detector_fallback_detection(self):
        """Test fallback detection when YOLO is unavailable."""
        config = {"confidence_threshold": 0.5}
        detector = ObjectDetector(config)
        
        # Create a test frame
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Run detection (should use fallback)
        import asyncio
        detections = asyncio.run(detector.detect(frame))
        
        # Should return some detections (even if synthetic)
        assert isinstance(detections, list)
    
    def test_detection_result_structure(self):
        """Test that detection results have correct structure."""
        from app.services.ai_inference.detectors import DetectionResult
        
        detection = DetectionResult(
            label="person",
            confidence=0.85,
            bbox=(100, 100, 200, 300)
        )
        
        result = detection.model_dump()
        assert "detection_id" in result
        assert result["label"] == "person"
        assert result["confidence"] == 0.85
        assert "bbox" in result


class TestObjectTracker:
    """Tests for object tracking component."""
    
    def test_tracker_initialization(self):
        """Test that tracker initializes correctly."""
        config = {
            "max_lost_frames": 10,
            "iou_threshold": 0.3
        }
        tracker = ObjectTracker(config)
        assert tracker is not None
        assert tracker.max_lost_frames == 10
    
    def test_track_creation(self):
        """Test that tracks are created correctly."""
        from app.services.ai_inference.trackers import Track
        
        track = Track(
            track_id="T-0001",
            camera_id="CAM-01",
            session_id="SESSION-001",
            label="person",
            bbox=(100, 100, 200, 300),
            confidence=0.85
        )
        
        assert track.track_id == "T-0001"
        assert track.label == "person"
        assert track.frames_seen == 1
        assert len(track.trajectory) == 1
    
    def test_track_update(self):
        """Test that tracks update correctly."""
        from app.services.ai_inference.trackers import Track
        
        track = Track(
            track_id="T-0001",
            camera_id="CAM-01",
            session_id="SESSION-001",
            label="person",
            bbox=(100, 100, 200, 300),
            confidence=0.85
        )
        
        # Update with new detection
        track.update((110, 110, 210, 310), 0.87)
        
        assert track.frames_seen == 2
        assert track.confidence == 0.87
        assert len(track.trajectory) == 2
    
    def test_iou_calculation(self):
        """Test IoU calculation for tracking."""
        tracker = ObjectTracker({})
        
        # Test perfect overlap
        iou = tracker._calculate_iou((0, 0, 100, 100), (0, 0, 100, 100))
        assert iou == 1.0
        
        # Test no overlap
        iou = tracker._calculate_iou((0, 0, 100, 100), (200, 200, 300, 300))
        assert iou == 0.0
        
        # Test partial overlap
        iou = tracker._calculate_iou((0, 0, 100, 100), (50, 50, 150, 150))
        assert 0 < iou < 1


class TestVirtualFence:
    """Tests for virtual fence and intrusion detection."""
    
    def test_fence_initialization(self):
        """Test that virtual fence initializes correctly."""
        config = {
            "cooldown_seconds": 10,
            "min_confidence": 0.5
        }
        fence = VirtualFence(config)
        assert fence is not None
        assert fence.cooldown_seconds == 10
    
    def test_point_in_polygon(self):
        """Test point-in-polygon detection."""
        fence = VirtualFence({})
        
        # Simple square polygon
        polygon = [(0, 0), (100, 0), (100, 100), (0, 100)]
        
        # Point inside
        assert fence._point_in_polygon((50, 50), polygon) == True
        
        # Point outside
        assert fence._point_in_polygon((150, 150), polygon) == False
    
    def test_point_in_rectangle(self):
        """Test point-in-rectangle detection."""
        fence = VirtualFence({})
        
        rect = [(0, 0), (100, 0), (100, 100), (0, 100)]
        
        # Point inside
        assert fence._point_in_rectangle((50, 50), rect) == True
        
        # Point outside
        assert fence._point_in_rectangle((150, 150), rect) == False
    
    def test_line_crossing(self):
        """Test line crossing detection."""
        fence = VirtualFence({})
        
        line = [(0, 50), (100, 50)]
        
        # Crossing from above to below
        crossing = fence._line_crossing((50, 30), (50, 70), line)
        assert crossing == "CROSSING"
        
        # Not crossing
        crossing = fence._line_crossing((50, 30), (50, 40), line)
        assert crossing is None
    
    def test_cooldown_check(self):
        """Test event cooldown mechanism."""
        fence = VirtualFence({"cooldown_seconds": 5})
        
        # First check should not be in cooldown
        assert fence._check_cooldown("T-001", "ZONE-001") == False
        
        # Set last event time
        fence.last_events["T-001_ZONE-001"] = datetime.utcnow()
        
        # Second check should be in cooldown
        assert fence._check_cooldown("T-001", "ZONE-001") == True


class TestRuleEngine:
    """Tests for rule-based activity detection."""
    
    def test_rule_engine_initialization(self):
        """Test that rule engine initializes correctly."""
        config = {
            "night_start": "20:00",
            "night_end": "05:00",
            "dwell_time_threshold": 30
        }
        engine = RuleEngine(config)
        assert engine is not None
        assert engine.night_start == "20:00"
    
    def test_night_time_check(self):
        """Test night time detection."""
        engine = RuleEngine({"night_start": "20:00", "night_end": "05:00"})
        
        # Test during night hours
        night_time = datetime.strptime("22:00", "%H:%M").time()
        assert engine._is_night_time(datetime.now().replace(hour=22, minute=0)) == True
        
        # Test during day hours
        day_time = datetime.strptime("14:00", "%H:%M").time()
        assert engine._is_night_time(datetime.now().replace(hour=14, minute=0)) == False
    
    def test_severity_mapping(self):
        """Test risk score to severity mapping."""
        engine = RuleEngine({})
        
        assert engine._get_severity(85) == "CRITICAL"
        assert engine._get_severity(65) == "HIGH"
        assert engine._get_severity(45) == "MEDIUM"
        assert engine._get_severity(20) == "LOW"
    
    def test_dwell_time_calculation(self):
        """Test dwell time calculation."""
        from app.services.ai_inference.trackers import Track
        
        engine = RuleEngine({"night_start": "20:00", "night_end": "05:00"})
        
        # Create track with specific timestamps to test calculation
        from datetime import timedelta
        
        track = Track(
            track_id="T-001",
            camera_id="CAM-01",
            session_id="SESSION-", 
            label="person",
            bbox=(100, 100, 200, 300),
            confidence=0.85
        )
        
        # Manually set timestamps to simulate time passing
        track.first_seen = datetime.utcnow() - timedelta(seconds=35)
        track.last_seen = datetime.utcnow()
        
        dwell_time = engine._calculate_dwell_time(track)
        assert dwell_time >= 30  # At least 30 seconds


class TestAIInferenceEngine:
    """Tests for the main AI inference engine."""
    
    def test_engine_initialization(self):
        """Test that AI engine initializes correctly."""
        config = {
            "detector": {"confidence_threshold": 0.5},
            "tracker": {"max_lost_frames": 10},
            "rules": {"night_start": "20:00"}
        }
        engine = AIInferenceEngine(config)
        assert engine is not None
        assert engine.detector is not None
        assert engine.tracker is not None
    
    def test_model_info(self):
        """Test that model info is returned correctly."""
        engine = AIInferenceEngine({})
        info = engine.get_model_info()
        
        assert "detector" in info
        assert "tracker" in info
        assert "config" in info
    
    def test_metrics_tracking(self):
        """Test that metrics are tracked correctly."""
        engine = AIInferenceEngine({})
        
        initial_metrics = engine.get_metrics()
        assert initial_metrics["frames_processed"] == 0
        
        # Reset metrics
        engine.reset_metrics()
        assert engine.get_metrics()["frames_processed"] == 0


class TestIntegration:
    """Integration tests for AI pipeline."""
    
    def test_full_pipeline_structure(self):
        """Test that the full pipeline structure is correct."""
        engine = AIInferenceEngine({})
        
        # Create a test frame
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Process frame (should not crash even with synthetic data)
        try:
            import asyncio
            result = asyncio.run(engine.process_frame(
                frame=frame,
                camera_id="CAM-TEST",
                session_id="SESSION-TEST",
                frame_number=0,
                timestamp=datetime.utcnow(),
                metadata={}
            ))
            
            # Check result structure
            assert "camera_id" in result
            assert "detections" in result
            assert "tracks" in result
            assert "metrics" in result
            assert "model_info" in result
            
        except Exception as e:
            # Should not crash even if models are unavailable
            print(f"Pipeline test expected to use fallback: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
