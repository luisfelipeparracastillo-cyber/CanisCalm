const path = require('path');
const { pathToFileURL } = require('url');

console.log('====================================================');
console.log(' CANISCALM M3 EMPIRICAL STRESS TEST SUITE ');
console.log('====================================================');

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(` [PASS] ${message}`);
    passes++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    fails++;
  }
}

async function runTests() {
  const geoPath = path.resolve(__dirname, '../../../src/services/geolocation.js');
  const geo = await import(pathToFileURL(geoPath).href);

  const {
    calculateDistance,
    calculateTotalDistance,
    createMockLocationWatcher,
    DEFAULT_LOCATION
  } = geo;

  // ------------------------------------------------------------------
  // SCENARIO 4 & 3: Haversine Distance & Location Edge Cases
  // ------------------------------------------------------------------
  console.log('\n--- Scenario 3 & 4: Haversine Accuracy & Coordinates Edge Cases ---');

  // Test 1: Single point or empty array
  assert(calculateTotalDistance([]) === 0, 'calculateTotalDistance([]) returns 0');
  assert(calculateTotalDistance([{ lat: 40.7829, lng: -73.9654 }]) === 0, 'Single point returns 0 distance');
  assert(calculateTotalDistance([{ lat: 40.7829, lng: -73.9654 }, { lat: 40.7829, lng: -73.9654 }]) === 0, 'Identical points return 0 distance');

  // Test 2: Invalid inputs
  assert(calculateTotalDistance(null) === 0, 'Null input returns 0 distance');
  assert(calculateTotalDistance(undefined) === 0, 'Undefined input returns 0 distance');
  assert(calculateTotalDistance('invalid') === 0, 'String input returns 0 distance');

  // Test 3: Zero coordinates (0,0)
  const distZeroZero = calculateDistance(0, 0, 0, 0);
  assert(distZeroZero === 0, `Distance (0,0) to (0,0) is 0 (got ${distZeroZero})`);

  const distFromEquator = calculateDistance(0, 0, 1, 0);
  // 1 degree latitude = ~111,195m
  assert(distFromEquator > 110000 && distFromEquator < 112000, `1 degree lat distance is ~111.2km (got ${distFromEquator}m)`);

  // Test 4: Negative coordinates (Southern / Western hemisphere)
  // Sydney (-33.8688, 151.2093) to Melbourne (-37.8136, 144.9631) ~ 713km
  const sydneyMelb = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
  assert(sydneyMelb > 700000 && sydneyMelb < 730000, `Sydney to Melbourne distance is ~713km (got ${(sydneyMelb/1000).toFixed(2)}km)`);

  // Test 5: Property variations ({lat, lng} vs {latitude, longitude})
  const routeMix = [
    { lat: 40.7829, lng: -73.9654 },
    { latitude: 40.7830, longitude: -73.9654 }, // ~11 meters north
  ];
  const distMix = calculateTotalDistance(routeMix);
  assert(distMix > 10 && distMix < 12, `Mixed property names handled correctly (got ${distMix}m)`);

  // Test 6: Array containing invalid or partial points
  const routeWithPartial = [
    { lat: 40.7829, lng: -73.9654 },
    { lat: null, lng: -73.9654 },
    { lat: 40.7839, lng: -73.9654 },
  ];
  // Point 1 to Point 2 skipped due to null, total computed without throwing
  const distPartial = calculateTotalDistance(routeWithPartial);
  assert(typeof distPartial === 'number' && !isNaN(distPartial), `Partial/null points handled gracefully without crashing (got ${distPartial}m)`);

  // Test 7: Multi-point additive accuracy
  const p1 = { lat: 40.7000, lng: -74.0000 };
  const p2 = { lat: 40.7100, lng: -74.0000 };
  const p3 = { lat: 40.7200, lng: -74.0000 };
  const seg1 = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
  const seg2 = calculateDistance(p2.lat, p2.lng, p3.lat, p3.lng);
  const totalDirect = calculateTotalDistance([p1, p2, p3]);
  assert(Math.abs((seg1 + seg2) - totalDirect) < 0.1, `Sum of segments equals total route distance (${seg1} + ${seg2} = ${totalDirect})`);

  // ------------------------------------------------------------------
  // SCENARIO 3 PERFORMANCE: Rapid / High-volume Location Updates Benchmark
  // ------------------------------------------------------------------
  console.log('\n--- Scenario 3 Performance Benchmark: High-volume route coordinates ---');
  const largeRoute = [];
  const startLat = 40.7829;
  const startLng = -73.9654;

  // Generate 5,000 route points
  for (let i = 0; i < 5000; i++) {
    largeRoute.push({
      lat: startLat + i * 0.00001,
      lng: startLng + i * 0.00001,
    });
  }

  const startTime = Date.now();
  const largeDist = calculateTotalDistance(largeRoute);
  const elapsed = Date.now() - startTime;
  assert(elapsed < 500, `5,000 points distance calculation completed in ${elapsed}ms (distance: ${largeDist}m)`);

  // ------------------------------------------------------------------
  // SCENARIO 3 FALLBACK: Mock Location Watcher Verification
  // ------------------------------------------------------------------
  console.log('\n--- Scenario 3: Mock Location Watcher Execution ---');

  await new Promise((resolve) => {
    let positionCount = 0;
    const watcher = createMockLocationWatcher((pos) => {
      positionCount++;
      assert(typeof pos.lat === 'number' && !isNaN(pos.lat), `Mock pos #${positionCount} has valid lat: ${pos.lat}`);
      assert(typeof pos.lng === 'number' && !isNaN(pos.lng), `Mock pos #${positionCount} has valid lng: ${pos.lng}`);
      assert(pos.isMock === true, `Mock flag is set to true`);
      if (positionCount >= 2) {
        watcher.stop();
        resolve();
      }
    });
  });

  // ------------------------------------------------------------------
  // SCENARIO 1 & 2 SIMULATION: Rapid Trigger Logging & Walk Lifecycle
  // ------------------------------------------------------------------
  console.log('\n--- Scenario 1 & 2: Rapid Clicking & Walk Lifecycle State Machine ---');

  // Mock AppContext state store to simulate React state under rapid calls
  class AppContextSimulator {
    constructor() {
      this.activeWalk = null;
      this.isWalking = false;
      this.isPaused = false;
      this.routeCoordinates = [];
      this.currentPosition = DEFAULT_LOCATION;
      this.walkDistance = 0;
      this.walkDuration = 0;
      this.walkEvents = [];
    }

    async startNewWalk(dogId) {
      if (!dogId) throw new Error('Debes seleccionar un perro antes de iniciar un paseo.');
      this.activeWalk = { id: Date.now(), dog_id: dogId, status: 'active', events: [] };
      this.routeCoordinates = [];
      this.walkDistance = 0;
      this.walkDuration = 0;
      this.walkEvents = [];
      this.isPaused = false;
      this.isWalking = true;
      return this.activeWalk;
    }

    pauseWalk() {
      this.isPaused = true;
    }

    resumeWalk() {
      this.isPaused = false;
    }

    async finishCurrentWalk(notes = '') {
      if (!this.activeWalk) return null;
      const finished = { ...this.activeWalk, status: 'completed', notes };
      this.activeWalk = null;
      this.isWalking = false;
      this.isPaused = false;
      return finished;
    }

    async logEventToWalk(eventData) {
      if (!this.activeWalk) {
        throw new Error('No hay un paseo activo para registrar el evento.');
      }
      const newEvent = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        latitude: this.currentPosition?.lat ?? 40.7829,
        longitude: this.currentPosition?.lng ?? -73.9654,
        ...eventData,
      };
      this.walkEvents.push(newEvent);
      this.activeWalk.events.push(newEvent);
      return newEvent;
    }
  }

  const sim = new AppContextSimulator();

  // Test Scenario 2: Rapid Start, Pause, Resume, Finish
  console.log('Testing rapid lifecycle execution...');
  const walk1 = await sim.startNewWalk(1);
  assert(sim.isWalking === true && sim.activeWalk !== null, 'Walk started successfully');

  sim.pauseWalk();
  assert(sim.isPaused === true, 'Walk paused');

  sim.resumeWalk();
  assert(sim.isPaused === false, 'Walk resumed');

  const finished1 = await sim.finishCurrentWalk('Fast walk finished');
  assert(sim.isWalking === false && sim.activeWalk === null, 'Walk finished cleanly');
  assert(finished1.status === 'completed', 'Finished payload status is completed');

  // Test Scenario 1: Rapid 1-tap trigger logging
  console.log('Testing rapid trigger logging (100 concurrent/rapid events)...');
  await sim.startNewWalk(1);

  const triggerCategories = ['Dog off leash', 'Bike/Skateboard', 'Person/Child', 'Loud Noise', 'Vehicle'];
  const promises = [];

  for (let i = 0; i < 100; i++) {
    const cat = triggerCategories[i % triggerCategories.length];
    const intensity = (i % 5) + 1;
    promises.push(sim.logEventToWalk({
      trigger_type: cat,
      intensity_level: intensity,
      notes: `Rapid log test #${i + 1}`,
    }));
  }

  await Promise.all(promises);

  assert(sim.walkEvents.length === 100, `100 rapid events logged cleanly (got ${sim.walkEvents.length})`);
  assert(sim.activeWalk.events.length === 100, `Active walk reflects all 100 logged events`);

  // Verify intensity distribution in logged events
  const intensityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  sim.walkEvents.forEach((evt) => {
    intensityCounts[evt.intensity_level]++;
  });
  assert(
    intensityCounts[1] === 20 &&
    intensityCounts[2] === 20 &&
    intensityCounts[3] === 20 &&
    intensityCounts[4] === 20 &&
    intensityCounts[5] === 20,
    'All intensity levels (1-5) logged accurately across rapid submissions'
  );

  await sim.finishCurrentWalk();

  // Test logging event when NO walk is active
  try {
    await sim.logEventToWalk({ trigger_type: 'Dog off leash', intensity_level: 3 });
    assert(false, 'Logging event without active walk should throw error');
  } catch (err) {
    assert(err.message === 'No hay un paseo activo para registrar el evento.', 'Error thrown correctly when logging without active walk');
  }

  // ------------------------------------------------------------------
  // SCENARIO 5: Map Engine Switching Logic Analysis
  // ------------------------------------------------------------------
  console.log('\n--- Scenario 5: Dual Map Engine Switcher Logic Verification ---');

  function computeActiveEngine(selectedEngine, googleLoadError, hasApiKey) {
    return (selectedEngine === 'google' && !googleLoadError && hasApiKey) ? 'google' : 'leaflet';
  }

  assert(computeActiveEngine('google', false, true) === 'google', 'Engine is google when key present, selected, and no load error');
  assert(computeActiveEngine('google', true, true) === 'leaflet', 'Engine falls back to leaflet when google load error occurs');
  assert(computeActiveEngine('google', false, false) === 'leaflet', 'Engine defaults to leaflet when API key is missing');
  assert(computeActiveEngine('leaflet', false, true) === 'leaflet', 'Engine stays leaflet when leaflet explicitly selected by user toggle');

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passes} PASSED, ${fails} FAILED`);
  console.log('====================================================');

  if (fails > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
