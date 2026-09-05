from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

ENTITY_TYPES = [
    "PERSON",
    "PHONE",
    "VEHICLE",
    "LOCATION",
    "ORGANIZATION",
    "ACCOUNT",
    "EVENT",
    "CASE",
]

RELATIONSHIP_TYPES = [
    "CALLED",
    "ASSOCIATED_WITH",
    "OWNED",
    "LOCATED_AT",
    "WORKS_FOR",
    "TRANSFERRED_TO",
    "INVOLVED_IN",
    "TRAVELLED_TO",
    "MENTIONED_IN",
    "USES",
]


class EntityBase(BaseModel):
    entity_type: str
    canonical_name: str
    aliases: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    source_files: Optional[List[str]] = None
    confidence: float = 0.0
    metadata: Optional[Dict[str, Any]] = None


class EntityCreate(EntityBase):
    pass


class EntityUpdate(BaseModel):
    canonical_name: Optional[str] = None
    aliases: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    source_files: Optional[List[str]] = None
    confidence: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class EntityResponse(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime


class RelationshipBase(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relationship_type: str
    weight: float = 0.5
    confidence: float = 0.0
    source_file_id: Optional[str] = None
    source_record_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipUpdate(BaseModel):
    relationship_type: Optional[str] = None
    weight: Optional[float] = None
    confidence: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class RelationshipResponse(RelationshipBase):
    id: str
    created_at: datetime
