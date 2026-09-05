import os
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import UploadFile, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.database import get_db
from app.core.config import settings
from app.schemas.evidence import (
    EvidenceFileBase,
    EvidenceFileCreate,
    EvidenceFileUpdate,
    EvidenceFileResponse,
    EvidenceVersionBase,
    EvidenceAuditBase,
    ProcessingJobCreate,
    ProcessingJobResponse,
)
from app.schemas.entity_extraction import (
    EntityCreate,
    RelationshipCreate,
)
from app.services.storage import storage_service
from app.services.document_engine import extract_fields
from app.services.notification_service import notification_service


EVIDENCE_COLLECTION = "evidence_files"
EVIDENCE_VERSIONS_COLLECTION = "evidence_versions"
EVIDENCE_AUDIT_COLLECTION = "evidence_audit"
PROCESSING_JOBS_COLLECTION = "processing_jobs"
INGESTION_RESULTS_COLLECTION = "ingestion_results"
EXTRACTED_ENTITIES_COLLECTION = "extracted_entities"
EXTRACTED_RELATIONSHIPS_COLLECTION = "extracted_relationships"


class EvidenceService:
    def __init__(self):
        self.max_file_size_mb = getattr(settings, "MAX_FILE_SIZE_MB", 100)

    async def _record_audit(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        actor_user_id: str,
        action: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        audit = EvidenceAuditBase(
            file_id=file_id,
            actor_user_id=actor_user_id,
            action=action,
            resource_id=file_id,
            metadata=metadata or {},
        )
        audit_dict = audit.model_dump()
        audit_dict["timestamp"] = datetime.utcnow()
        await db[EVIDENCE_AUDIT_COLLECTION].insert_one(audit_dict)

    async def _create_processing_job(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        job_type: str,
        created_by: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ProcessingJobResponse:
        job = ProcessingJobCreate(
            file_id=file_id,
            job_type=job_type,
            status="QUEUED",
            created_by=created_by,
            metadata=metadata,
        )
        job_dict = job.model_dump()
        job_dict["created_at"] = datetime.utcnow()
        result = await db[PROCESSING_JOBS_COLLECTION].insert_one(job_dict)
        job_dict["_id"] = str(result.inserted_id)
        return ProcessingJobResponse(**job_dict)

    async def upload_file(
        self,
        db: AsyncIOMotorDatabase,
        file: UploadFile,
        uploaded_by: str,
        source_type: str = "OTHER",
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        case_id: Optional[str] = None,
        investigation_id: Optional[str] = None,
        classification: str = "INTERNAL",
    ) -> EvidenceFileResponse:
        storage_key, stored_filename, size_bytes, checksum = await storage_service.save_file(
            file, source_type=source_type
        )

        ext = Path(stored_filename).suffix.lower().lstrip(".")
        mime_type = file.content_type or "application/octet-stream"

        existing = await db[EVIDENCE_COLLECTION].find_one({"checksum_sha256": checksum})
        if existing:
            raise HTTPException(
                status_code=409,
                detail="A file with identical content already exists in the system",
            )

        evidence_create = EvidenceFileCreate(
            original_filename=file.filename or stored_filename,
            stored_filename=stored_filename,
            mime_type=mime_type,
            extension=ext,
            size_bytes=size_bytes,
            storage_provider="local",
            storage_key=storage_key,
            checksum_sha256=checksum,
            source_type=source_type.upper(),
            classification=classification,
            description=description,
            tags=tags or [],
            case_id=case_id,
            investigation_id=investigation_id,
            uploaded_by=uploaded_by,
        )

        evidence_dict = evidence_create.model_dump()
        evidence_dict["uploaded_at"] = datetime.utcnow()
        evidence_dict["updated_at"] = datetime.utcnow()
        evidence_dict["created_at"] = datetime.utcnow()

        result = await db[EVIDENCE_COLLECTION].insert_one(evidence_dict)
        evidence_dict["id"] = str(result.inserted_id)

        response = EvidenceFileResponse(**evidence_dict)

        await self._record_audit(
            db, response.id, uploaded_by, "FILE_UPLOADED", {"filename": response.original_filename}
        )

        await self._create_processing_job(
            db, response.id, "FILE_VALIDATION", uploaded_by, {"source_type": source_type}
        )

        if source_type.upper() in ("CDR", "FINANCIAL_RECORD", "CSV", "XLSX", "JSON"):
            await self._create_processing_job(
                db, response.id, "ENTITY_EXTRACTION", uploaded_by, {"source_type": source_type}
            )

        return response

    async def get_file(
        self, db: AsyncIOMotorDatabase, file_id: str, actor_user_id: str
    ) -> EvidenceFileResponse:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        doc = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Evidence file not found")
        doc["id"] = str(doc.pop("_id"))
        if doc.get("case_id") and not isinstance(doc["case_id"], str):
            doc["case_id"] = str(doc["case_id"])
        if doc.get("parent_file_id") and not isinstance(doc["parent_file_id"], str):
            doc["parent_file_id"] = str(doc["parent_file_id"])
        await self._record_audit(db, file_id, actor_user_id, "FILE_VIEWED")
        return EvidenceFileResponse(**doc)

    async def list_files(
        self,
        db: AsyncIOMotorDatabase,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        file_type: Optional[str] = None,
        source_type: Optional[str] = None,
        case_id: Optional[str] = None,
        processing_status: Optional[str] = None,
        classification: Optional[str] = None,
        uploaded_by: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> tuple[List[EvidenceFileResponse], int]:
        query: Dict[str, Any] = {"is_deleted": False}

        if search:
            query["$or"] = [
                {"original_filename": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [re.compile(re.escape(search), re.IGNORECASE)]}},
            ]

        if file_type:
            query["extension"] = file_type.lower()
        if source_type:
            query["source_type"] = source_type.upper()
        if case_id:
            query["case_id"] = case_id
        if processing_status:
            query["processing_status"] = processing_status.upper()
        if classification:
            query["classification"] = classification.upper()
        if uploaded_by:
            query["uploaded_by"] = uploaded_by

        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        if date_query:
            query["uploaded_at"] = date_query

        total = await db[EVIDENCE_COLLECTION].count_documents(query)
        cursor = db[EVIDENCE_COLLECTION].find(query).sort("uploaded_at", -1).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        for item in items:
            item["id"] = str(item.pop("_id"))
            if item.get("case_id") and not isinstance(item["case_id"], str):
                item["case_id"] = str(item["case_id"])
            if item.get("parent_file_id") and not isinstance(item["parent_file_id"], str):
                item["parent_file_id"] = str(item["parent_file_id"])
        return [EvidenceFileResponse(**item) for item in items], total

    async def update_file(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        update_in: EvidenceFileUpdate,
        actor_user_id: str,
    ) -> EvidenceFileResponse:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        existing = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        update_data = update_in.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No updates provided")

        # If metadata is being updated, create a new version
        metadata_fields = {"description", "tags", "case_id", "investigation_id", "classification", "processing_status", "processing_error", "processed_at"}
        if any(field in update_data for field in metadata_fields):
            await self._create_version(db, existing, actor_user_id, "Metadata updated")

        update_data["updated_at"] = datetime.utcnow()
        await db[EVIDENCE_COLLECTION].update_one({"_id": ObjectId(file_id)}, {"$set": update_data})

        doc = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        doc["id"] = str(doc.pop("_id"))
        if doc.get("case_id") and not isinstance(doc["case_id"], str):
            doc["case_id"] = str(doc["case_id"])
        if doc.get("parent_file_id") and not isinstance(doc["parent_file_id"], str):
            doc["parent_file_id"] = str(doc["parent_file_id"])
        response = EvidenceFileResponse(**doc)

        await self._record_audit(
            db, file_id, actor_user_id, "FILE_UPDATED", {"updated_fields": list(update_data.keys())}
        )
        return response

    async def delete_file(
        self, db: AsyncIOMotorDatabase, file_id: str, actor_user_id: str
    ) -> bool:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        existing = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        await db[EVIDENCE_COLLECTION].update_one(
            {"_id": ObjectId(file_id)}, {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
        )
        await self._record_audit(db, file_id, actor_user_id, "FILE_DELETED")
        return True

    async def restore_file(
        self, db: AsyncIOMotorDatabase, file_id: str, actor_user_id: str
    ) -> EvidenceFileResponse:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        existing = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        await db[EVIDENCE_COLLECTION].update_one(
            {"_id": ObjectId(file_id)}, {"$set": {"is_deleted": False, "updated_at": datetime.utcnow()}}
        )
        await self._record_audit(db, file_id, actor_user_id, "FILE_RESTORED")
        return await self.get_file(db, file_id, actor_user_id)

    async def link_case(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        case_id: str,
        actor_user_id: str,
    ) -> EvidenceFileResponse:
        if not ObjectId.is_valid(file_id) or not ObjectId.is_valid(case_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        existing = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        case = await db.cases.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        await db[EVIDENCE_COLLECTION].update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {"case_id": case_id, "updated_at": datetime.utcnow()}},
        )

        await db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {"$addToSet": {"related_evidence": file_id}},
        )

        await self._record_audit(
            db, file_id, actor_user_id, "FILE_LINKED_TO_CASE", {"case_id": case_id}
        )
        return await self.get_file(db, file_id, actor_user_id)

    async def unlink_case(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        actor_user_id: str,
    ) -> EvidenceFileResponse:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        existing = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        old_case_id = existing.get("case_id")
        await db[EVIDENCE_COLLECTION].update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {"case_id": None, "updated_at": datetime.utcnow()}},
        )

        if old_case_id and ObjectId.is_valid(old_case_id):
            await db.cases.update_one(
                {"_id": ObjectId(old_case_id)},
                {"$pull": {"related_evidence": file_id}},
            )

        await self._record_audit(
            db, file_id, actor_user_id, "FILE_UNLINKED_FROM_CASE", {"old_case_id": old_case_id}
        )
        return await self.get_file(db, file_id, actor_user_id)

    async def _create_version(
        self,
        db: AsyncIOMotorDatabase,
        existing_doc: Dict[str, Any],
        actor_user_id: str,
        change_description: str,
    ) -> None:
        """Create a version snapshot before updating."""
        version_doc = {
            "file_id": str(existing_doc["_id"]),
            "version": existing_doc.get("version", 1) + 1,
            "stored_filename": existing_doc.get("stored_filename"),
            "storage_key": existing_doc.get("storage_key"),
            "size_bytes": existing_doc.get("size_bytes", 0),
            "checksum_sha256": existing_doc.get("checksum_sha256"),
            "uploaded_by": actor_user_id,
            "uploaded_at": datetime.utcnow(),
            "is_original": False,
            "change_description": change_description,
        }
        await db[EVIDENCE_VERSIONS_COLLECTION].insert_one(version_doc)
        await db[EVIDENCE_COLLECTION].update_one(
            {"_id": existing_doc["_id"]},
            {"$set": {"version": existing_doc.get("version", 1) + 1}}
        )
        await self._record_audit(
            db, str(existing_doc["_id"]), actor_user_id, "FILE_VERSION_CREATED",
            {"version": existing_doc.get("version", 1) + 1, "change": change_description}
        )

    async def verify_integrity(
        self, db: AsyncIOMotorDatabase, file_id: str
    ) -> Dict[str, Any]:
        """Verify stored file integrity against stored checksum."""
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        doc = await db[EVIDENCE_COLLECTION].find_one({"_id": ObjectId(file_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Evidence file not found")

        stored_checksum = doc.get("checksum_sha256")
        if not stored_checksum:
            return {"status": "UNKNOWN", "message": "No checksum stored"}

        try:
            content = storage_service.read_file(doc["storage_key"])
            calculated = hashlib.sha256(content).hexdigest()
            if calculated == stored_checksum:
                return {"status": "VALID", "stored_checksum": stored_checksum, "calculated_checksum": calculated}
            else:
                return {"status": "INTEGRITY_MISMATCH", "stored_checksum": stored_checksum, "calculated_checksum": calculated}
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

    async def get_versions(
        self, db: AsyncIOMotorDatabase, file_id: str
    ) -> List[EvidenceVersionBase]:
        cursor = db[EVIDENCE_VERSIONS_COLLECTION].find({"file_id": file_id}).sort("version", 1)
        items = await cursor.to_list(length=100)
        return [EvidenceVersionBase(**item) for item in items]

    async def get_audit(
        self, db: AsyncIOMotorDatabase, file_id: str, skip: int = 0, limit: int = 50
    ) -> List[Dict[str, Any]]:
        cursor = (
            db[EVIDENCE_AUDIT_COLLECTION]
            .find({"file_id": file_id})
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
        items = await cursor.to_list(length=limit)
        for item in items:
            item["id"] = str(item.pop("_id"))
        return items

    async def get_processing_jobs(
        self, db: AsyncIOMotorDatabase, file_id: str
    ) -> List[ProcessingJobResponse]:
        cursor = db[PROCESSING_JOBS_COLLECTION].find({"file_id": file_id}).sort("created_at", -1)
        items = await cursor.to_list(length=100)
        results = []
        for item in items:
            item["id"] = str(item.pop("_id"))
            results.append(ProcessingJobResponse(**item))
        return results

    async def get_file_content(self, storage_key: str) -> bytes:
        return storage_service.read_file(storage_key)


evidence_service = EvidenceService()
