const express = require('express');
const router = express.Router();
const db = require('../db/connection');

function formatWalkRecord(walkRow, eventsRows) {
  if (!walkRow) return null;
  let route_coordinates = [];
  try {
    route_coordinates = typeof walkRow.route_coordinates === 'string'
      ? JSON.parse(walkRow.route_coordinates)
      : (Array.isArray(walkRow.route_coordinates) ? walkRow.route_coordinates : []);
  } catch (e) {
    route_coordinates = [];
  }

  const events = (eventsRows || []).map(e => ({
    id: e.id,
    walk_id: e.walk_id,
    dog_id: e.dog_id,
    trigger_type: e.trigger_type,
    intensity_level: e.intensity_level,
    intensity: e.intensity_level,
    notes: e.notes,
    latitude: e.latitude,
    longitude: e.longitude,
    lat: e.latitude,
    lng: e.longitude,
    timestamp: e.timestamp,
    created_at: e.created_at
  }));

  return {
    id: walkRow.id,
    dog_id: walkRow.dog_id,
    dog_name: walkRow.dog_name || null,
    start_time: walkRow.start_time,
    end_time: walkRow.end_time,
    status: walkRow.status,
    duration_seconds: walkRow.duration_seconds || 0,
    distance_meters: walkRow.distance_meters || 0,
    route_coordinates,
    notes: walkRow.notes,
    created_at: walkRow.created_at,
    events
  };
}

// GET /api/walks - Get all walk records with events
router.get('/', (req, res) => {
  try {
    const walks = db.prepare(`
      SELECT w.*, d.name AS dog_name 
      FROM walks w 
      LEFT JOIN dogs d ON w.dog_id = d.id 
      ORDER BY w.start_time DESC
    `).all();

    const events = db.prepare(`SELECT * FROM reactivity_events ORDER BY timestamp ASC`).all();

    const walkList = walks.map(w => {
      const walkEvents = events.filter(e => e.walk_id === w.id);
      return formatWalkRecord(w, walkEvents);
    });

    res.json(walkList);
  } catch (err) {
    console.error('Error fetching walks:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// GET /api/walks/:id - Get single walk record with events
router.get('/:id', (req, res) => {
  try {
    const walk = db.prepare(`
      SELECT w.*, d.name AS dog_name 
      FROM walks w 
      LEFT JOIN dogs d ON w.dog_id = d.id 
      WHERE w.id = ?
    `).get(req.params.id);

    if (!walk) {
      return res.status(404).json({ error: 'Walk session not found' });
    }

    const events = db.prepare('SELECT * FROM reactivity_events WHERE walk_id = ? ORDER BY timestamp ASC').all(req.params.id);
    res.json(formatWalkRecord(walk, events));
  } catch (err) {
    console.error('Error fetching walk by ID:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// POST /api/walks - Start new active walk session
router.post('/', (req, res) => {
  try {
    const { dog_id, start_time } = req.body;

    let targetDogId = dog_id;
    if (!targetDogId) {
      const firstDog = db.prepare('SELECT id FROM dogs ORDER BY id ASC LIMIT 1').get();
      if (firstDog) {
        targetDogId = firstDog.id;
      } else {
        return res.status(400).json({ error: 'dog_id is required or a dog profile must exist' });
      }
    } else {
      const dogExists = db.prepare('SELECT id FROM dogs WHERE id = ?').get(targetDogId);
      if (!dogExists) {
        return res.status(400).json({ error: `Dog with id ${targetDogId} does not exist` });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO walks (dog_id, start_time, status, route_coordinates, duration_seconds, distance_meters)
      VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), 'active', '[]', 0, 0)
    `);

    const info = stmt.run(targetDogId, start_time || null);

    const createdWalk = db.prepare(`
      SELECT w.*, d.name AS dog_name 
      FROM walks w 
      LEFT JOIN dogs d ON w.dog_id = d.id 
      WHERE w.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(formatWalkRecord(createdWalk, []));
  } catch (err) {
    console.error('Error starting walk session:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// PUT /api/walks/:id/finish - Conclude active walk session
router.put('/:id/finish', (req, res) => {
  try {
    const walk = db.prepare('SELECT * FROM walks WHERE id = ?').get(req.params.id);
    if (!walk) {
      return res.status(404).json({ error: 'Walk session not found' });
    }

    const { end_time, duration_seconds, distance_meters, route_coordinates, notes } = req.body;

    const routeJson = Array.isArray(route_coordinates)
      ? JSON.stringify(route_coordinates)
      : (typeof route_coordinates === 'string' ? route_coordinates : walk.route_coordinates);

    db.prepare(`
      UPDATE walks SET
        end_time = COALESCE(?, CURRENT_TIMESTAMP),
        duration_seconds = COALESCE(?, duration_seconds),
        distance_meters = COALESCE(?, distance_meters),
        route_coordinates = ?,
        notes = COALESCE(?, notes),
        status = 'completed'
      WHERE id = ?
    `).run(
      end_time || null,
      duration_seconds !== undefined && duration_seconds !== null ? parseInt(duration_seconds, 10) : null,
      distance_meters !== undefined && distance_meters !== null ? parseFloat(distance_meters) : null,
      routeJson,
      notes || null,
      req.params.id
    );

    const updatedWalk = db.prepare(`
      SELECT w.*, d.name AS dog_name 
      FROM walks w 
      LEFT JOIN dogs d ON w.dog_id = d.id 
      WHERE w.id = ?
    `).get(req.params.id);

    const events = db.prepare('SELECT * FROM reactivity_events WHERE walk_id = ? ORDER BY timestamp ASC').all(req.params.id);

    res.json(formatWalkRecord(updatedWalk, events));
  } catch (err) {
    console.error('Error finishing walk session:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// POST /api/walks/:id/events - Log 1-tap reactivity event
router.post('/:id/events', (req, res) => {
  try {
    const walk = db.prepare('SELECT * FROM walks WHERE id = ?').get(req.params.id);
    if (!walk) {
      return res.status(404).json({ error: 'Walk session not found' });
    }

    const { trigger_type, intensity_level, intensity, notes, latitude, lat, longitude, lng, timestamp } = req.body;

    if (!trigger_type || typeof trigger_type !== 'string' || trigger_type.trim() === '') {
      return res.status(400).json({ error: 'Field trigger_type is required' });
    }

    const rawIntensity = intensity_level !== undefined ? intensity_level : intensity;
    const intensityVal = parseInt(rawIntensity, 10);
    if (isNaN(intensityVal) || intensityVal < 1 || intensityVal > 5) {
      return res.status(400).json({ error: 'intensity must be an integer between 1 and 5' });
    }

    const rawLat = latitude !== undefined ? latitude : lat;
    const rawLng = longitude !== undefined ? longitude : lng;

    const latVal = parseFloat(rawLat);
    const lngVal = parseFloat(rawLng);

    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      return res.status(400).json({ error: 'latitude must be a valid float between -90 and 90' });
    }

    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      return res.status(400).json({ error: 'longitude must be a valid float between -180 and 180' });
    }

    const stmt = db.prepare(`
      INSERT INTO reactivity_events (walk_id, dog_id, timestamp, trigger_type, intensity_level, latitude, longitude, notes)
      VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      req.params.id,
      walk.dog_id || null,
      timestamp || null,
      trigger_type.trim(),
      intensityVal,
      latVal,
      lngVal,
      notes || null
    );

    const createdEvent = db.prepare('SELECT * FROM reactivity_events WHERE id = ?').get(info.lastInsertRowid);

    res.status(201).json({
      id: createdEvent.id,
      walk_id: createdEvent.walk_id,
      dog_id: createdEvent.dog_id,
      trigger_type: createdEvent.trigger_type,
      intensity_level: createdEvent.intensity_level,
      intensity: createdEvent.intensity_level,
      notes: createdEvent.notes,
      latitude: createdEvent.latitude,
      longitude: createdEvent.longitude,
      lat: createdEvent.latitude,
      lng: createdEvent.longitude,
      timestamp: createdEvent.timestamp,
      created_at: createdEvent.created_at
    });
  } catch (err) {
    console.error('Error logging reactivity event:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
