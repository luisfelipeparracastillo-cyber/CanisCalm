/**
 * CanisCalm Geolocation Service
 * High-precision GPS tracking with memory persistence, IP fallback & click-to-pin.
 */

// Default location fallback (e.g. Bogotá city center)
export const DEFAULT_LOCATION = {
  lat: 4.6097,
  lng: -74.0817,
};

const SAVED_LOCATION_KEY = 'caniscalm_saved_user_location';

/**
 * Saves user selected/pinned location permanently in localStorage
 */
export function saveUserLocationToMemory(coords) {
  if (!coords || coords.lat == null || coords.lng == null) return;
  try {
    const payload = {
      lat: Number(coords.lat),
      lng: Number(coords.lng),
      accuracy: coords.accuracy || 5,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not save location to memory:', e.message);
  }
}

/**
 * Gets saved location from localStorage memory if available
 */
export function getSavedLocationFromMemory() {
  try {
    const saved = localStorage.getItem(SAVED_LOCATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.lat != null && parsed.lng != null) {
        return {
          lat: Number(parsed.lat),
          lng: Number(parsed.lng),
          accuracy: parsed.accuracy || 10,
          isMock: false,
          source: 'memory',
        };
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Attempts to detect the user's real location using HTML5 Geolocation API,
 * with memory persistence and multi-provider IP fallback.
 */
export async function detectRealUserLocation() {
  // 1. Check memory first for instant accurate user position
  const saved = getSavedLocationFromMemory();
  if (saved) {
    // Attempt background high-accuracy GPS update
    triggerBackgroundGpsUpdate();
    return saved;
  }

  // 2. Query browser GPS
  return getFreshGpsOrIpLocation();
}

function triggerBackgroundGpsUpdate() {
  if (navigator && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveUserLocationToMemory({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }
}

export async function getFreshGpsOrIpLocation() {
  return new Promise((resolve) => {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isMock: false,
            source: 'browser_gps',
          };
          saveUserLocationToMemory(coords);
          resolve(coords);
        },
        async (err) => {
          console.warn('Browser GPS permission blocked or timed out:', err.message);
          const ipPos = await fetchIpBasedLocation();
          resolve(ipPos);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      fetchIpBasedLocation().then(resolve);
    }
  });
}

/**
 * Multi-provider IP geolocation lookup
 */
export async function fetchIpBasedLocation() {
  // Provider 1: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/').then((r) => r.json());
    if (res && res.latitude && res.longitude) {
      const coords = {
        lat: Number(res.latitude),
        lng: Number(res.longitude),
        accuracy: 1000,
        isMock: false,
        source: 'ip_location',
        city: res.city,
        country: res.country_name,
      };
      saveUserLocationToMemory(coords);
      return coords;
    }
  } catch (e) {}

  // Provider 2: ip-api.com
  try {
    const res2 = await fetch('http://ip-api.com/json/').then((r) => r.json());
    if (res2 && res2.lat && res2.lon) {
      const coords = {
        lat: Number(res2.lat),
        lng: Number(res2.lon),
        accuracy: 1000,
        isMock: false,
        source: 'ip_location',
        city: res2.city,
      };
      saveUserLocationToMemory(coords);
      return coords;
    }
  } catch (e) {}

  return { ...DEFAULT_LOCATION, isMock: true, source: 'default' };
}

/**
 * Calculates distance between two GPS coordinates using the Haversine formula.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100;
}

/**
 * Calculates total cumulative distance along an array of route coordinates.
 */
export function calculateTotalDistance(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const lat1 = prev.lat ?? prev.latitude;
    const lon1 = prev.lng ?? prev.longitude;
    const lat2 = curr.lat ?? curr.latitude;
    const lon2 = curr.lng ?? curr.longitude;
    
    if (lat1 != null && lon1 != null && lat2 != null && lon2 != null) {
      total += calculateDistance(lat1, lon1, lat2, lon2);
    }
  }
  return Math.round(total * 100) / 100;
}

/**
 * Creates a mock location watcher that simulates walking movement.
 */
export function createMockLocationWatcher(onPosition, initialPos = DEFAULT_LOCATION) {
  let currentLat = initialPos.lat;
  let currentLng = initialPos.lng;
  let angle = Math.random() * Math.PI * 2;
  
  onPosition({
    lat: currentLat,
    lng: currentLng,
    accuracy: 5,
    timestamp: new Date().toISOString(),
    isMock: true,
  });

  const intervalId = setInterval(() => {
    angle += (Math.random() - 0.5) * 0.4;
    const stepSize = 0.000015 + Math.random() * 0.00001;
    currentLat += Math.cos(angle) * stepSize;
    currentLng += Math.sin(angle) * stepSize;

    onPosition({
      lat: Number(currentLat.toFixed(6)),
      lng: Number(currentLng.toFixed(6)),
      accuracy: 5,
      timestamp: new Date().toISOString(),
      isMock: true,
    });
  }, 2500);

  return {
    stop: () => clearInterval(intervalId),
    type: 'mock',
  };
}

/**
 * Starts watching real GPS position via navigator.geolocation.watchPosition.
 */
export function startLocationWatch(onPosition, onError, customOptions = {}) {
  const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
    ...customOptions,
  };

  let mockWatcher = null;
  let watchId = null;

  if (!navigator || !navigator.geolocation) {
    detectRealUserLocation().then(initialPos => {
      mockWatcher = createMockLocationWatcher(onPosition, initialPos);
    });
    return {
      stop: () => mockWatcher && mockWatcher.stop(),
      isMock: true,
    };
  }

  let hasEmittedFirst = false;

  try {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        hasEmittedFirst = true;
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date(pos.timestamp).toISOString(),
          isMock: false,
        };
        saveUserLocationToMemory(coords);
        onPosition(coords);
      },
      (err) => {
        console.warn(`Geolocation error (${err.code}): ${err.message}. Falling back to saved/IP location.`);
        if (onError) onError(err);
        
        if (!mockWatcher && !hasEmittedFirst) {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          detectRealUserLocation().then(initialPos => {
            mockWatcher = createMockLocationWatcher(onPosition, initialPos);
          });
        }
      },
      options
    );
  } catch (err) {
    if (onError) onError(err);
    detectRealUserLocation().then(initialPos => {
      mockWatcher = createMockLocationWatcher(onPosition, initialPos);
    });
    return {
      stop: () => mockWatcher && mockWatcher.stop(),
      isMock: true,
    };
  }

  return {
    stop: () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (mockWatcher) mockWatcher.stop();
    },
    isMock: false,
  };
}

export function stopLocationWatch(watchRef) {
  if (watchRef && typeof watchRef.stop === 'function') {
    watchRef.stop();
  }
}
