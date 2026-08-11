import React, { memo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useApp } from '../../context/AppContext';
import { saveUserLocationToMemory } from '../../services/geolocation';
import {
  createLeafletIntensityIcon,
  createCurrentLocationIcon,
  IntensityMarkerDetails,
} from './IntensityMarker';
import { Navigation, Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/**
 * On-demand camera controller.
 * Moves the camera ONLY when the user clicks the "Centrar Cámara" button.
 */
function RecenterButton({ currentPosition }) {
  const map = useMap();

  const handleRecenter = () => {
    if (currentPosition && currentPosition.lat != null && currentPosition.lng != null) {
      map.flyTo([currentPosition.lat, currentPosition.lng], map.getZoom(), {
        duration: 0.8,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleRecenter}
      className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-sage-900 border border-surface-border shadow-md px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
      title="Centrar la cámara del mapa en tu posición actual"
    >
      <Target className="w-4 h-4 text-terracotta-600" />
      <span>Centrar Cámara</span>
    </button>
  );
}

/**
 * Map click handler for placing location pin anywhere on the map
 */
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (e.latlng && onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export const LeafletMapView = memo(function LeafletMapView({
  currentPosition = { lat: 4.6097, lng: -74.0817 },
  routeCoordinates = [],
  events = [],
  zoom = 15,
  className = '',
}) {
  const { setCurrentPosition } = useApp();

  const centerLat = currentPosition?.lat ?? 4.6097;
  const centerLng = currentPosition?.lng ?? -74.0817;
  const center = [centerLat, centerLng];

  // Convert route coordinates to Leaflet lat/lng pairs [lat, lng]
  const polylinePositions = (routeCoordinates || [])
    .filter((pt) => pt && (pt.lat != null || pt.latitude != null))
    .map((pt) => [pt.lat ?? pt.latitude, pt.lng ?? pt.longitude]);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || 'BKuZjgTxSBHaRGjeMyFj';
  const tileUrl = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = maptilerKey
    ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const handleLocationUpdate = (coords) => {
    if (coords && coords.lat != null && coords.lng != null) {
      saveUserLocationToMemory(coords);
      if (setCurrentPosition) {
        setCurrentPosition(coords);
      }
    }
  };

  const handleMarkerDragEnd = (event) => {
    const marker = event.target;
    if (marker) {
      const pos = marker.getLatLng();
      if (pos) {
        handleLocationUpdate({ lat: pos.lat, lng: pos.lng });
      }
    }
  };

  return (
    <div className={`w-full h-full min-h-[420px] rounded-2xl overflow-hidden relative shadow-soft border border-surface-border ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={19}
        scrollWheelZoom={true}
        zoomControl={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="w-full h-full z-10"
        style={{ width: '100%', height: '100%', minHeight: '420px' }}
      >
        <MapClickHandler onLocationSelect={handleLocationUpdate} />

        {/* Floating Top Control Overlay */}
        <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px', pointerEvents: 'auto' }}>
          <div className="leaflet-control flex items-center gap-2">
            <RecenterButton currentPosition={currentPosition} />
          </div>
        </div>

        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          tileSize={512}
          zoomOffset={-1}
          maxZoom={19}
          minZoom={2}
        />

        {/* Live Walk Route Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#D97757',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Current Draggable GPS Position Marker */}
        {currentPosition && currentPosition.lat != null && (
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={createCurrentLocationIcon()}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <p className="font-bold text-sage-800 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-sage-600" /> Ubicación GPS Guardada
                </p>
                <p className="text-ink-secondary text-[11px]">
                  {Number(currentPosition.lat).toFixed(5)}, {Number(currentPosition.lng).toFixed(5)}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  📍 Ubicación fijada. Haz clic en cualquier lugar del mapa o arrastra este pin para mover tu ubicación exacta.
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Color-Coded Reactivity Event Markers */}
        {(events || []).map((evt, idx) => {
          const lat = evt.latitude ?? evt.lat;
          const lng = evt.longitude ?? evt.lng;
          if (lat == null || lng == null) return null;

          const intensityLevel = evt.intensity_level ?? evt.intensity ?? 1;

          return (
            <Marker
              key={evt.id || `event-${idx}-${lat}-${lng}`}
              position={[lat, lng]}
              icon={createLeafletIntensityIcon(intensityLevel)}
            >
              <Popup>
                <IntensityMarkerDetails event={evt} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
});

export default LeafletMapView;
