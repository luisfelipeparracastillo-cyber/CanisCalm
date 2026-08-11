const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

console.log('=== CanisCalm Frontend Verification Script ===\n');

let errorCount = 0;

function checkFile(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  [OK] File exists: ${relPath}`);
  } else {
    console.error(`  [FAIL] Missing required file: ${relPath}`);
    errorCount++;
  }
}

// 1. Verify file structure
console.log('1. Checking required frontend file layout...');
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'index.html',
  'src/index.css',
  'src/main.jsx',
  'src/App.jsx',
  'src/context/AppContext.jsx',
  'src/services/api.js',
  'src/components/common/Card.jsx',
  'src/components/common/Button.jsx',
  'src/components/common/Badge.jsx',
  'src/components/common/Modal.jsx',
  'src/components/common/Tabs.jsx',
  'src/components/layout/Header.jsx',
  'src/components/layout/Navigation.jsx',
];

requiredFiles.forEach(checkFile);

// 2. Run Vite build
console.log('\n2. Executing Vite compilation build (npm run build)...');
try {
  const buildOutput = execSync('npx vite build', { cwd: rootDir, encoding: 'utf-8' });
  console.log(buildOutput);
  console.log('  [OK] Vite build completed successfully without errors.');
} catch (err) {
  console.error('  [FAIL] Vite build failed:');
  console.error(err.stdout || err.message);
  errorCount++;
}

// 3. Verify dist/ bundle directory
console.log('\n3. Verifying output dist/ directory bundle artifacts...');
const distDir = path.join(rootDir, 'dist');
const distHtml = path.join(distDir, 'index.html');
const distAssets = path.join(distDir, 'assets');

if (!fs.existsSync(distDir)) {
  console.error('  [FAIL] Output directory dist/ does not exist!');
  errorCount++;
} else {
  console.log('  [OK] Output directory dist/ exists.');
}

if (!fs.existsSync(distHtml)) {
  console.error('  [FAIL] Output dist/index.html is missing!');
  errorCount++;
} else {
  const htmlStats = fs.statSync(distHtml);
  console.log(`  [OK] dist/index.html present (${htmlStats.size} bytes).`);
}

if (!fs.existsSync(distAssets)) {
  console.error('  [FAIL] Output dist/assets directory is missing!');
  errorCount++;
} else {
  const assetFiles = fs.readdirSync(distAssets);
  console.log(`  [OK] dist/assets contains ${assetFiles.length} bundled asset file(s):`);
  assetFiles.forEach((file) => console.log(`      - ${file}`));
}

// Final Summary
console.log('\n=============================================');
if (errorCount === 0) {
  console.log('SUCCESS: All frontend foundation & UI theme verification checks passed!');
  process.exit(0);
} else {
  console.error(`FAILED: ${errorCount} verification check(s) failed.`);
  process.exit(1);
}
