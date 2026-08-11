# CanisCalm — Backend Architecture, Database Schema & API Specification Analysis Report

**Author**: Explorer 1 (Backend & Database Specialist)  
**Date**: August 6, 2026  
**Target Repository**: `c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity`  
**Status**: Completed  

---

## 1. Executive Summary & Project Context

**CanisCalm** is a full-stack web application designed for managing and training reactive dogs. It integrates real-time GPS walk tracking, instant trigger marking with intensity scales, a canine breed database with temperament profiles, desensitization training guides, and progress analytics (trigger frequency charts, intensity trends, and hotspot heatmaps).

This analysis report provides a comprehensive blueprint for the backend architecture, SQLite database schema (`better-sqlite3`), data seeding strategy, and REST API specification (`/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats`).

---

## 2. Current Codebase Inspection

### 2.1 Workspace Analysis
- **Root Directory**: `c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity`
- **Existing Files**:
  - `ORIGINAL_REQUEST.md`: System requirements specification.
  - `.agents/`: Agent workspace directory (contains execution state and briefing files).
- **Existing Codebase State**: Greenfield / Uninitialized repository.
  - No `package.json` currently exists.
  - No backend server files, database files, or frontend source files exist yet.

### 2.2 Prerequisites & Technology Recommendations
- **Runtime Environment**: Node.js (v18+ recommended)
- **Core Backend Framework**: Express.js (`express`)
- **Database Engine**: SQLite 3 using `better-sqlite3` (synchronous C++ bindings for performance and transaction simplicity)
- **Middleware**: `cors`, `express.json()`, `dotenv`
- **Development Tooling**: `nodemon` or `tsx` for automatic server reloading

---

## 3. Recommended Project & Backend Architecture

To ensure clean separation of concerns, modularity, and smooth integration with Vite/React frontend, the following project structure is recommended:

```
Antigravity/
├── package.json                   # Project dependencies and script runner
├── vite.config.js                 # Vite config with /api proxy pointing to Express (port 3001)
├── server/                        # Express backend source directory
│   ├── index.js                   # Server entry point & Express app configuration
│   ├── db/
│   │   ├── database.js            # better-sqlite3 instance setup & PRAGMA configurations
│   │   ├── schema.sql             # Table DDL definitions and indexes
│   │   └── seed.js                # Initial seed script for breeds and sample profiles
│   ├── routes/
│   │   ├── breeds.js              # /api/breeds router
│   │   ├── dogs.js                # /api/dogs router
│   │   ├── walks.js               # /api/walks & reactivity events router
│   │   └── stats.js               # /api/stats router for analytics & heatmap data
│   └── models/                    # Data access layer (SQL queries using better-sqlite3)
│       ├── breedModel.js
│       ├── dogModel.js
│       ├── walkModel.js
│       └── eventModel.js
├── src/                           # Frontend React application (to be built by frontend implementer)
└── ORIGINAL_REQUEST.md
```

---

## 4. Database Schema Specification (`better-sqlite3`)

### 4.1 Connection & Configuration
- **Database File**: `server/db/caniscalm.db` (auto-created on initialization)
- **Pragmas**:
  - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging for high concurrency)
  - `PRAGMA foreign_keys = ON;` (Referential integrity enforcement)

### 4.2 Entity Relationship Diagram (Conceptual)
- **`breeds`** (1) ─── (0..N) **`dogs`** (1) ─── (0..N) **`walks`** (1) ─── (0..N) **`reactivity_events`**

---

### 4.3 Table DDL Definitions

#### 1. Table `breeds`
Stores canonical dog breed data, temperament scores (1-5 scale), and desensitization/reactivity insights.

```sql
CREATE TABLE IF NOT EXISTS breeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    energy_level INTEGER NOT NULL CHECK(energy_level BETWEEN 1 AND 5),
    prey_drive INTEGER NOT NULL CHECK(prey_drive BETWEEN 1 AND 5),
    sensitivity INTEGER NOT NULL CHECK(sensitivity BETWEEN 1 AND 5),
    arousal_threshold INTEGER NOT NULL CHECK(arousal_threshold BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    reactivity_traits TEXT NOT NULL, -- JSON array string or descriptive text
    training_tips TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Table `dogs`
Stores individual reactive pets managed by the user, linked to their breed.

```sql
CREATE TABLE IF NOT EXISTS dogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    breed_id INTEGER,
    age_years REAL,
    weight_kg REAL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Neutered Male', 'Spayed Female', 'Unknown')),
    bio TEXT,
    primary_triggers TEXT, -- JSON string array: ["Perro sin correa", "Bici/Patineta"]
    comfort_threshold_meters REAL DEFAULT 10.0,
    training_goals TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL
);
```

#### 3. Table `walks`
Tracks walking sessions with real-time GPS route arrays.

```sql
CREATE TABLE IF NOT EXISTS walks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_seconds INTEGER DEFAULT 0,
    distance_km REAL DEFAULT 0.0,
    route_coordinates TEXT, -- JSON string array of objects: [{"lat": 40.71, "lng": -74.00, "timestamp": "2026-08-06T18:00:00Z"}]
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    calmness_score INTEGER CHECK(calmness_score BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
);
```

#### 4. Table `reactivity_events`
Stores 1-tap reactivity markers logged during a walk.

```sql
CREATE TABLE IF NOT EXISTS reactivity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walk_id INTEGER NOT NULL,
    dog_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('Perro sin correa', 'Bici/Patineta', 'Persona/Niño', 'Ruido Fuerte', 'Vehículo', 'Otro')),
    intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 5), -- 1: Mild alert, 5: Severe meltdown
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    notes TEXT,
    recovery_time_seconds INTEGER,
    strategy_used TEXT, -- E.g., 'LAT', 'Counter-conditioning', 'U-Turn', 'Treat Scatter'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (walk_id) REFERENCES walks(id) ON DELETE CASCADE,
    FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
);
```

#### 5. Database Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_dogs_breed_id ON dogs(breed_id);
CREATE INDEX IF NOT EXISTS idx_walks_dog_id ON walks(dog_id);
CREATE INDEX IF NOT EXISTS idx_walks_status ON walks(status);
CREATE INDEX IF NOT EXISTS idx_events_walk_id ON reactivity_events(walk_id);
CREATE INDEX IF NOT EXISTS idx_events_dog_id ON reactivity_events(dog_id);
CREATE INDEX IF NOT EXISTS idx_events_trigger_type ON reactivity_events(trigger_type);
```

---

## 5. Data Seeding Specifications

To ensure the application is immediately usable upon first launch, the seed process will populate 12 diverse dog breeds, sample reactive pet profiles, and pre-recorded walk & reactivity history.

### 5.1 Breed Dataset (12 Initial Breeds)
1. **German Shepherd Dog**: Energy: 5, Prey Drive: 4, Sensitivity: 5, Arousal Threshold: 4. *High motion sensitivity, territorial alert.*
2. **Border Collie**: Energy: 5, Prey Drive: 5, Sensitivity: 5, Arousal Threshold: 5. *Fixation on moving objects (bikes, cars, runners).*
3. **Golden Retriever**: Energy: 4, Prey Drive: 3, Sensitivity: 3, Arousal Threshold: 2. *Frustrated greeting, over-enthusiasm.*
4. **Belgian Malinois**: Energy: 5, Prey Drive: 5, Sensitivity: 5, Arousal Threshold: 5. *Ultra-fast arousal, high protection drive.*
5. **Jack Russell Terrier**: Energy: 4, Prey Drive: 5, Sensitivity: 4, Arousal Threshold: 4. *High vocal reactivity to small animals and bikes.*
6. **Australian Shepherd**: Energy: 5, Prey Drive: 4, Sensitivity: 5, Arousal Threshold: 4. *Herding nip impulses, sensitivity to sudden approach.*
7. **French Bulldog**: Energy: 2, Prey Drive: 2, Sensitivity: 3, Arousal Threshold: 2. *Leash tension, vocal grunting reactivity.*
8. **Beagle**: Energy: 4, Prey Drive: 4, Sensitivity: 3, Arousal Threshold: 3. *Scent distraction, baying at strange dogs.*
9. **Rottweiler**: Energy: 4, Prey Drive: 3, Sensitivity: 4, Arousal Threshold: 3. *Staring stance, intense barrier frustration.*
10. **Labrador Retriever**: Energy: 4, Prey Drive: 3, Sensitivity: 2, Arousal Threshold: 2. *Excitement-based leash reactivity.*
11. **Dachshund**: Energy: 3, Prey Drive: 5, Sensitivity: 4, Arousal Threshold: 4. *Barking at approaching strangers/dogs.*
12. **Mestizo / Mixed Breed**: Energy: 3, Prey Drive: 3, Sensitivity: 3, Arousal Threshold: 3. *Versatile profile customizable by owner.*

### 5.2 Default Pet & Walk Seed Data
- **Default Dog**: "Max", 3-year-old German Shepherd mix (breed_id: 1), primary triggers: `["Perro sin correa", "Bici/Patineta"]`.
- **Default Walks**: 3 sample completed walks with GPS routes and 6 reactivity events mapped near city park areas to populate heatmap analytics instantly.

---

## 6. REST API Specification

All API endpoints return JSON responses with standard status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).

### 6.1 Breeds API (`/api/breeds`)

| Method | Endpoint | Description | Query / Body Params | Response Sample |
|---|---|---|---|---|
| `GET` | `/api/breeds` | Get list of all breeds | `?energy_level=5&search=shepherd` | `[{ id, name, category, energy_level, prey_drive, sensitivity, arousal_threshold, description }]` |
| `GET` | `/api/breeds/:id` | Get single breed details | None | `{ id: 1, name: "German Shepherd", reactivity_traits: [...], training_tips: "..." }` |

### 6.2 Dogs API (`/api/dogs`)

| Method | Endpoint | Description | Query / Body Params | Response Sample |
|---|---|---|---|---|
| `GET` | `/api/dogs` | Fetch all user dogs | None | `[{ id: 1, name: "Max", breed_name: "German Shepherd", comfort_threshold_meters: 10 }]` |
| `POST` | `/api/dogs` | Create new dog profile | Body: `{ name, breed_id, age_years, primary_triggers, training_goals }` | `201 Created` `{ id: 2, name: "Luna", ... }` |
| `GET` | `/api/dogs/:id` | Get single dog details | None | `{ id: 1, name: "Max", breed: { name, energy_level }, primary_triggers: [...] }` |
| `PUT` | `/api/dogs/:id` | Update dog profile | Body: `{ comfort_threshold_meters, training_goals, primary_triggers }` | `{ id: 1, name: "Max", comfort_threshold_meters: 8.5 }` |
| `DELETE` | `/api/dogs/:id` | Delete dog profile | None | `{ success: true, message: "Dog deleted" }` |

### 6.3 Walks & Reactivity Events API (`/api/walks`)

| Method | Endpoint | Description | Query / Body Params | Response Sample |
|---|---|---|---|---|
| `GET` | `/api/walks` | Fetch walk history | `?dog_id=1&status=completed` | `[{ id: 10, dog_id: 1, duration_seconds: 1200, status: "completed", event_count: 2 }]` |
| `POST` | `/api/walks` | Start a new live walk | Body: `{ dog_id: 1 }` | `201 Created` `{ id: 11, status: "active", start_time: "..." }` |
| `GET` | `/api/walks/:id` | Get walk details + GPS route + events | None | `{ id: 11, status: "active", route_coordinates: [...], events: [...] }` |
| `PUT` | `/api/walks/:id` | Finish/update walk session | Body: `{ status: "completed", duration_seconds, distance_km, route_coordinates, calmness_score, notes }` | `{ id: 11, status: "completed", calmness_score: 4 }` |
| `POST` | `/api/walks/:id/events` | Log 1-tap reactivity event | Body: `{ dog_id, trigger_type, intensity, latitude, longitude, notes, strategy_used }` | `201 Created` `{ id: 101, walk_id: 11, trigger_type: "Perro sin correa", intensity: 4 }` |
| `GET` | `/api/walks/:id/events` | Get events for walk | None | `[{ id: 101, trigger_type: "Perro sin correa", intensity: 4, latitude: ..., longitude: ... }]` |

### 6.4 Analytics & Stats API (`/api/stats`)

| Method | Endpoint | Description | Response Details |
|---|---|---|---|
| `GET` | `/api/stats` | Global summary stats | Total walks, total events, avg intensity, top trigger. |
| `GET` | `/api/stats/dog/:dog_id` | Dog-specific analytics | Includes: <br>1. `trigger_breakdown`: Count by `trigger_type`<br>2. `intensity_trend`: Avg intensity over walks<br>3. `heatmap_points`: `[{ latitude, longitude, intensity, trigger_type }]`<br>4. `walk_summary`: Total distance, avg duration, calmness distribution |

---

## 7. Implementation Checklist for Backend Developer

1. **Initialize `package.json`**:
   - Dependencies: `express`, `better-sqlite3`, `cors`, `dotenv`
   - Dev Dependencies: `nodemon`
2. **Setup SQLite Connection (`server/db/database.js`)**:
   - Enable WAL mode and foreign keys.
   - Run `schema.sql` on database connection startup.
   - Execute auto-seed (`seed.js`) if `breeds` table count is zero.
3. **Build Express Server (`server/index.js`)**:
   - Configure CORS, JSON middleware, and mount `/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats` routers.
   - Global error handler returning standard JSON error objects.
4. **Implement Models & Controllers**:
   - Use prepared statements (`db.prepare(...)`) for performance and SQL injection prevention.
5. **Verify API Endpoints**:
   - Test endpoints with sample requests to ensure JSON compliance and criteria satisfaction.

---

## 8. Summary of Findings

The proposed backend design fulfills all requirements of `ORIGINAL_REQUEST.md`:
- Pure Node.js + Express REST API.
- Synchronous, transactional SQLite database using `better-sqlite3`.
- Fully indexed tables: `breeds`, `dogs`, `walks`, `reactivity_events`.
- Instant data seeding for 12 dog breeds, sample pets, walks, and reactivity markers.
- Robust endpoints for real-time GPS tracking storage, 1-tap trigger logging, breed encyclopedia querying, and analytics hotspot mapping.
