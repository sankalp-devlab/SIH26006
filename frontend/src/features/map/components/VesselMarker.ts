import L from 'leaflet';
import type { VesselPosition } from '../../../types/map';

export type VesselCategoryKey =
  | 'container'
  | 'tanker'
  | 'bulk carrier'
  | 'lng/lpg'
  | 'ro-ro'
  | 'passenger'
  | 'other';

export interface VesselCategoryStyle {
  label: string;
  stroke: string;
  fill: string;
  glow: string;
}

export const VESSEL_CATEGORY_STYLES: Record<VesselCategoryKey, VesselCategoryStyle> = {
  container: {
    label: 'Container',
    stroke: '#00f0ff', // Vivid Cyan
    fill: 'rgba(0, 240, 255, 0.28)',
    glow: 'rgba(0, 240, 255, 0.35)',
  },
  tanker: {
    label: 'Tanker',
    stroke: '#38bdf8', // Electric Sky Blue
    fill: 'rgba(56, 189, 248, 0.28)',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  'bulk carrier': {
    label: 'Bulk Carrier',
    stroke: '#2dd4bf', // Maritime Teal
    fill: 'rgba(45, 212, 191, 0.28)',
    glow: 'rgba(45, 212, 191, 0.35)',
  },
  'lng/lpg': {
    label: 'LNG / LPG',
    stroke: '#818cf8', // Indigo / Blue-violet
    fill: 'rgba(129, 140, 248, 0.28)',
    glow: 'rgba(129, 140, 248, 0.35)',
  },
  'ro-ro': {
    label: 'Ro-Ro',
    stroke: '#f59e0b', // Maritime Amber
    fill: 'rgba(245, 158, 11, 0.28)',
    glow: 'rgba(245, 158, 11, 0.35)',
  },
  passenger: {
    label: 'Passenger',
    stroke: '#c084fc', // Soft Violet
    fill: 'rgba(192, 132, 252, 0.28)',
    glow: 'rgba(192, 132, 252, 0.35)',
  },
  other: {
    label: 'Other',
    stroke: '#94a3b8', // Slate / Steel
    fill: 'rgba(148, 163, 184, 0.25)',
    glow: 'rgba(148, 163, 184, 0.25)',
  },
};

export function getVesselCategoryKey(vesselType: string = ''): VesselCategoryKey {
  const t = vesselType.toLowerCase();
  if (t.includes('container')) return 'container';
  if (t.includes('tanker') || t.includes('crude') || t.includes('oil') || t.includes('chemical') || t.includes('product')) return 'tanker';
  if (t.includes('bulk') || t.includes('ore') || t.includes('grain') || t.includes('capesize') || t.includes('panamax') || t.includes('supramax') || t.includes('handysize')) return 'bulk carrier';
  if (t.includes('lng') || t.includes('lpg') || t.includes('gas')) return 'lng/lpg';
  if (t.includes('ro-ro') || t.includes('vehicle') || t.includes('roro')) return 'ro-ro';
  if (t.includes('passenger') || t.includes('cruise') || t.includes('ferry')) return 'passenger';
  return 'other';
}

export type TelemetryStatus = 'live' | 'recent' | 'stale' | 'unavailable';

/**
 * Derives authentic telemetry status based strictly on existing vessel fields.
 */
export function getVesselTelemetryStatus(vessel: VesselPosition): TelemetryStatus {
  const s = (vessel.status || '').toLowerCase();
  const lu = (vessel.last_updated || '').toLowerCase();

  if (lu.includes('live') || (s.includes('underway') && vessel.speed_knots > 0.5)) {
    return 'live';
  }
  if (s.includes('underway') || s.includes('anchor') || s.includes('moor') || lu.includes('today') || lu.includes('min') || lu.includes('ais')) {
    return 'recent';
  }
  if (s.includes('stale') || lu.includes('reference') || lu.includes('spec') || lu.includes('no ais')) {
    return 'stale';
  }
  return 'unavailable';
}

/**
 * Creates a directional ship-shaped SVG marker oriented to the vessel's heading (0-360 deg)
 * with semantic telemetry indicator dot, category styling, and dedicated focal-point selection ring.
 */
export function createVesselMarkerIcon(
  vessel: VesselPosition,
  isSelected: boolean = false,
  isHistorical: boolean = false
): L.DivIcon {
  const heading = Math.round(vessel.heading || 0);
  const catKey = getVesselCategoryKey(vessel.vessel_type);
  const style = VESSEL_CATEGORY_STYLES[catKey];
  const telemetry = getVesselTelemetryStatus(vessel);

  // Semantic stroke & fill colors
  let strokeColor = isSelected ? '#00f0ff' : isHistorical ? '#a855f7' : style.stroke;
  let fillColor = isSelected ? 'rgba(0, 240, 255, 0.45)' : isHistorical ? 'rgba(168, 85, 247, 0.4)' : style.fill;

  if (!isSelected && !isHistorical) {
    if (telemetry === 'stale') {
      strokeColor = '#f59e0b';
      fillColor = 'rgba(245, 158, 11, 0.28)';
    } else if (telemetry === 'unavailable') {
      strokeColor = '#64748b';
      fillColor = 'rgba(100, 116, 139, 0.22)';
    }
  }

  const displayName = vessel.name.replace(/^REFERENCE-/, '');

  // Telemetry status indicator dot
  const statusDotHtml = `
    <span class="vmp-telemetry-dot is-${telemetry}" title="Telemetry: ${telemetry.toUpperCase()}"></span>
  `;

  // Selected Vessel Aura & Forward Direction Ray
  const selectedElements = isSelected
    ? `
      <div class="vmp-selected-reticle"></div>
      <div class="vmp-selected-radar-pulse"></div>
      <div class="vmp-heading-vector-ray" style="transform: rotate(${heading}deg);"></div>
    `
    : '';

  const html = `
    <div class="vmp-vessel-marker ${isSelected ? 'is-selected' : ''} is-${telemetry}" data-vessel-id="${vessel.id}">
      ${selectedElements}
      ${statusDotHtml}
      <div class="vmp-ship-hull" style="transform: rotate(${heading}deg);">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Directional Ship Silhouette (Pointed Bow, Tapered Beam, Transom) -->
          <path
            d="M16 3 C17.8 7.5, 23.5 16, 23 25 C23 26.5, 20.8 28, 16 28 C11.2 28, 9 26.5, 9 25 C8.5 16, 14.2 7.5, 16 3 Z"
            fill="${fillColor}"
            stroke="${strokeColor}"
            stroke-width="${isSelected ? '2.4' : '1.6'}"
            stroke-linejoin="round"
          />
          <!-- Superstructure / Bridge Island -->
          <rect x="13.2" y="18.5" width="5.6" height="4.5" rx="1" fill="#ffffff" opacity="0.9" />
          <!-- Keel Centerline / Mast -->
          <line x1="16" y1="6.5" x2="16" y2="15.5" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </div>
      <div class="vmp-marker-callout ${isSelected ? 'is-visible' : ''}">
        <span class="vmp-callout-name">${displayName}</span>
        <span class="vmp-callout-sog">${vessel.speed_knots.toFixed(1)} kn</span>
      </div>
    </div>
  `;

  const size = isSelected ? 40 : 34;
  const anchor = isSelected ? 20 : 17;

  return L.divIcon({
    className: 'vmp-leaflet-vessel-div-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

/**
 * Creates an intelligent circular maritime cluster indicator for dense vessel areas.
 * Fixes "1 VESSELS" bug by using singular "VESSEL" when count is 1.
 */
export function createClusterMarkerIcon(count: number, _categoryBreakdown?: string): L.DivIcon {
  const formattedCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
  const tagText = count === 1 ? 'VESSEL' : 'VESSELS';

  const html = `
    <div class="vmp-cluster-node ${count === 1 ? 'is-single' : 'is-multi'}" title="${count} ${tagText.toLowerCase()} in this maritime zone">
      <div class="vmp-cluster-pulse"></div>
      <div class="vmp-cluster-badge">
        <span class="vmp-cluster-num">${formattedCount}</span>
        <span class="vmp-cluster-tag">${tagText}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-cluster-div-icon',
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * Creates an aggregated cluster marker for dense ports at low zoom levels.
 */
export function createPortClusterMarkerIcon(count: number): L.DivIcon {
  const formattedCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
  const tagText = count === 1 ? 'PORT' : 'PORTS';

  const html = `
    <div class="vmp-cluster-node vmp-port-cluster-node" title="${count} commercial ${tagText.toLowerCase()} in this region">
      <div class="vmp-cluster-pulse vmp-port-pulse"></div>
      <div class="vmp-cluster-badge vmp-port-cluster-badge">
        <span class="vmp-cluster-num">⚓ ${formattedCount}</span>
        <span class="vmp-cluster-tag">${tagText}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-cluster-div-icon vmp-port-cluster-icon',
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * Creates a subtle maritime commercial port marker with consistent anchor symbol.
 */
export function createPortMarkerIcon(name: string, isSelected: boolean = false): L.DivIcon {
  const html = `
    <div class="vmp-port-node ${isSelected ? 'is-selected' : ''}" title="Commercial Port: ${name}">
      <span class="vmp-port-anchor-sym">⚓</span>
      <span class="vmp-port-tag">${name}</span>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-port-div-icon',
    html,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/**
 * Creates a prominent floating destination callout card for active vessel voyage destinations.
 */
export function createDestinationMarkerIcon(name: string): L.DivIcon {
  const html = `
    <div class="vmp-destination-node" title="Voyage Destination: ${name}">
      <div class="vmp-dest-card">
        <span class="vmp-dest-badge">DESTINATION</span>
        <span class="vmp-dest-name">${name}</span>
      </div>
      <div class="vmp-dest-pin">
        <span class="vmp-dest-dot"></span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-destination-div-icon',
    html,
    iconSize: [140, 48],
    iconAnchor: [70, 48],
  });
}

/**
 * Creates a terminal node marker.
 */
export function createTerminalMarkerIcon(name: string): L.DivIcon {
  const html = `
    <div class="vmp-terminal-node" title="Terminal: ${name}">
      <div class="vmp-terminal-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'vmp-leaflet-terminal-div-icon',
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/**
 * Creates a strategic maritime chokepoint annotation with amber beacon dot,
 * translucent dark pill background, and thin border.
 */
export function createWaypointMarkerIcon(name: string): L.DivIcon {
  const html = `
    <div class="vmp-chokepoint-node" title="Strategic Maritime Chokepoint: ${name}">
      <span class="vmp-chokepoint-beacon"></span>
      <span class="vmp-chokepoint-label">${name.toUpperCase()}</span>
    </div>
  `;
  return L.divIcon({
    className: 'vmp-leaflet-waypoint-div-icon',
    html,
    iconSize: [120, 22],
    iconAnchor: [8, 11],
  });
}
