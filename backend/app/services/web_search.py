import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings


SEARCH_CATEGORIES = [
    "general",
    "news",
    "security",
    "technology",
    "politics",
    "world",
]


async def search_web(query: str, categories: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Search the public web via SearXNG.
    Returns structured results: title, url, snippet, published date when available.
    """
    if not settings.SEARXNG_URL:
        return []

    base_url = settings.SEARXNG_URL.rstrip("/")
    search_url = f"{base_url}/search"

    params = {
        "q": query,
        "format": "json",
        "engines": "google,bing,duckduckgo",
        "categories": ",".join(categories or SEARCH_CATEGORIES),
        "safesearch": "1",
        "language": "en",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(search_url, params=params)
            if response.status_code != 200:
                return []

            data = response.json()
            results: List[Dict[str, Any]] = []

            for item in data.get("results", [])[:8]:
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "snippet": item.get("content", ""),
                    "published": item.get("publishedDate") or item.get("date"),
                    "source": item.get("engine", ""),
                })

            return results
    except Exception:
        return []
