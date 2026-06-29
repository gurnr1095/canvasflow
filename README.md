# CanvasFlow

**Live demo → [canvasflow-frontend-607x.onrender.com](https://canvasflow-frontend-607x.onrender.com)**

CanvasFlow is a full-stack AI-powered canvas application for building visual workflows and diagrams. Describe what you want to build, and the AI generates a connected node graph you can edit, rearrange, and extend.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white&style=flat-square)

---

## Screenshots

| Dashboard | Canvas |
|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Canvas](screenshots/canvas.png) |

| Workflow Generation | Node Selection |
|---|---|
| ![Workflow Generation](screenshots/generation.png) | ![Node Selection](screenshots/node-selection.png) |

| Command Palette | Side Panels |
|---|---|
| ![Command Palette](screenshots/command-palette.png) | ![Side Panels](screenshots/side-panels.png) |

---

## Features

| Category | Details |
|---|---|
| **AI Generation** | Prompt → connected node graph via GPT-4o-mini; nodes stream in sequentially for visual feedback |
| **AI Canvas Modification** | Chat bar lets you add to an existing canvas mid-session ("add a Redis cache layer") |
| **Canvas** | Drag-to-pan, right-click drag box-select, multi-node move, zoom, fit view |
| **Undo / Redo** | Full history via `zundo` temporal middleware; ⌘Z / ⌘⇧Z shortcuts |
| **Auto-save** | Debounced 2 s auto-save with a visual saved/unsaved indicator |
| **Export** | Export canvas as PNG with one click |
| **Context Menu** | Right-click nodes or canvas for add, duplicate, delete, fit view |
| **Node Types** | AI topic nodes, workflow step nodes, sticky notes (editable, colour-coded) |
| **Workspace Rename** | Inline rename via pencil icon on hover — no page reload required |
| **Authentication** | Clerk sign-in / sign-up with JWT verification on every API route |
| **Persistence** | Per-user boards stored in PostgreSQL (Neon); canvas JSON round-trips through the API |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** — component model and type safety
- **Vite 5** — instant HMR dev server
- **@xyflow/react** (React Flow v12) — canvas engine, node/edge rendering
- **Zustand** + **zundo** — global state with temporal undo/redo
- **Framer Motion** — node entry animations, toolbar collapse, chat bar
- **Tailwind CSS** — utility-first styling with custom GitHub-dark design tokens
- **Clerk** — authentication UI and session management
- **sonner** — toast notifications

### Backend
- **FastAPI** — async REST API
- **SQLAlchemy 2 (async)** + **asyncpg** — async ORM with PostgreSQL
- **Pydantic v2** — request/response validation with structured output
- **OpenAI SDK → OpenRouter** — AI generation and canvas modification
- **PyJWT** — Clerk JWT verification

### Infrastructure
- **Render** — backend deployed as a Docker Web Service; frontend as a Static Site
- **Neon** — serverless PostgreSQL (free tier) via direct connection endpoint

---

## Project Structure

```text
canvasflow/
├── docker-compose.yml
├── render.yaml              # Render Blueprint — defines both services
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, CORS, startup hook
│       ├── auth.py          # Clerk JWT verification
│       ├── database.py      # Async SQLAlchemy engine + Neon URL normalization
│       ├── models.py        # ORM models
│       ├── schemas.py       # Pydantic schemas
│       └── routers/
│           ├── boards.py    # CRUD for boards + canvas data + rename
│           └── ai.py        # /ai/generate and /ai/modify
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── components/
        │   ├── canvas/      # CanvasEditor, nodes, toolbar, AIChatBar
        │   └── ui/          # ContextMenu, Sidebar, CommandPalette, ContextPanel
        ├── hooks/           # useAIGenerate
        ├── lib/             # api.ts (typed API client)
        ├── pages/           # Dashboard, Board
        ├── stores/          # canvas.store.ts (Zustand + zundo)
        └── types/
```

---

## Deployment (Render + Neon)

The app is deployed using a `render.yaml` Blueprint. The backend runs as a Docker Web Service and the frontend as a Render Static Site. PostgreSQL is hosted on [Neon](https://neon.tech) (free tier).

### Render environment variables to set manually

**Backend service:**

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon **direct** connection string (not the pooler) |
| `CLERK_JWKS_URL` | `https://<your-clerk-domain>/.well-known/jwks.json` |
| `OPENROUTER_API_KEY` | From [openrouter.ai](https://openrouter.ai) |
| `FRONTEND_URL` | Your Render static site URL |

**Frontend service:**

| Key | Value |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` from Clerk Dashboard |
| `VITE_API_URL` | Your Render backend URL |

> Use the **Direct** Neon connection string, not the pooler. The pooler strips `search_path`, causing table-not-found errors with asyncpg.

---

## Quick Start — Docker

Docker is the recommended way to run this project locally. It starts all three services (PostgreSQL, Python backend, React frontend) with a single command.

### Prerequisites

[Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
docker --version
# Docker version 26.x.x ...
```

### Setup

```bash
# 1. Copy and fill in the backend env file
cp backend/.env.example backend/.env
```

`backend/.env` needs:

```env
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
OPENROUTER_API_KEY=sk-or-...
```

> `DATABASE_URL` is not needed for Docker — `docker-compose.yml` points at the bundled PostgreSQL container automatically.

```bash
# 2. Build and start
docker compose up --build
```

| Service | URL |
|---|---|
| **App** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **API docs** | http://localhost:8000/docs |

### Common commands

```bash
docker compose up          # start (no rebuild)
docker compose up -d       # start in background
docker compose logs -f     # stream logs
docker compose down        # stop (data preserved)
docker compose down -v     # stop + wipe database
docker compose up --build  # rebuild after code changes
```

---

## Local Development (without Docker)

### Prerequisites

- Node.js 20+, Python 3.12+, PostgreSQL 15+
- A [Clerk](https://clerk.com) project
- An [OpenRouter](https://openrouter.ai) API key

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn app.main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
# create frontend/.env (see below)
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/canvasflow
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
OPENROUTER_API_KEY=sk-or-...
```

### `frontend/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/boards` | List all boards for the authenticated user |
| `POST` | `/boards` | Create a new board |
| `GET` | `/boards/{id}` | Get board details and canvas data |
| `PATCH` | `/boards/{id}` | Rename a board |
| `PUT` | `/boards/{id}/canvas` | Save canvas (nodes + edges JSON) |
| `DELETE` | `/boards/{id}` | Delete a board |
| `POST` | `/ai/generate` | Generate a node graph from a text prompt |
| `POST` | `/ai/modify` | Add nodes to an existing canvas from a prompt |
| `GET` | `/health` | Health check |

Full interactive docs available at `http://localhost:8000/docs` when the backend is running.

---

## Authentication Flow

1. User signs in via Clerk (hosted UI).
2. Clerk issues a signed JWT to the browser.
3. The frontend attaches the JWT as a `Bearer` token on every API request.
4. The backend verifies the JWT signature against Clerk's JWKS endpoint and extracts the `user_id`.
5. All database queries are scoped to that `user_id`.

---

## License

Personal, educational, and portfolio use only.
