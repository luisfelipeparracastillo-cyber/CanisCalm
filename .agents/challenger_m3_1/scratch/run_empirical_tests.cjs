const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log(' CANISCALM M3 ADVANCED STRESS TEST SUITE ');
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
  const geoFilePath = path.resolve(__dirname, '../../../src/services/geolocation.js');
  let geoCode = fs.readFileSync(geoFilePath, 'utf8');

  geoCode = geoCode.replace(/export\s+const\s+(\w+)\s*=/g, 'const $1 = exports.$1 =');
  geoCode = geoCode.replace(/export\s+function\s+(\w+)/g, 'function $1(...args) { return exports.$1(...args); }\nexports.$1 = function $1');

  const exportsObj = {};
  const context = {
    exports: exportsObj,
    console: console,
    Math: Math,
    Date: Date,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Number: Number,
    Array: Array,
    isNaN: isNaN,
    typeof: (val) => typeof val,
  };

  vm.createContext(context);
  vm.runInContext(geoCode, context);

  const {
    calculateDistance,
    calculateTotalDistance,
    createMockLocationWatcher,
    DEFAULT_LOCATION,
  } = exportsObj;

  // ------------------------------------------------------------------
  // Extreme Coordinate Testing (Antipodal, Polar, Wraparound)
  // ------------------------------------------------------------------
  console.log('\n--- Extreme Coordinate Stress Testing ---');

  // North Pole to South Pole (-90 to +90)
  const polarDist = calculateDistance(-90, 0, 90, 0);
  assert(!isNaN(polarDist) && polarDist > 19000000, `North Pole to South Pole distance is ~20,015km (got ${(polarDist/1000).toFixed(2)}km)`);

  // Antipodal points on equator (0, 0) to (0, 180)
  const equatorAntipodal = calculateDistance(0, 0, 0, 180);
  assert(!isNaN(equatorAntipodal) && equatorAntipodal > 19000000, `Equator antipodal distance is ~20,015km (got ${(equatorAntipodal/1000).toFixed(2)}km)`);

  // Random 10,000 coordinate pairs test for NaN or Infinities
  let nanCount = 0;
  for (let i = 0; i < 10000; i++) {
    const lat1 = (Math.random() - 0.5) * 180;
    const lon1 = (Math.random() - 0.5) * 360;
    const lat2 = (Math.random() - 0.5) * 180;
    const lon2 = (Math.random() - 0.5) * 360;
    const d = calculateDistance(lat1, lon1, lat2, lon2);
    if (isNaN(d) || !isFinite(d)) {
      nanCount++;
    }
  }
  assert(nanCount === 0, `10,000 random global coordinate pairs returned zero NaNs/Infinities`);

  // ------------------------------------------------------------------
  // Verification of Build Artifacts & Endpoints
  // ------------------------------------------------------------------
  console.log('\n--- Verification of Build & File Layout ---');
  const distDirExists = fs.existsSync(path.resolve(__dirname, '../../../dist/index.html'));
  assert(distDirExists, 'Production build bundle exists in dist/index.html');

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
  console.error('Unhandled error:', err);
  process.exit(1);
});
