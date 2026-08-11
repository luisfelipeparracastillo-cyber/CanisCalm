import {
  fetchBreedsFromSupabase,
  fetchDogsFromSupabase,
  createDogInSupabase,
  updateDogInSupabase,
  deleteDogInSupabase,
  fetchWalksFromSupabase,
  startWalkInSupabase,
  finishWalkInSupabase,
  logWalkEventInSupabase,
} from './supabase';
import { FALLBACK_BREEDS } from './mockData';

const API_BASE_URL = '/api';

/**
 * Generic helper for API fetch requests with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) {
      return { success: true };
    }
    return await response.json();
  } catch (error) {
    console.warn(`API Request failed for [${options.method || 'GET'}] ${url}:`, error.message);
    throw error;
  }
}

// ----------------------------------------------------
// Health Check API
// ----------------------------------------------------
export async function checkHealth() {
  return request('/health');
}

// ----------------------------------------------------
// Breeds API (Supabase + Local API + Fallback)
// ----------------------------------------------------
export async function fetchBreeds(params = {}) {
  const supabaseData = await fetchBreedsFromSupabase(params);
  if (supabaseData && supabaseData.length > 0) {
    return supabaseData;
  }

  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.energy) query.append('energy', params.energy);
    if (params.prey) query.append('prey', params.prey);
    if (params.sensitivity) query.append('sensitivity', params.sensitivity);
    if (params.arousal) query.append('arousal', params.arousal);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const apiBreeds = await request(`/breeds${queryString}`);
    if (Array.isArray(apiBreeds) && apiBreeds.length > 0) {
      return apiBreeds;
    }
  } catch (err) {
    console.warn('Local API unavailable for breeds, using fallback');
  }

  let results = [...FALLBACK_BREEDS];
  if (params.search) {
    const term = params.search.toLowerCase();
    results = results.filter(b => b.name.toLowerCase().includes(term) || b.description.toLowerCase().includes(term));
  }
  return results;
}

export async function fetchBreedById(id) {
  try {
    return await request(`/breeds/${id}`);
  } catch (e) {
    return FALLBACK_BREEDS.find(b => b.id === Number(id)) || FALLBACK_BREEDS[0];
  }
}

// ----------------------------------------------------
// Dogs (Pet Profiles) API (Supabase + Local API)
// ----------------------------------------------------
export async function fetchDogs() {
  const supabaseDogs = await fetchDogsFromSupabase();
  if (Array.isArray(supabaseDogs) && supabaseDogs.length > 0) {
    return supabaseDogs;
  }

  try {
    const localDogs = await request('/dogs');
    if (Array.isArray(localDogs) && localDogs.length > 0) {
      return localDogs;
    }
  } catch (err) {
    console.warn('Local API unavailable for dogs');
  }

  return FALLBACK_DOGS;
}

export async function fetchDogById(id) {
  const dogs = await fetchDogs();
  return dogs.find(d => d.id === Number(id)) || null;
}

export async function createDog(data) {
  // 1. If n8n Webhook is configured in .env, trigger n8n workflow directly
  const n8nWebhook = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (n8nWebhook && n8nWebhook.startsWith('http')) {
    try {
      console.log('Sending new dog payload to n8n Webhook:', n8nWebhook);
      const res = await fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json && (json.id || json.name)) return json;
      }
    } catch (err) {
      console.warn('n8n Webhook trigger failed, falling back to Supabase/Local:', err.message);
    }
  }

  // 2. Supabase Integration
  const supabaseCreated = await createDogInSupabase(data);
  if (supabaseCreated) {
    return supabaseCreated;
  }

  // 3. Local Express API Fallback
  return request('/dogs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDog(id, data) {
  const supabaseUpdated = await updateDogInSupabase(id, data);
  if (supabaseUpdated) {
    return supabaseUpdated;
  }

  return request(`/dogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDog(id) {
  const supabaseDeleted = await deleteDogInSupabase(id);
  if (supabaseDeleted) {
    return supabaseDeleted;
  }

  return request(`/dogs/${id}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------
// Walks API (Supabase + Local API)
// ----------------------------------------------------
export async function fetchWalks() {
  const supabaseWalks = await fetchWalksFromSupabase();
  if (supabaseWalks) {
    return supabaseWalks;
  }

  try {
    return await request('/walks');
  } catch (err) {
    console.warn('Local API unavailable for walks');
    return [];
  }
}

export async function fetchWalkById(id) {
  const walks = await fetchWalks();
  return walks.find(w => w.id === Number(id)) || null;
}

export async function startWalk(data) {
  const supabaseStarted = await startWalkInSupabase(data);
  if (supabaseStarted) {
    return supabaseStarted;
  }

  return request('/walks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function finishWalk(id, data) {
  const supabaseFinished = await finishWalkInSupabase(id, data);
  if (supabaseFinished) {
    return supabaseFinished;
  }

  return request(`/walks/${id}/finish`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function logWalkEvent(id, eventData) {
  const supabaseEvent = await logWalkEventInSupabase(id, eventData);
  if (supabaseEvent) {
    return supabaseEvent;
  }

  return request(`/walks/${id}/events`, {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

// ----------------------------------------------------
// Stats & Analytics API
// ----------------------------------------------------
export async function fetchStats(dogId = null) {
  try {
    const queryString = dogId ? `?dog_id=${dogId}` : '';
    return await request(`/stats${queryString}`);
  } catch (e) {
    // Basic stats calculation from local walks
    const walks = await fetchWalks();
    const filteredWalks = dogId ? walks.filter(w => w.dog_id === Number(dogId)) : walks;
    const allEvents = filteredWalks.flatMap(w => w.events || []);

    const trigger_counts = {};
    const intensity_distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

    allEvents.forEach(e => {
      trigger_counts[e.trigger_type] = (trigger_counts[e.trigger_type] || 0) + 1;
      const level = String(e.intensity_level || e.intensity || 1);
      intensity_distribution[level] = (intensity_distribution[level] || 0) + 1;
    });

    return {
      total_walks: filteredWalks.length,
      total_events: allEvents.length,
      trigger_counts,
      intensity_distribution,
      heatmap_points: allEvents,
      walk_history: filteredWalks.slice(0, 20),
    };
  }
}

export default {
  checkHealth,
  fetchBreeds,
  fetchBreedById,
  fetchDogs,
  fetchDogById,
  createDog,
  updateDog,
  deleteDog,
  fetchWalks,
  fetchWalkById,
  startWalk,
  finishWalk,
  logWalkEvent,
  fetchStats,
};
