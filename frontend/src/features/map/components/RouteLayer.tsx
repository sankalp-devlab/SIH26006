import L from 'leaflet';
import type { ResolvedRoute } from '../../../hooks/useMapData';

export interface RouteGeometry {
  routeId: number | string;
  originName: string;
  originCoords?: [number, number]; // [lat, lng]
  destinationName: string;
  destinationCoords?: [number, number]; // [lat, lng]
  path?: [number, number][]; // Multi-point geometry polyline (Module 11 integration point)
  distanceKm?: number | null;
  estimatedDurationHours?: number | null;
  status?: string;
  color?: string;
}

/**
 * Renders real backend commercial routes onto a dedicated Leaflet LayerGroup.
 * Adheres strictly to data integrity: Only renders when valid coordinates exist.
 * Reusable foundation for Module 11 algorithmic route geometry.
 */
export function renderRoutesLayer(
  layerGroup: L.LayerGroup,
  resolvedRoutes: ResolvedRoute[],
  module11Geometries?: RouteGeometry[]
): void {
  layerGroup.clearLayers();

  // 1. Render custom Module 11 geometries if provided
  if (module11Geometries && module11Geometries.length > 0) {
    module11Geometries.forEach((geom) => {
      if (geom.path && geom.path.length > 1) {
        const line = L.polyline(geom.path, {
          color: geom.color || '#00D9FF',
          weight: 2.5,
          opacity: 0.8,
          dashArray: '6, 8',
        });

        line.bindTooltip(
          `
          <div class="vmp-hud-popup">
            <div class="vmp-popup-badge">Commercial Route Corridor</div>
            <div class="vmp-popup-title">${escapeHtml(geom.originName)} → ${escapeHtml(geom.destinationName)}</div>
            <div class="vmp-popup-desc">
              <div>Distance: <strong>${geom.distanceKm ? `${geom.distanceKm} km` : 'Calculated'}</strong></div>
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
      // Gracefully skip routes that lack coordinates in either port - DO NOT invent coordinates
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

    const corridorCoords: [number, number][] = [
      [originLat, originLng],
      [destLat, destLng],
    ];

    // Maritime transit corridor line
    const polyline = L.polyline(corridorCoords, {
      color: '#00D9FF',
      weight: 2.2,
      opacity: 0.65,
      dashArray: '5, 8',
    });

    const originLabel = `${route.originPort?.name || 'Port #' + route.origin_port_id} (${route.originPort?.country || 'Origin'})`;
    const destLabel = `${route.destinationPort?.name || 'Port #' + route.destination_port_id} (${route.destinationPort?.country || 'Destination'})`;

    polyline.bindTooltip(
      `
      <div class="vmp-hud-popup">
        <div class="vmp-popup-badge">Commercial Route #${route.id}</div>
        <div class="vmp-popup-title">⚓ ${escapeHtml(originLabel)} → ⚓ ${escapeHtml(destLabel)}</div>
        <div class="vmp-popup-desc">
          <div>Reported Distance: <strong>${route.distance_km ? `${route.distance_km.toLocaleString()} km` : 'N/A'}</strong></div>
          <div>Estimated Duration: <strong>${route.estimated_duration_hours ? `${route.estimated_duration_hours} hrs` : 'N/A'}</strong></div>
          <div>Status: <strong class="text-emerald-400">${route.route_status}</strong></div>
        </div>
      </div>
    `,
      { sticky: true, className: 'vmp-leaflet-tooltip-wrap' }
    );

    // Subtle origin and destination anchor glow rings
    const originHalo = L.circleMarker([originLat, originLng], {
      radius: 6,
      color: '#00D9FF',
      fillColor: '#00D9FF',
      fillOpacity: 0.4,
      weight: 1.5,
    });

    const destHalo = L.circleMarker([destLat, destLng], {
      radius: 6,
      color: '#20C98A',
      fillColor: '#20C98A',
      fillOpacity: 0.4,
      weight: 1.5,
    });

    layerGroup.addLayer(polyline);
    layerGroup.addLayer(originHalo);
    layerGroup.addLayer(destHalo);
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
