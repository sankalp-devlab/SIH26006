import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Search,
  Layers,
  Download,
  RefreshCw,
  GitCompare,
  Compass,
  Calculator,
  MapPin,
  X,
} from 'lucide-react';
import type { Port } from '../../../types/port';
import type { PortDateRange } from '../../../types/port-insights';

interface PortInsightsHeaderProps {
  ports: Port[];
  activePort: Port | null;
  dateRange: PortDateRange;
  onSelectPort: (id: number) => void;
  onClearPort?: () => void;
  onSelectDateRange: (range: PortDateRange) => void;
  onOpenCompare: () => void;
  onOpenDirectory: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
}

export function PortInsightsHeader({
  ports,
  activePort,
  dateRange,
  onSelectPort,
  onClearPort,
  onSelectDateRange,
  onOpenCompare,
  onOpenDirectory,
  onExportCsv,
  onRefresh,
}: PortInsightsHeaderProps) {
  const navigate = useNavigate();
  const [portSearch, setPortSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredPorts = useMemo(() => {
    if (!portSearch) return ports.slice(0, 15);
    const q = portSearch.toLowerCase();
    return ports
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.unlocode && p.unlocode.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [ports, portSearch]);

  const timeRanges: { id: PortDateRange; label: string }[] = [
    { id: 'today', label: 'TODAY' },
    { id: '7d', label: '7 DAYS' },
    { id: '30d', label: '30 DAYS' },
    { id: '90d', label: '90 DAYS' },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Page Header (Eyebrow, Title, Subtitle, Segmented Time Range) */}
      <div className="piw-header">
        <div className="piw-header-left">
          <div className="piw-eyebrow">
            <span>MODULE 13 · PORT INTELLIGENCE</span>
          </div>
          <h1 className="piw-title">Port Intelligence</h1>
          <p className="piw-subtitle">
            Operational seaport, vessel and berth intelligence for faster maritime decisions.
          </p>
        </div>

        {/* Right: Segmented Time-Range Control */}
        <div className="piw-time-segmented">
          {timeRanges.map((tr) => {
            const isActive = dateRange === tr.id;
            return (
              <button
                key={tr.id}
                type="button"
                className={`piw-time-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectDateRange(tr.id)}
              >
                {tr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dedicated Port Context Bar */}
      <div className="piw-port-bar">
        <div className="piw-port-bar-main">
          {/* Left: Port Identity & Search */}
          <div className="piw-port-identity" style={{ position: 'relative' }}>
            <div className="piw-port-icon">
              <Anchor size={22} />
            </div>

            <div className="piw-port-info">
              {activePort ? (
                <div className="piw-port-name-row">
                  <span className="piw-port-name">{activePort.name.toUpperCase()}</span>
                  <span className="piw-port-country">{activePort.country || 'International'}</span>
                  {activePort.unlocode && (
                    <span className="piw-port-unlocode">{activePort.unlocode}</span>
                  )}
                </div>
              ) : (
                <div className="piw-port-name-row">
                  <span className="piw-port-name" style={{ color: '#94a3b8' }}>
                    SELECT A PORT
                  </span>
                  <span className="piw-port-country">Browse global seaport hub</span>
                </div>
              )}
            </div>

            {/* Search Port Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '8px', height: '36px' }}
            >
              <Search size={14} color="#38bdf8" />
              <span>Search Port</span>
            </button>

            {/* Clear Button */}
            {activePort && onClearPort && (
              <button
                type="button"
                onClick={onClearPort}
                className="btn btn-ghost btn-sm"
                style={{ height: '36px', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Clear selected port"
              >
                <X size={14} />
                <span>Clear</span>
              </button>
            )}

            {/* Instant Search Popup */}
            {isSearchOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 2000,
                  marginTop: '8px',
                  width: '380px',
                  background: '#091A2A',
                  border: '1px solid rgba(80, 180, 255, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                  padding: '10px',
                }}
              >
                <input
                  type="text"
                  placeholder="Type port name, country, or UN/LOCODE..."
                  value={portSearch}
                  onChange={(e) => setPortSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    background: '#061321',
                    border: '1px solid rgba(80, 180, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    outline: 'none',
                    marginBottom: '8px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {filteredPorts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPort(p.id);
                        setIsSearchOpen(false);
                        setPortSearch('');
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: activePort && p.id === activePort.id ? '#00d8ff' : '#cbd5e1',
                        background: activePort && p.id === activePort.id ? 'rgba(0, 216, 255, 0.12)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span>
                        <strong>{p.name}</strong> ({p.country || 'Intl'})
                      </span>
                      {p.unlocode && (
                        <code style={{ fontSize: '10px', color: '#38bdf8' }}>{p.unlocode}</code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="piw-port-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenCompare}
              style={{ height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <GitCompare size={14} />
              <span>Compare Ports</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenDirectory}
              style={{ height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Browse all 200+ ports catalog"
            >
              <Layers size={14} />
              <span>Global Directory</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onExportCsv}
              style={{ height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Export CSV Port Dossier"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRefresh}
              style={{ height: '36px', padding: '0 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              title="Refresh Port Intelligence"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Bottom: Cross-Module Workflows Action Rail */}
        <div className="piw-workflows-rail">
          <span className="piw-workflow-label">WORKFLOWS:</span>

          <button
            type="button"
            onClick={() => navigate(`/distance-calculator?origin=${encodeURIComponent(activePort?.name || '')}`)}
            className="piw-workflow-link"
          >
            <Compass size={13} />
            <span>Route in Distance Calculator</span>
          </button>

          <span style={{ color: '#475569' }}>&bull;</span>

          <button
            type="button"
            onClick={() => navigate(`/voyage-calculator?port=${encodeURIComponent(activePort?.name || '')}`)}
            className="piw-workflow-link"
          >
            <Calculator size={13} />
            <span>Plan Call in Voyage Calculator</span>
          </button>

          <span style={{ color: '#475569' }}>&bull;</span>

          <button
            type="button"
            onClick={() => navigate(`/map?port=${encodeURIComponent(activePort?.name || '')}`)}
            className="piw-workflow-link"
          >
            <MapPin size={13} />
            <span>Inspect on Live AIS Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}
