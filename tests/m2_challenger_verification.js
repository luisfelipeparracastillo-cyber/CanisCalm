const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   CHALLENGER 2: EMPIRICAL VERIFICATION (MILESTONE 2)');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(` [PASS] ${message}`);
    passCount++;
  } else {
    console.error(` [FAIL] ${message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. VERIFY EXACT HEX CODES & TYPOGRAPHY
// ----------------------------------------------------
console.log('\n--- 1. Palette & Typography Checks ---');

const tailwindPath = path.join(__dirname, '../tailwind.config.js');
const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');

assert(tailwindContent.includes('#4E6E58'), 'Sage 500 hex #4E6E58 is defined in tailwind.config.js');
assert(tailwindContent.includes('#D97757'), 'Terracotta 500 hex #D97757 is defined in tailwind.config.js');
assert(tailwindContent.includes('#FAF8F5'), 'Warm Cream hex #FAF8F5 is defined in tailwind.config.js');
assert(tailwindContent.includes('#FFFFFF'), 'Surface Card hex #FFFFFF is defined in tailwind.config.js');

// Check RGB representation in soft shadows
assert(tailwindContent.includes('rgba(78, 110, 88'), 'Shadows use RGB (78, 110, 88) corresponding to Sage #4E6E58');

const indexCssPath = path.join(__dirname, '../src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

assert(indexCssContent.includes('#FAF8F5'), 'Warm Cream #FAF8F5 applied to body background in src/index.css');
assert(indexCssContent.includes('Plus Jakarta Sans') && indexCssContent.includes('Inter'), 'Typography font-family includes Plus Jakarta Sans and Inter in src/index.css');

const indexHtmlPath = path.join(__dirname, '../index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

assert(indexHtmlContent.includes('Plus+Jakarta+Sans') && indexHtmlContent.includes('Inter'), 'Google Fonts for Plus Jakarta Sans & Inter loaded in index.html');
assert(indexHtmlContent.includes('%234E6E58'), 'Favicon SVG uses hex #4E6E58 in index.html');

// ----------------------------------------------------
// 2. MICRO-ANIMATIONS VERIFICATION
// ----------------------------------------------------
console.log('\n--- 2. Micro-Animations Checks ---');

assert(tailwindContent.includes('fade-in') && tailwindContent.includes('fadeIn'), 'fade-in animation & keyframes defined in tailwind.config.js');
assert(tailwindContent.includes('slide-up') && tailwindContent.includes('slideUp'), 'slide-up animation & keyframes defined in tailwind.config.js');
assert(tailwindContent.includes('pulse-soft') && tailwindContent.includes('pulseSoft'), 'pulse-soft animation & keyframes defined in tailwind.config.js');

const appPath = path.join(__dirname, '../src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(appContent.includes('animate-fade-in'), 'animate-fade-in utilized in App.jsx');

const headerPath = path.join(__dirname, '../src/components/layout/Header.jsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');
assert(headerContent.includes('animate-slide-up'), 'animate-slide-up utilized in Header.jsx dropdown menu');

const modalPath = path.join(__dirname, '../src/components/common/Modal.jsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('animate-fade-in') && modalContent.includes('animate-slide-up'), 'animate-fade-in and animate-slide-up utilized in Modal.jsx');

const liveWalkPath = path.join(__dirname, '../src/components/live_walk/LiveWalkView.jsx');
const liveWalkContent = fs.readFileSync(liveWalkPath, 'utf8');
assert(liveWalkContent.includes('animate-pulse-soft'), 'animate-pulse-soft utilized in LiveWalkView.jsx');

// ----------------------------------------------------
// 3. 5-TAB VIEW ROUTING VERIFICATION
// ----------------------------------------------------
console.log('\n--- 3. 5-Tab View Routing Checks ---');

const navPath = path.join(__dirname, '../src/components/layout/Navigation.jsx');
const navContent = fs.readFileSync(navPath, 'utf8');

const requiredTabs = ['live_walk', 'breeds', 'profiles', 'training', 'analytics'];
requiredTabs.forEach((tab) => {
  assert(navContent.includes(`id: '${tab}'`), `Navigation.jsx defines tab '${tab}'`);
  assert(appContent.includes(`case '${tab}':`), `App.jsx handles route case '${tab}'`);
});

assert(appContent.includes('<LiveWalkView />'), 'App.jsx imports and renders LiveWalkView');
assert(appContent.includes('<BreedEncyclopedia />'), 'App.jsx imports and renders BreedEncyclopedia');
assert(appContent.includes('<DogProfilesView />'), 'App.jsx imports and renders DogProfilesView');
assert(appContent.includes('<TrainingGuidesView />'), 'App.jsx imports and renders TrainingGuidesView');
assert(appContent.includes('<AnalyticsDashboard />'), 'App.jsx imports and renders AnalyticsDashboard');

// ----------------------------------------------------
// 4. ACTIVE PET PROFILE SELECTION & REACTIVE STATE UPDATES
// ----------------------------------------------------
console.log('\n--- 4. Active Pet Profile Selection & Reactivity Checks ---');

const appContextPath = path.join(__dirname, '../src/context/AppContext.jsx');
const appContextContent = fs.readFileSync(appContextPath, 'utf8');

assert(appContextContent.includes('const [activeDog, setActiveDog] = useState'), 'AppContext manages activeDog state');
assert(appContextContent.includes('setActiveDog((prev) =>'), 'AppContext auto-selects initial active dog');
assert(appContextContent.includes('useEffect(() => {\n    if (activeDog) {\n      loadStats(activeDog.id);'), 'AppContext reactively re-fetches stats when activeDog changes');

assert(headerContent.includes('activeDog ? activeDog.name'), 'Header displays active dog name reactively');
assert(headerContent.includes('setActiveDog(dog)'), 'Header pet dropdown allows selecting active dog');

const profilesPath = path.join(__dirname, '../src/components/profiles/DogProfilesView.jsx');
const profilesContent = fs.readFileSync(profilesPath, 'utf8');

assert(profilesContent.includes('isSelected ? \'border-sage-500 ring-2 ring-sage-200\''), 'DogProfilesView visually highlights selected active dog card');
assert(profilesContent.includes('setActiveDog(dog)'), 'DogProfilesView allows selecting active dog');

const analyticsPath = path.join(__dirname, '../src/components/analytics/AnalyticsDashboard.jsx');
const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
assert(analyticsContent.includes('activeDog.name'), 'AnalyticsDashboard reactively displays active dog name in header');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL EMPIRICAL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}
