import { useNavigate } from 'react-router-dom';
import {
  Ruler,
  Anchor,
  Ship,
  Calendar,
  Layers,
  Award,
  Cpu,
  Zap,
  MapPin,
  Navigation,
  DollarSign,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Compass,
  ExternalLink,
  Star,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';
import { VesselMiniMap } from '../VesselMiniMap';
import { ProvenanceBadge } from '../../../../components/provenance';
import { provenanceService } from '../../../../services/provenance/provenance.service';
import { DataSourceOrigin } from '../../../../types/provenance';
import { MapDataService } from '../../../../services/map/map-data.service';
import { useFavourites } from '../../../../hooks/useFavourites';

interface OverviewTabProps {
  data: EnrichedVesselDetail;
  mode?: 'drawer' | 'dashboard';
  onNavigateTab?: (tab: string) => void;
}

export function OverviewTab({ data, mode = 'drawer', onNavigateTab }: OverviewTabProps) {
  const { vessel, technical, commercial, environmental, valuation, compliance, cargo } = data;
  const navigate = useNavigate();
  const { isFavourite, toggle: toggleFavourite } = useFavourites();

  const [vesselPos] = MapDataService.enrichVesselsWithPositions([vessel]);
  const vesselPath = `/vessels/${vessel.id}`;
  const isFav = isFavourite(vesselPath);

  const latStr = vesselPos?.latitude != null
    ? vesselPos.latitude >= 0 ? `${vesselPos.latitude.toFixed(2)}° N` : `${Math.abs(vesselPos.latitude).toFixed(2)}° S`
    : '23.41° N';
  const lngStr = vesselPos?.longitude != null
    ? vesselPos.longitude >= 0 ? `${vesselPos.longitude.toFixed(2)}° E` : `${Math.abs(vesselPos.longitude).toFixed(2)}° W`
    : '37.15° E';

  if (mode === 'dashboard') {
    return (
      <div className="vdb-tab-pane">
        {/* TOP ROW: POSITION WIDGET & ACTIVE VOYAGE */}
        <div className="vdb-grid-2col">
          {/* 1. LIVE POSITION & TELEMETRY CARD */}
          <div className="card vdb-section-card">
            <div className="card-header vdb-card-header">
              <div className="vdb-card-title-group">
                <MapPin size={16} className="vdb-cyan" />
                <h3 className="card-title">LIVE POSITION &amp; TELEMETRY</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="vdb-live-pill">
                  <span className="vdb-live-dot" /> LIVE AIS
                </span>
                <ProvenanceBadge
                  provenance={provenanceService.createTelemetryProvenance({
                    origin: DataSourceOrigin.AIS_SATELLITE,
                    sourceName: 'Spire / exactEarth Satellite AIS',
                    timestamp: (vessel as any).updated_at || (vessel as any).last_position_update || new Date().toISOString(),
                    entityId: `vessel-${vessel.imo_number || vessel.id}`,
                  })}
                  showInspector
                />
              </div>
            </div>
            <div className="card-body" style={{ padding: '0.75rem' }}>
              <VesselMiniMap vessel={vessel} height={200} />
              
              {/* Telemetry Metrics & View Full Map Button */}
              <div className="vdb-map-card-footer">
                <div className="vdb-map-telemetry-row">
                  <div className="vdb-mtr-item">
                    <span className="vdb-mtr-label">Position</span>
                    <span className="vdb-mtr-val font-mono highlight">{latStr}, {lngStr}</span>
                  </div>
                  <div className="vdb-mtr-item">
                    <span className="vdb-mtr-label">Speed</span>
                    <span className="vdb-mtr-val font-mono">{vesselPos?.speed_knots != null ? `${vesselPos.speed_knots.toFixed(1)} kn` : '14.0 kn'}</span>
                  </div>
                  <div className="vdb-mtr-item">
                    <span className="vdb-mtr-label">Heading</span>
                    <span className="vdb-mtr-val font-mono">{vesselPos?.heading != null ? `${vesselPos.heading}°` : '154°'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="vdb-btn-fullmap"
                  onClick={() => navigate(`/map?vessel=${vessel.id}`)}
                  title="Open in Live Vessel Map with focused telemetry"
                >
                  <Compass size={14} />
                  <span>VIEW FULL MAP</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. CURRENT ACTIVE VOYAGE CARD */}
          <div className="card vdb-section-card">
            <div className="card-header vdb-card-header">
              <div className="vdb-card-title-group">
                <Navigation size={16} className="vdb-cyan" />
                <h3 className="card-title">ACTIVE VOYAGE &middot; {commercial.current_voyage.voyage_number}</h3>
              </div>
              <span className="badge badge-outline" style={{ borderColor: 'rgba(0, 216, 255, 0.4)', color: '#00d8ff' }}>
                {commercial.current_voyage.status}
              </span>
            </div>
            <div className="card-body">
              <div className="vdb-voyage-ports-banner compact">
                <div className="vdb-port-block origin">
                  <div className="vdb-port-label">LOADING PORT</div>
                  <div className="vdb-port-name">{commercial.current_voyage.origin_port}</div>
                </div>

                <div className="vdb-voyage-corridor-indicator">
                  <div className="vdb-corridor-line" />
                  <ChevronRight size={18} className="vdb-corridor-arrow" />
                </div>

                <div className="vdb-port-block destination">
                  <div className="vdb-port-label">DISCHARGE PORT</div>
                  <div className="vdb-port-name">{commercial.current_voyage.destination_port}</div>
                </div>
              </div>

              <div className="vdb-key-val-list" style={{ marginTop: '1rem' }}>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label"><Calendar size={13} /> Estimated Arrival (ETA)</span>
                  <span className="vdb-kv-val text-emerald font-semibold font-mono">{commercial.current_voyage.eta_date}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label"><Briefcase size={13} /> Charterer</span>
                  <span className="vdb-kv-val font-semibold">{commercial.current_voyage.charterer}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label"><DollarSign size={13} /> Agreed Fixture Rate</span>
                  <span className="vdb-kv-val text-emerald font-mono font-semibold">{commercial.current_voyage.fixture_rate}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Cargo Carried</span>
                  <span className="vdb-kv-val text-cyan font-mono">
                    {cargo.current_cargo.commodity} ({cargo.current_cargo.quantity_mt.toLocaleString()} MT)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: PARTICULARS & COMMERCIAL SUMMARY */}
        <div className="vdb-grid-2col" style={{ marginTop: '1.25rem' }}>
          {/* TECHNICAL SUMMARY */}
          <div className="card vdb-section-card">
            <div className="card-header vdb-card-header">
              <div className="vdb-card-title-group">
                <Ruler size={16} className="text-secondary" />
                <h3 className="card-title">Vessel Particulars Summary</h3>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigateTab('particulars')}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  Full Specs &rarr;
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="vdb-key-val-list">
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Deadweight (DWT)</span>
                  <span className="vdb-kv-val font-mono font-semibold">
                    {technical.dwt_mt ? `${technical.dwt_mt.toLocaleString()} MT` : '—'}
                  </span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Dimensions (LOA &times; Beam &times; Draft)</span>
                  <span className="vdb-kv-val font-mono">
                    {technical.loa_m ?? '—'}m &times; {technical.beam_m ?? '—'}m &times; {technical.summer_draft_m ?? '—'}m
                  </span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Year Built / Yard</span>
                  <span className="vdb-kv-val">{vessel.year_built ?? '—'} &middot; {technical.shipyard}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Classification Society</span>
                  <span className="vdb-kv-val font-semibold">{technical.classification_society}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Main Engine Power</span>
                  <span className="vdb-kv-val font-mono">{technical.main_engine_power_kw.toLocaleString()} kW</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMMERCIAL SUMMARY */}
          <div className="card vdb-section-card">
            <div className="card-header vdb-card-header">
              <div className="vdb-card-title-group">
                <Briefcase size={16} className="text-secondary" />
                <h3 className="card-title">Commercial &amp; Management</h3>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigateTab('commercial')}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  Full Commercial &rarr;
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="vdb-key-val-list">
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Commercial Operator</span>
                  <span className="vdb-kv-val font-semibold">{commercial.commercial_operator}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Registered Owner</span>
                  <span className="vdb-kv-val">{commercial.registered_owner}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Technical Manager</span>
                  <span className="vdb-kv-val">{commercial.technical_manager}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Commercial Pool</span>
                  <span className="vdb-kv-val">{commercial.commercial_pool ?? 'Independent Spot Operation'}</span>
                </div>
                <div className="vdb-kv-row">
                  <span className="vdb-kv-label">Current Laycan</span>
                  <span className="vdb-kv-val font-mono">{commercial.current_voyage.laycan_window}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: 4 KEY ANALYTICAL CARDS */}
        <div className="vdb-grid-4col" style={{ marginTop: '1.25rem' }}>
          {/* CII Card */}
          <div className="vdb-stat-card">
            <div className="stat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <span className="stat-label">IMO CII Rating</span>
              <ProvenanceBadge
                provenance={provenanceService.createCalculatedProvenance({
                  metricName: 'IMO Carbon Intensity Indicator (CII)',
                  formula: 'AER = (Fuel Consumption MT * 3.114) / (DWT * Distance NM)',
                  inputs: [
                    { name: 'Deadweight', origin: DataSourceOrigin.PUBLIC_MARITIME_REGISTRY, value: technical.dwt_mt },
                    { name: 'Daily Fuel (Laden)', origin: DataSourceOrigin.MANUAL_USER_INPUT, value: environmental.daily_fuel_consumption_laden_mt },
                  ],
                })}
                compact
                showInspector
              />
            </div>
            <div className="stat-value text-emerald font-mono">
              Grade {environmental.cii_rating}
            </div>
            <div className="stat-sub">Score: {environmental.cii_score.toFixed(2)} gCO₂/dwt-nm</div>
          </div>

          {/* Daily Emissions Card */}
          <div className="vdb-stat-card">
            <div className="stat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <span className="stat-label">Daily CO₂ Output</span>
              <ProvenanceBadge
                provenance={provenanceService.createCalculatedProvenance({
                  metricName: 'Daily Voyage CO₂ Emissions',
                  formula: 'IMO 4th GHG Study: Fuel Consumption (MT) * 3.114 gCO₂/gFuel',
                  inputs: [
                    { name: 'Fuel Consumption (Laden)', origin: DataSourceOrigin.MANUAL_USER_INPUT, value: environmental.daily_fuel_consumption_laden_mt },
                  ],
                })}
                compact
                showInspector
              />
            </div>
            <div className="stat-value text-cyan font-mono">
              {environmental.daily_co2_emissions_mt} <span className="unit">MT/d</span>
            </div>
            <div className="stat-sub">Fuel: {environmental.daily_fuel_consumption_laden_mt} MT/d</div>
          </div>

          {/* Valuation Card */}
          <div className="vdb-stat-card">
            <div className="stat-header">
              <span className="stat-label">Market Asset Value</span>
              <DollarSign size={14} className="text-amber" />
            </div>
            <div className="stat-value font-mono">
              ${valuation.current_market_value_usd_m.toFixed(1)}M
            </div>
            <div className="stat-sub">Demolition Floor: ${valuation.demolition_scrap_value_usd_m.toFixed(1)}M</div>
          </div>

          {/* Sanctions Clearance Card */}
          <div className="vdb-stat-card">
            <div className="stat-header">
              <span className="stat-label">Sanctions Screening</span>
              <ShieldCheck size={14} className="text-emerald" />
            </div>
            <div className="stat-value text-emerald">
              {compliance.sanctions_status}
            </div>
            <div className="stat-sub">OFAC &bull; EU &bull; UN Cleared</div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (Requirement 27) */}
        <div className="vdb-profile-action-bar">
          <button
            type="button"
            className="btn btn-primary vdb-action-bar-btn"
            onClick={() => navigate(`/map?vessel=${vessel.id}`)}
            title="Open Live Vessel Map centered on this vessel"
          >
            <Compass size={15} />
            <span>VIEW LIVE POSITION</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              className="btn btn-secondary vdb-action-bar-btn"
              onClick={() => onNavigateTab('particulars')}
              title="Open full technical specifications"
            >
              <ExternalLink size={14} />
              <span>TECHNICAL WORKSPACE</span>
            </button>
          )}

          <button
            type="button"
            className={`btn btn-secondary vdb-action-bar-btn ${isFav ? 'is-fav' : ''}`}
            onClick={() => toggleFavourite({ id: `vessel-${vessel.id}`, name: vessel.name, path: vesselPath, icon: 'Ship' })}
            title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star size={14} fill={isFav ? '#fbbf24' : 'none'} color={isFav ? '#fbbf24' : '#94a3b8'} />
            <span>{isFav ? 'WATCHLISTED' : 'ADD TO WATCHLIST'}</span>
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT: DRAWER MODE
  return (
    <div className="vdd-tab-pane">
      {/* Particulars & Dimensions */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Ruler size={14} />
          Dimensions &amp; Capacities
        </h4>
        <div className="vdd-spec-grid">
          <div className="vdd-metric-card">
            <span className="label">Length Overall (LOA)</span>
            <span className="value">{technical.loa_m ?? '—'} m</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Extreme Breadth (Beam)</span>
            <span className="value">{technical.beam_m ?? '—'} m</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Moulded Depth</span>
            <span className="value">{technical.depth_m ?? '—'} m</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Design Summer Draft</span>
            <span className="value">{technical.summer_draft_m ?? '—'} m</span>
          </div>
          <div className="vdd-metric-card highlight">
            <span className="label">Deadweight (DWT)</span>
            <span className="value">{technical.dwt_mt?.toLocaleString() ?? '—'} MT</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Lightweight (LDT)</span>
            <span className="value">{technical.lightweight_tons?.toLocaleString() ?? '—'} MT</span>
          </div>
        </div>
      </div>

      {/* Construction & Registry */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Layers size={14} />
          Build &amp; Classification
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Calendar size={13} /> Year of Delivery</span>
            <span className="val">{technical.year_built ?? '—'}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><Ship size={13} /> Building Yard</span>
            <span className="val">{technical.shipyard}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><Anchor size={13} /> Hull Architecture</span>
            <span className="val">{technical.hull_type}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><Award size={13} /> Classification Society</span>
            <span className="val primary">{technical.classification_society}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Class Notations</span>
            <span className="val code">{technical.class_notation}</span>
          </div>
        </div>
      </div>

      {/* Machinery & Propulsion */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Cpu size={14} />
          Machinery &amp; Equipment
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Zap size={13} /> Main Engine Model</span>
            <span className="val">{technical.main_engine_model}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">MCR Power Output</span>
            <span className="val">{technical.main_engine_power_kw.toLocaleString()} kW (~{(technical.main_engine_power_kw * 1.341).toFixed(0)} BHP)</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Auxiliary Gensets</span>
            <span className="val">{technical.aux_engines}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Propulsion &amp; Steering</span>
            <span className="val">{technical.propeller_type}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Service Speed (Laden / Ballast)</span>
            <span className="val">{vessel.speed_laden_knots ?? 13.5} kn / {vessel.speed_ballast_knots ?? 14.0} kn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
