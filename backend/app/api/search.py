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
    # Here we do a safe regex-based search across a few collections
    results = []

    search_regex = {"$regex": query_in.query, "$options": "i"}

    # Try incidents collection if it exists
    try:
        collection_names = await db.list_collection_names()
    except Exception:
        collection_names = []

    if "incidents" in collection_names and (
        not query_in.entity_types or "incidents" in query_in.entity_types
    ):
        try:
            cursor = db.incidents.find(
                {"$or": [{"title": search_regex}, {"description": search_regex}]}
            ).skip(query_in.skip).limit(query_in.limit)
            async for doc in cursor:
                results.append(SearchResult(
                    id=str(doc["_id"]),
                    type="incident",
                    title=doc.get("title", "Untitled Incident"),
                    snippet=(doc.get("description", "") or "")[:100],
                ))
        except Exception:
            pass

    # Search across all collections that have a 'name' or 'title' field
    other_collections = [
        ("persons", "person", "name"),
        ("vehicles", "vehicle", "registration"),
        ("locations", "location", "name"),
        ("events", "event", "description"),
        ("cases", "case", "title"),
    ]
    for coll, entity_type, field in other_collections:
        if coll not in collection_names:
            continue
        if query_in.entity_types and entity_type not in query_in.entity_types:
            continue
        if len(results) >= query_in.limit:
            break
        try:
            cursor = db[coll].find({field: search_regex}).limit(query_in.limit)
            async for doc in cursor:
                results.append(SearchResult(
                    id=str(doc["_id"]),
                    type=entity_type,
                    title=str(doc.get(field, "Untitled"))[:80],
                    snippet=str(doc.get("description", "") or doc.get("metadata", "") or "")[:100] if isinstance(doc.get("metadata"), str) else None,
                ))
        except Exception:
            pass

    execution_time = int((time.time() - start_time) * 1000)

    return SearchResponse(
        results=results[:query_in.limit],
        total_count=len(results),
        execution_time_ms=execution_time
    )
