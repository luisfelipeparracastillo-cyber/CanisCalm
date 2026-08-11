# Milestone 3 Technical Investigation & Architectural Plan
**CanisCalm — Live GPS Walk Tracking & 1-Tap Trigger Log**

---

## Executive Summary
Milestone 3 focuses on implementing real-time GPS walk tracking, dual map engine rendering (Google Maps API + automatic Leaflet / OpenStreetMap fallback), bottom 1-tap reactivity trigger logging drawer, and color-coded intensity map markers.

This report provides the complete architectural design, component contracts, state management specifications, fallback logic, and step-by-step implementation guide without modifying any production source files.

---

## 1. Dual Map Engine Design

### 1.1 Overview & Fallback Strategy
The application requires a robust dual map engine that defaults to Google Maps JavaScript API via `@react-google-maps/api` when a valid Google Maps API key is configured, and automatically falls back to Leaflet / OpenStreetMap (`react-leaflet` & `leaflet`) under any of the following conditions:
1. `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` is undefined, empty, or missing.
2. Google Maps API script fails to load (e.g. network offline, invalid API key, quota exceeded, or script load error).
3. Runtime error inside Google Maps component caught by error boundary or `useJsApiLoader` error hook.

```
                  +----------------------------------+
                  |         DualMapView.jsx          |
                  +----------------------------------+
                                   |
         Check import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                                   |
                  +----------------+----------------+
                  |                                 |
           Key Present                         Key Missing
                  |                                 |
        +-------------------+              +------------------+
        | GoogleMapsView    |              | LeafletMapView   |
        +-------------------+              +------------------+
                  |                                 |
         On Script/Map Error                        |
                  |                                 |
                  +-------> Seamless Fallback ------+
```

### 1.2 Component Specifications

#### A. `DualMapView.jsx`
- **Location**: `src/components/live_walk/DualMapView.jsx`
- **Role**: Wrapper component that manages map engine state (`'google'` | `'leaflet'`), detects API key availability, handles automatic fallback on error, and provides a manual map engine toggle control for testing.
- **Props Interface**:
  ```ts
  interface DualMapViewProps {
    currentLocation: { lat: number; lng: number; accuracy?: number } | null;
    routeCoordinates: Array<{ lat: number; lng: number; timestamp?: string }>;
    events: Array<{
      id: number | string;
      trigger_type: string;
      intensity_level: number;
      latitude: number;
      longitude: number;
      notes?: string;
      timestamp?: string;
    }>;
    isWalking: boolean;
    center?: { lat: number; lng: number };
    zoom?: number;
    onMapClick?: (coords: { lat: number; lng: number }) => void;
  }
  ```
- **Internal State**:
  - `mapEngine`: `'google' | 'leaflet'`
  - `hasError`: `boolean` (set to `true` if Google Maps fails)

#### B. `GoogleMapsView.jsx`
- **Location**: `src/components/live_walk/GoogleMapsView.jsx`
- **Role**: Renders map using `@react-google-maps/api` (`GoogleMap`, `Polyline`, `Marker`, `InfoWindow`, `useJsApiLoader`).
- **Props Interface**: Same as `DualMapViewProps` + `onError: (error: Error) => void`.
- **Key Features**:
  - Custom map styling matching Calming Nature theme (soft green/cream map styles).
  - Polyline tracing route coordinates (`strokeColor: '#4E6E58'`, `strokeOpacity: 0.8`, `strokeWeight: 5`).
  - Animated/pulsing user location marker.
  - Event markers rendered via `IntensityMarker.jsx` (engine="google").

#### C. `LeafletMapView.jsx`
- **Location**: `src/components/live_walk/LeafletMapView.jsx`
- **Role**: OpenStreetMap Leaflet component using `react-leaflet` (`MapContainer`, `TileLayer`, `Polyline`, `Marker`, `Popup`, `useMap`).
- **Props Interface**: Same as `DualMapViewProps`.
- **Key Features**:
  - OpenStreetMap tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
  - Dynamic map centering subcomponent `<MapRecenter center={currentLocation} />` using `useMap()` hook to invoke `map.panTo([lat, lng])` seamlessly when current location updates during an active walk.
  - Polyline rendering via `<Polyline positions={routeCoordinates.map(c => [c.lat, c.lng])} pathOptions={{ color: '#4E6E58', weight: 5, opacity: 0.8 }} />`.
  - Custom Leaflet `L.divIcon` markers rendered via `IntensityMarker.jsx` (engine="leaflet").

---

## 2. Real-Time GPS Tracking & Mock Location Support

### 2.1 Geolocation Service Module (`src/services/geolocation.js`)
- **Location**: `src/services/geolocation.js`
- **Key Functions**:
  1. `calcDistance(lat1, lon1, lat2, lon2)`: Haversine formula returning distance in meters between two GPS coordinates.
  2. `startPositionWatch(onSuccess, onError, options)`: Wrapper around `navigator.geolocation.watchPosition`.
     - Enables high accuracy (`enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 2000`).
     - Falls back to `startMockPositionWatch` if `navigator.geolocation` is not supported, or if geolocation permission is denied / unavailable (crucial for browser automated test environments).
  3. `stopPositionWatch(watchId)`: Clears standard navigator watch or mock simulation interval.
  4. `generateMockStep(prevCoords)`: Generates simulated GPS movement (+0.0001 lat/lng with minor random noise) around a baseline coordinate (e.g., Bogotá center: `lat: 4.6097, lng: -74.0817`).

### 2.2 Distance Calculation (Haversine Formula)
$$\Delta\phi = \frac{(\text{lat}_2 - \text{lat}_1) \cdot \pi}{180}, \quad \Delta\lambda = \frac{(\text{lng}_2 - \text{lng}_1) \cdot \pi}{180}$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\text{lat}_1 \cdot \frac{\pi}{180}) \cos(\text{lat}_2 \cdot \frac{\pi}{180}) \sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}(\sqrt{a}, \sqrt{1-a}), \quad d = R \cdot c \quad (R = 6,371,000 \text{ m})$$

Only coordinate shifts $> 2$ meters (or accuracy threshold $\le 30$ meters) are accumulated to filter out GPS noise when stationary.

---

## 3. Walk Controls & Active Walk Lifecycle

### 3.1 Walk State Machine
```
   [Idle / Stopped]
          |
          | click "Iniciar Paseo" -> POST /api/walks { dog_id }
          v
     [Active Walk]  <=====>  [Paused Walk]
          |           click      |
          |           "Pausar/   |
          |           Reanudar"  |
          |                      |
          +----------+-----------+
                     |
                     | click "Finalizar Paseo" -> PUT /api/walks/:id/finish
                     v
             [Completed Walk]
```

### 3.2 Walk Operations Flow
1. **Start Walk**:
   - Calls `startNewWalk(dogId)` in `AppContext`.
   - Sends `POST /api/walks` payload `{ dog_id, start_time: ISO_String }`.
   - Backend creates walk record with status `'active'`.
   - Resets local state: `routeCoordinates = []`, `walkDuration = 0`, `walkDistance = 0`, `isPaused = false`.
   - Starts GPS position watch and 1-second interval duration timer.

2. **Pause / Resume Walk**:
   - Toggles `isPaused` flag.
   - When paused, duration timer stops incrementing and incoming GPS coordinates update current position marker but are not appended to `routeCoordinates` polyline, preventing distance accumulation while resting.

3. **Finish Walk**:
   - Stops GPS watch and duration timer.
   - Prepares summary payload: `{ end_time, duration_seconds, distance_meters, route_coordinates, notes }`.
   - Sends `PUT /api/walks/:id/finish`.
   - Clears `activeWalk` state, reloads stats (`loadStats()`) and walk history (`loadWalks()`).

---

## 4. 1-Tap Trigger Logging Drawer (`TriggerQuickLog.jsx`)

### 4.1 Component Overview
- **Location**: `src/components/live_walk/TriggerQuickLog.jsx`
- **Role**: Bottom sliding drawer / panel fixed over the map, optimized for single-tap reactivity event logging while holding a dog leash.

### 4.2 Requirements & Specifications
- **5 Trigger Categories**:
  1. `"Dog off leash"` (Label: "Perro sin correa", Icon: `Dog`)
  2. `"Bike/Skateboard"` (Label: "Bici / Patineta", Icon: `Bike`)
  3. `"Person/Child"` (Label: "Persona / Niño", Icon: `User`)
  4. `"Loud Noise"` (Label: "Ruido Fuerte", Icon: `Volume2`)
  5. `"Vehicle"` (Label: "Vehículo", Icon: `Car`)

- **1-5 Intensity Scale & Palette**:
  - **Level 1**: Sage / Green (`#4E6E58`, Sage-500) — "Nivel 1: Distracción leve"
  - **Level 2**: Yellow (`#EAB308`, Amber-500) — "Nivel 2: Alerta / Inquieto"
  - **Level 3**: Orange (`#F97316`, Orange-500) — "Nivel 3: Reactividad moderada"
  - **Level 4**: Red (`#EF4444`, Red-500) — "Nivel 4: Ladridos / Tensión alta"
  - **Level 5**: Dark Red / Purple (`#581C87`, Purple-900 / Terracotta-900) — "Nivel 5: Reactividad severa / Embestida"

- **Form Fields & Instant Dispatch**:
  - Selected Trigger Category (Required)
  - Selected Intensity Level (Required, defaults to 3 or 1-5 selector)
  - Notes field (Optional text input / text area)
  - Live GPS position (`currentLocation.lat`, `currentLocation.lng`)
  - Instant dispatch call to `logEventToWalk(walkId, eventData)` executing `POST /api/walks/:id/events`.
  - Visual touch feedback: Toast message / success animation when event is recorded.

---

## 5. Color-Coded Intensity Map Markers (`IntensityMarker.jsx`)

### 5.1 Component Overview
- **Location**: `src/components/live_walk/IntensityMarker.jsx`
- **Role**: Renders custom map markers for logged reactivity events on both Google Maps and Leaflet engines.

### 5.2 Visual Marker Design
- Circular marker icon with solid background matching the intensity level color (1: Sage, 2: Yellow, 3: Orange, 4: Red, 5: Dark Red/Purple).
- Marker content displays the intensity number (1-5) or trigger icon.
- White border with soft drop shadow.
- Interactive Popup / InfoWindow showing:
  - Trigger category title (e.g., "Perro sin correa")
  - Intensity badge with color indicator (e.g., "Nivel 4")
  - Recorded timestamp (formatted HH:MM:SS)
  - Event notes (if provided)

### 5.3 Engine Implementations
- **Leaflet**: Uses `L.divIcon` with custom inline HTML/CSS string and Tailwind classes inside `<Marker position={[lat, lng]} icon={leafletDivIcon}>` and `<Popup>`.
- **Google Maps**: Uses `<Marker>` or `<OverlayView>` with custom SVG icon data URI or HTML element and `<InfoWindow>`.

---

## 6. Integration Architecture & State Management

### 6.1 `AppContext.jsx` Enhancements
To support Milestone 3 without breaking existing contracts, `AppContext.jsx` should be extended with:
- State variables:
  * `currentLocation`: `{ lat: number, lng: number, accuracy?: number } | null`
  * `routeCoordinates`: `Array<{ lat: number, lng: number, timestamp?: string }>`
  * `walkDuration`: `number` (seconds)
  * `walkDistance`: `number` (meters)
  * `isPaused`: `boolean`
  * `gpsStatus`: `'idle' | 'searching' | 'active' | 'simulated' | 'error'`
- Actions:
  * `startNewWalk(dogId)`
  * `pauseWalk()`
  * `resumeWalk()`
  * `finishCurrentWalk(walkId, summaryData)`
  * `logEventToWalk(walkId, eventData)`
  * `setMockLocation(coords)`

### 6.2 Component Hierarchy & Integration Map
```
App.jsx
 └── Header.jsx
 └── Navigation.jsx
 └── LiveWalkView.jsx
      ├── Header Control Bar (Start, Pause, Resume, Finish, Dog Selector, Active Timer & Distance)
      ├── DualMapView.jsx
      │    ├── GoogleMapsView.jsx (Google Maps API + Polyline + IntensityMarker)
      │    └── LeafletMapView.jsx (OpenStreetMap + Polyline + IntensityMarker + MapRecenter)
      └── TriggerQuickLog.jsx (Bottom 1-Tap Trigger Drawer)
```

---

## 7. Verification & Implementation Blueprint

### 7.1 Proposed File Additions
1. `src/services/geolocation.js` (GPS watching, Haversine formula, mock position fallback)
2. `src/components/live_walk/DualMapView.jsx` (Dual map wrapper & error fallback logic)
3. `src/components/live_walk/GoogleMapsView.jsx` (`@react-google-maps/api` rendering)
4. `src/components/live_walk/LeafletMapView.jsx` (`react-leaflet` rendering)
5. `src/components/live_walk/TriggerQuickLog.jsx` (Bottom 1-tap logging drawer)
6. `src/components/live_walk/IntensityMarker.jsx` (Color-coded marker component)

### 7.2 Verification Steps for Implementer
1. Run `npm run verify:frontend` to verify all required frontend files exist and Vite builds cleanly.
2. Run `node server/verify-backend.js` to confirm Express API endpoints for walks and events pass all 25 assertions.
3. Run `npm run build` to confirm production bundle builds without errors or warnings.
