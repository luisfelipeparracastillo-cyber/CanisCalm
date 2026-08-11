import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import DualMapView from './DualMapView';
import TriggerQuickLog from './TriggerQuickLog';
import {
  Play,
  Pause,
  Square,
  Navigation,
  Clock,
  MapPin,
  AlertTriangle,
  Dog,
  Activity,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export function LiveWalkView() {
  const {
    dogs,
    activeDog,
    setActiveDog,
    activeWalk,
    isWalking,
    isPaused,
    routeCoordinates,
    currentPosition,
    walkDistance,
    walkDuration,
    walkEvents,
    isGpsMock,
    startNewWalk,
    pauseWalk,
    resumeWalk,
    finishCurrentWalk,
    logEventToWalk,
    refreshUserLocation,
  } = useApp();

  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');
  const [submittingFinish, setSubmittingFinish] = useState(false);

  // Format seconds to HH:MM:SS
  const formatDuration = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    const pad = (num) => String(num).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Format meters to km / m
  const formatDistance = (meters) => {
    if (!meters || meters < 1000) {
      return `${Math.round(meters || 0)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const handleStart = async () => {
    if (!activeDog) return;
    try {
      await startNewWalk(activeDog.id);
    } catch (err) {
      console.error('Failed to start walk:', err);
    }
  };

  const handleFinishConfirm = async () => {
    setSubmittingFinish(true);
    try {
      await finishCurrentWalk(finishNotes);
      setFinishModalOpen(false);
      setFinishNotes('');
    } catch (err) {
      console.error('Failed to finish walk:', err);
    } finally {
      setSubmittingFinish(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* 1. Header Bar & Active Dog Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-sage-800">Paseo en Vivo GPS</h2>
            {isWalking ? (
              <Badge variant={isPaused ? 'amber' : 'terracotta'} dot>
                {isPaused ? 'Paseada En Pausa' : 'En Progreso'}
              </Badge>
            ) : (
              <Badge variant="sage">Listo para Iniciar</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-ink-secondary">
            <Dog className="w-4 h-4 text-sage-600" />
            <span>Mascota activa:</span>
            {isWalking ? (
              <span className="font-extrabold text-sage-900 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
                {activeDog ? activeDog.name : 'Perro Seleccionado'}
              </span>
            ) : (
              <select
                value={activeDog ? activeDog.id : ''}
                onChange={(e) => {
                  const found = dogs.find((d) => String(d.id) === e.target.value);
                  if (found) setActiveDog(found);
                }}
                className="font-bold text-sage-900 bg-sage-50 px-3 py-1 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                {dogs.length === 0 && <option value="">Sin perros registrados</option>}
                {dogs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.breed_name || 'Raza no especificada'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Walk Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isWalking ? (
            <>
              {isPaused ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={Play}
                  onClick={resumeWalk}
                  className="font-bold"
                >
                  Reanudar
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  icon={Pause}
                  onClick={pauseWalk}
                  className="font-bold"
                >
                  Pausar
                </Button>
              )}

              <Button
                variant="terracotta"
                size="md"
                icon={Square}
                onClick={() => setFinishModalOpen(true)}
                className="font-bold"
              >
                Finalizar Paseo
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={Play}
              onClick={handleStart}
              disabled={!activeDog}
              className="font-bold shadow-md"
            >
              Iniciar Paseo GPS
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={MapPin}
            onClick={() => {
              if (refreshUserLocation) refreshUserLocation();
            }}
            title="Obtener mi ubicación GPS real actual"
            className="border-sage-300 text-sage-800 hover:bg-sage-50"
          >
            Mi Ubicación Real
          </Button>
        </div>
        </div>

      {/* 2. Telemetry Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Timer Card */}
        <Card className="p-4 bg-white flex items-center gap-3.5 border-l-4 border-l-sage-600">
          <div className="w-11 h-11 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-secondary font-medium">Tiempo Transcurrido</p>
            <p className="text-xl font-black text-sage-900 font-mono tracking-tight">
              {formatDuration(walkDuration)}
            </p>
          </div>
        </Card>

        {/* Distance Card */}
        <Card className="p-4 bg-white flex items-center gap-3.5 border-l-4 border-l-terracotta-500">
          <div className="w-11 h-11 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-secondary font-medium">Distancia Recorrida</p>
            <p className="text-xl font-black text-sage-900 font-mono tracking-tight">
              {formatDistance(walkDistance)}
            </p>
          </div>
        </Card>

        {/* Reactivity Events Count Card */}
        <Card className="p-4 bg-white flex items-center gap-3.5 border-l-4 border-l-amber-500">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-secondary font-medium">Eventos de Reactividad</p>
            <p className="text-xl font-black text-sage-900 font-mono tracking-tight">
              {walkEvents.length} <span className="text-xs text-ink-secondary font-normal">registrados</span>
            </p>
          </div>
        </Card>

        {/* GPS Sensor Status Card */}
        <Card className="p-4 bg-white flex items-center gap-3.5 border-l-4 border-l-emerald-600">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-secondary font-medium">Estado del GPS</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isWalking ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'}`}></span>
              <p className="text-xs font-bold text-sage-900">
                {isWalking ? (isGpsMock ? 'GPS Simulado (Mock)' : 'GPS Activo (En vivo)') : 'En Espera'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Dual Map View Container */}
      <DualMapView
        currentPosition={currentPosition}
        routeCoordinates={routeCoordinates}
        events={walkEvents}
      />

      {/* 4. 1-Tap Reactivity Trigger Log Drawer */}
      <TriggerQuickLog
        onLogEvent={logEventToWalk}
        currentPosition={currentPosition}
        isWalking={isWalking}
      />

      {/* Finish Walk Confirmation Modal */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-surface-border shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-border pb-3">
              <div className="w-10 h-10 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold">
                <Square className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-sage-900">Finalizar Paseo</h3>
                <p className="text-xs text-ink-secondary">Guarda el historial y resumen del recorrido</p>
              </div>
            </div>

            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 space-y-2 text-xs text-ink-primary">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Perro:</span>
                <span className="font-bold">{activeDog?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Duración:</span>
                <span className="font-bold">{formatDuration(walkDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Distancia:</span>
                <span className="font-bold">{formatDistance(walkDistance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Eventos Registrados:</span>
                <span className="font-bold">{walkEvents.length}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-sage-800 mb-1">
                Notas finales del paseo (opcional)
              </label>
              <textarea
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                placeholder="Ej. Buen comportamiento al cruzar la calle, reaccionó levemente a un perro..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-surface-border bg-warm-cream/30 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setFinishModalOpen(false)}
                disabled={submittingFinish}
              >
                Cancelar
              </Button>
              <Button
                variant="terracotta"
                size="md"
                icon={CheckCircle2}
                onClick={handleFinishConfirm}
                disabled={submittingFinish}
                className="font-bold"
              >
                {submittingFinish ? 'Guardando...' : 'Confirmar y Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveWalkView;
