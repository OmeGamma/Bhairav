from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import time

from app.core.database import get_db
from app.schemas.search import SearchQuery, SearchResponse, SearchResult
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("/", response_model=SearchResponse)
async def global_search(
    query_in: SearchQuery,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["search.execute"]))
):
    start_time = time.time()
    
    # In a real app, this would use MongoDB Atlas Search or Elasticsearch
    # Here we mock a basic text search across a few collections for demonstration
    results = []
    
    # Example: search incidents
    if not query_in.entity_types or "incidents" in query_in.entity_types:
        cursor = db.incidents.find({"$text": {"$search": query_in.query}}).skip(query_in.skip).limit(query_in.limit)
        async for doc in cursor:
            results.append(SearchResult(
                id=str(doc["_id"]),
                type="incident",
                title=doc.get("title", "Untitled Incident"),
                snippet=doc.get("description", "")[:100]
            ))
            
    # Mocking for demo if text index is not properly set up
    if not results and query_in.query:
         # Fallback regex search for demo purposes
         cursor = db.incidents.find({"title": {"$regex": query_in.query, "$options": "i"}}).limit(5)
         async for doc in cursor:
            results.append(SearchResult(
                id=str(doc["_id"]),
                type="incident",
                title=doc.get("title", "Untitled Incident"),
                snippet=doc.get("description", "")[:100]
            ))

    execution_time = int((time.time() - start_time) * 1000)
    
    return SearchResponse(
        results=results,
        total_count=len(results),
        execution_time_ms=execution_time
    )
