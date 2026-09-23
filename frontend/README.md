# SIH 26006 Maritime Cargo & Intelligence Platform — Frontend

A production-grade, enterprise-scale frontend architecture for the **SIH 26006 Maritime Cargo Logistics Platform**, built to consume the FastAPI backend while establishing modular foundations for Modules 8–22.

---

## Technology Stack

* **UI Framework**: React 19 (`react`, `react-dom`)
* **Language**: TypeScript (`strict: true`, ES2020)
* **Build & Dev Server**: Vite 8 (`@vitejs/plugin-react`)
* **Routing**: React Router v7 (`react-router-dom`)
* **Server State & Data Caching**: TanStack Query v5 (`@tanstack/react-query`)
* **Icons**: Lucide React (`lucide-react`)
* **Styling**: Maritime Design System (Vanilla CSS with Design Tokens & Variables)

---

## Directory Architecture

```
frontend/
├── index.html                  # HTML entrypoint with maritime metadata
├── package.json                # Project scripts & dependencies
├── tsconfig.json               # TypeScript application configuration
├── tsconfig.node.json          # TypeScript bundler/vite configuration
├── vite.config.ts              # Vite configuration with /api reverse proxy
├── .env.example                # Template for environment variables
└── src/
    ├── app/
    │   ├── App.tsx             # Root component wrapping QueryProvider & Router
    │   ├── router.tsx          # Declarative React Router configuration
    │   ├── providers/          # Global application providers (QueryClient)
    │   └── layouts/            # Persistent AppShell, Sidebar, and Header
    ├── components/
    │   ├── ui/                 # Reusable primitives (Button, Card, Badge, Input, Select)
    │   ├── data-display/       # DataTable, StatCard, StatusBadge
    │   ├── feedback/           # LoadingState, EmptyState, ErrorState
    │   └── placeholders/       # MapPlaceholder (Module 8), AnalyticsPlaceholder (Module 12)
    ├── features/
    │   ├── landing/            # Public platform landing page & value proposition
    │   ├── dashboard/          # Operations dashboard with real KPI metrics
    │   ├── vessels/            # Vessel fleet registry with search & capacity stats
    │   ├── ports/              # Global port index (Pub 150) with search & coordinates
    │   ├── cargo/              # Cargo allocation & consignment demand registry
    │   ├── routes/             # Corridor navigation lanes & transit distance
    │   └── analytics/          # Future predictive models & telemetry roadmap
    ├── services/
    │   └── api/                # Typed API service client layer (FastAPI / Supabase)
    ├── hooks/                  # React Query hooks (usePorts, useVessels, useCargo, useRoutes)
    ├── types/                  # Domain TypeScript interfaces (Port, Vessel, Cargo, Route)
    ├── config/                 # Centralized environment variables (env.ts)
    ├── styles/                 # Maritime design system (variables, layout, components)
    └── main.tsx                # Application bootstrap & DOM mount
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file or rely on defaults:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=/api
```
In local development, requests to `/api` are automatically proxied by Vite to the FastAPI backend running at `http://127.0.0.1:8000`, eliminating browser CORS issues with zero backend changes.

### 3. Start Frontend Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173/`

### 4. Build for Production
```bash
npm run build
```
Typecheck only:
```bash
npx tsc --noEmit
```

---

## Available Application Routes

| Route | Description | Backend API Integrated |
|---|---|---|
| `/` | Public Landing Page | — |
| `/dashboard` | Operations KPI Command Center | `GET /vessels`, `GET /ports`, `GET /cargo`, `GET /routes` |
| `/vessels` | Fleet & Vessel Registry | `GET /vessels`, `GET /vessels/search` |
| `/ports` | Global Seaport Directory | `GET /ports`, `GET /ports/search` |
| `/cargo` | Cargo Registry & Allocation | `GET /cargo`, `POST /cargo` |
| `/routes` | Navigation Corridors | `GET /routes`, `POST /routes` |
| `/analytics` | Predictive Analytics Roadmap | Architecture readiness for Modules 12–15 |
| `*` | 404 Nautical Route Not Found | — |
