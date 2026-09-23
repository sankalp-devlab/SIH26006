import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Navigation, Compass } from 'lucide-react';
import type { Vessel } from '../../../types/vessel';
import { MapDataService } from '../../../services/map/map-data.service';
import { MapTilesService } from '../../../services/map/map-tiles.service';

interface VesselMiniMapProps {
  vessel: Vessel;
  className?: string;
  height?: number | string;
}

export function VesselMiniMap({ vessel, className = '', height = 240 }: VesselMiniMapProps) {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [vesselPos] = MapDataService.enrichVesselsWithPositions([vessel]);

  useEffect(() => {
    if (!mapContainerRef.current || !vesselPos) return;

    // If map already exists, remove it before creating a new one
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = vesselPos.latitude || 15.0;
    const lng = vesselPos.longitude || 75.0;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    // Dark Matter tile layer
    const tileConfig = MapTilesService.getTileConfig('dark');
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    // Custom SVG ship marker icon
    const heading = vesselPos.heading || 0;
    const isUnderway = (vessel.status || '').toLowerCase().includes('way') || (vesselPos.speed_knots || 0) > 0.5;
    const markerColor = isUnderway ? '#10b981' : '#f59e0b';

    const customIcon = L.divIcon({
      className: 'vdb-mini-vessel-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${markerColor}22;
            border: 1px solid ${markerColor}66;
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          "></div>
          <div style="
            transform: rotate(${heading}deg);
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          ">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M12 2L4 20L12 17L20 20L12 2Z" fill="${markerColor}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vesselPos, vessel.status]);

  if (!vesselPos) return null;

  const latStr = vesselPos.latitude >= 0 ? `${vesselPos.latitude.toFixed(3)}° N` : `${Math.abs(vesselPos.latitude).toFixed(3)}° S`;
  const lngStr = vesselPos.longitude >= 0 ? `${vesselPos.longitude.toFixed(3)}° E` : `${Math.abs(vesselPos.longitude).toFixed(3)}° W`;

  return (
    <div className={`vdb-minimap-container ${className}`} style={{ height, position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Coordinates & Telemetry Pill */}
      <div className="vdb-minimap-coords-badge">
        <span className="vdb-coords-val">{latStr} &middot; {lngStr}</span>
        <span className="vdb-telemetry-chip">
          <Navigation size={11} /> {vesselPos.speed_knots?.toFixed(1) ?? '—'} kn
        </span>
        <span className="vdb-telemetry-chip">
          <Compass size={11} /> {vesselPos.heading ?? 0}°
        </span>
      </div>

      {/* Full Map Action Link Button */}
      <button
        type="button"
        className="vdb-minimap-expand-btn"
        onClick={() => navigate(`/map?vessel=${vessel.id}`)}
        title="Open in Live Geospatial Map"
      >
        <Maximize2 size={13} />
        <span>View Full Map</span>
      </button>
    </div>
  );
}
