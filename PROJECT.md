# Project: CanisCalm — Reactive Dog Training & Tracking Application

## Architecture
CanisCalm is a full-stack web application designed for reactive dog training, GPS walk tracking, breed temperament profiling, behavior modification guides, and reactivity analytics.

- **Backend**: Node.js + Express REST API server running on port 3001. SQLite database using `better-sqlite3` with WAL journal mode (`PRAGMA journal_mode = WAL`) and referential integrity (`PRAGMA foreign_keys = ON`). Database stored at `server/data/caniscalm.db`.
- **Frontend**: React application built with Vite running on port 5173 (proxied to `/api` on backend). Tailwind CSS configured with the "Clean & Calming Nature" color scheme:
  - Primary Accent (Sage): `#4E6E58`
  - Secondary Accent (Terracotta): `#D97757`
  - Background (Warm Cream): `#FAF8F5`
  - Card & Surface: White (`#FFFFFF`) with soft borders and `rounded-2xl` / `rounded-3xl` radii.
- **Dual Map Engine**: Google Maps JS API wrapper (`@react-google-maps/api`) with automatic, robust fallback to Leaflet / OpenStreetMap (`react-leaflet`) when no Google API key is supplied or when offline.
- **Data Flow**:
  - Live GPS coordinates captured via browser Geolocation API (`navigator.geolocation.watchPosition`).
  - 1-Tap reactivity trigger drawer posts events directly to Express `/api/walks/:id/events` during an active walk.
  - Analytics dashboard pulls pre-aggregated statistics from `/api/stats`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Backend Express Server & SQLite DB | Express setup with `better-sqlite3`, WAL mode, foreign keys, CORS | M1 | R1 |
| 2 | Relational Schema & Seed Data | Tables: `breeds`, `dogs`, `walks`, `reactivity_events` + 12 seeded breeds & mock data | M1 | R1, R3 |
| 3 | REST API Endpoints | `/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats` endpoints | M1 | Acceptance Criteria |
| 4 | React + Vite Frontend Setup | Vite React project setup, scripts (`npm run dev`, `npm run build`), root configuration | M2 | R1, Acceptance Criteria |
| 5 | Calming Nature Visual Theme | Tailwind setup with Sage (#4E6E58), Terracotta (#D97757), Warm Cream (#FAF8F5), serenity components | M2 | R1 |
| 6 | 5-Tab Navigation System | Navigation layout for Paseo en Vivo, Enciclopedia, Mis Perros, Entrenamiento, Analítica | M2 | R1, Acceptance Criteria |
| 7 | Real-time GPS Tracking | Geolocation API integration, live route polyline tracing, pause/resume/finish walk | M3 | R2 |
| 8 | Dual Map Engine | Google Maps API with automatic interactive Leaflet / OpenStreetMap fallback | M3 | R2 |
| 9 | 1-Tap Trigger Logging Drawer | Quick log panel for 5 categories (Dog off leash, Bike, Person/Child, Noise, Vehicle) with 1-5 scale & notes | M3 | R2 |
| 10| Intensity Color-Coded Map Markers | Event markers on map colored by reactivity intensity level (1-5 scale) | M3 | R2 |
| 11| Breed Encyclopedia & Filtering | Breed list with multi-criteria search/filter (Energy, Prey Drive, Sensitivity, Arousal Threshold) | M4 | R3 |
| 12| Pet Profile Management | CRUD pet profiles, breed assignment, custom trigger tags, training goals | M4 | R3 |
| 13| Desensitization Training Guides | Step-by-step interactive guides for LAT, Counterconditioning, Comfort Zones, 3-Second Rule | M5 | R4 |
| 14| Analytics Dashboard | Reactivity episode frequency charts, Leaflet trigger hotspot heatmap, walk history | M5 | R4 |
| 15| Production Build & E2E Hardening | `npm run build` zero-error verification, 100% E2E test suite pass, Tier 5 adversarial verification | M6 | Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Infrastructure & SQLite Data Store | Express server, SQLite DDL, seed data (12 breeds + mock pet/walks), REST APIs (`/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats`) | None | DONE |
| M2 | Frontend Foundation & Calming Nature UI Theme | Vite + React setup, Tailwind theme config, 5-tab navigation system, shared UI cards & modal primitives | M1 | DONE |
| M3 | Live GPS Walk Tracking & 1-Tap Trigger Log | Dual map engine (Google Maps + Leaflet fallback), live route polyline, 1-tap trigger logging drawer, intensity map markers | M2 | DONE |
| M4 | Breed Encyclopedia & Pet Profile Management | Breed encylopedia with 4-criteria slider/button filters, pet profile CRUD linked to breeds & triggers | M1, M2 | PLANNED |
| M5 | Desensitization Training Guides & Analytics Dashboard | Step-by-step interactive guides (LAT, Counterconditioning, Comfort Zones, 3-Sec Rule), charts, hotspot heatmap | M1, M2 | PLANNED |
| M6 | Final Integration & E2E Verification Hardening | E2E test suite pass (Tiers 1-4), Tier 5 adversarial coverage hardening, clean audit, production build packaging | M1, M2, M3, M4, M5 | PLANNED |

---

## Interface Contracts

### Backend Express API (`server/`)
- Base URL: `http://localhost:3001/api`
- CORS: Allowed for `http://localhost:5173`
- Endpoints:
  - `GET /api/breeds`: Returns array of breed objects with ratings 1-5 for `energy_level`, `prey_drive`, `sensitivity`, `arousal_threshold`. Supports query filters `?energy=...&prey=...&sensitivity=...&arousal=...&search=...`.
  - `GET /api/dogs`: Returns array of dog profiles joined with breed info.
  - `POST /api/dogs`: Body `{ name, breed_id, age, triggers: [...], training_goals: "..." }`.
  - `PUT /api/dogs/:id`: Update pet profile.
  - `DELETE /api/dogs/:id`: Delete pet profile.
  - `GET /api/walks`: Returns all walk records with associated reactivity events.
  - `POST /api/walks`: Body `{ dog_id, start_time }`. Returns `{ id, status: 'active', ... }`.
  - `PUT /api/walks/:id/finish`: Body `{ end_time, route_coordinates: [...], notes }`.
  - `POST /api/walks/:id/events`: Body `{ trigger_type, intensity_level (1-5), notes, latitude, longitude, timestamp }`.
  - `GET /api/stats`: Returns `{ total_walks, total_events, trigger_counts: {...}, intensity_distribution: {...}, heatmap_points: [{ lat, lng, intensity, trigger_type }], walk_history: [...] }`.

### Shared Data Types
- `ReactivityTrigger`: `"Dog off leash" | "Bike/Skateboard" | "Person/Child" | "Loud Noise" | "Vehicle"`
- `IntensityLevel`: `1 | 2 | 3 | 4 | 5`
- `GPSCoordinate`: `{ lat: number, lng: number, timestamp?: string }`

---

## Code Layout
```
/ (project root)
├── server/
│   ├── index.js              # Express app initialization and server start (port 3001)
│   ├── db/
│   │   ├── connection.js     # better-sqlite3 database connection & WAL setup
│   │   ├── schema.js         # DDL schema creation (breeds, dogs, walks, reactivity_events)
│   │   └── seed.js           # Breed encyclopedia & mock pet/walk data seeder
│   └── routes/
│       ├── breeds.js         # /api/breeds routes
│       ├── dogs.js           # /api/dogs routes
│       ├── walks.js          # /api/walks routes
│       └── stats.js          # /api/stats routes
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main layout & section router (5 views)
│   ├── index.css             # Tailwind directives & Calming Nature styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx    # Top header bar
│   │   │   └── Navigation.jsx # 5-tab responsive navigation bar
│   │   ├── live_walk/
│   │   │   ├── LiveWalkView.jsx        # Live walk container
│   │   │   ├── DualMapView.jsx         # Google Maps + Leaflet fallback engine
│   │   │   ├── LeafletMapView.jsx      # OpenStreetMap Leaflet component
│   │   │   ├── TriggerQuickLog.jsx     # 1-tap reactivity trigger logging drawer
│   │   │   └── IntensityMarker.jsx     # Color-coded event marker
│   │   ├── breeds/
│   │   │   ├── BreedEncyclopedia.jsx   # Breed search & multi-criteria filter view
│   │   │   └── BreedCard.jsx           # Individual breed card with radar/bar ratings
│   │   ├── profiles/
│   │   │   ├── DogProfilesView.jsx     # Pet profiles manager view
│   │   │   └── DogFormModal.jsx        # Create/edit dog modal
│   │   ├── training/
│   │   │   ├── TrainingGuidesView.jsx  # Desensitization guides overview
│   │   │   ├── LATGuide.jsx            # Look At That interactive guide
│   │   │   ├── CounterConditioning.jsx # Counterconditioning guide
│   │   │   ├── ComfortZonesGuide.jsx   # Comfort zones guide
│   │   │   └── ThreeSecondRuleGuide.jsx # 3-Second Rule guide
│   │   └── analytics/
│   │       ├── AnalyticsDashboard.jsx  # Analytics overview
│   │       ├── FrequencyChart.jsx      # Reactivity episode frequency chart
│   │       ├── HotspotHeatmap.jsx      # Map heatmap overlay for trigger hot-spots
│   │       └── WalkHistoryList.jsx     # Walk history cards
│   ├── services/
│   │   ├── api.js            # Axios/Fetch API client for backend
│   │   └── geolocation.js    # Geolocation API helper & watcher
│   └── context/
│       └── AppContext.jsx    # Global state (active dog, active walk, walks list, breeds)
├── package.json              # Main package.json containing client & server scripts
├── vite.config.js            # Vite configuration with /api proxy to localhost:3001
├── tailwind.config.js        # Tailwind config with Calming Nature color palette
├── ORIGINAL_REQUEST.md       # Immutable user request specification
├── TEST_INFRA.md             # E2E Test Suite specification and runner details
└── TEST_READY.md             # E2E Test Suite completion status
```
