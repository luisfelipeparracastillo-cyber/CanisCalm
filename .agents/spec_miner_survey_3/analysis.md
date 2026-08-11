# Specification & Feature Mining Analysis — CanisCalm

**Author**: Explorer 3 (Specification & Feature Miner)  
**Date**: 2026-08-06  
**Target Application**: CanisCalm — Full-Stack Reactive Dog Management & Training Platform  
**Scope**: Training Guides, Analytics Dashboard, Breed Database Filtering, User Pet Profiles, Build & Verification Criteria

---

## 1. Executive Summary & Specification Scope

CanisCalm is a specialized web application engineered for owners and trainers of reactive dogs. It bridges real-time field data collection during walks (GPS tracking and 1-tap reactivity trigger logging) with evidence-based behavioral modification protocols (desensitization guides) and data-driven insights (heatmap analysis, trend charts).

This document serves as the authoritative specification reference for five key functional domains:
1. **Desensitization & Training Guides Module** (LAT, Counterconditioning, Comfort Zones, 3-Second Rule).
2. **Analytics Dashboard & Spatial Visualization** (Episode frequency charts, trigger hot-spot heatmaps, walk history).
3. **Breed Database & Multi-Criteria Filtering System** (Energy Level, Prey Drive, Sensitivity, Excitement Threshold).
4. **User Pet Profile Management** (Breed linkage, custom triggers, training goals, progress tracking).
5. **Build Architecture & Programmatic Verification Protocols** (Vite build, Express server execution, SQLite auto-seeding, API contracts).

---

## 2. Features Discovered Overview

### Table 1: Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| F01 | Training Guides | Look At That (LAT) Guide | Interactive step-by-step protocol for rewarding non-reactive orientation towards triggers | Step navigation, check-in counter | Visual card, counter display, timing hints | Invalid step returns fallback to step 1 | ORIGINAL_REQUEST.md §R4 |
| F02 | Training Guides | Counterconditioning Protocol | Interactive exercise explaining treat stream paired with trigger presence/absence | State toggle (Trigger Visible / Vanished) | Visual flow, treat timer, behavioral state | N/A | ORIGINAL_REQUEST.md §R4 |
| F03 | Training Guides | Comfort Zones / Threshold Finder | Color-coded zone guide (Green/Yellow/Red) with interactive threshold assessment | Behavioral checklist inputs | Zone classification, recommended action | Unchecked items default to Green Zone | ORIGINAL_REQUEST.md §R4 |
| F04 | Training Guides | 3-Second Rule Timer | Interactive visual countdown timer to enforce maximum 3-second trigger gaze | Start/Reset button, timer duration | Visual countdown circle, audio/vibration alert | Negative timer values blocked; max 10s | ORIGINAL_REQUEST.md §R4 |
| F05 | Analytics | Episode Frequency Chart | Time-series chart of reactivity incidents grouped by day/week and intensity level | Date range selector, view mode (daily/weekly) | Bar/Line chart visualization, episode totals | Empty data renders empty state graphic | ORIGINAL_REQUEST.md §R4 |
| F06 | Analytics | Trigger Hot-Spot Heatmap | Interactive map displaying density and intensity of reactivity events using Leaflet/OSM | Filter selection (trigger type, intensity, dates) | Map overlay with heat gradient / color markers | Missing GPS coords ignored from map layer | ORIGINAL_REQUEST.md §R4, §R2 |
| F07 | Analytics | Walk History & Route Drilldown | Logged walk cards with distance, duration, event count, and polyline route modal | Walk selection | Polyline route on map, event marker pins | Unfinished walk displays "In Progress" | ORIGINAL_REQUEST.md §R4, §R2 |
| F08 | Analytics | Dashboard KPI Summary | High-level metrics: Total walks, total events, average intensity, top trigger | Logged walk & event records | KPI metric cards | Zero records render zeroed metrics gracefully | ORIGINAL_REQUEST.md §R4 |
| F09 | Breed Database | Multi-Criteria Breed Filter | Filter enciclopedia by Energy Level, Prey Drive, Sensitivity, and Excitement Threshold | Slider values (1-5), text query, breed group | Filtered breed grid / list | Empty match displays "No breeds found" | ORIGINAL_REQUEST.md §R3 |
| F10 | Breed Database | Breed Detail View | Detailed view of temperament traits, physical needs, and reactivity management tips | Breed ID parameter | Breed profile card, trait rating bars (1-5) | 404 error response if ID invalid | ORIGINAL_REQUEST.md §R3 |
| F11 | Pet Profiles | User Pet Profile Management | CRUD interface for user dogs linked to breed database with custom triggers & goals | Name, breed_id, age, weight, triggers, goals | Pet card, profile page, linked breed specs | Missing required fields return 400 Bad Request | ORIGINAL_REQUEST.md §R3 |
| F12 | Pet Profiles | Trigger & Goal Linkage | Assign specific triggers (1-tap categories + custom) and active goals to pet profiles | Trigger tags, goal list items | Updated profile JSON attributes | Duplicate trigger tags sanitized | ORIGINAL_REQUEST.md §R3 |
| F13 | System & Build | SQLite Database Auto-Seeding | Server auto-creates `breeds`, `dogs`, `walks`, `reactivity_events` tables & populates breeds | Server startup signal | SQLite `.db` file created, prefilled breed records | DB lock error handled with retry/fallback | ORIGINAL_REQUEST.md §Acceptance Criteria |
| F14 | System & Build | REST API Service Layer | Express API endpoints (/api/breeds, /api/dogs, /api/walks, /api/stats) | HTTP requests (GET/POST/PUT/DELETE) | JSON payloads | standard 400/404/500 JSON error objects | ORIGINAL_REQUEST.md §Acceptance Criteria |
| F15 | System & Build | Calming Nature Design System | CSS/Tailwind system with sage (#4E6E58), terracota (#D97757), warm cream (#FAF8F5) | Theme class providers / variables | Styled React UI components | Color contrast fallback applied | ORIGINAL_REQUEST.md §R1 |

---

## 3. Deep-Dive Specification by Feature Domain

### 3.1 Desensitization & Training Guides

The application must provide a dedicated module (`/training` or Training tab) hosting interactive step-by-step guides for evidence-based canine behavioral modification.

#### 1. Look At That (LAT) Protocol
* **Objective**: Train the dog to visually notice a stimulus and immediately disengage by turning back to the handler for reinforcement.
* **Step-by-step Flow**:
  1. **Identify Baseline**: Position dog at a distance where the trigger is visible but dog remains calm (sub-threshold).
  2. **Mark the Look**: The moment dog turns eyes toward the trigger without barking or stiffening, click or say marker word ("Yes!").
  3. **Deliver Reinforcement**: Deliver a high-value treat to handler's side, drawing head away from trigger.
  4. **Repetition & Distance Reduction**: Repeat 3-5 times. If dog looks back at handler automatically upon seeing trigger ("Auto-LAT"), reward generously and decrease distance incrementally.
* **Interactive UI Elements**:
  * Step stepper control (`<Previous`, `Next>`).
  * Repetition check-in counter widget with sound/visual clicker feedback.
  * Distance advice tip box based on current reactivity intensity.

#### 2. Counterconditioning Protocol
* **Objective**: Change the emotional association of a trigger from fear/frustration to positive anticipation.
* **Step-by-step Flow**:
  1. **Trigger Appears**: Trigger is visible at safe distance.
  2. **Continuous Feed**: Handler immediately begins feeding continuous high-value treat stream (e.g., small chicken pieces).
  3. **Trigger Departs**: Trigger leaves the environment.
  4. **Treats Stop**: Treat delivery stops immediately.
* **Interactive UI Elements**:
  * Visual Toggle (`Trigger Visible` vs `Trigger Vanished`).
  * Treat Stream Timer simulating proper timing window.
  * Core rule reminder banner: *"Treats only flow when trigger is present."*

#### 3. Comfort Zones & Threshold Management
* **Objective**: Help handlers identify emotional states and manage distance to prevent trigger stacking.
* **Zone Definitions**:
  * **Green Zone (Sub-Threshold / Relaxed)**: Loose body posture, soft eyes, takes treats softly, responds to basic cues. Safe for training.
  * **Yellow Zone (Alert / Sub-Threshold Limit)**: Stiff stance, fixed gaze, takes treats hard, slower response to cues. Distance must be maintained or increased.
  * **Red Zone (Over-Threshold / Reactive)**: Barking, lunging, hyper-fixation, refuses treats, incapable of learning. Immediate evacuation required.
* **Interactive UI Elements**:
  * Interactive Zone Diagram with hover/click explanations.
  * "Is My Dog Sub-Threshold?" Quick Self-Assessment Checklist (4 binary questions).
  * Emergency Exit Protocol Button: Displays instructions for "Emergency U-Turn" and "Scatter Feed / Find It".

#### 4. 3-Second Rule Protocol
* **Objective**: Prevent fixation and arousal buildup by limiting uninterrupted trigger gaze to 3 seconds.
* **Step-by-step Flow**:
  1. Dog notices trigger.
  2. Count 1... 2... 3...
  3. Give movement cue ("Let's go!") and turn 180 degrees before dog escalates.
* **Interactive UI Elements**:
  * 3-Second Visual Countdown Timer (Circular SVG progress ring).
  * Start/Pause/Reset controls.
  * Haptic vibration & gentle audio chime on zero count.

---

### 3.2 Analytics Dashboard & Spatial Visualization

The Analytics module (`/analytics` or Analytics tab) converts raw walk data into actionable progress reports and geographic risk maps.

#### 1. Reactivity Episode Frequency Charts
* **Component Specification**:
  * **Chart Type**: Bar / Line combo chart (Recharts or Chart.js).
  * **X-Axis**: Time intervals (Day of week, or date range e.g. Jul 30 - Aug 6).
  * **Y-Axis**: Count of reactivity episodes.
  * **Stacking / Legend**: Color-coded by Intensity (Level 1: Green/Yellow, Level 2-3: Orange, Level 4-5: Red Terracotta) OR Trigger Category (Dog off-leash, Bike, Person, Noise, Vehicle).
  * **Time Range Selector**: Toggle buttons for `7 Days`, `30 Days`, `3 Months`, `All Time`.

#### 2. Trigger Hot-Spot Heatmap
* **Component Specification**:
  * **Map Engine**: Leaflet (`react-leaflet`) with OpenStreetMap tiles or Google Maps JavaScript API with fallback.
  * **Heatmap Overlay**: Density layer (`leaflet.heat` or canvas overlay) rendering clusters of reactivity events based on `latitude` and `longitude`.
  * **Marker Pins**: Individual reactivity event markers color-coded by intensity (1 to 5).
  * **Marker Popup Details**:
    * Trigger Category Icon & Label (e.g. 🐕 Perro sin correa).
    * Intensity Badge (1 to 5 stars or numerical pill).
    * Timestamp of event.
    * Walk ID & Dog Name link.
    * Handler Notes text.
  * **Filter Bar**: Multi-select dropdown for Trigger Types, Slider for Intensity Range (1-5), Date Range filter.

#### 3. Walk History & Route Drilldown
* **Component Specification**:
  * **Walk List View**: Card list sorted chronologically (newest first).
  * **Walk Card Summary**:
    * Date and Start Time.
    * Walk Duration (formatted `MM:SS` or `HH:MM`).
    * Total Distance (in kilometers/meters).
    * Pet Name walked.
    * Incident Summary badge (e.g., `2 Events | Max Intensity: 3`).
  * **Walk Detail Modal / View**:
    * Full interactive map showing recorded GPS route polyline (sage green line).
    * Precise event markers along the polyline showing where incidents occurred.
    * Timeline sidebar listing incidents in chronological sequence with notes.

#### 4. Key Performance Indicator (KPI) Cards
* Top dashboard grid displaying:
  1. **Total Walks Recorded** (e.g., `24 walks`).
  2. **Total Reactivity Events** (e.g., `12 events`).
  3. **Average Incident Intensity** (e.g., `2.3 / 5`).
  4. **Primary Trigger** (e.g., `Perro sin correa (58%)`).
  5. **Calm Walk Percentage** (% of walks with intensity <= 2 or 0 events).

---

### 3.3 Breed Database Search & Multi-Criteria Filtering

The Breed Encyclopedia module (`/breeds` or Enciclopedia tab) provides an interactive breed catalog precargada en SQLite with granular trait filtering.

#### 1. Database Trait Ratings (Scale 1 to 5)
Every breed record in the database contains four core numeric temperament attributes:
1. **Energy Level (Nivel de Energía)**:
   * 1 = Low (couch potato)
   * 5 = Extreme (requires 2+ hours intense exercise daily)
2. **Prey Drive (Impulso de Presa)**:
   * 1 = Minimal chase instinct
   * 5 = High chase drive towards small animals/bikes/movement
3. **Sensitivity (Sensibilidad)**:
   * 1 = Low (bouncier, resilient to noise/stress)
   * 5 = Highly sensitive to handler emotion, environment changes, and harsh corrections
4. **Excitement Threshold (Umbral de Excitación)**:
   * 1 = Low threshold (easily over-aroused / highly reactive to stimuli)
   * 5 = High threshold (calm, unflappable, high tolerance before reacting)

#### 2. Search & Filter Interface Specifications
* **Search Bar**: Real-time text filter matching breed English name or Spanish name (`name` or `spanish_name`).
* **Multi-Criteria Range Sliders / Selectors**:
  * Energy Level Filter: Range slider or min/max selector (1 to 5).
  * Prey Drive Filter: Range slider or min/max selector (1 to 5).
  * Sensitivity Filter: Range slider or min/max selector (1 to 5).
  * Excitement Threshold Filter: Range slider or min/max selector (1 to 5).
* **Breed Group Filter**: Dropdown or chip filters for groups: `Herding`, `Working`, `Sporting`, `Hound`, `Terrier`, `Toy`, `Non-Sporting`.
* **Sort Control**: Options to sort by Name (A-Z), Energy (High -> Low), Sensitivity (High -> Low), Excitement Threshold (Low -> High - most reactive first).

#### 3. Breed Card & Detail Modal Content
* Breed Avatar Image.
* English & Spanish Name + Breed Group tag.
* Visual Trait Rating Bars (4 horizontal progress bars for Energy, Prey Drive, Sensitivity, Excitement Threshold).
* Temperament Description paragraph explaining behavioral traits and reactivity risks.
* Care & Management Recommendations bullet points.

---

### 3.4 User Pet Profile Management

The Pet Profiles module (`/dogs` or Mis Perros tab) allows handlers to manage individual dog profiles, linking their breed to specific reactivity triggers and training goals.

#### 1. Pet Profile Data Model Attributes
* `name`: Dog's name (string).
* `breed_id`: Foreign key link to `breeds.id`.
* `age`: Age in years (number).
* `weight`: Weight in kg (number).
* `gender`: Gender string (`Macho`, `Hembra`, `Macho Esterilizado`, `Hembra Esterilizada`).
* `photo_url`: Avatar photo path or fallback placeholder.
* `triggers`: Array of trigger categories (e.g. `["Perro sin correa", "Bici/Patineta"]`).
* `trigger_notes`: Detailed narrative of specific reactivity triggers and distance thresholds.
* `comfort_distance`: Distance in meters (e.g. `10m`).
* `training_goals`: Array of active behavioral training targets (e.g. `["Look At That on off-leash dogs", "3-second rule on bicycles"]`).
* `notes`: Trainer notes / progress journal.

#### 2. Profile UI Specifications
* **Profile Card View**: Displays avatar, name, breed link (with breed thumbnail badge), age, weight, active triggers as tags, and primary goals.
* **Add/Edit Dog Modal**:
  * Form inputs for all profile attributes.
  * Breed selector dropdown populated live from `GET /api/breeds`.
  * Trigger tag multi-select chips matching the 5 standard 1-tap categories + custom tag input.
  * Dynamic list input for Training Goals (Add/Remove items).
* **Breed Linkage Integration**:
  * On profile view, clicking the dog's breed displays a summary banner of inherited breed traits (e.g. *"Border Collie: High Prey Drive (5/5), High Sensitivity (4/5)"*), comparing breed defaults against individual dog profile data.

---

### 3.5 Build Architecture & Verification Criteria

#### 1. System Components & File Tree Layout
```
Antigravity/
├── package.json               # Root scripts (build, dev, start)
├── vite.config.js             # Vite build configuration & server proxy setup
├── server/
│   ├── index.js               # Express server entry point
│   ├── db.js                  # SQLite connection & schema initializer
│   ├── seed.js                # Seed data loader for breeds catalog
│   └── routes/
│       ├── breeds.js          # REST endpoints for /api/breeds
│       ├── dogs.js            # REST endpoints for /api/dogs
│       ├── walks.js           # REST endpoints for /api/walks
│       └── stats.js           # REST endpoints for /api/stats
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Main layout, tab navigation, theme wrapper
│   ├── index.css              # Global styles, Tailwind directives, Calming Nature palette
│   ├── components/
│   │   ├── Navigation.jsx     # Top/Bottom navigation bar
│   │   ├── WalkTracker/       # GPS live tracking & 1-tap trigger logging
│   │   ├── Breeds/            # Breed database list, filter sidebar, detail modal
│   │   ├── Dogs/              # Pet profile list, create/edit modal
│   │   ├── Training/          # LAT, Counterconditioning, Comfort Zones, 3-Sec Rule
│   │   └── Analytics/         # Frequency charts, Heatmap, Walk history, KPIs
│   └── services/
│       └── api.js             # Axios/fetch service layer targeting /api endpoints
```

#### 2. Database Schema DDL (SQLite)

```sql
-- Breeds table
CREATE TABLE IF NOT EXISTS breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  spanish_name TEXT NOT NULL,
  breed_group TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK(energy_level BETWEEN 1 AND 5),
  prey_drive INTEGER NOT NULL CHECK(prey_drive BETWEEN 1 AND 5),
  sensitivity INTEGER NOT NULL CHECK(sensitivity BETWEEN 1 AND 5),
  excitement_threshold INTEGER NOT NULL CHECK(excitement_threshold BETWEEN 1 AND 5),
  temperament_description TEXT NOT NULL,
  care_recommendations TEXT NOT NULL,
  image_url TEXT
);

-- Dogs / Pet Profiles table
CREATE TABLE IF NOT EXISTS dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  breed_id INTEGER REFERENCES breeds(id) ON DELETE SET NULL,
  age REAL,
  weight REAL,
  gender TEXT,
  photo_url TEXT,
  triggers TEXT, -- Stored as JSON array string e.g. '["Perro sin correa"]'
  trigger_notes TEXT,
  comfort_distance INTEGER DEFAULT 10,
  training_goals TEXT, -- Stored as JSON array string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Walks table
CREATE TABLE IF NOT EXISTS walks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  duration_seconds INTEGER DEFAULT 0,
  distance_meters REAL DEFAULT 0,
  route_coordinates TEXT, -- Stored as JSON array string of [lat, lng] pairs
  status TEXT DEFAULT 'completed', -- 'in_progress', 'completed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reactivity Events table
CREATE TABLE IF NOT EXISTS reactivity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walk_id INTEGER REFERENCES walks(id) ON DELETE CASCADE,
  dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  trigger_type TEXT NOT NULL, -- 'Perro sin correa', 'Bici/Patineta', 'Persona/Niño', 'Ruido Fuerte', 'Vehículo'
  intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 5),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  notes TEXT
);
```

#### 3. Verification Commands & Expected Outputs

1. **`npm run build`**:
   * Must compile all React components, JSX/JS files, and CSS via Vite.
   * Target bundle must output to `dist/` without errors or missing module warnings.
   * Exit code: `0`.

2. **`npm run dev` / Server Launch**:
   * Express backend listening on configured port (e.g. 3001 or 5000).
   * Vite dev server running on port 5173 (or proxying to backend).
   * SQLite database file (`caniscalm.db` or `database.sqlite`) initialized with all 4 tables and populated with seed breeds.

3. **REST API Endpoint Contracts**:
   * `GET /api/breeds` -> `200 OK` JSON array of breed objects with trait attributes.
   * `GET /api/dogs` -> `200 OK` JSON array of user pet profiles.
   * `POST /api/dogs` -> `201 Created` JSON object of new dog profile.
   * `GET /api/walks` -> `200 OK` JSON array of logged walks.
   * `POST /api/walks` -> `201 Created` JSON object of new walk session.
   * `POST /api/walks/:id/events` -> `201 Created` JSON object of recorded reactivity event.
   * `GET /api/stats` -> `200 OK` JSON containing analytics data (`frequency`, `heatmap_points`, `trigger_totals`, `summary_kpis`).

---

## 4. Edge Cases & Boundary Conditions

### Table 2: Edge Cases

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| E01 | Breed Search | Query string with special characters or empty string | Trim query; empty string returns all breeds; special chars escape safely without SQL injection |
| E02 | Breed Filter | All 4 trait sliders set to extreme value (e.g., Energy=5, Sensitivity=1) | Return matching subset or empty state message ("No breeds match your filter combination") |
| E03 | Pet Profile | Dog created without assigning a breed (`breed_id` null/omitted) | Display breed as "Raza Mixta / Mestizo" with default neutral trait rating placeholders |
| E04 | Live Walk GPS | Device geolocation permission denied or unavailable | Fallback to interactive Leaflet map centered at default location with manual location picker |
| E05 | Trigger Logging | 1-tap trigger button pressed while GPS fix is acquiring (null coordinates) | Temporarily cache event and assign current map center or prompt for retry |
| E06 | Analytics Heatmap | Zero reactivity events recorded across all walks | Render heatmap layer cleanly with 0 points; display empty state banner ("No reactivity events recorded yet!") |
| E07 | Walk History | Walk ended immediately after starting (0 seconds duration, 0 distance) | Record walk session gracefully or offer prompt to discard zero-length walk |
| E08 | 3-Second Timer | User switches tabs while timer is running | Use `requestAnimationFrame` or Web Worker fallback so timer countdown accurately updates upon return |
| E09 | Database Init | SQLite database file locked or missing directory | Express server automatically creates data directory and opens DB in serialized mode |
| E10 | Build Verification | Production bundle generated with `npm run build` | Asset paths resolve correctly relative to root; no broken imports or missing asset bundles |

---

## 5. UI/UX Design System Specification (Calming Nature Theme)

To satisfy **R1 (Clean & Calming Nature Aesthetic)**, the application interface must adhere to the following visual tokens and guidelines:

* **Color Palette**:
  * **Primary (Sage Green)**: `#4E6E58` (Used for headers, active tab highlights, route polylines, primary buttons).
  * **Secondary (Terracotta)**: `#D97757` (Used for accent buttons, warning badges, high-intensity reactivity indicators Level 4-5).
  * **Background (Warm Cream)**: `#FAF8F5` (Main app background, low-contrast container surfaces).
  * **Card Surface (Pure White / Off-White)**: `#FFFFFF` / `#F5F3EF` (Rounded card containers with soft shadows `box-shadow: 0 4px 12px rgba(78, 110, 88, 0.08)`).
  * **Text Primary (Charcoal Green)**: `#2C3E35` (High legibility text color).
  * **Text Muted (Muted Sage)**: `#6B8474` (Secondary captions, metadata labels).
* **Card & Container Styling**:
  * Border radius: `16px` (`rounded-2xl`).
  * Soft border stroke: `1px solid rgba(78, 110, 88, 0.12)`.
* **Micro-interactions**:
  * Smooth transition on hover (`transition: all 0.2s ease-in-out`).
  * Interactive 1-tap trigger logging buttons with scale press feedback (`active:scale-95`).
  * 3-Second rule timer smooth circular stroke animation (`stroke-dashoffset`).

---

## 6. Conclusion & Implementation Guidance

This specification analysis confirms that CanisCalm requires a cohesive full-stack architecture combining a Node.js/Express SQLite backend with a responsive Vite React frontend styled under the Clean & Calming Nature theme. 

All 5 assigned functional sub-systems have been fully mapped, enumerated, and specified with DB schemas, REST contracts, UI component breakdowns, interactive flow steps, edge cases, and verification commands. Implementers can proceed with building the backend models, routes, database seeders, frontend components, and state management in complete alignment with this specification.
