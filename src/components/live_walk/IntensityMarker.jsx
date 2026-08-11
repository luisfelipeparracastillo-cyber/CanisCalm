import React from 'react';
import L from 'leaflet';

/**
 * Color map for reactivity intensity levels 1-5
 */
export const INTENSITY_COLORS = {
  1: { hex: '#4E6E58', label: 'Nivel 1 - Leve', bg: 'bg-sage-600', text: 'text-sage-700', border: 'border-sage-600' },
  2: { hex: '#EAB308', label: 'Nivel 2 - Moderado Bajo', bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-500' },
  3: { hex: '#F97316', label: 'Nivel 3 - Moderado', bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500' },
  4: { hex: '#EF4444', label: 'Nivel 4 - Alto', bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500' },
  5: { hex: '#881337', label: 'Nivel 5 - Intenso / Crítico', bg: 'bg-rose-900', text: 'text-rose-900', border: 'border-rose-900' },
};

/**
 * Gets intensity metadata object for a level (1-5).
 */
export function getIntensityMeta(level) {
  const parsed = parseInt(level, 10);
  return INTENSITY_COLORS[parsed] || INTENSITY_COLORS[3];
}

/**
 * Creates a Leaflet divIcon with color matching the intensity level.
 * @param {number} level Intensity level 1-5
 * @returns {L.DivIcon} Leaflet custom icon
 */
export function createLeafletIntensityIcon(level) {
  const meta = getIntensityMeta(level);
  const color = meta.hex;

  const html = `
    <div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      font-family: system-ui, sans-serif;
      transform: translate(-50%, -50%);
    ">
      ${level}
    </div>
  `;

  return L.divIcon({
    className: 'intensity-leaflet-marker',
    html: html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

/**
 * Creates a Leaflet divIcon for Current Location pulse dot.
 */
export function createCurrentLocationIcon() {
  const html = `
    <div style="position: relative; width: 24px; height: 24px; transform: translate(-50%, -50%);">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(78, 110, 88, 0.4);
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
        top: 3px;
        left: 3px;
        border-radius: 50%;
        background-color: #4E6E58;
        border: 3px solid #FFFFFF;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'current-location-marker',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/**
 * React Component for rendering Intensity Details Card (used in tooltips / popups)
 */
export function IntensityMarkerDetails({ event }) {
  if (!event) return null;

  const meta = getIntensityMeta(event.intensity_level || event.intensity);
  const formattedTime = event.timestamp
    ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="p-2 min-w-[200px] text-ink-primary font-sans">
      <div className="flex items-center justify-between gap-2 border-b border-surface-border pb-1.5 mb-1.5">
        <span className="font-extrabold text-sm text-sage-900">
          {event.trigger_type || 'Detonante'}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold text-white shadow-xs"
          style={{ backgroundColor: meta.hex }}
        >
          Nivel {event.intensity_level || event.intensity || 1}
        </span>
      </div>

      {event.notes && (
        <p className="text-xs text-ink-secondary italic mb-1 bg-cream-50 p-1.5 rounded-lg border border-cream-200">
          "{event.notes}"
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-ink-secondary mt-1">
        <span>Hora: {formattedTime}</span>
        {event.latitude && (
          <span className="font-mono text-[10px]">
            {Number(event.latitude).toFixed(4)}, {Number(event.longitude).toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}

export default IntensityMarkerDetails;
