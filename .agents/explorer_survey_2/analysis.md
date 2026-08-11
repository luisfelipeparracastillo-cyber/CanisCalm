# CanisCalm — Frontend & UI/UX Requirements & Architecture Analysis

**Author:** Explorer 2 (Frontend & UI/UX Specialist)  
**Date:** 2026-08-06  
**Status:** Completed Analysis  
**Working Directory:** `c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity/.agents/explorer_survey_2`

---

## 1. Executive Summary & Codebase Audit

### 1.1 Codebase Audit Findings
- **Current State:** The project directory `c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity` currently contains only `ORIGINAL_REQUEST.md` and the `.agents` folder.
- **Frontend Infrastructure Needed:** A complete React (Vite) application setup is required from scratch.
- **Target Tech Stack:**
  - **Framework & Bundler:** React 18+ with Vite (Fast HMR, modern ES build pipeline)
  - **Styling:** Tailwind CSS v3 + Custom Design Tokens (Calming Nature palette)
  - **Icons:** `lucide-react` (clean, rounded, modern iconography)
  - **Animations:** `framer-motion` (smooth tab transitions, micro-animations, modal drawers)
  - **Maps & Mapping Libraries:** 
    - Google Maps (`@react-google-maps/api` or `@googlemaps/js-api-loader`)
    - Leaflet & OpenStreetMap (`leaflet` + `react-leaflet`) for seamless interactive fallback
  - **Data Visualization / Analytics:** `recharts` or `chart.js` with `react-chartjs-2` for reactivity frequency charts and trend analytics.

---

## 2. Visual Theme: "Clean & Calming Nature" Specification

### 2.1 Theme Philosophy
For reactive dog handlers, walking and training can be stressful. The UI/UX must project serenity, clarity, and low cognitive load. The design utilizes soft earthy hues, high contrast legibility, tactile rounded cards, and smooth feedback animations.

### 2.2 Color Palette & Design Tokens

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| **Sage Green (Primary)** | `#4E6E58` | Dominant brand color, header active items, primary buttons, calm status indicators. |
| **Sage Light / Muted** | `#E8EFEA` / `#8B9E90` | Card background accents, tag pills, soft hover states. |
| **Terracotta (Accent / Trigger)** | `#D97757` | Reactivity alerts, quick trigger buttons, high-intensity markers, call-to-actions. |
| **Terracotta Light** | `#FDF0EB` | Light tint for trigger logging cards and alert backgrounds. |
| **Warm Cream (Background)** | `#FAF8F5` | Main application background, warm serene canvas. |
| **Card White** | `#FFFFFF` | Card surface with soft borders and light drop shadow. |
| **Soft Sand / Neutral** | `#EFEBE4` | Subtle borders, divider lines, disabled state. |
| **Deep Forest (Text Main)** | `#2D3B32` | High-legibility text, primary titles and body text (softer than pure black). |
| **Muted Slate (Text Sub)** | `#607065` | Subtitles, timestamps, secondary metadata. |

### 2.3 Intensity Scale Color System (1 to 5)

| Intensity | Label | Color | Hex | Visual Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Alerta Leve / Curioso | Soft Yellow-Green | `#A3B899` | Mild head turn, calm observation |
| **2** | Fijación / Tensión | Soft Amber | `#E6B86A` | Staring, ear posture change |
| **3** | Gruñido / Intento de Embestida | Warm Orange | `#E68A5C` | Vocalization, leash tension |
| **4** | Reacción Severa (Ladrido/Embestida) | Terracotta Red | `#D97757` | Active barking, lunging |
| **5** | Colapso de Umbral / Fuera de Control | Deep Crimson | `#B83A3A` | Full emotional overflow, safety retreat required |

### 2.4 Typography & Component Styling Tokens
- **Font Family:** Modern Sans-Serif (`Outfit`, `Plus Jakarta Sans`, or `Inter`).
- **Border Radius:** `rounded-2xl` (16px) for cards, `rounded-3xl` (24px) for modals/floating panels, `rounded-full` for quick trigger buttons.
- **Shadows:** Soft diffuse shadows (`shadow-sm` = `0 2px 8px rgba(45, 59, 50, 0.05)`, `shadow-md` = `0 4px 16px rgba(45, 59, 50, 0.08)`).
- **Micro-Animations:**
  - Active location dot: pulsing glow effect (`animate-ping` / CSS pulse keyframe).
  - Button presses: subtle scale down (`active:scale-95 transition-transform`).
  - Drawer / Modal entry: spring slide-up via `framer-motion`.

---

## 3. Application Navigation Structure

The application navigation is organized into 5 primary sections available via a persistent top header (desktop) and bottom navigation bar (mobile responsive).

```
+-----------------------------------------------------------------------+
|  [Logo: CanisCalm] 🐾    [Paseo] [Razas] [Mis Perros] [Guías] [Analítica] |
+-----------------------------------------------------------------------+
|                                                                       |
|                       Active View Content Area                        |
|                                                                       |
+-----------------------------------------------------------------------+
| Mobile Nav Bar:  [ 📍 Paseo ] [ 📖 Razas ] [ 🐕 Perros ] [ 🎓 Guías ] [ 📊 Stats ] |
+-----------------------------------------------------------------------+
```

### 3.1 Detailed View Specifications

#### View 1: `Paseo en Vivo GPS` (Live GPS Walk Mode)
- **Primary Goal:** Hands-free walk tracking with instant 1-tap trigger logging.
- **UI Layout:** Fullscreen / high-height interactive map with top stats overlay (Elapsed Time, Distance walked, Trigger count).
- **Controls:** "Iniciar Paseo" / "Finalizar Paseo" floating action bar.
- **Trigger Dock:** Persistent bottom bar / overlay panel for 1-tap trigger recording.

#### View 2: `Enciclopedia de Razas` (Breed Encyclopedia)
- **Primary Goal:** Educate handlers on breed temperament, energy, and reactivity predispositions.
- **UI Layout:** Grid of breed cards with search input and multi-filter tags:
  - Energy Level (1-5 rating indicator)
  - Prey Drive (Impulso de Presa: Low/Medium/High)
  - Sensitivity (Sensibilidad: Low/Medium/High)
  - Excitation Threshold (Umbral de Excitación)
- **Modal Detail:** Deep-dive modal for selected breed displaying reactivity traits, recommended exercises, and desensitization advice.

#### View 3: `Mis Perros` (Dog Profiles & Specific Triggers)
- **Primary Goal:** Manage handler's specific reactive dogs.
- **UI Layout:** Dog profile cards showing:
  - Photo / Avatar, Name, Breed link, Age, Weight.
  - Linked specific reactivity triggers (e.g. "Bicycles approaching from behind", "Unleashed male dogs").
  - Current reactivity baseline & training milestones.
  - Form modal to add/edit dog profile and set reactivity triggers.

#### View 4: `Entrenamiento` (Desensitization Guides & Protocols)
- **Primary Goal:** Provide actionable, step-by-step behavior modification protocols.
- **Featured Protocols:**
  1. **LAT (Look At That):** Teaching mark & reward for noticing triggers at a distance.
  2. **Contracondicionamiento (Counterconditioning):** Changing emotional response from fear/anger to positive anticipation.
  3. **Zonas de Confort & Distancia de Umbral:** Identifying green/yellow/red zones.
  4. **Regla de 3 Segundos:** Limiting trigger exposure before reaction escalates.
- **UI Interactive Elements:** Expandable step accordions, interactive timer for exposure drills, completion checkmarks.

#### View 5: `Analítica` (Progress Analytics & Hotspot Map)
- **Primary Goal:** Evaluate long-term training progress and spatial reactivity patterns.
- **UI Components:**
  - **Summary Metrics:** Total walks, total episodes logged, average reactivity intensity, trigger breakdown.
  - **Frequency Chart:** Weekly / monthly reactivity episode trends (bar/line chart).
  - **Trigger Heatmap / Cluster Map:** Interactive map aggregating all past trigger pins color-coded by intensity to highlight problem walk zones.
  - **Walk History Table/Cards:** Logged walks with date, distance, map path thumbnail, and detail expander.

---

## 4. Real-time GPS Tracking & Dual Map Rendering Architecture

### 4.1 Geolocation Hook (`useGeolocation`)
- Uses `navigator.geolocation.watchPosition` with fallback options (`enableHighAccuracy: true`, `maximumAge: 2000`, `timeout: 10000`).
- State managed: `currentPosition` `{ lat, lng, accuracy, timestamp }`, `routeHistory` `[{ lat, lng }]`, `totalDistance` (calculated via Haversine formula), `isTracking`.

### 4.2 Dual Map Rendering Engine (Google Maps + Leaflet Fallback)

To guarantee 100% map availability without mandatory paid API keys during dev/offline testing, the map engine features an automatic fallback strategy:

```
                  +-----------------------------------+
                  |      Map Component Loader         |
                  +-----------------------------------+
                                    |
                    Is VITE_GOOGLE_MAPS_API_KEY valid
                       & script load successful?
                               /         \
                             YES          NO (or key missing/quota limit)
                             /             \
             +--------------------+    +----------------------------+
             | Google Maps API    |    | Leaflet / OpenStreetMap    |
             | Map Component      |    | Interactive Fallback       |
             +--------------------+    +----------------------------+
                             \             /
                              \           /
                    Render Map with Polyline Route &
                   Color-Coded Reactivity Pin Markers
```

#### Technical Implementation Details:
1. **Google Maps Component (`GoogleMapView.jsx`):** Uses `@react-google-maps/api` or Google JS API Loader. Displays `<Polyline>` for walk path and `<Marker>` for current position & reactivity triggers.
2. **Leaflet Fallback Component (`LeafletMapView.jsx`):** Uses `react-leaflet` (`<MapContainer>`, `<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">`, `<Polyline>`, `<CircleMarker>`).
3. **Smart Wrapper (`DualMapView.jsx`):** 
   - Checks environment key `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
   - Listens for load errors or timeout.
   - Gracefully renders Leaflet if Google Maps fails to initialize, maintaining identical props (`center`, `zoom`, `path`, `events`, `onMapClick`).

---

## 5. 1-Tap Trigger Logging UI Component Specification

During a live walk with a reactive dog, the user cannot spend time navigating multi-step forms. The 1-Tap Quick Log drawer offers maximum speed and accessibility.

```
+-----------------------------------------------------------------------+
| 📍 PASEO EN VIVO | ⏱️ 14:23 | 📏 0.85 km | ⚠️ 2 Detonantes         |
+-----------------------------------------------------------------------+
| [ MAPA EN VIVO - RUTA TRAZADA & POSICIÓN ACTUAL ]                     |
|                                                                       |
|                                                                       |
+-----------------------------------------------------------------------+
| ⚡ MARCAR DETONANTE RÁPIDO (1-TAP)                                    |
|                                                                       |
|  [🐕 Perro sin correa]  [🚴 Bici/Patineta]  [🚶 Persona/Niño]         |
|  [🔊 Ruido Fuerte]      [🚗 Vehículo]                                 |
|                                                                       |
|  Intensidad:  (1: Leve) (2: Medio) [ 3: Fuerte ] (4: Severo) (5: Max) |
|  [ Memo rápido...          ]  [ 💾 GUARDAR EVENTO EN VIVO ]         |
+-----------------------------------------------------------------------+
```

### 5.1 Trigger Categories & Quick Buttons

1. **🐕 Perro sin correa (Dog off leash)**
   - Icon: `Dog` / `AlertCircle`
   - Default color: Terracotta Red Accent `#D97757`
2. **🚴 Bici / Patineta (Bike / Skateboard)**
   - Icon: `Bike`
   - Default color: Amber `#E6A15C`
3. **🚶 Persona / Niño (Person / Child)**
   - Icon: `User` / `Users`
   - Default color: Sage Blue `#5C878E`
4. **🔊 Ruido Fuerte (Loud Noise)**
   - Icon: `Volume2`
   - Default color: Purple Slate `#7A6C8E`
5. **🚗 Vehículo (Vehicle)**
   - Icon: `Car`
   - Default color: Dark Olive `#6E7A5C`

### 5.2 1-Tap Workflow & State Machine
1. User taps trigger category button (e.g. `Perro sin correa`).
2. Current GPS coordinates `{ lat, lng }` are immediately captured from `useGeolocation`.
3. Intensity selector defaults to level 3 (configurable) with quick 1-tap buttons for 1, 2, 3, 4, 5.
4. Tapping "Guardar Evento" instantly:
   - Emits optimistic marker drop on map with appropriate intensity color.
   - Shows a subtle 2-second success toast ("Detonante guardado a 12m").
   - Posts event data `{ walk_id, dog_id, trigger_type, intensity, latitude, longitude, notes, timestamp }` to backend `/api/walks/:id/events`.

---

## 6. Proposed Frontend Directory Structure

```
Antigravity/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css                    # Tailwind imports & calming theme root CSS variables
    ├── assets/                      # Icons, map marker SVGs, placeholder photos
    ├── components/
    │   ├── common/
    │   │   ├── Header.jsx           # Top navigation bar
    │   │   ├── BottomNav.jsx        # Mobile responsive bottom tab navigation
    │   │   ├── Card.jsx             # Calming rounded card container
    │   │   ├── Badge.jsx            # Status & intensity pills
    │   │   ├── Modal.jsx            # Animated backdrop modal
    │   │   └── Toast.jsx            # Quick alert notifications
    │   ├── map/
    │   │   ├── DualMapView.jsx      # Smart switcher (Google Maps vs Leaflet)
    │   │   ├── GoogleMapView.jsx    # Google Maps rendering component
    │   │   ├── LeafletMapView.jsx   # Leaflet + OSM rendering component
    │   │   └── CustomMarkers.jsx    # Intensity color-coded map pins
    │   ├── walk/
    │   │   ├── LiveWalkTracker.jsx  # Main walk mode container
    │   │   ├── TriggerQuickLog.jsx  # 1-tap trigger logging drawer
    │   │   ├── WalkStatsOverlay.jsx # Timer, distance, trigger count overlay
    │   │   └── EventDetailModal.jsx # View/edit logged reactivity event
    │   ├── breeds/
    │   │   ├── BreedEncyclopedia.jsx# Breed grid & search/filters
    │   │   ├── BreedCard.jsx        # Single breed summary card
    │   │   └── BreedDetailModal.jsx # Comprehensive temperament breakdown
    │   ├── dogs/
    │   │   ├── DogProfiles.jsx      # Mis Perros section
    │   │   ├── DogCard.jsx          # Dog profile details & trigger list
    │   │   └── DogFormModal.jsx     # Add/edit dog profile modal
    │   ├── training/
    │   │   ├── TrainingGuides.jsx   # Protocol list & selector
    │   │   ├── GuideDetail.jsx      # Step-by-step interactive guide (LAT, etc.)
    │   │   └── DrillTimer.jsx       # Exposure drill timer helper
    │   └── analytics/
    │       ├── AnalyticsDashboard.jsx# Main charts & statistics
    │       ├── ReactivityChart.jsx  # Episode frequency line/bar chart
    │       ├── HotspotMap.jsx       # Spatial cluster/heatmap map view
    │       └── WalkHistoryList.jsx  # Past walks list & filter
    ├── hooks/
    │   ├── useGeolocation.js      # Real-time GPS tracking hook
    │   ├── useWalkManager.js      # Walk state machine (start, pause, stop, add event)
    │   └── useApi.js              # REST API fetch helper
    ├── services/
    │   └── api.js                 # API endpoints abstraction
    └── utils/
        ├── geoUtils.js            # Distance calculation (Haversine formula)
        ├── formatters.js          # Date/time formatting utilities
        └── theme.js               # Theme constants & intensity color lookup
```

---

## 7. Next Steps & Recommendations for Implementation

1. **Vite + React Setup:** Initialize `package.json` with dependencies (`react`, `react-dom`, `lucide-react`, `leaflet`, `react-leaflet`, `@react-google-maps/api`, `recharts`, `framer-motion`, `tailwindcss`, `autoprefixer`, `postcss`).
2. **Theme Configuration:** Add Calming Nature palette and rounded border radius defaults to `tailwind.config.js`.
3. **Map Provider Resilience:** Ensure `DualMapView.jsx` gracefully defaults to `LeafletMapView.jsx` if `VITE_GOOGLE_MAPS_API_KEY` is not present, ensuring immediate out-of-the-box functionality without external credentials.
4. **Integration Testing:** Verify tab switching fluidness, live location simulation, and trigger logging state flow.
