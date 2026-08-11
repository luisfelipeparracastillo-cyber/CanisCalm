# Analysis & Architectural Blueprint — Milestone 3: Live GPS Walk Tracking & 1-Tap Trigger Log

## Executive Summary
This document outlines the detailed architectural and technical plan for **Milestone 3: Live GPS Walk Tracking & 1-Tap Trigger Log** in CanisCalm.

The system will empower dog handlers to track active walks in real time via live GPS, visualize walking paths on an interactive map with automatic fallback between Google Maps and Leaflet/OpenStreetMap, log reactivity events in 1 tap with a 5-level intensity rating scale, and view color-coded event markers dynamically on the map.

---

## Existing Codebase Baseline & Integration Points

### 1. Backend REST API (`server/routes/walks.js`)
The backend is fully operational with complete SQLite schema support for walks and reactivity events.

- **`POST /api/walks`**: Starts active walk session. Accepts `{ dog_id, start_time }`. Returns created walk record with `status: 'active'`.
- **`PUT /api/walks/:id/finish`**: Concludes walk session. Accepts `{ end_time, route_coordinates, duration_seconds, distance_meters, notes }`. Sets `status: 'completed'`.
- **`POST /api/walks/:id/events`**: Logs reactivity event. Accepts `{ trigger_type, intensity_level (1-5), latitude, longitude, notes, timestamp }`. Returns created event object.
- **`GET /api/walks` & `GET /api/walks/:id`**: Returns walks joined with dogs and associated reactivity events array.

### 2. Frontend State (`src/context/AppContext.jsx`)
- Pre-wired with `activeWalk`, `isWalking`, `startNewWalk`, `finishCurrentWalk`, and `logEventToWalk`.
- Requires integration with live GPS state (coordinates stream, timer, distance counter).

### 3. Installed Frontend Dependencies (`package.json`)
- `@react-google-maps/api`: ^2.19.3
- `leaflet`: ^1.9.4
- `react-leaflet`: ^4.2.1
- `lucide-react`: ^0.428.0
- `tailwindcss` & `clsx` / `tailwind-merge`

---

## Milestone 3 Component Architecture

```
src/
├── services/
│   └── geolocation.js          # GPS watch API wrapper, mock location fallback, Haversine formula
├── components/
│   └── live_walk/
│       ├── LiveWalkView.jsx    # Primary walk screen container (controls, timer, map, quick log drawer)
│       ├── DualMapView.jsx     # Dual map engine wrapper (Google Maps vs Leaflet switcher)
│       ├── GoogleMapsView.jsx  # @react-google-maps/api renderer component
│       ├── LeafletMapView.jsx # react-leaflet OpenStreetMap renderer component
│       ├── IntensityMarker.jsx # Color-coded reactivity event marker component
│       └── TriggerQuickLog.jsx # Bottom 1-Tap trigger logging drawer component
```

---

## Technical Specifications

### 1. Dual Map Engine Architecture (`DualMapView.jsx`, `GoogleMapsView.jsx`, `LeafletMapView.jsx`)

#### Fallback & Detection Strategy:
1. `DualMapView` inspects `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
2. If the API key is missing or empty, `DualMapView` immediately renders `LeafletMapView`.
3. If the key exists, `DualMapView` renders `GoogleMapsView` wrapped in an error state boundary.
4. If Google Maps fails to load (script blocked, network error, or invalid key reported by `onLoadError`), `GoogleMapsView` sets `hasError = true`, triggering immediate fallback to `LeafletMapView`.
5. An engine status pill overlay is displayed on top of the map (`Google Maps` vs `OpenStreetMap / Leaflet`).

#### Google Maps View (`GoogleMapsView.jsx`):
- Uses `@react-google-maps/api` (`useJsApiLoader`, `GoogleMap`, `Polyline`, `Marker`).
- Renders user's current GPS location with a glowing sage/blue dot marker.
- Draws route polyline using `<Polyline path={routeCoordinates} options={{ strokeColor: '#4E6E58', strokeOpacity: 0.85, strokeWeight: 5 }} />`.
- Renders reactivity events as markers with color-coded pins.

#### Leaflet / OpenStreetMap View (`LeafletMapView.jsx`):
- Uses `react-leaflet` (`MapContainer`, `TileLayer`, `Polyline`, `Marker`, `Popup`, `useMap`).
- Uses CartoDB Voyager or OpenStreetMap tile layer (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Implements `RecenterMap` sub-component to pan the view automatically as new GPS positions arrive.
- Draws polyline using `<Polyline positions={routeCoordinates.map(c => [c.lat, c.lng])} pathOptions={{ color: '#4E6E58', weight: 5, opacity: 0.85 }} />`.
- Custom Leaflet `L.divIcon` badges for current location and reactivity markers.

---

### 2. Real-Time GPS Tracking & Mock Fallback (`src/services/geolocation.js`)

#### Core Functions:
- **`startPositionWatch(onSuccess, onError, options)`**: Wraps `navigator.geolocation.watchPosition` with options `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }`.
- **`clearPositionWatch(watchId)`**: Clears active geolocation watcher.
- **`startMockPositionWatch(onSuccess, intervalMs = 2000, startCoords)`**: Provides simulated walking updates when GPS is unavailable/denied in browser test environments. Generates smooth lat/lng deltas (~1.2 m/s) with realistic jitter.
- **`calculateHaversineDistance(coords)`**: Iterates over `[{lat, lng}, ...]` array and sums distances in meters using the Haversine formula:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
  where $R = 6,371,000$ meters.
- **`formatDistance(meters)`**: Returns e.g. `450 m` or `1.25 km`.
- **`formatDuration(seconds)`**: Returns formatted time string `MM:SS` or `HH:MM:SS`.

---

### 3. Walk Controls & Session State Management (`LiveWalkView.jsx`)

#### Session States:
- `idle`: No active walk. Primary button: **Iniciar Paseo** (Sage).
- `active`: Walk in progress. Controls: **Pausar** (Amber), **Finalizar** (Terracotta). Duration timer running, GPS appending route points.
- `paused`: Walk paused. Controls: **Reanudar** (Sage), **Finalizar** (Terracotta). Duration timer paused, GPS active but route appending paused.
- `finished`: Summary modal opens, final data sent to backend `PUT /api/walks/:id/finish`.

#### Header Dashboard Metrics:
- **Perro Activo**: Name & breed tag.
- **Tiempo**: Live formatted timer (`MM:SS`).
- **Distancia**: Live formatted distance (`m` / `km`).
- **Eventos Registrados**: Counter badge of logged reactivity events.
- **Estado GPS**: Live vs Mock status indicator.

---

### 4. Bottom 1-Tap Trigger Logging Drawer (`TriggerQuickLog.jsx`)

#### Design & Props:
- Props: `walkId`, `currentPosition`, `onEventLogged`, `disabled`.
- Glassmorphism bottom drawer (`glass-panel rounded-t-3xl border-t border-sage-200 shadow-hover`).

#### 5 Trigger Categories:
1. 🐕 **Dog off leash** ("Perro sin correa") — Icon: `Dog` / `AlertTriangle`
2. 🚴 **Bike/Skateboard** ("Bicicleta / Patineta") — Icon: `Bike` / `Zap`
3. 🚶 **Person/Child** ("Persona / Niño") — Icon: `User` / `Users`
4. 🔊 **Loud Noise** ("Ruido Fuerte") — Icon: `Volume2` / `Megaphone`
5. 🚗 **Vehicle** ("Vehículo") — Icon: `Car` / `Truck`

#### 1-5 Intensity Rating Scale:
- **Level 1 (Sage/Green - `#4E6E58` / `bg-sage-600`)**: Leve / Soft reaction (alertness, ear perk)
- **Level 2 (Yellow - `#F59E0B` / `bg-amber-500`)**: Moderado / Moderate reaction (fixation, mild tension)
- **Level 3 (Orange - `#E65100` / `bg-orange-500`)**: Alto / High reaction (whining, pulling on leash)
- **Level 4 (Red - `#D97757` / `bg-terracotta-500`)**: Severo / Severe reaction (barking, lunging)
- **Level 5 (Dark Red/Purple - `#881337` / `bg-rose-900`)**: Extremo / Extreme reaction (red-zone frenzy, unresponsive)

#### Submission Flow:
- 1 tap to select category, 1 tap to select intensity.
- Optional short notes text input.
- Instant submission via `logEventToWalk(walkId, eventData)` calling `POST /api/walks/:id/events`.
- Instant toast feedback & marker addition to the map.

---

### 5. Intensity Map Markers (`IntensityMarker.jsx`)

#### Marker Styling & Colors:
- **Level 1**: `#4E6E58` (Sage Green)
- **Level 2**: `#EAB308` (Yellow)
- **Level 3**: `#F97316` (Orange)
- **Level 4**: `#D97757` (Terracotta)
- **Level 5**: `#881337` (Dark Red / Purple)

#### Popup Contents:
- Trigger Category Name (Bold)
- Color-coded Intensity Level Badge (e.g. `Nivel 4 - Severo`)
- Formatted Timestamp (`14:32:05`)
- Notes text (if present)
- GPS Coordinates (`lat, lng`)

---

## Detailed Data Interfaces & Props Contract

### `GPSCoordinate`
```typescript
interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp?: string;
}
```

### `ReactivityEvent`
```typescript
interface ReactivityEvent {
  id?: number;
  walk_id: number;
  trigger_type: 'Dog off leash' | 'Bike/Skateboard' | 'Person/Child' | 'Loud Noise' | 'Vehicle';
  intensity_level: 1 | 2 | 3 | 4 | 5;
  latitude: number;
  longitude: number;
  notes?: string;
  timestamp: string;
}
```

---

## Verification Plan & Commands

To verify implementation accuracy and integrity:

1. **Frontend Compilation & Build**:
   ```bash
   npm run build
   ```
2. **Frontend Structural Verification**:
   ```bash
   node src/verify-frontend.js
   ```
3. **Backend API Endpoint Verification**:
   ```bash
   node server/verify-backend.js
   ```

---

## Summary of Planned File Changes
| Action | File Path | Scope |
|--------|-----------|-------|
| CREATE | `src/services/geolocation.js` | GPS watch API, mock fallback generator, Haversine formula |
| CREATE | `src/components/live_walk/DualMapView.jsx` | Dual map engine wrapper & fallback logic |
| CREATE | `src/components/live_walk/GoogleMapsView.jsx` | `@react-google-maps/api` renderer component |
| CREATE | `src/components/live_walk/LeafletMapView.jsx` | `react-leaflet` OpenStreetMap renderer component |
| CREATE | `src/components/live_walk/IntensityMarker.jsx` | Color-coded marker component with popups |
| CREATE | `src/components/live_walk/TriggerQuickLog.jsx` | Bottom 1-tap trigger logging drawer |
| MODIFY | `src/components/live_walk/LiveWalkView.jsx` | Main walk layout, state machine, live metrics, controls |
| MODIFY | `src/context/AppContext.jsx` | Active walk state enhancements & API integrations |

