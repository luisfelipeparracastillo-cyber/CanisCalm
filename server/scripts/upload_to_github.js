const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];
const OWNER = 'luisfelipeparracastillo-cyber';
const REPO = 'CanisCalm';

if (!GITHUB_TOKEN) {
  console.error('ERROR: GitHub Token is required. Usage: node server/scripts/upload_to_github.js <YOUR_GITHUB_TOKEN>');
  process.exit(1);
}

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.gemini',
  'coverage',
  '.vscode',
  '.idea'
]);

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (IGNORE_DIRS.has(file)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function uploadFile(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const fileContent = fs.readFileSync(filePath);
  const contentBase64 = fileContent.toString('base64');

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${relativePath}`;

  try {
    // Check if file already exists to get SHA
    let sha = null;
    const getRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'CanisCalm-Uploader',
        'Accept': 'application/vnd.github+json'
      }
    });

    if (getRes.ok) {
      const existingData = await getRes.json();
      sha = existingData.sha;
    }

    const body = {
      message: `Add ${relativePath} via CanisCalm Uploader`,
      content: contentBase64,
      ...(sha ? { sha } : {})
    };

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'CanisCalm-Uploader',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok || putRes.status === 201) {
      console.log(`[OK] Uploaded: ${relativePath}`);
    } else {
      const errJson = await putRes.json().catch(() => ({}));
      console.error(`[FAIL] ${relativePath}: ${putRes.status} ${errJson.message || ''}`);
    }
  } catch (err) {
    console.error(`[ERROR] ${relativePath}:`, err.message);
  }
}

async function main() {
  const rootDir = path.join(__dirname, '..', '..');
  console.log(`Scanning project files in: ${rootDir}`);
  const allFiles = getAllFiles(rootDir);
  console.log(`Found ${allFiles.length} files to upload to GitHub repo ${OWNER}/${REPO}...`);

  for (const file of allFiles) {
    await uploadFile(file, rootDir);
  }

  console.log('\n===========================================');
  console.log(`SUCCESS: Repository updated at https://github.com/${OWNER}/${REPO}`);
  console.log('===========================================');
}

main();
