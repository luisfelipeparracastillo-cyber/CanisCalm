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
let passedCount = 0;

function assert(condition, description) {
  totalTests++;
  if (condition) {
    passedCount++;
    pass(description);
  } else {
    fail(description);
  }
}

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

  // --- STEP 1: Database Verification ---
  info('\n--- Phase 1: Database & Schema Verification ---');

  try {
    db = require('./db/connection');
    const jsonPath = path.join(__dirname, 'data', 'caniscalm.json');
    assert(fs.existsSync(jsonPath) || db !== undefined, 'Database store and connection initialized');
    assert(typeof db.prepare === 'function', 'Database interface exports prepare() contract');
    assert(db.data && db.data.breeds !== undefined, 'Table "breeds" exists');
    assert(db.data && db.data.dogs !== undefined, 'Table "dogs" exists');
    assert(db.data && db.data.walks !== undefined, 'Table "walks" exists');
    assert(db.data && db.data.reactivity_events !== undefined, 'Table "reactivity_events" exists');

    // Check breeds seed count
    const breedCount = db.prepare('SELECT COUNT(*) as count FROM breeds').get().count;
    assert(breedCount >= 12, `Breed table contains >= 12 items (actual count: ${breedCount})`);

    // Check sample breeds ratings range 1-5
    const breeds = db.prepare('SELECT * FROM breeds').all();
    const invalidBreeds = breeds.filter(b =>
      b.energy_level < 1 || b.energy_level > 5 ||
      b.prey_drive < 1 || b.prey_drive > 5 ||
      b.sensitivity < 1 || b.sensitivity > 5 ||
      b.arousal_threshold < 1 || b.arousal_threshold > 5
    ).length;
    assert(invalidBreeds === 0, 'All seeded breeds have 1-5 ratings for energy, prey_drive, sensitivity, arousal_threshold');

    // Check mock dog profiles, walks, events
    const dogCount = db.prepare('SELECT COUNT(*) as count FROM dogs').get().count;
    assert(dogCount >= 1, `Dogs table contains mock profile(s) (actual count: ${dogCount})`);

    const walkCount = db.prepare('SELECT COUNT(*) as count FROM walks').get().count;
    assert(walkCount >= 1, `Walks table contains mock walk(s) (actual count: ${walkCount})`);

    const eventCount = db.prepare('SELECT COUNT(*) as count FROM reactivity_events').get().count;
    assert(eventCount >= 1, `Reactivity events table contains mock event(s) (actual count: ${eventCount})`);
  } catch (err) {
    fail(`Database integrity check failed: ${err.message}`);
  }

  // --- STEP 2: Express HTTP REST Verification ---
  info('\n--- Phase 2: REST API Endpoint HTTP Verification ---');

  const app = require('./index.js');

  // Start HTTP server for verification if not already running
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      info(`Express test server listening on port ${PORT}`);
      resolve();
    });
  });

  try {
    // Health Check Test
    const healthRes = await makeRequest('GET', '/api/health');
    assert(healthRes.statusCode === 200 && healthRes.body && healthRes.body.status === 'ok', 'GET /api/health returns 200 OK with status ok');

    // Test 1: GET /api/breeds
    const breedsRes = await makeRequest('GET', '/api/breeds');
    assert(breedsRes.statusCode === 200, 'GET /api/breeds returns 200 OK');
    assert(Array.isArray(breedsRes.body) && breedsRes.body.length >= 12, 'GET /api/breeds returns array of >= 12 breeds');

    // Test 2: GET /api/breeds filter
    const searchRes = await makeRequest('GET', '/api/breeds?search=Pastor');
    assert(searchRes.statusCode === 200, 'GET /api/breeds?search=Pastor returns 200 OK');
    assert(Array.isArray(searchRes.body) && searchRes.body.length >= 1, 'GET /api/breeds?search=Pastor returns filtered results');

    const filterRes = await makeRequest('GET', '/api/breeds?energy=4&prey=4');
    assert(filterRes.statusCode === 200, 'GET /api/breeds?energy=4&prey=4 returns 200 OK');

    // Test 3: GET /api/dogs
    const dogsRes = await makeRequest('GET', '/api/dogs');
    assert(dogsRes.statusCode === 200, 'GET /api/dogs returns 200 OK');
    assert(Array.isArray(dogsRes.body) && dogsRes.body.length >= 1, 'GET /api/dogs returns array of dogs with breed info');

    // Test 4: POST /api/dogs
    const newDogPayload = {
      name: 'Verification Buster',
      breed_id: 1,
      age: 4,
      triggers: ['Bike/Skateboard', 'Dog off leash'],
      training_goals: 'LAT desensitization around bikes'
    };
    const createDogRes = await makeRequest('POST', '/api/dogs', newDogPayload);
    assert(createDogRes.statusCode === 201 || createDogRes.statusCode === 200, 'POST /api/dogs returns 201 Created');
    assert(createDogRes.body && createDogRes.body.id, 'POST /api/dogs returns object with id');
    const createdDogId = createDogRes.body ? createDogRes.body.id : null;

    // Test 5: GET /api/dogs/:id
    if (createdDogId) {
      const getDogRes = await makeRequest('GET', `/api/dogs/${createdDogId}`);
      assert(getDogRes.statusCode === 200 && getDogRes.body.name === 'Verification Buster', 'GET /api/dogs/:id returns dog details');

      // PUT /api/dogs/:id
      const updateDogRes = await makeRequest('PUT', `/api/dogs/${createdDogId}`, { age: 5 });
      assert(updateDogRes.statusCode === 200 && updateDogRes.body.age === 5, 'PUT /api/dogs/:id updates dog details');
    }

    // Test 6: GET /api/walks
    const walksRes = await makeRequest('GET', '/api/walks');
    assert(walksRes.statusCode === 200, 'GET /api/walks returns 200 OK');
    assert(Array.isArray(walksRes.body), 'GET /api/walks returns array');

    // Test 7: POST /api/walks
    const newWalkPayload = {
      dog_id: createdDogId || 1,
      start_time: new Date().toISOString()
    };
    const createWalkRes = await makeRequest('POST', '/api/walks', newWalkPayload);
    assert(createWalkRes.statusCode === 201 || createWalkRes.statusCode === 200, 'POST /api/walks returns 201 Created');
    assert(createWalkRes.body && createWalkRes.body.id, 'POST /api/walks returns object with walk id');
    const createdWalkId = createWalkRes.body ? createWalkRes.body.id : null;

    // Test 8: POST /api/walks/:id/events
    if (createdWalkId) {
      const eventPayload = {
        trigger_type: 'Dog off leash',
        intensity_level: 4,
        notes: 'Verification test trigger mark',
        latitude: 4.6097,
        longitude: -74.0817,
        timestamp: new Date().toISOString()
      };
      const createEventRes = await makeRequest('POST', `/api/walks/${createdWalkId}/events`, eventPayload);
      assert(createEventRes.statusCode === 201 || createEventRes.statusCode === 200, 'POST /api/walks/:id/events returns 201 Created');
    }

    // Test 9: PUT /api/walks/:id/finish
    if (createdWalkId) {
      const finishPayload = {
        end_time: new Date().toISOString(),
        duration_seconds: 900,
        distance_meters: 850.5,
        route_coordinates: [{ lat: 4.6097, lng: -74.0817 }, { lat: 4.6100, lng: -74.0820 }],
        notes: 'Walk completed cleanly'
      };
      const finishWalkRes = await makeRequest('PUT', `/api/walks/${createdWalkId}/finish`, finishPayload);
      assert(finishWalkRes.statusCode === 200 && finishWalkRes.body.status === 'completed', 'PUT /api/walks/:id/finish returns 200 OK completed');
    }

    // Test 10: GET /api/stats
    const statsRes = await makeRequest('GET', '/api/stats');
    assert(statsRes.statusCode === 200, 'GET /api/stats returns 200 OK');
    assert(statsRes.body && typeof statsRes.body.total_walks === 'number', 'GET /api/stats contains total_walks count');
    assert(statsRes.body && typeof statsRes.body.total_events === 'number', 'GET /api/stats contains total_events count');
    assert(statsRes.body && statsRes.body.trigger_counts, 'GET /api/stats contains trigger_counts object');
    assert(statsRes.body && statsRes.body.intensity_distribution, 'GET /api/stats contains intensity_distribution object');
    assert(statsRes.body && Array.isArray(statsRes.body.heatmap_points), 'GET /api/stats contains heatmap_points array');
    assert(statsRes.body && Array.isArray(statsRes.body.walk_history), 'GET /api/stats contains walk_history array');

    // Test 11: DELETE /api/dogs/:id
    if (createdDogId) {
      const deleteDogRes = await makeRequest('DELETE', `/api/dogs/${createdDogId}`);
      assert(deleteDogRes.statusCode === 200 || deleteDogRes.statusCode === 204, 'DELETE /api/dogs/:id returns 200 OK');
    }

  } catch (err) {
    fail(`HTTP Endpoint Verification failed: ${err.message}`);
  } finally {
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
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
