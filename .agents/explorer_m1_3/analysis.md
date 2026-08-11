# Milestone 1: Backend Verification & Test Strategy Analysis

## 1. Executive Summary

This document specifies the complete verification strategy, automated test script design, and execution command strings for **Milestone 1: Backend Infrastructure & SQLite Data Store** of CanisCalm.

The verification strategy spans two distinct layers:
1. **Direct SQLite Database & Schema Verification**: Inspects table existence, PRAGMA settings (WAL mode, foreign keys), DDL integrity, and initial seed count (minimum 12 dog breeds, initial mock pet profiles, walks, and events).
2. **Express REST API HTTP Verification**: Programmatically boots the Express application on a test port (or standard port 3001), executes HTTP requests across all REST endpoints (`/api/breeds`, `/api/dogs`, `/api/walks`, `/api/stats`), validates status codes (200, 201), and verifies strict JSON payload contracts before performing clean server/DB teardown.

---

## 2. Verification Targets & Test Coverage Matrix

| Verification Target | Component | Target Path / Endpoint | Assertions / Verification Standard |
|---------------------|-----------|------------------------|-----------------------------------|
| DB Connection & WAL | SQLite Engine | `server/db/connection.js` | Database connects; `PRAGMA journal_mode = wal`; `PRAGMA foreign_keys = 1`. |
| DB Schema & Migration | DDL Creation | `server/db/schema.js` | Tables `breeds`, `dogs`, `walks`, `reactivity_events` exist with primary/foreign keys. |
| Breed Seeding | Seeder Script | `server/db/seed.js` | `breeds` table contains `>= 12` records with ratings 1-5 for `energy_level`, `prey_drive`, `sensitivity`, `arousal_threshold`. |
| Mock Data Seeding | Seeder Script | `server/db/seed.js` | Sample profiles in `dogs`, active/completed walks in `walks`, and reactivity events in `reactivity_events`. |
| Server Boot & Health | Express App | `server/index.js` | Express app initializes without exceptions on port 3001 (or dynamic test port). |
| `GET /api/breeds` | REST Route | `server/routes/breeds.js` | Returns HTTP 200, array length `>= 12`, items have required rating attributes. Query filters (`?search=`, `?energy=`) function correctly. |
| `GET /api/dogs` | REST Route | `server/routes/dogs.js` | Returns HTTP 200, array of dog profiles joined with breed info. |
| `POST /api/dogs` | REST Route | `server/routes/dogs.js` | Accepts `{ name, breed_id, age, triggers, training_goals }`, returns HTTP 201 and created dog ID. |
| `PUT /api/dogs/:id` | REST Route | `server/routes/dogs.js` | Updates dog profile attributes, returns HTTP 200. |
| `DELETE /api/dogs/:id` | REST Route | `server/routes/dogs.js` | Deletes pet profile, returns HTTP 200 / 204. |
| `GET /api/walks` | REST Route | `server/routes/walks.js` | Returns HTTP 200, array of walks with embedded `reactivity_events`. |
| `POST /api/walks` | REST Route | `server/routes/walks.js` | Accepts `{ dog_id, start_time }`, returns HTTP 201 with `status: 'active'`. |
| `POST /api/walks/:id/events` | REST Route | `server/routes/walks.js` | Accepts `{ trigger_type, intensity_level, notes, latitude, longitude, timestamp }`, returns HTTP 201. |
| `PUT /api/walks/:id/finish` | REST Route | `server/routes/walks.js` | Accepts `{ end_time, route_coordinates, notes }`, updates walk status to `'completed'`, returns HTTP 200. |
| `GET /api/stats` | REST Route | `server/routes/stats.js` | Returns HTTP 200, contains `total_walks`, `total_events`, `trigger_counts`, `intensity_distribution`, `heatmap_points`, `walk_history`. |

---

## 3. Automated Verification Script Specification (`server/verify-backend.js`)

The following Node.js script `server/verify-backend.js` is designed to run synchronously or asynchronously during Worker verification. It performs direct SQLite DB inspections followed by HTTP REST testing against the Express app.

```javascript
/**
 * CanisCalm - Milestone 1 Automated Backend Verification Script
 * File: server/verify-backend.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

let db;
let server;
const PORT = process.env.TEST_PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

// Color console logger helpers
const pass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const fail = (msg) => { console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`); process.exitCode = 1; };
const info = (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`);

let totalTests = 0;
let passedTests = 0;

function assert(condition, description) {
  totalTests++;
  if (condition) {
    passedCount++;
    pass(description);
  } else {
    fail(description);
  }
}
let passedCount = 0;

// HTTP Helper using Node built-in http module
function makeRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          if (data) parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  info('====================================================');
  info(' Starting CanisCalm Milestone 1 Verification Suite ');
  info('====================================================');

  // --- STEP 1: SQLite DB Verification ---
  info('\n--- Phase 1: Database & Schema Verification ---');
  
  const dbPath = path.join(__dirname, 'data', 'caniscalm.db');
  assert(fs.existsSync(dbPath), `Database file exists at ${dbPath}`);

  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    fail('better-sqlite3 module could not be imported: ' + err.message);
    return;
  }

  try {
    db = new Database(dbPath);
    
    // Check WAL mode
    const walRow = db.pragma('journal_mode', { simple: true });
    assert(walRow.toLowerCase() === 'wal', `SQLite journal_mode is WAL (actual: ${walRow})`);

    // Check foreign keys
    const fkRow = db.pragma('foreign_keys', { simple: true });
    assert(fkRow === 1 || fkRow === '1' || fkRow === true, `SQLite foreign_keys PRAGMA is ON (actual: ${fkRow})`);

    // Check table existence
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    assert(tables.includes('breeds'), 'Table "breeds" exists');
    assert(tables.includes('dogs'), 'Table "dogs" exists');
    assert(tables.includes('walks'), 'Table "walks" exists');
    assert(tables.includes('reactivity_events'), 'Table "reactivity_events" exists');

    // Check breeds seed count
    const breedCount = db.prepare('SELECT COUNT(*) as count FROM breeds').get().count;
    assert(breedCount >= 12, `Breed table contains >= 12 items (actual count: ${breedCount})`);

    // Check sample breeds ratings range 1-5
    const invalidBreeds = db.prepare(`
      SELECT COUNT(*) as count FROM breeds 
      WHERE energy_level NOT BETWEEN 1 AND 5 
         OR prey_drive NOT BETWEEN 1 AND 5 
         OR sensitivity NOT BETWEEN 1 AND 5 
         OR arousal_threshold NOT BETWEEN 1 AND 5
    `).get().count;
    assert(invalidBreeds === 0, 'All seeded breeds have 1-5 ratings for energy, prey_drive, sensitivity, arousal_threshold');

  } catch (err) {
    fail(`Database integrity check failed: ${err.message}`);
  }

  // --- STEP 2: Express HTTP REST Verification ---
  info('\n--- Phase 2: REST API Endpoint HTTP Verification ---');

  // Import Express App
  let app;
  try {
    app = require('./index.js'); // Expecting app exported or exported server
  } catch (e) {
    // Fallback: load app if index.js is app module
    try {
      app = require('./app.js');
    } catch (e2) {
      fail(`Could not require express app from ./index.js or ./app.js: ${e.message}`);
      return;
    }
  }

  // Start HTTP server if not already listening
  if (app.listen && typeof app.listen === 'function') {
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        info(`Express server running on test port ${PORT}`);
        resolve();
      });
    });
  }

  try {
    // Test 1: GET /api/breeds
    const breedsRes = await makeRequest('GET', '/api/breeds');
    assert(breedsRes.statusCode === 200, 'GET /api/breeds returns 200 OK');
    assert(Array.isArray(breedsRes.body) && breedsRes.body.length >= 12, 'GET /api/breeds returns array of >= 12 breeds');

    // Test 2: GET /api/breeds filter
    const searchRes = await makeRequest('GET', '/api/breeds?search=German');
    assert(searchRes.statusCode === 200, 'GET /api/breeds?search=German returns 200 OK');
    assert(Array.isArray(searchRes.body) && searchRes.body.length >= 1, 'GET /api/breeds?search=German returns filtered results');

    // Test 3: GET /api/dogs
    const dogsRes = await makeRequest('GET', '/api/dogs');
    assert(dogsRes.statusCode === 200, 'GET /api/dogs returns 200 OK');
    assert(Array.isArray(dogsRes.body), 'GET /api/dogs returns array of dogs');

    // Test 4: POST /api/dogs
    const newDogPayload = {
      name: 'Verification Buster',
      breed_id: 1,
      age: 4,
      triggers: ['Bike/Skateboard', 'Dog off leash'],
      training_goals: 'LAT desensitization around bikes'
    };
    const createDogRes = await makeRequest('POST', '/api/dogs', newDogPayload);
    assert(createDogRes.statusCode === 201 || createDogRes.statusCode === 200, 'POST /api/dogs returns 201/200 Created');
    assert(createDogRes.body && createDogRes.body.id, 'POST /api/dogs returns object with id');
    const createdDogId = createDogRes.body ? createDogRes.body.id : null;

    // Test 5: GET /api/walks
    const walksRes = await makeRequest('GET', '/api/walks');
    assert(walksRes.statusCode === 200, 'GET /api/walks returns 200 OK');
    assert(Array.isArray(walksRes.body), 'GET /api/walks returns array');

    // Test 6: POST /api/walks
    const newWalkPayload = {
      dog_id: createdDogId || 1,
      start_time: new Date().toISOString()
    };
    const createWalkRes = await makeRequest('POST', '/api/walks', newWalkPayload);
    assert(createWalkRes.statusCode === 201 || createWalkRes.statusCode === 200, 'POST /api/walks returns 201/200 Created');
    assert(createWalkRes.body && createWalkRes.body.id, 'POST /api/walks returns object with walk id');
    const createdWalkId = createWalkRes.body ? createWalkRes.body.id : null;

    // Test 7: POST /api/walks/:id/events
    if (createdWalkId) {
      const eventPayload = {
        trigger_type: 'Dog off leash',
        intensity_level: 4,
        notes: 'Verification test trigger mark',
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date().toISOString()
      };
      const createEventRes = await makeRequest('POST', `/api/walks/${createdWalkId}/events`, eventPayload);
      assert(createEventRes.statusCode === 201 || createEventRes.statusCode === 200, 'POST /api/walks/:id/events returns 201/200');
    }

    // Test 8: PUT /api/walks/:id/finish
    if (createdWalkId) {
      const finishPayload = {
        end_time: new Date().toISOString(),
        route_coordinates: [{ lat: 40.7128, lng: -74.0060 }, { lat: 40.7130, lng: -74.0062 }],
        notes: 'Walk completed cleanly'
      };
      const finishWalkRes = await makeRequest('PUT', `/api/walks/${createdWalkId}/finish`, finishPayload);
      assert(finishWalkRes.statusCode === 200, 'PUT /api/walks/:id/finish returns 200 OK');
    }

    // Test 9: GET /api/stats
    const statsRes = await makeRequest('GET', '/api/stats');
    assert(statsRes.statusCode === 200, 'GET /api/stats returns 200 OK');
    assert(statsRes.body && typeof statsRes.body.total_walks === 'number', 'GET /api/stats contains total_walks count');
    assert(statsRes.body && typeof statsRes.body.total_events === 'number', 'GET /api/stats contains total_events count');
    assert(statsRes.body && statsRes.body.trigger_counts, 'GET /api/stats contains trigger_counts object');
    assert(statsRes.body && statsRes.body.intensity_distribution, 'GET /api/stats contains intensity_distribution object');

    // Test 10: DELETE /api/dogs/:id
    if (createdDogId) {
      const deleteDogRes = await makeRequest('DELETE', `/api/dogs/${createdDogId}`);
      assert(deleteDogRes.statusCode === 200 || deleteDogRes.statusCode === 204, 'DELETE /api/dogs/:id returns 200/204');
    }

  } catch (err) {
    fail(`HTTP Endpoint Verification failed: ${err.message}`);
  } finally {
    // Teardown
    if (server && server.close) {
      server.close();
    }
    if (db && db.close) {
      db.close();
    }
  }

  info('\n====================================================');
  info(` Summary: ${passedCount} / ${totalTests} assertions passed.`);
  info('====================================================');

  if (passedCount < totalTests || process.exitCode === 1) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
```

---

## 4. Exact Execution Command Sequence for Worker 1

Worker 1 MUST execute the following exact command steps to initialize, seed, and verify the backend:

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Initialize Database Schema & Seed Data
```powershell
node server/db/schema.js; node server/db/seed.js
```
*(Or if `server/index.js` automatically initializes DB schema and seeds on startup, running `node server/index.js` or `node server/db/connection.js` works)*

### Step 3: Primary Backend Verification Command String
Worker 1 MUST run:
```powershell
node server/verify-backend.js
```

---

## 5. Pass/Fail Exit Criteria & Thresholds

1. **Database Schema & DDL**:
   - `caniscalm.db` exists in `server/data/`.
   - `sqlite_master` contains `breeds`, `dogs`, `walks`, `reactivity_events`.
   - SQLite PRAGMAs: `journal_mode = wal`, `foreign_keys = 1`.
2. **Seed Data**:
   - `breeds` row count >= 12.
   - All breeds have integer ratings 1-5 for `energy_level`, `prey_drive`, `sensitivity`, `arousal_threshold`.
3. **REST HTTP Responses**:
   - `GET /api/breeds` -> status 200, returns array >= 12.
   - `GET /api/dogs` -> status 200.
   - `POST /api/dogs` -> status 201/200, returns object with `id`.
   - `GET /api/walks` -> status 200.
   - `POST /api/walks` -> status 201/200, returns object with `id`.
   - `POST /api/walks/:id/events` -> status 201/200.
   - `PUT /api/walks/:id/finish` -> status 200.
   - `GET /api/stats` -> status 200, returns object with `total_walks`, `total_events`, `trigger_counts`, `intensity_distribution`.
4. **Exit Code**:
   - `node server/verify-backend.js` returns exit code `0` on 100% assertion pass.
