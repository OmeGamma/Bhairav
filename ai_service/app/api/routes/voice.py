from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any
from app.core.config import settings

router = APIRouter()

@router.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    """
    Mock AI Service for Speech-to-Text.
    """
    return {
        "text": "Show me the security events for Checkpoint Alpha.",
        "language": "en",
        "confidence": 0.96,
        "model_info": {
            "model": settings.stt_model,
            "processing_mode": "synthetic"
        }
    }

@router.post("/voice/synthesize")
async def synthesize_voice(payload: Dict[str, Any]):
    """
    Mock AI Service for Text-to-Speech.
    Returns a mock audio URL or base64 (mocked as status for now).
    """
    text = payload.get("text", "")
    return {
        "status": "success",
        "audio_url": "/static/mock_audio.wav",
        "model_info": {
            "model": settings.tts_model,
            "processing_mode": "synthetic"
        }
    }
