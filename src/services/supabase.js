import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto') && 
  !supabaseAnonKey.includes('tu-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ----------------------------------------------------
// 1. Breeds API
// ----------------------------------------------------
export async function fetchBreedsFromSupabase(params = {}) {
  if (!supabase) return null;

  try {
    let query = supabase.from('breeds').select('*');

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    if (params.energy) {
      query = query.lte('energy_level', parseInt(params.energy, 10));
    }
    if (params.prey) {
      query = query.lte('prey_drive', parseInt(params.prey, 10));
    }
    if (params.sensitivity) {
      query = query.lte('sensitivity', parseInt(params.sensitivity, 10));
    }
    if (params.arousal) {
      query = query.lte('arousal_threshold', parseInt(params.arousal, 10));
    }

    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch breeds error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase connection exception:', err.message);
    return null;
  }
}

// ----------------------------------------------------
// 2. Dogs (Pet Profiles) API
// ----------------------------------------------------
export async function fetchDogsFromSupabase() {
  if (!supabase) return null;

  try {
    const { data: dogsData, error: dogsError } = await supabase
      .from('dogs')
      .select('*, breeds(*)')
      .order('created_at', { ascending: false });

    if (dogsError) {
      console.warn('Supabase fetch dogs error:', dogsError.message);
      return null;
    }

    return (dogsData || []).map((row) => ({
      id: row.id,
      name: row.name,
      breed_id: row.breed_id,
      breed_name: row.breeds ? row.breeds.name : null,
      age: row.age,
      weight: row.weight,
      gender: row.gender,
      photo_url: row.photo_url,
      triggers: Array.isArray(row.triggers) ? row.triggers : (typeof row.triggers === 'string' ? JSON.parse(row.triggers || '[]') : []),
      trigger_notes: row.trigger_notes,
      comfort_distance: row.comfort_distance,
      training_goals: Array.isArray(row.training_goals) ? row.training_goals : (typeof row.training_goals === 'string' ? JSON.parse(row.training_goals || '[]') : []),
      created_at: row.created_at,
      updated_at: row.updated_at,
      breed: row.breeds || null,
    }));
  } catch (err) {
    console.warn('Supabase fetch dogs exception:', err.message);
    return null;
  }
}

export async function createDogInSupabase(dogData) {
  if (!supabase) return null;

  try {
    const payload = {
      name: dogData.name,
      breed_id: dogData.breed_id || 1,
      age: dogData.age !== undefined ? parseInt(dogData.age, 10) : 0,
      weight: dogData.weight !== undefined ? parseFloat(dogData.weight) : null,
      gender: dogData.gender || null,
      photo_url: dogData.photo_url || null,
      triggers: Array.isArray(dogData.triggers) ? dogData.triggers : [],
      trigger_notes: dogData.trigger_notes || null,
      comfort_distance: dogData.comfort_distance !== undefined ? parseFloat(dogData.comfort_distance) : 10,
      training_goals: Array.isArray(dogData.training_goals) ? dogData.training_goals : [],
    };

    const { data, error } = await supabase.from('dogs').insert([payload]).select('*, breeds(*)').single();
    if (error) {
      console.warn('Supabase create dog error:', error.message);
      return null;
    }
    return {
      ...data,
      breed_name: data.breeds ? data.breeds.name : null,
      breed: data.breeds || null,
    };
  } catch (err) {
    console.warn('Supabase create dog exception:', err.message);
    return null;
  }
}

export async function updateDogInSupabase(id, dogData) {
  if (!supabase) return null;

  try {
    const payload = {
      name: dogData.name,
      breed_id: dogData.breed_id,
      age: dogData.age,
      weight: dogData.weight,
      gender: dogData.gender,
      photo_url: dogData.photo_url,
      triggers: dogData.triggers,
      trigger_notes: dogData.trigger_notes,
      comfort_distance: dogData.comfort_distance,
      training_goals: dogData.training_goals,
    };

    const { data, error } = await supabase.from('dogs').update(payload).eq('id', id).select('*, breeds(*)').single();
    if (error) {
      console.warn('Supabase update dog error:', error.message);
      return null;
    }
    return {
      ...data,
      breed_name: data.breeds ? data.breeds.name : null,
      breed: data.breeds || null,
    };
  } catch (err) {
    console.warn('Supabase update dog exception:', err.message);
    return null;
  }
}

export async function deleteDogInSupabase(id) {
  if (!supabase) return null;

  try {
    const { error } = await supabase.from('dogs').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete dog error:', error.message);
      return null;
    }
    return { success: true };
  } catch (err) {
    console.warn('Supabase delete dog exception:', err.message);
    return null;
  }
}

// ----------------------------------------------------
// 3. Walks API
// ----------------------------------------------------
export async function fetchWalksFromSupabase() {
  if (!supabase) return null;

  try {
    const { data: walksData, error: walksError } = await supabase
      .from('walks')
      .select('*, dogs(name), reactivity_events(*)')
      .order('start_time', { ascending: false });

    if (walksError) {
      console.warn('Supabase fetch walks error:', walksError.message);
      return null;
    }

    return (walksData || []).map((w) => ({
      id: w.id,
      dog_id: w.dog_id,
      dog_name: w.dogs ? w.dogs.name : null,
      start_time: w.start_time,
      end_time: w.end_time,
      status: w.status,
      duration_seconds: w.duration_seconds || 0,
      distance_meters: w.distance_meters || 0,
      route_coordinates: Array.isArray(w.route_coordinates) ? w.route_coordinates : (typeof w.route_coordinates === 'string' ? JSON.parse(w.route_coordinates || '[]') : []),
      notes: w.notes,
      created_at: w.created_at,
      events: (w.reactivity_events || []).map((e) => ({
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
      })),
    }));
  } catch (err) {
    console.warn('Supabase fetch walks exception:', err.message);
    return null;
  }
}

export async function startWalkInSupabase(walkData) {
  if (!supabase) return null;

  try {
    const payload = {
      dog_id: walkData.dog_id,
      start_time: walkData.start_time || new Date().toISOString(),
      status: 'active',
      duration_seconds: 0,
      distance_meters: 0,
      route_coordinates: [],
    };

    const { data, error } = await supabase.from('walks').insert([payload]).select('*, dogs(name)').single();
    if (error) {
      console.warn('Supabase start walk error:', error.message);
      return null;
    }
    return {
      ...data,
      dog_name: data.dogs ? data.dogs.name : null,
      events: [],
    };
  } catch (err) {
    console.warn('Supabase start walk exception:', err.message);
    return null;
  }
}

export async function finishWalkInSupabase(id, payload) {
  if (!supabase) return null;

  try {
    const updateData = {
      end_time: payload.end_time || new Date().toISOString(),
      duration_seconds: payload.duration_seconds || 0,
      distance_meters: payload.distance_meters || 0,
      route_coordinates: payload.route_coordinates || [],
      notes: payload.notes || null,
      status: 'completed',
    };

    const { data, error } = await supabase.from('walks').update(updateData).eq('id', id).select('*, dogs(name), reactivity_events(*)').single();
    if (error) {
      console.warn('Supabase finish walk error:', error.message);
      return null;
    }
    return {
      ...data,
      dog_name: data.dogs ? data.dogs.name : null,
      events: data.reactivity_events || [],
    };
  } catch (err) {
    console.warn('Supabase finish walk exception:', err.message);
    return null;
  }
}

export async function logWalkEventInSupabase(walkId, eventData) {
  if (!supabase) return null;

  try {
    const payload = {
      walk_id: Number(walkId),
      dog_id: eventData.dog_id ? Number(eventData.dog_id) : null,
      trigger_type: eventData.trigger_type,
      intensity_level: Number(eventData.intensity_level || eventData.intensity || 1),
      latitude: Number(eventData.latitude || eventData.lat || 0),
      longitude: Number(eventData.longitude || eventData.lng || 0),
      notes: eventData.notes || null,
      timestamp: eventData.timestamp || new Date().toISOString(),
    };

    const { data, error } = await supabase.from('reactivity_events').insert([payload]).select('*').single();
    if (error) {
      console.warn('Supabase log event error:', error.message);
      return null;
    }
    return {
      ...data,
      intensity: data.intensity_level,
      lat: data.latitude,
      lng: data.longitude,
    };
  } catch (err) {
    console.warn('Supabase log event exception:', err.message);
    return null;
  }
}
