/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Interactive Leaflet Floating Storage Map Canvas
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { MapTilesService } from '../../../../services/map/map-tiles.service';
import type {
  FloatingStorageObservationRecord,
  FloatingStorageCargoType,
} from '../../../../types/floating-storage';
import { validateCoordinate } from '../../../../services/floating-storage/floating-storage-analytics-engine';

interface FloatingStorageMapCanvasProps {
  vessels: FloatingStorageObservationRecord[];
  selectedVesselId: string | null;
  onSelectVessel: (id: string) => void;
}

const CARGO_COLOR_MAP: Record<FloatingStorageCargoType, string> = {
  'Crude Oil': '#f59e0b',
  'Clean Petroleum Products': '#38bdf8',
  'Dirty Petroleum Products / Fuel Oil': '#94a3b8',
  'LNG Gas': '#c084fc',
  'LPG Gas': '#10b981',
  Chemicals: '#f43f5e',
};

export function FloatingStorageMapCanvas({
  vessels,
  selectedVesselId,
  onSelectVessel,
}: FloatingStorageMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const [hasMapError, setHasMapError] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const tileConfig = MapTilesService.getTileConfig('dark');
        const map = L.map(mapContainerRef.current, {
          center: [15, 60],
          zoom: 3,
          minZoom: 2,
          maxZoom: 18,
          worldCopyJump: true,
          zoomControl: false,
        });

        L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: tileConfig.maxZoom,
          subdomains: tileConfig.subdomains as unknown as string[],
        }).addTo(map);

        markersLayerGroupRef.current.addTo(map);
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Failed to initialize Floating Storage Map:', err);
      setHasMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      markersLayerGroupRef.current.clearLayers();

      const validVessels = vessels.filter((v) => validateCoordinate(v.latitude, v.longitude));
      const bounds: L.LatLngTuple[] = [];

      validVessels.forEach((v) => {
        const isSelected = v.id === selectedVesselId;
        const color = CARGO_COLOR_MAP[v.cargoType] ?? '#f59e0b';
        const markerSize = isSelected ? 34 : 26;

        // Custom DivIcon with pulsing effect for selected vessel
        const iconHtml = `
          <div style="
            position: relative;
            width: ${markerSize}px;
            height: ${markerSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    width: ${markerSize + 14}px;
                    height: ${markerSize + 14}px;
                    border-radius: 50%;
                    background: ${color}33;
                    border: 2px solid ${color};
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: #0f172a;
              border: 2.5px solid ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="5" r="3"></circle>
                <line x1="12" y1="22" x2="12" y2="8"></line>
                <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'floating-storage-marker',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });

        const marker = L.marker([v.latitude, v.longitude], { icon });

        // Popup with comprehensive vessel specs
        const popupContent = document.createElement('div');
        popupContent.className = 'fs-popup-card';
        popupContent.innerHTML = `
          <div style="min-width: 220px; font-family: ui-sans-serif, system-ui, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
              <span style="font-weight: 800; color: #f8fafc; font-size: 13px;">${v.vesselName}</span>
              <span style="font-size: 10px; font-weight: bold; background: ${color}22; color: ${color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}44;">
                ${v.vesselClass}
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <div><strong>IMO:</strong> ${v.imoNumber} | ${v.flag}</div>
              <div><strong>Cargo:</strong> <span style="color: #e2e8f0;">${v.cargoType}</span></div>
              ${v.crudeGrade ? `<div><strong>Grade:</strong> <span style="color: ${color}; font-weight: bold;">${v.crudeGrade}</span></div>` : ''}
              <div><strong>Volume:</strong> ${(v.volumeBbl / 1_000_000).toFixed(2)}M bbl (${(v.volumeMt / 1_000).toFixed(0)}k MT)</div>
              <div><strong>Stationary:</strong> <span style="color: #fbbf24; font-weight: bold;">${v.stationaryDays} days</span></div>
              <div><strong>Hub:</strong> ${v.anchorageName}</div>
              <div style="margin-top: 4px; font-weight: 700; color: #34d399;">Est. Value: $${(v.estimatedCargoValueUsd / 1_000_000).toFixed(1)}M USD</div>
            </div>
            <button id="inspect-btn-${v.id}" style="
              width: 100%;
              margin-top: 8px;
              padding: 5px 0;
              background: #f59e0b;
              color: #020617;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">Inspect Vessel Details</button>
          </div>
        `;

        const btn = popupContent.querySelector(`#inspect-btn-${v.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectVessel(v.id);
          });
        }

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'floating-storage-leaflet-popup',
        });

        marker.on('click', () => {
          onSelectVessel(v.id);
        });

        marker.addTo(markersLayerGroupRef.current);
        bounds.push([v.latitude, v.longitude]);
      });

      if (bounds.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), {
          padding: [40, 40],
          maxZoom: 6,
        });
      }
    } catch (err) {
      console.error('Error rendering floating storage map markers:', err);
    }
  }, [vessels, selectedVesselId, onSelectVessel]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapInstanceRef.current && vessels.length > 0) {
      const valid = vessels.filter((v) => validateCoordinate(v.latitude, v.longitude));
      const bounds = valid.map((v) => [v.latitude, v.longitude] as L.LatLngTuple);
      if (bounds.length > 0) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 6 });
      }
    }
  };

  if (hasMapError) {
    return (
      <div className="fs-card" style={{ height: '520px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: 'var(--ol-amber, #F59E0B)', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>Map Rendering Failed</h3>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)', maxWidth: '420px', margin: '6px 0 16px' }}>
          WebGL or Leaflet encountered an error. The rest of the floating storage analytics and tables remain fully functional.
        </p>
        <button
          type="button"
          onClick={() => {
            setHasMapError(false);
          }}
          className="fs-btn fs-btn-primary"
        >
          Retry Map Engine
        </button>
      </div>
    );
  }

  return (
    <div className="fs-map-card">
      {/* Map Container */}
      <div ref={mapContainerRef} className="fs-map-canvas-element" />

      {/* Floating Controls Top Right */}
      <div className="fs-map-toolbar">
        <button
          type="button"
          onClick={handleZoomIn}
          className="fs-map-btn"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="fs-map-btn"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="fs-map-btn"
          title="Reset Global View"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Cargo Legend Bottom Left */}
      <div className="fs-map-legend">
        <div className="fs-map-legend-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={13} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
            <span>Cargo Type Legend</span>
          </span>
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className="fs-map-legend-toggle"
          >
            {showLegend ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {showLegend && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(CARGO_COLOR_MAP).map(([cargo, color]) => (
              <div key={cargo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: color,
                    border: '1px solid #040E19',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cargo}
                </span>
              </div>
            ))}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.1)', fontSize: '10px', color: 'var(--ol-text-muted, #64748B)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Threshold:</span>
              <span style={{ color: 'var(--ol-amber, #F59E0B)', fontWeight: 600 }}>SOG ≤ 0.5 kts | Draft ≥ 75%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
