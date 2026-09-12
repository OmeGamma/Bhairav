from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def create_case_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "caseNumber": data.get("caseNumber"),
        "firNumber": data.get("firNumber"),
        "title": data.get("title", ""),
        "crimeType": data.get("crimeType", ""),
        "status": data.get("status", "OPEN"),
        "priority": data.get("priority", "MEDIUM"),
        "filingDate": data.get("filingDate", now.isoformat()),
        "filingTime": data.get("filingTime", now.isoformat()),
        "place": data.get("place", ""),
        "address": data.get("address", ""),
        "city": data.get("city", ""),
        "district": data.get("district", ""),
        "state": data.get("state", ""),
        "country": data.get("country", "India"),
        "policeStation": data.get("policeStation", ""),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "suspect": data.get("suspect", ""),
        "accused": data.get("accused", []),
        "victim": data.get("victim", []),
        "gender": data.get("gender", ""),
        "age": data.get("age"),
        "description": data.get("description", ""),
        "incidentDetails": data.get("incidentDetails", ""),
        "modusOperandi": data.get("modusOperandi", ""),
        "notes": data.get("notes", ""),
        "investigatingOfficer": data.get("investigatingOfficer", "Unassigned"),
        "evidenceIds": data.get("evidenceIds", []),
        "documentIds": data.get("documentIds", []),
        "videoIds": data.get("videoIds", []),
        "tags": data.get("tags", []),
        "createdAt": now,
        "updatedAt": now,
        "closedAt": None,
        "createdBy": data.get("createdBy", "Officer"),
        "updatedBy": data.get("updatedBy", "Officer"),
        "dataClassification": data.get("dataClassification", "DEMO_SYNTHETIC"),
    }

def create_notification_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "notificationId": data.get("notificationId", f"NOTIF-{int(now.timestamp())}"),
        "type": data.get("type", "INFO"),
        "title": data.get("title", ""),
        "message": data.get("message", ""),
        "caseId": data.get("caseId"),
        "isRead": data.get("isRead", False),
        "createdAt": now,
        "userId": data.get("userId", "Officer"),
    }

def create_audit_log_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "action": data.get("action", ""),
        "entityType": data.get("entityType", ""),
        "entityId": data.get("entityId", ""),
        "description": data.get("description", ""),
        "userId": data.get("userId", "Officer"),
        "timestamp": now,
        "metadata": data.get("metadata", {}),
    }

def create_report_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "reportId": data.get("reportId", f"RPT-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "reportType": data.get("reportType", "INTELLIGENCE"),
        "title": data.get("title", ""),
        "fileName": data.get("fileName", ""),
        "storagePath": data.get("storagePath", ""),
        "generatedBy": data.get("generatedBy", "Officer"),
        "generatedAt": now,
    }

def create_evidence_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "evidenceId": data.get("evidenceId", f"EVIDENCE-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "title": data.get("title", ""),
        "type": data.get("type", ""),
        "description": data.get("description", ""),
        "fileName": data.get("fileName", ""),
        "mimeType": data.get("mimeType", ""),
        "storagePath": data.get("storagePath", ""),
        "storageUrl": data.get("storageUrl", ""),
        "hash": data.get("hash", ""),
        "uploadedBy": data.get("uploadedBy", "Officer"),
        "uploadedAt": now,
    }

def create_document_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "documentId": data.get("documentId", f"DOC-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "fileName": data.get("fileName", ""),
        "mimeType": data.get("mimeType", ""),
        "storagePath": data.get("storagePath", ""),
        "storageUrl": data.get("storageUrl", ""),
        "extractedText": data.get("extractedText", ""),
        "extractedEntities": data.get("extractedEntities", {}),
        "processingStatus": data.get("processingStatus", "PENDING"),
        "uploadedBy": data.get("uploadedBy", "Officer"),
        "uploadedAt": now,
        "processedAt": data.get("processedAt"),
    }

def create_video_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "videoId": data.get("videoId", f"VIDEO-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "fileName": data.get("fileName", ""),
        "mimeType": data.get("mimeType", ""),
        "storagePath": data.get("storagePath", ""),
        "storageUrl": data.get("storageUrl", ""),
        "duration": data.get("duration"),
        "location": data.get("location", ""),
        "recordedAt": data.get("recordedAt"),
        "uploadedAt": now,
        "uploadedBy": data.get("uploadedBy", "Officer"),
        "processingStatus": data.get("processingStatus", "PENDING"),
    }

def create_video_report_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "reportId": data.get("reportId", f"VIDEOREPORT-{int(now.timestamp() * 1000)}"),
        "eventType": data.get("eventType", "PERSON_DETECTED"),
        "sourceType": data.get("sourceType", "UPLOADED_VIDEO"),
        "sourceName": data.get("sourceName", ""),
        "sourceFileId": data.get("sourceFileId"),
        "videoFileId": data.get("videoFileId"),
        "caseId": data.get("caseId"),
        "timestamp": data.get("timestamp", now.isoformat()),
        "frameNumber": data.get("frameNumber"),
        "trackId": data.get("trackId"),
        "confidence": data.get("confidence", 0.0),
        "className": data.get("className", "person"),
        "boundingBox": data.get("boundingBox"),
        "fullFrameFileId": data.get("fullFrameFileId"),
        "personCropFileId": data.get("personCropFileId"),
        "fullFrameUrl": data.get("fullFrameUrl"),
        "personCropUrl": data.get("personCropUrl"),
        "videoTimestamp": data.get("videoTimestamp"),
        "status": data.get("status", "NEW"),
        "dataClassification": data.get("dataClassification", "LIVE_VIDEO_EVENT"),
        "humanCount": data.get("humanCount"),
        "objectsDetected": data.get("objectsDetected"),
        "timeline": data.get("timeline"),
        "videoDurationSec": data.get("videoDurationSec"),
        "createdAt": now,
        "updatedAt": now,
    }

def create_person_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "personId": data.get("personId", f"PERSON-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "name": data.get("name", ""),
        "role": data.get("role", "WITNESS"),
        "aliases": data.get("aliases", []),
        "risk_score": data.get("risk_score", 0.0),
        "gender": data.get("gender", ""),
        "age": data.get("age"),
        "address": data.get("address", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "notes": data.get("notes", ""),
        "createdAt": now,
        "updatedAt": now,
    }

def create_vehicle_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "vehicleId": data.get("vehicleId", f"VEH-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "plate_number": data.get("plate_number", data.get("plateNumber", "")),
        "make_model": data.get("make_model", data.get("makeModel", "")),
        "color": data.get("color", ""),
        "type": data.get("type", ""),
        "registeredOwner": data.get("registeredOwner", ""),
        "notes": data.get("notes", ""),
        "createdAt": now,
    }

def create_organization_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "organizationId": data.get("organizationId", f"ORG-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "name": data.get("name", ""),
        "type": data.get("type", ""),
        "address": data.get("address", ""),
        "registrationNumber": data.get("registrationNumber", ""),
        "notes": data.get("notes", ""),
        "createdAt": now,
    }

def create_media_file_document(data: Dict[str, Any]) -> Dict[str, Any]:
    from datetime import timedelta
    now = datetime.utcnow()
    import os
    retention_days = int(os.getenv("MEDIA_RETENTION_DAYS", "7"))
    expires_at = now + timedelta(days=retention_days)

    return {
        "fileId": data.get("fileId", f"MEDIA-{int(now.timestamp() * 1000)}"),
        "originalName": data.get("originalName", ""),
        "mimeType": data.get("mimeType", ""),
        "resourceType": data.get("resourceType", "image"),
        "cloudinaryPublicId": data.get("cloudinaryPublicId", ""),
        "cloudinaryAssetId": data.get("cloudinaryAssetId", ""),
        "secureUrl": data.get("secureUrl", ""),
        "format": data.get("format", ""),
        "bytes": data.get("bytes", 0),
        "folder": data.get("folder", ""),
        "uploadedBy": data.get("uploadedBy", "System"),
        "caseId": data.get("caseId"),
        "videoReportId": data.get("videoReportId"),
        "eventId": data.get("eventId"),
        "createdAt": now,
        "expiresAt": expires_at,
        "dataClassification": data.get("dataClassification", "GENERAL"),
        "status": data.get("status", "ACTIVE")
    }

def create_fir_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "firId": data.get("firId", f"FIR-{int(now.timestamp())}"),
        "caseId": data.get("caseId"),
        "firNumber": data.get("firNumber", ""),
        "dateFiled": data.get("dateFiled", now.isoformat()),
        "policeStation": data.get("policeStation", ""),
        "description": data.get("description", ""),
        "createdAt": now,
    }

