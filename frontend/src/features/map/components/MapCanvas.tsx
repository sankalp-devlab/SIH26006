import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type {
  VesselPosition,
  MapLayerVisibility,
  MapTheme,
  MapMode,
  HistoricalAisPoint,
  MaritimeTerminal,
  MaritimeWaypoint,
  SecaZone,
} from '../../../types/map';
import type { Port } from '../../../types/port';
import type { ResolvedRoute } from '../../../hooks/useMapData';
import {
  createVesselMarkerIcon,
  createClusterMarkerIcon,
  createPortClusterMarkerIcon,
  createPortMarkerIcon,
  createTerminalMarkerIcon,
  createWaypointMarkerIcon,
} from './VesselMarker';
import { renderPortPopupHtml } from './PortPopup';
import { renderRoutesLayer, type RouteGeometry } from './RouteLayer';
import { MapTilesService } from '../../../services/map/map-tiles.service';

interface MapCanvasProps {
  vessels: VesselPosition[];
  ports: Port[];
  terminals: MaritimeTerminal[];
  waypoints: MaritimeWaypoint[];
  secaZones: SecaZone[];
  resolvedRoutes?: ResolvedRoute[];
  module11Geometries?: RouteGeometry[];
  selectedVesselId: number | null;
  onSelectVessel: (id: number) => void;
  onDeselectVessel?: () => void;
  selectedPortId?: number | null;
  onSelectPort?: (port: Port) => void;
  layers: MapLayerVisibility;
  theme: MapTheme;
  mode: MapMode;
  historicalPoints: HistoricalAisPoint[];
  historicalIndex: number;
  onCursorMove?: (coords: { lat: number; lng: number } | null) => void;
  onZoomChange?: (zoom: number) => void;
  showTrafficDensity?: boolean;
}

interface AnimatedVesselState {
  currentLat: number;
  currentLng: number;
  currentHeading: number;
  targetLat: number;
  targetLng: number;
  targetHeading: number;
  speedKnots: number;
  status: string;
  lastUpdated: number;
}

export function MapCanvas({
  vessels,
  ports,
  terminals,
  waypoints,
  secaZones,
  resolvedRoutes = [],
  module11Geometries = [],
  selectedVesselId,
  onSelectVessel,
  onDeselectVessel,
  selectedPortId,
  onSelectPort,
  layers,
  theme,
  mode,
  historicalPoints,
  historicalIndex,
  onCursorMove,
  onZoomChange,
  showTrafficDensity = false,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Dedicated Layer Groups
  const vesselGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const clusterGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const portGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const portClusterGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const terminalGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const waypointGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const secaGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const routesGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const trafficDensityGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const historicalTrackGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const selectedVesselTrailGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Tracking references for smooth animation
  const markerInstancesRef = useRef<Map<number, L.Marker>>(new Map());
  const vesselAnimStatesRef = useRef<Map<number, AnimatedVesselState>>(new Map());
  const selectedTrailCoordsRef = useRef<Map<number, [number, number][]>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);
  const currentZoomRef = useRef<number>(4);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [18.0, 65.0],
      zoom: 3.5,
      zoomControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
    });

    const tileConfig = MapTilesService.getTileConfig(theme);
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Attach layers
    vesselGroupRef.current.addTo(map);
    clusterGroupRef.current.addTo(map);
    portGroupRef.current.addTo(map);
    portClusterGroupRef.current.addTo(map);
    terminalGroupRef.current.addTo(map);
    waypointGroupRef.current.addTo(map);
    secaGroupRef.current.addTo(map);
    routesGroupRef.current.addTo(map);
    trafficDensityGroupRef.current.addTo(map);
    historicalTrackGroupRef.current.addTo(map);
    selectedVesselTrailGroupRef.current.addTo(map);

    // Event listeners
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (onCursorMove) {
        onCursorMove({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    map.on('mouseout', () => {
      if (onCursorMove) {
        onCursorMove(null);
      }
    });

    map.on('zoomend', () => {
      const z = map.getZoom();
      currentZoomRef.current = z;
      if (onZoomChange) onZoomChange(z);
      renderVesselsOrClusters();
      renderPortsOrClusters();
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      // Check if clicked directly on map canvas rather than marker
      const target = e.originalEvent.target as HTMLElement;
      if (target.classList.contains('leaflet-container') || target.tagName === 'CANVAS' || target.classList.contains('leaflet-tile')) {
        if (onDeselectVessel) {
          onDeselectVessel();
        }
      }
    });

    mapRef.current = map;
    if (onZoomChange) onZoomChange(4);

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      try {
        map.remove();
      } catch {
        // silent cleanup on unmount
      }
      mapRef.current = null;
    };
  }, []);

  // 2. Sync Theme
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const tileConfig = MapTilesService.getTileConfig(theme);
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [theme]);

  // 3. Layer Visibility sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncLayer = (visible: boolean, group: L.LayerGroup) => {
      if (visible && !map.hasLayer(group)) map.addLayer(group);
      if (!visible && map.hasLayer(group)) map.removeLayer(group);
    };

    syncLayer(layers.vessels, vesselGroupRef.current);
    syncLayer(layers.vessels, clusterGroupRef.current);
    syncLayer(layers.ports, portGroupRef.current);
    syncLayer(layers.ports, portClusterGroupRef.current);
    syncLayer(layers.terminals, terminalGroupRef.current);
    syncLayer(layers.waypoints, waypointGroupRef.current);
    syncLayer(layers.secaZones, secaGroupRef.current);
    syncLayer(layers.routes, routesGroupRef.current);
    syncLayer(showTrafficDensity, trafficDensityGroupRef.current);
  }, [layers, showTrafficDensity]);

  // 4. Render SECA Zones
  useEffect(() => {
    secaGroupRef.current.clearLayers();
    secaZones.forEach((z) => {
      const polygon = L.polygon(z.coordinates, {
        color: z.color,
        fillColor: z.color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6',
      });
      polygon.bindTooltip(
        `<div class="vmp-map-tooltip"><strong>${z.name}</strong><br/>Max Sulfur: ${z.sulfur_limit}<br/>Classification: ${z.type}</div>`,
        { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
      );
      secaGroupRef.current.addLayer(polygon);
    });
  }, [secaZones]);

  // 5. Render Waypoints / Choke Points
  useEffect(() => {
    waypointGroupRef.current.clearLayers();
    waypoints.forEach((w) => {
      const marker = L.marker([w.latitude, w.longitude], {
        icon: createWaypointMarkerIcon(w.name),
        zIndexOffset: 250,
      });
      marker.bindPopup(`
        <div class="vmp-hud-popup">
          <div class="vmp-popup-badge">${w.category}</div>
          <div class="vmp-popup-title">${w.name}</div>
          <div class="vmp-popup-desc">${w.description}</div>
          <div class="vmp-popup-geo">${w.latitude.toFixed(4)}° N, ${w.longitude.toFixed(4)}° E</div>
        </div>
      `);
      waypointGroupRef.current.addLayer(marker);
    });
  }, [waypoints]);

  // 6. Render Terminals
  useEffect(() => {
    terminalGroupRef.current.clearLayers();
    terminals.forEach((t) => {
      const marker = L.marker([t.latitude, t.longitude], {
        icon: createTerminalMarkerIcon(t.name),
        zIndexOffset: 200,
      });
      marker.bindPopup(`
        <div class="vmp-hud-popup">
          <div class="vmp-popup-badge">${t.terminal_type} Terminal</div>
          <div class="vmp-popup-title">${t.name}</div>
          <div class="vmp-popup-desc">${t.port_name}, ${t.country} &middot; Max Draft: ${t.max_draft_m}m &middot; Berths: ${t.berths}</div>
        </div>
      `);
      terminalGroupRef.current.addLayer(marker);
    });
  }, [terminals]);

  // 7. Render Major Ports with Intelligent Clustering
  const renderPortsOrClusters = useCallback(() => {
    portGroupRef.current.clearLayers();
    portClusterGroupRef.current.clearLayers();

    const validPorts = ports.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number' && !isNaN(p.latitude) && !isNaN(p.longitude)
    );

    const zoom = currentZoomRef.current;
    if (zoom < 5) {
      // Spatial grid binning (~10 degree bins)
      const clusters: { centerLat: number; centerLng: number; ports: Port[] }[] = [];
      validPorts.forEach((p) => {
        const binLat = Math.round(p.latitude! / 10) * 10;
        const binLng = Math.round(p.longitude! / 10) * 10;
        let cluster = clusters.find((c) => Math.hypot(c.centerLat - binLat, c.centerLng - binLng) < 8);
        if (!cluster) {
          cluster = { centerLat: binLat, centerLng: binLng, ports: [] };
          clusters.push(cluster);
        }
        cluster.ports.push(p);
      });

      clusters.forEach((c) => {
        const count = c.ports.length;
        if (count === 1) {
          const p = c.ports[0];
          const isSelected = p.id === selectedPortId;
          const marker = L.marker([p.latitude!, p.longitude!], {
            icon: createPortMarkerIcon(p.name, isSelected),
            zIndexOffset: isSelected ? 800 : 150,
          });
          marker.bindPopup(renderPortPopupHtml(p), { className: 'vmp-leaflet-popup-wrap' });
          marker.on('click', () => onSelectPort?.(p));
          portGroupRef.current.addLayer(marker);
        } else {
          const marker = L.marker([c.centerLat, c.centerLng], {
            icon: createPortClusterMarkerIcon(count),
            zIndexOffset: 450,
          });
          marker.on('click', () => {
            if (mapRef.current) {
              mapRef.current.flyTo([c.centerLat, c.centerLng], 6, { duration: 1.0 });
            }
          });
          marker.bindTooltip(
            `<div class="vmp-map-tooltip"><strong>⚓ ${count} COMMERCIAL PORTS</strong><br/>Click to zoom into maritime quadrant</div>`,
            { direction: 'top', offset: [0, -15], className: 'vmp-leaflet-tooltip-wrap' }
          );
          portClusterGroupRef.current.addLayer(marker);
        }
      });
    } else {
      // High Zoom: Individual interactive port markers
      validPorts.forEach((p) => {
        const isSelected = p.id === selectedPortId;
        const marker = L.marker([p.latitude!, p.longitude!], {
          icon: createPortMarkerIcon(p.name, isSelected),
          zIndexOffset: isSelected ? 800 : 150,
        });
        marker.bindTooltip(
          `<div class="vmp-map-tooltip"><strong>⚓ ${p.name}</strong> (${p.country || 'International'})<br/>UN/LOCODE: ${p.unlocode || 'N/A'}<br/>Type: ${p.port_type || 'Seaport'}</div>`,
          { direction: 'top', offset: [0, -10], className: 'vmp-leaflet-tooltip-wrap' }
        );
        marker.bindPopup(renderPortPopupHtml(p), { className: 'vmp-leaflet-popup-wrap' });
        marker.on('click', () => onSelectPort?.(p));
        portGroupRef.current.addLayer(marker);
      });
    }
  }, [ports, selectedPortId, onSelectPort]);

  useEffect(() => {
    renderPortsOrClusters();
  }, [renderPortsOrClusters]);

  // 8. Render Commercial Shipping Routes from Database
  useEffect(() => {
    if ((resolvedRoutes && resolvedRoutes.length > 0) || (module11Geometries && module11Geometries.length > 0)) {
      renderRoutesLayer(routesGroupRef.current, resolvedRoutes || [], module11Geometries);
    } else {
      routesGroupRef.current.clearLayers();
    }
  }, [resolvedRoutes, module11Geometries]);

  // 9. Traffic Density Layer (Requirement 16)
  useEffect(() => {
    trafficDensityGroupRef.current.clearLayers();
    if (!showTrafficDensity) return;

    // Build geographic density circles from loaded vessel positions
    const densityBins: { lat: number; lng: number; count: number; label: string }[] = [
      { lat: 1.25, lng: 103.82, count: 0, label: 'Singapore & Malacca Strait' },
      { lat: 26.56, lng: 56.25, count: 0, label: 'Strait of Hormuz' },
      { lat: 18.90, lng: 72.85, count: 0, label: 'Mumbai & Western India' },
      { lat: 23.41, lng: 37.15, count: 0, label: 'Red Sea Corridor' },
      { lat: 51.10, lng: 1.45, count: 0, label: 'English Channel & Dover' },
    ];

    vessels.forEach((v) => {
      densityBins.forEach((b) => {
        const dist = Math.hypot(v.latitude - b.lat, v.longitude - b.lng);
        if (dist < 12.0) {
          b.count += 1;
        }
      });
    });

    densityBins.forEach((b) => {
      const weight = Math.max(b.count, 1);
      const circle = L.circle([b.lat, b.lng], {
        radius: 120000 + weight * 40000,
        color: '#00f0ff',
        fillColor: '#00f0ff',
        fillOpacity: 0.18,
        weight: 1,
      });
      circle.bindTooltip(
        `<div class="vmp-map-tooltip"><strong>HIGH TRAFFIC REGION</strong><br/>${b.label}<br/>Active vessels in corridor: ${b.count}</div>`,
        { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
      );
      trafficDensityGroupRef.current.addLayer(circle);
    });
  }, [vessels, showTrafficDensity]);

  // 10. Update Vessel Animation Targets & State
  useEffect(() => {
    vessels.forEach((v) => {
      const existing = vesselAnimStatesRef.current.get(v.id);
      if (!existing) {
        vesselAnimStatesRef.current.set(v.id, {
          currentLat: v.latitude,
          currentLng: v.longitude,
          currentHeading: v.heading,
          targetLat: v.latitude,
          targetLng: v.longitude,
          targetHeading: v.heading,
          speedKnots: v.speed_knots,
          status: v.status,
          lastUpdated: performance.now(),
        });
      } else {
        // Update targets for smooth interpolation
        existing.targetLat = v.latitude;
        existing.targetLng = v.longitude;
        existing.targetHeading = v.heading;
        existing.speedKnots = v.speed_knots;
        existing.status = v.status;
      }
    });

    renderVesselsOrClusters();
  }, [vessels, selectedVesselId, mode, historicalPoints, historicalIndex]);

  // 11. Intelligent Clustering vs Individual Vessels (Requirement 11)
  const renderVesselsOrClusters = useCallback(() => {
    const zoom = currentZoomRef.current;
    const isClustered = zoom < 5 && mode === 'live';

    if (isClustered) {
      // Clear individual markers, show clusters
      vesselGroupRef.current.clearLayers();
      clusterGroupRef.current.clearLayers();

      // Spatial binning by geographic quadrants (~15 deg bins)
      const clusters: {
        centerLat: number;
        centerLng: number;
        vessels: VesselPosition[];
      }[] = [];

      vessels.forEach((v) => {
        const binLat = Math.round(v.latitude / 14) * 14;
        const binLng = Math.round(v.longitude / 14) * 14;

        let cluster = clusters.find(
          (c) => Math.hypot(c.centerLat - binLat, c.centerLng - binLng) < 12
        );

        if (!cluster) {
          cluster = { centerLat: binLat, centerLng: binLng, vessels: [] };
          clusters.push(cluster);
        }
        cluster.vessels.push(v);
      });

      clusters.forEach((c) => {
        const count = c.vessels.length;
        const marker = L.marker([c.centerLat, c.centerLng], {
          icon: createClusterMarkerIcon(count),
          zIndexOffset: 600,
        });

        marker.on('click', () => {
          if (mapRef.current) {
            mapRef.current.flyTo([c.centerLat, c.centerLng], 6, { duration: 1.0 });
          }
        });

        marker.bindTooltip(
          `<div class="vmp-map-tooltip"><strong>${count} VESSELS CLUSTERED</strong><br/>Click to zoom into maritime quadrant</div>`,
          { direction: 'top', offset: [0, -15], className: 'vmp-leaflet-tooltip-wrap' }
        );

        clusterGroupRef.current.addLayer(marker);
      });
    } else {
      // High Zoom: Individual Directional Vessels
      clusterGroupRef.current.clearLayers();

      if (mode === 'historical') {
        // Historical replay mode rendering
        renderHistoricalReplay();
      } else {
        // Live mode rendering with smooth animated markers
        renderIndividualVessels();
      }
    }
  }, [vessels, selectedVesselId, mode, historicalPoints, historicalIndex]);

  // Render individual vessels in Live Mode
  const renderIndividualVessels = () => {
    const existingIds = new Set(vessels.map((v) => v.id));

    // Remove obsolete markers
    markerInstancesRef.current.forEach((marker, id) => {
      if (!existingIds.has(id)) {
        vesselGroupRef.current.removeLayer(marker);
        markerInstancesRef.current.delete(id);
      }
    });

    // Create or update active markers
    vessels.forEach((v) => {
      const isSelected = v.id === selectedVesselId;
      const animState = vesselAnimStatesRef.current.get(v.id);
      const renderLat = animState ? animState.currentLat : v.latitude;
      const renderLng = animState ? animState.currentLng : v.longitude;

      let marker = markerInstancesRef.current.get(v.id);

      if (!marker) {
        marker = L.marker([renderLat, renderLng], {
          icon: createVesselMarkerIcon(v, isSelected, false),
          zIndexOffset: isSelected ? 1200 : 500,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectVessel(v.id);
        });

        marker.bindTooltip(
          `
          <div class="vmp-vessel-tooltip-box">
            <div class="vmp-tt-name">${v.name.replace(/^REFERENCE-/, '')}</div>
            <div class="vmp-tt-sub">${v.vessel_type} &middot; ${v.status.toUpperCase()}</div>
            <div class="vmp-tt-metrics">
              <span>SOG: <strong>${v.speed_knots.toFixed(1)} kn</strong></span>
              <span>HDG: <strong>${v.heading}°</strong></span>
            </div>
            <div class="vmp-tt-dest">Dest: <strong>${v.destination_port}</strong></div>
          </div>
        `,
          {
            direction: 'top',
            offset: [0, -20],
            className: 'vmp-leaflet-tooltip-wrap',
          }
        );

        vesselGroupRef.current.addLayer(marker);
        markerInstancesRef.current.set(v.id, marker);
      } else {
        // Update icon state (for selection, category, etc.)
        marker.setIcon(createVesselMarkerIcon(v, isSelected, false));
        marker.setZIndexOffset(isSelected ? 1200 : 500);
      }
    });

    // Render subtle movement trail for selected vessel (Requirement 4 & 14)
    renderSelectedVesselTrail();
  };

  // Render Historical Replay Mode
  const renderHistoricalReplay = () => {
    vesselGroupRef.current.clearLayers();
    historicalTrackGroupRef.current.clearLayers();
    selectedVesselTrailGroupRef.current.clearLayers();

    if (historicalPoints.length === 0) return;

    // Completed track
    const completedCoords: [number, number][] = historicalPoints
      .slice(0, historicalIndex + 1)
      .map((p) => [p.latitude, p.longitude]);

    if (completedCoords.length > 1) {
      const completedTrack = L.polyline(completedCoords, {
        color: '#a855f7',
        weight: 3.5,
        opacity: 0.85,
      });
      historicalTrackGroupRef.current.addLayer(completedTrack);
    }

    // Remaining track
    const remainingCoords: [number, number][] = historicalPoints
      .slice(historicalIndex)
      .map((p) => [p.latitude, p.longitude]);

    if (remainingCoords.length > 1) {
      const remainingTrack = L.polyline(remainingCoords, {
        color: '#a855f7',
        weight: 2,
        opacity: 0.35,
        dashArray: '4, 6',
      });
      historicalTrackGroupRef.current.addLayer(remainingTrack);
    }

    // Current historical vessel
    const currentPoint = historicalPoints[historicalIndex] || historicalPoints[0];
    const selectedVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

    if (selectedVessel) {
      const histVesselState: VesselPosition = {
        ...selectedVessel,
        latitude: currentPoint.latitude,
        longitude: currentPoint.longitude,
        heading: currentPoint.heading,
        speed_knots: currentPoint.speed_knots,
        status: currentPoint.status,
        draft_m: currentPoint.draft_m,
      };

      const marker = L.marker([currentPoint.latitude, currentPoint.longitude], {
        icon: createVesselMarkerIcon(histVesselState, true, true),
        zIndexOffset: 1400,
      });

      marker.bindTooltip(
        `<div class="vmp-map-tooltip"><strong>${selectedVessel.name}</strong> (Historical Replay)<br/>Speed: ${currentPoint.speed_knots.toFixed(1)} kn &middot; Heading: ${currentPoint.heading}°</div>`,
        { direction: 'top', offset: [0, -20], className: 'vmp-leaflet-tooltip-wrap' }
      );

      historicalTrackGroupRef.current.addLayer(marker);
    }
  };

  // Render Selected Vessel Subtle Trail & Projected Heading Line (Requirements 4 & 14)
  const renderSelectedVesselTrail = () => {
    selectedVesselTrailGroupRef.current.clearLayers();
    if (!selectedVesselId) return;

    const v = vessels.find((x) => x.id === selectedVesselId);
    if (!v) return;

    const animState = vesselAnimStatesRef.current.get(v.id);
    const curLat = animState ? animState.currentLat : v.latitude;
    const curLng = animState ? animState.currentLng : v.longitude;
    const heading = animState ? animState.currentHeading : v.heading;

    // 1. Maintain subtle recent movement history trail (max 6 points)
    let history = selectedTrailCoordsRef.current.get(v.id) || [];
    const lastCoord = history[history.length - 1];
    if (!lastCoord || Math.hypot(lastCoord[0] - curLat, lastCoord[1] - curLng) > 0.005) {
      history.push([curLat, curLng]);
      if (history.length > 8) history.shift();
      selectedTrailCoordsRef.current.set(v.id, history);
    }

    if (history.length > 1) {
      const trail = L.polyline(history, {
        color: '#00f0ff',
        weight: 2,
        opacity: 0.5,
        dashArray: '4, 6',
      });
      selectedVesselTrailGroupRef.current.addLayer(trail);
    }

    // 2. Projected Heading Vector (direction of movement ahead)
    if (v.speed_knots > 0) {
      const headingRad = (heading * Math.PI) / 180;
      const aheadDist = 0.6; // ~36 nautical miles vector line ahead
      const aheadLat = curLat + Math.cos(headingRad) * aheadDist;
      const aheadLng = curLng + (Math.sin(headingRad) * aheadDist) / Math.cos((curLat * Math.PI) / 180);

      const vectorLine = L.polyline(
        [
          [curLat, curLng],
          [aheadLat, aheadLng],
        ],
        {
          color: '#00f0ff',
          weight: 2,
          opacity: 0.8,
        }
      );
      selectedVesselTrailGroupRef.current.addLayer(vectorLine);
    }
  };

  // 12. CONTINUOUS LIVE MOVEMENT INTERPOLATION & GLIDE LOOP (Requirements 4 & 28)
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.2); // seconds, capped to avoid huge jumps
      lastTime = now;

      // Update positions for active underway vessels smoothly
      vesselAnimStatesRef.current.forEach((state, id) => {
        // 1. Target interpolation (smoothing toward target telemetry)
        const lerpFactor = Math.min(dt * 3.0, 1.0);
        state.currentLat += (state.targetLat - state.currentLat) * lerpFactor;
        state.currentLng += (state.targetLng - state.currentLng) * lerpFactor;

        // Heading angle interpolation (handling 360 wrap)
        let diffHeading = state.targetHeading - state.currentHeading;
        while (diffHeading > 180) diffHeading -= 360;
        while (diffHeading < -180) diffHeading += 360;
        state.currentHeading = (state.currentHeading + diffHeading * lerpFactor + 360) % 360;

        // 2. Real-time visual glide for underway vessels (Requirement 28)
        // At speedKnots, ship glides smoothly along its heading vector
        const isUnderway = state.status.toLowerCase().includes('underway');
        if (isUnderway && state.speedKnots > 0) {
          const headingRad = (state.currentHeading * Math.PI) / 180;
          // Smooth visual velocity scale (approx 0.00008 deg/sec scaled by speed)
          const velocityDeg = 0.00004 * (state.speedKnots / 14) * dt;
          const deltaLat = Math.cos(headingRad) * velocityDeg;
          const deltaLng = (Math.sin(headingRad) * velocityDeg) / Math.cos((state.currentLat * Math.PI) / 180);

          state.currentLat += deltaLat;
          state.currentLng += deltaLng;
          state.targetLat += deltaLat;
          state.targetLng += deltaLng;
        }

        // Apply updated position directly to Leaflet Marker DOM element
        const marker = markerInstancesRef.current.get(id);
        if (marker && currentZoomRef.current >= 5) {
          marker.setLatLng([state.currentLat, state.currentLng]);

          // Update rotation of ship hull SVG
          const el = marker.getElement();
          if (el) {
            const hull = el.querySelector('.vmp-ship-hull') as HTMLElement | null;
            if (hull) {
              hull.style.transform = `rotate(${Math.round(state.currentHeading)}deg)`;
            }
            const ray = el.querySelector('.vmp-heading-vector-ray') as HTMLElement | null;
            if (ray) {
              ray.style.transform = `rotate(${Math.round(state.currentHeading)}deg)`;
            }
          }
        }
      });

      // Update selected vessel trail periodically
      if (selectedVesselId && Math.random() < 0.2) {
        renderSelectedVesselTrail();
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [selectedVesselId]);

  // 13. Smooth Pan/Fly to Selected Vessel (Requirement 14)
  useEffect(() => {
    if (!mapRef.current || !selectedVesselId) return;

    if (mode === 'historical' && historicalPoints[historicalIndex]) {
      const p = historicalPoints[historicalIndex];
      mapRef.current.panTo([p.latitude, p.longitude], { animate: true });
    } else {
      const vessel = vessels.find((v) => v.id === selectedVesselId);
      if (vessel) {
        const animState = vesselAnimStatesRef.current.get(vessel.id);
        const lat = animState ? animState.currentLat : vessel.latitude;
        const lng = animState ? animState.currentLng : vessel.longitude;
        mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 6), {
          duration: 1.2,
        });
      }
    }
  }, [selectedVesselId]);

  return (
    <div
      className="vmp-canvas-container"
      ref={containerRef}
      aria-label="OceanLens Real-Time Maritime Operations Map"
    />
  );
}
