import {
  X,
  Compass,
  Gauge,
  Anchor,
  Navigation,
  Calendar,
  Flag,
  Ruler,
  Radio,
  FileText,
  History,
  Activity,
} from 'lucide-react';
import type { VesselPosition, VesselVoyageTrack } from '../../../types/map';
import type { Vessel } from '../../../types/vessel';
import {
  VESSEL_CATEGORY_STYLES,
  getVesselCategoryKey,
} from './VesselMarker';

interface VesselDetailPanelProps {
  vessel: VesselPosition | null;
  rawVessel: Vessel | null;
  voyageTrack: VesselVoyageTrack | null;
  onClose: () => void;
  onStartHistoricalReplay?: () => void;
  isHistoricalMode?: boolean;
  onOpenFullIntelligence?: () => void;
}

export function VesselDetailPanel({
  vessel,
  rawVessel,
  voyageTrack,
  onClose,
  onStartHistoricalReplay,
  isHistoricalMode = false,
  onOpenFullIntelligence,
}: VesselDetailPanelProps) {
  if (!vessel) return null;

  const catKey = getVesselCategoryKey(vessel.vessel_type);
  const catStyle = VESSEL_CATEGORY_STYLES[catKey];
  const displayName = vessel.name.replace(/^REFERENCE-/, '');

  // Normalized heading
  const heading = Math.round(vessel.heading || 0);
  const speed = vessel.speed_knots || 0;
  const speedPercent = Math.min(Math.round((speed / 24) * 100), 100);

  // Formatting coordinates
  const latStr = `${Math.abs(vessel.latitude).toFixed(4)}° ${vessel.latitude >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(vessel.longitude).toFixed(4)}° ${vessel.longitude >= 0 ? 'E' : 'W'}`;

  // Vessel physical metrics from raw DB record or fallback
  const lengthM = rawVessel?.length_m ?? null;
  const beamM = rawVessel?.width_m ?? null;
  const dwt = rawVessel?.capacity_tons ?? vessel.capacity_tons ?? null;
  const draftM = rawVessel?.draft_m ?? vessel.draft_m ?? null;
  const flagState = rawVessel?.flag || vessel.flag || 'International';

  return (
    <aside className="vmp-detail-panel" role="dialog" aria-label={`Telemetry for ${displayName}`}>
      {/* PANEL HEADER */}
      <div className="vmp-panel-header">
        <div className="vmp-panel-header-left">
          <div className="vmp-ais-live-badge">
            <span className="vmp-ais-live-dot"></span>
            <span>LIVE AIS</span>
          </div>
          <h2 className="vmp-vessel-title">{displayName}</h2>
          <div className="vmp-vessel-meta-bar">
            {vessel.imo_number ? (
              <span className="vmp-imo-badge">IMO {vessel.imo_number}</span>
            ) : (
              <span className="vmp-imo-badge">IMO UNREGISTERED</span>
            )}
            <span
              className="vmp-type-badge"
              style={{
                color: catStyle.stroke,
                backgroundColor: catStyle.fill,
                borderColor: catStyle.stroke,
              }}
            >
              {vessel.vessel_type}
            </span>
          </div>
        </div>
        <button
          className="vmp-panel-close-btn"
          onClick={onClose}
          title="Close telemetry panel"
          aria-label="Close telemetry panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* MICRO-VISUALIZATIONS (Requirement 13) */}
      <div className="vmp-micro-vis-grid">
        {/* Visual 1: Compass Rose / Heading Indicator */}
        <div className="vmp-vis-card">
          <div className="vmp-vis-card-title">
            <Compass size={13} className="vmp-cyan-glow" />
            <span>HEADING</span>
          </div>
          <div className="vmp-compass-wrapper">
            <div className="vmp-compass-dial">
              <span className="vmp-compass-n">N</span>
              <span className="vmp-compass-e">E</span>
              <span className="vmp-compass-s">S</span>
              <span className="vmp-compass-w">W</span>
              {/* Rotating Heading Needle */}
              <div
                className="vmp-compass-needle"
                style={{ transform: `rotate(${heading}deg)` }}
              >
                <div className="vmp-needle-arrow"></div>
              </div>
            </div>
            <div className="vmp-compass-val">{heading.toString().padStart(3, '0')}°</div>
          </div>
        </div>

        {/* Visual 2: Speed Gauge */}
        <div className="vmp-vis-card">
          <div className="vmp-vis-card-title">
            <Gauge size={13} className="vmp-cyan-glow" />
            <span>SPEED (SOG)</span>
          </div>
          <div className="vmp-speed-gauge-wrap">
            <div className="vmp-speed-number">
              <span className="vmp-speed-digits">{speed.toFixed(1)}</span>
              <span className="vmp-speed-unit">knots</span>
            </div>
            <div className="vmp-speed-bar-track">
              <div
                className="vmp-speed-bar-fill"
                style={{ width: `${speedPercent}%` }}
              ></div>
            </div>
            <div className="vmp-speed-scales">
              <span>0</span>
              <span>12</span>
              <span>24+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual 3: Voyage Progress Strip */}
      <div className="vmp-voyage-strip">
        <div className="vmp-voyage-ports">
          <div className="vmp-port-col">
            <span className="vmp-port-label">ORIGIN</span>
            <span className="vmp-port-name">{vessel.origin_port || 'Underway'}</span>
          </div>
          <div className="vmp-transit-icon">
            <Navigation size={14} className="vmp-cyan-pulse" />
          </div>
          <div className="vmp-port-col text-right">
            <span className="vmp-port-label">DESTINATION</span>
            <span className="vmp-port-name">{vessel.destination_port || 'Awaiting Orders'}</span>
          </div>
        </div>
        <div className="vmp-voyage-bar">
          <div className="vmp-voyage-track-line"></div>
          <div className="vmp-voyage-vessel-pos" style={{ left: '62%' }}>
            <span className="vmp-voyage-ship-dot"></span>
          </div>
        </div>
        <div className="vmp-voyage-eta">
          <Calendar size={12} />
          <span>ETA: <strong>{vessel.eta || 'N/A'}</strong></span>
        </div>
      </div>

      {/* SCROLLABLE DETAIL SPECIFICATIONS */}
      <div className="vmp-panel-body">
        {/* SECTION: CURRENT POSITION */}
        <div className="vmp-detail-section">
          <div className="vmp-detail-section-title">CURRENT POSITION</div>
          <div className="vmp-geo-display">
            <div className="vmp-geo-coord">
              <span className="vmp-geo-dim">LAT:</span>
              <span className="vmp-geo-val">{latStr}</span>
            </div>
            <div className="vmp-geo-coord">
              <span className="vmp-geo-dim">LNG:</span>
              <span className="vmp-geo-val">{lngStr}</span>
            </div>
          </div>
          <div className="vmp-geo-sub">
            <Radio size={11} className="vmp-cyan-pulse" />
            <span>Satellite AIS &middot; {vessel.last_updated}</span>
          </div>
        </div>

        {/* SECTION: NAVIGATION */}
        <div className="vmp-detail-section">
          <div className="vmp-detail-section-title">NAVIGATION TELEMETRY</div>
          <div className="vmp-data-grid-2">
            <div className="vmp-data-cell">
              <span className="vmp-cell-label">SPEED (SOG)</span>
              <span className="vmp-cell-val highlight">{speed.toFixed(1)} kn</span>
            </div>
            <div className="vmp-data-cell">
              <span className="vmp-cell-label">HEADING (HDG)</span>
              <span className="vmp-cell-val highlight">{heading.toString().padStart(3, '0')}°</span>
            </div>
            <div className="vmp-data-cell">
              <span className="vmp-cell-label">COURSE (COG)</span>
              <span className="vmp-cell-val">{(heading - 2 + 360) % 360}°</span>
            </div>
            <div className="vmp-data-cell">
              <span className="vmp-cell-label">STATUS</span>
              <span className="vmp-cell-val status-badge">
                {vessel.status ? vessel.status.toUpperCase() : 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: VESSEL PARTICULARS */}
        <div className="vmp-detail-section">
          <div className="vmp-detail-section-title">VESSEL PARTICULARS</div>
          <div className="vmp-key-val-table">
            <div className="vmp-kv-row">
              <span className="vmp-kv-name"><Flag size={12} /> Flag State</span>
              <span className="vmp-kv-data">{flagState}</span>
            </div>
            <div className="vmp-kv-row">
              <span className="vmp-kv-name"><Ruler size={12} /> Length Overall (LOA)</span>
              <span className="vmp-kv-data">{lengthM ? `${lengthM} m` : 'Unavailable'}</span>
            </div>
            <div className="vmp-kv-row">
              <span className="vmp-kv-name"><Ruler size={12} /> Beam (Breadth)</span>
              <span className="vmp-kv-data">{beamM ? `${beamM} m` : 'Unavailable'}</span>
            </div>
            <div className="vmp-kv-row">
              <span className="vmp-kv-name"><Anchor size={12} /> Deadweight (DWT)</span>
              <span className="vmp-kv-data">
                {dwt ? `${dwt.toLocaleString()} MT` : 'Unavailable'}
              </span>
            </div>
            <div className="vmp-kv-row">
              <span className="vmp-kv-name"><Activity size={12} /> Current Draft</span>
              <span className="vmp-kv-data">{draftM ? `${draftM} m` : 'Unavailable'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL FOOTER ACTIONS */}
      <div className="vmp-panel-footer">
        {onStartHistoricalReplay && voyageTrack && (
          <button
            className={`vmp-btn-action ${isHistoricalMode ? 'active' : ''}`}
            onClick={onStartHistoricalReplay}
            title="Replay recent 24-hour AIS track"
          >
            <History size={14} />
            <span>{isHistoricalMode ? 'EXIT AIS REPLAY' : 'AIS VOYAGE REPLAY'}</span>
          </button>
        )}

        {onOpenFullIntelligence && (
          <button
            className="vmp-btn-primary"
            onClick={onOpenFullIntelligence}
            title="Open 5-domain vessel workspace"
          >
            <FileText size={14} />
            <span>FULL 5-DOMAIN INTELLIGENCE</span>
          </button>
        )}
      </div>
    </aside>
  );
}
