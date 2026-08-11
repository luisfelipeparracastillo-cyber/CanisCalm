/**
 * CanisCalm E2E Test Suite Fixtures & Specification Contracts
 * Authoritative contracts derived from ORIGINAL_REQUEST.md and PROJECT.md
 */

const assert = require('node:assert');

// 1. Color Palette Tokens (Calming Nature Theme)
const CALMING_NATURE_THEME = {
  sage: '#4E6E58',
  terracotta: '#D97757',
  warmCream: '#FAF8F5',
  cardSurface: '#FFFFFF',
  roundedCard: ['rounded-2xl', 'rounded-3xl']
};

// 2. Reactivity Triggers & Intensity Levels
const VALID_TRIGGER_TYPES = [
  'Dog off leash',
  'Bike/Skateboard',
  'Person/Child',
  'Loud Noise',
  'Vehicle',
  // Spanish equivalents
  'Perro sin correa',
  'Bici/Patineta',
  'Persona/Niño',
  'Ruido Fuerte',
  'Vehículo'
];

const VALID_INTENSITY_LEVELS = [1, 2, 3, 4, 5];

// 3. Navigation Tabs
const REQUIRED_NAV_TABS = [
  { id: 'live_walk', label: 'Paseo en Vivo' },
  { id: 'breeds', label: 'Enciclopedia' },
  { id: 'dogs', label: 'Mis Perros' },
  { id: 'training', label: 'Entrenamiento' },
  { id: 'analytics', label: 'Analítica' }
];

// 4. Training Guide Modules
const REQUIRED_TRAINING_GUIDES = [
  { id: 'lat', name: 'Look At That (LAT)' },
  { id: 'counter_conditioning', name: 'Contracondicionamiento' },
  { id: 'comfort_zones', name: 'Zonas de Confort' },
  { id: 'three_second_rule', name: 'Regla de 3 Segundos' }
];

// 5. Seed Breeds Fixture Data (12 breeds)
const SEED_BREEDS = [
  { id: 1, name: 'German Shepherd', energy_level: 5, prey_drive: 4, sensitivity: 4, arousal_threshold: 4, description: 'Intelligent, highly alert, and protective.' },
  { id: 2, name: 'Border Collie', energy_level: 5, prey_drive: 5, sensitivity: 5, arousal_threshold: 5, description: 'Extremely active and responsive to visual triggers.' },
  { id: 3, name: 'Golden Retriever', energy_level: 3, prey_drive: 2, sensitivity: 3, arousal_threshold: 2, description: 'Friendly and adaptable with moderate energy.' },
  { id: 4, name: 'Labrador Retriever', energy_level: 4, prey_drive: 3, sensitivity: 2, arousal_threshold: 2, description: 'Outgoing and energetic.' },
  { id: 5, name: 'Australian Shepherd', energy_level: 5, prey_drive: 4, sensitivity: 4, arousal_threshold: 4, description: 'High energy and strong herding instinct.' },
  { id: 6, name: 'Beagle', energy_level: 4, prey_drive: 5, sensitivity: 3, arousal_threshold: 3, description: 'Scent-driven and persistent.' },
  { id: 7, name: 'French Bulldog', energy_level: 2, prey_drive: 1, sensitivity: 3, arousal_threshold: 2, description: 'Low energy, companion dog.' },
  { id: 8, name: 'Boxer', energy_level: 4, prey_drive: 3, sensitivity: 3, arousal_threshold: 4, description: 'Playful and excitable.' },
  { id: 9, name: 'Rottweiler', energy_level: 4, prey_drive: 4, sensitivity: 3, arousal_threshold: 3, description: 'Confident and protective.' },
  { id: 10, name: 'Siberian Husky', energy_level: 5, prey_drive: 5, sensitivity: 2, arousal_threshold: 4, description: 'High endurance and strong prey drive.' },
  { id: 11, name: 'Doberman Pinscher', energy_level: 4, prey_drive: 4, sensitivity: 4, arousal_threshold: 4, description: 'Alert, loyal, and sensitive to environmental changes.' },
  { id: 12, name: 'Jack Russell Terrier', energy_level: 5, prey_drive: 5, sensitivity: 4, arousal_threshold: 5, description: 'Feisty, highly energetic, and intense focus.' }
];

// Helper Validators
function validateBreedObject(breed) {
  assert.strictEqual(typeof breed.id, 'number', 'Breed ID must be a number');
  assert.strictEqual(typeof breed.name, 'string', 'Breed name must be a string');
  assert.ok(breed.name.length > 0, 'Breed name must not be empty');
  assert.ok(breed.energy_level >= 1 && breed.energy_level <= 5, 'Energy level must be 1-5');
  assert.ok(breed.prey_drive >= 1 && breed.prey_drive <= 5, 'Prey drive must be 1-5');
  assert.ok(breed.sensitivity >= 1 && breed.sensitivity <= 5, 'Sensitivity must be 1-5');
  assert.ok(breed.arousal_threshold >= 1 && breed.arousal_threshold <= 5, 'Arousal threshold must be 1-5');
  return true;
}

function validateDogObject(dog) {
  assert.strictEqual(typeof dog.id, 'number', 'Dog ID must be a number');
  assert.strictEqual(typeof dog.name, 'string', 'Dog name must be a string');
  assert.ok(dog.name.length > 0, 'Dog name must not be empty');
  assert.strictEqual(typeof dog.breed_id, 'number', 'Dog breed_id must be a number');
  assert.strictEqual(typeof dog.age, 'number', 'Dog age must be a number');
  assert.ok(Array.isArray(dog.triggers), 'Dog triggers must be an array');
  assert.strictEqual(typeof dog.training_goals, 'string', 'Dog training_goals must be a string');
  return true;
}

function validateWalkObject(walk) {
  assert.strictEqual(typeof walk.id, 'number', 'Walk ID must be a number');
  assert.strictEqual(typeof walk.dog_id, 'number', 'Walk dog_id must be a number');
  assert.ok(walk.status === 'active' || walk.status === 'completed', 'Walk status must be active or completed');
  assert.ok(typeof walk.start_time === 'string' || typeof walk.start_time === 'number', 'start_time must be defined');
  return true;
}

function validateReactivityEvent(event) {
  assert.strictEqual(typeof event.id, 'number', 'Event ID must be a number');
  assert.strictEqual(typeof event.walk_id, 'number', 'Event walk_id must be a number');
  assert.ok(VALID_TRIGGER_TYPES.includes(event.trigger_type), `Invalid trigger_type: ${event.trigger_type}`);
  assert.ok(VALID_INTENSITY_LEVELS.includes(event.intensity_level), `Intensity level must be 1-5: ${event.intensity_level}`);
  assert.strictEqual(typeof event.latitude, 'number', 'Latitude must be a number');
  assert.strictEqual(typeof event.longitude, 'number', 'Longitude must be a number');
  assert.ok(event.latitude >= -90 && event.latitude <= 90, 'Latitude out of bounds');
  assert.ok(event.longitude >= -180 && event.longitude <= 180, 'Longitude out of bounds');
  return true;
}

function validateStatsResponse(stats) {
  assert.strictEqual(typeof stats.total_walks, 'number', 'total_walks must be a number');
  assert.strictEqual(typeof stats.total_events, 'number', 'total_events must be a number');
  assert.strictEqual(typeof stats.trigger_counts, 'object', 'trigger_counts must be an object');
  assert.strictEqual(typeof stats.intensity_distribution, 'object', 'intensity_distribution must be an object');
  assert.ok(Array.isArray(stats.heatmap_points), 'heatmap_points must be an array');
  assert.ok(Array.isArray(stats.walk_history), 'walk_history must be an array');
  return true;
}

module.exports = {
  CALMING_NATURE_THEME,
  VALID_TRIGGER_TYPES,
  VALID_INTENSITY_LEVELS,
  REQUIRED_NAV_TABS,
  REQUIRED_TRAINING_GUIDES,
  SEED_BREEDS,
  validateBreedObject,
  validateDogObject,
  validateWalkObject,
  validateReactivityEvent,
  validateStatsResponse
};
