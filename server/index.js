const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/connection');
const { initDb } = require('./db/schema');
const { seedDb } = require('./db/seed');

const breedsRouter = require('./routes/breeds');
const dogsRouter = require('./routes/dogs');
const walksRouter = require('./routes/walks');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize & Seed DB
try {
  initDb(db);
  seedDb(db);
} catch (err) {
  console.error('Failed to initialize SQLite Database:', err);
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CanisCalm Backend API'
  });
});

// Register REST API Routes
app.use('/api/breeds', breedsRouter);
app.use('/api/dogs', dogsRouter);
app.use('/api/walks', walksRouter);
app.use('/api/stats', statsRouter);

// Serve static assets if public folder exists
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Global 404 Handler for /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start listening if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CanisCalm Backend API server running on port ${PORT}`);
  });
}

module.exports = app;
