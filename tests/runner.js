/**
 * CanisCalm E2E Test Suite Runner
 * Custom, zero-dependency Node test harness for full 4-tier requirement verification.
 */

const path = require('node:path');

// Test suite state container
const state = {
  suites: [],
  currentSuite: null,
  totalPassed: 0,
  totalFailed: 0,
  tierCounts: {
    tier1: { passed: 0, failed: 0, total: 0 },
    tier2: { passed: 0, failed: 0, total: 0 },
    tier3: { passed: 0, failed: 0, total: 0 },
    tier4: { passed: 0, failed: 0, total: 0 }
  },
  featureCounts: {}
};

// Initialize Feature Counts for F1 to F15
for (let f = 1; f <= 15; f++) {
  state.featureCounts[`F${f}`] = { tier1: 0, tier2: 0, total: 0 };
}

function suite(name, fn) {
  const currentSuite = {
    name,
    tests: []
  };
  state.suites.push(currentSuite);
  state.currentSuite = currentSuite;
  fn();
  state.currentSuite = null;
}

function test(name, metaOrFn, fn) {
  let meta = {};
  let testFn = fn;
  
  if (typeof metaOrFn === 'function') {
    testFn = metaOrFn;
  } else {
    meta = metaOrFn || {};
  }

  if (!state.currentSuite) {
    throw new Error(`Test "${name}" must be registered within a suite() block.`);
  }

  state.currentSuite.tests.push({
    name,
    tier: meta.tier || 1,
    featureId: meta.featureId || null,
    fn: testFn
  });
}

// Immediately export suite and test so child test files can require them during loadSuites()
module.exports = {
  suite,
  test,
  run,
  state
};

async function run() {
  console.log('\n=============================================================');
  console.log('       CANISCALM E2E TEST SUITE RUNNER (TIERS 1 - 4)');
  console.log('=============================================================\n');

  const startTime = Date.now();

  for (const s of state.suites) {
    console.log(`\n-------------------------------------------------------------`);
    console.log(`SUITE: ${s.name}`);
    console.log(`-------------------------------------------------------------`);

    for (const t of s.tests) {
      const tierKey = `tier${t.tier}`;
      state.tierCounts[tierKey].total++;
      if (t.featureId && state.featureCounts[t.featureId]) {
        state.featureCounts[t.featureId].total++;
        if (t.tier === 1) state.featureCounts[t.featureId].tier1++;
        if (t.tier === 2) state.featureCounts[t.featureId].tier2++;
      }

      try {
        await t.fn();
        state.totalPassed++;
        state.tierCounts[tierKey].passed++;
        console.log(`  [PASS] [Tier ${t.tier}${t.featureId ? ' | ' + t.featureId : ''}] ${t.name}`);
      } catch (err) {
        state.totalFailed++;
        state.tierCounts[tierKey].failed++;
        console.error(`  [FAIL] [Tier ${t.tier}${t.featureId ? ' | ' + t.featureId : ''}] ${t.name}`);
        console.error(`         Error: ${err.message}`);
        if (err.stack) {
          const firstStackLine = err.stack.split('\n')[1];
          console.error(`         ${firstStackLine ? firstStackLine.trim() : ''}`);
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;

  console.log('\n=============================================================');
  console.log('                 TEST EXECUTION SUMMARY');
  console.log('=============================================================');
  console.log(`Total Duration: ${durationMs} ms`);
  console.log(`Total Tests Run: ${state.totalPassed + state.totalFailed}`);
  console.log(`Passed: ${state.totalPassed}`);
  console.log(`Failed: ${state.totalFailed}`);
  console.log('-------------------------------------------------------------');
  console.log(`Tier 1 (Feature Coverage):       ${state.tierCounts.tier1.passed} / ${state.tierCounts.tier1.total} passed (Target: ≥75)`);
  console.log(`Tier 2 (Boundary & Corner Cases):${state.tierCounts.tier2.passed} / ${state.tierCounts.tier2.total} passed (Target: ≥75)`);
  console.log(`Tier 3 (Cross-Feature Pairwise): ${state.tierCounts.tier3.passed} / ${state.tierCounts.tier3.total} passed (Target: ≥15)`);
  console.log(`Tier 4 (Real-World Scenarios):   ${state.tierCounts.tier4.passed} / ${state.tierCounts.tier4.total} passed (Target: ≥8)`);
  console.log('-------------------------------------------------------------');
  console.log('FEATURE COVERAGE MATRIX (F1 - F15):');
  for (let f = 1; f <= 15; f++) {
    const fKey = `F${f}`;
    const fData = state.featureCounts[fKey];
    console.log(`  - F${f.toString().padStart(2, '0')}: Tier 1 = ${fData.tier1}/5 tests | Tier 2 = ${fData.tier2}/5 tests | Total = ${fData.total} tests`);
  }
  console.log('=============================================================\n');

  if (state.totalFailed > 0) {
    process.exitCode = 1;
  }
}

// Load test suite modules
function loadSuites() {
  require('./tier1_features.test.js');
  require('./tier2_boundaries.test.js');
  require('./tier3_combinations.test.js');
  require('./tier4_scenarios.test.js');
}

if (require.main === module) {
  loadSuites();
  run().catch(err => {
    console.error('Fatal error running test runner:', err);
    process.exit(1);
  });
}
