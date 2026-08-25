from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Bhairav AI Service",
    description="AI-Powered Intelligence Layer for Bhairav",
    version="1.0.0"
)

# CORS middleware for frontend/backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.environment}

from app.api.routes import vision, document, identity, network, welfare, assistant, voice

app.include_router(vision.router, prefix="/api/v1/ai", tags=["vision"])
app.include_router(document.router, prefix="/api/v1/ai", tags=["document"])
app.include_router(identity.router, prefix="/api/v1/ai", tags=["identity"])
app.include_router(network.router, prefix="/api/v1/ai", tags=["network"])
app.include_router(welfare.router, prefix="/api/v1/ai", tags=["welfare"])
app.include_router(assistant.router, prefix="/api/v1/ai", tags=["assistant"])
app.include_router(voice.router, prefix="/api/v1/ai", tags=["voice"])
