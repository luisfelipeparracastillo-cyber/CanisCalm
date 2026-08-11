import { HUNDRED_FCI_BREEDS } from './100BreedsFciData';

export const FALLBACK_BREEDS = HUNDRED_FCI_BREEDS;

export const FALLBACK_DOGS = [
  {
    id: 1,
    name: "Kira",
    breed_id: 1,
    breed_name: "Pastor Alemán",
    age: 3,
    weight: 28.5,
    gender: "Hembra",
    photo_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
    triggers: ["Dog off leash", "Bike/Skateboard", "Loud Noise"],
    trigger_notes: "Suele tensionarse si ve perros sueltos a menos de 10 metros.",
    comfort_distance: 10,
    training_goals: ["Desensibilización a perros sueltos con método LAT.", "Redirección con premios ante ciclistas."]
  }
];
