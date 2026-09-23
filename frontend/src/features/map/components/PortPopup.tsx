import React from 'react';
import type { Port } from '../../../types/port';

interface PortPopupProps {
  port: Port;
  onClose: () => void;
  onFocus?: () => void;
}

/**
 * Generates an enterprise-grade HTML popup string for Leaflet markers
 */
export function renderPortPopupHtml(port: Port): string {
  const latStr = port.latitude != null ? `${Math.abs(port.latitude).toFixed(4)}° ${port.latitude >= 0 ? 'N' : 'S'}` : 'N/A';
  const lngStr = port.longitude != null ? `${Math.abs(port.longitude).toFixed(4)}° ${port.longitude >= 0 ? 'E' : 'W'}` : 'N/A';
  
  const facilitiesList = Array.isArray(port.facilities) && port.facilities.length > 0
    ? port.facilities.slice(0, 3).map(f => `<span class="vmp-chip">${escapeHtml(String(f))}</span>`).join('')
    : '<span class="vmp-chip is-muted">Standard Seaport Berthing</span>';

  return `
    <div class="vmp-hud-popup vmp-port-popup-box">
      <div class="vmp-popup-header">
        <span class="vmp-popup-badge vmp-badge-port">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -1px;">
            <circle cx="12" cy="5" r="3"></circle>
            <line x1="12" y1="22" x2="12" y2="8"></line>
            <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
          </svg>
          COMMERCIAL PORT #${port.id}
        </span>
        <span class="vmp-popup-type">${escapeHtml(port.port_type || 'Seaport')}</span>
      </div>

      <div class="vmp-popup-title">⚓ ${escapeHtml(port.name)}</div>
      
      <div class="vmp-popup-grid">
        <div class="vmp-grid-row">
          <span class="vmp-label">Country:</span>
          <span class="vmp-value">${escapeHtml(port.country || 'International Territory')}</span>
        </div>
        ${port.city ? `
        <div class="vmp-grid-row">
          <span class="vmp-label">City / Region:</span>
          <span class="vmp-value">${escapeHtml(port.city)}</span>
        </div>` : ''}
        <div class="vmp-grid-row">
          <span class="vmp-label">UN/LOCODE:</span>
          <span class="vmp-value vmp-mono">${escapeHtml(port.unlocode || 'Not Assigned')}</span>
        </div>
        <div class="vmp-grid-row">
          <span class="vmp-label">Coordinates:</span>
          <span class="vmp-value vmp-mono">${latStr}, ${lngStr}</span>
        </div>
      </div>

      <div class="vmp-popup-chips">
        ${facilitiesList}
      </div>

      <div class="vmp-popup-footer">
        <span class="vmp-status-pill is-active">● Active Port Node</span>
        <span class="vmp-popup-action-hint">Click port marker to inspect terminal</span>
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
 * Dedicated Slide-in Detail Drawer for an actively selected Port
 */
export const PortDetailDrawer: React.FC<PortPopupProps> = ({ port, onClose, onFocus }) => {
  const latStr = port.latitude != null ? `${Math.abs(port.latitude).toFixed(4)}° ${port.latitude >= 0 ? 'N' : 'S'}` : 'Location unavailable';
  const lngStr = port.longitude != null ? `${Math.abs(port.longitude).toFixed(4)}° ${port.longitude >= 0 ? 'E' : 'W'}` : 'Location unavailable';

  const copyCoords = () => {
    if (port.latitude != null && port.longitude != null) {
      navigator.clipboard.writeText(`${port.latitude.toFixed(6)}, ${port.longitude.toFixed(6)}`);
    }
  };

  return (
    <aside className="vmp-detail-panel vmp-port-detail-panel">
      {/* HEADER */}
      <header className="vmp-panel-header">
        <div className="vmp-panel-header-badge-row">
          <span className="vmp-pill vmp-pill-port">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"></circle>
              <line x1="12" y1="22" x2="12" y2="8"></line>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
            </svg>
            PORT TERMINAL &middot; ID {port.id}
          </span>
          <span className="vmp-type-chip">{port.port_type || 'Seaport'}</span>
        </div>

        <div className="vmp-panel-title-row">
          <h2 className="vmp-panel-title">⚓ {port.name}</h2>
          <button className="vmp-close-btn" onClick={onClose} title="Close Panel" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <p className="vmp-panel-sub">
          {port.country || 'International Waters'} {port.city ? `&middot; ${port.city}` : ''}
        </p>
      </header>

      {/* BODY CONTENT */}
      <div className="vmp-panel-body">
        {/* GEOGRAPHIC TELEMETRY CARD */}
        <section className="vmp-card vmp-card-telemetry">
          <div className="vmp-card-header">
            <span className="vmp-card-title">Geographic Coordinates</span>
            <button className="vmp-copy-btn" onClick={copyCoords} title="Copy Coordinates">
              Copy
            </button>
          </div>
          <div className="vmp-telemetry-grid">
            <div className="vmp-telemetry-cell">
              <span className="vmp-cell-label">Latitude</span>
              <span className="vmp-cell-val font-mono">{latStr}</span>
            </div>
            <div className="vmp-telemetry-cell">
              <span className="vmp-cell-label">Longitude</span>
              <span className="vmp-cell-val font-mono">{lngStr}</span>
            </div>
            <div className="vmp-telemetry-cell">
              <span className="vmp-cell-label">UN/LOCODE</span>
              <span className="vmp-cell-val font-mono">{port.unlocode || 'Not Assigned'}</span>
            </div>
            <div className="vmp-telemetry-cell">
              <span className="vmp-cell-label">Classification</span>
              <span className="vmp-cell-val">{port.port_type || 'Seaport'}</span>
            </div>
          </div>
        </section>

        {/* FACILITIES SECTION */}
        {Array.isArray(port.facilities) && port.facilities.length > 0 && (
          <section className="vmp-card">
            <h3 className="vmp-card-title">Port Infrastructure & Facilities</h3>
            <div className="vmp-chip-group">
              {port.facilities.map((fac, i) => (
                <span key={i} className="vmp-chip">
                  ✓ {String(fac)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* QUICK ACTIONS */}
        <div className="vmp-action-group">
          {onFocus && (
            <button className="vmp-action-btn vmp-action-btn-primary" onClick={onFocus}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Recenter Map on Port
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
