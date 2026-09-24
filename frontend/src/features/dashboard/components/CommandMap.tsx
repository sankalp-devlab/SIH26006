import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapTilesService } from '../../../services/map/map-tiles.service';
import {
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Layers,
  Check,
  Radio,
} from 'lucide-react';
import type { VesselPosition } from '../../../types/map';
import type { Port } from '../../../types/port';

interface CommandMapProps {
  vessels: VesselPosition[];
  ports: Port[];
  totalTrackedCount?: number;
  selectedVesselId: number | null;
  onSelectVessel: (vessel: VesselPosition) => void;
  onSelectPort: (port: Port) => void;
}

interface MapLayers {
  vessels: boolean;
  ports: boolean;
  tradeFlows: boolean;
  shippingLanes: boolean;
  congestion: boolean;
  emissions: boolean;
  density: boolean;
}

export function CommandMap({
  vessels,
  ports,
  totalTrackedCount,
  selectedVesselId,
  onSelectVessel,
  onSelectPort,
}: CommandMapProps) {
  const safeVessels = Array.isArray(vessels) ? vessels : [];
  const safePorts = Array.isArray(ports) ? ports : [];

  const containerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const vesselGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const portGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const lanesGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const flowsGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const [layersOpen, setLayersOpen] = useState(false);
  const [, setIsFullscreen] = useState(false);

  const [activeLayers, setActiveLayers] = useState<MapLayers>({
    vessels: true,
    ports: true,
    tradeFlows: true,
    shippingLanes: true,
    congestion: true,
    emissions: false,
    density: false,
  });

  const toggleLayer = (key: keyof MapLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev [key] }));
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [18.0, 72.0],
      zoom: 3,
      zoomControl: false,
      minZoom: 2,
      maxZoom: 16,
      worldCopyJump: true,
    });

    // Dark cartographic nautical tiles
    const tileConfig = MapTilesService.getTileConfig('dark');
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    vesselGroupRef.current.addTo(map);
    portGroupRef.current.addTo(map);
    lanesGroupRef.current.addTo(map);
    flowsGroupRef.current.addTo(map);

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Shipping Lanes & Trade Flows
  useEffect(() => {
    lanesGroupRef.current.clearLayers();
    flowsGroupRef.current.clearLayers();

    if (!activeLayers.shippingLanes && !activeLayers.tradeFlows) return;

    // Major trade corridors
    const corridors = [
      {
        name: 'Middle East -> East Asia Crude Highway',
        color: '#fbbf24', // Crude amber
        coords: [
          [26.65, 50.16],
          [26.15, 56.50],
          [22.40, 60.50],
          [14.50, 72.00],
          [5.80, 80.50],
          [5.60, 95.50],
          [1.26, 103.80],
          [12.00, 114.00],
          [22.30, 114.17],
          [31.23, 121.47],
        ] as [number, number][],
      },
      {
        name: 'Europe -> Asia Suez Container Highway',
        color: '#34d399', // Container emerald
        coords: [
          [51.95, 4.14],
          [49.50, -3.50],
          [36.00, -5.50],
          [35.50, 15.00],
          [29.93, 32.55],
          [22.00, 38.00],
          [12.58, 43.33],
          [11.50, 54.00],
          [6.00, 78.00],
          [1.26, 103.80],
        ] as [number, number][],
      },
      {
        name: 'Australia -> China Dry Bulk Artery',
        color: '#38bdf8', // Dry bulk cyan
        coords: [
          [-20.32, 118.57],
          [-10.00, 118.00],
          [2.00, 110.00],
          [14.00, 114.00],
          [22.50, 118.00],
          [31.23, 121.47],
        ] as [number, number][],
      },
      {
        name: 'US Gulf -> Europe Crude Corridor',
        color: '#fbbf24',
        coords: [
          [29.75, -95.0],
          [25.00, -82.0],
          [32.00, -65.0],
          [42.00, -35.0],
          [49.00, -10.0],
          [51.95, 4.14],
        ] as [number, number][],
      },
    ];

    corridors.forEach((c) => {
      const line = L.polyline(c.coords, {
        color: c.color,
        weight: 1.8,
        opacity: 0.65,
        dashArray: '5, 8',
      });
      line.bindTooltip(`<b>${c.name}</b>`, { sticky: true, className: 'vmp-map-tooltip' });
      lanesGroupRef.current.addLayer(line);
    });
  }, [activeLayers.shippingLanes, activeLayers.tradeFlows]);

  // 3. Render Ports
  useEffect(() => {
    portGroupRef.current.clearLayers();
    if (!activeLayers.ports) return;

    const validPorts = safePorts.filter((p) => p.latitude != null && p.longitude != null);
    validPorts.slice(0, 80).forEach((port) => {
      const icon = L.divIcon({
        className: 'cc-port-div-icon',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: rgba(56, 189, 248, 0.2);
            border: 1.5px solid #38bdf8;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
            cursor: pointer;
          ">
            <div style="width: 4px; height: 4px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([port.latitude!, port.longitude!], {
        icon,
        zIndexOffset: 120,
      });

      marker.bindTooltip(
        `<b>⚓ ${port.name}</b> (${port.country || 'Global'})<br/><span style="color: #38bdf8;">Click for Port Operations</span>`,
        { direction: 'top', offset: [0, -8], className: 'vmp-map-tooltip' }
      );

      marker.on('click', () => {
        onSelectPort(port);
      });

      portGroupRef.current.addLayer(marker);
    });
  }, [safePorts, activeLayers.ports, onSelectPort]);

  // 4. Render Vessels
  useEffect(() => {
    vesselGroupRef.current.clearLayers();
    if (!activeLayers.vessels) return;

    const validVessels = safeVessels.filter((v) =>
      typeof v.latitude === 'number' &&
      typeof v.longitude === 'number' &&
      !isNaN(v.latitude) &&
      !isNaN(v.longitude) &&
      v.latitude >= -90 &&
      v.latitude <= 90 &&
      v.longitude >= -180 &&
      v.longitude <= 180
    );

    validVessels.forEach((v) => {
      const isSelected = v.id === selectedVesselId;
      const heading = v.heading || 0;

      // Color coding by vessel cargo type
      let hullColor = '#38bdf8'; // Dry Bulk
      const vType = (v.vessel_type || '').toLowerCase();
      if (vType.includes('tanker') || vType.includes('crude')) {
        hullColor = '#fbbf24'; // Crude
      } else if (vType.includes('lng') || vType.includes('gas')) {
        hullColor = '#a855f7'; // LNG
      } else if (vType.includes('container')) {
        hullColor = '#34d399'; // Container
      } else if (vType.includes('product') || vType.includes('chem')) {
        hullColor = '#f43f5e'; // Product
      }

      if (isSelected) {
        hullColor = '#00e5ff';
      }

      const icon = L.divIcon({
        className: 'cc-vessel-marker-div',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
          " title="${v.name} (${v.vessel_type})">
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    inset: -4px;
                    border: 1.5px solid #00e5ff;
                    border-radius: 50%;
                    animation: cc-pulse-green 1.5s infinite ease-in-out;
                  "></div>`
                : ''
            }
            <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${hullColor}" stroke="#ffffff" stroke-width="1.2">
                <path d="M12 2 L19 20 L12 16 L5 20 Z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([v.latitude, v.longitude], {
        icon,
        zIndexOffset: isSelected ? 300 : 200,
      });

      marker.bindTooltip(
        `<b>${v.name}</b><br/>Type: ${v.vessel_type}<br/>Speed: ${v.speed_knots} kn &middot; Heading: ${v.heading}°<br/><span style="color: #38bdf8;">Click to open intelligence drawer</span>`,
        { direction: 'top', offset: [0, -10], className: 'vmp-map-tooltip' }
      );

      marker.on('click', () => {
        onSelectVessel(v);
      });

      vesselGroupRef.current.addLayer(marker);
    });
  }, [safeVessels, selectedVesselId, activeLayers.vessels, onSelectVessel]);

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => mapRef.current?.setView([18.0, 72.0], 3);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="cc-panel cc-map-panel">
      {/* Map Header Bar */}
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8' }} />
          <span>GLOBAL MARITIME GEOSPATIAL INTELLIGENCE</span>
          {safeVessels.length > 0 ? (
            <span className="cc-badge cc-badge-positive cc-mono">
              <Radio size={10} /> {safeVessels.length} POSITIONED ({totalTrackedCount ?? safeVessels.length} FLEET)
            </span>
          ) : (
            <span className="cc-badge cc-badge-warning cc-mono">
              0 POSITIONED ({totalTrackedCount ?? 0} FLEET &middot; DATA UNAVAILABLE)
            </span>
          )}
          <span className="cc-badge cc-badge-cyan cc-mono">
            {safePorts.length} PORTS INDEXED
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            CARTO DARK TILES &middot; AUTO-SCALED
          </span>
        </div>
      </div>

      {/* Map Canvas & Floating Controls */}
      <div className="cc-map-canvas-wrap" ref={containerRef}>
        {/* Floating Controls */}
        <div className="cc-map-controls-float">
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={handleReset}
            title="Reset Global View"
            aria-label="Reset Global View"
          >
            <RotateCcw size={12} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 size={12} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={() => setLayersOpen(!layersOpen)}
            title="Layers Menu"
            aria-label="Layers Menu"
            style={{
              borderColor: layersOpen ? '#38bdf8' : undefined,
              color: layersOpen ? '#38bdf8' : undefined,
            }}
          >
            <Layers size={13} />
          </button>
        </div>

        {/* Floating Layers Dropdown */}
        {layersOpen && (
          <div className="cc-map-layer-menu">
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
              }}
            >
              Map Layer Controls
            </div>

            {(
              [
                ['vessels', 'Vessels'],
                ['ports', 'Ports'],
                ['tradeFlows', 'Trade Flows'],
                ['shippingLanes', 'Shipping Lanes'],
                ['congestion', 'Congestion'],
                ['emissions', 'Emissions'],
                ['density', 'Density'],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="cc-layer-item"
                onClick={() => toggleLayer(key)}
              >
                <span>{label}</span>
                {activeLayers[key] ? (
                  <Check size={12} color="#34d399" />
                ) : (
                  <span style={{ width: '12px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty Telemetry Layer Notice */}
        {safeVessels.length === 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(6, 19, 37, 0.92)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.6875rem',
              color: '#f59e0b',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Notice: 0 live vessel positions recorded. Port infrastructure &amp; planned corridors displayed.</span>
          </div>
        )}
      </div>

      {/* Map Legend Bar */}
      <div className="cc-map-legend-bar">
        <div className="cc-legend-items">
          <div className="cc-legend-item">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '1.5px solid #34d399',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#34d399' }} />
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Tracked Vessel (Directional Arrow)</span>
          </div>
          <div className="cc-legend-item">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1.5px solid #38bdf8',
              }}
            >
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ffffff' }} />
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Commercial Seaport (⚓)</span>
          </div>
          <div className="cc-legend-item">
            <span style={{ width: '20px', height: '2px', borderTop: '2px dashed #fbbf24', display: 'inline-block' }} />
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Planned Shipping Corridor</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.6875rem' }}>
          <Radio size={11} color={safeVessels.length > 0 ? '#34d399' : '#f59e0b'} />
          <span style={{ fontWeight: 600, color: safeVessels.length > 0 ? '#34d399' : '#f59e0b' }}>
            {safeVessels.length > 0 ? 'AUTHENTIC TELEMETRY ACTIVE' : 'TELEMETRY UNAVAILABLE (RULE 28)'}
          </span>
        </div>
      </div>
    </div>
  );
}
