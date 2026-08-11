const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jsonPath = path.join(dataDir, 'caniscalm.json');

class PureJsDatabase {
  constructor() {
    this.data = {
      breeds: [],
      dogs: [],
      walks: [],
      reactivity_events: [],
      auto_increment: {
        breeds: 1,
        dogs: 1,
        walks: 1,
        reactivity_events: 1
      }
    };
    this.load();
  }

  load() {
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          breeds: parsed.breeds || [],
          dogs: parsed.dogs || [],
          walks: parsed.walks || [],
          reactivity_events: parsed.reactivity_events || [],
          auto_increment: parsed.auto_increment || {
            breeds: (parsed.breeds || []).reduce((max, item) => Math.max(max, item.id || 0), 0) + 1,
            dogs: (parsed.dogs || []).reduce((max, item) => Math.max(max, item.id || 0), 0) + 1,
            walks: (parsed.walks || []).reduce((max, item) => Math.max(max, item.id || 0), 0) + 1,
            reactivity_events: (parsed.reactivity_events || []).reduce((max, item) => Math.max(max, item.id || 0), 0) + 1
          }
        };
      } catch (err) {
        console.error('Error loading JSON DB:', err);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving JSON DB:', err);
    }
  }

  pragma(str) {
    // No-op for compatibility
    return [];
  }

  exec(sql) {
    // Schema creation/DDL execution stub
    return this;
  }

  transaction(fn) {
    return (...args) => {
      const result = fn(...args);
      this.save();
      return result;
    };
  }

  prepare(sql) {
    const db = this;

    return {
      run(...args) {
        const res = db._executeRun(sql, args);
        db.save();
        return res;
      },
      get(...args) {
        return db._executeGet(sql, args);
      },
      all(...args) {
        return db._executeAll(sql, args);
      }
    };
  }

  _executeRun(sql, args) {
    const normSql = sql.replace(/\s+/g, ' ').trim();

    // 1. INSERT INTO breeds
    if (normSql.includes('INSERT INTO breeds')) {
      const param = args[0] || {};
      const id = this.data.auto_increment.breeds++;
      const newBreed = {
        id,
        name: param.name,
        description: param.description,
        energy_level: param.energy_level,
        prey_drive: param.prey_drive,
        sensitivity: param.sensitivity,
        arousal_threshold: param.arousal_threshold,
        image_url: param.image_url,
        created_at: new Date().toISOString()
      };
      this.data.breeds.push(newBreed);
      return { lastInsertRowid: id, changes: 1 };
    }

    // 2. INSERT INTO dogs
    if (normSql.includes('INSERT INTO dogs')) {
      const id = this.data.auto_increment.dogs++;
      const now = new Date().toISOString();
      const [name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals] = args;
      const newDog = {
        id,
        name,
        breed_id: breed_id || 1,
        age: age !== undefined ? age : 0,
        weight: weight !== undefined ? weight : null,
        gender: gender || null,
        photo_url: photo_url || null,
        triggers: triggers || '[]',
        trigger_notes: trigger_notes || null,
        comfort_distance: comfort_distance !== undefined ? comfort_distance : 10,
        training_goals: training_goals || '[]',
        created_at: now,
        updated_at: now
      };
      this.data.dogs.push(newDog);
      return { lastInsertRowid: id, changes: 1 };
    }

    // 3. UPDATE dogs SET
    if (normSql.includes('UPDATE dogs SET')) {
      const id = Number(args[args.length - 1]);
      const dog = this.data.dogs.find(d => d.id === id);
      if (!dog) return { lastInsertRowid: 0, changes: 0 };

      const [name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals] = args;
      if (name !== null && name !== undefined) dog.name = name;
      if (breed_id !== null && breed_id !== undefined) dog.breed_id = breed_id;
      if (age !== null && age !== undefined) dog.age = age;
      if (weight !== null && weight !== undefined) dog.weight = weight;
      if (gender !== null && gender !== undefined) dog.gender = gender;
      if (photo_url !== null && photo_url !== undefined) dog.photo_url = photo_url;
      if (triggers !== null && triggers !== undefined) dog.triggers = triggers;
      if (trigger_notes !== null && trigger_notes !== undefined) dog.trigger_notes = trigger_notes;
      if (comfort_distance !== null && comfort_distance !== undefined) dog.comfort_distance = comfort_distance;
      if (training_goals !== null && training_goals !== undefined) dog.training_goals = training_goals;
      dog.updated_at = new Date().toISOString();

      return { lastInsertRowid: id, changes: 1 };
    }

    // 4. DELETE FROM dogs
    if (normSql.includes('DELETE FROM dogs')) {
      const id = Number(args[0]);
      const idx = this.data.dogs.findIndex(d => d.id === id);
      if (idx !== -1) {
        this.data.dogs.splice(idx, 1);
        // Cascade delete walks & events for this dog
        const deletedWalkIds = this.data.walks.filter(w => w.dog_id === id).map(w => w.id);
        this.data.walks = this.data.walks.filter(w => w.dog_id !== id);
        this.data.reactivity_events = this.data.reactivity_events.filter(e => e.dog_id !== id && !deletedWalkIds.includes(e.walk_id));
        return { lastInsertRowid: 0, changes: 1 };
      }
      return { lastInsertRowid: 0, changes: 0 };
    }

    // 5. INSERT INTO walks
    if (normSql.includes('INSERT INTO walks')) {
      const id = this.data.auto_increment.walks++;
      const now = new Date().toISOString();

      if (args.length === 2) {
        // Start walk endpoint: (targetDogId, start_time)
        const [dog_id, start_time] = args;
        const newWalk = {
          id,
          dog_id,
          start_time: start_time || now,
          end_time: null,
          status: 'active',
          duration_seconds: 0,
          distance_meters: 0,
          route_coordinates: '[]',
          notes: null,
          created_at: now
        };
        this.data.walks.push(newWalk);
        return { lastInsertRowid: id, changes: 1 };
      } else {
        // Seed walk: (dogId, route_coordinates, notes)
        const [dog_id, route_coordinates, notes] = args;
        const newWalk = {
          id,
          dog_id,
          start_time: '2026-08-06T10:00:00Z',
          end_time: '2026-08-06T10:30:00Z',
          status: 'completed',
          duration_seconds: 1800,
          distance_meters: 1500.5,
          route_coordinates: route_coordinates || '[]',
          notes: notes || null,
          created_at: now
        };
        this.data.walks.push(newWalk);
        return { lastInsertRowid: id, changes: 1 };
      }
    }

    // 6. UPDATE walks SET
    if (normSql.includes('UPDATE walks SET')) {
      const id = Number(args[args.length - 1]);
      const walk = this.data.walks.find(w => w.id === id);
      if (!walk) return { lastInsertRowid: 0, changes: 0 };

      const [end_time, duration_seconds, distance_meters, route_coordinates, notes] = args;
      if (end_time) walk.end_time = end_time;
      else if (!walk.end_time) walk.end_time = new Date().toISOString();
      if (duration_seconds !== null && duration_seconds !== undefined) walk.duration_seconds = duration_seconds;
      if (distance_meters !== null && distance_meters !== undefined) walk.distance_meters = distance_meters;
      if (route_coordinates !== null && route_coordinates !== undefined) walk.route_coordinates = route_coordinates;
      if (notes !== null && notes !== undefined) walk.notes = notes;
      walk.status = 'completed';

      return { lastInsertRowid: id, changes: 1 };
    }

    // 7. INSERT INTO reactivity_events
    if (normSql.includes('INSERT INTO reactivity_events')) {
      const id = this.data.auto_increment.reactivity_events++;
      const now = new Date().toISOString();
      const [walk_id, dog_id, timestamp, trigger_type, intensity_level, latitude, longitude, notes] = args;

      const newEvent = {
        id,
        walk_id: Number(walk_id),
        dog_id: dog_id ? Number(dog_id) : null,
        trigger_type,
        intensity_level: Number(intensity_level),
        notes: notes || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timestamp: timestamp || now,
        created_at: now
      };
      this.data.reactivity_events.push(newEvent);
      return { lastInsertRowid: id, changes: 1 };
    }

    return { lastInsertRowid: 0, changes: 0 };
  }

  _executeGet(sql, args) {
    const results = this._executeAll(sql, args);
    return results.length > 0 ? results[0] : undefined;
  }

  _executeAll(sql, args = []) {
    const normSql = sql.replace(/\s+/g, ' ').trim();

    // COUNT queries
    if (normSql.includes('SELECT COUNT(*)')) {
      if (normSql.includes('FROM breeds')) {
        return [{ count: this.data.breeds.length }];
      }
      if (normSql.includes('FROM dogs')) {
        return [{ count: this.data.dogs.length }];
      }
      if (normSql.includes('FROM walks')) {
        let list = this.data.walks;
        if (args.length > 0) {
          list = list.filter(w => w.dog_id === Number(args[0]));
        }
        return [{ count: list.length }];
      }
      if (normSql.includes('FROM reactivity_events')) {
        let list = this.data.reactivity_events;
        if (args.length > 0) {
          list = list.filter(e => e.dog_id === Number(args[0]));
        }
        return [{ count: list.length }];
      }
    }

    // 1. SELECT FROM breeds
    if (normSql.includes('FROM breeds')) {
      if (normSql.includes('WHERE id =')) {
        const id = Number(args[0]);
        return this.data.breeds.filter(b => b.id === id);
      }
      if (normSql.includes("WHERE name = 'Pastor Alemán'")) {
        return this.data.breeds.filter(b => b.name === 'Pastor Alemán');
      }

      let breeds = [...this.data.breeds];

      // Parse filter parameters from sql & args
      let argIdx = 0;
      if (normSql.includes('energy_level <= ?')) {
        const val = Number(args[argIdx++]);
        breeds = breeds.filter(b => b.energy_level <= val);
      }
      if (normSql.includes('prey_drive <= ?')) {
        const val = Number(args[argIdx++]);
        breeds = breeds.filter(b => b.prey_drive <= val);
      }
      if (normSql.includes('sensitivity <= ?')) {
        const val = Number(args[argIdx++]);
        breeds = breeds.filter(b => b.sensitivity <= val);
      }
      if (normSql.includes('arousal_threshold <= ?')) {
        const val = Number(args[argIdx++]);
        breeds = breeds.filter(b => b.arousal_threshold <= val);
      }
      if (normSql.includes('LIKE ?')) {
        const term = String(args[argIdx++] || '').replace(/%/g, '').toLowerCase();
        argIdx++; // skips second term for description
        breeds = breeds.filter(b =>
          (b.name && b.name.toLowerCase().includes(term)) ||
          (b.description && b.description.toLowerCase().includes(term))
        );
      }

      breeds.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return breeds;
    }

    // 2. SELECT FROM dogs (or JOIN breeds)
    if (normSql.includes('FROM dogs')) {
      let dogs = this.data.dogs.map(d => {
        const breed = this.data.breeds.find(b => b.id === d.breed_id);
        return {
          ...d,
          breed_name: breed ? breed.name : null,
          breed_description: breed ? breed.description : null,
          breed_energy_level: breed ? breed.energy_level : null,
          breed_prey_drive: breed ? breed.prey_drive : null,
          breed_sensitivity: breed ? breed.sensitivity : null,
          breed_arousal_threshold: breed ? breed.arousal_threshold : null,
          breed_image_url: breed ? breed.image_url : null
        };
      });

      if (normSql.includes('WHERE d.id = ?') || normSql.includes('WHERE id = ?')) {
        const id = Number(args[0]);
        return dogs.filter(d => d.id === id);
      }

      if (normSql.includes('ORDER BY id ASC LIMIT 1')) {
        dogs.sort((a, b) => a.id - b.id);
        return dogs.slice(0, 1);
      }

      dogs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return dogs;
    }

    // 3. GROUP BY trigger_type
    if (normSql.includes('GROUP BY trigger_type')) {
      let list = this.data.reactivity_events;
      if (args.length > 0) {
        list = list.filter(e => e.dog_id === Number(args[0]));
      }
      const counts = {};
      list.forEach(e => {
        counts[e.trigger_type] = (counts[e.trigger_type] || 0) + 1;
      });
      return Object.keys(counts).map(t => ({ trigger_type: t, count: counts[t] }));
    }

    // 4. GROUP BY intensity_level
    if (normSql.includes('GROUP BY intensity_level')) {
      let list = this.data.reactivity_events;
      if (args.length > 0) {
        list = list.filter(e => e.dog_id === Number(args[0]));
      }
      const counts = {};
      list.forEach(e => {
        counts[e.intensity_level] = (counts[e.intensity_level] || 0) + 1;
      });
      return Object.keys(counts).map(i => ({ intensity_level: Number(i), count: counts[i] }));
    }

    // 5. SELECT FROM reactivity_events
    if (normSql.includes('FROM reactivity_events')) {
      let events = [...this.data.reactivity_events];

      if (normSql.includes('WHERE id = ?')) {
        const id = Number(args[0]);
        return events.filter(e => e.id === id);
      }

      if (normSql.includes('WHERE walk_id = ?')) {
        const walk_id = Number(args[0]);
        events = events.filter(e => e.walk_id === walk_id);
      } else if (args.length > 0 && normSql.includes('WHERE dog_id = ?')) {
        const dog_id = Number(args[0]);
        events = events.filter(e => e.dog_id === dog_id);
      }

      if (normSql.includes('ORDER BY timestamp DESC')) {
        events.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      } else {
        events.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      }

      return events;
    }

    // 6. SELECT FROM walks (or JOIN dogs / reactivity_events)
    if (normSql.includes('FROM walks')) {
      let walks = this.data.walks.map(w => {
        const dog = this.data.dogs.find(d => d.id === w.dog_id);
        const walkEvents = this.data.reactivity_events.filter(e => e.walk_id === w.id);
        const maxIntensity = walkEvents.reduce((max, e) => Math.max(max, e.intensity_level || 0), 0);

        return {
          ...w,
          dog_name: dog ? dog.name : null,
          event_count: walkEvents.length,
          max_intensity: maxIntensity
        };
      });

      if (normSql.includes('WHERE w.id = ?') || normSql.includes('WHERE id = ?')) {
        const id = Number(args[0]);
        return walks.filter(w => w.id === id);
      }

      if (args.length > 0 && (normSql.includes('WHERE w.dog_id = ?') || normSql.includes('WHERE dog_id = ?'))) {
        const dog_id = Number(args[0]);
        walks = walks.filter(w => w.dog_id === dog_id);
      }

      walks.sort((a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0));

      if (normSql.includes('LIMIT 20')) {
        walks = walks.slice(0, 20);
      }

      return walks;
    }

    return [];
  }
}

const db = new PureJsDatabase();
module.exports = db;
