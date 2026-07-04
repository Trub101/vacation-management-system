# Vacation Management System

A full-stack vacation browsing platform. Users can browse vacations, like/unlike
them, get AI travel recommendations, and query the database in plain English via a
custom **MCP** server. Admins can add/edit/delete vacations and view a likes report
with charts and CSV export.

> **GitHub:** _add your repository URL here_

---

## Tech stack

**Backend** — Node.js · TypeScript · Express · MySQL (`mysql2`) · JWT · bcrypt ·
Multer · Joi · `@modelcontextprotocol/sdk` (custom MCP server) · `@anthropic-ai/sdk`
(`claude-sonnet-4-6`).

**Frontend** — React 18 · TypeScript · Redux Toolkit · React Router v6 · Axios ·
Recharts · React Hook Form · date-fns · react-toastify · Vite.

**Infra** — Docker Compose · MySQL 8 · Node 18 Alpine · Nginx.

---

## Default logins

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | `admin@test.com` | `admin123`|
| User  | `user@test.com`  | `user123` |
| User  | `sarah@test.com` | `user123` |
| User  | `david@test.com` | `user123` |

---

## Project structure

```
project-root/
├── docker-compose.yml
├── .env                     # ANTHROPIC_API_KEY for docker compose (gitignored)
├── Database/
│   └── vacations_db.sql     # schema + seed (users, vacations, likes)
├── Backend/
│   ├── Dockerfile
│   ├── .env                 # backend config (gitignored)
│   ├── Vacations.postman_collection.json
│   ├── uploads/             # uploaded vacation images
│   └── src/                 # app.ts, config, controllers, middleware,
│                            # models, routes, mcp/, utils
└── Frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/                 # index.tsx, App.tsx, store, components,
                             # pages, services, types
```

---

## Run it — Option A: Docker (everything in containers)

1. Paste your Anthropic API key into the root **`.env`**:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
2. From the project root:
   ```bash
   docker compose up --build
   ```
3. Open:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:4000/api/health
   - MySQL is exposed on host port **3307** (container port 3306).

The database is created and seeded automatically from `Database/vacations_db.sql`.

---

## Run it — Option B: Local dev (hot reload)

**1. Database** — a MySQL 8 container must be running with the `vacations_db`
database. If you don't already have one:
```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=rootpassword -p 3306:3306 -d mysql:8
# then load the schema + seed:
docker exec -i mysql sh -c 'exec mysql -uroot -prootpassword' < Database/vacations_db.sql
```

**2. Backend**
```bash
cd Backend
npm install
cp .env.example .env        # then set ANTHROPIC_API_KEY
npm run dev                 # http://localhost:4000
```

**3. Frontend**
```bash
cd Frontend
npm install
npm run dev                 # http://localhost:5173
```
The Vite dev server proxies `/api` to the backend, so just open
**http://localhost:5173**.

---

## API endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | public | Register, returns JWT |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET  | `/api/auth/check-email?email=` | public | Email availability |
| GET  | `/api/vacations?filter=&page=&limit=` | auth | List with like counts + is_liked |
| GET  | `/api/vacations/:id` | auth | Single vacation |
| POST | `/api/vacations` | admin | Add (multipart image) |
| PUT  | `/api/vacations/:id` | admin | Edit (image optional) |
| DELETE | `/api/vacations/:id` | admin | Delete |
| GET  | `/api/vacations/reports/likes` | admin | Likes per destination |
| GET  | `/api/vacations/images/:filename` | public | Serve image |
| POST | `/api/likes/:vacationId` | user | Like |
| DELETE | `/api/likes/:vacationId` | user | Unlike |
| POST | `/api/ai/recommend` | auth | AI travel recommendation |
| POST | `/api/mcp/query` | auth | Natural-language DB query via MCP |

Import **`Backend/Vacations.postman_collection.json`** into Postman to try them all
(run a Login request first — the token is saved automatically).

---

## MCP server

`Backend/src/mcp/mcp-server.ts` is a real MCP server built with
`@modelcontextprotocol/sdk`. It exposes six read-only tools that run SQL against
MySQL:

- `get_active_vacations_count`
- `get_average_vacation_price`
- `get_future_vacations_by_region` (input: `region`)
- `get_vacations_with_likes`
- `get_total_users_count`
- `search_vacations` (input: `keyword`)

`POST /api/mcp/query` connects an in-process MCP **client** to this server over an
in-memory transport, hands the tools to Claude (`claude-sonnet-4-6`), lets Claude
call them to read real data, and returns Claude's final natural-language answer.

---

## Notes on images

Seed vacations reference filenames like `paris.jpg`. If those files aren't present
in `Backend/uploads/`, the UI shows a generated gradient placeholder with the
destination name — the app stays fully functional. Drop real images named to match
(`paris.jpg`, `rome.jpg`, …) into `Backend/uploads/` to show photos, or upload new
images through the admin **Add / Edit Vacation** pages.

---

_Built by Daniel Trubiner — John Bryce full-stack project, 2026._
