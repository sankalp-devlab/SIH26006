import L from 'leaflet';
import type { ResolvedRoute } from '../../../hooks/useMapData';
import type { VesselPosition } from '../../../types/map';
import { createDestinationMarkerIcon } from './VesselMarker';

export interface RouteGeometry {
  routeId: number | string;
  originName: string;
  originCoords?: [number, number]; // [lat, lng]
  destinationName: string;
  destinationCoords?: [number, number]; // [lat, lng]
  path?: [number, number][]; // Multi-point geometry polyline
  distanceKm?: number | null;
  estimatedDurationHours?: number | null;
  status?: string;
  color?: string;
}

/**
 * Calculates bearing angle in degrees from coord 1 to coord 2.
 */
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Renders real backend commercial routes onto a dedicated Leaflet LayerGroup.
 * Implements sophisticated route hierarchy:
 * - Active / selected vessel route is highlighted with bright cyan, glow halo, and animated flow.
 * - Inactive routes are subdued with thin strokes, lower opacity, and subtle dashes.
 * - Preserves authentic coordinates with 0 fake data.
 */
export function renderRoutesLayer(
  layerGroup: L.LayerGroup,
  resolvedRoutes: ResolvedRoute[],
  module11Geometries?: RouteGeometry[],
  selectedVessel?: VesselPosition | null
): void {
  layerGroup.clearLayers();

  // Helper to test if a route belongs to the selected vessel
  const isVesselRoute = (originName: string, destName: string): boolean => {
    if (!selectedVessel) return false;
    const dest = (selectedVessel.destination_port || '').toLowerCase().trim();
    const orig = (selectedVessel.origin_port || '').toLowerCase().trim();

    const o = originName.toLowerCase().trim();
    const d = destName.toLowerCase().trim();

    if (dest && dest !== 'awaiting orders' && dest !== 'tbd') {
      if (d.includes(dest) || dest.includes(d)) return true;
    }
    if (orig && orig !== 'not assigned') {
      if (o.includes(orig) || orig.includes(o)) return true;
    }
    return false;
  };

  // 1. Render custom Module 11 algorithmic geometries if present
  if (module11Geometries && module11Geometries.length > 0) {
    module11Geometries.forEach((geom) => {
      if (geom.path && geom.path.length > 1) {
        const isSelected = isVesselRoute(geom.originName, geom.destinationName);

        if (isSelected) {
          // Glow halo
          const halo = L.polyline(geom.path, {
            color: '#00f0ff',
            weight: 6,
            opacity: 0.25,
          });
          layerGroup.addLayer(halo);
        }

        const line = L.polyline(geom.path, {
          color: isSelected ? '#00f0ff' : geom.color || '#38bdf8',
          weight: isSelected ? 2.8 : 1.4,
          opacity: isSelected ? 0.95 : selectedVessel ? 0.22 : 0.45,
          dashArray: isSelected ? '6, 8' : '4, 8',
          className: isSelected ? 'vmp-active-route-line' : 'vmp-inactive-route-line',
        });

        line.bindTooltip(
          `
          <div class="vmp-hud-popup">
            <div class="vmp-popup-badge ${isSelected ? 'vmp-badge-vessel' : ''}">Commercial Corridor</div>
            <div class="vmp-popup-title">${escapeHtml(geom.originName)} → ${escapeHtml(geom.destinationName)}</div>
            <div class="vmp-popup-desc">
              <div>Distance: <strong>${geom.distanceKm ? `${geom.distanceKm.toLocaleString()} km` : 'Calculated'}</strong></div>
              <div>ETA: <strong>${geom.estimatedDurationHours ? `${geom.estimatedDurationHours} hrs` : 'N/A'}</strong></div>
            </div>
          </div>
        `,
          { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
        );

        layerGroup.addLayer(line);
      }
    });
  }

  // 2. Render real database routes from /routes API
  resolvedRoutes.forEach((route) => {
    if (!route.hasValidCoordinates) {
      return;
    }

    const originLat = route.originPort?.latitude;
    const originLng = route.originPort?.longitude;
    const destLat = route.destinationPort?.latitude;
    const destLng = route.destinationPort?.longitude;

    if (
      typeof originLat !== 'number' ||
      typeof originLng !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLng !== 'number'
    ) {
      return;
    }

    const originName = route.originPort?.name || `Port #${route.origin_port_id}`;
    const destName = route.destinationPort?.name || `Port #${route.destination_port_id}`;
    const isSelected = isVesselRoute(originName, destName);

    const corridorCoords: [number, number][] = [
      [originLat, originLng],
      [destLat, destLng],
    ];

    if (isSelected) {
      // Glow underlayer
      const halo = L.polyline(corridorCoords, {
        color: '#00f0ff',
        weight: 6.5,
        opacity: 0.28,
      });
      layerGroup.addLayer(halo);

      // Primary selected route line with animated dash flow
      const activeLine = L.polyline(corridorCoords, {
        color: '#00f0ff',
        weight: 2.8,
        opacity: 0.95,
        dashArray: '8, 8',
        className: 'vmp-active-route-line',
      });

      // Direction indicator arrow at midpoint
      const midLat = (originLat + destLat) / 2;
      const midLng = (originLng + destLng) / 2;
      const bearing = Math.round(calculateBearing(originLat, originLng, destLat, destLng));

      const directionMarker = L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: 'vmp-leaflet-route-direction-icon',
          html: `
            <div class="vmp-route-arrow-wrap" style="transform: rotate(${bearing}deg);" title="Route Flow Bearing: ${bearing}°">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        zIndexOffset: 350,
      });

      // Origin ring
      const originRing = L.circleMarker([originLat, originLng], {
        radius: 6,
        color: '#00f0ff',
        fillColor: '#00f0ff',
        fillOpacity: 0.5,
        weight: 2,
      });

      // Prominent floating Destination Callout Card
      const destCallout = L.marker([destLat, destLng], {
        icon: createDestinationMarkerIcon(destName),
        zIndexOffset: 700,
      });

      activeLine.bindTooltip(
        `
        <div class="vmp-hud-popup">
          <div class="vmp-popup-badge vmp-badge-vessel">ACTIVE VOYAGE CORRIDOR #${route.id}</div>
          <div class="vmp-popup-title">⚓ ${escapeHtml(originName)} → ⚓ ${escapeHtml(destName)}</div>
          <div class="vmp-popup-desc">
            <div>Reported Distance: <strong>${route.distance_km ? `${route.distance_km.toLocaleString()} km` : 'N/A'}</strong></div>
            <div>Estimated Duration: <strong>${route.estimated_duration_hours ? `${route.estimated_duration_hours} hrs` : 'N/A'}</strong></div>
            <div>Corridor Status: <strong style="color: #10b981;">${route.route_status}</strong></div>
          </div>
        </div>
      `,
        { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
      );

      layerGroup.addLayer(activeLine);
      layerGroup.addLayer(directionMarker);
      layerGroup.addLayer(originRing);
      layerGroup.addLayer(destCallout);
    } else {
      // Inactive corridor line: thin, muted, non-dominant
      const inactiveLine = L.polyline(corridorCoords, {
        color: '#38bdf8',
        weight: 1.4,
        opacity: selectedVessel ? 0.2 : 0.4,
        dashArray: '4, 8',
        className: 'vmp-inactive-route-line',
      });

      const originLabel = `${originName} (${route.originPort?.country || 'Origin'})`;
      const destLabel = `${destName} (${route.destinationPort?.country || 'Destination'})`;

      inactiveLine.bindTooltip(
        `
        <div class="vmp-hud-popup">
          <div class="vmp-popup-badge">Commercial Corridor #${route.id}</div>
          <div class="vmp-popup-title">⚓ ${escapeHtml(originLabel)} → ⚓ ${escapeHtml(destLabel)}</div>
          <div class="vmp-popup-desc">
            <div>Reported Distance: <strong>${route.distance_km ? `${route.distance_km.toLocaleString()} km` : 'N/A'}</strong></div>
            <div>Estimated Duration: <strong>${route.estimated_duration_hours ? `${route.estimated_duration_hours} hrs` : 'N/A'}</strong></div>
            <div>Status: <strong style="color: #38bdf8;">${route.route_status}</strong></div>
          </div>
        </div>
      `,
        { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
      );

      const originHalo = L.circleMarker([originLat, originLng], {
        radius: 4,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.3,
        weight: 1.2,
      });

      const destHalo = L.circleMarker([destLat, destLng], {
        radius: 4,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.3,
        weight: 1.2,
      });

      layerGroup.addLayer(inactiveLine);
      layerGroup.addLayer(originHalo);
      layerGroup.addLayer(destHalo);
    }
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
