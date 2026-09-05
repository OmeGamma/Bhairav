"""
BHAIRAV Entity Extraction Service.

Reuses the existing document_engine for identity-document-style text extraction,
and adds broader regex-based extraction for general intelligence documents:
PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, ACCOUNT, DATE, CASE.

All extracted entities and relationships maintain provenance to their source file.
"""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.schemas.entity_extraction import (
    EntityCreate,
    EntityResponse,
    RelationshipCreate,
    RelationshipResponse,
    ENTITY_TYPES,
    RELATIONSHIP_TYPES,
)
from app.schemas.evidence import ExtractedEntityResponse, ExtractedRelationshipResponse
from app.services.document_engine import extract_fields as extract_document_fields

ENTITIES_COLLECTION = "entities"
RELATIONSHIPS_COLLECTION = "relationships"
EXTRACTED_ENTITIES_COLLECTION = "extracted_entities"
EXTRACTED_RELATIONSHIPS_COLLECTION = "extracted_relationships"


# --- Broad extraction patterns for general text ---
_PERSON_RE = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b")
_PHONE_RE = re.compile(r"\b([6-9]\d{9})\b")
_VEHICLE_RE = re.compile(r"\b([A-Z]{2}\d{2}[A-Z]{1,3}\d{1,4})\b")
_LOCATION_RE = re.compile(r"\b(Sector\s+[A-Z]|Zone\s+[A-Z]|Checkpoint\s+[A-Z]|District\s+[A-Za-z\s]+|State\s+[A-Za-z\s]+)\b", re.IGNORECASE)
_ORG_RE = re.compile(r"\b([A-Z][A-Za-z\s]+(?:Corp|Ltd|Inc|LLC|Organization|Agency|Bureau|Ministry|Department))\b", re.IGNORECASE)
_ACCOUNT_RE = re.compile(r"\b([A-Z]{2}\d{2,4}\d{7,12})\b")
_DATE_RE = re.compile(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b")
_CASE_RE = re.compile(r"\b(CASE\s+[A-Z0-9\-]+|BH-\d{4}-\d+|FIR\s+\d+\/[A-Z]+\/\d+)\b", re.IGNORECASE)


def _deduplicate(items: List[Dict[str, Any]], key: str = "canonical_name") -> List[Dict[str, Any]]:
    seen: Dict[str, Dict[str, Any]] = {}
    for item in items:
        k = item.get(key, "").strip().upper()
        if not k:
            continue
        if k not in seen or item.get("confidence", 0) > seen[k].get("confidence", 0):
            seen[k] = item
    return list(seen.values())


async def extract_entities_from_text(
    text: str,
    file_id: str,
    job_id: Optional[str] = None,
    base_confidence: float = 0.6,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Run broad regex extraction on arbitrary text and return entities + relationships."""
    text_clean = (text or "").strip()
    if not text_clean:
        return [], []

    entities: List[Dict[str, Any]] = []

    def _add(entity_type: str, value: str, confidence: float, attrs: Optional[Dict[str, Any]] = None) -> None:
        entities.append({
            "entity_type": entity_type,
            "canonical_name": value.strip(),
            "confidence": confidence,
            "attributes": attrs or {},
        })

    # Persons (simple heuristic: capitalized word pairs)
    for m in _PERSON_RE.finditer(text_clean):
        val = m.group(1).strip()
        if len(val.split()) >= 2 and len(val) < 60:
            _add("PERSON", val, base_confidence)

    # Phones
    for m in _PHONE_RE.finditer(text_clean):
        _add("PHONE", m.group(1), 0.9)

    # Vehicles (Indian-style plates)
    for m in _VEHICLE_RE.finditer(text_clean):
        _add("VEHICLE", m.group(1), 0.85)

    # Locations
    for m in _LOCATION_RE.finditer(text_clean):
        _add("LOCATION", m.group(1).strip(), base_confidence)

    # Organizations
    for m in _ORG_RE.finditer(text_clean):
        _add("ORGANIZATION", m.group(1).strip(), base_confidence)

    # Accounts (bank-style)
    for m in _ACCOUNT_RE.finditer(text_clean):
        _add("ACCOUNT", m.group(1), 0.7)

    # Dates
    for m in _DATE_RE.finditer(text_clean):
        _add("DATE", m.group(1), 0.8)

    # Cases
    for m in _CASE_RE.finditer(text_clean):
        _add("CASE", m.group(1).strip(), 0.9)

    entities = _deduplicate(entities)
    entities = [e for e in entities if len(e["canonical_name"]) >= 2]

    # Build simple co-occurrence relationships within a window
    relationships: List[Dict[str, Any]] = []
    window = 200
    for i, ent_a in enumerate(entities):
        for ent_b in entities[i + 1:]:
            pos_a = text_clean.find(ent_a["canonical_name"])
            pos_b = text_clean.find(ent_b["canonical_name"])
            if pos_a == -1 or pos_b == -1:
                continue
            if abs(pos_a - pos_b) <= window:
                rel_type = "ASSOCIATED_WITH"
                if ent_a["entity_type"] == "PERSON" and ent_b["entity_type"] == "PHONE":
                    rel_type = "CALLED"
                elif ent_a["entity_type"] == "PERSON" and ent_b["entity_type"] == "VEHICLE":
                    rel_type = "USES"
                elif ent_a["entity_type"] == "PERSON" and ent_b["entity_type"] == "LOCATION":
                    rel_type = "TRAVELLED_TO"
                elif ent_b["entity_type"] == "PERSON" and ent_a["entity_type"] == "PHONE":
                    rel_type = "CALLED"
                elif ent_b["entity_type"] == "PERSON" and ent_a["entity_type"] == "VEHICLE":
                    rel_type = "USES"
                elif ent_b["entity_type"] == "PERSON" and ent_a["entity_type"] == "LOCATION":
                    rel_type = "TRAVELLED_TO"
                relationships.append({
                    "source_entity_name": ent_a["canonical_name"],
                    "target_entity_name": ent_b["canonical_name"],
                    "relationship_type": rel_type,
                    "confidence": min(ent_a["confidence"], ent_b["confidence"]),
                })

    return entities, relationships


async def process_file_extraction(
    db: AsyncIOMotorDatabase,
    file_id: str,
    job_id: Optional[str] = None,
    text: Optional[str] = None,
) -> Dict[str, Any]:
    """Main entry: extract entities and relationships from a file's text content."""
    doc = await db[EVIDENCE_COLLECTION if False else "evidence_files"].find_one({"_id": ObjectId(file_id)}) if ObjectId.is_valid(file_id) else None
    if not doc:
        return {"status": "error", "message": "File not found"}

    if text is None:
        text = doc.get("description") or ""
        # In a fuller implementation, we'd read the actual file content here
        # and run OCR/text extraction before entity extraction.

    entities, relationships = await extract_entities_from_text(text, file_id, job_id)

    stored_entities: List[Dict[str, Any]] = []
    for ent in entities:
        ent_create = EntityCreate(
            entity_type=ent["entity_type"],
            canonical_name=ent["canonical_name"],
            confidence=ent["confidence"],
            attributes=ent.get("attributes", {}),
            source_files=[file_id],
        )
        ent_dict = ent_create.model_dump()
        ent_dict["created_at"] = datetime.utcnow()
        ent_dict["updated_at"] = datetime.utcnow()
        result = await db[ENTITIES_COLLECTION].insert_one(ent_dict)
        ent_dict["_id"] = str(result.inserted_id)
        stored_entities.append(ent_dict)

        ext_ent = {
            "file_id": file_id,
            "job_id": job_id,
            "entity_type": ent["entity_type"],
            "canonical_name": ent["canonical_name"],
            "confidence": ent["confidence"],
            "extraction_method": "regex",
        }
        await db[EXTRACTED_ENTITIES_COLLECTION].insert_one(ext_ent)

    stored_relationships: List[Dict[str, Any]] = []
    entity_name_to_id = {e["canonical_name"].upper(): e["_id"] for e in stored_entities}

    for rel in relationships:
        src_id = entity_name_to_id.get(rel["source_entity_name"].upper())
        tgt_id = entity_name_to_id.get(rel["target_entity_name"].upper())
        if not src_id or not tgt_id:
            continue
        rel_create = RelationshipCreate(
            source_entity_id=src_id,
            target_entity_id=tgt_id,
            relationship_type=rel["relationship_type"],
            confidence=rel["confidence"],
            source_file_id=file_id,
        )
        rel_dict = rel_create.model_dump()
        rel_dict["created_at"] = datetime.utcnow()
        result = await db[RELATIONSHIPS_COLLECTION].insert_one(rel_dict)
        rel_dict["_id"] = str(result.inserted_id)
        stored_relationships.append(rel_dict)

        ext_rel = {
            "file_id": file_id,
            "job_id": job_id,
            "source_entity_id": src_id,
            "target_entity_id": tgt_id,
            "relationship_type": rel["relationship_type"],
            "confidence": rel["confidence"],
        }
        await db[EXTRACTED_RELATIONSHIPS_COLLECTION].insert_one(ext_rel)

    return {
        "status": "completed",
        "entities_found": len(stored_entities),
        "relationships_found": len(stored_relationships),
    }


entity_extraction_service = type("Obj", (), {"process_file_extraction": process_file_extraction})()
