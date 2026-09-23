import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  Target,
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  Check,
  Info,
  Globe,
} from 'lucide-react';
import type { MapLayerVisibility } from '../../../types/map';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitVessels: () => void;
  onFitAll?: () => void;
  onLocateVessel: () => void;
  hasSelectedVessel: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  layers: MapLayerVisibility;
  onToggleLayer: (key: keyof MapLayerVisibility) => void;
  showTrafficDensity: boolean;
  onToggleTrafficDensity: () => void;
  isLegendOpen?: boolean;
  onToggleLegend?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitVessels,
  onFitAll,
  onLocateVessel,
  hasSelectedVessel,
  isFullscreen,
  onToggleFullscreen,
  layers,
  onToggleLayer,
  showTrafficDensity,
  onToggleTrafficDensity,
  isLegendOpen,
  onToggleLegend,
}: MapControlsProps) {
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const layersMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        layersMenuRef.current &&
        !layersMenuRef.current.contains(e.target as Node)
      ) {
        setIsLayersMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="vmp-floating-controls-wrapper" role="toolbar" aria-label="Maritime map controls">
      {/* Zoom In / Out Block */}
      <div className="vmp-control-glass-cluster">
        <button
          className="vmp-glass-btn"
          onClick={onZoomIn}
          title="Zoom in (+)"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          className="vmp-glass-btn"
          onClick={onZoomOut}
          title="Zoom out (−)"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Navigation & Fit Controls */}
      <div className="vmp-control-glass-cluster">
        <button
          className="vmp-glass-btn"
          onClick={onResetView}
          title="Reset Global Ocean View (⌖)"
          aria-label="Reset ocean view"
        >
          <Compass size={16} />
        </button>

        <button
          className="vmp-glass-btn"
          onClick={onFitAll || onFitVessels}
          title="Fit All Maritime Data in View (Globe)"
          aria-label="Fit all data in view"
        >
          <Globe size={16} />
        </button>

        <button
          className="vmp-glass-btn"
          onClick={onFitVessels}
          title="Fit Active Fleet in View (◉)"
          aria-label="Fit fleet in view"
        >
          <Target size={16} />
        </button>

        <button
          className={`vmp-glass-btn ${hasSelectedVessel ? 'is-highlighted' : 'is-disabled'}`}
          onClick={onLocateVessel}
          disabled={!hasSelectedVessel}
          title={hasSelectedVessel ? 'Center on Selected Vessel' : 'No vessel selected'}
          aria-label="Center on selected vessel"
        >
          <Crosshair size={16} />
        </button>
      </div>

      {/* Layers, Legend & Fullscreen Controls */}
      <div className="vmp-control-glass-cluster" ref={layersMenuRef}>
        {onToggleLegend && (
          <button
            className={`vmp-glass-btn ${isLegendOpen ? 'is-active' : ''}`}
            onClick={onToggleLegend}
            title={isLegendOpen ? 'Hide Map Legend' : 'Show Map Legend'}
            aria-label="Toggle map legend"
          >
            <Info size={16} />
          </button>
        )}

        <button
          className={`vmp-glass-btn ${isLayersMenuOpen ? 'is-active' : ''}`}
          onClick={() => setIsLayersMenuOpen((v) => !v)}
          title="Toggle Maritime Intelligence Layers"
          aria-label="Toggle map layers"
        >
          <Layers size={16} />
        </button>

        {/* LAYER TOGGLE POPOVER (Requirement 10) */}
        {isLayersMenuOpen && (
          <div className="vmp-layers-popover-menu" role="menu">
            <div className="vmp-layers-popover-header">
              <span>MARITIME LAYERS</span>
            </div>

            <div className="vmp-layers-popover-list">
              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={layers.vessels}
                  onChange={() => onToggleLayer('vessels')}
                />
                <span className="vmp-layer-toggle-check">
                  {layers.vessels && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">Fleet Vessels</span>
              </label>

              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={layers.ports}
                  onChange={() => onToggleLayer('ports')}
                />
                <span className="vmp-layer-toggle-check">
                  {layers.ports && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">Commercial Ports</span>
              </label>

              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={layers.routes}
                  onChange={() => onToggleLayer('routes')}
                />
                <span className="vmp-layer-toggle-check">
                  {layers.routes && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">Shipping Corridors</span>
              </label>

              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={showTrafficDensity}
                  onChange={onToggleTrafficDensity}
                />
                <span className="vmp-layer-toggle-check">
                  {showTrafficDensity && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">Traffic Density</span>
              </label>

              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={layers.secaZones}
                  onChange={() => onToggleLayer('secaZones')}
                />
                <span className="vmp-layer-toggle-check">
                  {layers.secaZones && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">SECA / ECA Zones</span>
              </label>

              <label className="vmp-layer-toggle-row">
                <input
                  type="checkbox"
                  checked={layers.waypoints}
                  onChange={() => onToggleLayer('waypoints')}
                />
                <span className="vmp-layer-toggle-check">
                  {layers.waypoints && <Check size={11} />}
                </span>
                <span className="vmp-layer-name">Choke Points</span>
              </label>
            </div>
          </div>
        )}

        <button
          className="vmp-glass-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map Mode'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}
