# ReviveHub — Replacement Management System

A full-stack application for managing product replacement/return (RMA) workflows. Built with Next.js and Fastify.

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, TanStack React Query, Axios |
| Backend  | Fastify 5, TypeScript, Knex.js              |
| Database | SQLite (via better-sqlite3)                 |
| Auth     | JWT (`@fastify/jwt`, bcryptjs)              |

## Project Structure

```
ReviveHub/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── companies/     # CRUD pages
│   │   │   ├── customers/     # CRUD pages
│   │   │   ├── products/      # CRUD pages
│   │   │   ├── returns/       # RMA workflow pages
│   │   │   ├── reports/       # Export reports
│   │   │   ├── users/         # Admin user management
│   │   │   └── login/         # Auth page
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context provider
│   │   ├── hooks/             # TanStack Query hooks
│   │   └── lib/               # API client (Axios)
│   └── package.json
├── server/                    # Fastify backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrations/    # Knex schema migrations
│   │   │   ├── seeds/         # Seed data
│   │   │   └── index.ts       # DB connection
│   │   ├── middleware/        # Auth middleware
│   │   └── routes/            # API route handlers
│   └── package.json
├── setup.ps1                  # One-time project setup
├── devStart.bat               # Start dev servers
├── start.bat                  # Install, build & start
└── deploy.ps1                 # Production deployment
```

## Quick Start

### Prerequisites
- Node.js 18.17+
- npm

### Setup & Run

```bash
# 1. Install dependencies & run migrations
.\setup.ps1

# 2. Start development servers
.\devStart.bat
```

Or manually:

```bash
# Terminal 1 — Server
cd server
npm install
npm run migrate
npm run seed
npm run dev          # → http://localhost:3001

# Terminal 2 — Client
cd client
npm install
npm run dev          # → http://localhost:3000
```

### Default Credentials
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |

## Features

- **Dashboard** — Overview stats, lifecycle breakdown, company-wise charts
- **Masters** — Manage Companies, Customers, Products, Users
- **RMA Workflow** — Track returns through 4 statuses: Received → Sent to Company → Received from Company → Completed
- **Reports** — Filterable, exportable reports (PDF / Excel) with custom column selection
- **Authentication** — JWT-based login with role-based access
- **Roles** — Admin (full access), Operator (CRUD), Viewer (read-only)
- **View-Only Mode** — Per-user flag that blocks all write operations
- **Error Handling** — All API errors return consistent JSON with user-friendly messages; input validation prevents 500s on missing required fields
- **Toast Notifications** — Failed operations show auto-dismissing toast messages; no silent failures

## API Overview

All API routes are prefixed with `/api`. Authentication is via `Authorization: Bearer <token>` header.

| Endpoint                              | Methods               | Auth Required |
|---------------------------------------|-----------------------|---------------|
| `/auth/login`                         | POST                  | No            |
| `/auth/register`                      | POST                  | Admin         |
| `/auth/me`                            | GET                   | Yes           |
| `/auth/users`                         | GET, POST, PUT, DELETE | Admin        |
| `/companies`                          | GET, POST, PUT, DELETE | Yes          |
| `/customers`                          | GET, POST, PUT, DELETE | Yes          |
| `/products`                           | GET, POST, PUT, DELETE | Yes          |
| `/returns`                            | GET, POST             | Yes           |
| `/returns/:id/send-to-company`        | PATCH                 | Yes           |
| `/returns/:id/receive-from-company`   | PATCH                 | Yes           |
| `/returns/:id/complete`               | PATCH                 | Yes           |

## Authorization Model

| Role      | Read | Create | Edit | Delete | Admin Users |
|-----------|------|--------|------|--------|-------------|
| Admin     | ✅   | ✅     | ✅   | ✅     | ✅          |
| Operator  | ✅   | ✅     | ✅   | ✅     | ❌          |
| Viewer    | ✅   | ❌     | ❌   | ❌     | ❌          |

If a user has `view_only = true`, all write operations are blocked regardless of role.

Viewer users linked to a `customer_id` will only see returns belonging to that customer.

## Deployment

```powershell
.\deploy.ps1 -DeploymentPath "C:\ReviveHub" -SetupServices
```

See `deploy.ps1` for full options (ports, database path, Windows service setup via NSSM).

## Environment Variables

### Server (`server/.env`)
| Variable        | Default                    | Description                |
|-----------------|----------------------------|----------------------------|
| `PORT`          | `3001`                     | Server port                |
| `DATABASE_PATH` | `data.db`                  | SQLite file path           |
| `CORS_ORIGIN`   | `true`                     | CORS origin (true = all)   |
| `JWT_SECRET`    | *(required)*               | JWT signing secret         |
| `NODE_ENV`      | `development`              | Environment mode           |

### Client (`client/.env.local`)
| Variable                 | Default                                | Description            |
|--------------------------|----------------------------------------|------------------------|
| `NEXT_PUBLIC_API_URL`    | `http://localhost:3001/api`            | Backend API base URL   |
