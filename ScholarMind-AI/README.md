# ScholarMind AI 🎓

**Intelligent Research Paper Analysis, Knowledge Discovery, and Academic Recommendation Platform**

> B.Tech 4th Year Computer Science Major Project · Stage 1 Prototype

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docker.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [Option A: Docker (Recommended)](#option-a-docker-recommended)
  - [Option B: Manual Setup](#option-b-manual-setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🌟 Overview

ScholarMind AI is an AI-powered academic research assistant platform. In Stage 1, it provides a complete production-grade prototype for managing research papers, organizing them into projects, maintaining interaction history, and discovering related work.

The UI is inspired by ChatGPT, NotebookLM, Notion, and Perplexity — featuring a premium dark mode design with glass morphism, smooth animations, and a responsive layout.

---

## ✨ Features (Stage 1)

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | JWT-based auth with bcrypt hashing, register/login/logout |
| 📊 Dashboard | Stats overview, recent papers, projects, and activity |
| 📚 My Library | Upload, search, filter, sort, paginate research papers |
| 📁 Projects | Create workspaces, group papers, organize research |
| 🕐 History | ChatGPT-style session history grouped by date |
| 🔍 Search | Global search across papers, projects, and history |
| 📤 Upload | Drag & drop PDF upload (max 50MB) with validation |
| 🔖 Bookmarks | Save important papers and projects |
| 🌙 Dark/Light Mode | Theme toggle, persisted to localStorage |
| 📱 Responsive | Mobile-first, works on all screen sizes |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS + Custom Design System
- React Router v6 (protected routes)
- Axios (HTTP client with interceptors)
- Framer Motion (animations)
- Lucide React (icons)
- React Dropzone (file upload)

**Backend**
- FastAPI (Python 3.11+)
- SQLAlchemy 2.0 (ORM)
- Alembic (database migrations)
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- Uvicorn (ASGI server)

**Database**
- PostgreSQL 15
- pg_trgm extension (fuzzy search)
- UUID primary keys
- Normalized schema with triggers

**DevOps**
- Docker + Docker Compose
- Environment variable configuration
- Health checks

---

## 📁 Project Structure

```
ScholarMind-AI/
├── 📁 backend/                    # FastAPI application
│   ├── main.py                    # App entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── core/
│       │   ├── config.py          # Settings (pydantic-settings)
│       │   ├── database.py        # SQLAlchemy engine + session
│       │   ├── security.py        # JWT + bcrypt
│       │   └── dependencies.py    # FastAPI dependencies
│       ├── models/                # SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── project.py
│       │   ├── paper.py
│       │   ├── history.py
│       │   ├── bookmark.py
│       │   └── upload.py
│       ├── schemas/               # Pydantic v2 schemas
│       │   ├── auth.py
│       │   ├── project.py
│       │   ├── paper.py
│       │   ├── history.py
│       │   ├── bookmark.py
│       │   ├── search.py
│       │   └── common.py
│       ├── routers/               # Route handlers
│       │   ├── auth.py
│       │   ├── projects.py
│       │   ├── papers.py
│       │   ├── history.py
│       │   ├── search.py
│       │   ├── upload.py
│       │   ├── bookmarks.py
│       │   └── stats.py
│       ├── services/              # Business logic
│       │   ├── auth_service.py
│       │   ├── project_service.py
│       │   ├── paper_service.py
│       │   ├── history_service.py
│       │   ├── search_service.py
│       │   └── upload_service.py
│       ├── middleware/
│       │   └── logging_middleware.py
│       └── utils/
│           ├── file_utils.py
│           └── response_utils.py
│
├── 📁 frontend/                   # React + Vite application
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Root component
│       ├── index.css              # Global styles + CSS vars
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── usePapers.js
│       │   ├── useProjects.js
│       │   ├── useHistory.js
│       │   ├── useSearch.js
│       │   ├── useDebounce.js
│       │   └── useLocalStorage.js
│       ├── services/
│       │   ├── api.js             # Axios instance + interceptors
│       │   ├── authService.js
│       │   ├── paperService.js
│       │   ├── projectService.js
│       │   ├── historyService.js
│       │   ├── searchService.js
│       │   ├── statsService.js
│       │   └── bookmarkService.js
│       ├── router/
│       │   ├── index.jsx
│       │   └── ProtectedRoute.jsx
│       ├── components/
│       │   ├── UI/                # Reusable primitives
│       │   ├── Layout/            # App shell
│       │   ├── Papers/            # Paper-related
│       │   ├── Projects/          # Project-related
│       │   ├── Dashboard/         # Dashboard widgets
│       │   ├── Search/            # Search components
│       │   └── History/           # History components
│       ├── pages/
│       │   ├── Auth/              # Login, Register, ForgotPassword
│       │   ├── Dashboard/
│       │   ├── Library/
│       │   ├── Projects/
│       │   ├── History/
│       │   ├── Search/
│       │   └── NotFoundPage.jsx
│       └── utils/
│           ├── formatters.js
│           ├── validators.js
│           └── constants.js
│
├── 📁 database/
│   ├── schema.sql                 # Full PostgreSQL DDL
│   └── init.sql                   # Seed data + initialization
│
├── 📁 uploads/                    # PDF file storage (git-ignored)
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ✅ Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18.x+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://python.org/) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org/) |
| Docker Desktop | Latest | [docker.com](https://docker.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Installation Guide

### Option A: Docker (Recommended)

> This starts PostgreSQL + FastAPI + React in one command.

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ScholarMind-AI.git
cd ScholarMind-AI

# 2. Copy environment file
cp .env.example .env
# Edit .env with your own values (especially SECRET_KEY and POSTGRES_PASSWORD)

# 3. Start all services
docker-compose up --build

# Services will be available at:
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# DB:        localhost:5432
```

---

### Option B: Manual Setup

#### Step 1 – Database Setup

```bash
# Start PostgreSQL and create database
psql -U postgres
```

```sql
CREATE DATABASE scholarmind_db;
CREATE USER scholarmind_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE scholarmind_db TO scholarmind_user;
\q
```

```bash
# Apply schema
psql -U scholarmind_user -d scholarmind_db -f database/schema.sql
```

---

#### Step 2 – Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your PostgreSQL credentials and SECRET_KEY

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: `http://localhost:8000`  
✅ Swagger UI at: `http://localhost:8000/docs`  
✅ ReDoc at: `http://localhost:8000/redoc`

---

#### Step 3 – Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit VITE_API_BASE_URL if needed

# Start development server
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

---

#### Step 4 – Create Upload Directory

```bash
mkdir -p uploads
```

---

## 📖 API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

The API auto-generates interactive documentation from FastAPI route definitions.

---

## 🔐 Default Demo Credentials

After seeding the database:
```
Email:    demo@scholarmind.ai
Password: Scholar@123
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `SECRET_KEY` | JWT signing key (min 32 chars) | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `60` |
| `UPLOAD_DIR` | File upload directory | `uploads` |
| `MAX_FILE_SIZE_MB` | Max PDF size | `50` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api/v1` |

---

## 🗺️ Roadmap

- **Stage 1** ✅ – Auth, Dashboard, Library, Projects, History, Search, Upload
- **Stage 2** 🚧 – PDF parsing, embeddings, RAG pipeline, AI chat
- **Stage 3** 📋 – Knowledge graph, gap detection, literature review, trends

---

## 📄 License

This project is developed as an academic major project. All rights reserved.

---

## 👨‍💻 Author

**ScholarMind AI** – B.Tech Computer Science Major Project, 2025–2026
