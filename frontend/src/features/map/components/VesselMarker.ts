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
    fill: 'rgba(0, 240, 255, 0.35)',
    glow: 'rgba(0, 240, 255, 0.4)',
  },
  tanker: {
    label: 'Tanker',
    stroke: '#3b82f6', // Electric Blue
    fill: 'rgba(59, 130, 246, 0.35)',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  'bulk carrier': {
    label: 'Bulk Carrier',
    stroke: '#14b8a6', // Maritime Teal
    fill: 'rgba(20, 184, 166, 0.35)',
    glow: 'rgba(20, 184, 166, 0.4)',
  },
  'lng/lpg': {
    label: 'LNG / LPG',
    stroke: '#818cf8', // Indigo / Blue-violet
    fill: 'rgba(129, 140, 248, 0.35)',
    glow: 'rgba(129, 140, 248, 0.4)',
  },
  'ro-ro': {
    label: 'Ro-Ro',
    stroke: '#f59e0b', // Subtle Amber
    fill: 'rgba(245, 158, 11, 0.35)',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  passenger: {
    label: 'Passenger',
    stroke: '#c084fc', // Soft Violet
    fill: 'rgba(192, 132, 252, 0.35)',
    glow: 'rgba(192, 132, 252, 0.4)',
  },
  other: {
    label: 'Other',
    stroke: '#94a3b8', // Steel Blue / Slate
    fill: 'rgba(148, 163, 184, 0.35)',
    glow: 'rgba(148, 163, 184, 0.3)',
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

/**
 * Creates a directional ship-shaped SVG marker oriented to the vessel's heading (0-360 deg)
 * with category color coding and active selection aura.
 */
export function createVesselMarkerIcon(
  vessel: VesselPosition,
  isSelected: boolean = false,
  isHistorical: boolean = false
): L.DivIcon {
  const heading = Math.round(vessel.heading || 0);
  const catKey = getVesselCategoryKey(vessel.vessel_type);
  const style = VESSEL_CATEGORY_STYLES[catKey];

  const strokeColor = isSelected ? '#00f0ff' : isHistorical ? '#a855f7' : style.stroke;
  const fillColor = isSelected ? 'rgba(0, 240, 255, 0.6)' : isHistorical ? 'rgba(168, 85, 247, 0.5)' : style.fill;

  const displayName = vessel.name.replace(/^REFERENCE-/, '');

  const selectedRings = isSelected
    ? `
      <div class="vmp-selected-radar-pulse"></div>
      <div class="vmp-selected-glow-aura"></div>
      <div class="vmp-heading-vector-ray" style="transform: rotate(${heading}deg);"></div>
    `
    : '';

  const html = `
    <div class="vmp-vessel-marker ${isSelected ? 'is-selected' : ''}" data-vessel-id="${vessel.id}">
      ${selectedRings}
      <div class="vmp-ship-hull" style="transform: rotate(${heading}deg);">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Sleek Ship Silhouette (Pointed Bow, Tapered Beam, Square Transom) -->
          <path
            d="M16 2.5 C17.5 7, 24 16, 23.5 25.5 C23.5 27, 21.5 28.5, 16 28.5 C10.5 28.5, 8.5 27, 8.5 25.5 C8 16, 14.5 7, 16 2.5 Z"
            fill="${fillColor}"
            stroke="${strokeColor}"
            stroke-width="${isSelected ? '2.2' : '1.6'}"
            stroke-linejoin="round"
          />
          <!-- Superstructure / Bridge -->
          <rect x="13" y="19" width="6" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
          <!-- Centerline Keel / Radar Mast -->
          <line x1="16" y1="6" x2="16" y2="15" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </div>
      <div class="vmp-marker-callout ${isSelected ? 'is-visible' : ''}">
        <span class="vmp-callout-name">${displayName}</span>
        <span class="vmp-callout-sog">${vessel.speed_knots.toFixed(1)} kn</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-vessel-div-icon',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/**
 * Creates an intelligent cluster marker for low zoom levels
 */
export function createClusterMarkerIcon(count: number, _categoryBreakdown?: string): L.DivIcon {
  const formattedCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;

  const html = `
    <div class="vmp-cluster-node" title="${count} vessels in this maritime zone">
      <div class="vmp-cluster-pulse"></div>
      <div class="vmp-cluster-badge">
        <span class="vmp-cluster-num">${formattedCount}</span>
        <span class="vmp-cluster-tag">VESSELS</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-cluster-div-icon',
    html,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

/**
 * Creates an aggregated cluster marker for dense ports at low zoom levels
 */
export function createPortClusterMarkerIcon(count: number): L.DivIcon {
  const formattedCount = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;

  const html = `
    <div class="vmp-cluster-node vmp-port-cluster-node" title="${count} commercial ports in this region">
      <div class="vmp-cluster-pulse vmp-port-pulse"></div>
      <div class="vmp-cluster-badge vmp-port-cluster-badge">
        <span class="vmp-cluster-num">⚓ ${formattedCount}</span>
        <span class="vmp-cluster-tag">PORTS</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-cluster-div-icon vmp-port-cluster-icon',
    html,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
}

/**
 * Creates a subtle maritime port marker
 */
export function createPortMarkerIcon(name: string, isSelected: boolean = false): L.DivIcon {
  const html = `
    <div class="vmp-port-node ${isSelected ? 'is-selected' : ''}" title="Port: ${name}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"></circle>
        <line x1="12" y1="22" x2="12" y2="8"></line>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
      </svg>
      <span class="vmp-port-tag">${name}</span>
    </div>
  `;

  return L.divIcon({
    className: 'vmp-leaflet-port-div-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function createTerminalMarkerIcon(name: string): L.DivIcon {
  const html = `
    <div class="vmp-terminal-node" title="Terminal: ${name}">
      <div class="vmp-terminal-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2">
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
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function createWaypointMarkerIcon(name: string): L.DivIcon {
  const html = `
    <div class="vmp-chokepoint-node" title="Maritime Choke Point: ${name}">
      <div class="vmp-chokepoint-dot"></div>
      <span class="vmp-chokepoint-label">${name}</span>
    </div>
  `;
  return L.divIcon({
    className: 'vmp-leaflet-waypoint-div-icon',
    html,
    iconSize: [100, 22],
    iconAnchor: [6, 11],
  });
}
