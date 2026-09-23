# OceanLens — Maritime Intelligence & Telemetry Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20%2F%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

> **Enterprise Maritime Cargo & Intelligence Platform** (Smart India Hackathon 2026 — Project SIH26006)
> Real-time AIS fleet telemetry, global seaports intelligence, algorithmic maritime routing, bunker cost calculation, commercial risk assessment, freight market analytics, and AI-powered maritime consultation.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    OceanLens Frontend (React 19)     │
                      │  TypeScript · TanStack Query · Leaflet│
                      └──────────────────┬───────────────────┘
                                         │ REST API / JSON
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      FastAPI Backend Engine          │
                      │  Uvicorn · Pydantic · Scikit-Learn   │
                      └──┬───────────────┬────────────────┬──┘
                         │               │                │
            ┌────────────▼─────┐  ┌──────▼──────┐  ┌──────▼─────────┐
            │ Supabase / PG    │  │ ML Pipeline │  │ Routing / Cost │
            │ · vessel_positions│  │ · ETA Engine│  │ · Canal drafts │
            │ · seaports (NGA) │  │ · XGBoost   │  │ · Bunker OPEX  │
            │ · bookings/audit │  │ · Cost Model│  │ · Risk Matrix  │
            └──────────────────┘  └─────────────┘  └────────────────┘
```

---

## Key Modules & Platform Capabilities

| Module | Component | Description |
| :--- | :--- | :--- |
| **Command Center** | Maritime Overview (`/` or `/dashboard`) | Live AIS fleet telemetry, executive KPIs, interactive command map, freight ticker, and port operations. |
| **Analytics Hub** | Dedicated Intelligence (`/analytics`) | Central command station for freight spot rates, commodity trade flows, emissions, and valuations. |
| **Routing Engine** | Maritime Pathfinding (`/routes`) | Great-circle and navigational waypoint routing with canal draft restriction rerouting (Suez / Panama / Cape). |
| **Cost Engine** | Voyage OPEX & Bunker Model | Mathematical voyage economics, daily fuel consumption curves, port tariff estimates, and cost per deadweight ton. |
| **ETA Engine** | Transit Estimation | High-precision ETA calculation based on laden/ballast speeds, weather buffer, and chokepoint delays. |
| **Risk Matrix** | Commercial & Security Scoring | Chokepoint risk detection, draft clearance validation, and high-risk zone security advisories. |
| **Booking System** | State Machine Engine | Vessel capacity allocation, cargo containment validation, idempotent booking issuance, and lifecycle tracking. |
| **Skipper AI** | Maritime Chat Assistant | Interactive maritime intelligence consultant with semantic intent routing and visual artifacts. |
| **Data Query** | Analytical Workstation (M24) | SQL workbench, pivot aggregation, multi-format export (CSV, TSV, JSON, Excel .iqy / Power Query M). |

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** 18.x or higher
- **Python** 3.10 or higher
- **Supabase** Project with PostgreSQL credentials

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SECRET_KEY=your-supabase-service-role-key

# Run FastAPI backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend health probe available at: `http://127.0.0.1:8000/health`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://127.0.0.1:8000

# Start Vite development server
npm run dev
```

Frontend application available at: `http://localhost:5173/`

---

## Automated Verification & Testing

```bash
# Frontend Lint & Production Build
cd frontend
npm run lint
npm run build

# Backend E2E Test Suites
cd ../backend
python test_cost_engine_e2e.py
python test_eta_engine_e2e.py
python test_route_engine_e2e.py
python test_risk_engine_e2e.py
python test_booking_system_e2e.py
python test_historical_dataset_e2e.py
```

---

## Cloud Deployment Guide

### Backend (Render / Railway / AWS / GCP)
1. Configure build command: `pip install -r requirements.txt`
2. Configure start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Environment variables required:
   - `SUPABASE_URL`: Your Supabase database URL
   - `SUPABASE_SECRET_KEY`: Supabase service role secret
   - `CORS_ORIGINS`: Comma-separated list of allowed frontend domains (e.g. `https://your-app.vercel.app`)

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Configure build command: `npm run build`
2. Configure output directory: `dist`
3. Environment variables required:
   - `VITE_API_BASE_URL`: Deployed backend URL (e.g. `https://your-api.onrender.com`)

---

## Security & Privacy Guidelines
- **Zero Committed Secrets**: `.env` files and production tokens are strictly ignored by `.gitignore`.
- **Role Isolation**: Frontend clients never communicate directly with Supabase service-role keys; all state transitions and queries are mediated by the FastAPI backend.
- **Audited Datasets**: Official hydrographic port data (Pub 150) and vessel registry records are validated under zero-synthetic-data standards.
