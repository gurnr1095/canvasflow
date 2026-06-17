
# CanvasFlow

CanvasFlow is a full-stack web application that helps users plan, organize, and visualize ideas through AI-assisted workspace boards. The project combines a modern React frontend with a FastAPI backend to deliver a polished, interactive experience for creating structured diagrams and workflows.

## Why This Project

CanvasFlow was built to explore how AI can support creative and technical thinking by turning prompts into visual roadmaps and structured workflow layouts. It showcases a practical blend of frontend design, backend API development, authentication, persistence, and AI integration.

## Key Features

- Create and manage multiple board/workspace entries
- Save and restore canvas content with nodes and edges
- Generate workflow ideas from user prompts using AI
- Authenticate users securely with Clerk
- Provide a clean, dark-themed dashboard for project organization

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- React Flow
- Clerk Authentication

### Backend
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Alembic
- Pydantic
- JWT-based auth verification
- OpenRouter integration via OpenAI SDK

## Project Structure

```text
backend/
  app/
    auth.py
    database.py
    main.py
    models.py
    routers/
      ai.py
      boards.py
    schemas.py

frontend/
  src/
    components/
    hooks/
    i18n/
    lib/
    pages/
    stores/
    types/
```

## What I Built

This project demonstrates several core software engineering skills:

- Building a responsive, user-friendly frontend with reusable components
- Designing and exposing RESTful API endpoints
- Managing data models and database interactions
- Implementing secure authentication flows
- Integrating external AI services into application logic

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.10+
- PostgreSQL
- Clerk account and publishable key
- OpenRouter API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy the sample environment file:
   ```bash
   copy .env.example .env
   ```

5. Update `.env` with your project credentials.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm run dev
```

The backend runs locally at:

```text
http://localhost:8000
```

The frontend runs locally at:

```text
http://localhosgetApiRequestCount()t:5173
```

## API Highlights

- `GET /boards` — fetch all boards for the authenticated user
- `POST /boards` — create a new board
- `GET /boards/{board_id}` — retrieve board details
- `PUT /boards/{board_id}/canvas` — save canvas data
- `DELETE /boards/{board_id}` — delete a board
- `POST /ai/generate` — generate a roadmap from a prompt

## Authentication

The application uses Clerk for user sign-in and sign-up flows, and the backend validates JWTs using Clerk's JWKS configuration.

## Database & Persistence

The backend uses SQLAlchemy models and async database sessions to store user boards and canvas data. Alembic is included to support schema evolution over time.

## Security Considerations

- Keep API keys and secrets out of source control
- Use environment variables for local and deployment configuration
- Ensure production credentials are managed securely

## License

This project is intended for personal, educational, and portfolio use.
