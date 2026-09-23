import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';

import { useMapData } from '../../hooks/useMapData';
import { MapCanvas } from './components/MapCanvas';
import { MapControls } from './components/MapControls';
import { MapLegend } from './components/MapLegend';
import { VesselFilterPanel, type VesselFilterState } from './components/VesselFilterPanel';
import { VesselDetailPanel } from './components/VesselDetailPanel';
import { PortDetailDrawer } from './components/PortPopup';
import { VesselMapNav } from './components/VesselMapNav';
import { VesselStatusBar } from './components/VesselStatusBar';
import { VesselDetailDrawer } from '../vessels/components/VesselDetailDrawer';
import { MapTimelineBar } from './components/MapTimelineBar';

import {
  MapDataService,
  MAP_TERMINALS,
  MAP_WAYPOINTS,
  SECA_ZONES,
} from '../../services/map/map-data.service';

import type {
  MapLayerVisibility,
  MapTheme,
  MapMode,
  VesselVoyageTrack,
  MaritimeWaypoint,
} from '../../types/map';
import type { Port } from '../../types/port';
import { getVesselCategoryKey } from './components/VesselMarker';

export function VesselMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const urlVesselId = searchParams.get('vessel') ? Number(searchParams.get('vessel')) : null;
  const urlPortId = searchParams.get('port') ? Number(searchParams.get('port')) : null;
  const urlMode = searchParams.get('mode') === 'historical' ? 'historical' : 'live';

  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(urlVesselId);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [mode, setMode] = useState<MapMode>(urlMode);
  const [theme] = useState<MapTheme>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isFullIntelOpen, setIsFullIntelOpen] = useState(false);
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);

  // Status bar telemetry tracking
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(4.0);
  const [lastUpdateSeconds, setLastUpdateSeconds] = useState(0);

  // Layer visibility state
  const [layers, setLayers] = useState<MapLayerVisibility>({
    vessels: true,
    ports: true,
    terminals: true,
    routes: true,
    waypoints: true,
    secaZones: true,
    labels: true,
  });

  // Filter state
  const [filters, setFilters] = useState<VesselFilterState>({
    types: new Set<string>(),
    statuses: new Set<string>(),
    minSpeed: 0,
    maxSpeed: 30,
    flag: 'all',
    areaSearch: '',
  });

  // Historical AIS playback state
  const [historicalIndex, setHistoricalIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef<number | null>(null);

  // 1. Fetch real consolidated maritime data (Zero synthetic coordinates)
  const {
    ports,
    positionedPorts,
    portsById,
    vessels,
    positionedVessels,
    resolvedRoutes,
    totalPortsCount,
    totalVesselsCount,
    positionedVesselsCount,
    totalRoutesCount,
    isLoading,
    isError,
    dataUpdatedAt,
    refetchAll,
  } = useMapData();

  // AIS live timer ticker (resets when dataUpdatedAt changes)
  useEffect(() => {
    setLastUpdateSeconds(0);
    const interval = window.setInterval(() => {
      setLastUpdateSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  // Synchronize initial port from URL if present
  useEffect(() => {
    if (urlPortId && portsById.has(urlPortId)) {
      setSelectedPort(portsById.get(urlPortId) || null);
    }
  }, [urlPortId, portsById]);

  // Multi-attribute vessel filtering
  const filteredPositionedVessels = useMemo(() => {
    return positionedVessels.filter((v) => {
      // 1. Vessel Type
      if (filters.types.size > 0) {
        const catKey = getVesselCategoryKey(v.vessel_type);
        if (!filters.types.has(catKey)) return false;
      }

      // 2. Status
      if (filters.statuses.size > 0) {
        const s = (v.status || '').toLowerCase();
        let matches = false;
        if (filters.statuses.has('underway') && s.includes('underway')) matches = true;
        if (filters.statuses.has('anchored') && s.includes('anchor')) matches = true;
        if (filters.statuses.has('moored') && s.includes('moor')) matches = true;
        if (filters.statuses.has('unknown') && !s.includes('underway') && !s.includes('anchor') && !s.includes('moor')) matches = true;
        if (!matches) return false;
      }

      // 3. Speed
      if (v.speed_knots < filters.minSpeed || v.speed_knots > filters.maxSpeed) {
        return false;
      }

      // 4. Flag State
      if (filters.flag !== 'all' && v.flag !== filters.flag) {
        return false;
      }

      // 5. Area / Port Search
      if (filters.areaSearch.trim()) {
        const q = filters.areaSearch.toLowerCase();
        const matchesOrigin = v.origin_port.toLowerCase().includes(q);
        const matchesDest = v.destination_port.toLowerCase().includes(q);
        if (!matchesOrigin && !matchesDest) return false;
      }

      return true;
    });
  }, [positionedVessels, filters]);

  // Sync selected vessel from URL or state
  useEffect(() => {
    if (urlVesselId && vessels.some((v) => v.id === urlVesselId)) {
      setSelectedVesselId(urlVesselId);
    }
  }, [urlVesselId, vessels]);

  const selectedVessel = useMemo(() => {
    if (!selectedVesselId) return null;
    return positionedVessels.find((v) => v.id === selectedVesselId) || null;
  }, [positionedVessels, selectedVesselId]);

  const rawSelectedVessel = useMemo(() => {
    if (!selectedVesselId) return null;
    return vessels.find((v) => v.id === selectedVesselId) || null;
  }, [vessels, selectedVesselId]);

  // Historical voyage track (if available)
  const voyageTrack: VesselVoyageTrack | null = useMemo(() => {
    if (!selectedVesselId || !selectedVessel) return null;
    return MapDataService.getHistoricalVoyageTrack(selectedVesselId);
  }, [selectedVesselId, selectedVessel]);

  // Historical playback ticker
  useEffect(() => {
    if (isPlaying && voyageTrack && voyageTrack.points.length > 0) {
      playbackTimerRef.current = window.setInterval(() => {
        setHistoricalIndex((prev) => {
          if (prev >= voyageTrack.points.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    } else if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, voyageTrack, playbackSpeed]);

  const handleSelectVessel = useCallback(
    (id: number) => {
      setSelectedVesselId(id);
      setSelectedPort(null); // Clear port selection

      const newParams = new URLSearchParams(searchParams);
      newParams.set('vessel', String(id));
      newParams.delete('port');
      setSearchParams(newParams);

      // Locate vessel if positioned
      const pos = positionedVessels.find((v) => v.id === id);
      if (pos) {
        const el = document.querySelector('.vmp-canvas-container') as any;
        if (el && el._leaflet_map) {
          el._leaflet_map.flyTo([pos.latitude, pos.longitude], 7, { duration: 1.2 });
        }
      }
    },
    [searchParams, setSearchParams, positionedVessels]
  );

  const handleDeselectVessel = useCallback(() => {
    setSelectedVesselId(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('vessel');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSelectPort = useCallback(
    (port: Port) => {
      setSelectedPort(port);
      setSelectedVesselId(null); // Clear vessel selection

      const newParams = new URLSearchParams(searchParams);
      newParams.set('port', String(port.id));
      newParams.delete('vessel');
      setSearchParams(newParams);

      if (port.latitude != null && port.longitude != null) {
        const el = document.querySelector('.vmp-canvas-container') as any;
        if (el && el._leaflet_map) {
          el._leaflet_map.flyTo([port.latitude, port.longitude], 7, { duration: 1.2 });
        }
      }
    },
    [searchParams, setSearchParams]
  );

  const handleDeselectPort = useCallback(() => {
    setSelectedPort(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('port');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleToggleMode = (newMode: MapMode) => {
    setMode(newMode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', newMode);
    setSearchParams(newParams);
    if (newMode === 'historical') {
      setHistoricalIndex(0);
      setIsPlaying(false);
    }
  };

  const handleToggleLayer = (key: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetFilters = () => {
    setFilters({
      types: new Set<string>(),
      statuses: new Set<string>(),
      minSpeed: 0,
      maxSpeed: 30,
      flag: 'all',
      areaSearch: '',
    });
  };

  // Map Navigation & Fit Helpers
  const handleZoomIn = () => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) el._leaflet_map.zoomIn();
  };

  const handleZoomOut = () => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) el._leaflet_map.zoomOut();
  };

  const handleResetView = () => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) {
      el._leaflet_map.flyTo([16.0, 78.0], 4, { duration: 1.2 });
    }
  };

  const handleFitVessels = () => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map && filteredPositionedVessels.length > 0) {
      const bounds = L.latLngBounds(filteredPositionedVessels.map((v) => [v.latitude, v.longitude]));
      el._leaflet_map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8, duration: 1.2 });
    }
  };

  const handleFitAll = () => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) {
      const coords: [number, number][] = [];
      positionedPorts.forEach((p) => coords.push([p.latitude, p.longitude]));
      filteredPositionedVessels.forEach((v) => coords.push([v.latitude, v.longitude]));

      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        el._leaflet_map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, duration: 1.2 });
      }
    }
  };

  const handleLocateVessel = () => {
    if (!selectedVessel) return;
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) {
      el._leaflet_map.flyTo([selectedVessel.latitude, selectedVessel.longitude], 7, { duration: 1.2 });
    }
  };

  const handleSelectWaypoint = (wp: MaritimeWaypoint) => {
    const el = document.querySelector('.vmp-canvas-container') as any;
    if (el && el._leaflet_map) {
      el._leaflet_map.flyTo([wp.latitude, wp.longitude], 6, { duration: 1.2 });
    }
  };

  return (
    <div className={`vmp-fullscreen-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* TOP NAVIGATION / GLOBAL SEARCH (Requirements 6, 7, 12) */}
      <VesselMapNav
        vessels={vessels as any}
        ports={ports}
        waypoints={MAP_WAYPOINTS}
        onSelectVessel={handleSelectVessel}
        onSelectPort={handleSelectPort}
        onSelectWaypoint={handleSelectWaypoint}
      />

      {/* CORE WORKSPACE: LEFT FILTER + MAP CANVAS + RIGHT DETAILS */}
      <main className="vmp-main-workspace">
        {/* LEFT FILTER PANEL (Requirement 8 & 13) */}
        <VesselFilterPanel
          isOpen={isFilterPanelOpen}
          onToggleOpen={() => setIsFilterPanelOpen((v) => !v)}
          filters={filters}
          onUpdateFilters={setFilters}
          onResetFilters={handleResetFilters}
          allVessels={positionedVessels}
          filteredCount={filteredPositionedVessels.length}
        />

        {/* MAP STAGE CANVAS (Requirements 1, 4, 10, 11, 14) */}
        <div className="vmp-map-stage-area">
          {/* LOADING HUD */}
          {isLoading && (
            <div className="vmp-loading-overlay">
              <div className="vmp-loading-box">
                <span className="vmp-loading-spinner"></span>
                <span className="vmp-loading-text">Loading maritime intelligence data...</span>
              </div>
            </div>
          )}

          {/* ERROR HUD */}
          {isError && (
            <div className="vmp-error-banner">
              <span>⚠️ Unable to load maritime data from server.</span>
              <button className="vmp-retry-link" onClick={refetchAll}>
                Retry
              </button>
            </div>
          )}

          <MapCanvas
            vessels={filteredPositionedVessels}
            ports={ports}
            terminals={MAP_TERMINALS}
            waypoints={MAP_WAYPOINTS}
            secaZones={SECA_ZONES}
            resolvedRoutes={resolvedRoutes}
            selectedVesselId={selectedVesselId}
            onSelectVessel={handleSelectVessel}
            onDeselectVessel={handleDeselectVessel}
            selectedPortId={selectedPort?.id ?? null}
            onSelectPort={handleSelectPort}
            layers={layers}
            theme={theme}
            mode={mode}
            historicalPoints={voyageTrack?.points ?? []}
            historicalIndex={historicalIndex}
            onCursorMove={setCursorCoords}
            onZoomChange={setCurrentZoom}
            showTrafficDensity={showTrafficDensity}
          />

          {/* FLOATING MAP CONTROLS (Requirements 9 & 10) */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onFitVessels={handleFitVessels}
            onFitAll={handleFitAll}
            onLocateVessel={handleLocateVessel}
            hasSelectedVessel={selectedVessel != null}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((v) => !v)}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            showTrafficDensity={showTrafficDensity}
            onToggleTrafficDensity={() => setShowTrafficDensity((p) => !p)}
            isLegendOpen={isLegendOpen}
            onToggleLegend={() => setIsLegendOpen((v) => !v)}
          />

          {/* FLOATING MAP LEGEND (Requirement 14) */}
          <MapLegend
            isOpen={isLegendOpen}
            onToggle={() => setIsLegendOpen((v) => !v)}
          />

          {/* RIGHT VESSEL DETAILS PANEL (Requirements 7, 12, 13) */}
          {rawSelectedVessel && !selectedPort && (
            <VesselDetailPanel
              vessel={
                selectedVessel || {
                  id: rawSelectedVessel.id,
                  name: rawSelectedVessel.name,
                  imo_number: rawSelectedVessel.imo_number,
                  vessel_type: rawSelectedVessel.vessel_type || 'Commercial Fleet',
                  flag: rawSelectedVessel.flag,
                  capacity_tons: rawSelectedVessel.capacity_tons,
                  status: rawSelectedVessel.status || 'Reference Spec',
                  latitude: 0,
                  longitude: 0,
                  heading: 0,
                  speed_knots: rawSelectedVessel.speed_laden_knots || 0,
                  draft_m: rawSelectedVessel.draft_m,
                  destination_port: 'Awaiting orders',
                  origin_port: 'Unassigned',
                  eta: 'TBD',
                  last_updated: 'No AIS Position (Reference Spec)',
                  cargo_type: rawSelectedVessel.cargo_types,
                }
              }
              rawVessel={rawSelectedVessel}
              voyageTrack={voyageTrack}
              onClose={handleDeselectVessel}
              onStartHistoricalReplay={() => handleToggleMode('historical')}
              isHistoricalMode={mode === 'historical'}
              onOpenFullIntelligence={() => setIsFullIntelOpen(true)}
            />
          )}

          {/* RIGHT PORT DETAILS PANEL (Requirement 6) */}
          {selectedPort && (
            <PortDetailDrawer
              port={selectedPort}
              onClose={handleDeselectPort}
              onFocus={() => {
                if (selectedPort.latitude != null && selectedPort.longitude != null) {
                  const el = document.querySelector('.vmp-canvas-container') as any;
                  if (el && el._leaflet_map) {
                    el._leaflet_map.flyTo([selectedPort.latitude, selectedPort.longitude], 8, { duration: 1.2 });
                  }
                }
              }}
            />
          )}

          {/* HISTORICAL AIS TIMELINE SCRUBBER HUD */}
          {mode === 'historical' && voyageTrack && (
            <MapTimelineBar
              points={voyageTrack.points}
              currentIndex={historicalIndex}
              onIndexChange={setHistoricalIndex}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              onExitHistorical={() => handleToggleMode('live')}
              vesselName={selectedVessel?.name || 'Selected Vessel'}
            />
          )}
        </div>
      </main>

      {/* STATUS BAR / REAL TELEMETRY COUNTS (Requirements 5 & 17) */}
      <VesselStatusBar
        isConnected={!isError}
        lastUpdateSeconds={lastUpdateSeconds}
        visibleVesselsCount={filteredPositionedVessels.length}
        totalVesselsCount={totalVesselsCount}
        positionedVesselsCount={positionedVesselsCount}
        portsCount={totalPortsCount}
        routesCount={totalRoutesCount}
        zoom={currentZoom}
        cursorCoords={cursorCoords}
        onRetryConnection={refetchAll}
        onResetView={handleResetView}
      />

      {/* FULL 5-DOMAIN VESSEL INTELLIGENCE MODAL */}
      {isFullIntelOpen && rawSelectedVessel && (
        <VesselDetailDrawer
          vessel={rawSelectedVessel}
          onClose={() => setIsFullIntelOpen(false)}
        />
      )}
    </div>
  );
}
