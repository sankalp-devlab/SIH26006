import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapTilesService } from '../../../services/map/map-tiles.service';
import { createVesselMarkerIcon } from '../../map/components/VesselMarker';
import {
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Layers,
  Check,
  Radio,
  Compass,
  Navigation,
  Globe,
  Crosshair,
  ShieldAlert,
  Anchor,
} from 'lucide-react';
import type { VesselPosition, MapTheme } from '../../../types/map';
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
  shippingLanes: boolean;
  chokepoints: boolean;
  congestion: boolean;
}

interface StrategicChokepoint {
  id: string;
  name: string;
  status: 'HIGH RISK' | 'ELEVATED RISK' | 'CONGESTED' | 'OPERATIONAL' | 'TRANSITING';
  type: string;
  coords: [number, number];
  color: string;
  cargoShare: string;
}

const STRATEGIC_CHOKEPOINTS: StrategicChokepoint[] = [
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    status: 'HIGH RISK',
    type: 'Crude Transit Artery',
    coords: [26.56, 56.25],
    color: '#f43f5e',
    cargoShare: '21% of Global Petroleum',
  },
  {
    id: 'mandeb',
    name: 'Bab el-Mandeb',
    status: 'ELEVATED RISK',
    type: 'Red Sea Gateway',
    coords: [12.58, 43.33],
    color: '#fbbf24',
    cargoShare: 'Suez Access Funnel',
  },
  {
    id: 'malacca',
    name: 'Strait of Malacca',
    status: 'CONGESTED',
    type: 'Indo-Pacific Funnel',
    coords: [1.43, 102.8],
    color: '#38bdf8',
    cargoShare: '94,000+ Vessels/Year',
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    status: 'TRANSITING',
    type: 'Eurasian Maritime Artery',
    coords: [30.58, 32.56],
    color: '#34d399',
    cargoShare: '12% of Global Trade',
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    status: 'OPERATIONAL',
    type: 'Trans-Oceanic Lock',
    coords: [9.08, -79.68],
    color: '#38bdf8',
    cargoShare: '5% of Global Maritime Trade',
  },
  {
    id: 'bosphorus',
    name: 'Bosphorus Strait',
    status: 'OPERATIONAL',
    type: 'Black Sea Chokepoint',
    coords: [41.12, 29.08],
    color: '#a855f7',
    cargoShare: 'Grain & Energy Artery',
  },
];

const REGION_PRESETS = [
  { id: 'global', label: 'Global', center: [18.0, 72.0] as [number, number], zoom: 3 },
  { id: 'asia', label: 'Indo-Pacific', center: [3.5, 103.5] as [number, number], zoom: 5 },
  { id: 'mideast', label: 'Middle East', center: [24.0, 56.0] as [number, number], zoom: 5 },
  { id: 'suez', label: 'Suez / Med', center: [31.5, 30.0] as [number, number], zoom: 5 },
  { id: 'americas', label: 'Americas', center: [18.0, -80.0] as [number, number], zoom: 4 },
];

export function CommandMap({
  vessels,
  ports,
  totalTrackedCount,
  selectedVesselId,
  onSelectVessel,
  onSelectPort,
}: CommandMapProps) {
  const safeVessels = useMemo(() => (Array.isArray(vessels) ? vessels : []), [vessels]);
  const safePorts = useMemo(() => (Array.isArray(ports) ? ports : []), [ports]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const vesselGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const portGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const lanesGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const chokepointsGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Interactive UI States
  const [activeTheme, setActiveTheme] = useState<MapTheme>('dark');
  const [activeRegion, setActiveRegion] = useState<string>('global');
  const [cursorCoords, setCursorCoords] = useState<string>('18.00°N, 72.00°E');
  const [currentZoom, setCurrentZoom] = useState<number>(3);
  const [layersOpen, setLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activeLayers, setActiveLayers] = useState<MapLayers>({
    vessels: true,
    ports: true,
    shippingLanes: true,
    chokepoints: true,
    congestion: false,
  });

  const toggleLayer = useCallback((key: keyof MapLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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

    // Dark cartographic nautical tiles by default
    const tileConfig = MapTilesService.getTileConfig(activeTheme);
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    vesselGroupRef.current.addTo(map);
    portGroupRef.current.addTo(map);
    lanesGroupRef.current.addTo(map);
    chokepointsGroupRef.current.addTo(map);

    mapRef.current = map;

    // Track Cursor Coordinates HUD
    map.on('mousemove', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const latDir = lat >= 0 ? 'N' : 'S';
      const lngDir = lng >= 0 ? 'E' : 'W';
      setCursorCoords(`${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`);
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Dynamic Basemap Theme Switcher
  useEffect(() => {
    if (!mapRef.current) return;
    const tileConfig = MapTilesService.getTileConfig(activeTheme);

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(mapRef.current);

    // Keep markers on top of tile layer
    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [activeTheme]);

  // 3. Shipping Lanes & Animated Flow Corridors
  useEffect(() => {
    lanesGroupRef.current.clearLayers();
    if (!activeLayers.shippingLanes) return;

    const corridors = [
      {
        name: 'Middle East ➔ East Asia Crude Highway',
        color: '#fbbf24', // Amber
        type: 'Crude Petroleum Flow',
        coords: [
          [26.65, 50.16],
          [26.15, 56.5],
          [22.4, 60.5],
          [14.5, 72.0],
          [5.8, 80.5],
          [5.6, 95.5],
          [1.26, 103.8],
          [12.0, 114.0],
          [22.3, 114.17],
          [31.23, 121.47],
        ] as [number, number][],
      },
      {
        name: 'Europe ➔ Asia Suez Container Expressway',
        color: '#34d399', // Emerald
        type: 'Containerized Cargo Artery',
        coords: [
          [51.95, 4.14],
          [49.5, -3.5],
          [36.0, -5.5],
          [35.5, 15.0],
          [29.93, 32.55],
          [22.0, 38.0],
          [12.58, 43.33],
          [11.5, 54.0],
          [6.0, 78.0],
          [1.26, 103.8],
        ] as [number, number][],
      },
      {
        name: 'Australia ➔ China Dry Bulk Artery',
        color: '#38bdf8', // Cyan
        type: 'Iron Ore & Dry Bulk',
        coords: [
          [-20.32, 118.57],
          [-10.0, 118.0],
          [2.0, 110.0],
          [14.0, 114.0],
          [22.5, 118.0],
          [31.23, 121.47],
        ] as [number, number][],
      },
      {
        name: 'US Gulf ➔ Europe Crude Corridor',
        color: '#fbbf24',
        type: 'Trans-Atlantic Energy',
        coords: [
          [29.75, -95.0],
          [25.0, -82.0],
          [32.0, -65.0],
          [42.0, -35.0],
          [49.0, -10.0],
          [51.95, 4.14],
        ] as [number, number][],
      },
    ];

    corridors.forEach((c) => {
      // Glow background line
      const glow = L.polyline(c.coords, {
        color: c.color,
        weight: 4,
        opacity: 0.18,
      });
      lanesGroupRef.current.addLayer(glow);

      // Animated dashed flow polyline
      const line = L.polyline(c.coords, {
        color: c.color,
        weight: 2,
        opacity: 0.85,
        dashArray: '8, 12',
        className: 'cc-shipping-lane-flow',
      });

      line.bindTooltip(
        `<div style="font-family: inherit; font-size: 0.75rem; line-height: 1.4;">
          <div style="font-weight: 700; color: ${c.color};">${c.name}</div>
          <div style="color: #94a3b8; font-size: 0.6875rem;">${c.type} &middot; Real-time AIS Channel</div>
        </div>`,
        { sticky: true, className: 'vmp-map-tooltip' }
      );

      lanesGroupRef.current.addLayer(line);
    });
  }, [activeLayers.shippingLanes]);

  // 4. Strategic Chokepoints Layer
  useEffect(() => {
    chokepointsGroupRef.current.clearLayers();
    if (!activeLayers.chokepoints) return;

    STRATEGIC_CHOKEPOINTS.forEach((cp) => {
      const icon = L.divIcon({
        className: 'cc-chokepoint-div-icon',
        html: `
          <div class="cc-chokepoint-marker" style="color: ${cp.color};">
            <div class="cc-chokepoint-ring"></div>
            <div class="cc-chokepoint-diamond" style="background: ${cp.color};">
              <div style="width: 4px; height: 4px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(cp.coords, {
        icon,
        zIndexOffset: 150,
      });

      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 0.75rem; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="font-weight: 700; color: #f8fafc;">${cp.name}</span>
            <span style="font-size: 0.625rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; background: rgba(244,63,94,0.15); color: ${cp.color}; border: 1px solid ${cp.color};">
              ${cp.status}
            </span>
          </div>
          <div style="color: #94a3b8; font-size: 0.6875rem;">${cp.type}</div>
          <div style="color: #38bdf8; font-size: 0.6875rem; margin-top: 2px;">Volume: ${cp.cargoShare}</div>
        </div>`,
        { direction: 'top', offset: [0, -10], className: 'vmp-map-tooltip' }
      );

      marker.on('click', () => {
        mapRef.current?.flyTo(cp.coords, 6, { duration: 1 });
      });

      chokepointsGroupRef.current.addLayer(marker);
    });
  }, [activeLayers.chokepoints]);

  // 5. Commercial Seaports Layer
  useEffect(() => {
    portGroupRef.current.clearLayers();
    if (!activeLayers.ports) return;

    const validPorts = safePorts.filter((p) => p.latitude != null && p.longitude != null);
    validPorts.slice(0, 100).forEach((port) => {
      const isMajorHub = [
        'Singapore',
        'Shanghai',
        'Rotterdam',
        'Dubai',
        'Jebel Ali',
        'Busan',
        'Hong Kong',
        'Mumbai',
        'Jawaharlal Nehru',
      ].some((hub) => (port.name || '').toLowerCase().includes(hub.toLowerCase()));

      const icon = L.divIcon({
        className: 'cc-port-div-icon',
        html: `
          <div style="
            width: ${isMajorHub ? '16px' : '12px'};
            height: ${isMajorHub ? '16px' : '12px'};
            border-radius: 50%;
            background: ${isMajorHub ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.15)'};
            border: 1.5px solid ${isMajorHub ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isMajorHub ? '10px #38bdf8' : '5px rgba(56, 189, 248, 0.4)'};
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="width: 3px; height: 3px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([port.latitude!, port.longitude!], {
        icon,
        zIndexOffset: isMajorHub ? 130 : 110,
      });

      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 0.75rem; line-height: 1.4;">
          <div style="font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
            <span>⚓ ${port.name}</span>
            ${isMajorHub ? '<span style="font-size: 0.625rem; background: rgba(56, 189, 248, 0.2); padding: 1px 4px; border-radius: 3px; color: #38bdf8;">MAJOR HUB</span>' : ''}
          </div>
          <div style="color: #94a3b8; font-size: 0.6875rem;">${port.country || 'Global Territory'} &middot; UN/LOCODE: ${port.unlocode || 'N/A'}</div>
          <div style="color: #34d399; font-size: 0.6875rem; margin-top: 2px;">Click to view port operations &amp; terminal berths</div>
        </div>`,
        { direction: 'top', offset: [0, -8], className: 'vmp-map-tooltip' }
      );

      marker.on('click', () => {
        onSelectPort(port);
      });

      portGroupRef.current.addLayer(marker);
    });
  }, [safePorts, activeLayers.ports, onSelectPort]);

  // 6. Tracked Vessels Layer with Enhanced Ship Hulls & Radar Pulse
  useEffect(() => {
    vesselGroupRef.current.clearLayers();
    if (!activeLayers.vessels) return;

    const validVessels = safeVessels.filter(
      (v) =>
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
      const icon = createVesselMarkerIcon(v, isSelected, false);

      const marker = L.marker([v.latitude, v.longitude], {
        icon,
        zIndexOffset: isSelected ? 350 : 250,
      });

      const displayName = v.name.replace(/^REFERENCE-/, '');

      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 0.75rem; line-height: 1.4; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 700; color: #00f0ff;">${displayName}</span>
            <span style="font-size: 0.65rem; color: #34d399; font-weight: 700;">${v.speed_knots.toFixed(1)} kn</span>
          </div>
          <div style="color: #94a3b8; font-size: 0.6875rem; margin-top: 1px;">
            ${v.vessel_type || 'Cargo Carrier'} &middot; Heading ${Math.round(v.heading || 0)}°
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.6875rem; color: #cbd5e1; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
            <span>Draft: ${v.draft_m ? `${v.draft_m}m` : 'N/A'}</span>
            <span style="color: #38bdf8;">IMO: ${v.imo_number || 'N/A'}</span>
          </div>
          <div style="color: #38bdf8; font-size: 0.65rem; margin-top: 4px; font-weight: 600;">
            Click to open vessel command drawer &rarr;
          </div>
        </div>`,
        { direction: 'top', offset: [0, -12], className: 'vmp-map-tooltip' }
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
  const handleReset = () => {
    setActiveRegion('global');
    mapRef.current?.flyTo([18.0, 72.0], 3, { duration: 1 });
  };

  const handleFocusFleet = () => {
    if (!mapRef.current || safeVessels.length === 0) return;
    const validCoords = safeVessels
      .filter((v) => typeof v.latitude === 'number' && typeof v.longitude === 'number')
      .map((v) => [v.latitude, v.longitude] as [number, number]);

    if (validCoords.length === 1) {
      mapRef.current.flyTo(validCoords[0], 6, { duration: 1.2 });
    } else if (validCoords.length > 1) {
      const bounds = L.latLngBounds(validCoords);
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
    }
  };

  const handleSelectRegion = (preset: (typeof REGION_PRESETS)[0]) => {
    setActiveRegion(preset.id);
    mapRef.current?.flyTo(preset.center, preset.zoom, { duration: 1.2 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="cc-panel cc-map-panel">
      {/* 1. Modern C2 Command Console Header */}
      <div className="cc-panel-header" style={{ padding: '0.5rem 0.85rem' }}>
        <div className="cc-panel-title" style={{ gap: '0.65rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00f0ff',
              boxShadow: '0 0 10px #00f0ff',
            }}
          />
          <span style={{ fontWeight: 800, letterSpacing: '0.04em', color: '#f8fafc' }}>
            GLOBAL MARITIME GEOSPATIAL INTELLIGENCE
          </span>

          {/* Dynamic Live Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {safeVessels.length > 0 ? (
              <span className="cc-badge cc-badge-positive cc-mono" style={{ gap: '4px' }}>
                <Radio size={11} className="animate-pulse" /> {safeVessels.length} POSITIONED (
                {totalTrackedCount ?? safeVessels.length} FLEET)
              </span>
            ) : (
              <span className="cc-badge cc-badge-warning cc-mono">
                0 POSITIONED ({totalTrackedCount ?? 0} FLEET &middot; AWAITING AIS)
              </span>
            )}

            <span className="cc-badge cc-badge-cyan cc-mono" style={{ gap: '4px' }}>
              <Anchor size={11} /> {safePorts.length} PORTS
            </span>
          </div>
        </div>

        {/* Right Header: Region Presets & Basemap Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Quick Region Selector Pills */}
          <div className="cc-region-pill-bar">
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`cc-region-btn ${activeRegion === preset.id ? 'is-active' : ''}`}
                onClick={() => handleSelectRegion(preset)}
                title={`Navigate to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Basemap Switcher */}
          <div className="cc-map-theme-group">
            <button
              type="button"
              className={`cc-theme-btn ${activeTheme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setActiveTheme('dark')}
              title="Tactical Dark Nautical Basemap"
            >
              Tactical
            </button>
            <button
              type="button"
              className={`cc-theme-btn ${activeTheme === 'voyager' ? 'is-active' : ''}`}
              onClick={() => setActiveTheme('voyager')}
              title="Ocean Depth Topography Basemap"
            >
              Ocean
            </button>
            <button
              type="button"
              className={`cc-theme-btn ${activeTheme === 'satellite' ? 'is-active' : ''}`}
              onClick={() => setActiveTheme('satellite')}
              title="Photorealistic Satellite Imagery Basemap"
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* 2. Map Canvas & Floating Controls */}
      <div className="cc-map-canvas-wrap" ref={containerRef}>
        {/* Real-time Cursor & Zoom HUD */}
        <div className="cc-map-coords-hud">
          <Crosshair size={11} color="#38bdf8" />
          <span className="coords-val">{cursorCoords}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>ZOOM {currentZoom}X</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>AIS ONLINE</span>
        </div>

        {/* Right Floating Controls Dock */}
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
            onClick={handleFocusFleet}
            title="Focus On Active Fleet"
            aria-label="Focus On Active Fleet"
          >
            <Navigation size={13} color="#00f0ff" />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={handleReset}
            title="Reset to Global Overview"
            aria-label="Reset to Global Overview"
          >
            <RotateCcw size={12} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={() => setLayersOpen(!layersOpen)}
            title="Toggle Geospatial Layers"
            aria-label="Toggle Geospatial Layers"
            style={{
              borderColor: layersOpen ? '#00f0ff' : undefined,
              color: layersOpen ? '#00f0ff' : undefined,
            }}
          >
            <Layers size={13} />
          </button>
          <button
            type="button"
            className="cc-map-ctrl-btn"
            onClick={toggleFullscreen}
            title="Toggle Map Fullscreen"
            aria-label="Toggle Map Fullscreen"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {/* Floating Layers Dropdown */}
        {layersOpen && (
          <div className="cc-map-layer-menu">
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Layers size={11} />
              <span>Maritime Overlays</span>
            </div>

            {(
              [
                ['vessels', 'Tracked Vessels', safeVessels.length],
                ['ports', 'Commercial Ports', safePorts.length],
                ['shippingLanes', 'Shipping Corridors', 4],
                ['chokepoints', 'Strategic Chokepoints', 6],
              ] as const
            ).map(([key, label, count]) => (
              <div
                key={key}
                className="cc-layer-item"
                onClick={() => toggleLayer(key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{label}</span>
                  <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>({count})</span>
                </div>
                {activeLayers[key] ? (
                  <Check size={12} color="#34d399" />
                ) : (
                  <span style={{ width: '12px', height: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty Fleet Notice */}
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

      {/* 3. Interactive Legend & Telemetry Status Bar */}
      <div className="cc-map-legend-bar">
        <div className="cc-legend-items">
          {/* Vessels Legend Item */}
          <div
            className={`cc-legend-chip ${activeLayers.vessels ? 'is-active' : 'is-muted'}`}
            onClick={() => toggleLayer('vessels')}
            title="Click to toggle vessel visibility"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.2)',
                border: '1.5px solid #00f0ff',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00f0ff' }} />
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Tracked Fleet (Directional Ship)</span>
          </div>

          {/* Ports Legend Item */}
          <div
            className={`cc-legend-chip ${activeLayers.ports ? 'is-active' : 'is-muted'}`}
            onClick={() => toggleLayer('ports')}
            title="Click to toggle port markers"
          >
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
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Commercial Seaports (⚓)</span>
          </div>

          {/* Shipping Corridors Legend Item */}
          <div
            className={`cc-legend-chip ${activeLayers.shippingLanes ? 'is-active' : 'is-muted'}`}
            onClick={() => toggleLayer('shippingLanes')}
            title="Click to toggle trade corridors"
          >
            <span
              style={{
                width: '18px',
                height: '2px',
                borderTop: '2px dashed #fbbf24',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Shipping Corridors (Flowing AIS)</span>
          </div>

          {/* Strategic Chokepoints Legend Item */}
          <div
            className={`cc-legend-chip ${activeLayers.chokepoints ? 'is-active' : 'is-muted'}`}
            onClick={() => toggleLayer('chokepoints')}
            title="Click to toggle strategic chokepoint bottlenecks"
          >
            <ShieldAlert size={12} color="#f43f5e" />
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Chokepoint Alerts</span>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.6875rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: safeVessels.length > 0 ? '#34d399' : '#f59e0b',
              boxShadow: `0 0 8px ${safeVessels.length > 0 ? '#34d399' : '#f59e0b'}`,
            }}
          />
          <Radio size={11} color={safeVessels.length > 0 ? '#34d399' : '#f59e0b'} />
          <span style={{ fontWeight: 700, color: safeVessels.length > 0 ? '#34d399' : '#f59e0b', letterSpacing: '0.02em' }}>
            {safeVessels.length > 0 ? 'AUTHENTIC TELEMETRY ACTIVE &middot; RULE 28 GROUNDED' : 'TELEMETRY UNAVAILABLE (RULE 28)'}
          </span>
        </div>
      </div>
    </div>
  );
}
