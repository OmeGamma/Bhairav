import os
import uuid
from typing import Optional

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
DOCUMENTS_DIR = os.path.join(UPLOAD_DIR, "documents")
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

async def save_upload_file(upload_file) -> str:
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(upload_file.filename or "")[1]
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(DOCUMENTS_DIR, filename)
    with open(file_path, "wb") as buffer:
        content = await upload_file.read()
        buffer.write(content)
    return filename

def extract_text_from_file(file_path: str) -> Optional[str]:
    if not os.path.isabs(file_path):
        file_path = os.path.join(DOCUMENTS_DIR, file_path)
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    # PDF and image extraction require additional libraries
    return None
