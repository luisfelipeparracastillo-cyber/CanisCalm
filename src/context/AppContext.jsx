import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import {
  startLocationWatch,
  stopLocationWatch,
  calculateTotalDistance,
  detectRealUserLocation,
  DEFAULT_LOCATION,
} from '../services/geolocation';

import { FALLBACK_DOGS } from '../services/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('live_walk');
  
  // Data Collections State
  const [dogs, setDogs] = useState(FALLBACK_DOGS);
  const [activeDog, setActiveDog] = useState(FALLBACK_DOGS[0]);
  const [breeds, setBreeds] = useState([]);
  const [walks, setWalks] = useState([]);
  const [stats, setStats] = useState(null);

  // Active Walk Session & Live Telemetry State
  const [activeWalk, setActiveWalk] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(DEFAULT_LOCATION);
  const [walkDistance, setWalkDistance] = useState(0);
  const [walkDuration, setWalkDuration] = useState(0);
  const [walkEvents, setWalkEvents] = useState([]);
  const [isGpsMock, setIsGpsMock] = useState(false);

  // Status & Connectivity State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);

  // Ref to hold location watcher reference
  const locationWatcherRef = useRef(null);

  // --------------------------------------------------
  // Data Loaders
  // --------------------------------------------------
  const checkApiHealth = useCallback(async () => {
    try {
      await api.checkHealth();
      setApiConnected(true);
    } catch (err) {
      setApiConnected(false);
    }
  }, []);

  const loadDogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchDogs();
      const dogList = Array.isArray(data) ? data : (data.dogs || []);
      setDogs(dogList);
      
      // Auto-select first dog if none active
      setActiveDog((prev) => {
        if (prev && dogList.some((d) => d.id === prev.id)) {
          return dogList.find((d) => d.id === prev.id);
        }
        return dogList.length > 0 ? dogList[0] : null;
      });
      setError(null);
    } catch (err) {
      console.warn('Failed to load dogs:', err.message);
      setError('No se pudieron cargar los perfiles de perros.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBreeds = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await api.fetchBreeds(params);
      const breedList = Array.isArray(data) ? data : (data.breeds || []);
      setBreeds(breedList);
      setError(null);
    } catch (err) {
      console.warn('Failed to load breeds:', err.message);
      setError('No se pudo cargar la enciclopedia de razas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWalks = useCallback(async () => {
    try {
      const data = await api.fetchWalks();
      const walkList = Array.isArray(data) ? data : (data.walks || []);
      setWalks(walkList);
      
      // Check if there is an ongoing active walk
      const currentActive = walkList.find((w) => w.status === 'active');
      if (currentActive && !activeWalk) {
        setActiveWalk(currentActive);
        setIsWalking(true);
        if (Array.isArray(currentActive.events)) {
          setWalkEvents(currentActive.events);
        }
      }
    } catch (err) {
      console.warn('Failed to load walks:', err.message);
    }
  }, [activeWalk]);

  const loadStats = useCallback(async (dogId = null) => {
    try {
      const selectedId = dogId || (activeDog ? activeDog.id : null);
      const data = await api.fetchStats(selectedId);
      setStats(data);
    } catch (err) {
      console.warn('Failed to load stats:', err.message);
    }
  }, [activeDog]);

  const refreshUserLocation = useCallback(async () => {
    try {
      const realPos = await detectRealUserLocation();
      if (realPos && realPos.lat && realPos.lng) {
        setCurrentPosition({ lat: realPos.lat, lng: realPos.lng });
      }
    } catch (e) {
      console.warn('Could not refresh user location:', e.message);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    refreshUserLocation();
    checkApiHealth();
    loadDogs();
    loadBreeds();
    loadWalks();
    loadStats();
  }, [refreshUserLocation, checkApiHealth, loadDogs, loadBreeds, loadWalks, loadStats]);

  // Re-fetch stats when active dog changes
  useEffect(() => {
    if (activeDog) {
      loadStats(activeDog.id);
    }
  }, [activeDog, loadStats]);

  // --------------------------------------------------
  // Telemetry & GPS Location Watcher Effect
  // --------------------------------------------------
  useEffect(() => {
    if (isWalking && !isPaused) {
      // Start GPS location watcher
      const watcher = startLocationWatch(
        (pos) => {
          const newPt = {
            lat: pos.lat,
            lng: pos.lng,
            timestamp: pos.timestamp || new Date().toISOString(),
          };
          
          setCurrentPosition({ lat: pos.lat, lng: pos.lng });
          setIsGpsMock(Boolean(pos.isMock));

          setRouteCoordinates((prev) => {
            const nextRoute = [...prev, newPt];
            const dist = calculateTotalDistance(nextRoute);
            setWalkDistance(dist);
            return nextRoute;
          });
        },
        (err) => {
          console.warn('GPS location watch error:', err.message);
        }
      );

      locationWatcherRef.current = watcher;

      // Duration timer tick interval
      const timerId = setInterval(() => {
        setWalkDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        clearInterval(timerId);
        if (locationWatcherRef.current) {
          stopLocationWatch(locationWatcherRef.current);
          locationWatcherRef.current = null;
        }
      };
    } else if (locationWatcherRef.current) {
      stopLocationWatch(locationWatcherRef.current);
      locationWatcherRef.current = null;
    }
  }, [isWalking, isPaused]);

  // --------------------------------------------------
  // Mutations & Actions
  // --------------------------------------------------
  const createNewDog = async (dogData) => {
    setLoading(true);
    try {
      const newDog = await api.createDog(dogData);
      await loadDogs();
      if (newDog && newDog.id) {
        setActiveDog(newDog);
      }
      return newDog;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingDog = async (id, dogData) => {
    setLoading(true);
    try {
      const updated = await api.updateDog(id, dogData);
      await loadDogs();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExistingDog = async (id) => {
    setLoading(true);
    try {
      await api.deleteDog(id);
      await loadDogs();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startNewWalk = async (dogId = null) => {
    const targetDogId = dogId || (activeDog ? activeDog.id : null);
    if (!targetDogId) {
      throw new Error('Debes seleccionar un perro antes de iniciar un paseo.');
    }
    
    setLoading(true);
    try {
      const walkData = {
        dog_id: targetDogId,
        start_time: new Date().toISOString(),
      };
      const createdWalk = await api.startWalk(walkData);
      
      // Reset telemetry
      setActiveWalk(createdWalk);
      setRouteCoordinates([]);
      setWalkDistance(0);
      setWalkDuration(0);
      setWalkEvents([]);
      setIsPaused(false);
      setIsWalking(true);

      await loadWalks();
      return createdWalk;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pauseWalk = () => {
    setIsPaused(true);
  };

  const resumeWalk = () => {
    setIsPaused(false);
  };

  const finishCurrentWalk = async (notesArg = '') => {
    const idToFinish = activeWalk ? activeWalk.id : null;
    if (!idToFinish) return;

    setLoading(true);
    try {
      const payload = {
        end_time: new Date().toISOString(),
        duration_seconds: walkDuration,
        distance_meters: walkDistance,
        route_coordinates: routeCoordinates,
        notes: typeof notesArg === 'string' ? notesArg : '',
      };

      const finished = await api.finishWalk(idToFinish, payload);
      
      // Reset active walk state
      setActiveWalk(null);
      setIsWalking(false);
      setIsPaused(false);
      
      await loadWalks();
      await loadStats();
      return finished;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logEventToWalk = async (eventData) => {
    const targetWalkId = activeWalk ? activeWalk.id : null;
    if (!targetWalkId) {
      throw new Error('No hay un paseo activo para registrar el evento.');
    }

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        latitude: currentPosition?.lat ?? 40.7829,
        longitude: currentPosition?.lng ?? -73.9654,
        ...eventData,
      };

      const newEvent = await api.logWalkEvent(targetWalkId, payload);

      // Local state update for immediate UI responsiveness
      setWalkEvents((prev) => [...prev, newEvent]);

      if (activeWalk && activeWalk.id === targetWalkId) {
        setActiveWalk((prev) => ({
          ...prev,
          events: [...(prev.events || []), newEvent],
        }));
      }

      await loadStats();
      return newEvent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    // State
    activeTab,
    setActiveTab,
    activeDog,
    setActiveDog,
    activeWalk,
    setActiveWalk,
    isWalking,
    setIsWalking,
    isPaused,
    routeCoordinates,
    currentPosition,
    setCurrentPosition,
    walkDistance,
    walkDuration,
    walkEvents,
    isGpsMock,
    dogs,
    breeds,
    walks,
    stats,
    loading,
    error,
    apiConnected,

    // Actions & API Methods
    checkApiHealth,
    refreshUserLocation,
    loadDogs,
    loadBreeds,
    loadWalks,
    loadStats,
    createNewDog,
    updateExistingDog,
    deleteExistingDog,
    startNewWalk,
    pauseWalk,
    resumeWalk,
    finishCurrentWalk,
    logEventToWalk,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
