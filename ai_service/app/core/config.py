from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    environment: str = "development"
    port: int = 8000
    ai_service_url: str = "http://localhost:8000"

    vision_model: str = "yolov8n.pt"
    ocr_model: str = "paddleocr-en"
    llm_model: str = "qwen1.5-0.5b"
    embedding_model: str = "all-MiniLM-L6-v2"
    stt_model: str = "whisper-tiny"
    tts_model: str = "tts-en"

    vector_db_url: str = "http://localhost:6333"
    vector_db_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
