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
    <div className={`vmp-floating-legend ${className}`} role="region" aria-label="Maritime map legend">
      {/* HEADER */}
      <div className="vmp-legend-header">
        <div className="vmp-legend-title-row">
          <span className="vmp-legend-icon">🧭</span>
          <span className="vmp-legend-title">MARITIME MAP</span>
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

      {/* CORE ENTITY ITEMS (Section 16 Specification) */}
      <div className="vmp-legend-section">
        {/* LIVE VESSEL */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-live-sym">◉</span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Live Vessel</span>
            <span className="vmp-legend-meta">Active Telemetry &middot; Underway</span>
          </div>
        </div>

        {/* VESSEL */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-vessel-sym">◇</span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Vessel</span>
            <span className="vmp-legend-meta">Fleet Vessel &middot; Anchored / Moored</span>
          </div>
        </div>

        {/* COMMERCIAL PORT */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-port-sym">⚓</span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Commercial Port</span>
            <span className="vmp-legend-meta">Verified Seaport / UN/LOCODE</span>
          </div>
        </div>

        {/* MARITIME CHOKEPOINT */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-choke-sym">●</span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Chokepoint</span>
            <span className="vmp-legend-meta">Strategic Strait &middot; Canal Passage</span>
          </div>
        </div>

        {/* ACTIVE ROUTE */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-active-route-line"></span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Active Route</span>
            <span className="vmp-legend-meta">Selected Voyage Flow &middot; Direction</span>
          </div>
        </div>

        {/* PLANNED ROUTE */}
        <div className="vmp-legend-item">
          <div className="vmp-legend-symbol">
            <span className="vmp-legend-planned-route-line"></span>
          </div>
          <div className="vmp-legend-item-info">
            <span className="vmp-legend-name">Planned Route</span>
            <span className="vmp-legend-meta">Commercial Corridor Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
