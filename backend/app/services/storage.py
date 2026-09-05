import os
import hashlib
import uuid
import re
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from pathlib import Path

from app.core.config import settings


class StorageService:
    """
    Real local file storage with provider abstraction.
    Designed so S3/MinIO/cloud can be added later without changing app logic.
    """

    def __init__(self):
        self.provider = getattr(settings, "STORAGE_PROVIDER", "local")
        self.root = Path(getattr(settings, "STORAGE_ROOT", "./storage")).resolve()
        self.max_size_bytes = getattr(settings, "MAX_FILE_SIZE_MB", 100) * 1024 * 1024
        self.allowed_extensions = [
            ext.lower().strip()
            for ext in getattr(settings, "ALLOWED_EXTENSIONS", [])
            if ext.strip()
        ]
        self.allowed_mime_types = [
            m.strip()
            for m in getattr(settings, "ALLOWED_MIME_TYPES", [])
            if m.strip()
        ]

        if self.provider == "local":
            self._ensure_directories()

    def _ensure_directories(self) -> None:
        dirs = [
            self.root / "evidence" / "documents",
            self.root / "evidence" / "cdr",
            self.root / "evidence" / "financial",
            self.root / "evidence" / "images",
            self.root / "evidence" / "videos",
            self.root / "evidence" / "audio",
            self.root / "evidence" / "other",
            self.root / "reports",
            self.root / "temporary",
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)

    def _directory_for_source_type(self, source_type: str) -> Path:
        mapping = {
            "FIR": "documents",
            "POLICE_REPORT": "documents",
            "CDR": "cdr",
            "FINANCIAL_RECORD": "financial",
            "SURVEILLANCE_REPORT": "documents",
            "INTELLIGENCE_REPORT": "documents",
            "SOCIAL_MEDIA_EXPORT": "documents",
            "CRIMINAL_HISTORY": "documents",
            "VEHICLE_RECORD": "documents",
            "IDENTITY_DOCUMENT": "documents",
            "CCTV_VIDEO": "videos",
            "CCTV_SNAPSHOT": "images",
            "AUDIO": "audio",
            "IMAGE": "images",
            "OTHER": "other",
        }
        sub = mapping.get(source_type.upper(), "other")
        return self.root / "evidence" / sub

    def _sanitize_filename(self, filename: str) -> str:
        filename = os.path.basename(filename)
        filename = re.sub(r'[^A-Za-z0-9_\-\.]', '_', filename)
        if not filename or filename == '.' or filename == '..':
            filename = f"file_{uuid.uuid4().hex}"
        return filename

    def _validate_file(self, file: UploadFile) -> Tuple[int, str]:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")

        ext = Path(file.filename).suffix.lower().lstrip(".")
        if self.allowed_extensions and ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{ext}' is not allowed. Allowed: {', '.join(self.allowed_extensions)}",
            )

        if file.content_type and self.allowed_mime_types:
            if file.content_type not in self.allowed_mime_types:
                raise HTTPException(
                    status_code=400,
                    detail=f"MIME type '{file.content_type}' is not allowed.",
                )

        return ext

    async def _read_and_validate_size(self, file: UploadFile) -> bytes:
        chunks = []
        total = 0
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > self.max_size_bytes:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds maximum allowed size of {self.max_size_bytes // (1024*1024)} MB",
                )
            chunks.append(chunk)
        data = b"".join(chunks)
        await file.seek(0)
        return data

    async def save_file(
        self,
        file: UploadFile,
        source_type: str = "OTHER",
        custom_filename: Optional[str] = None,
    ) -> Tuple[str, str, int, str]:
        """
        Validates, stores, and returns (storage_key, stored_filename, size_bytes, checksum_sha256).
        """
        ext = self._validate_file(file)
        data = await self._read_and_validate_size(file)

        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Empty files are not allowed")

        checksum = hashlib.sha256(data).hexdigest()
        safe_name = self._sanitize_filename(custom_filename or file.filename or f"file_{uuid.uuid4().hex}")
        stored_filename = f"{uuid.uuid4().hex}_{safe_name}"

        directory = self._directory_for_source_type(source_type)
        storage_key = str(directory / stored_filename)

        if self.provider == "local":
            path = Path(storage_key)
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, "wb") as f:
                f.write(data)

        return storage_key, stored_filename, len(data), checksum

    def get_file_path(self, storage_key: str) -> Path:
        if self.provider == "local":
            path = Path(storage_key)
            if not path.is_absolute():
                path = Path.cwd() / path
            return path.resolve()
        raise HTTPException(status_code=501, detail="Storage provider not implemented")

    def read_file(self, storage_key: str) -> bytes:
        path = self.get_file_path(storage_key)
        if not path.exists():
            raise HTTPException(status_code=404, detail="File not found in storage")
        with open(path, "rb") as f:
            return f.read()

    def delete_file(self, storage_key: str) -> bool:
        try:
            path = self.get_file_path(storage_key)
            if path.exists():
                path.unlink()
            return True
        except Exception:
            return False

    def generate_download_url(self, storage_key: str) -> str:
        return f"/api/v1/files/download?storage_key={storage_key}"


storage_service = StorageService()
