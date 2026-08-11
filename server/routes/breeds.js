const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/breeds - List & multi-criteria filter breeds
router.get('/', (req, res) => {
  try {
    const {
      energy, energy_level,
      prey, prey_drive,
      sensitivity,
      arousal, arousal_threshold, excitement_threshold,
      search
    } = req.query;

    let sql = 'SELECT * FROM breeds WHERE 1=1';
    const params = [];

    const energyVal = energy || energy_level;
    if (energyVal !== undefined && energyVal !== '') {
      const val = parseInt(energyVal, 10);
      if (isNaN(val) || val < 1 || val > 5) {
        return res.status(400).json({ error: 'energy must be an integer between 1 and 5' });
      }
      sql += ' AND energy_level <= ?';
      params.push(val);
    }

    const preyVal = prey || prey_drive;
    if (preyVal !== undefined && preyVal !== '') {
      const val = parseInt(preyVal, 10);
      if (isNaN(val) || val < 1 || val > 5) {
        return res.status(400).json({ error: 'prey must be an integer between 1 and 5' });
      }
      sql += ' AND prey_drive <= ?';
      params.push(val);
    }

    if (sensitivity !== undefined && sensitivity !== '') {
      const val = parseInt(sensitivity, 10);
      if (isNaN(val) || val < 1 || val > 5) {
        return res.status(400).json({ error: 'sensitivity must be an integer between 1 and 5' });
      }
      sql += ' AND sensitivity <= ?';
      params.push(val);
    }

    const arousalVal = arousal || arousal_threshold || excitement_threshold;
    if (arousalVal !== undefined && arousalVal !== '') {
      const val = parseInt(arousalVal, 10);
      if (isNaN(val) || val < 1 || val > 5) {
        return res.status(400).json({ error: 'arousal must be an integer between 1 and 5' });
      }
      sql += ' AND arousal_threshold <= ?';
      params.push(val);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY name ASC';

    const breeds = db.prepare(sql).all(...params);
    res.json(breeds);
  } catch (err) {
    console.error('Error fetching breeds:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// GET /api/breeds/:id - Get single breed by ID
router.get('/:id', (req, res) => {
  try {
    const breed = db.prepare('SELECT * FROM breeds WHERE id = ?').get(req.params.id);
    if (!breed) {
      return res.status(404).json({ error: 'Breed not found' });
    }
    res.json(breed);
  } catch (err) {
    console.error('Error fetching breed by ID:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
