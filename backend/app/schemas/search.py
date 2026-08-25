from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class SearchQuery(BaseModel):
    query: str
    entity_types: Optional[List[str]] = None
    filters: Optional[Dict[str, Any]] = None
    skip: int = 0
    limit: int = 20

class SearchResult(BaseModel):
    id: str
    type: str
    title: str
    snippet: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total_count: int
    execution_time_ms: int

class ReportRequest(BaseModel):
    report_type: str # INCIDENT_SUMMARY, PERSONNEL_DEPLOYMENT, THREAT_ASSESSMENT
    parameters: Optional[Dict[str, Any]] = None

class ReportResponse(BaseModel):
    report_id: str
    status: str
    download_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
