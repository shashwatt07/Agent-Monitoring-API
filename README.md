# Agent Monitoring API — Full-Stack AI Observability & Fleet Governance

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase_PostgreSQL_17-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/AI_Engine-OpenAI_Python_SDK-412991.svg?logo=openai&logoColor=white)](https://platform.openai.com)
[![Pytest](https://img.shields.io/badge/Tests-13_Passed-brightgreen.svg?logo=pytest&logoColor=white)](https://docs.pytest.org)

A modern full-stack web application designed to manage, monitor, and audit autonomous AI agent fleets with live database persistence, telemetry charts, and AI-powered health evaluations.

---

## 1. Project Overview

In production AI systems, autonomous agents run tasks in the background (web scraping, fraud detection, customer support, document parsing, webhook processing). Without centralized monitoring, operators have no visibility into which agents are active, paused, or failing.

**Agent Monitoring API** solves this by providing:
1. A **FastAPI** backend exposing RESTful endpoints for agent registration, lifecycle management, and audit logging.
2. A hosted cloud database on **Supabase (PostgreSQL 17)** storing real agent records and historical audit activities.
3. An **OpenAI-assisted Health Assessment Engine** with resilient rule-based failover.
4. A sleek **React + Vite + Tailwind CSS** SaaS dashboard with live telemetry indicators, SVG distribution charts, audit timelines, search/filter controls, and confirmation modals.

---

## 2. Problem Statement & Objectives

### The Problem
Autonomous AI agents are increasingly deployed across software pipelines, but tracking their operational health, state transitions, and downtime causes is fragmented. Traditional application monitoring tools are complex and lack agent-specific domain context (e.g., assessing agent workloads and suggesting corrective actions).

### Objectives
- **Centralized Registry**: Provide a single pane of glass to register, inspect, update, and retire AI agents.
- **Relational Audit Trail**: Track every status change and operational milestone in a database table with timestamps.
- **Explainable AI Diagnostics**: Use OpenAI to read agent metadata and activity history, providing concise 2-sentence health summaries and actionable recommendations.
- **Resilient Fallback**: Gracefully degrade to deterministic rule-based assessments if OpenAI API rate limits, network timeouts, or quota limits occur.
- **Live Observability**: Display real-time database connectivity and backend health status.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React, Vite | React 19, Vite 8 | Fast, modern client application with hot module replacement |
| **Language** | TypeScript | 5.8+ | Type safety, strict interface models, and refactoring safety |
| **Styling** | Tailwind CSS | 4.0 (@tailwindcss/vite) | Responsive SaaS dashboard aesthetic with zero runtime CSS overhead |
| **Icons** | Lucide React | Latest | Clean, consistent icons across dashboard actions |
| **Backend API** | FastAPI, Uvicorn | FastAPI 0.111, Uvicorn 0.30 | High-performance Python ASGI server with automatic OpenAPI docs |
| **ORM / Data** | SQLAlchemy, Pydantic | SQLAlchemy 2.0, Pydantic 2.8 | Declarative ORM modeling and strict runtime schema validation |
| **Database** | PostgreSQL 17 | Supabase Hosted (ap-northeast-2) | Managed cloud PostgreSQL with IPv4 session connection pooling |
| **AI Integration** | OpenAI Python SDK | 1.35+ | LLM health evaluation (`gpt-4o-mini` / `gpt-4.1-mini`) |
| **Testing** | Pytest, TestClient | Pytest 8.2, Httpx 0.27 | 13 automated tests using an isolated in-memory SQLite database |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│            http://localhost:5173 (Port 5173)                │
│                                                             │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐  │
│  │ Metrics Cards │ │  Donut Chart   │ │ Live Agent Table │  │
│  └───────────────┘ └────────────────┘ └──────────────────┘  │
│  ┌───────────────────────────────┐ ┌─────────────────────┐  │
│  │ Audit Feed (Recent Activity)  │ │ Health Diagnostics  │  │
│  └───────────────────────────────┘ └─────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                        │
│            http://127.0.0.1:8000 (Port 8000)                │
│                                                             │
│  Routers:                                                   │
│  • GET  /health              (Live DB Ping: SELECT 1)       │
│  • GET  /agents/stats        (Metrics & Recent Audit Log)   │
│  • GET  /agents              (Search & Filter Agents)       │
│  • POST /agents              (Register Agent)               │
│  • GET  /agents/{id}         (Inspect Details & Activities) │
│  • PATCH /agents/{id}/status (Update Status: active/err)    │
│  • DELETE /agents/{id}       (Cascade Delete Agent)         │
│  • GET  /agents/{id}/summary (AI Assessment via OpenAI)     │
└───────────────────┬─────────────────────────────┬───────────┘
                    │                             │
       SQLAlchemy   │ (SSL Encrypted)             │ Official SDK
         Port 5432  ▼                             ▼
   ┌───────────────────────────────┐    ┌─────────────────────┐
   │    Supabase PostgreSQL 17     │    │     OpenAI API      │
   │   (Cloud Hosted Database)     │    │    (gpt-4o-mini)    │
   │                               │    │         OR          │
   │   • agents table              │    │ Rule-Based Fallback │
   │   • activities table (Cascade)│    │   (When 429/Quota)  │
   └───────────────────────────────┘    └─────────────────────┘
```

### How the Components Work Together:
1. **Frontend Request**: The React dashboard uses a centralized API client (`api.ts`) to request agent data.
2. **FastAPI Processing**: FastAPI receives requests, validates input using Pydantic models, and processes business logic in the `agent_service` module.
3. **Database Operations**: SQLAlchemy communicates with the hosted **Supabase PostgreSQL** instance over an SSL-secured session pooler.
4. **AI Observability**: When an operator clicks **"Inspect & AI"** and triggers **"Generate Health Summary"**, the backend passes actual agent metadata and recent activity logs to OpenAI (`OPENAI_MODEL`). If OpenAI is unreachable or returns a quota limit (`429`), the service seamlessly returns a factual, deterministic fallback summary without crashing.
5. **Real-time Feedback**: The frontend receives the response, updates the UI immediately, displays a toast alert, and refreshes the fleet distribution donut chart.

---

## 5. Database Design

The PostgreSQL database uses two related tables with foreign key constraints and cascade deletion:

```mermaid
erDiagram
    AGENTS ||--o{ ACTIVITIES : "has many"
    AGENTS {
        int id PK "Auto-incrementing Identifier"
        string name "Agent Name (max 100)"
        text description "Agent Description"
        string status "active | inactive | error"
        timestamp created_at "Registration Timestamp (UTC)"
        timestamp updated_at "Last Modified Timestamp (UTC)"
    }
    ACTIVITIES {
        int id PK "Auto-incrementing Identifier"
        int agent_id FK "References AGENTS.id ON DELETE CASCADE"
        string event_type "REGISTERED | STATUS_CHANGE | AI_SUMMARY"
        string description "Human-readable event log"
        timestamp timestamp "Event Timestamp (UTC)"
    }
```

- **`agents` Table**: Stores agent metadata and current operational state.
- **`activities` Table**: Stores append-only audit logs. Whenever an agent is registered, changes status, or generates an AI summary, a new event is recorded.
- **Cascade Delete (`ON DELETE CASCADE`)**: When an agent is deleted, all related activity logs are automatically and safely cleaned up, preserving database integrity.

---

## 6. API Endpoint Documentation

| Method | Endpoint | Description | Request Body / Query | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Check backend & database connection status | None | `200 OK` |
| `GET` | `/agents/stats` | Get fleet metrics and top 10 audit logs | None | `200 OK` |
| `POST` | `/agents` | Register a new agent | `{"name": "...", "description": "..."}` | `201 Created` |
| `GET` | `/agents` | List agents with search & status filters | `?search=Alpha&status=active` | `200 OK` |
| `GET` | `/agents/{agent_id}` | Retrieve agent details and full activity log | None | `200 OK` |
| `PATCH` | `/agents/{agent_id}/status` | Update status (`active`, `inactive`, `error`) | `{"status": "inactive"}` | `200 OK` |
| `DELETE` | `/agents/{agent_id}` | Delete agent and cascade remove activities | None | `200 OK` |
| `GET` | `/agents/{agent_id}/activity` | Get activity records for an agent | None | `200 OK` |
| `GET` | `/agents/{agent_id}/summary` | Generate AI health assessment | None | `200 OK` |

Interactive Swagger documentation is available at: **`http://127.0.0.1:8000/docs`**

---

## 7. Folder Structure

```
Agent Monitoring API/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app instance, CORS & lifespan initialization
│   │   ├── config.py            # Pydantic BaseSettings & .env loading
│   │   ├── database.py          # SQLAlchemy engine, session maker & init_db()
│   │   ├── models.py            # Agent and Activity SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request validation and response models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # /health endpoint with active SELECT 1 ping
│   │   │   └── agents.py        # CRUD, status changes, activities & AI summary routes
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── agent_service.py # Database business logic & stats aggregation
│   │       └── ai_service.py    # OpenAI SDK client & resilient fallback engine
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py          # Pytest fixtures & isolated in-memory SQLite DB
│   │   └── test_agents.py       # 13 comprehensive endpoint and error test cases
│   ├── requirements.txt         # Compatible Python dependencies
│   ├── .env                     # Local credentials (git-ignored)
│   ├── .env.example             # Safe template with placeholders
│   └── .gitignore               # Backend gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Header with health badge & action buttons
│   │   │   ├── Sidebar.tsx            # Dark left sidebar with branding & nav
│   │   │   ├── StatCard.tsx           # Fleet metric cards with percentage bars
│   │   │   ├── StatusChart.tsx        # SVG Donut status distribution chart
│   │   │   ├── RecentActivityFeed.tsx # Real-time PostgreSQL audit event feed
│   │   │   ├── AgentTable.tsx         # Searchable, filterable agent directory
│   │   │   ├── AgentModal.tsx         # Agent registration form modal
│   │   │   ├── AgentDetailModal.tsx   # Detailed view, status updater & AI summary
│   │   │   ├── DeleteConfirmModal.tsx # Confirmation dialog for destructive actions
│   │   │   ├── HealthIndicator.tsx    # Live API & Supabase connection badge
│   │   │   └── Toast.tsx              # Toast alerts for feedback notifications
│   │   ├── pages/
│   │   │   └── Dashboard.tsx    # Main layout coordinating state & modals
│   │   ├── services/
│   │   │   └── api.ts           # Type-safe API client for FastAPI endpoints
│   │   ├── types/
│   │   │   └── agent.ts         # TypeScript interfaces (Agent, Activity, Stats)
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # React DOM entry point
│   │   └── index.css            # Tailwind CSS styling & custom scrollbars
│   ├── index.html               # HTML5 entry with Inter font & SEO meta tags
│   ├── package.json             # React 19, Vite 8, Tailwind v4, Lucide React
│   ├── vite.config.ts           # Vite server configuration & Tailwind plugin
│   ├── tsconfig.json            # TypeScript configuration
│   ├── .env                     # Frontend configuration (git-ignored)
│   ├── .env.example             # Safe template for VITE_API_BASE_URL
│   └── .gitignore               # Frontend gitignore
├── start-dev.ps1                # 1-Click launcher script for Windows PowerShell
├── README.md                    # Project documentation & Jury Guide
└── .gitignore                   # Root repository gitignore
```

---

## 8. Installation & Setup

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+ (Node 24 tested)
- **Git**

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API"
```

### Step 2: Backend Setup
```powershell
# 1. Create Python virtual environment
python -m venv backend\venv

# 2. Install backend dependencies
.\backend\venv\Scripts\pip.exe install -r backend\requirements.txt

# 3. Configure backend environment
# Copy backend\.env.example to backend\.env and insert your database credentials:
Copy-Item backend\.env.example backend\.env
```

`backend/.env` contents:
```ini
DATABASE_URL=postgresql://postgres.djozeruyfoidufamjcli:YOUR_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

### Step 3: Frontend Setup
```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install npm packages
npm.cmd install

# 3. Configure frontend environment
Copy-Item .env.example .env
```

`frontend/.env` contents:
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 9. Running the Application

### Option A: One-Click Windows PowerShell Launcher
From the project root:
```powershell
.\start-dev.ps1
```
This automatically opens two dedicated PowerShell windows: one for the FastAPI backend and one for the React Vite frontend.

### Option B: Manual Command Line Execution

**Terminal 1 (Backend):**
```powershell
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API"
$env:PYTHONPATH="."
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend URL*: `http://127.0.0.1:8000`  
*Interactive Swagger Docs*: `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend):**
```powershell
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API\frontend"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```
*Frontend URL*: `http://localhost:5173`

---

## 10. Automated Testing

### Backend Unit & Integration Tests
The backend test suite uses Pytest and FastAPI TestClient. **Tests run against an isolated in-memory SQLite database (`sqlite:///:memory:`) so production Supabase data is never touched or deleted.**

```powershell
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API"
.\backend\venv\Scripts\python.exe -m pytest -v backend\tests
```

**Actual Test Output:**
```
============================= test session starts =============================
platform win32 -- Python 3.11.8, pytest-8.2.2
collected 13 items

backend/tests/test_agents.py::test_health_endpoint PASSED                [  7%]
backend/tests/test_agents.py::test_root_endpoint PASSED                  [ 15%]
backend/tests/test_agents.py::test_create_agent PASSED                   [ 23%]
backend/tests/test_agents.py::test_create_agent_validation PASSED        [ 30%]
backend/tests/test_agents.py::test_list_and_search_agents PASSED         [ 38%]
backend/tests/test_agents.py::test_filter_by_status PASSED               [ 46%]
backend/tests/test_agents.py::test_filter_invalid_status PASSED          [ 53%]
backend/tests/test_agents.py::test_get_agent_details_and_not_found PASSED [ 61%]
backend/tests/test_agents.py::test_update_agent_status PASSED            [ 69%]
backend/tests/test_agents.py::test_delete_agent PASSED                   [ 76%]
backend/tests/test_agents.py::test_dashboard_stats PASSED                [ 84%]
backend/tests/test_agents.py::test_ai_summary_fallback_mode PASSED       [ 92%]
backend/tests/test_agents.py::test_ai_summary_openai_error_handling PASSED [100%]

======================= 13 passed, 2 warnings in 0.45s ========================
```

### Frontend Production Build Check
```powershell
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API\frontend"
npm.cmd run build
```
Result: `✓ built in 515ms` (0 TypeScript errors, production bundle generated in `dist/`).

---

## 11. Screenshots & Demonstration Guide

To showcase genuine project screenshots in reports or presentations:
1. Start the application using `.\start-dev.ps1`.
2. Open `http://localhost:5173` in your browser.
3. Take screenshots of:
   - **Overview Dashboard**: Showing fleet metric cards, live donut chart, and audit feed.
   - **Registration Modal**: Showing input validation.
   - **Agent Detail & AI Summary**: Showing the AI assessment result with source badge.
   - **System Diagnostics Tab**: Showing live telemetry ping.
4. Save screenshots in a `docs/screenshots/` folder and link them below:

```markdown
![Overview Dashboard](docs/screenshots/dashboard.png)
![AI Health Assessment](docs/screenshots/ai_summary.png)
![System Health Diagnostics](docs/screenshots/diagnostics.png)
```

---

## 12. College Jury & Interview Explanation Guide

Use this section to confidently explain your project during technical viva or interviews:

### Q1: What makes this project an AI Observability system rather than a generic CRUD app?
> **Answer**: A generic CRUD app only stores data. This project implements a **domain-aware AI observability layer**. It captures domain-specific operational states (`active`, `inactive`, `error`), tracks an immutable audit history of transitions, and uses an LLM reasoning engine to analyze raw activity history. The AI interprets whether an agent is in an abnormal state, explains the situation in plain English, and prescribes a recommended next action for system operators.

### Q2: Why did you use PostgreSQL via Supabase rather than MongoDB or local SQLite?
> **Answer**: AI fleet governance requires **ACID compliance and referential integrity**. We modeled a strict 1-to-many relationship between `agents` and `activities` with `ON DELETE CASCADE`. Supabase provides a production cloud-hosted PostgreSQL 17 engine with SSL encryption and connection pooling, ensuring the app works uniformly across any developer's machine without needing a local database daemon installed.

### Q3: How do you handle OpenAI rate limits or quota exhaustion?
> **Answer**: Real-world cloud services face network timeouts and quota exhaustion. We implemented a **resilient failover pattern** in `ai_service.py`. When an OpenAI call encounters a rate limit (`HTTP 429`) or network error, the backend catches the exception and immediately falls back to a deterministic rule-based assessment engine based on actual database facts. The response clearly signals `source: "fallback"` so operators know the provenance of the recommendation.

### Q4: How is security handled for API keys and database credentials?
> **Answer**: 
> - All credentials (`DATABASE_URL`, `OPENAI_API_KEY`) are kept strictly on the backend inside a local `.env` file that is excluded by `.gitignore`.
> - The frontend never receives database credentials or OpenAI keys.
> - Only safe `.env.example` templates with placeholders are committed to Git.

---

## 13. Limitations & Future Enhancements

### Current Limitations
- AI summaries are generated on-demand per agent rather than on a scheduled background cron.
- Basic status categories (`active`, `inactive`, `error`) are supported; fine-grained execution metrics (CPU/RAM telemetry) are not collected.

### Future Enhancements
- **Agent Heartbeat SDK**: A lightweight Python decorator (`@monitor_agent`) that autonomous agent scripts can import to push automated heartbeats and exception tracebacks directly to the API.
- **WebSocket Streaming**: Push real-time status updates to the React dashboard without polling.
- **Webhook Alerting**: Send instant Slack or Discord notifications when an agent enters an `error` status.
- **Role-Based Access Control (RBAC)**: Support Admin and Viewer roles for multi-tenant teams.

---

## 14. GitHub Upload Instructions

Follow these exact commands to push the project to your GitHub account:

```powershell
# 1. Verify you are in the project root
cd "c:\Users\kumar\OneDrive\Desktop\Agent Monitoring API"

# 2. Stage all clean project files (secrets and build files are ignored automatically)
git add .

# 3. Create initial commit
git commit -m "feat: complete Agent Monitoring API with FastAPI, React, Supabase, and OpenAI"

# 4. Create a new empty repository on github.com (e.g. named 'agent-monitoring-api')

# 5. Link your remote repository and push (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/agent-monitoring-api.git
git branch -M main
git push -u origin main
```
