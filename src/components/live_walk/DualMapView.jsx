import React, { useState } from 'react';
import GoogleMapsView from './GoogleMapsView';
import LeafletMapView from './LeafletMapView';
import { Layers, MapPin, AlertCircle } from 'lucide-react';

export function DualMapView({
  currentPosition,
  routeCoordinates = [],
  events = [],
  zoom = 16,
  className = '',
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  // Preferred engine: 'google' if key exists, else 'leaflet'
  const [selectedEngine, setSelectedEngine] = useState(hasApiKey ? 'google' : 'leaflet');
  const [googleLoadError, setGoogleLoadError] = useState(false);

  // Handle Google Maps load error by falling back automatically to Leaflet
  const handleGoogleError = (err) => {
    console.warn('Google Maps API failed to load. Falling back to Leaflet / OpenStreetMap:', err);
    setGoogleLoadError(true);
    setSelectedEngine('leaflet');
  };

  const activeEngine = (selectedEngine === 'google' && !googleLoadError && hasApiKey) ? 'google' : 'leaflet';

  return (
    <div className={`relative w-full h-[450px] rounded-3xl overflow-hidden shadow-soft border border-surface-border bg-white ${className}`}>
      {/* Map Header / Engine Toggle Switch */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-surface-border shadow-md text-xs font-semibold text-sage-800">
        <Layers className="w-4 h-4 text-sage-600" />
        <span className="hidden sm:inline">Motor:</span>
        <button
          type="button"
          onClick={() => {
            if (activeEngine === 'google') {
              setSelectedEngine('leaflet');
            } else {
              if (!hasApiKey) {
                alert('No se detectó VITE_GOOGLE_MAPS_API_KEY en variables de entorno. Usando OpenStreetMap / Leaflet.');
              }
              setSelectedEngine('google');
            }
          }}
          className="px-2.5 py-1 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-800 transition-colors font-bold flex items-center gap-1.5"
          title="Alternar motor de mapa para pruebas"
        >
          {activeEngine === 'google' ? 'Google Maps' : 'Leaflet (OSM)'}
          <span className="text-[10px] bg-sage-600 text-white px-1.5 py-0.2 rounded-full">Cambiar</span>
        </button>
      </div>

      {/* Engine Status Banner */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-surface-border shadow-md text-[11px] font-medium text-ink-primary flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-terracotta-500 animate-pulse-soft" />
        <span>
          {activeEngine === 'google' ? 'Google Maps Engine' : 'Leaflet OpenStreetMap Engine'}
        </span>
        {googleLoadError && (
          <span className="text-amber-600 text-[10px] flex items-center gap-1 font-bold">
            <AlertCircle className="w-3 h-3" /> Fallback Activo
          </span>
        )}
      </div>

      {/* Map Renderer */}
      {activeEngine === 'google' ? (
        <GoogleMapsView
          apiKey={apiKey}
          currentPosition={currentPosition}
          routeCoordinates={routeCoordinates}
          events={events}
          zoom={zoom}
          onError={handleGoogleError}
        />
      ) : (
        <LeafletMapView
          currentPosition={currentPosition}
          routeCoordinates={routeCoordinates}
          events={events}
          zoom={zoom}
        />
      )}
    </div>
  );
}

export default DualMapView;
