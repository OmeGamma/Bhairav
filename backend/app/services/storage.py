import os
from typing import Optional
from fastapi import UploadFile

class StorageService:
    """
    Abstract interface for object storage (e.g., AWS S3, MinIO).
    """
    def __init__(self):
        self.provider = os.getenv("STORAGE_PROVIDER", "local")
        self.bucket_name = os.getenv("STORAGE_BUCKET", "bhairav-data")

    async def upload_file(self, file: UploadFile, directory: str = "") -> str:
        """
        Uploads a file and returns a reference path/URL.
        """
        # Mock implementation
        file_path = f"{directory}/{file.filename}"
        return f"s3://{self.bucket_name}/{file_path}"

    async def get_download_url(self, file_reference: str, expires_in: int = 3600) -> Optional[str]:
        """
        Generates a pre-signed URL for downloading.
        """
        # Mock implementation
        return f"https://storage.bhairav.local/{file_reference}?token=mock"

    async def delete_file(self, file_reference: str) -> bool:
        """
        Deletes a file from storage.
        """
        return True

storage_service = StorageService()
