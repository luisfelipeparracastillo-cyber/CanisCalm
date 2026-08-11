# Milestone 1 Technical Architecture & Database Blueprint

## 1. Executive Summary
This document defines the complete architectural blueprint for **Milestone 1: Backend Infrastructure & SQLite Data Store** of CanisCalm. 

The backend relies on Node.js, Express, and `better-sqlite3` to provide a robust, lightweight, high-performance relational database solution for dog breed encyclopedia data, pet profile management, GPS walk tracking, reactivity event logging, and behavior analytics.

---

## 2. Directory Structure & File Inventory
The proposed structure for the backend implementation in `server/` is as follows:

```
/ (project root)
├── package.json              # Unified dependencies & scripts (Express, better-sqlite3, cors, dotenv, vite)
├── server/
│   ├── index.js              # Express app entry point (port 3001, CORS, middleware, auto-db init, route mounts)
│   ├── db/
│   │   ├── connection.js     # SQLite connection manager with WAL mode & foreign keys enabled
│   │   ├── schema.js         # DDL table creation and index definitions
│   │   └── seed.js           # 12 breed seed dataset & initial mock pets/walks/events
│   └── routes/
│       ├── breeds.js         # GET /api/breeds (with filter queries: energy, prey, sensitivity, arousal, search)
│       ├── dogs.js           # CRUD /api/dogs
│       ├── walks.js          # POST /api/walks, PUT /api/walks/:id/finish, POST /api/walks/:id/events, GET /api/walks
│       └── stats.js          # GET /api/stats (aggregates, trigger breakdown, intensity breakdown, heatmap points)
```

---

## 3. Package Configuration (`package.json`) Blueprint

```json
{
  "name": "caniscalm",
  "version": "1.0.0",
  "description": "Reactive Dog Training & GPS Tracking Full-Stack Application",
  "main": "server/index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server/index.js",
    "dev:server": "nodemon server/index.js",
    "seed": "node server/db/seed.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## 4. SQLite Database Architecture & DDL Schema

### 4.1 Connection Configuration (`server/db/connection.js`)
- **Database Location**: `server/data/caniscalm.db`
- **Auto Directory Creation**: Automatically creates `server/data` if missing via `fs.mkdirSync(dir, { recursive: true })`.
- **PRAGMA Directives**:
  - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging for high concurrency and performance)
  - `PRAGMA foreign_keys = ON;` (Strict referential integrity enforcement)
  - `PRAGMA synchronous = NORMAL;` (Optimal durability/speed balance with WAL)

### 4.2 DDL Schema SQL (`server/db/schema.js`)

```sql
-- 1. Breeds Table
CREATE TABLE IF NOT EXISTS breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  prey_drive INTEGER NOT NULL CHECK (prey_drive BETWEEN 1 AND 5),
  sensitivity INTEGER NOT NULL CHECK (sensitivity BETWEEN 1 AND 5),
  arousal_threshold INTEGER NOT NULL CHECK (arousal_threshold BETWEEN 1 AND 5),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dogs Table
CREATE TABLE IF NOT EXISTS dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  breed_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
  age INTEGER NOT NULL CHECK (age >= 0),
  triggers TEXT NOT NULL, -- Stored as JSON string array, e.g., '["Dog off leash","Bike/Skateboard"]'
  training_goals TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Walks Table
CREATE TABLE IF NOT EXISTS walks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  route_coordinates TEXT, -- Stored as JSON array: '[{"lat":4.609,"lng":-74.081,"timestamp":"..."}]'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reactivity Events Table
CREATE TABLE IF NOT EXISTS reactivity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walk_id INTEGER NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('Dog off leash', 'Bike/Skateboard', 'Person/Child', 'Loud Noise', 'Vehicle')),
  intensity_level INTEGER NOT NULL CHECK (intensity_level BETWEEN 1 AND 5),
  notes TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_breeds_energy ON breeds(energy_level);
CREATE INDEX IF NOT EXISTS idx_breeds_prey ON breeds(prey_drive);
CREATE INDEX IF NOT EXISTS idx_breeds_sensitivity ON breeds(sensitivity);
CREATE INDEX IF NOT EXISTS idx_breeds_arousal ON breeds(arousal_threshold);

CREATE INDEX IF NOT EXISTS idx_dogs_breed_id ON dogs(breed_id);

CREATE INDEX IF NOT EXISTS idx_walks_dog_id ON walks(dog_id);
CREATE INDEX IF NOT EXISTS idx_walks_status ON walks(status);

CREATE INDEX IF NOT EXISTS idx_reactivity_events_walk_id ON reactivity_events(walk_id);
CREATE INDEX IF NOT EXISTS idx_reactivity_events_trigger ON reactivity_events(trigger_type);
CREATE INDEX IF NOT EXISTS idx_reactivity_events_intensity ON reactivity_events(intensity_level);
```

---

## 5. Seed Dataset Definition (`server/db/seed.js`)

### 5.1 12 Spanish Breed Seed Objects
```javascript
const SEED_BREEDS = [
  {
    name: "Pastor Alemán",
    description: "Perro de trabajo muy inteligente, leal y alerta. Requiere alta estimulación mental y física; propenso a reactividad por frustración o guardias visuales.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Pastor Belga Malinois",
    description: "Raza de altísima energía e impulso de trabajo extremo. Sensible al movimiento rápido y altamente reactivo si no se encauza su impulso de presa.",
    energy_level: 5,
    prey_drive: 5,
    sensitivity: 4,
    arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Border Collie",
    description: "Perro pastor de inteligencia superior y sensibilidad extrema a estímulos visuales en movimiento. Susceptible a fijación y reactividad ante vehículos y bicicletas.",
    energy_level: 5,
    prey_drive: 4,
    sensitivity: 5,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Golden Retriever",
    description: "Perro amigable, equilibrado y adaptable. Generalmente de bajo umbral de reactividad agresiva, pero propenso a reactividad por sobre-excitación social.",
    energy_level: 4,
    prey_drive: 3,
    sensitivity: 4,
    arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Labrador Retriever",
    description: "Raza entusiasta, golosa y extrovertida. Su reactividad suele derivar de la frustración en la correa cuando desea saludar a otros perros o personas.",
    energy_level: 4,
    prey_drive: 3,
    sensitivity: 3,
    arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Rottweiler",
    description: "Perro guardián seguro, leal y sereno pero reservado. Requiere desensibilización temprana para evitar guardias territoriales o reactividad por desconfianza.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "American Staffordshire Terrier",
    description: "Perro atlético, afectuoso y de gran tenacidad física. Muy vinculado a su guía; propenso a reactividad defensiva o tensión cuando está tenso con la correa.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Beagle",
    description: "Sabueso guiado por el olfato, independiente y curioso. Su impulso de seguimiento de rastros puede provocar tirones de correa y reactividad por frustración vocal.",
    energy_level: 4,
    prey_drive: 5,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Jack Russell Terrier",
    description: "Pequeño terrier de enorme energía e impulso de caza inagotable. Reacciona velozmente ante estímulos repentinos, ruidos fuertes y movimiento de presa.",
    energy_level: 5,
    prey_drive: 5,
    sensitivity: 3,
    arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dóberman Pinscher",
    description: "Perro elegante, atlético y de reacción ultrarrápida. Vigilante de su entorno y muy receptivo al estrés del guía; propenso a reactividad por desconfianza.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Shiba Inu",
    description: "Raza japonesa independiente, limpia y de temperamento felino. Alta sensibilidad a la invasión de su espacio vital y reactividad franca hacia otros perros.",
    energy_level: 3,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Mestizo (Criollo)",
    description: "Perro de ascendencia combinada con gran adaptabilidad y diversidad genética. Perfil de temperamento variable con requerimientos personalizados de desensibilización.",
    energy_level: 3,
    prey_drive: 3,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  }
];
```

### 5.2 Initial Mock Pet & Walk Data
To enable immediate frontend and API analytics testing upon setup, `seed.js` will insert:
- **Dog Profile**: "Kira" (Pastor Alemán, age: 3, triggers: `["Dog off leash", "Bike/Skateboard", "Loud Noise"]`, training_goals: "Desensibilización a perros sueltos con método LAT.")
- **Walk 1 (Completed)**: 
  - Route coordinates in urban park area `[{"lat": 4.6097, "lng": -74.0817, "timestamp": "2026-08-06T10:00:00Z"}, ...]`
  - Event 1: trigger `Dog off leash`, intensity `4`, notes: "Perro suelto se acercó a 5m", lat: 4.60971, lng: -74.08175
  - Event 2: trigger `Bike/Skateboard`, intensity `2`, notes: "Ciclista a 15m, redirigido con premio", lat: 4.61020, lng: -74.08210
- **Walk 2 (Completed)**:
  - Event 1: trigger `Loud Noise`, intensity `3`, notes: "Bocina de camión", lat: 4.61150, lng: -74.08300

---

## 6. Server Initialization Blueprint (`server/index.js`)

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/connection');
const { initDb } = require('./db/schema');
const { seedDb } = require('./db/seed');

const breedsRouter = require('./routes/breeds');
const dogsRouter = require('./routes/dogs');
const walksRouter = require('./routes/walks');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize & Seed DB
try {
  initDb(db);
  seedDb(db);
} catch (err) {
  console.error("Failed to initialize SQLite Database:", err);
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/breeds', breedsRouter);
app.use('/api/dogs', dogsRouter);
app.use('/api/walks', walksRouter);
app.use('/api/stats', statsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`CanisCalm Backend API running on port ${PORT}`);
});
```

---

## 7. REST API Endpoints Specification

### 7.1 `/api/breeds` (`server/routes/breeds.js`)
- `GET /api/breeds`:
  - Query Params: `energy` (1-5), `prey` (1-5), `sensitivity` (1-5), `arousal` (1-5), `search` (string).
  - Logic: Filters breeds where `energy_level <= energy`, `prey_drive <= prey`, `sensitivity <= sensitivity`, `arousal_threshold <= arousal`, and `name LIKE %search% OR description LIKE %search%`.

### 7.2 `/api/dogs` (`server/routes/dogs.js`)
- `GET /api/dogs`: Returns dog records joined with breed details (`b.name AS breed_name`). JSON parses `triggers` string back to array.
- `POST /api/dogs`: Body `{ name, breed_id, age, triggers, training_goals }`. Stringifies `triggers` array before storing.
- `PUT /api/dogs/:id`: Updates pet profile details.
- `DELETE /api/dogs/:id`: Deletes pet profile.

### 7.3 `/api/walks` (`server/routes/walks.js`)
- `GET /api/walks`: Returns all walks along with their associated reactivity events.
- `POST /api/walks`: Body `{ dog_id, start_time }`. Creates active walk (`status = 'active'`).
- `PUT /api/walks/:id/finish`: Body `{ end_time, route_coordinates, notes }`. Sets status to `'completed'`, stores route JSON string.
- `POST /api/walks/:id/events`: Body `{ trigger_type, intensity_level, notes, latitude, longitude, timestamp }`. Logs reactivity event for walk.

### 7.4 `/api/stats` (`server/routes/stats.js`)
- `GET /api/stats`: Calculates:
  - `total_walks`: Integer count
  - `total_events`: Integer count
  - `trigger_counts`: Key-value map of counts per `trigger_type`
  - `intensity_distribution`: Key-value map of counts per `intensity_level` (1 to 5)
  - `heatmap_points`: Array of `{ lat, lng, intensity, trigger_type, id }` for Leaflet heatmap mapping.
  - `walk_history`: Summary list of completed walks.

---

## 8. Verification & Implementation Checklist for Implementer
1. Execute `npm init -y` if needed or write `package.json`.
2. Install `express`, `better-sqlite3`, `cors`, `dotenv`, `nodemon`.
3. Create `server/db/connection.js`, `server/db/schema.js`, `server/db/seed.js`.
4. Create routes in `server/routes/`.
5. Create `server/index.js` app launcher.
6. Verify backend startup: `npm run start` or `npm run dev:server`.
7. Verify DB tables created at `server/data/caniscalm.db`.
8. Test API endpoints:
   - `curl http://localhost:3001/api/breeds`
   - `curl http://localhost:3001/api/dogs`
   - `curl http://localhost:3001/api/stats`
