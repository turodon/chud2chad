'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useFilterStore, useUIStore } from '@/lib/store';
import { LOCATIONS, UCLA_CENTER, CATEGORY_ICONS } from '@/lib/data/locations';
import { calculateScore, getScoreGradient } from '@/lib/scoring';
import { Location } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Map recenter component
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [map, center]);
  return null;
}

// Score-based marker color
function getMarkerColor(score: number): string {
  if (score >= 70) return '#ff3370';
  if (score >= 50) return '#c44dff';
  if (score >= 30) return '#8b5cf6';
  return '#6366f1';
}

// Location popup content
function LocationPopup({
  location,
  score,
  onPractice,
}: {
  location: Location;
  score: number;
  onPractice: () => void;
}) {
  const gradient = score >= 70 ? 'from-primary to-primary-dark' : 'from-accent to-primary';

  return (
    <div className="p-4 min-w-[250px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{CATEGORY_ICONS[location.category]}</span>
        <h3 className="font-bold text-white text-[15px]">{location.name}</h3>
      </div>

      <p className="text-[11px] text-primary-light mb-2 font-medium">{location.type}</p>

      <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 mb-3 p-2 bg-white/[0.03] rounded-lg">
        <span>📍 {location.distance}</span>
        <span>💰 {location.cost}</span>
        <span>👥 {location.ageRange}</span>
        <span>🎯 {location.soloRatio} solo</span>
      </div>

      {/* Score Bar */}
      <div className="bg-white/[0.08] rounded-md h-2 mb-1 overflow-hidden">
        <div
          className={`h-full rounded-md bg-gradient-to-r ${gradient}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Score: <span className="text-white font-bold">{score}</span>/100
      </p>

      <p className="text-[12px] text-gray-300 leading-relaxed mb-2">{location.description}</p>

      <p className="text-[11px] text-primary-light italic border-t border-white/[0.08] pt-2 mt-2">
        💡 {location.tip}
      </p>

      <button
        onClick={onPractice}
        className="w-full mt-3 py-2.5 bg-gradient-to-r from-primary to-accent rounded-lg text-white text-[12px] font-semibold hover:scale-[1.03] transition-transform"
      >
        🎯 Practice Here
      </button>
    </div>
  );
}

export default function MapView() {
  const { filters } = useFilterStore();
  const { setSelectedLocation, openPracticeModal } = useUIStore();

  // Calculate scores for all locations
  const scoredLocations = useMemo(() => {
    return LOCATIONS.map((loc) => ({
      location: loc,
      score: calculateScore(loc, filters.timeSlot, filters.dayOfWeek, filters.demographics),
    })).filter((item) => {
      // Filter by category if any selected
      if (filters.categories.length > 0 && !filters.categories.includes(item.location.category)) {
        return false;
      }
      // Filter by minimum score
      if (item.score < filters.minScore) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const handlePractice = (location: Location) => {
    setSelectedLocation(location);
    openPracticeModal();
  };

  return (
    <MapContainer
      center={UCLA_CENTER}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapController center={UCLA_CENTER} />

      {scoredLocations.map(({ location, score }) => (
        <CircleMarker
          key={location.id}
          center={[location.lat, location.lng]}
          radius={Math.max(8, score / 8)}
          pathOptions={{
            fillColor: getMarkerColor(score),
            fillOpacity: 0.8,
            color: getMarkerColor(score),
            weight: 2,
          }}
          eventHandlers={{
            click: () => setSelectedLocation(location),
          }}
        >
          <Popup>
            <LocationPopup
              location={location}
              score={score}
              onPractice={() => handlePractice(location)}
            />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
