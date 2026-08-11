# Backend REST API Routes Implementation Strategy — CanisCalm

**Author**: Explorer 2 (Backend REST API Routes Architect)  
**Date**: 2026-08-06  
**Target Module**: Milestone 1 — Backend Infrastructure & SQLite Data Store  
**Scope**: Complete architectural specification for Express REST API route handlers (`/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats`).

---

## 1. Executive Summary & REST API Architecture

The backend for **CanisCalm** is built with Node.js and Express, persisting data in SQLite via `better-sqlite3` (`server/data/caniscalm.db`). All API endpoints are prefixed with `/api` and exchange data formatted in JSON.

This document details the exact contract, route handlers, SQL query patterns, parameter validation logic, status code conventions, and JSON schemas for all 4 route files:
1. `server/routes/breeds.js`: Breed encyclopedia listing, multi-criteria filtering, and detail lookup.
2. `server/routes/dogs.js`: Pet profile CRUD operations joined with breed data, handling JSON text columns (`triggers`, `training_goals`).
3. `server/routes/walks.js`: Live walk lifecycle management (start walk, log 1-tap reactivity events with coordinates and 1-5 intensity, finish walk with route JSON).
4. `server/routes/stats.js`: Analytics aggregations (totals, category breakdown, intensity histogram, heatmap coordinates, walk history).

---

## 2. Endpoints Summary Table

| Method | Endpoint | Description | Query / Body Parameters | Success Status | Error Statuses |
|---|---|---|---|---|---|
| `GET` | `/api/breeds` | List & filter breeds | `?energy=1..5&prey=1..5&sensitivity=1..5&arousal=1..5&search=text` | `200 OK` | `400 Bad Request`, `500 Internal Server Error` |
| `GET` | `/api/breeds/:id` | Get breed detail by ID | `params: { id }` | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `GET` | `/api/dogs` | List pet profiles joined with breed info | None | `200 OK` | `500 Internal Server Error` |
| `GET` | `/api/dogs/:id` | Get pet profile by ID | `params: { id }` | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `POST` | `/api/dogs` | Create pet profile | Body: `{ name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals }` | `201 Created` | `400 Bad Request`, `500 Internal Server Error` |
| `PUT` | `/api/dogs/:id` | Update pet profile | Body: updated dog fields | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `DELETE` | `/api/dogs/:id` | Delete pet profile | `params: { id }` | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `GET` | `/api/walks` | List all walk records with events | None | `200 OK` | `500 Internal Server Error` |
| `GET` | `/api/walks/:id` | Get walk record detail | `params: { id }` | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `POST` | `/api/walks` | Start active walk session | Body: `{ dog_id, start_time? }` | `201 Created` | `400 Bad Request`, `500 Internal Server Error` |
| `PUT` | `/api/walks/:id/finish` | Finish active walk | Body: `{ end_time?, duration_seconds, distance_meters, route_coordinates }` | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `POST` | `/api/walks/:id/events` | Log 1-tap reactivity event | Body: `{ trigger_type, intensity, latitude, longitude, notes?, timestamp? }` | `201 Created` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `GET` | `/api/stats` | Aggregate dashboard stats | `?dog_id=optional_id` | `200 OK` | `400 Bad Request`, `500 Internal Server Error` |

---

## 3. Route Module 1: `server/routes/breeds.js`

### 3.1 `GET /api/breeds`
- **Description**: Fetch all breeds from the encyclopedia, filtered by multi-criteria search parameters.
- **Query Parameters**:
  - `energy` / `energy_level`: Integer 1-5 (filters `energy_level >= ?`).
  - `prey` / `prey_drive`: Integer 1-5 (filters `prey_drive >= ?`).
  - `sensitivity`: Integer 1-5 (filters `sensitivity >= ?`).
  - `arousal` / `excitement_threshold`: Integer 1-5 (filters `excitement_threshold >= ?`).
  - `search`: Case-insensitive string search against `name`, `spanish_name`, `breed_group`, or `temperament_description`.
- **Validation**:
  - Check numeric parameters (if supplied) are integers between 1 and 5. Return `400 Bad Request` if invalid.
- **SQL Blueprint**:
  ```javascript
  const { energy, prey, sensitivity, arousal, search } = req.query;
  let sql = 'SELECT * FROM breeds WHERE 1=1';
  const params = [];

  if (energy) {
    const val = parseInt(energy, 10);
    if (isNaN(val) || val < 1 || val > 5) return res.status(400).json({ error: "energy must be an integer between 1 and 5" });
    sql += ' AND energy_level >= ?';
    params.push(val);
  }
  if (prey) {
    const val = parseInt(prey, 10);
    if (isNaN(val) || val < 1 || val > 5) return res.status(400).json({ error: "prey must be an integer between 1 and 5" });
    sql += ' AND prey_drive >= ?';
    params.push(val);
  }
  if (sensitivity) {
    const val = parseInt(sensitivity, 10);
    if (isNaN(val) || val < 1 || val > 5) return res.status(400).json({ error: "sensitivity must be an integer between 1 and 5" });
    sql += ' AND sensitivity >= ?';
    params.push(val);
  }
  if (arousal) {
    const val = parseInt(arousal, 10);
    if (isNaN(val) || val < 1 || val > 5) return res.status(400).json({ error: "arousal must be an integer between 1 and 5" });
    sql += ' AND excitement_threshold >= ?';
    params.push(val);
  }
  if (search && search.trim() !== '') {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(spanish_name) LIKE ? OR LOWER(breed_group) LIKE ? OR LOWER(temperament_description) LIKE ?)';
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term, term, term);
  }
  sql += ' ORDER BY name ASC';

  const breeds = db.prepare(sql).all(...params);
  res.json(breeds);
  ```
- **Response Payload Example (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "name": "Border Collie",
      "spanish_name": "Border Collie",
      "breed_group": "Herding",
      "energy_level": 5,
      "prey_drive": 4,
      "sensitivity": 4,
      "excitement_threshold": 4,
      "temperament_description": "Altamente inteligente, enérgico y sensible...",
      "care_recommendations": "Requiere estimulación mental diaria...",
      "image_url": "https://images.unsplash.com/photo-..."
    }
  ]
  ```

### 3.2 `GET /api/breeds/:id`
- **Description**: Fetch individual breed by primary key ID.
- **SQL Blueprint**:
  ```javascript
  const breed = db.prepare('SELECT * FROM breeds WHERE id = ?').get(req.params.id);
  if (!breed) return res.status(404).json({ error: 'Breed not found' });
  res.json(breed);
  ```

---

## 4. Route Module 2: `server/routes/dogs.js`

Pet profiles are linked to the breed table via `breed_id`. The fields `triggers` and `training_goals` are stored in SQLite as JSON text strings (e.g. `'["Perro sin correa"]'`) and parsed into JSON arrays when sending responses.

### 4.1 `GET /api/dogs`
- **Description**: List all user dog profiles joined with breed info.
- **SQL Blueprint**:
  ```sql
  SELECT 
    d.id,
    d.name,
    d.breed_id,
    d.age,
    d.weight,
    d.gender,
    d.photo_url,
    d.triggers,
    d.trigger_notes,
    d.comfort_distance,
    d.training_goals,
    d.created_at,
    b.name AS breed_name,
    b.spanish_name AS breed_spanish_name,
    b.breed_group,
    b.energy_level AS breed_energy_level,
    b.prey_drive AS breed_prey_drive,
    b.sensitivity AS breed_sensitivity,
    b.excitement_threshold AS breed_excitement_threshold,
    b.image_url AS breed_image_url
  FROM dogs d
  LEFT JOIN breeds b ON d.breed_id = b.id
  ORDER BY d.created_at DESC
  ```
- **Data Transformation Handler**:
  ```javascript
  const rows = db.prepare(sql).all();
  const dogs = rows.map(row => {
    let triggers = [];
    let training_goals = [];
    try { triggers = row.triggers ? JSON.parse(row.triggers) : []; } catch (e) {}
    try { training_goals = row.training_goals ? JSON.parse(row.training_goals) : []; } catch (e) {}

    const breed = row.breed_id ? {
      id: row.breed_id,
      name: row.breed_name,
      spanish_name: row.breed_spanish_name,
      breed_group: row.breed_group,
      energy_level: row.breed_energy_level,
      prey_drive: row.breed_prey_drive,
      sensitivity: row.breed_sensitivity,
      excitement_threshold: row.breed_excitement_threshold,
      image_url: row.breed_image_url
    } : null;

    return {
      id: row.id,
      name: row.name,
      breed_id: row.breed_id,
      age: row.age,
      weight: row.weight,
      gender: row.gender,
      photo_url: row.photo_url,
      triggers,
      trigger_notes: row.trigger_notes,
      comfort_distance: row.comfort_distance,
      training_goals,
      created_at: row.created_at,
      breed
    };
  });
  res.json(dogs);
  ```

### 4.2 `GET /api/dogs/:id`
- **Description**: Fetch pet profile by ID joined with breed details.
- **Response**: `200 OK` or `404 Not Found` if record does not exist.

### 4.3 `POST /api/dogs`
- **Description**: Create new pet profile.
- **Validation**:
  - `name`: Required non-empty string. Return `400 Bad Request` if missing.
  - `breed_id`: If provided, check breed exists (`SELECT id FROM breeds WHERE id = ?`). Return `400 Bad Request` if breed not found.
  - `triggers`: Convert array to JSON string (`JSON.stringify(triggers)`). Default `'[]'`.
  - `training_goals`: Convert array to JSON string (`JSON.stringify(training_goals)`). Default `'[]'`.
- **SQL Blueprint**:
  ```javascript
  const { name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Field 'name' is required" });
  }

  const triggersJson = Array.isArray(triggers) ? JSON.stringify(triggers) : (typeof triggers === 'string' ? triggers : '[]');
  const goalsJson = Array.isArray(training_goals) ? JSON.stringify(training_goals) : (typeof training_goals === 'string' ? training_goals : '[]');

  const stmt = db.prepare(`
    INSERT INTO dogs (name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    name.trim(),
    breed_id || null,
    age || null,
    weight || null,
    gender || null,
    photo_url || null,
    triggersJson,
    trigger_notes || null,
    comfort_distance || 10,
    goalsJson
  );

  // Fetch created record with breed JOIN
  const createdDog = getDogWithBreedById(info.lastInsertRowid);
  res.status(201).json(createdDog);
  ```

### 4.4 `PUT /api/dogs/:id`
- **Description**: Update existing dog profile by ID.
- **Validation**: Check dog exists. Return `404 Not Found` if missing.
- **SQL Blueprint**:
  ```javascript
  const existing = db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Dog profile not found" });

  const { name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals } = req.body;

  const triggersJson = triggers !== undefined 
    ? (Array.isArray(triggers) ? JSON.stringify(triggers) : String(triggers)) 
    : existing.triggers;

  const goalsJson = training_goals !== undefined 
    ? (Array.isArray(training_goals) ? JSON.stringify(training_goals) : String(training_goals)) 
    : existing.training_goals;

  db.prepare(`
    UPDATE dogs SET
      name = COALESCE(?, name),
      breed_id = COALESCE(?, breed_id),
      age = COALESCE(?, age),
      weight = COALESCE(?, weight),
      gender = COALESCE(?, gender),
      photo_url = COALESCE(?, photo_url),
      triggers = ?,
      trigger_notes = COALESCE(?, trigger_notes),
      comfort_distance = COALESCE(?, comfort_distance),
      training_goals = ?
    WHERE id = ?
  `).run(
    name || null,
    breed_id !== undefined ? breed_id : existing.breed_id,
    age !== undefined ? age : existing.age,
    weight !== undefined ? weight : existing.weight,
    gender || null,
    photo_url || null,
    triggersJson,
    trigger_notes || null,
    comfort_distance !== undefined ? comfort_distance : existing.comfort_distance,
    goalsJson,
    req.params.id
  );

  const updated = getDogWithBreedById(req.params.id);
  res.json(updated);
  ```

### 4.5 `DELETE /api/dogs/:id`
- **Description**: Remove dog profile by ID.
- **SQL Blueprint**:
  ```javascript
  const info = db.prepare('DELETE FROM dogs WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Dog profile not found" });
  res.json({ message: "Dog profile deleted successfully", id: Number(req.params.id) });
  ```

---

## 5. Route Module 3: `server/routes/walks.js`

Manages live walks, finishing walks with GPS polyline route points, and logging 1-tap reactivity trigger events.

### 5.1 `GET /api/walks`
- **Description**: Get all walks ordered by `start_time DESC` with nested `events` array and parsed `route_coordinates`.
- **SQL Blueprint**:
  ```javascript
  const walks = db.prepare(`
    SELECT w.*, d.name AS dog_name 
    FROM walks w 
    LEFT JOIN dogs d ON w.dog_id = d.id 
    ORDER BY w.start_time DESC
  `).all();

  const events = db.prepare(`SELECT * FROM reactivity_events ORDER BY timestamp ASC`).all();

  const walksWithEvents = walks.map(w => {
    let route_coordinates = [];
    try { route_coordinates = w.route_coordinates ? JSON.parse(w.route_coordinates) : []; } catch(e){}
    
    return {
      ...w,
      route_coordinates,
      events: events.filter(e => e.walk_id === w.id)
    };
  });
  res.json(walksWithEvents);
  ```

### 5.2 `POST /api/walks`
- **Description**: Start new active walk session.
- **Request Body**: `{ "dog_id": 1, "start_time": "2026-08-06T18:00:00Z" }`
- **SQL Blueprint**:
  ```javascript
  const { dog_id, start_time } = req.body;
  const stmt = db.prepare(`
    INSERT INTO walks (dog_id, start_time, status, route_coordinates, duration_seconds, distance_meters)
    VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), 'in_progress', '[]', 0, 0)
  `);
  const info = stmt.run(dog_id || null, start_time || null);
  const createdWalk = db.prepare(`SELECT * FROM walks WHERE id = ?`).get(info.lastInsertRowid);
  res.status(201).json({
    ...createdWalk,
    route_coordinates: [],
    events: []
  });
  ```

### 5.3 `PUT /api/walks/:id/finish`
- **Description**: Conclude walk session with final duration, distance, and route polyline JSON.
- **Request Body**:
  ```json
  {
    "end_time": "2026-08-06T18:30:00Z",
    "duration_seconds": 1800,
    "distance_meters": 1450.5,
    "route_coordinates": [
      { "lat": 40.7128, "lng": -74.0060, "timestamp": "2026-08-06T18:00:00Z" }
    ]
  }
  ```
- **Validation**: Check walk exists (404 if missing).
- **SQL Blueprint**:
  ```javascript
  const walk = db.prepare('SELECT * FROM walks WHERE id = ?').get(req.params.id);
  if (!walk) return res.status(404).json({ error: "Walk session not found" });

  const { end_time, duration_seconds, distance_meters, route_coordinates } = req.body;
  const routeJson = Array.isArray(route_coordinates) ? JSON.stringify(route_coordinates) : (typeof route_coordinates === 'string' ? route_coordinates : '[]');

  db.prepare(`
    UPDATE walks SET
      end_time = COALESCE(?, CURRENT_TIMESTAMP),
      duration_seconds = COALESCE(?, duration_seconds),
      distance_meters = COALESCE(?, distance_meters),
      route_coordinates = ?,
      status = 'completed'
    WHERE id = ?
  `).run(
    end_time || null,
    duration_seconds || 0,
    distance_meters || 0,
    routeJson,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM walks WHERE id = ?').get(req.params.id);
  const walkEvents = db.prepare('SELECT * FROM reactivity_events WHERE walk_id = ? ORDER BY timestamp ASC').all(req.params.id);

  res.json({
    ...updated,
    route_coordinates: Array.isArray(route_coordinates) ? route_coordinates : [],
    events: walkEvents
  });
  ```

### 5.4 `POST /api/walks/:id/events`
- **Description**: Record a 1-tap reactivity event attached to active or completed walk.
- **Request Body**:
  ```json
  {
    "trigger_type": "Perro sin correa",
    "intensity": 4,
    "latitude": 40.7130,
    "longitude": -74.0055,
    "notes": "Ladró y tiró de la correa",
    "timestamp": "2026-08-06T18:15:00Z"
  }
  ```
- **Validation Rules**:
  - `walk_id`: Must exist in `walks` table. Return `404 Not Found` if missing.
  - `trigger_type`: Required string. Standard categories: `"Perro sin correa"`, `"Bici/Patineta"`, `"Persona/Niño"`, `"Ruido Fuerte"`, `"Vehículo"`. Return `400 Bad Request` if missing.
  - `intensity`: Required integer 1 to 5. Return `400 Bad Request` if missing, non-numeric, < 1, or > 5.
  - `latitude`: Required number between -90 and 90. Return `400 Bad Request` if invalid.
  - `longitude`: Required number between -180 and 180. Return `400 Bad Request` if invalid.
- **SQL Blueprint**:
  ```javascript
  const walk = db.prepare('SELECT * FROM walks WHERE id = ?').get(req.params.id);
  if (!walk) return res.status(404).json({ error: "Walk session not found" });

  const { trigger_type, intensity, latitude, longitude, notes, timestamp } = req.body;

  if (!trigger_type || typeof trigger_type !== 'string') {
    return res.status(400).json({ error: "trigger_type is required" });
  }

  const intensityVal = parseInt(intensity, 10);
  if (isNaN(intensityVal) || intensityVal < 1 || intensityVal > 5) {
    return res.status(400).json({ error: "intensity must be an integer between 1 and 5" });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ error: "latitude must be a valid float between -90 and 90" });
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "longitude must be a valid float between -180 and 180" });
  }

  const stmt = db.prepare(`
    INSERT INTO reactivity_events (walk_id, dog_id, timestamp, trigger_type, intensity, latitude, longitude, notes)
    VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    req.params.id,
    walk.dog_id || null,
    timestamp || null,
    trigger_type,
    intensityVal,
    lat,
    lng,
    notes || null
  );

  const createdEvent = db.prepare('SELECT * FROM reactivity_events WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(createdEvent);
  ```

---

## 6. Route Module 4: `server/routes/stats.js`

### 6.1 `GET /api/stats`
- **Description**: Aggregates statistical metrics for the analytics dashboard (KPI cards, trigger frequency charts, intensity histograms, Leaflet heatmap overlays, and walk history cards).
- **Query Parameter**: `?dog_id=...` (optional filter).
- **SQL Aggregation Queries**:
  ```javascript
  const dog_id = req.query.dog_id ? parseInt(req.query.dog_id, 10) : null;
  const whereDogWalks = dog_id ? 'WHERE dog_id = ?' : '';
  const whereDogEvents = dog_id ? 'WHERE dog_id = ?' : '';
  const paramsWalks = dog_id ? [dog_id] : [];
  const paramsEvents = dog_id ? [dog_id] : [];

  // 1. Total Walks
  const totalWalksRow = db.prepare(`SELECT COUNT(*) AS count FROM walks ${whereDogWalks}`).get(...paramsWalks);
  const total_walks = totalWalksRow ? totalWalksRow.count : 0;

  // 2. Total Events
  const totalEventsRow = db.prepare(`SELECT COUNT(*) AS count FROM reactivity_events ${whereDogEvents}`).get(...paramsEvents);
  const total_events = totalEventsRow ? totalEventsRow.count : 0;

  // 3. Trigger Counts
  const triggerRows = db.prepare(`
    SELECT trigger_type, COUNT(*) AS count 
    FROM reactivity_events 
    ${whereDogEvents}
    GROUP BY trigger_type
  `).all(...paramsEvents);

  const trigger_counts = {
    "Perro sin correa": 0,
    "Bici/Patineta": 0,
    "Persona/Niño": 0,
    "Ruido Fuerte": 0,
    "Vehículo": 0
  };
  triggerRows.forEach(row => {
    trigger_counts[row.trigger_type] = row.count;
  });

  // 4. Intensity Distribution
  const intensityRows = db.prepare(`
    SELECT intensity, COUNT(*) AS count 
    FROM reactivity_events 
    ${whereDogEvents}
    GROUP BY intensity
  `).all(...paramsEvents);

  const intensity_distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  intensityRows.forEach(row => {
    intensity_distribution[String(row.intensity)] = row.count;
  });

  // 5. Heatmap Points
  const heatmap_points = db.prepare(`
    SELECT id, walk_id, dog_id, latitude AS lat, longitude AS lng, intensity, trigger_type, notes, timestamp
    FROM reactivity_events
    ${whereDogEvents}
    ORDER BY timestamp DESC
  `).all(...paramsEvents);

  // 6. Walk History
  const historyRows = db.prepare(`
    SELECT 
      w.id,
      w.dog_id,
      d.name AS dog_name,
      w.start_time,
      w.end_time,
      w.duration_seconds,
      w.distance_meters,
      w.route_coordinates,
      w.status,
      COUNT(e.id) AS event_count,
      COALESCE(MAX(e.intensity), 0) AS max_intensity
    FROM walks w
    LEFT JOIN dogs d ON w.dog_id = d.id
    LEFT JOIN reactivity_events e ON w.id = e.walk_id
    ${dog_id ? 'WHERE w.dog_id = ?' : ''}
    GROUP BY w.id
    ORDER BY w.start_time DESC
    LIMIT 20
  `).all(...paramsWalks);

  const walk_history = historyRows.map(row => {
    let route = [];
    try { route = row.route_coordinates ? JSON.parse(row.route_coordinates) : []; } catch(e){}
    return {
      ...row,
      route_coordinates: route
    };
  });

  res.json({
    total_walks,
    total_events,
    trigger_counts,
    intensity_distribution,
    heatmap_points,
    walk_history
  });
  ```

---

## 7. Error Handling, Validation, & Response Schemas

### 7.1 Status Codes Reference
- **`200 OK`**: Standard response for successful `GET`, `PUT`, `DELETE` operations.
- **`201 Created`**: Standard response for successful resource creation (`POST /api/dogs`, `POST /api/walks`, `POST /api/walks/:id/events`).
- **`400 Bad Request`**: Validation errors (missing required body parameters, out-of-range ratings, bad coordinates). Returns `{ "error": "Reason" }`.
- **`404 Not Found`**: Request for non-existent ID in `dogs`, `breeds`, or `walks`. Returns `{ "error": "Resource not found" }`.
- **`500 Internal Server Error`**: Unexpected SQLite database errors or server runtime errors. Returns `{ "error": "Internal server error" }`.

### 7.2 Centralized Error Wrapper Pattern
Every route file should use standard try-catch blocks or a simple wrapper:
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error("API Route Error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  });
};
```

---

## 8. Summary & Verification Blueprint

This analysis outlines the complete contract and handler implementation for all 4 Express REST routes. The implementation phase will generate the corresponding `.js` files inside `server/routes/` and link them into `server/index.js` via:
```javascript
app.use('/api/breeds', require('./routes/breeds'));
app.use('/api/dogs', require('./routes/dogs'));
app.use('/api/walks', require('./routes/walks'));
app.use('/api/stats', require('./routes/stats'));
```
