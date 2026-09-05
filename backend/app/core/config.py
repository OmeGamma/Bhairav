from typing import List
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 5000
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "bhairav"

    # Security
    JWT_SECRET: str | None = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]

    # Storage
    STORAGE_ENDPOINT: str | None = None
    STORAGE_ACCESS_KEY: str | None = None
    STORAGE_SECRET_KEY: str | None = None
    STORAGE_BUCKET: str | None = None

    # AI Services
    AI_SERVICE_URL: str | None = None
    AI_SERVICE_API_KEY: str | None = None
    LLM_API_KEY: str | None = None

    # Web search
    SEARXNG_URL: str | None = None

    # Vector DB
    VECTOR_DB_URL: str | None = None
    VECTOR_DB_KEY: str | None = None

    # Models
    VISION_MODEL: str | None = None
    OCR_MODEL: str | None = None
    LLM_MODEL: str | None = None
    EMBEDDING_MODEL: str | None = None
    STT_MODEL: str | None = None
    TTS_MODEL: str | None = None

    # AI/ML Configuration
    AI_DETECTOR_PROVIDER: str = "yolo"
    AI_MODEL_PATH: str = "yolov8n.pt"
    AI_DEVICE: str = "auto"
    AI_CONFIDENCE_THRESHOLD: float = 0.40
    AI_NIGHT_START: str = "20:00"
    AI_NIGHT_END: str = "05:00"
    AI_DWELL_TIME_THRESHOLD: int = 30
    AI_EVENT_COOLDOWN: int = 15

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
