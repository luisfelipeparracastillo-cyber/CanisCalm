const schemaSql = `
CREATE TABLE IF NOT EXISTS breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  prey_drive INTEGER NOT NULL CHECK (prey_drive BETWEEN 1 AND 5),
  sensitivity INTEGER NOT NULL CHECK (sensitivity BETWEEN 1 AND 5),
  arousal_threshold INTEGER NOT NULL CHECK (arousal_threshold BETWEEN 1 AND 5),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  breed_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
  age INTEGER NOT NULL CHECK (age >= 0),
  weight REAL,
  gender TEXT,
  photo_url TEXT,
  triggers TEXT NOT NULL DEFAULT '[]',
  trigger_notes TEXT,
  comfort_distance REAL DEFAULT 10,
  training_goals TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS walks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
  duration_seconds INTEGER DEFAULT 0,
  distance_meters REAL DEFAULT 0,
  route_coordinates TEXT DEFAULT '[]',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reactivity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walk_id INTEGER NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
  dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (length(trigger_type) > 0),
  intensity_level INTEGER NOT NULL CHECK (intensity_level BETWEEN 1 AND 5),
  notes TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_breeds_energy ON breeds(energy_level);
CREATE INDEX IF NOT EXISTS idx_breeds_prey ON breeds(prey_drive);
CREATE INDEX IF NOT EXISTS idx_breeds_sensitivity ON breeds(sensitivity);
CREATE INDEX IF NOT EXISTS idx_breeds_arousal ON breeds(arousal_threshold);

CREATE INDEX IF NOT EXISTS idx_dogs_breed_id ON dogs(breed_id);

CREATE INDEX IF NOT EXISTS idx_walks_dog_id ON walks(dog_id);
CREATE INDEX IF NOT EXISTS idx_walks_status ON walks(status);

CREATE INDEX IF NOT EXISTS idx_reactivity_events_walk_id ON reactivity_events(walk_id);
CREATE INDEX IF NOT EXISTS idx_reactivity_events_trigger ON reactivity_events(trigger_type);
CREATE INDEX IF NOT EXISTS idx_reactivity_events_intensity ON reactivity_events(intensity_level);
`;

function initDb(databaseConnection) {
  const db = databaseConnection || require('./connection');
  db.exec(schemaSql);
  return db;
}

if (require.main === module) {
  const db = require('./connection');
  initDb(db);
  console.log('Database schema created successfully.');
}

module.exports = { initDb, schemaSql };
