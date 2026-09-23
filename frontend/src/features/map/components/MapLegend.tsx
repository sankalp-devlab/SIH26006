import React, { useState } from 'react';

interface MapLegendProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  if (!isOpen) {
    return (
      <button
        className={`vmp-legend-toggle-pill ${className}`}
        onClick={handleToggle}
        title="Show Map Legend"
        aria-label="Show Map Legend"
      >
        <span className="vmp-legend-indicator-dot"></span>
        <span className="vmp-legend-toggle-text">LEGEND</span>
      </button>
    );
  }

  return (
    <div className={`vmp-floating-legend ${className}`}>
      {/* HEADER */}
      <div className="vmp-legend-header">
        <div className="vmp-legend-title-row">
          <span className="vmp-legend-icon">🧭</span>
          <span className="vmp-legend-title">MAP LEGEND</span>
        </div>
        <button
          className="vmp-legend-close-btn"
          onClick={handleToggle}
          title="Minimize Legend"
          aria-label="Close Legend"
        >
          ✕
        </button>
      </div>

      {/* CORE ACTIVE ENTITIES */}
      <div className="vmp-legend-section">
        <div className="vmp-legend-subtitle">ACTIVE INTELLIGENCE LAYERS</div>

        {/* PORT */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol vmp-symbol-port">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"></circle>
              <line x1="12" y1="22" x2="12" y2="8"></line>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
            </svg>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Commercial Port</span>
            <span className="vmp-legend-meta">Verified Seaport / UN/LOCODE</span>
          </div>
        </div>

        {/* VESSEL */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol vmp-symbol-vessel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Fleet Vessel</span>
            <span className="vmp-legend-meta">Directional Hull & Speed</span>
          </div>
        </div>

        {/* ROUTE */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol vmp-symbol-route">
            <div className="vmp-route-line-preview"></div>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Commercial Route</span>
            <span className="vmp-legend-meta">Port Corridor Baseline</span>
          </div>
        </div>
      </div>

      {/* FUTURE-READY CAPABILITIES (Extensibility) */}
      <div className="vmp-legend-section vmp-legend-section-future">
        <div className="vmp-legend-subtitle">TELEMETRY EXPANSION</div>
        <div className="vmp-legend-future-grid">
          <span className="vmp-future-badge">Live AIS (M8+)</span>
          <span className="vmp-future-badge">Route Engine (M11)</span>
          <span className="vmp-future-badge">Weather Overlay</span>
          <span className="vmp-future-badge">Risk & Chokepoints</span>
        </div>
      </div>
    </div>
  );
};
