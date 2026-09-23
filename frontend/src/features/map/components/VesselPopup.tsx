import React from 'react';
import type { Vessel } from '../../../types/vessel';
import type { VesselPosition } from '../../../types/map';

interface VesselPopupProps {
  vessel: Vessel | VesselPosition;
  onClose: () => void;
  onFocus?: () => void;
}

/**
 * Generates an enterprise-grade HTML popup string for Leaflet vessel markers
 */
export function renderVesselPopupHtml(vessel: VesselPosition): string {
  const cleanName = vessel.name.replace(/^REFERENCE-/, '');
  const latStr = `${Math.abs(vessel.latitude).toFixed(4)}° ${vessel.latitude >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(vessel.longitude).toFixed(4)}° ${vessel.longitude >= 0 ? 'E' : 'W'}`;

  return `
    <div class="vmp-hud-popup vmp-vessel-popup-box">
      <div class="vmp-popup-header">
        <span class="vmp-popup-badge vmp-badge-vessel">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px;">
            <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"></path>
            <path d="M4 18 3 9l4-2 5 8h4l2-4 2 2-1 5"></path>
          </svg>
          VESSEL #${vessel.id}
        </span>
        <span class="vmp-status-pill is-underway">${vessel.status || 'Active'}</span>
      </div>

      <div class="vmp-popup-title">🚢 ${escapeHtml(cleanName)}</div>

      <div class="vmp-popup-grid">
        <div class="vmp-grid-row">
          <span class="vmp-label">Vessel Class:</span>
          <span class="vmp-value">${escapeHtml(vessel.vessel_type || 'Commercial')}</span>
        </div>
        ${vessel.imo_number ? `
        <div class="vmp-grid-row">
          <span class="vmp-label">IMO Number:</span>
          <span class="vmp-value vmp-mono">${escapeHtml(vessel.imo_number)}</span>
        </div>` : ''}
        ${vessel.capacity_tons ? `
        <div class="vmp-grid-row">
          <span class="vmp-label">DWT Capacity:</span>
          <span class="vmp-value font-mono">${vessel.capacity_tons.toLocaleString()} MT</span>
        </div>` : ''}
        <div class="vmp-grid-row">
          <span class="vmp-label">Speed / Heading:</span>
          <span class="vmp-value font-mono">${vessel.speed_knots.toFixed(1)} kn &middot; ${Math.round(vessel.heading)}°</span>
        </div>
        <div class="vmp-grid-row">
          <span class="vmp-label">AIS Coordinates:</span>
          <span class="vmp-value vmp-mono">${latStr}, ${lngStr}</span>
        </div>
      </div>

      <div class="vmp-popup-footer">
        <span class="vmp-popup-sub">Verified AIS Feed</span>
        <span class="vmp-popup-action-hint">Click marker to inspect vessel telemetry</span>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Quick info popover for an inspected vessel
 */
export const VesselQuickPopup: React.FC<VesselPopupProps> = ({ vessel, onClose, onFocus }) => {
  const cleanName = vessel.name.replace(/^REFERENCE-/, '');
  const hasCoords = 'latitude' in vessel && typeof (vessel as any).latitude === 'number';
  const pos = hasCoords ? (vessel as VesselPosition) : null;

  return (
    <div className="vmp-vessel-quick-popup-overlay">
      <div className="vmp-hud-popup vmp-vessel-quick-card">
        <div className="vmp-popup-header">
          <span className="vmp-popup-badge vmp-badge-vessel">
            VESSEL #{vessel.id}
          </span>
          <button className="vmp-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="vmp-popup-title">🚢 {cleanName}</div>

        <div className="vmp-popup-grid">
          <div className="vmp-grid-row">
            <span className="vmp-label">Vessel Type:</span>
            <span className="vmp-value">{vessel.vessel_type || 'Commercial Fleet'}</span>
          </div>
          <div className="vmp-grid-row">
            <span className="vmp-label">IMO Number:</span>
            <span className="vmp-value font-mono">{vessel.imo_number || 'Not Assigned'}</span>
          </div>
          <div className="vmp-grid-row">
            <span className="vmp-label">Capacity (DWT):</span>
            <span className="vmp-value font-mono">
              {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : 'Not Specified'}
            </span>
          </div>
          <div className="vmp-grid-row">
            <span className="vmp-label">Coordinates:</span>
            <span className={`vmp-value font-mono ${!pos ? 'text-amber-400' : ''}`}>
              {pos
                ? `${pos.latitude.toFixed(4)}°, ${pos.longitude.toFixed(4)}°`
                : 'Location unavailable (Awaiting AIS telemetry)'}
            </span>
          </div>
        </div>

        {onFocus && pos && (
          <div className="vmp-popup-actions mt-3">
            <button className="vmp-action-btn vmp-action-btn-primary" onClick={onFocus}>
              Track on Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
