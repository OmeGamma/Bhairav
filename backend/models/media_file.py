from typing import Dict, Any, List, Optional
from . import serialize_doc, create_media_file_document

def get_media_files_collection():
    from config.database import get_collection
    return get_collection("media_files")

def create_media_file(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_media_file_document(data)
    collection = get_media_files_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_media_file(file_id: str) -> Optional[Dict[str, Any]]:
    collection = get_media_files_collection()
    doc = collection.find_one({"fileId": file_id})
    return serialize_doc(doc) if doc else None

def get_expired_active_media_files(current_time) -> List[Dict[str, Any]]:
    collection = get_media_files_collection()
    cursor = collection.find({
        "expiresAt": {"$lt": current_time},
        "status": {"$ne": "DELETED"}
    })
    return [serialize_doc(doc) for doc in cursor]

def update_media_file_status(file_id: str, new_status: str) -> bool:
    collection = get_media_files_collection()
    result = collection.update_one(
        {"fileId": file_id},
        {"$set": {"status": new_status}}
    )
    return result.modified_count > 0
