# Siva Assignment — Task Manager

Full-stack **task management** application: users sign up or log in, then create and manage tasks with status, priority, due dates, and assignment to other users. This repository is the assignment deliverable: a REST API backed by SQLite and a React single-page app.

## Features

- **Authentication** — Register, login, JWT sessions, protected routes
- **Tasks** — List, create, view, edit, delete; filter by status and priority
- **Task fields** — Title, description, status (`todo` / `in_progress` / `done`), priority (`low` / `medium` / `high`), optional due date, assignee
- **Users** — List users for assignment (authenticated); roles `admin` / `user` in the database
- **First-time setup** — SQLite database is created on startup; optional seed admin via environment variables

## Tech Stack

| Layer    | Technologies |
|----------|----------------|
| Backend  | Node.js (ES modules), Express, SQLite (`sqlite3`), Zod, bcrypt, JWT |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide icons |
| API      | JSON over HTTP; CORS configured for the dev frontend |

## Repository Layout

```
Siva-Assignment/
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/       # schema, DB bootstrap & seed
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── .env.example
├── frontend/         # Vite + React app
│   └── .env.example
└── README.md
```

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)

## Configuration

### Backend

Copy the example file and adjust values:

```bash
cd backend
cp .env.example .env
```

On Windows Command Prompt or PowerShell you can use `copy .env.example .env` instead of `cp`.

| Variable | Description |
|----------|-------------|
| `PORT` | API server port (default `3001`) |
| `JWT_SECRET` | Secret for signing tokens — use a long random string in production |
| `DATABASE_PATH` | SQLite file path (e.g. `./data/tasks.db`) |
| `CORS_ORIGIN` | Allowed browser origin (default `http://localhost:3000`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Optional first admin user on empty database |

### Frontend

```bash
cd frontend
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the API (no trailing slash), e.g. `http://localhost:3001` |

## Running Locally

**Terminal 1 — API**

```bash
cd backend
npm install
npm run dev
```

Server listens on `http://localhost:3001` (or `PORT` from `.env`). Health check: `GET http://localhost:3001/health`.

**Terminal 2 — Web app**

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:3000`). The frontend must be allowed by `CORS_ORIGIN` on the backend.

**Production build (frontend)**

```bash
cd frontend
npm run build
npm run preview   # optional local preview of dist/
```

## API Overview

Base URL: `http://localhost:3001` (with your `PORT`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness |
| POST | `/auth/signup` | No | Register |
| POST | `/auth/login` | No | Login (returns JWT) |
| GET | `/auth/me` | Yes | Current user |
| GET | `/tasks` | Yes | List tasks |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/:id` | Yes | Get one task |
| PUT | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |
| GET | `/users` | Yes | List users (for assignee dropdown) |

Send `Authorization: Bearer <token>` for protected routes.

## Database

- **SQLite** with tables `users` and `tasks` (see `backend/src/db/schema.sql`).
- Foreign keys: `tasks.assigned_to` and `tasks.created_by` reference `users.id`.
- The DB file and `backend/data/` are ignored by git (see root `.gitignore`).

## Assignment Notes

This project satisfies a typical **full-stack assignment** brief: persistent tasks, authenticated access, validation on the server, and a usable UI for CRUD workflows. Extend or document any extra requirements from your course brief (e.g. deployment, screenshots, demo video) in your submission materials as needed.
