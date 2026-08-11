/**
 * Challenger 2 - Empirical Verification Script for Milestone 1
 * Location: .agents/challenger_m1_2/verify_empirical.js
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const Database = require('better-sqlite3');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DB_PATH = path.join(PROJECT_ROOT, 'server', 'data', 'caniscalm.db');
const PORT = 3002; // Use distinct port for testing to avoid conflicts
const BASE_URL = `http://localhost:${PORT}`;

let totalAsserts = 0;
let passedAsserts = 0;
let failedAsserts = 0;
const failures = [];

function assert(condition, description, detail = '') {
  totalAsserts++;
  if (condition) {
    passedAsserts++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${description}`);
  } else {
    failedAsserts++;
    const err = `[FAIL] ${description} ${detail ? '(' + detail + ')' : ''}`;
    failures.push(err);
    console.error(`\x1b[31m${err}\x1b[0m`);
  }
}

function makeRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runEmpiricalSuite() {
  console.log('\n======================================================');
  console.log(' Challenger 2: Empirical Verification for Milestone 1 ');
  console.log('======================================================\n');

  // --- 1. DB Integrity & PRAGMA Verification ---
  console.log('--- Phase 1: SQLite DB Connection & Integrity Tests ---');
  
  assert(fs.existsSync(DB_PATH), `Database file exists at ${DB_PATH}`);

  let db;
  try {
    // Connect to actual database
    db = new Database(DB_PATH);

    // 1.1 PRAGMAs
    const journalMode = db.pragma('journal_mode', { simple: true });
    assert(journalMode.toLowerCase() === 'wal', `journal_mode is WAL (actual: ${journalMode})`);

    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    assert(foreignKeys === 1 || foreignKeys === '1' || foreignKeys === true, `foreign_keys PRAGMA is ON (actual: ${foreignKeys})`);

    // 1.2 Schema tables check
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    assert(tables.includes('breeds'), 'Table "breeds" exists');
    assert(tables.includes('dogs'), 'Table "dogs" exists');
    assert(tables.includes('walks'), 'Table "walks" exists');
    assert(tables.includes('reactivity_events'), 'Table "reactivity_events" exists');

    // 1.3 Indices check
    const indices = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(i => i.name);
    assert(indices.includes('idx_breeds_energy'), 'Index idx_breeds_energy exists');
    assert(indices.includes('idx_breeds_prey'), 'Index idx_breeds_prey exists');
    assert(indices.includes('idx_breeds_sensitivity'), 'Index idx_breeds_sensitivity exists');
    assert(indices.includes('idx_breeds_arousal'), 'Index idx_breeds_arousal exists');
    assert(indices.includes('idx_dogs_breed_id'), 'Index idx_dogs_breed_id exists');
    assert(indices.includes('idx_walks_dog_id'), 'Index idx_walks_dog_id exists');
    assert(indices.includes('idx_reactivity_events_walk_id'), 'Index idx_reactivity_events_walk_id exists');

  } catch (err) {
    assert(false, `Database connection / schema check failed: ${err.message}`);
  }

  // --- 2. 12 Spanish Breed Entries Verification ---
  console.log('\n--- Phase 2: 12 Spanish Breed Entries & Rating Scales ---');
  try {
    const breeds = db.prepare('SELECT * FROM breeds ORDER BY id ASC').all();
    assert(breeds.length === 12, `Breed count is exactly 12 (actual: ${breeds.length})`);

    const expectedBreedNames = [
      "Pastor Alemán",
      "Pastor Belga Malinois",
      "Border Collie",
      "Golden Retriever",
      "Labrador Retriever",
      "Rottweiler",
      "American Staffordshire Terrier",
      "Beagle",
      "Jack Russell Terrier",
      "Dóberman Pinscher",
      "Shiba Inu",
      "Mestizo (Criollo)"
    ];

    const breedNames = breeds.map(b => b.name);
    let allNamesPresent = true;
    for (const name of expectedBreedNames) {
      if (!breedNames.includes(name)) {
        allNamesPresent = false;
        console.error(`Missing breed name: ${name}`);
      }
    }
    assert(allNamesPresent, 'All 12 expected Spanish breed names are present in database');

    // Check descriptions are non-empty strings in Spanish
    let validDescriptions = true;
    for (const b of breeds) {
      if (!b.description || typeof b.description !== 'string' || b.description.trim().length < 10) {
        validDescriptions = false;
        console.error(`Invalid description for breed ${b.name}: ${b.description}`);
      }
    }
    assert(validDescriptions, 'All 12 breed entries have descriptive Spanish text');

    // Check ratings scale (1-5) for energy_level, prey_drive, sensitivity, arousal_threshold
    let validRatings = true;
    for (const b of breeds) {
      const e = b.energy_level;
      const p = b.prey_drive;
      const s = b.sensitivity;
      const a = b.arousal_threshold;

      if (!Number.isInteger(e) || e < 1 || e > 5 ||
          !Number.isInteger(p) || p < 1 || p > 5 ||
          !Number.isInteger(s) || s < 1 || s > 5 ||
          !Number.isInteger(a) || a < 1 || a > 5) {
        validRatings = false;
        console.error(`Invalid rating in breed ${b.name}: energy=${e}, prey=${p}, sensitivity=${s}, arousal=${a}`);
      }
    }
    assert(validRatings, 'All 12 breeds have valid integer ratings (1-5) for energy, prey, sensitivity, and arousal');

    // Test CHECK constraint enforcement on breeds table by attempting out-of-range insert in an in-memory DB or transaction rollbacks
    try {
      db.prepare(`
        INSERT INTO breeds (name, description, energy_level, prey_drive, sensitivity, arousal_threshold)
        VALUES ('TestBreedFail', 'Test', 6, 3, 3, 3)
      `).run();
      assert(false, 'CHECK constraint on energy_level should prevent values > 5');
    } catch (e) {
      assert(e.message.includes('CHECK constraint failed'), 'CHECK constraint properly rejects energy_level > 5');
    }

    try {
      db.prepare(`
        INSERT INTO breeds (name, description, energy_level, prey_drive, sensitivity, arousal_threshold)
        VALUES ('TestBreedFail2', 'Test', 3, 0, 3, 3)
      `).run();
      assert(false, 'CHECK constraint on prey_drive should prevent values < 1');
    } catch (e) {
      assert(e.message.includes('CHECK constraint failed'), 'CHECK constraint properly rejects prey_drive < 1');
    }

  } catch (err) {
    assert(false, `Breed verification failed: ${err.message}`);
  }

  // --- 3. Foreign Key Constraints & Data Integrity Stress Tests ---
  console.log('\n--- Phase 3: DB Foreign Key Constraints & Integrity ---');
  try {
    // 3.1 Foreign Key rejection on invalid breed_id
    try {
      db.prepare("INSERT INTO dogs (name, breed_id, age) VALUES ('BadDog', 9999, 2)").run();
      assert(false, 'Foreign key constraint should reject invalid breed_id 9999');
    } catch (e) {
      assert(e.message.includes('FOREIGN KEY constraint failed'), 'FK constraint properly rejected invalid breed_id');
    }

    // 3.2 Foreign Key rejection on invalid dog_id in walks
    try {
      db.prepare("INSERT INTO walks (dog_id) VALUES (9999)").run();
      assert(false, 'Foreign key constraint should reject invalid dog_id 9999 in walks');
    } catch (e) {
      assert(e.message.includes('FOREIGN KEY constraint failed'), 'FK constraint properly rejected invalid dog_id in walks');
    }

    // 3.3 Foreign Key rejection on invalid walk_id in reactivity_events
    try {
      db.prepare("INSERT INTO reactivity_events (walk_id, dog_id, trigger_type, intensity_level, latitude, longitude) VALUES (9999, 1, 'Noise', 3, 0, 0)").run();
      assert(false, 'Foreign key constraint should reject invalid walk_id 9999 in reactivity_events');
    } catch (e) {
      assert(e.message.includes('FOREIGN KEY constraint failed'), 'FK constraint properly rejected invalid walk_id');
    }

  } catch (err) {
    assert(false, `FK constraint verification failed: ${err.message}`);
  }

  // --- 4. Server Execution & `/api/stats` API Endpoint Empirical Verification ---
  console.log('\n--- Phase 4: Express Server & /api/stats Endpoint Aggregations ---');
  
  process.env.PORT = PORT;
  const app = require(path.join(PROJECT_ROOT, 'server', 'index.js'));
  let server;

  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test Express server active on port ${PORT}`);
      resolve();
    });
  });

  try {
    // 4.1 Request /api/stats
    const res = await makeRequest('GET', '/api/stats');
    assert(res.statusCode === 200, 'GET /api/stats returns status HTTP 200 OK');

    const stats = res.body;
    assert(stats && typeof stats === 'object', 'GET /api/stats returns JSON object');

    // Compare with raw SQL queries from the DB
    const dbTotalWalks = db.prepare('SELECT COUNT(*) as count FROM walks').get().count;
    const dbTotalEvents = db.prepare('SELECT COUNT(*) as count FROM reactivity_events').get().count;

    assert(stats.total_walks === dbTotalWalks, `stats.total_walks matches DB count (${stats.total_walks} === ${dbTotalWalks})`);
    assert(stats.total_events === dbTotalEvents, `stats.total_events matches DB count (${stats.total_events} === ${dbTotalEvents})`);

    // Verify trigger_counts structure and sum
    assert(stats.trigger_counts && typeof stats.trigger_counts === 'object', 'stats.trigger_counts exists');
    
    // Calculate total events reported in trigger_counts for known categories
    const triggerRows = db.prepare('SELECT trigger_type, COUNT(*) as count FROM reactivity_events GROUP BY trigger_type').all();
    let triggerMatch = true;
    for (const row of triggerRows) {
      if (stats.trigger_counts[row.trigger_type] !== row.count) {
        triggerMatch = false;
        console.error(`Mismatch for trigger "${row.trigger_type}": API=${stats.trigger_counts[row.trigger_type]}, DB=${row.count}`);
      }
    }
    assert(triggerMatch, 'stats.trigger_counts values match exact DB counts per category');

    // Verify intensity_distribution (1-5)
    assert(stats.intensity_distribution && typeof stats.intensity_distribution === 'object', 'stats.intensity_distribution exists');
    const intensityRows = db.prepare('SELECT intensity_level, COUNT(*) as count FROM reactivity_events GROUP BY intensity_level').all();
    let intensitySum = 0;
    let intensityMatch = true;
    for (let i = 1; i <= 5; i++) {
      const dbCountRow = intensityRows.find(r => r.intensity_level === i);
      const expectedCount = dbCountRow ? dbCountRow.count : 0;
      const apiCount = stats.intensity_distribution[String(i)] || 0;
      intensitySum += apiCount;
      if (apiCount !== expectedCount) {
        intensityMatch = false;
        console.error(`Mismatch for intensity ${i}: API=${apiCount}, DB=${expectedCount}`);
      }
    }
    assert(intensityMatch, 'stats.intensity_distribution (1-5) values match exact DB counts');
    assert(intensitySum === dbTotalEvents, `Sum of intensity_distribution (${intensitySum}) equals total_events (${dbTotalEvents})`);

    // Verify heatmap_points
    assert(Array.isArray(stats.heatmap_points), 'stats.heatmap_points is an array');
    assert(stats.heatmap_points.length === dbTotalEvents, `heatmap_points length (${stats.heatmap_points.length}) equals total_events (${dbTotalEvents})`);

    let heatmapValid = true;
    for (const point of stats.heatmap_points) {
      if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number' ||
          typeof point.lat !== 'number' || typeof point.lng !== 'number' ||
          typeof point.intensity !== 'number' || !point.trigger_type) {
        heatmapValid = false;
        console.error(`Invalid heatmap point: ${JSON.stringify(point)}`);
      }
    }
    assert(heatmapValid, 'All heatmap points have required GPS lat, lng, intensity, and trigger_type fields');

    // Verify walk_history
    assert(Array.isArray(stats.walk_history), 'stats.walk_history is an array');
    assert(stats.walk_history.length <= 20, 'stats.walk_history returns up to 20 walks');
    
    let walkHistoryValid = true;
    for (const walk of stats.walk_history) {
      if (walk.id === undefined || !walk.start_time || !walk.status ||
          typeof walk.duration_seconds !== 'number' || typeof walk.distance_meters !== 'number' ||
          !Array.isArray(walk.route_coordinates) || typeof walk.event_count !== 'number' ||
          typeof walk.max_intensity !== 'number') {
        walkHistoryValid = false;
        console.error(`Invalid walk history entry: ${JSON.stringify(walk)}`);
      }
    }
    assert(walkHistoryValid, 'All walk_history items have required parsed fields (route_coordinates, event_count, max_intensity)');

    // 4.2 Query filtering by dog_id
    const dog = db.prepare('SELECT id FROM dogs LIMIT 1').get();
    if (dog) {
      const dogStatsRes = await makeRequest('GET', `/api/stats?dog_id=${dog.id}`);
      assert(dogStatsRes.statusCode === 200, `GET /api/stats?dog_id=${dog.id} returns 200 OK`);
      
      const expectedDogWalks = db.prepare('SELECT COUNT(*) as count FROM walks WHERE dog_id = ?').get(dog.id).count;
      const expectedDogEvents = db.prepare('SELECT COUNT(*) as count FROM reactivity_events WHERE dog_id = ?').get(dog.id).count;

      assert(dogStatsRes.body.total_walks === expectedDogWalks, `Filtered total_walks matches dog ${dog.id} (${dogStatsRes.body.total_walks} === ${expectedDogWalks})`);
      assert(dogStatsRes.body.total_events === expectedDogEvents, `Filtered total_events matches dog ${dog.id} (${dogStatsRes.body.total_events} === ${expectedDogEvents})`);
    }

  } catch (err) {
    assert(false, `/api/stats verification failed: ${err.message}`);
  } finally {
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (db && db.close) {
      db.close();
    }
  }

  // --- Summary & Verdict ---
  console.log('\n======================================================');
  console.log(` Empirical Test Results: ${passedAsserts} / ${totalAsserts} Passed.`);
  if (failedAsserts > 0) {
    console.log(` Total Failures: ${failedAsserts}`);
    failures.forEach(f => console.log(`  - ${f}`));
  }
  console.log('======================================================\n');

  if (failedAsserts === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEmpiricalSuite().catch(err => {
  console.error('Unhandled error during test run:', err);
  process.exit(1);
});
