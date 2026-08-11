const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/stats - Aggregated analytics dashboard metrics
router.get('/', (req, res) => {
  try {
    const dog_id = req.query.dog_id ? parseInt(req.query.dog_id, 10) : null;
    const whereWalks = dog_id ? 'WHERE dog_id = ?' : '';
    const whereEvents = dog_id ? 'WHERE dog_id = ?' : '';
    const paramsWalks = dog_id ? [dog_id] : [];
    const paramsEvents = dog_id ? [dog_id] : [];

    // 1. Total Walks
    const totalWalksRow = db.prepare(`SELECT COUNT(*) AS count FROM walks ${whereWalks}`).get(...paramsWalks);
    const total_walks = totalWalksRow ? totalWalksRow.count : 0;

    // 2. Total Events
    const totalEventsRow = db.prepare(`SELECT COUNT(*) AS count FROM reactivity_events ${whereEvents}`).get(...paramsEvents);
    const total_events = totalEventsRow ? totalEventsRow.count : 0;

    // 3. Trigger Counts
    const trigger_counts = {
      "Dog off leash": 0,
      "Bike/Skateboard": 0,
      "Person/Child": 0,
      "Loud Noise": 0,
      "Vehicle": 0,
      "Perro sin correa": 0,
      "Bici/Patineta": 0,
      "Persona/Niño": 0,
      "Ruido Fuerte": 0,
      "Vehículo": 0
    };

    const triggerRows = db.prepare(`
      SELECT trigger_type, COUNT(*) AS count 
      FROM reactivity_events 
      ${whereEvents}
      GROUP BY trigger_type
    `).all(...paramsEvents);

    triggerRows.forEach(row => {
      trigger_counts[row.trigger_type] = row.count;
    });

    // 4. Intensity Distribution (1 to 5)
    const intensity_distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    const intensityRows = db.prepare(`
      SELECT intensity_level, COUNT(*) AS count 
      FROM reactivity_events 
      ${whereEvents}
      GROUP BY intensity_level
    `).all(...paramsEvents);

    intensityRows.forEach(row => {
      if (row.intensity_level >= 1 && row.intensity_level <= 5) {
        intensity_distribution[String(row.intensity_level)] = row.count;
      }
    });

    // 5. Heatmap Points
    const events = db.prepare(`
      SELECT id, walk_id, dog_id, latitude, longitude, intensity_level, trigger_type, notes, timestamp
      FROM reactivity_events
      ${whereEvents}
      ORDER BY timestamp DESC
    `).all(...paramsEvents);

    const heatmap_points = events.map(e => ({
      id: e.id,
      walk_id: e.walk_id,
      dog_id: e.dog_id,
      latitude: e.latitude,
      longitude: e.longitude,
      lat: e.latitude,
      lng: e.longitude,
      intensity: e.intensity_level,
      intensity_level: e.intensity_level,
      trigger_type: e.trigger_type,
      notes: e.notes,
      timestamp: e.timestamp
    }));

    // 6. Walk History
    const historySql = `
      SELECT 
        w.id,
        w.dog_id,
        d.name AS dog_name,
        w.start_time,
        w.end_time,
        w.status,
        w.duration_seconds,
        w.distance_meters,
        w.route_coordinates,
        w.notes,
        COUNT(e.id) AS event_count,
        COALESCE(MAX(e.intensity_level), 0) AS max_intensity
      FROM walks w
      LEFT JOIN dogs d ON w.dog_id = d.id
      LEFT JOIN reactivity_events e ON w.id = e.walk_id
      ${dog_id ? 'WHERE w.dog_id = ?' : ''}
      GROUP BY w.id
      ORDER BY w.start_time DESC
      LIMIT 20
    `;

    const historyRows = db.prepare(historySql).all(...paramsWalks);

    const walk_history = historyRows.map(row => {
      let route = [];
      try {
        route = row.route_coordinates ? JSON.parse(row.route_coordinates) : [];
      } catch (err) {
        route = [];
      }

      return {
        id: row.id,
        dog_id: row.dog_id,
        dog_name: row.dog_name || 'Desconocido',
        start_time: row.start_time,
        end_time: row.end_time,
        status: row.status,
        duration_seconds: row.duration_seconds || 0,
        distance_meters: row.distance_meters || 0,
        route_coordinates: route,
        notes: row.notes,
        event_count: row.event_count || 0,
        max_intensity: row.max_intensity || 0
      };
    });

    res.json({
      total_walks,
      total_events,
      trigger_counts,
      intensity_distribution,
      heatmap_points,
      walk_history
    });
  } catch (err) {
    console.error('Error calculating analytics stats:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
