import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional, Union

def init_cloudinary():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        return True
    return False

def upload_image(file_data: Union[bytes, str], public_id: Optional[str] = None, folder: str = "bhairav/images") -> Optional[Dict[str, Any]]:
    try:
        response = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            folder=folder,
            resource_type="image"
        )
        return response
    except Exception as e:
        print(f"Cloudinary image upload error: {e}")
        return None

def upload_video(file_data: Union[bytes, str], public_id: Optional[str] = None, folder: str = "bhairav/videos") -> Optional[Dict[str, Any]]:
    try:
        response = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            folder=folder,
            resource_type="video"
        )
        return response
    except Exception as e:
        print(f"Cloudinary video upload error: {e}")
        return None

def upload_raw(file_data: Union[bytes, str], public_id: Optional[str] = None, folder: str = "bhairav/documents") -> Optional[Dict[str, Any]]:
    try:
        response = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            folder=folder,
            resource_type="raw"
        )
        return response
    except Exception as e:
        print(f"Cloudinary raw upload error: {e}")
        return None

def delete_resource(public_id: str, resource_type: str = "image") -> bool:
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False

def generate_secure_url(public_id: str, resource_type: str = "image") -> str:
    url, options = cloudinary.utils.cloudinary_url(public_id, resource_type=resource_type, secure=True)
    return url

def get_system_status() -> bool:
    try:
        if not os.getenv("CLOUDINARY_CLOUD_NAME"):
            return False
        # A quick ping check or relying on config
        return True
    except:
        return False
