# Task Manager — Technical Exercise

Full-stack task management app: **Node.js + Express** API with **SQLite**, **React** SPA with **Context API** for auth and custom hooks for tasks. Intended duration: **5 hours**.

**Deliverables (local):**

| App | URL |
|-----|-----|
| Backend | `http://localhost:3001` |
| Frontend | `http://localhost:3000` |

---

## Exercise specification

### Data models

**User:** `id`, `email`, `password` (hashed), `name`, `role` (`admin` \| `user`), `created_at`

**Task:** `id`, `title`, `description`, `status` (`todo` \| `in_progress` \| `done`), `priority` (`low` \| `medium` \| `high`), `due_date`, `assigned_to` (FK → user), `created_by` (FK → user), `created_at`, `updated_at`

### API endpoints

| Method | Route | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | Public | Register with email, password, name |
| POST | `/auth/login` | Public | Returns JWT |
| GET | `/auth/me` | User | Current user |
| GET | `/tasks` | User | List with pagination + filters |
| POST | `/tasks` | User | Create task |
| GET | `/tasks/:id` | User | Get one task |
| PUT | `/tasks/:id` | User | Update fields |
| DELETE | `/tasks/:id` | Admin | Delete task |
| GET | `/users` | User | List users (assignee picker) |

**GET `/tasks` query parameters:** `page`, `limit`, `status`, `priority`, `assignedTo`, `sortBy`, `order` (`asc` \| `desc`), `search` (title)

### Validation (server)

- **email** — valid format, normalized (lowercase)
- **password** — min 8 chars, 1 uppercase, 1 number
- **title** — required, max 200 chars
- **description** — optional, max 2000 chars
- **dueDate** — ISO 8601 if provided
- **assignedTo** — must reference existing user
- **IDs** — UUID format where applicable

### Auth & authorization

- Passwords: **bcrypt** with **12 rounds**
- JWT: **8h** expiry
- **Admin:** full access to all tasks; **only admins may delete** tasks
- **User:** may read / update only tasks they **created** or tasks **assigned to them** (full edit UI is limited to owner/admin; assignees can update status)

### Non-functional (backend)

- Request logging (**morgan**)
- Central **error handler** middleware
- **422** with field-level errors on validation failure
- Error shape: `{ error: string, fields?: Record<string, string> }`
- **SQLite** database; parameterized queries

### Frontend requirements

- **Login** — email + password, inline validation and API errors, redirect to task list on success
- **Task list** — pagination; filter status/priority; column sort; title search; mark complete inline; edit (owner/admin); delete (**admin only**); loading skeleton + error state
- **Task detail** — full fields; edit/delete with confirmation; role-aware actions (delete **admin only**)
- **Add / edit task** — all fields + user picker; client validation; loading on submit
- **State:** auth in **React Context**; tasks via **`useTasks`** / **`useTask`** (no auth prop-drilling)
- **UI:** responsive, **Tailwind CSS**, loading and error states for async work, **protected routes**

### What reviewers prioritize

1. Validation completeness (edge cases, unknown fields, types)
2. Consistent error responses
3. Authorization (RBAC actually enforced server-side)
4. SQL hygiene (parameterized queries)
5. Separation: validators, controllers, services, middleware

Secondary (nice-to-have): UI polish, Redux, full test coverage.

---

## Implementation mapping (this repo)

| Requirement | Location |
|-------------|----------|
| Zod validators, `.strict()` bodies | `backend/src/validators/` |
| Task list filters, pagination, sort, search | `backend/src/services/task.service.js`, `task.validator.js` |
| RBAC on tasks | `canAccessTask` in `task.service.js` |
| bcrypt 12 rounds | `backend/src/services/auth.service.js` (`BCRYPT_ROUNDS`) |
| JWT 8h | `backend/src/utils/jwt.js` |
| Error handler + Zod → 422 | `backend/src/middleware/error.middleware.js` |
| Morgan | `backend/src/app.js` |
| Auth context | `frontend/src/context/AuthProvider.tsx` |
| `useTasks` / `useTask` | `frontend/src/hooks/useTasks.ts`, `useTask.ts` |
| Permissions (UI) | `frontend/src/utils/permissions.ts` |

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Backend | Node.js (ES modules), Express, SQLite (`sqlite3`), Zod, bcrypt, JWT, morgan |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide |

## Repository layout

```
Siva-Assignment/
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── .env.example
├── frontend/
│   └── .env.example
└── README.md
```

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**

## Configuration

### Backend

```bash
cd backend
cp .env.example .env
```

On Windows: `copy .env.example .env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default **3001**) |
| `JWT_SECRET` | Secret for JWT signing |
| `DATABASE_PATH` | SQLite file (e.g. `./data/tasks.db`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:3000`) |
| `SEED_ADMIN_*` | Optional seed admin on first DB init |

### Frontend

```bash
cd frontend
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:3001` |

## Running locally

**Terminal 1 — API**

```bash
cd backend
npm install
npm run dev
```

Listen address: `http://localhost:3001`. Health: `GET /health`.

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev
```

Vite is configured for **`http://localhost:3000`** (`frontend/vite.config.ts`).

**Production build (frontend)**

```bash
cd frontend
npm run build
npm run preview
```

## API quick reference

Protected routes need `Authorization: Bearer <token>`.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | No auth |
| POST | `/auth/signup`, `/auth/login` | Public |
| GET | `/auth/me` | Auth |
| GET | `/tasks` | Query: `page`, `limit`, `status`, `priority`, `assignedTo`, `sortBy`, `order`, `search` |
| POST | `/tasks` | Create |
| GET/PUT/DELETE | `/tasks/:id` | UUID `id` |

## Database

- Schema: `backend/src/db/schema.sql`
- `tasks.assigned_to` and `tasks.created_by` → `users.id`
- DB files under `backend/data/` are gitignored
