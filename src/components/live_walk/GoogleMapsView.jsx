import React, { useState } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { getIntensityMeta, IntensityMarkerDetails } from './IntensityMarker';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '380px',
  borderRadius: '1rem',
};

const defaultCenter = { lat: 40.7829, lng: -73.9654 };

export function GoogleMapsView({
  apiKey,
  currentPosition = defaultCenter,
  routeCoordinates = [],
  events = [],
  zoom = 16,
  onError,
  className = '',
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    id: 'google-map-script',
  });

  if (loadError) {
    if (onError) onError(loadError);
    return null;
  }

  if (!isLoaded) {
    return (
      <div className={`w-full h-full min-h-[380px] bg-sage-50/50 rounded-2xl flex items-center justify-center border border-surface-border ${className}`}>
        <div className="flex items-center gap-3 text-sage-700 font-medium">
          <div className="w-5 h-5 border-2 border-sage-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando Google Maps...</span>
        </div>
      </div>
    );
  }

  const center = {
    lat: currentPosition?.lat ?? defaultCenter.lat,
    lng: currentPosition?.lng ?? defaultCenter.lng,
  };

  const path = routeCoordinates
    .filter((pt) => pt && (pt.lat != null || pt.latitude != null))
    .map((pt) => ({
      lat: pt.lat ?? pt.latitude,
      lng: pt.lng ?? pt.longitude,
    }));

  return (
    <div className={`w-full h-full min-h-[380px] rounded-2xl overflow-hidden relative shadow-soft border border-surface-border ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* Live Route Polyline */}
        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeColor: '#D97757',
              strokeOpacity: 0.85,
              strokeWeight: 5,
            }}
          />
        )}

        {/* Current Position Marker */}
        {currentPosition && currentPosition.lat != null && (
          <Marker
            position={{ lat: currentPosition.lat, lng: currentPosition.lng }}
            icon={{
              path: 0, // Circle
              scale: 8,
              fillColor: '#4E6E58',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            }}
            title="Ubicación Actual GPS"
          />
        )}

        {/* Intensity Event Markers */}
        {events.map((evt, idx) => {
          const lat = evt.latitude ?? evt.lat;
          const lng = evt.longitude ?? evt.lng;
          if (lat == null || lng == null) return null;

          const level = evt.intensity_level ?? evt.intensity ?? 1;
          const meta = getIntensityMeta(level);

          return (
            <Marker
              key={evt.id || `gmark-${idx}-${lat}-${lng}`}
              position={{ lat, lng }}
              icon={{
                path: 0, // Circle
                scale: 12,
                fillColor: meta.hex,
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5,
              }}
              label={{
                text: String(level),
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
              onClick={() => setSelectedEvent(evt)}
            />
          );
        })}

        {/* InfoWindow for Clicked Event */}
        {selectedEvent && (
          <InfoWindow
            position={{
              lat: selectedEvent.latitude ?? selectedEvent.lat,
              lng: selectedEvent.longitude ?? selectedEvent.lng,
            }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <IntensityMarkerDetails event={selectedEvent} />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default GoogleMapsView;
