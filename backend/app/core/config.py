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

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
