from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# --- Network Entities ---
class NetworkEntityBase(BaseModel):
    entity_type: str # PERSON, VEHICLE, LOCATION, INCIDENT, CASE, ORGANIZATION, DOCUMENT
    reference_id: str
    label: str
    metadata: Optional[Dict[str, Any]] = None

class NetworkEntityCreate(NetworkEntityBase):
    pass

class NetworkEntityUpdate(BaseModel):
    label: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class NetworkEntityResponse(NetworkEntityBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

# --- Relationships ---
class RelationshipBase(BaseModel):
    source_entity_id: Optional[str] = None
    target_entity_id: Optional[str] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    relationship_type: str # ASSOCIATED_WITH, CONTACT, LOCATED_AT, LINKED_TO_INCIDENT...
    confidence: float = 1.0
    evidence_metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipUpdate(BaseModel):
    relationship_type: Optional[str] = None
    confidence: Optional[float] = None
    evidence_metadata: Optional[Dict[str, Any]] = None

class RelationshipResponse(RelationshipBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

# --- Graph Response ---
class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    metadata: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: Optional[Dict[str, Any]] = None
