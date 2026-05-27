# ⚓ Fathom Marine — Maritime Operations & Compliance System

## 📌 Project Overview

Fathom Marine is a full-stack maritime operations and compliance management platform designed to help marine organizations manage:

* Ship maintenance activities
* Safety drill scheduling and participation
* Compliance monitoring across ships
* Crew task management

The system ensures that ships remain operationally safe and compliant with maritime regulations.

---

# 🔄 Business Flow of the Application

## 1. User Authentication Flow

### Admin Login

1. Admin enters email and password.
2. Backend validates credentials.
3. JWT token is generated.
4. Admin is redirected to Admin Dashboard.

### Crew Login

1. Crew member logs in using credentials.
2. Backend validates user role.
3. JWT token is issued.
4. Crew user is redirected to Crew Dashboard.

---

# ⚙️ Admin Workflow

## Ship Management

Admin can:

* Create ships
* Update ship information
* View all ships
* Delete ships

### Flow

Admin Dashboard → Ships Page → Create/Edit Ship → Save to MongoDB

---

## Maintenance Management

Admin creates maintenance tasks for ships.

### Admin Actions

* Create maintenance task
* Assign task to crew member
* Set due date
* Set task priority
* Monitor task status

### Task Status Flow

Pending → In Progress → Completed

### Flow

Admin Dashboard → Maintenance Page → Create Task → Assign Crew → Save Task

---

## Safety Drill Management

Admin schedules safety drills.

### Admin Actions

* Create drill
* Assign drill to ships
* Set drill date
* Monitor participation

### Flow

Admin Dashboard → Drills Page → Schedule Drill → Assign Ship/Crew

---

# 👨‍✈️ Crew Workflow

## Crew Maintenance Flow

Crew members:

* View assigned tasks
* Update task status
* Add comments/notes

### Flow

Crew Dashboard → View Tasks → Update Status → Save Notes

---

## Crew Drill Flow

Crew members:

* View upcoming drills
* Mark attendance
* Submit completion

### Flow

Crew Dashboard → Upcoming Drills → Mark Attendance

---

# 📊 Compliance Monitoring Flow

The system automatically calculates compliance.

## Maintenance Compliance

Formula:

Completed Maintenance Tasks / Total Maintenance Tasks × 100

---

## Drill Compliance

Formula:

Completed Drills / Total Scheduled Drills × 100

---

## Overall Compliance

Formula:

(Maintenance Compliance + Drill Compliance) / 2

---

## Non-Compliance Logic

A ship becomes non-compliant if:

* Any maintenance task passes due date without completion
* Any safety drill is missed
* Overall compliance drops below 70%

---

# 🏗️ Architecture Decisions

## Frontend Architecture

### Technology Used

* React
* TypeScript
* Vite
* Axios
* Recharts

### Why React?

React provides:

* Component-based architecture
* Reusable UI components
* Fast rendering using Virtual DOM
* Easy state management with hooks

### Why TypeScript?

TypeScript improves:

* Type safety
* Code maintainability
* Error detection during development

### Why Vite?

Vite provides:

* Fast development server
* Faster builds
* Better developer experience

---

# Backend Architecture

## Technology Used

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

---

## Why Node.js?

Node.js supports:

* Fast API development
* Non-blocking asynchronous architecture
* JavaScript on both frontend and backend

---

## Why Express.js?

Express simplifies:

* REST API creation
* Routing
* Middleware handling
* Error handling

---

## Why MongoDB?

MongoDB was selected because:

* Flexible document structure
* Easy handling of nested data
* Good scalability
* Suitable for ship activities and attendance records

---

## Why Mongoose?

Mongoose provides:

* Schema validation
* Cleaner MongoDB queries
* Virtual properties
* Better data modeling

---

# 🔐 Authentication & Authorization

## JWT Authentication

The system uses JWT for authentication.

### Flow

1. User logs in
2. Backend generates JWT token
3. Token stored on frontend
4. Token attached in protected API requests
5. Middleware validates token

---

## Role-Based Access Control (RBAC)

### Admin Permissions

* Manage ships
* Manage users
* Create tasks
* Schedule drills
* View compliance dashboard

### Crew Permissions

* View assigned tasks
* Update task status
* Mark drill attendance
* Add notes/comments

---

# 🗄️ Database Design

## Collections Used

### Users Collection

Stores:

* Name
* Email
* Password
* Role
* Assigned ship

### Ships Collection

Stores:

* Ship name
* Registration details
* Assigned crew

### Maintenance Tasks Collection

Stores:

* Task title
* Assigned crew
* Ship
* Status
* Due date
* Notes

### Safety Drills Collection

Stores:

* Drill type
* Scheduled date
* Ship assignment
* Attendance

---

# 📡 API Design

## REST API Structure

### Authentication

* POST /api/auth/login
* POST /api/auth/register

### Ships

* GET /api/ships
* POST /api/ships

### Maintenance

* GET /api/maintenance
* POST /api/maintenance
* PUT /api/maintenance/:id

### Drills

* GET /api/drills
* POST /api/drills
* PUT /api/drills/:id/attend

### Compliance

* GET /api/compliance

---

# 🚀 Setup Steps

## Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs on:
[http://localhost:5000](http://localhost:5000)

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
[http://localhost:5173](http://localhost:5173)

---

# 🔑 Environment Variables

## Backend .env

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

# 🌐 Deployment

## Frontend Deployment

* Vercel

## Backend Deployment

* Render

## Database

* MongoDB Atlas

---

# ✅ Features Implemented

## Core Features

* Ship maintenance management
* Safety drill scheduling
* Crew task management
* Compliance monitoring
* JWT authentication
* Role-based access control
* Dashboard analytics

## Bonus Features

* Charts using Recharts
* Dark mode UI
* Filters and search
* Overdue alerts
* Responsive design

---

# 📈 Future Improvements

* Real-time notifications
* Docker containerization
* Email alerts
* Audit logs
* Multi-language support
* Advanced analytics dashboard

---

# 👨‍💻 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Axios
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT

---

OUTPUT
<img width="1916" height="1072" alt="image" src="https://github.com/user-attachments/assets/3bf23fed-6d7a-406b-92d0-4caba9ca2725" />
<img width="1903" height="1088" alt="image" src="https://github.com/user-attachments/assets/47d87b63-8fd3-4ecf-b3d9-d79d46688430" />
<img width="1919" height="1080" alt="image" src="https://github.com/user-attachments/assets/288dc6b3-bf4b-4587-bbe6-28988cf6d85c" />
<img width="1902" height="1069" alt="image" src="https://github.com/user-attachments/assets/1d946118-72ff-4a57-974f-faa95ac277cc" />
<img width="1917" height="1076" alt="image" src="https://github.com/user-attachments/assets/aeba4211-cd35-4c16-a94d-b403e1774c32" />
<img width="1915" height="1088" alt="image" src="https://github.com/user-attachments/assets/85e5b881-c1dc-4c2f-8756-4e46773289c6" />

# 📌 Conclusion

Fathom Marine provides a scalable and efficient platform for managing maritime maintenance operations and compliance tracking. The application demonstrates full-stack development concepts including REST APIs, authentication, database design, role-based access control, compliance calculation, and responsive frontend architecture.
