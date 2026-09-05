# BHAIRAV External Integration Setup

This document details how to configure the external service dependencies for Bhairav (MongoDB, Storage, AI models, and Vector DBs). 

## 1. Environment Files Setup
The project uses strict `.env` environments to ensure secrets are never leaked.
1. In the `frontend` root (`d:\SIH\Bhairav\`), copy `.env.example` to `.env`.
2. In the `backend` folder (`d:\SIH\Bhairav\backend\`), copy `.env.example` to `.env`.

> [!WARNING]
> Never put actual secrets, JWT tokens, or passwords into the `.env.example` file. 
> Never commit your `.env` file to version control. The `.gitignore` has been updated to protect these files.

## 2. MongoDB Setup
The backend utilizes MongoDB as the primary database.
- **Required Variable**: `MONGODB_URI`, `DATABASE_NAME`
- **Location**: `backend/.env`
- **Visibility**: **SECRET** (Backend only). The frontend must never connect directly to MongoDB.

## 3. Storage Setup (Images, CCTV Frames, Documents)
Storage configuration provides S3-compatible endpoints for file uploads.
- **Required Variables**: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`
- **Location**: `backend/.env`
- **Visibility**: **SECRET**. Object URLs will be authorized via the backend and metadata served to the frontend.

## 4. AI & LLM Setup
The AI and Language Model systems require external API keys.
- **Required Variables**: `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`, `LLM_API_KEY`, `VISION_MODEL`, `OCR_MODEL`, `LLM_MODEL`, `EMBEDDING_MODEL`, `STT_MODEL`, `TTS_MODEL`
- **Location**: `backend/.env`
- **Visibility**: **SECRET**. The frontend routes traffic to the backend, which forwards it to the respective AI providers using these models.

## 5. RAG / Vector Database Setup
For document intelligence and semantic search.
- **Required Variables**: `VECTOR_DB_URL`, `VECTOR_DB_KEY`
- **Location**: `backend/.env`
- **Visibility**: **SECRET**. 

## 6. Maps Setup
The Security Map page uses Esri World Imagery tiles, which are free and require no API key. If you later swap to a provider that needs a key, add it to the frontend `.env`.
- **Optional Variable**: `VITE_MAP_PUBLIC_KEY`
- **Location**: `/.env` (Frontend)
- **Visibility**: **PUBLIC**. Only needed if you replace the tile provider with one that requires authentication.

## 7. Restart Requirements
If you modify `.env` variables in either the frontend or backend, you **must restart the server**:
- **Frontend**: Stop Vite and run `npm run dev`.
- **Backend**: Stop FastAPI and restart it to see the "BHAIRAV SYSTEM STARTUP DIAGNOSTICS" output in your terminal indicating connected components.
