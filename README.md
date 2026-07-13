# 🏠 StaySphere — PG & Hostel Management System

<div align="center">

![StaySphere Banner](https://img.shields.io/badge/StaySphere-v1.0-6366f1?style=for-the-badge&logo=house&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack property management platform for PGs, hostels, and rental properties.**  
Manage tenants, rooms, rent, maintenance, visitors, and more — all in one place.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [User Roles](#-user-roles)
- [Database Schema](#-database-schema)
- [Error Codes](#-error-response-format)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**StaySphere** is a comprehensive property management system built for PG (Paying Guest) accommodations, hostels, and rental properties. It provides a unified platform for property owners, staff, and tenants to manage all aspects of accommodation — from onboarding tenants and tracking rent to resolving maintenance issues and logging visitors.

---

## ✨ Features

### 👑 For Owners & Admins
- 📊 **Dashboard Analytics** — Revenue charts, occupancy rates, pending payments
- 🏢 **Property Management** — Add and manage multiple properties
- 🛏️ **Room & Bed Management** — Auto-generate beds based on room capacity
- 👥 **Tenant Management** — Register tenants, allocate beds, manage profiles & KYC
- 💰 **Rent & Invoicing** — Auto-generate monthly invoices, track payments via Razorpay
- 🔧 **Maintenance Tracking** — Assign staff to complaints, track resolution status
- 👁️ **Visitor Logging** — Record entry/exit of all visitors
- 📅 **Attendance Tracker** — Monitor staff and tenant check-in/check-out
- 📢 **Notice Board** — Publish announcements, events, and emergency alerts
- 💸 **Expense Management** — Track electricity, water, salary, maintenance costs
- 📄 **Digital Agreements** — Create and manage rental agreements with e-signatures

### 🏠 For Tenants
- View personal dashboard with rent status, room info, and active complaints
- Pay rent online via Razorpay integration
- Raise and track maintenance requests
- View and sign rental agreements digitally
- Access notices and announcements

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | **FastAPI** 0.110+ |
| ORM | **SQLAlchemy** 2.0 |
| Database | **SQLite** (dev) / **PostgreSQL** (prod) |
| Authentication | **JWT** via `python-jose` + `passlib[bcrypt]` |
| Validation | **Pydantic** v2 |
| Payments | **Razorpay** (simulated) |
| File Storage | **Cloudinary** |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | **React** 19 + **TypeScript** |
| Build Tool | **Vite** 8 |
| Styling | **Tailwind CSS** 3.4 |
| Routing | **React Router DOM** 6 |
| HTTP Client | **Axios** |
| Forms | **React Hook Form** + **Zod** |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |

---

## 📁 Project Structure

```
stay-sphere/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/      # Route handlers (auth, rooms, tenants, etc.)
│   │   ├── auth/               # JWT authentication logic
│   │   ├── core/               # Config & settings
│   │   ├── database/           # DB session & engine
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── main.py             # FastAPI app entrypoint
│   ├── tests/                  # Backend test suite
│   ├── .env.example            # Environment variable template
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── ui/             # Base UI primitives (Card, Dialog, etc.)
│   │   ├── pages/              # Application pages
│   │   │   ├── Auth/           # Login & Signup
│   │   │   ├── Dashboard/      # Main dashboard
│   │   │   ├── Property/       # Property management
│   │   │   ├── Room/           # Room management
│   │   │   ├── Tenant/         # Tenant management
│   │   │   ├── Rent/           # Rent & invoices
│   │   │   ├── Maintenance/    # Maintenance tickets
│   │   │   ├── Visitor/        # Visitor logs
│   │   │   ├── Attendance/     # Attendance tracking
│   │   │   ├── Notice/         # Notice board
│   │   │   ├── Expense/        # Expense tracking
│   │   │   ├── Agreement/      # Digital agreements
│   │   │   └── Reports/        # Analytics & reports
│   │   ├── context/            # React context (Auth, etc.)
│   │   ├── services/           # API service layer (api.ts)
│   │   └── App.tsx             # Root component with routing
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── scripts/                    # Utility scripts
├── backend_docs.md             # Full API documentation
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- **Git**

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# 5. Start the development server
python -m uvicorn app.main:app --reload --port 8000
```

> ✅ The backend auto-creates all database tables on startup.  
> 📖 API docs available at: **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start the development server
npm run dev
```

> 🌐 Frontend runs at: **http://localhost:5173**

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory based on `.env.example`:

```env
# Application
SECRET_KEY=your_super_secret_jwt_key_here
PROJECT_NAME=StaySphere

# Database
DATABASE_URL=sqlite:///./staysphere.db
# For PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/staysphere

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=rzp_test_your_key_secret
```

---

## 📡 API Overview

> **Base URL:** `http://localhost:8000`  
> **API Prefix:** `/api/v1`  
> **Auth:** Bearer Token (JWT) — 7-day expiry, HS256

| # | Module | Prefix | Description |
|---|--------|--------|-------------|
| 1 | 🔑 Authentication | `/api/v1/auth` | Signup, login, password reset |
| 2 | 🏢 Properties | `/api/v1/properties` | CRUD for properties |
| 3 | 🛏️ Rooms & Beds | `/api/v1/rooms` | Room management, bed tracking |
| 4 | 👥 Tenants | `/api/v1/tenants` | Tenant registration & profiles |
| 5 | 💰 Rent | `/api/v1/rent` | Invoices, payments, receipts |
| 6 | 🔧 Maintenance | `/api/v1/maintenance` | Complaint tickets & resolution |
| 7 | 👁️ Visitors | `/api/v1/visitors` | Visitor entry & exit logging |
| 8 | 📅 Attendance | `/api/v1/attendance` | Check-in/check-out tracking |
| 9 | 📢 Notices | `/api/v1/notices` | Announcements & notices |
| 10 | 💸 Expenses | `/api/v1/expenses` | Property expense tracking |
| 11 | 📄 Agreements | `/api/v1/agreements` | Digital rental agreements |
| 12 | 📊 Reports | `/api/v1/reports` | Dashboard stats & analytics |

For full API documentation, see [`backend_docs.md`](./backend_docs.md) or visit the live Swagger UI at **http://localhost:8000/docs**.

---

## 👤 User Roles

| Role | Access Level |
|------|-------------|
| `super_admin` | Full platform access — all properties, users, and data |
| `owner` | Manages their own properties, rooms, and tenants |
| `staff` | Operational access — rooms, maintenance, visitors |
| `tenant` | Self-service — own invoices, complaints, agreements |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o| Tenant : "has profile"
    User ||--o{ Attendance : "logs"
    Property ||--o{ Room : "contains"
    Property ||--o{ Visitor : "receives"
    Property ||--o{ Expense : "incurs"
    Property ||--o{ MaintenanceRequest : "handles"
    Room ||--o{ Bed : "has"
    Bed ||--o| Tenant : "assigned to"
    Tenant ||--o{ Invoice : "receives"
    Tenant ||--o{ MaintenanceRequest : "raises"
    Tenant ||--o{ Agreement : "signs"
```

| Model | Table | Key Fields |
|-------|-------|-----------|
| `User` | `users` | `email`, `role`, `status` |
| `Property` | `properties` | `name`, `address`, `type`, `owner_id` |
| `Room` | `rooms` | `room_number`, `room_type`, `price_per_bed`, `capacity` |
| `Bed` | `beds` | `bed_number`, `status` (`vacant`/`occupied`/`maintenance`) |
| `Tenant` | `tenants` | `user_id`, `bed_id`, `status`, `lease_start/end` |
| `Invoice` | `invoices` | `amount`, `status`, `due_date`, `paid_at` |
| `MaintenanceRequest` | `maintenance_requests` | `title`, `status`, `priority`, `assigned_staff_id` |
| `Visitor` | `visitors` | `name`, `phone`, `purpose`, `entry_time`, `exit_time` |
| `Attendance` | `attendances` | `user_id`, `check_in`, `check_out`, `status` |
| `Notice` | `notices` | `title`, `type`, `is_pinned` |
| `Expense` | `expenses` | `category`, `amount`, `date` |
| `Agreement` | `agreements` | `content`, `status`, `signed_at` |

---

## 🛡️ Error Response Format

All API errors follow a consistent format:

```json
{
  "detail": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthorized — invalid or missing token |
| `403` | Forbidden — insufficient role permissions |
| `404` | Resource not found |
| `422` | Unprocessable entity (Pydantic validation) |
| `500` | Internal server error |

---

## 🧪 Running Tests

```bash
# Navigate to the backend directory
cd backend

# Activate your virtual environment, then:
python -m pytest tests/ -v
```

---

## 🔨 Available Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint for code linting |

### Backend
| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start dev server with hot reload |
| `uvicorn app.main:app --port 8000` | Start server on port 8000 |
| `python -m pytest tests/ -v` | Run test suite |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the StaySphere Team

⭐ Star this repo if you find it useful!

</div>
