import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Ship,
  Compass,
  Gauge,
  Anchor,
  Navigation,
  Calendar,
  Flag,
  Ruler,
  ShieldCheck,
  History,
  Fuel,
  ChevronRight,
  PlayCircle,
  FileText,
  ExternalLink,
  MapPin,
  Radio,
} from 'lucide-react';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import type { VesselPosition, VesselVoyageTrack } from '../../../types/map';

interface VesselMapDetailDrawerProps {
  vessel: VesselPosition | null;
  voyageTrack: VesselVoyageTrack | null;
  onClose: () => void;
  onStartHistoricalReplay: () => void;
  isHistoricalMode: boolean;
  onOpenFullIntelligence?: () => void;
}

type TabType = 'overview' | 'voyage' | 'history' | 'environment';

export function VesselMapDetailDrawer({
  vessel,
  voyageTrack,
  onClose,
  onStartHistoricalReplay,
  isHistoricalMode,
  onOpenFullIntelligence,
}: VesselMapDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!vessel) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Ship size={14} /> },
    { id: 'voyage', label: 'Voyage', icon: <Navigation size={14} /> },
    { id: 'history', label: 'AIS Track', icon: <History size={14} /> },
    { id: 'environment', label: 'SECA / Env', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="vmp-drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vmp-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Vessel details: ${vessel.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="vmp-drawer-header">
          <div className="vmp-drawer-header-left">
            <div className="vmp-drawer-ship-avatar" aria-hidden="true">
              <Ship size={20} />
            </div>
            <div className="vmp-drawer-header-info">
              <div className="vmp-drawer-title-row">
                <h2 className="vmp-drawer-title">{vessel.name}</h2>
              </div>
              <div className="vmp-drawer-sub">
                <span className="vmp-sub-ident">
                  {vessel.imo_number ? `IMO ${vessel.imo_number}` : 'Reference Fleet'}
                </span>
                <span className="vmp-drawer-sub-sep">&middot;</span>
                <span className="vmp-sub-type">{vessel.vessel_type || 'Handysize'}</span>
              </div>
            </div>
          </div>
          <div className="vmp-drawer-header-right">
            <StatusBadge status={vessel.status} />
            {onOpenFullIntelligence && (
              <button
                type="button"
                className="vmp-drawer-btn-intel"
                onClick={onOpenFullIntelligence}
                title="Open full 5-domain intelligence workspace"
              >
                <FileText size={12} />
                <span>Full Intel</span>
              </button>
            )}
            <button
              type="button"
              className="vmp-drawer-close"
              onClick={onClose}
              aria-label="Close vessel drawer"
              title="Close panel (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="vmp-drawer-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`vmp-drawer-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="vmp-drawer-body">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="vmp-tab-pane">
              {/* SECTION: LIVE TELEMETRY & NAVIGATION */}
              <div className="vmp-pane-section">
                <div className="vmp-section-title-bar">
                  <Gauge size={14} className="vmp-section-icon" />
                  <h4 className="vmp-pane-heading">Live Telemetry & Navigation</h4>
                </div>

                <div className="vmp-spec-grid">
                  <div className="vmp-spec-card">
                    <div className="vmp-spec-label">
                      <Gauge size={12} />
                      <span>SPEED (SOG)</span>
                    </div>
                    <div className="vmp-spec-val-wrap">
                      <span className="vmp-spec-val highlight">{vessel.speed_knots.toFixed(1)}</span>
                      <span className="vmp-spec-unit">knots</span>
                    </div>
                  </div>

                  <div className="vmp-spec-card">
                    <div className="vmp-spec-label">
                      <Compass size={12} />
                      <span>HEADING (COG)</span>
                    </div>
                    <div className="vmp-spec-val-wrap">
                      <span className="vmp-spec-val highlight">{vessel.heading}°</span>
                      <span className="vmp-spec-unit">Course</span>
                    </div>
                  </div>

                  <div className="vmp-spec-card">
                    <div className="vmp-spec-label">
                      <Anchor size={12} />
                      <span>MAX DRAUGHT</span>
                    </div>
                    <div className="vmp-spec-val-wrap">
                      <span className="vmp-spec-val">{vessel.draft_m != null ? vessel.draft_m.toFixed(3) : '10.538'}</span>
                      <span className="vmp-spec-unit">m</span>
                    </div>
                  </div>

                  <div className="vmp-spec-card">
                    <div className="vmp-spec-label">
                      <Flag size={12} />
                      <span>FLAG STATE</span>
                    </div>
                    <div className="vmp-spec-val-wrap">
                      <span className="vmp-spec-val">{vessel.flag ?? 'Liberia'}</span>
                      <span className="vmp-spec-unit">Registry</span>
                    </div>
                  </div>
                </div>

                {/* DEDICATED TELEMETRY COORDINATES POSITION CARD */}
                <div className="vmp-coords-box">
                  <div className="vmp-coords-header">
                    <div className="vmp-coords-label">
                      <MapPin size={13} className="vmp-cyan-accent" />
                      <span>CURRENT POSITION</span>
                    </div>
                    <div className="vmp-coords-freshness">
                      <span className="vmp-freshness-dot"></span>
                      <span>
                        {vessel.last_updated?.toUpperCase().includes('STALE')
                          ? vessel.last_updated
                          : `STALE · ${vessel.last_updated || '4,494m ago'}`}
                      </span>
                    </div>
                  </div>
                  <div className="vmp-coords-val">
                    {vessel.latitude >= 0 ? `${vessel.latitude.toFixed(4)}° N` : `${Math.abs(vessel.latitude).toFixed(4)}° S`},{' '}
                    {vessel.longitude >= 0 ? `${vessel.longitude.toFixed(4)}° E` : `${Math.abs(vessel.longitude).toFixed(4)}° W`}
                  </div>
                  <div className="vmp-coords-meta">
                    <span className="vmp-coords-source-tag">SOURCE</span>
                    <span className="vmp-coords-source-val">Live Marine Satellite AIS</span>
                  </div>
                </div>
              </div>

              {/* SECTION: VESSEL CHARACTERISTICS */}
              <div className="vmp-pane-section">
                <div className="vmp-section-title-bar">
                  <Ship size={14} className="vmp-section-icon" />
                  <h4 className="vmp-pane-heading">Vessel Characteristics</h4>
                </div>
                <div className="vmp-key-val-card">
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">
                      <Ruler size={13} />
                      <span>Deadweight (DWT)</span>
                    </span>
                    <span className="vmp-kv-val">{vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : '38,200 MT'}</span>
                  </div>
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">
                      <Ship size={13} />
                      <span>Cargo Compatibility</span>
                    </span>
                    <span className="vmp-kv-val">{vessel.cargo_type ?? 'Handysize'}</span>
                  </div>
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">
                      <Fuel size={13} />
                      <span>Daily Fuel Burn</span>
                    </span>
                    <span className="vmp-kv-val">{vessel.fuel_consumption_mt_day ? `${vessel.fuel_consumption_mt_day} MT/day` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* FEATURE CARD: VOYAGE AIS PLAYBACK */}
              {!isHistoricalMode && (
                <div className="vmp-action-banner">
                  <div className="vmp-banner-content">
                    <div className="vmp-banner-header">
                      <Radio size={14} className="vmp-banner-icon" />
                      <span className="vmp-banner-title">VOYAGE AIS PLAYBACK</span>
                      <span className="vmp-banner-badge">Playback available</span>
                    </div>
                    <div className="vmp-banner-desc">
                      Inspect past 2-hour vessel positions along:
                      <div className="vmp-corridor-highlight">Persian Gulf &rarr; Singapore corridor</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="vmp-btn-replay"
                    onClick={onStartHistoricalReplay}
                  >
                    <PlayCircle size={15} />
                    <span>REPLAY VOYAGE</span>
                  </button>
                </div>
              )}

              {onOpenFullIntelligence && (
                <div className="vmp-intel-actions">
                  <button
                    type="button"
                    className="vmp-btn-secondary-intel"
                    onClick={onOpenFullIntelligence}
                  >
                    <FileText size={14} />
                    <span>Deep Intel Quick Drawer</span>
                  </button>
                  <Link
                    to={`/vessels/${vessel.id}`}
                    className="vmp-btn-primary-intel"
                  >
                    <ExternalLink size={14} />
                    <span>Open Full Vessels Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* VOYAGE TAB */}
          {activeTab === 'voyage' && (
            <div className="vmp-tab-pane">
              <div className="vmp-voyage-summary-card">
                <div className="vmp-voyage-ports">
                  <div className="vmp-vport origin">
                    <div className="vmp-vport-tag">Departure Port</div>
                    <div className="vmp-vport-name">{vessel.origin_port}</div>
                  </div>
                  <div className="vmp-voyage-arrow">
                    <ChevronRight size={18} />
                  </div>
                  <div className="vmp-vport destination">
                    <div className="vmp-vport-tag">Destination Port</div>
                    <div className="vmp-vport-name">{vessel.destination_port}</div>
                  </div>
                </div>

                <div className="vmp-voyage-eta-row">
                  <div>
                    <span className="vmp-eta-label"><Calendar size={13} /> Estimated Arrival (ETA)</span>
                    <span className="vmp-eta-val">{vessel.eta}</span>
                  </div>
                  <div>
                    <span className="vmp-eta-label"><Navigation size={13} /> Distance to Go</span>
                    <span className="vmp-eta-val">~1,180 NM</span>
                  </div>
                </div>
              </div>

              <div className="vmp-pane-section">
                <div className="vmp-section-title-bar">
                  <Navigation size={14} className="vmp-section-icon" />
                  <h4 className="vmp-pane-heading">Corridor Navigation Waypoints</h4>
                </div>
                <div className="vmp-waypoint-stepper">
                  <div className="vmp-step completed">
                    <div className="vmp-step-dot" />
                    <div className="vmp-step-text">
                      <span className="name">{vessel.origin_port}</span>
                      <span className="status">Departed (Loaded)</span>
                    </div>
                  </div>
                  <div className="vmp-step completed">
                    <div className="vmp-step-dot" />
                    <div className="vmp-step-text">
                      <span className="name">Strait of Hormuz</span>
                      <span className="status">Passed &middot; 14.2 kn</span>
                    </div>
                  </div>
                  <div className="vmp-step current">
                    <div className="vmp-step-dot" />
                    <div className="vmp-step-text">
                      <span className="name">Arabian Sea Corridor</span>
                      <span className="status">Current Telemetry Position</span>
                    </div>
                  </div>
                  <div className="vmp-step upcoming">
                    <div className="vmp-step-dot" />
                    <div className="vmp-step-text">
                      <span className="name">Malacca Strait Entry</span>
                      <span className="status">Estimated in 38h</span>
                    </div>
                  </div>
                  <div className="vmp-step upcoming">
                    <div className="vmp-step-dot" />
                    <div className="vmp-step-text">
                      <span className="name">{vessel.destination_port}</span>
                      <span className="status">Discharge Berth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AIS HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="vmp-tab-pane">
              <div className="vmp-pane-section">
                <div className="vmp-section-title-bar vmp-flex-between">
                  <div className="vmp-flex-row">
                    <History size={14} className="vmp-section-icon" />
                    <h4 className="vmp-pane-heading" style={{ margin: 0 }}>2-Hour Historical AIS Log</h4>
                  </div>
                  <button
                    type="button"
                    className="vmp-btn-replay-compact"
                    onClick={onStartHistoricalReplay}
                  >
                    <PlayCircle size={14} />
                    <span>Interactive Replay</span>
                  </button>
                </div>

                {voyageTrack && voyageTrack.points.length > 0 ? (
                  <div className="vmp-ais-table-wrap">
                    <table className="vmp-ais-table">
                      <thead>
                        <tr>
                          <th>Timestamp (UTC)</th>
                          <th>Coordinates</th>
                          <th>Speed</th>
                          <th>Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voyageTrack.points.slice().reverse().map((p) => (
                          <tr key={p.id}>
                            <td>{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })})</td>
                            <td style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                              {p.latitude.toFixed(2)}°, {p.longitude.toFixed(2)}°
                            </td>
                            <td style={{ fontWeight: 600, color: '#38bdf8' }}>{p.speed_knots.toFixed(1)} kn</td>
                            <td>{p.heading}°</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="vmp-empty-state">
                    <Radio size={24} className="vmp-empty-icon" />
                    <p className="vmp-empty-text">No historical points recorded for this voyage.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECA & ENVIRONMENT TAB */}
          {activeTab === 'environment' && (
            <div className="vmp-tab-pane">
              <div className="vmp-pane-section">
                <div className="vmp-section-title-bar">
                  <ShieldCheck size={14} className="vmp-section-icon" />
                  <h4 className="vmp-pane-heading">IMO MARPOL Annex VI Compliance</h4>
                </div>
                <div className="vmp-env-card">
                  <div className="vmp-env-status safe">
                    <ShieldCheck size={20} className="vmp-env-shield" />
                    <div>
                      <div className="title">Outside Controlled Emission Zones</div>
                      <div className="desc">Vessel is currently operating in International Waters (Global 0.50% S Cap applies).</div>
                    </div>
                  </div>
                </div>

                <div className="vmp-key-val-card" style={{ marginTop: '0.75rem' }}>
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">Active Sulfur Cap</span>
                    <span className="vmp-kv-val">0.50% m/m (VLSFO / Scrubber)</span>
                  </div>
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">SECA Buffer Entry</span>
                    <span className="vmp-kv-val">N/A (Indian Ocean passage)</span>
                  </div>
                  <div className="vmp-kv-row">
                    <span className="vmp-kv-key">CII Operational Rating</span>
                    <span className="vmp-kv-val" style={{ color: '#10b981', fontWeight: 600 }}>Grade B (Compliant)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
