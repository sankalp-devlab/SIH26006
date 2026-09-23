import React, { useState } from 'react';
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

  if (!vessel) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Ship size={14} /> },
    { id: 'voyage', label: 'Voyage', icon: <Navigation size={14} /> },
    { id: 'history', label: 'AIS Track', icon: <History size={14} /> },
    { id: 'environment', label: 'SECA / Env', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="vmp-detail-drawer" role="dialog" aria-label={`Vessel details: ${vessel.name}`}>
      {/* Header */}
      <div className="vmp-drawer-header">
        <div className="vmp-drawer-header-left">
          <div className="vmp-drawer-ship-avatar">
            <Ship size={22} />
          </div>
          <div>
            <h2 className="vmp-drawer-title">{vessel.name}</h2>
            <div className="vmp-drawer-sub">
              {vessel.imo_number ? `IMO ${vessel.imo_number}` : 'Reference Fleet'} &middot; {vessel.vessel_type}
            </div>
          </div>
        </div>
        <div className="vmp-drawer-header-right">
          <StatusBadge status={vessel.status} />
          {onOpenFullIntelligence && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenFullIntelligence}
              title="Open full 5-domain intelligence workspace"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '11px', height: '26px' }}
            >
              <FileText size={12} />
              <span>Full Intel</span>
            </button>
          )}
          <button
            className="vmp-drawer-close"
            onClick={onClose}
            aria-label="Close vessel drawer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="vmp-drawer-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
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
            <div className="vmp-pane-section">
              <h4 className="vmp-pane-heading">Live Telemetry & Navigation</h4>
              <div className="vmp-spec-grid">
                <div className="vmp-spec-card">
                  <span className="vmp-spec-label"><Gauge size={13} /> SOG (Speed)</span>
                  <span className="vmp-spec-val highlight">{vessel.speed_knots.toFixed(1)} knots</span>
                </div>
                <div className="vmp-spec-card">
                  <span className="vmp-spec-label"><Compass size={13} /> COG (Heading)</span>
                  <span className="vmp-spec-val highlight">{vessel.heading}°</span>
                </div>
                <div className="vmp-spec-card">
                  <span className="vmp-spec-label"><Anchor size={13} /> Max Draught</span>
                  <span className="vmp-spec-val">{vessel.draft_m ?? 11.0} m</span>
                </div>
                <div className="vmp-spec-card">
                  <span className="vmp-spec-label"><Flag size={13} /> Flag State</span>
                  <span className="vmp-spec-val">{vessel.flag ?? 'Liberia'}</span>
                </div>
              </div>

              <div className="vmp-coords-box">
                <div className="vmp-coords-label">Current Telemetry Coordinates</div>
                <div className="vmp-coords-val">
                  {vessel.latitude >= 0 ? `${vessel.latitude.toFixed(4)}° N` : `${Math.abs(vessel.latitude).toFixed(4)}° S`},{' '}
                  {vessel.longitude >= 0 ? `${vessel.longitude.toFixed(4)}° E` : `${Math.abs(vessel.longitude).toFixed(4)}° W`}
                </div>
                <div className="vmp-coords-sub">Source: Live Marine Satellite AIS &middot; {vessel.last_updated}</div>
              </div>
            </div>

            <div className="vmp-pane-section">
              <h4 className="vmp-pane-heading">Vessel Characteristics</h4>
              <div className="vmp-key-val-list">
                <div className="vmp-kv-row">
                  <span className="vmp-kv-key"><Ruler size={13} /> Deadweight (DWT)</span>
                  <span className="vmp-kv-val">{vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : '—'}</span>
                </div>
                <div className="vmp-kv-row">
                  <span className="vmp-kv-key"><Ship size={13} /> Cargo Compatibility</span>
                  <span className="vmp-kv-val">{vessel.cargo_type ?? 'Dry Bulk / Minerals'}</span>
                </div>
                <div className="vmp-kv-row">
                  <span className="vmp-kv-key"><Fuel size={13} /> Daily Fuel Burn</span>
                  <span className="vmp-kv-val">{vessel.fuel_consumption_mt_day ? `${vessel.fuel_consumption_mt_day} MT/day` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Historical replay callout */}
            {!isHistoricalMode && (
              <div className="vmp-action-banner">
                <div>
                  <div className="vmp-banner-title">Voyage AIS Playback Available</div>
                  <div className="vmp-banner-desc">Inspect past 2-hour positions along the Persian Gulf &rarr; Singapore corridor.</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={onStartHistoricalReplay}
                >
                  <PlayCircle size={15} />
                  <span>Replay Voyage</span>
                </button>
              </div>
            )}

            {onOpenFullIntelligence && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenFullIntelligence}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '7px' }}
                >
                  <FileText size={14} />
                  <span>Deep Intel Quick Drawer</span>
                </button>
                <Link
                  to={`/vessels/${vessel.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '7px' }}
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
              <h4 className="vmp-pane-heading">Corridor Navigation Waypoints</h4>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 className="vmp-pane-heading" style={{ margin: 0 }}>2-Hour Historical AIS Log</h4>
                <button
                  className="btn btn-secondary btn-sm"
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
                          <td style={{ fontWeight: 600 }}>{p.speed_knots.toFixed(1)} kn</td>
                          <td>{p.heading}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-sm">No historical points recorded for this voyage.</p>
              )}
            </div>
          </div>
        )}

        {/* SECA & ENVIRONMENT TAB */}
        {activeTab === 'environment' && (
          <div className="vmp-tab-pane">
            <div className="vmp-pane-section">
              <h4 className="vmp-pane-heading">IMO MARPOL Annex VI Compliance</h4>
              <div className="vmp-env-card">
                <div className="vmp-env-status safe">
                  <ShieldCheck size={20} />
                  <div>
                    <div className="title">Outside Controlled Emission Zones</div>
                    <div className="desc">Vessel is currently operating in International Waters (Global 0.50% S Cap applies).</div>
                  </div>
                </div>
              </div>

              <div className="vmp-key-val-list" style={{ marginTop: '1rem' }}>
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
    </div>
  );
}
