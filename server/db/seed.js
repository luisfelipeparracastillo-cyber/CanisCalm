const { initDb } = require('./schema');

const SEED_BREEDS = [
  {
    name: "Pastor Alemán",
    description: "Perro de trabajo muy inteligente, leal y alerta. Requiere alta estimulación mental y física; propenso a reactividad por frustración o guardias visuales.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Pastor Belga Malinois",
    description: "Raza de altísima energía e impulso de trabajo extremo. Sensible al movimiento rápido y altamente reactivo si no se encauza su impulso de presa.",
    energy_level: 5,
    prey_drive: 5,
    sensitivity: 4,
    arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Border Collie",
    description: "Perro pastor de inteligencia superior y sensibilidad extrema a estímulos visuales en movimiento. Susceptible a fijación y reactividad ante vehículos y bicicletas.",
    energy_level: 5,
    prey_drive: 4,
    sensitivity: 5,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Golden Retriever",
    description: "Perro amigable, equilibrado y adaptable. Generalmente de bajo umbral de reactividad agresiva, pero propenso a reactividad por sobre-excitación social.",
    energy_level: 4,
    prey_drive: 3,
    sensitivity: 4,
    arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Labrador Retriever",
    description: "Raza entusiasta, golosa y extrovertida. Su reactividad suele derivar de la frustración en la correa cuando desea saludar a otros perros o personas.",
    energy_level: 4,
    prey_drive: 3,
    sensitivity: 3,
    arousal_threshold: 2,
    image_url: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Rottweiler",
    description: "Perro guardián seguro, leal y sereno pero reservado. Requiere desensibilización temprana para evitar guardias territoriales o reactividad por desconfianza.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "American Staffordshire Terrier",
    description: "Perro atlético, afectuoso y de gran tenacidad física. Muy vinculado a su guía; propenso a reactividad defensiva o tensión cuando está tenso con la correa.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Beagle",
    description: "Sabueso guiado por el olfato, independiente y curioso. Su impulso de seguimiento de rastros puede provocar tirones de correa y reactividad por frustración vocal.",
    energy_level: 4,
    prey_drive: 5,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Jack Russell Terrier",
    description: "Pequeño terrier de enorme energía e impulso de caza inagotable. Reacciona velozmente ante estímulos repentinos, ruidos fuertes y movimiento de presa.",
    energy_level: 5,
    prey_drive: 5,
    sensitivity: 3,
    arousal_threshold: 5,
    image_url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dóberman Pinscher",
    description: "Perro elegante, atlético y de reacción ultrarrápida. Vigilante de su entorno y muy receptivo al estrés del guía; propenso a reactividad por desconfianza.",
    energy_level: 4,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Shiba Inu",
    description: "Raza japonesa independiente, limpia y de temperamento felino. Alta sensibilidad a la invasión de su espacio vital y reactividad franca hacia otros perros.",
    energy_level: 3,
    prey_drive: 4,
    sensitivity: 4,
    arousal_threshold: 4,
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Mestizo (Criollo)",
    description: "Perro de ascendencia combinada con gran adaptabilidad y diversidad genética. Perfil de temperamento variable con requerimientos personalizados de desensibilización.",
    energy_level: 3,
    prey_drive: 3,
    sensitivity: 3,
    arousal_threshold: 3,
    image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
  }
];

function seedDb(databaseConnection) {
  const db = databaseConnection || require('./connection');
  initDb(db);

  const breedCountRow = db.prepare('SELECT COUNT(*) as count FROM breeds').get();
  if (breedCountRow.count === 0) {
    const insertBreed = db.prepare(`
      INSERT INTO breeds (name, description, energy_level, prey_drive, sensitivity, arousal_threshold, image_url)
      VALUES (@name, @description, @energy_level, @prey_drive, @sensitivity, @arousal_threshold, @image_url)
    `);

    const insertMany = db.transaction((breeds) => {
      for (const breed of breeds) {
        insertBreed.run(breed);
      }
    });

    insertMany(SEED_BREEDS);
    console.log('Seeded 12 dog breeds in Spanish.');
  }

  // Seed Mock Dog Profile if empty
  const dogCountRow = db.prepare('SELECT COUNT(*) as count FROM dogs').get();
  if (dogCountRow.count === 0) {
    const gsd = db.prepare("SELECT id FROM breeds WHERE name = 'Pastor Alemán'").get();
    const breedId = gsd ? gsd.id : 1;

    const dogInsert = db.prepare(`
      INSERT INTO dogs (name, breed_id, age, weight, gender, triggers, trigger_notes, comfort_distance, training_goals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Kira',
      breedId,
      3,
      28.5,
      'Hembra',
      JSON.stringify(['Dog off leash', 'Bike/Skateboard', 'Loud Noise']),
      'Suele tensionarse si ve perros sueltos a menos de 10 metros.',
      10,
      JSON.stringify(['Desensibilización a perros sueltos con método LAT.', 'Redirección con premios de alto valor ante ciclistas.'])
    );

    const dogId = dogInsert.lastInsertRowid;

    // Seed Mock Walk 1
    const walk1 = db.prepare(`
      INSERT INTO walks (dog_id, start_time, end_time, status, duration_seconds, distance_meters, route_coordinates, notes)
      VALUES (?, '2026-08-06T10:00:00Z', '2026-08-06T10:30:00Z', 'completed', 1800, 1500.5, ?, ?)
    `).run(
      dogId,
      JSON.stringify([
        { lat: 4.6097, lng: -74.0817, timestamp: '2026-08-06T10:00:00Z' },
        { lat: 4.6102, lng: -74.0821, timestamp: '2026-08-06T10:15:00Z' },
        { lat: 4.6110, lng: -74.0825, timestamp: '2026-08-06T10:30:00Z' }
      ]),
      'Paseo matutino en el parque central.'
    );

    const walk1Id = walk1.lastInsertRowid;

    db.prepare(`
      INSERT INTO reactivity_events (walk_id, dog_id, trigger_type, intensity_level, notes, latitude, longitude, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(walk1Id, dogId, 'Dog off leash', 4, 'Perro suelto se acercó a 5m', 4.60971, -74.08175, '2026-08-06T10:05:00Z');

    db.prepare(`
      INSERT INTO reactivity_events (walk_id, dog_id, trigger_type, intensity_level, notes, latitude, longitude, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(walk1Id, dogId, 'Bike/Skateboard', 2, 'Ciclista a 15m, redirigido con premio', 4.61020, -74.08210, '2026-08-06T10:20:00Z');

    // Seed Mock Walk 2
    const walk2 = db.prepare(`
      INSERT INTO walks (dog_id, start_time, end_time, status, duration_seconds, distance_meters, route_coordinates, notes)
      VALUES (?, '2026-08-06T16:00:00Z', '2026-08-06T16:20:00Z', 'completed', 1200, 1000.0, ?, ?)
    `).run(
      dogId,
      JSON.stringify([
        { lat: 4.6115, lng: -74.0830, timestamp: '2026-08-06T16:00:00Z' },
        { lat: 4.6120, lng: -74.0835, timestamp: '2026-08-06T16:20:00Z' }
      ]),
      'Paseo de la tarde por el vecindario.'
    );

    const walk2Id = walk2.lastInsertRowid;

    db.prepare(`
      INSERT INTO reactivity_events (walk_id, dog_id, trigger_type, intensity_level, notes, latitude, longitude, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(walk2Id, dogId, 'Loud Noise', 3, 'Bocina de camión cercana', 4.61150, -74.08300, '2026-08-06T16:10:00Z');

    console.log('Seeded initial mock dog profile, walks, and reactivity events.');
  }

  return db;
}

if (require.main === module) {
  const db = require('./connection');
  seedDb(db);
  console.log('Database seeding process finished.');
}

module.exports = { seedDb, SEED_BREEDS };
