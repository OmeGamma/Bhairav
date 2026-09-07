import os
import uuid
from typing import Optional

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file) -> str:
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(upload_file.filename or "")[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(file_path, "wb") as buffer:
        content = await upload_file.read()
        buffer.write(content)
    return file_path

def extract_text_from_file(file_path: str) -> Optional[str]:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    # PDF and image extraction require additional libraries
    return None
