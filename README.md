# CanvasFlow

CanvasFlow is a full-stack AI-powered canvas application for building visual workflows and diagrams. Describe what you want to build, and the AI generates a connected node graph you can edit, rearrange, and extend.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square)

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

> Drop your screenshots into the `screenshots/` folder using exactly these filenames and they will appear above automatically.

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
| **Authentication** | Clerk sign-in / sign-up with JWT verification on every API route |
| **Persistence** | Per-user boards stored in PostgreSQL; canvas JSON round-trips through the API |

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
- **Alembic** — database migrations
- **Pydantic v2** — request/response validation with structured output
- **OpenAI SDK → OpenRouter** — AI generation and canvas modification
- **PyJWT** — Clerk JWT verification

---

## Project Structure

```text
canvasflow/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, CORS, startup hook
│       ├── auth.py          # Clerk JWT verification
│       ├── database.py      # Async SQLAlchemy engine
│       ├── models.py        # ORM models
│       ├── schemas.py       # Pydantic schemas
│       └── routers/
│           ├── boards.py    # CRUD for boards + canvas data
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
        ├── pages/           # Dashboard, Board, Sign-in, Sign-up
        ├── stores/          # canvas.store.ts (Zustand + zundo)
        └── types/
```

---

## Quick Start — Docker

Docker is the recommended way to demo this project. It starts all three services (PostgreSQL database, Python backend, React frontend) with a single command — no need to install Node, Python, or PostgreSQL locally.

### Step 1 — Install Docker Desktop

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS. Once installed, make sure it is running (you should see the Docker whale icon in your system tray / menu bar).

Verify it works:
```bash
docker --version
# Docker version 26.x.x ...
```

### Step 2 — Create your environment file

The backend needs three API keys. Create `backend/.env` by copying the example:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in:

```env
CLERK_SECRET_KEY=sk_test_...        # From Clerk Dashboard → API Keys
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
OPENROUTER_API_KEY=sk-or-...        # From openrouter.ai → Keys
```

> `DATABASE_URL` is **not** needed in this file for Docker — `docker-compose.yml` overrides it automatically to point at the bundled PostgreSQL container.

### Step 3 — Build and start

From the project root (where `docker-compose.yml` lives):

```bash
docker compose up --build
```

Docker will:
1. Pull the PostgreSQL 16 image
2. Build the Python backend image (installs `requirements.txt`)
3. Build the React frontend image (runs `npm ci` + `vite build`, then serves via nginx)
4. Start all three containers in the correct order (database → backend → frontend)

First build takes **2–4 minutes**. Subsequent starts (without `--build`) take a few seconds.

### Step 4 — Open the app

Once you see `Application startup complete` in the logs, open:

| Service | URL |
|---|---|
| **App** | http://localhost:5173 |
| **API** | http://localhost:8000 |
| **Interactive API docs** | http://localhost:8000/docs |

### Everyday usage

```bash
# Start (after first build — much faster, no rebuild)
docker compose up

# Start in background (logs won't fill your terminal)
docker compose up -d

# View logs while running in background
docker compose logs -f

# Stop everything (database data is preserved)
docker compose down

# Stop and wipe the database (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

### Troubleshooting

| Problem | Fix |
|---|---|
| Port 5173 or 8000 already in use | Stop the other process, or change the port mapping in `docker-compose.yml` (e.g. `"5174:80"`) |
| Backend crashes on start | Check `docker compose logs backend` — usually a missing env var |
| Database connection refused | The `db` health check may still be running; wait 10 s and retry |
| Frontend shows blank page | Hard-refresh the browser (`Ctrl+Shift+R`) — nginx may have cached a stale build |

---

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 15+
- A [Clerk](https://clerk.com) project
- An [OpenRouter](https://openrouter.ai) API key

### Backend

```bash
cd backend

python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Fill in the values (see Environment Variables below)

uvicorn app.main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend

npm install

# Create frontend/.env (see Environment Variables below)

npm run dev
# → http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/canvasflow
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
OPENROUTER_API_KEY=sk-or-...
```

### `frontend/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

> **Docker note:** `DATABASE_URL` is automatically overridden by `docker-compose.yml` to point at the `db` service — you only need the other three keys in `backend/.env`.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/boards` | List all boards for the authenticated user |
| `POST` | `/boards` | Create a new board |
| `GET` | `/boards/{id}` | Get board details and canvas data |
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
