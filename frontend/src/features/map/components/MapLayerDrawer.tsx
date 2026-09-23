import {
  Layers,
  X,
  Ship,
  Anchor,
  Square,
  Navigation,
  Milestone,
  ShieldAlert,
  CheckSquare,
  Square as EmptySquare,
} from 'lucide-react';
import type { MapLayerVisibility } from '../../../types/map';

interface MapLayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layers: MapLayerVisibility;
  onToggleLayer: (key: keyof MapLayerVisibility) => void;
  counts: {
    vessels: number;
    ports: number;
    terminals: number;
    waypoints: number;
    secaZones: number;
  };
}

export function MapLayerDrawer({
  isOpen,
  onClose,
  layers,
  onToggleLayer,
  counts,
}: MapLayerDrawerProps) {
  if (!isOpen) return null;

  const layerItems: {
    key: keyof MapLayerVisibility;
    label: string;
    description: string;
    icon: React.ReactNode;
    count?: number;
    color: string;
  }[] = [
    {
      key: 'vessels',
      label: 'Fleet Vessels',
      description: 'Active, underway & moored vessels with directional telemetry',
      icon: <Ship size={16} />,
      count: counts.vessels,
      color: '#34d399',
    },
    {
      key: 'ports',
      label: 'Global Seaports',
      description: 'Major international maritime ports and harbor anchorages',
      icon: <Anchor size={16} />,
      count: counts.ports,
      color: '#38bdf8',
    },
    {
      key: 'terminals',
      label: 'Commercial Terminals',
      description: 'Specialized container, dry bulk, LNG & crude oil berths',
      icon: <Square size={16} />,
      count: counts.terminals,
      color: '#a78bfa',
    },
    {
      key: 'routes',
      label: 'Commercial Shipping Lanes',
      description: 'Great Circle corridors & defined maritime trade routes',
      icon: <Navigation size={16} />,
      color: '#fbbf24',
    },
    {
      key: 'waypoints',
      label: 'Maritime Choke Points',
      description: 'Strategic navigation canals, straits & navigational passages',
      icon: <Milestone size={16} />,
      count: counts.waypoints,
      color: '#f97316',
    },
    {
      key: 'secaZones',
      label: 'SECA / ECA Emission Zones',
      description: 'IMO MARPOL Annex VI 0.10% sulfur regulatory boundaries',
      icon: <ShieldAlert size={16} />,
      count: counts.secaZones,
      color: '#ec4899',
    },
  ];

  return (
    <div className="vmp-layer-drawer" role="dialog" aria-label="Geospatial Map Layers">
      <div className="vmp-layer-drawer-header">
        <div className="vmp-layer-title-wrapper">
          <Layers size={18} color="var(--color-brand-accent, #38bdf8)" />
          <h3 className="vmp-layer-title">Map Layers & Overlays</h3>
        </div>
        <button
          className="vmp-layer-close-btn"
          onClick={onClose}
          aria-label="Close layers drawer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="vmp-layer-drawer-body">
        <p className="vmp-layer-help-text">
          Toggle live geospatial intelligence layers to tailor operational visibility.
        </p>

        <div className="vmp-layer-list">
          {layerItems.map((item) => {
            const isVisible = layers[item.key];
            return (
              <div
                key={item.key}
                className={`vmp-layer-item ${isVisible ? 'active' : ''}`}
                onClick={() => onToggleLayer(item.key)}
                role="checkbox"
                aria-checked={isVisible}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleLayer(item.key);
                  }
                }}
              >
                <div className="vmp-layer-checkbox" style={{ color: item.color }}>
                  {isVisible ? <CheckSquare size={18} /> : <EmptySquare size={18} />}
                </div>
                <div className="vmp-layer-item-content">
                  <div className="vmp-layer-label-row">
                    <span className="vmp-layer-item-icon" style={{ color: item.color }}>
                      {item.icon}
                    </span>
                    <span className="vmp-layer-item-name">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="vmp-layer-count-chip">{item.count}</span>
                    )}
                  </div>
                  <div className="vmp-layer-item-desc">{item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
