const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const SELECT_DOG_JOIN = `
  SELECT 
    d.id,
    d.name,
    d.breed_id,
    d.age,
    d.weight,
    d.gender,
    d.photo_url,
    d.triggers,
    d.trigger_notes,
    d.comfort_distance,
    d.training_goals,
    d.created_at,
    d.updated_at,
    b.name AS breed_name,
    b.description AS breed_description,
    b.energy_level AS breed_energy_level,
    b.prey_drive AS breed_prey_drive,
    b.sensitivity AS breed_sensitivity,
    b.arousal_threshold AS breed_arousal_threshold,
    b.image_url AS breed_image_url
  FROM dogs d
  LEFT JOIN breeds b ON d.breed_id = b.id
`;

function formatDogRecord(row) {
  if (!row) return null;
  let triggers = [];
  let training_goals = [];
  try {
    triggers = typeof row.triggers === 'string' ? JSON.parse(row.triggers) : (Array.isArray(row.triggers) ? row.triggers : []);
  } catch (e) {
    triggers = [];
  }
  try {
    training_goals = typeof row.training_goals === 'string' ? JSON.parse(row.training_goals) : (Array.isArray(row.training_goals) ? row.training_goals : []);
  } catch (e) {
    training_goals = row.training_goals || [];
  }

  const breed = row.breed_id ? {
    id: row.breed_id,
    name: row.breed_name,
    description: row.breed_description,
    energy_level: row.breed_energy_level,
    prey_drive: row.breed_prey_drive,
    sensitivity: row.breed_sensitivity,
    arousal_threshold: row.breed_arousal_threshold,
    image_url: row.breed_image_url
  } : null;

  return {
    id: row.id,
    name: row.name,
    breed_id: row.breed_id,
    breed_name: row.breed_name,
    age: row.age,
    weight: row.weight,
    gender: row.gender,
    photo_url: row.photo_url,
    triggers,
    trigger_notes: row.trigger_notes,
    comfort_distance: row.comfort_distance,
    training_goals,
    created_at: row.created_at,
    updated_at: row.updated_at,
    breed
  };
}

function getDogById(id) {
  const row = db.prepare(`${SELECT_DOG_JOIN} WHERE d.id = ?`).get(id);
  return formatDogRecord(row);
}

// GET /api/dogs - List all dogs
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`${SELECT_DOG_JOIN} ORDER BY d.created_at DESC`).all();
    const dogs = rows.map(formatDogRecord);
    res.json(dogs);
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// GET /api/dogs/:id - Get single dog profile
router.get('/:id', (req, res) => {
  try {
    const dog = getDogById(req.params.id);
    if (!dog) {
      return res.status(404).json({ error: 'Dog profile not found' });
    }
    res.json(dog);
  } catch (err) {
    console.error('Error fetching dog by ID:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// POST /api/dogs - Create pet profile
router.post('/', (req, res) => {
  try {
    const { name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: "Field 'name' is required" });
    }

    if (breed_id !== undefined && breed_id !== null) {
      const breedExists = db.prepare('SELECT id FROM breeds WHERE id = ?').get(breed_id);
      if (!breedExists) {
        return res.status(400).json({ error: `Breed with id ${breed_id} does not exist` });
      }
    }

    const triggersJson = Array.isArray(triggers) ? JSON.stringify(triggers) : (typeof triggers === 'string' ? triggers : '[]');
    const goalsJson = Array.isArray(training_goals) ? JSON.stringify(training_goals) : (typeof training_goals === 'string' ? JSON.stringify([training_goals]) : '[]');

    const stmt = db.prepare(`
      INSERT INTO dogs (name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name.trim(),
      breed_id || 1,
      age !== undefined && age !== null ? parseInt(age, 10) : 0,
      weight !== undefined && weight !== null ? parseFloat(weight) : null,
      gender || null,
      photo_url || null,
      triggersJson,
      trigger_notes || null,
      comfort_distance !== undefined && comfort_distance !== null ? parseFloat(comfort_distance) : 10,
      goalsJson
    );

    const createdDog = getDogById(info.lastInsertRowid);
    res.status(201).json(createdDog);
  } catch (err) {
    console.error('Error creating dog profile:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// PUT /api/dogs/:id - Update pet profile
router.put('/:id', (req, res) => {
  try {
    const existingRow = db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
    if (!existingRow) {
      return res.status(404).json({ error: 'Dog profile not found' });
    }

    const { name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals } = req.body;

    if (breed_id !== undefined && breed_id !== null) {
      const breedExists = db.prepare('SELECT id FROM breeds WHERE id = ?').get(breed_id);
      if (!breedExists) {
        return res.status(400).json({ error: `Breed with id ${breed_id} does not exist` });
      }
    }

    const newTriggers = triggers !== undefined
      ? (Array.isArray(triggers) ? JSON.stringify(triggers) : String(triggers))
      : existingRow.triggers;

    const newGoals = training_goals !== undefined
      ? (Array.isArray(training_goals) ? JSON.stringify(training_goals) : String(training_goals))
      : existingRow.training_goals;

    db.prepare(`
      UPDATE dogs SET
        name = COALESCE(?, name),
        breed_id = COALESCE(?, breed_id),
        age = COALESCE(?, age),
        weight = COALESCE(?, weight),
        gender = COALESCE(?, gender),
        photo_url = COALESCE(?, photo_url),
        triggers = ?,
        trigger_notes = COALESCE(?, trigger_notes),
        comfort_distance = COALESCE(?, comfort_distance),
        training_goals = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      breed_id !== undefined ? breed_id : null,
      age !== undefined ? parseInt(age, 10) : null,
      weight !== undefined ? parseFloat(weight) : null,
      gender || null,
      photo_url || null,
      newTriggers,
      trigger_notes || null,
      comfort_distance !== undefined ? parseFloat(comfort_distance) : null,
      newGoals,
      req.params.id
    );

    const updatedDog = getDogById(req.params.id);
    res.json(updatedDog);
  } catch (err) {
    console.error('Error updating dog profile:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// DELETE /api/dogs/:id - Delete pet profile
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM dogs WHERE id = ?').run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Dog profile not found' });
    }
    res.json({ message: 'Dog profile deleted successfully', id: Number(req.params.id) });
  } catch (err) {
    console.error('Error deleting dog profile:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
