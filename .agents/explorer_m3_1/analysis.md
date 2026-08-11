# Milestone 3 Technical & Architectural Analysis
**Project**: CanisCalm — Reactive Dog Training & GPS Tracking Application  
**Milestone**: M3 — Live GPS Walk Tracking & 1-Tap Trigger Log  
**Author**: Explorer 1  
**Date**: 2026-08-06  

---

## 1. Executive Summary & Scope

Milestone 3 equips CanisCalm with real-time GPS tracking and instant 1-tap reactivity logging during dog walks. The solution requires:
1. **Dual Map Engine**: Primary Google Maps JS API (`@react-google-maps/api`) with automatic, seamless fallback to Leaflet / OpenStreetMap (`leaflet` + `react-leaflet`) when no Google Maps API key is provided or when Google Maps fails/errors.
2. **Real-Time Geolocation Tracking & Polyline Drawing**: Geolocation API wrapper using `navigator.geolocation.watchPosition` with fallback/mock GPS simulation mode for headless or browser-restricted testing environments.
3. **Walk Lifecycle Controls**: Start, Pause, Resume, and Finish walk actions interacting with Express backend endpoints (`POST /api/walks`, `PUT /api/walks/:id/finish`), tracking elapsed duration, cumulative distance in meters, and route coordinates.
4. **Bottom 1-Tap Trigger Logging Drawer (`TriggerQuickLog.jsx`)**: Responsive bottom-sheet panel for registering reactivity events across 5 standard categories with 1-5 color-coded intensity ratings, optional notes, and instant submit to `POST /api/walks/:id/events`.
5. **Intensity Map Markers (`IntensityMarker.jsx`)**: Color-coded custom pins on both map engines reflecting event severity and trigger type.
6. **State & UI Integration**: Comprehensive state integration into `AppContext.jsx` and UI components in `src/components/live_walk/`.

---

## 2. Architecture & File Layout

### Proposed File Tree Additions under `src/`

```
src/
├── services/
│   ├── api.js                # (Existing - Backend fetch client)
│   └── geolocation.js        # (NEW - Geolocation API & Mock GPS simulator)
├── components/
│   └── live_walk/
│       ├── LiveWalkView.jsx        # (UPDATED - Main walk tracking screen & summary modal)
│       ├── DualMapView.jsx         # (NEW - Smart wrapper & Map Engine switcher)
│       ├── GoogleMapsView.jsx      # (NEW - Google Maps API map renderer)
│       ├── LeafletMapView.jsx      # (NEW - OpenStreetMap Leaflet map renderer)
│       ├── IntensityMarker.jsx     # (NEW - Color-coded event marker helper/component)
│       └── TriggerQuickLog.jsx     # (NEW - Bottom 1-tap trigger logging drawer)
```

---

## 3. Detailed Component & Service Specifications

### 3.1 `src/services/geolocation.js` (GPS Service & Simulator)

This service abstracts location acquisition. It checks browser compatibility and permissions. If `navigator.geolocation` is unavailable, fails, or permission is denied, it switches seamlessly to mock GPS mode so that development and automated testing can proceed without hardware dependencies.

#### Key Functions & Interface:
```javascript
/**
 * @typedef {Object} GPSCoordinate
 * @property {number} lat
 * @property {number} lng
 * @property {string} [timestamp]
 * @property {number} [accuracy]
 * @property {number} [speed]
 */

/**
 * Starts watching position using navigator.geolocation or mock simulator.
 * @param {function(GPSCoordinate): void} onSuccess
 * @param {function(Error): void} onError
 * @param {Object} [options]
 * @returns {number|string} watch ID handle
 */
export function watchUserPosition(onSuccess, onError, options = {}) { ... }

/**
 * Stops an active location watch handle.
 * @param {number|string} watchId
 */
export function clearUserPositionWatch(watchId) { ... }

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula.
 * @param {GPSCoordinate} coord1
 * @param {GPSCoordinate} coord2
 * @returns {number} distance in meters
 */
export function calculateHaversineDistance(coord1, coord2) { ... }

/**
 * Calculates total cumulative distance in meters along an array of coordinates.
 * @param {GPSCoordinate[]} route
 * @returns {number} cumulative distance in meters
 */
export function calculateRouteDistance(route) { ... }

/**
 * Mock Location Watcher for non-GPS environments / testing.
 * Simulates movement starting around default coordinate (Mexico City: 19.4326, -99.1332).
 */
export function startMockPositionWatch(onSuccess, intervalMs = 2500) { ... }
```

---

### 3.2 Dual Map Engine Architecture (`DualMapView`, `GoogleMapsView`, `LeafletMapView`)

The application supports dual map engines:
- **Google Maps API**: Uses `@react-google-maps/api` (`GoogleMap`, `Marker`, `Polyline`, `useJsApiLoader`).
- **Leaflet / OpenStreetMap**: Uses `react-leaflet` (`MapContainer`, `TileLayer`, `Marker`, `Polyline`, `Popup`, `useMap`).

#### `DualMapView.jsx` Logic:
1. Checks for API key: `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` or `window.GOOGLE_MAPS_API_KEY`.
2. Fallback triggers:
   - Key missing, empty, or equal to default placeholder `"YOUR_API_KEY"`.
   - Script load error or network failure (`googleMapsError === true`).
   - Manual user engine toggle ("Google Maps" vs "Leaflet / OSM").
3. Renders `<GoogleMapsView>` if valid key & no load error; otherwise renders `<LeafletMapView>`.

#### Component Contract - `DualMapView`:
```jsx
/**
 * @param {Object} props
 * @param {GPSCoordinate} props.currentPosition - Current user location {lat, lng}
 * @param {GPSCoordinate[]} props.routeCoordinates - Array of route points [{lat, lng, timestamp}]
 * @param {Array} props.events - Logged reactivity events [{id, trigger_type, intensity_level, lat, lng, notes, timestamp}]
 * @param {boolean} props.isWalking - Whether walk is active
 * @param {boolean} props.isPaused - Whether walk is paused
 */
```

#### Leaflet Specifics (`LeafletMapView.jsx`):
- Leaflet CSS import (`import 'leaflet/dist/leaflet.css'`).
- Fix for marker icon URLs in Webpack/Vite bundlers (using custom `L.divIcon` or standard SVG markers).
- Recenter sub-component using `useMap()` hook to follow `currentPosition` smoothly.

#### Google Maps Specifics (`GoogleMapsView.jsx`):
- Wraps inside `useJsApiLoader({ googleMapsApiKey, libraries: ['places', 'geometry'] })`.
- Handlers for load error to signal parent `DualMapView` to fallback to Leaflet.

---

### 3.3 Walk Lifecycle & State Management in `AppContext.jsx`

`AppContext.jsx` will be expanded to maintain live walk state, timers, and distance calculation.

#### New State Variables:
- `isPaused`: boolean (`false`)
- `walkDuration`: number (`0` seconds)
- `walkDistance`: number (`0.0` meters)
- `currentPosition`: `{ lat: 19.4326, lng: -99.1332 }` (updated via geolocation watch)
- `routeCoordinates`: `[{ lat, lng, timestamp }]`
- `walkEvents`: `[]`

#### Walk Lifecycle Methods in `AppContext`:
1. `startNewWalk(dogId)`:
   - Resets `walkDuration`, `walkDistance`, `routeCoordinates`, `walkEvents`, `isPaused = false`.
   - Calls backend `POST /api/walks`.
   - Sets `activeWalk` and `isWalking = true`.
   - Starts location watcher and duration timer interval.
2. `pauseWalk()`:
   - Sets `isPaused = true`.
   - Pauses duration timer interval.
3. `resumeWalk()`:
   - Sets `isPaused = false`.
   - Resumes duration timer interval.
4. `finishCurrentWalk(notes)`:
   - Clears location watcher and duration timer.
   - Computes final distance & route payload.
   - Calls backend `PUT /api/walks/:id/finish`.
   - Resets walk states, calls `loadWalks()` and `loadStats()`.
5. `logEventToWalk(eventData)`:
   - Calls backend `POST /api/walks/:id/events` with `{ trigger_type, intensity_level, notes, latitude: currentPosition.lat, longitude: currentPosition.lng }`.
   - Appends created event to `walkEvents` and updates `activeWalk.events`.

---

### 3.4 1-Tap Trigger Logging Drawer (`TriggerQuickLog.jsx`)

#### Component Requirements:
- Floating / Bottom Sheet UI fixed to bottom of screen during active/paused walk.
- **5 Trigger Categories**:
  1. `Dog off leash` ("Perro sin correa") — Icon: `Dog` / `ShieldAlert`
  2. `Bike/Skateboard` ("Bici/Patineta") — Icon: `Bike`
  3. `Person/Child` ("Persona/Niño") — Icon: `User`
  4. `Loud Noise` ("Ruido Fuerte") — Icon: `Volume2`
  5. `Vehicle` ("Vehículo") — Icon: `Car`
- **1-5 Intensity Scale Rating**:
  - Level 1: Sage/Green (`#4E6E58`, `bg-sage-600`) — "Muy Leve"
  - Level 2: Yellow (`#EAB308`, `bg-yellow-500`) — "Leve"
  - Level 3: Orange (`#F97316`, `bg-orange-500`) — "Moderado"
  - Level 4: Red (`#EF4444`, `bg-red-500`) — "Severo"
  - Level 5: Dark Red/Purple (`#881337` / `#581C87`, `bg-rose-900`) — "Extremo"
- **Notes Field**: Text input for quick details (e.g. "Perro suelto cruzó corriendo").
- **Timestamp & GPS Coordinates**: Automatically appended from current active position.
- **Submit Handling**: Calls `logEventToWalk` and displays non-blocking toast feedback.

#### Component Contract (`TriggerQuickLog.jsx`):
```jsx
/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Drawer expanded/collapsed state
 * @param {function(): void} props.onToggle - Toggle expand state
 * @param {function(Object): Promise<void>} props.onLogEvent - Function to dispatch event
 * @param {GPSCoordinate} props.currentPosition - Current GPS coords
 * @param {boolean} props.disabled - Disable inputs when not walking
 */
```

---

### 3.5 Color-Coded Intensity Map Markers (`IntensityMarker.jsx`)

#### Intensity Color Palette Mapping:
| Level | Name | Hex Code | Tailwind Class | Leaflet Pin Style |
|-------|------|----------|----------------|-------------------|
| 1 | Sage Green | `#4E6E58` | `bg-sage-600` | Sage circle pin with inner icon |
| 2 | Amber Yellow | `#EAB308` | `bg-amber-500` | Yellow circle pin with inner icon |
| 3 | Orange | `#F97316` | `bg-orange-500` | Orange circle pin with inner icon |
| 4 | Red | `#EF4444` | `bg-red-500` | Red circle pin with inner icon |
| 5 | Dark Red/Purple | `#881337` | `bg-rose-900` | Dark Red pin with pulsing ring |

#### Leaflet Marker Custom Icon (`L.divIcon`):
```javascript
export function createLeafletIntensityIcon(intensityLevel, triggerType) {
  const color = getIntensityColor(intensityLevel);
  const iconHtml = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold text-xs" style="background-color: ${color};">
      <span>${intensityLevel}</span>
    </div>
  `;
  return L.divIcon({
    className: 'custom-intensity-marker',
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}
```

#### Google Maps Custom Marker:
Using SVG data URIs or Google Maps `Symbol` objects with `path: google.maps.SymbolPath.CIRCLE`, `fillColor: getIntensityColor(level)`, `fillOpacity: 1`, `scale: 8`, `strokeColor: '#FFFFFF'`, `strokeWeight: 2`.

---

### 3.6 Updated `LiveWalkView.jsx` Layout

`LiveWalkView.jsx` will be structured into 4 primary regions:
1. **Top Control Bar**: Active dog indicator, Walk status badge (Listo / En Progreso / Pausado), Start / Pause / Resume / Finish Walk primary buttons.
2. **Telemetry Stat Strip**:
   - ⏱️ **Tiempo**: Elapsed walk duration (`00:14:25`).
   - 📍 **Distancia**: Cumulative distance (`1.42 km`).
   - ⚡ **Detonantes**: Total logged events counter (`3`).
3. **Main Dual Map Container**: Full-width interactive map showing live user pin, route polyline, and intensity markers. Engine mode indicator pill ("Google Maps" or "OpenStreetMap") with quick manual toggle button.
4. **Bottom 1-Tap Trigger Logging Drawer (`TriggerQuickLog.jsx`)**: Docked drawer for quick logging when walking.
5. **Walk Completion Modal**: Displays walk summary statistics (Duration, Distance, Events Logged) and notes entry before submitting finish request.

---

## 4. REST API Endpoint Integration Contract

| Action | Endpoint | HTTP Method | Payload | Expected Response |
|--------|----------|-------------|---------|-------------------|
| Start Walk | `/api/walks` | `POST` | `{ dog_id, start_time }` | `{ id, dog_id, start_time, status: "active", events: [] }` |
| Finish Walk | `/api/walks/:id/finish` | `PUT` | `{ end_time, duration_seconds, distance_meters, route_coordinates: [...], notes }` | `{ id, status: "completed", duration_seconds, distance_meters, route_coordinates, ... }` |
| Log Event | `/api/walks/:id/events` | `POST` | `{ trigger_type, intensity_level, notes, latitude, longitude, timestamp }` | `{ id, walk_id, trigger_type, intensity_level, latitude, longitude, ... }` |

---

## 5. Verification & Testing Strategy

1. **Backend Verification**:
   - Execute `node server/verify-backend.js` to ensure REST endpoints for `/api/walks` and `/api/walks/:id/events` pass all contract checks.
2. **Frontend Build Verification**:
   - Execute `npm run build` to ensure Vite bundle builds cleanly with zero syntax or import errors.
3. **Map Fallback Verification**:
   - Test without `VITE_GOOGLE_MAPS_API_KEY` set -> Leaflet / OpenStreetMap loads seamlessly.
   - Test with manual toggle -> switches cleanly between Google Maps & Leaflet.
4. **GPS Simulator Verification**:
   - In browser environment where geolocation is disabled or denied -> Mock location simulator triggers, updates position coordinates, and updates map polyline smoothly.

---
