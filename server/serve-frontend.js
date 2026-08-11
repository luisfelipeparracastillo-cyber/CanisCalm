const express = require('express');
const path = require('path');

const app = express();
const PORT = 5173;

const distPath = path.join(__dirname, '..', 'dist');

// Serve static assets from dist
app.use(express.static(distPath));

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CanisCalm Production Frontend running stably on http://localhost:${PORT}`);
});
