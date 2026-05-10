# ⚓ Fathom Marine — Maritime Operations & Compliance System

A full-stack web application for managing ship maintenance, safety drills, and fleet compliance monitoring.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (running locally on port 27017)

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed      # Seeds DB with ships, users, tasks, drills
npm run dev       # Starts API on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts UI on http://localhost:5173
```

---

## 🔐 Demo Login Credentials

| Role  | Email                        | Password  |
|-------|------------------------------|-----------|
| Admin | admin@fathommarine.com       | admin123  |
| Crew  | john@fathommarine.com        | crew123   |
| Crew  | sarah@fathommarine.com       | crew123   |
| Crew  | carlos@fathommarine.com      | crew123   |
| Crew  | emma@fathommarine.com        | crew123   |

---

## 🏗️ Architecture

```
fathom-marine/
├── backend/                  # Node.js + Express + MongoDB
│   └── src/
│       ├── config/db.js      # MongoDB connection
│       ├── models/           # Mongoose schemas
│       │   ├── Ship.js
│       │   ├── User.js
│       │   ├── MaintenanceTask.js
│       │   └── SafetyDrill.js
│       ├── routes/           # REST API endpoints
│       │   ├── auth.js       # Login / Register
│       │   ├── ships.js      # Ship CRUD
│       │   ├── users.js      # User management
│       │   ├── maintenance.js# Maintenance task CRUD
│       │   ├── drills.js     # Safety drill CRUD + attendance
│       │   └── compliance.js # Compliance calculation
│       ├── middleware/auth.js # JWT + role guard
│       ├── utils/seed.js     # DB seeder
│       └── server.js         # Express entry point
│
└── frontend/                 # React + TypeScript + Vite
    └── src/
        ├── api/              # Axios client + service functions
        ├── context/          # AuthContext (JWT, role)
        ├── components/       # Sidebar, Topbar
        └── pages/
            ├── LoginPage.tsx
            ├── Dashboard.tsx        # Admin compliance overview
            ├── MaintenancePage.tsx  # Admin task management
            ├── DrillsPage.tsx       # Admin drill scheduling
            ├── ShipsPage.tsx        # Admin ship management
            ├── UsersPage.tsx        # Admin user management
            ├── CrewDashboard.tsx    # Crew home
            ├── CrewTasksPage.tsx    # Crew task view
            └── CrewDrillsPage.tsx   # Crew drill schedule
```

---

## 📡 API Endpoints

| Method | Endpoint                        | Auth     | Description                |
|--------|---------------------------------|----------|----------------------------|
| POST   | /api/auth/login                 | Public   | Login, returns JWT         |
| POST   | /api/auth/register              | Public   | Create account             |
| GET    | /api/ships                      | Any      | List all ships             |
| POST   | /api/ships                      | Admin    | Create ship                |
| GET    | /api/maintenance                | Any      | List tasks (filter support)|
| POST   | /api/maintenance                | Admin    | Create maintenance task    |
| PUT    | /api/maintenance/:id            | Any      | Update task / add note     |
| GET    | /api/drills                     | Any      | List drills                |
| POST   | /api/drills                     | Admin    | Schedule drill             |
| PUT    | /api/drills/:id/attend          | Crew     | Mark drill attendance      |
| GET    | /api/compliance                 | Any      | Fleet compliance stats     |
| GET    | /api/users                      | Admin    | List all users             |

---

## ⚙️ Architecture Decisions

### Why MongoDB?
- Flexible document model suits nested structures (participants, notes)
- Mongoose virtuals cleanly compute `isOverdue` / `isMissed` on the fly

### Why JWT + role middleware?
- Stateless auth scales horizontally
- `adminOnly` middleware enforces RBAC at the route level
- Crew users automatically see only their own assigned tasks

### Compliance Calculation
```
Maintenance Compliance % = (Completed Tasks / Total Tasks) × 100
Drill Compliance %       = (Completed Drills / Total Drills) × 100
Overall Compliance %     = Average of both
Non-compliant            = Overall < 70% or any item past due
```

### Frontend State
- No heavy state library — React hooks + context are sufficient for this scale
- Role-based routing: Admins → `/dashboard`, Crew → `/crew`

---

## ✅ Features Implemented

### Core
- [x] Ship maintenance task CRUD (Admin)
- [x] Task assignment to crew members
- [x] Task status: Pending → In Progress → Completed
- [x] Crew can view tasks, update status, add notes
- [x] Safety drill scheduling (Admin)
- [x] Crew attendance marking
- [x] Compliance dashboard with charts
- [x] Overdue task & missed drill highlighting

### Bonus
- [x] Role-based access control (Admin / Crew)
- [x] Filters (by ship, status, priority, type, date)
- [x] Overdue notifications & alerts
- [x] Charts (BarChart, PieChart via Recharts)
- [x] Premium dark-mode UI
