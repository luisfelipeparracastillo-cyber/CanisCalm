import React, { useState } from 'react';
import { INTENSITY_COLORS } from './IntensityMarker';
import Button from '../common/Button';
import { AlertTriangle, Send, CheckCircle2, ChevronDown, ChevronUp, Dog, Bike, User, Volume2, Car } from 'lucide-react';

export const TRIGGER_CATEGORIES = [
  { id: 'Dog off leash', label: 'Perro sin correa', icon: Dog },
  { id: 'Bike/Skateboard', label: 'Bici / Patineta', icon: Bike },
  { id: 'Person/Child', label: 'Persona / Niño', icon: User },
  { id: 'Loud Noise', label: 'Ruido Fuerte', icon: Volume2 },
  { id: 'Vehicle', label: 'Vehículo', icon: Car },
];

export function TriggerQuickLog({
  onLogEvent,
  currentPosition,
  isWalking = true,
  className = '',
}) {
  const [selectedCategory, setSelectedCategory] = useState(TRIGGER_CATEGORIES[0].id);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isWalking || submitting) return;

    setSubmitting(true);
    setSuccessMsg(null);

    const payload = {
      trigger_type: selectedCategory,
      intensity_level: Number(intensity),
      notes: notes.trim(),
      latitude: currentPosition?.lat ?? 40.7829,
      longitude: currentPosition?.lng ?? -73.9654,
      timestamp: new Date().toISOString(),
    };

    try {
      if (onLogEvent) {
        await onLogEvent(payload);
      }
      
      setSuccessMsg(`Detonante "${selectedCategory}" registrado (Nivel ${intensity})`);
      setNotes('');
      
      // Auto clear success notification
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to log trigger event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-surface-border shadow-soft overflow-hidden transition-all duration-300 ${className}`}>
      {/* Drawer Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-sage-50/70 border-b border-surface-border flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sage-900 text-base">
              Registro Rápido 1-Tap de Detonante
            </h3>
            <p className="text-xs text-ink-secondary">
              Marca la presencia de estímulos y nivel de reactividad en tiempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-xl hover:bg-sage-100 text-sage-700 transition-colors"
          aria-label={isExpanded ? 'Colapsar panel' : 'Expandir panel'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Drawer Content */}
      {isExpanded && (
        <div className="p-5 space-y-5 animate-fade-in">
          {/* Success Banner */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Category Selector Buttons */}
          <div>
            <label className="block text-xs font-extrabold text-sage-800 uppercase tracking-wider mb-2">
              1. Selecciona el Detonante (Categoría)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {TRIGGER_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-sage-600 text-white border-sage-600 shadow-sm scale-[1.02]'
                        : 'bg-cream-50 hover:bg-cream-100 text-ink-primary border-surface-border'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-sage-700'}`} />
                    <span className="text-xs font-bold leading-snug">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Intensity Scale Selector (1-5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-sage-800 uppercase tracking-wider">
                2. Nivel de Intensidad de Reactividad (1 a 5)
              </label>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white shadow-xs"
                style={{ backgroundColor: INTENSITY_COLORS[intensity].hex }}
              >
                {INTENSITY_COLORS[intensity].label}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const meta = INTENSITY_COLORS[lvl];
                const isSelected = intensity === lvl;

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`py-3 px-2 rounded-2xl border-2 font-extrabold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'text-white shadow-md scale-105'
                        : 'bg-white hover:bg-sage-50 text-ink-primary border-surface-border'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: meta.hex, borderColor: meta.hex }
                        : {}
                    }
                  >
                    <span className="text-base font-black">{lvl}</span>
                    <span className="text-[10px] opacity-90 hidden sm:inline">
                      {lvl === 1 ? 'Leve' : lvl === 5 ? 'Crítico' : `Nivel ${lvl}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Optional Notes & Instant Submit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas opcionales (ej. Perro sin correa cruzó corriendo...)"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-surface-border bg-warm-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white text-ink-primary"
            />

            <Button
              type="button"
              variant="terracotta"
              size="md"
              icon={Send}
              onClick={handleSubmit}
              disabled={!isWalking || submitting}
              className="shrink-0 font-bold"
            >
              {submitting ? 'Registrando...' : 'Registrar Detonante'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TriggerQuickLog;
