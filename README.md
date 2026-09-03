# BHAIRAV

> **Defence & Security Intelligence Platform** — a unified, AI-powered situational awareness system for authorized Indian Army / security use cases.

Built for the **Smart India Hackathon**. Combines real-time video intelligence, criminal-network analysis, identity verification, personnel welfare, and a BHAIRAV AI assistant in a single glassmorphic interface.

---

## What's inside

### Frontend — React 19 + Vite + TypeScript + Tailwind v4
- **Light + dark themes** with smooth 350ms transitions, persisted to localStorage
- **Single global layout** — no sidebar; navbar + footer wrap everything
- **Mega-menu navbar** with primary nav, Features drop-down (3 columns), AI Assistant, Cmd/Ctrl+K search palette, theme toggle, user menu
- **30+ pages**: Command Center, Security Events, Network Intelligence Graph, Verification, Welfare, AI Assistant, Personnel Dashboard, Maps, Reports, etc.
- **Real Cytoscape.js network graph** with status-colored nodes, type shapes, filter highlighting, neighborhood dim, mobile drawer, fullscreen
- **AI chat** with SSE streaming, voice mic, source citations, message history

### Backend — FastAPI + MongoDB + NetworkX + OpenCV
- **51 endpoints** under `/api/v1` covering auth, cameras, persons, vehicles, events, cases, network, AI engines, welfare, verification, support, reports, audit
- **Argon2 + JWT** auth, role-based permissions, audit logging
- **MongoDB Atlas** with 11 collections (cameras, persons, vehicles, events, alerts, network_entities, relationships, cases, locations, welfare_check_ins, notifications)
- **Real AI engines** (not stubs) — see below
- **OpenAPI/Swagger** at `http://127.0.0.1:5000/docs`

### Real AI / ML engines
| Engine | Status | Implementation |
|---|---|---|
| **AI Chat (streaming)** | ✅ Real | Google **Gemini 2.5 Flash**, Bhairav system prompt, optional **SearXNG** web search, short-circuit on BHAIRAV data queries (auto-injects MongoDB context) |
| **Network Analyzer** | ✅ Real | **NetworkX** graph built from MongoDB; computes degree / betweenness / closeness centrality + PageRank; derives indicators from metrics |
| **Document Analyzer** | ✅ Real | Regex extraction of Aadhaar, PAN, passport, voter ID, DL, phone, email, DOB, name, address, amount. **Verhoeff** Aadhaar checksum + format validators. Returns provenance (span + excerpt) for every field |
| **Identity Verifier** | ✅ Real | Document extraction + rule-based checks (name format, DOB plausibility, ID checksum). Confidence = rule pass rate (not biometric match) |
| **Welfare Analyzer** | ✅ Real | Keyword-based distress + crisis scoring with 51-phrase lexicon; trend from last 10 MongoDB check-ins |
| **Video Analyzer** | ✅ Real | **OpenCV 5** — Canny edges, 16-bin color histogram, Otsu threshold + connected-components blob detection. Person classification by aspect ratio. Deterministic synthetic CCTV frames |
| **Voice (STT / TTS)** | ⚠️ Mock | Stub responses (would plug into Whisper / TTS engine in production) |

All engines include a `model_info` / `processing_mode` field in their responses so the UI can show users what's real and what's heuristic.

---

## Run it locally

### Prerequisites
- Node.js 20+
- Python 3.11+ with the bundled venv
- A MongoDB Atlas URI (or local MongoDB)
- Optional: a SearXNG instance URL for web search
- Optional: a Gemini API key (otherwise AI chat falls back to a mock)

### 1. Backend

```powershell
cd D:\SIH\Bhairav\backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt   # first time only
.\venv\Scripts\python.exe -m seed_demo                          # first time only - populates demo data
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 5000 --reload
```

The backend listens on **`http://127.0.0.1:5000`**.
API docs: **`http://127.0.0.1:5000/docs`**

Admin credentials (seeded): `admin@gmail.com` / `admin@123`

### 2. Frontend

```powershell
cd D:\SIH\Bhairav
npm install            # first time only
npm run dev            # serves on http://127.0.0.1:5173
```

The app uses **`VITE_API_URL`** to point at the backend (default: `http://127.0.0.1:5000`).

---

## Project layout

```
D:\SIH\Bhairav
├── src/                          # React frontend
│   ├── pages/                    # 30+ page components
│   │   ├── public/               # Public landing, about, contact, etc.
│   │   ├── auth/                 # Login, Register, Onboarding
│   │   ├── security/             # Events, Map, Monitoring
│   │   ├── command-center/       # Command Center
│   │   └── assistant/            # Ask BHAIRAV chat
│   ├── components/
│   │   ├── layout/               # Navbar, AppLayout, BhairavFooter
│   │   ├── Network/              # Cytoscape graph + filters + details
│   │   ├── Assistant/            # Chat interface
│   │   ├── Welfare/              # Check-in workflow
│   │   ├── Verification/         # Document preview
│   │   └── common/               # PageShell, Card, ErrorBoundary, etc.
│   ├── services/                 # Frontend API clients (with mock fallback)
│   ├── contexts/                 # AuthContext, ThemeContext
│   ├── types/                    # TypeScript types
│   └── index.css                 # Theme tokens, glass utilities, animations
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── api/                  # Endpoint modules
│   │   │   ├── ai_routes/        # assistant, vision, document, identity, network, welfare, voice
│   │   │   ├── auth.py
│   │   │   ├── network.py        # /network/graph, /entities, /relationships, /timeline
│   │   │   ├── persons.py, vehicles.py, cameras.py, ...
│   │   │   └── search.py
│   │   ├── services/             # Real AI engines
│   │   │   ├── video_engine.py        # OpenCV pipeline
│   │   │   ├── document_engine.py     # Regex + Verhoeff
│   │   │   ├── identity_engine.py     # Rule-based verification
│   │   │   ├── network_engine.py      # NetworkX graph
│   │   │   └── welfare_engine.py      # Keyword + history trend
│   │   ├── schemas/              # Pydantic models
│   │   ├── core/                 # config, database, security
│   │   └── middleware/           # auth (JWT + permissions)
│   ├── venv/                     # Pre-built Python venv
│   ├── requirements.txt
│   ├── seed_demo.py              # Populate MongoDB with demo data
│   └── seed_events.py
├── docs/
│   ├── API_CONTRACT.md           # Full backend API reference
│   ├── EXTERNAL_SETUP.md         # MongoDB / SearXNG setup notes
│   └── INTEGRATION_CHECKLIST.md
├── public/
│   └── bhairav-logo.svg
├── .env                          # Frontend env (VITE_API_URL etc.)
├── backend/.env                  # Backend env (MongoDB URI, JWT secret, etc.)
├── index.html
├── package.json
└── vite.config.ts
```

---

## Configuration

### Backend `.env` (D:\SIH\Bhairav\backend\.env)
```bash
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pwd>@<cluster>/bhairav
DATABASE_NAME=bhairav
JWT_SECRET=<random-32-byte-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
AI_SERVICE_API_KEY=<your-gemini-api-key>   # for /ai/chat/stream
SEARXNG_URL=<optional-searxng-instance>     # for web search
```

### Frontend `.env` (D:\SIH\Bhairav\.env)
```bash
VITE_API_URL=http://127.0.0.1:5000
```

---

## Demo checklist (pre-flight)

### 1. Backend up?
- [ ] `http://127.0.0.1:5000/docs` returns 200
- [ ] `/api/v1/auth/login` with `admin@gmail.com` / `admin@123` returns a JWT
- [ ] `/api/v1/stats/dashboard` returns non-zero counts (4 cameras, 3 persons, 3 vehicles, 1 case, 3 events)

### 2. Frontend up?
- [ ] `http://127.0.0.1:5173` loads the landing page
- [ ] Theme toggle works (light ↔ dark)
- [ ] Login redirects to `/home` (post-login dashboard)

### 3. Real AI engines respond
- [ ] **AI Chat** (Ask BHAIRAV) — streaming response from Gemini, not a hard-coded blob
- [ ] **Network Analyzer** — shows real graph metrics (degree, betweenness, PageRank)
- [ ] **Document Analyzer** — Aadhaar `234123412346` passes Verhoeff; `123456789012` fails
- [ ] **Video Analyzer** — returns real OpenCV-derived detections (edge density, blob count)
- [ ] **Welfare Analyzer** — distressed notes produce `SUPPORT RECOMMENDED` / `URGENT HUMAN REVIEW`

### 4. Data flows
- [ ] Network Intelligence page renders 11+ nodes and 16+ edges
- [ ] Security Events page lists 3+ events
- [ ] Cameras page lists 4 cameras
- [ ] Dark theme works across all pages (no white flashes)

### 5. Honesty check
- [ ] Every AI response has a `model_info.processing_mode` field
- [ ] Document analyzer marks invalid Aadhaar as `valid: false`
- [ ] Identity analyzer doesn't claim biometric matching

---

## API reference

See **`docs/API_CONTRACT.md`** for the full reference (every endpoint, request/response shape, auth requirements).

Quick links:
- **`http://127.0.0.1:5000/docs`** — Swagger UI (interactive)
- **`http://127.0.0.1:5000/openapi.json`** — machine-readable schema

---

## Tech stack

| Layer | Library |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind v4, Cytoscape.js, Lucide icons, react-router-dom |
| Backend | FastAPI, Uvicorn, Motor (async MongoDB), Pydantic v2, Argon2 (passlib), PyJWT |
| AI / ML | Google Generative AI (Gemini 2.5 Flash), OpenCV 5 (headless), NetworkX 3, NumPy, Pillow |
| Database | MongoDB Atlas (production) / local MongoDB (dev) |

---

## What this is NOT

- **NOT** a production-grade face-recognition or biometric system
- **NOT** a real-time CCTV ingest pipeline (frames are deterministic synthetic for reproducibility)
- **NOT** a clinical/medical decision support tool for the welfare engine
- **NOT** a YOLO/Detectron-based person detector (we use connected components as a classical CV proxy)

Every AI engine labels its `processing_mode` in responses so the UI and users can tell at a glance what's real and what's heuristic.

---

## License

Built for the Smart India Hackathon. Internal use; not for public distribution.
