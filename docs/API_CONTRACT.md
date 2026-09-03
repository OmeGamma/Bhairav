# BHAIRAV Backend API Contract

**Base URL:** `http://127.0.0.1:5000`
**Auth:** `Authorization: Bearer <jwt>` header (except `/auth/login`, `/auth/register`)
**CORS:** Allowed origins: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
**Admin credentials:** `admin@gmail.com` / `admin@123`
**OpenAPI/Swagger:** `http://127.0.0.1:5000/docs` and `http://127.0.0.1:5000/openapi.json`
**MongoDB:** Atlas (production), local fallback for dev

## Conventions
- All list endpoints accept `?skip=0&limit=N` (defaults vary per route).
- All timestamps are ISO 8601 UTC.
- ObjectId is serialized as `id` (string) in responses.
- Errors return `{ "detail": "<message>" }` with appropriate 4xx/5xx status.
- All `POST`/`PUT` requests use `Content-Type: application/json` unless otherwise stated.
- `/auth/login` uses `application/x-www-form-urlencoded` (OAuth2 form).

---

## 1. Authentication (`/api/v1/auth`)

| Method | Path | Body | Returns | Auth |
|--------|------|------|---------|------|
| POST | `/auth/login` | `application/x-www-form-urlencoded`: `username=<email>&password=<pwd>` | `{ access_token, token_type }` | – |
| POST | `/auth/register` | JSON: `{ name, email, password, role_id, status? }` | `UserResponse` | – |
| GET | `/auth/me` | – | `UserResponse` | ✓ |
| POST | `/auth/logout` | – | `{ msg }` | ✓ |

`UserResponse` shape: `{ id, name, email, role_id, status, created_at, updated_at, last_login? }`

## 2. Core Entities (read-mostly, demo-seeded)

| Method | Path | Notes | Auth |
|--------|------|-------|------|
| GET | `/cameras/` | list all cameras (4 seeded) | ✓ |
| GET | `/cameras/{camera_id}` | single camera | ✓ |
| GET | `/persons/` | list persons (3 seeded) | ✓ |
| GET | `/persons/{person_id}` | single person | ✓ |
| GET | `/vehicles/` | list vehicles (3 seeded) | ✓ |
| GET | `/vehicles/{vehicle_id}` | single vehicle | ✓ |
| GET | `/events/` | security events (3 seeded) | ✓ |
| GET | `/events/{event_id}` | single event | ✓ |
| GET | `/incidents/` | (empty in seed) | ✓ |
| GET | `/incidents/{incident_id}` | single incident | ✓ |
| GET | `/cases/` | cases (1 seeded) | ✓ |
| GET | `/cases/{case_id}` | single case | ✓ |
| GET | `/locations/` | locations (4 seeded) | ✓ |
| GET | `/locations/{location_id}` | single location | ✓ |
| GET | `/personnel/` | (empty in seed) | ✓ |
| GET | `/personnel/{personnel_id}` | single personnel | ✓ |
| GET | `/users/` | users | ✓ |
| GET | `/users/{user_id}` | single user | ✓ |
| GET | `/security-zones/` | zones (1 seeded) | ✓ |
| GET | `/security-zones/{zone_id}` | single zone | ✓ |
| GET | `/notifications/` | (empty in seed) | ✓ |
| POST | `/notifications/{notification_id}/read` | mark read | ✓ |
| GET | `/documents/` | (empty in seed) | ✓ |
| GET | `/audit/` | (empty in seed) | ✓ |
| POST | `/audit/` | create audit log entry | ✓ |

## 3. Dashboard & Stats

| Method | Path | Returns | Auth |
|--------|------|---------|------|
| GET | `/stats/dashboard` | `{ cameras_total, cameras_online, cameras_offline, active_alerts, high_severity_alerts, persons_count, vehicles_count, cases_active, events_today, events_total, relationships_total, ... }` | ✓ |

## 4. Network Intelligence (`/api/v1/network`)

| Method | Path | Query / Body | Returns | Auth |
|--------|------|-----|---------|------|
| GET | `/network/graph` | `?entity_types=PERSON,VEHICLE&relationship_types=ASSOC&since=ISO&investigation_id=BH-1024&limit=150` | `{ nodes, edges, metadata }` | ✓ |
| GET | `/network/graph/{entity_id}` | – | Subgraph (1-hop) around entity | ✓ |
| GET | `/network/entities` | `?skip&limit` | All network nodes | ✓ |
| GET | `/network/entities/{entity_id}` | – | Single node | ✓ |
| GET | `/network/entity/{entity_id}/details` | – | Entity + connected summary | ✓ |
| GET | `/network/relationships` | `?skip&limit` | All edges | ✓ |
| GET | `/network/timeline/{entity_id}` | – | `{ timeline: [{ id, timestamp, type, source, confidence, status, summary }] }` | ✓ |

**Node shape:** `{ id, type (PERSON/VEHICLE/LOCATION/CASE/ORG/PHONE/EVENT), label, metadata }`
**Edge shape:** `{ source, target, relationship, timestamp, metadata, confidence }`

## 5. Search

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/search/` | `{ query: string, entity_types?: [string], filters?: {}, skip?: int, limit?: int }` | ✓ |

Response: `{ results: [{ id, type, title, snippet, metadata }], total_count, execution_time_ms }`

## 6. Reports

| Method | Path | Body | Returns | Auth |
|--------|------|------|---------|------|
| POST | `/reports/generate` | `{ report_type: 'INCIDENT_SUMMARY' \| 'PERSONNEL_DEPLOYMENT' \| 'THREAT_ASSESSMENT', parameters?: {} }` | `{ report_id, status, download_url?, metadata }` | ✓ |
| GET | `/reports/{report_id}` | – | Report status | ✓ |

## 7. AI Engines (`/api/v1/ai`)

All AI endpoints accept `Content-Type: application/json`.

| Method | Path | Body | Returns | Real/Mock |
|--------|------|------|---------|-----------|
| POST | `/ai/chat` | `{ query, context? }` | `{ summary, key_information, evidence, analysis, limitations, actions }` | **Mock** (returns canned response) |
| POST | `/ai/chat/stream` | `{ messages: [{ role, content }], context? }` | `text/event-stream` SSE | **Real Gemini** (`gemini-2.5-flash`) with optional SearXNG web search |
| POST | `/ai/video/analyze` | `{ video_id, description }` | `{ camera_id, timestamp, detections, event, model_info }` | **Mock** (deterministic synthesis) |
| POST | `/ai/video/frame` | `{ video_id, frame_number }` | `{ status, mock: true }` | **Mock** stub |
| POST | `/ai/document/analyze` | `{ document_id, document_type, text }` | `{ document_id, extracted_text, fields, model_info }` | **Mock** (regex extraction) |
| POST | `/ai/identity/analyze` | `{ verification_id, fields }` | `{ verification_id, status, confidence, checks, reasons }` | **Heuristic** (rule-based) |
| POST | `/ai/network/analyze` | `{ entity_id }` | `{ entity_id, indicators, related_entities, ... }` | **Real** (reads MongoDB) |
| POST | `/ai/welfare/analyze` | `{ check_in_id, mood, notes }` | `{ personnel_id, status, indicators, recommendations }` | **Heuristic** (mood/keyword analysis) |
| POST | `/ai/voice/transcribe` | `multipart/form-data` audio | `{ text, language, confidence, model_info }` | **Mock** (returns canned text) |
| POST | `/ai/voice/synthesize` | `{ text }` | `{ status, audio_url, model_info }` | **Mock** (returns fake audio URL) |

**Real engine status:**
- ✅ **Chat (streaming)**: Real Gemini `gemini-2.5-flash`, system prompt enforces BHAIRAV persona, short-circuits on Bhairav data queries by injecting MongoDB context.
- ✅ **Network analyze**: Real MongoDB read + heuristic indicators (repeated_association, location_overlap, etc.)
- 🟡 **Identity / Welfare**: Real-ish heuristics, not ML
- 🟡 **Document**: Regex-based field extraction (not OCR)
- ⚠️ **Video analyze / Voice**: Mocks with `mock: true` flag; see `model_info.processing_mode: synthetic`

## 8. Welfare (`/api/v1/welfare`)

| Method | Path | Returns | Auth |
|--------|------|---------|------|
| GET | `/welfare/check-ins` | `[{ id, personnel_id, mood, notes, timestamp }]` | ✓ |
| GET | `/welfare/summary` | `{ status, total_check_ins, metrics: { GOOD, FAIR, POOR, CRISIS } }` | ✓ |
| POST | `/welfare/check-ins` | (see schema `WelfareCheckInCreate`) | ✓ |

## 9. Verification (`/api/v1/verification`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/verification/` | ✓ |
| GET | `/verification/{verification_id}` | ✓ |
| POST | `/verification/` | ✓ |
| POST | `/verification/{verification_id}/review` | ✓ |

Body for `POST /verification/`: `{ document_type, document_text, fields? }`

## 10. Support (`/api/v1/support`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/support/requests` | ✓ |
| GET | `/support/requests/{request_id}` | ✓ |
| POST | `/support/requests` | ✓ |

---

## Errors

All errors follow this shape:
```json
{ "detail": "Human readable message" }
```

Common status codes:
- `400` Bad request (invalid ObjectId, missing field)
- `401` Unauthorized (no/bad token)
- `403` Forbidden (insufficient permission)
- `404` Not found
- `422` Unprocessable entity (schema validation failure)
- `500` Internal server error (unhandled exception)

## Permissions

The `require_permissions(["..."])` middleware in `app/middleware/auth.py` checks role-based permissions. Admin role has `system.admin` which bypasses all checks. The default `admin` user (seeded) is granted admin.

---

## Running locally

```powershell
# Backend
cd D:\SIH\Bhairav\backend
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 5000 --reload

# Seed demo data (idempotent)
.\venv\Scripts\python.exe -m seed_demo

# Frontend
cd D:\SIH\Bhairav
npm run dev
```

Visit:
- App: `http://localhost:5173/`
- API docs: `http://localhost:5000/docs`
