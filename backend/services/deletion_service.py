import os
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from config.database import get_collection, db
from services.cloudinary_service import delete_resource, init_cloudinary

logger = logging.getLogger(__name__)

DELETE_ENABLED = os.getenv("ENABLE_PERMANENT_DELETE", "false").lower() == "true"
DEMO_ROLE = os.getenv("DEMO_AUTH_ROLE", "Officer")
JWT_SECRET = os.getenv("JWT_SECRET", "bhairav_secret_demo_key")

def is_delete_enabled() -> bool:
    return DELETE_ENABLED

def authorize_deletion(user_role: Optional[str], auth_token: Optional[str] = None) -> Tuple[bool, str]:
    if not DELETE_ENABLED:
        return False, "Permanent deletion is disabled. Set ENABLE_PERMANENT_DELETE=true to enable."
    
    if not user_role or user_role != DEMO_ROLE:
        return False, f"Authorization failed: requires role '{DEMO_ROLE}'"
    
    if auth_token:
        try:
            from jose import jwt, JWTError
            payload = jwt.decode(auth_token, JWT_SECRET, algorithms=["HS256"])
            token_role = payload.get("role") or payload.get("user_role")
            if token_role and token_role != DEMO_ROLE:
                return False, f"Token role '{token_role}' does not match required role '{DEMO_ROLE}'"
        except JWTError:
            pass
    
    return True, "Authorized"

def count_case_owned_records(case_number: str) -> Dict[str, int]:
    counts = {
        "reports": 0,
        "video_reports": 0,
        "media_files": 0,
        "evidence": 0,
        "documents": 0,
        "videos": 0,
        "persons": 0,
        "firs": 0,
        "notifications": 0,
    }
    
    counts["reports"] = db.reports.count_documents({"caseId": case_number})
    counts["video_reports"] = db.video_reports.count_documents({"caseId": case_number})
    counts["media_files"] = db.media_files.count_documents({"caseId": case_number})
    counts["evidence"] = db.evidence.count_documents({"caseId": case_number})
    counts["documents"] = db.documents.count_documents({"caseId": case_number})
    counts["videos"] = db.videos.count_documents({"caseId": case_number})
    counts["persons"] = db.persons.count_documents({"caseId": case_number})
    counts["firs"] = db.firs.count_documents({"caseId": case_number})
    counts["notifications"] = db.notifications.count_documents({"caseId": case_number})
    
    return counts

def delete_case_owned_records(case_number: str) -> Dict[str, int]:
    deleted_counts = {}
    
    deleted_counts["reports"] = db.reports.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["video_reports"] = db.video_reports.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["evidence"] = db.evidence.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["documents"] = db.documents.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["videos"] = db.videos.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["persons"] = db.persons.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["firs"] = db.firs.delete_many({"caseId": case_number}).deleted_count
    deleted_counts["notifications"] = db.notifications.delete_many({"caseId": case_number}).deleted_count
    
    return deleted_counts

def cleanup_media_files_for_case(case_number: str) -> Dict[str, Any]:
    result = {
        "local_deleted": 0,
        "cloudinary_deleted": 0,
        "cloudinary_skipped_shared": 0,
        "errors": []
    }
    
    media_files = list(db.media_files.find({"caseId": case_number}))
    
    if not init_cloudinary():
        logger.warning("Cloudinary not configured, skipping Cloudinary cleanup")
    
    for media_file in media_files:
        file_id = media_file.get("fileId")
        public_id = media_file.get("cloudinaryPublicId")
        resource_type = media_file.get("resourceType", "image")
        
        if public_id:
            ref_count = count_media_references(public_id, exclude_case=case_number)
            if ref_count == 0:
                try:
                    if delete_resource(public_id, resource_type=resource_type):
                        result["cloudinary_deleted"] += 1
                    else:
                        result["errors"].append(f"Failed to delete Cloudinary asset: {public_id}")
                except Exception as e:
                    result["errors"].append(f"Cloudinary delete error for {public_id}: {str(e)}")
            else:
                result["cloudinary_skipped_shared"] += 1
        
        db.media_files.delete_one({"fileId": file_id})
        result["local_deleted"] += 1
    
    return result

def count_media_references(public_id: str, exclude_case: Optional[str] = None) -> int:
    query = {"cloudinaryPublicId": public_id}
    if exclude_case:
        query["caseId"] = {"$ne": exclude_case}
    return db.media_files.count_documents(query)

def cleanup_video_report_media(video_report_id: str) -> Dict[str, Any]:
    result = {
        "local_deleted": 0,
        "cloudinary_deleted": 0,
        "cloudinary_skipped_shared": 0,
        "errors": []
    }
    
    video_report = db.video_reports.find_one({"reportId": video_report_id})
    if not video_report:
        return result
    
    file_ids = [
        video_report.get("fullFrameFileId"),
        video_report.get("personCropFileId"),
        video_report.get("sourceFileId"),
        video_report.get("videoFileId"),
    ]
    
    if not init_cloudinary():
        logger.warning("Cloudinary not configured, skipping Cloudinary cleanup")
    
    for file_id in file_ids:
        if not file_id:
            continue
        media_file = db.media_files.find_one({"fileId": file_id})
        if not media_file:
            continue
        
        public_id = media_file.get("cloudinaryPublicId")
        resource_type = media_file.get("resourceType", "image")
        
        if public_id:
            ref_count = count_media_references(public_id, exclude_case=video_report.get("caseId"))
            if ref_count == 0:
                try:
                    if delete_resource(public_id, resource_type=resource_type):
                        result["cloudinary_deleted"] += 1
                    else:
                        result["errors"].append(f"Failed to delete Cloudinary asset: {public_id}")
                except Exception as e:
                    result["errors"].append(f"Cloudinary delete error for {public_id}: {str(e)}")
            else:
                result["cloudinary_skipped_shared"] += 1
        
        db.media_files.delete_one({"fileId": file_id})
        result["local_deleted"] += 1
    
    return result

def create_audit_entry(action: str, entity_type: str, entity_id: str, user_id: str, description: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    from models import create_audit_log_document
    from config.database import get_collection
    
    doc = create_audit_log_document({
        "action": action,
        "entityType": entity_type,
        "entityId": entity_id,
        "description": description,
        "userId": user_id,
        "metadata": metadata or {}
    })
    collection = get_collection("auditLogs")
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def permanent_delete_case(case_number: str, user_role: Optional[str], auth_token: Optional[str] = None) -> Dict[str, Any]:
    authorized, auth_msg = authorize_deletion(user_role, auth_token)
    if not authorized:
        return {"success": False, "error": auth_msg}
    
    case = db.cases.find_one({"caseNumber": case_number})
    if not case:
        return {"success": False, "error": f"Case {case_number} not found"}
    
    if case.get("deletedAt"):
        return {"success": False, "error": f"Case {case_number} is already soft-deleted. Use purge for permanent removal."}
    
    owned_counts = count_case_owned_records(case_number)
    
    deleted_counts = delete_case_owned_records(case_number)
    
    media_cleanup = cleanup_media_files_for_case(case_number)
    
    case_deleted = db.cases.delete_one({"caseNumber": case_number}).deleted_count
    
    audit_metadata = {
        "owned_counts_before": owned_counts,
        "deleted_counts": deleted_counts,
        "media_cleanup": media_cleanup,
        "case_deleted": case_deleted
    }
    create_audit_entry(
        action="PERMANENT_DELETE_CASE",
        entityType="case",
        entityId=case_number,
        user_id=user_role or DEMO_ROLE,
        description=f"Permanently deleted case {case_number} and all owned records",
        metadata=audit_metadata
    )
    
    return {
        "success": True,
        "case_number": case_number,
        "owned_counts": owned_counts,
        "deleted_counts": deleted_counts,
        "media_cleanup": media_cleanup,
        "case_deleted": case_deleted,
        "audit_metadata": audit_metadata
    }

def permanent_delete_video_report(report_id: str, user_role: Optional[str], auth_token: Optional[str] = None) -> Dict[str, Any]:
    authorized, auth_msg = authorize_deletion(user_role, auth_token)
    if not authorized:
        return {"success": False, "error": auth_msg}
    
    video_report = db.video_reports.find_one({"reportId": report_id})
    if not video_report:
        video_report = db.video_reports.find_one({"_id": report_id})
    if not video_report:
        return {"success": False, "error": f"Video report {report_id} not found"}
    
    media_cleanup = cleanup_video_report_media(report_id)
    
    report_deleted = db.video_reports.delete_one({"reportId": report_id}).deleted_count
    if report_deleted == 0:
        report_deleted = db.video_reports.delete_one({"_id": report_id}).deleted_count
    
    audit_metadata = {
        "media_cleanup": media_cleanup,
        "report_deleted": report_deleted,
        "case_id": video_report.get("caseId")
    }
    create_audit_entry(
        action="PERMANENT_DELETE_VIDEO_REPORT",
        entityType="video_report",
        entityId=report_id,
        user_id=user_role or DEMO_ROLE,
        description=f"Permanently deleted video report {report_id}",
        metadata=audit_metadata
    )
    
    return {
        "success": True,
        "report_id": report_id,
        "media_cleanup": media_cleanup,
        "report_deleted": report_deleted,
        "audit_metadata": audit_metadata
    }

def permanent_delete_report(report_id: str, user_role: Optional[str], auth_token: Optional[str] = None) -> Dict[str, Any]:
    authorized, auth_msg = authorize_deletion(user_role, auth_token)
    if not authorized:
        return {"success": False, "error": auth_msg}
    
    report = db.reports.find_one({"reportId": report_id})
    if not report:
        return {"success": False, "error": f"Report {report_id} not found"}
    
    case_id = report.get("caseId")
    
    media_file = None
    if report.get("storagePath"):
        media_file = db.media_files.find_one({"cloudinaryPublicId": report.get("storagePath")})
    
    media_cleanup = {"local_deleted": 0, "cloudinary_deleted": 0, "cloudinary_skipped_shared": 0, "errors": []}
    if media_file:
        file_id = media_file.get("fileId")
        public_id = media_file.get("cloudinaryPublicId")
        resource_type = media_file.get("resourceType", "image")
        
        if public_id:
            ref_count = count_media_references(public_id, exclude_case=case_id)
            if ref_count == 0:
                if init_cloudinary():
                    try:
                        if delete_resource(public_id, resource_type=resource_type):
                            media_cleanup["cloudinary_deleted"] += 1
                    except Exception as e:
                        media_cleanup["errors"].append(f"Cloudinary delete error: {str(e)}")
            else:
                media_cleanup["cloudinary_skipped_shared"] += 1
        
        db.media_files.delete_one({"fileId": file_id})
        media_cleanup["local_deleted"] += 1
    
    report_deleted = db.reports.delete_one({"reportId": report_id}).deleted_count
    
    audit_metadata = {
        "media_cleanup": media_cleanup,
        "report_deleted": report_deleted,
        "case_id": case_id
    }
    create_audit_entry(
        action="PERMANENT_DELETE_REPORT",
        entityType="report",
        entityId=report_id,
        user_id=user_role or DEMO_ROLE,
        description=f"Permanently deleted report {report_id}",
        metadata=audit_metadata
    )
    
    return {
        "success": True,
        "report_id": report_id,
        "media_cleanup": media_cleanup,
        "report_deleted": report_deleted,
        "audit_metadata": audit_metadata
    }