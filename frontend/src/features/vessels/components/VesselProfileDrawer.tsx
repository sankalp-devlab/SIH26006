import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Compass,
  ExternalLink,
  Star,
  Ship,
  Layers,
  Ruler,
  Anchor,
  Calendar,
  Gauge,
  Activity,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import type { Vessel } from '../../../types/vessel';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { useFavourites } from '../../../hooks/useFavourites';

interface VesselProfileDrawerProps {
  vessel: Vessel | null;
  onClose: () => void;
}

type ProfileTab = 'overview' | 'specifications' | 'voyage' | 'history';

/**
 * Clean SVG silhouette for different maritime vessel categories
 */
function VesselSilhouette({ vesselType }: { vesselType: string | null }) {
  const norm = (vesselType || '').toLowerCase();

  return (
    <div className="vpd-silhouette-container">
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="vpd-silhouette-svg"
      >
        <defs>
          <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Waterline */}
        <line x1="10" y1="62" x2="310" y2="62" stroke="url(#waterGrad)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Vessel Hull Shape */}
        <path
          d="M 28 62 L 52 38 L 248 38 L 288 62 Z"
          fill="url(#shipGrad)"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />

        {norm.includes('container') ? (
          // Container Ship superstructure & bay boxes
          <>
            <rect x="65" y="20" width="30" height="18" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="102" y="16" width="30" height="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="139" y="18" width="30" height="20" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="176" y="14" width="30" height="24" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="213" y="18" width="30" height="20" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" rx="1" />
            {/* Bridge */}
            <path d="M 248 38 L 248 18 L 266 18 L 266 38 Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
            <line x1="262" y1="18" x2="262" y2="10" stroke="#38bdf8" strokeWidth="1.5" />
          </>
        ) : norm.includes('tanker') ? (
          // Tanker piping and low deck
          <>
            <path d="M 240 38 L 240 18 L 262 18 L 262 38 Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
            <line x1="258" y1="18" x2="258" y2="10" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Piping manifolds */}
            <line x1="60" y1="34" x2="236" y2="34" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="110" cy="34" r="3" fill="#38bdf8" />
            <circle cx="150" cy="34" r="3" fill="#38bdf8" />
            <circle cx="190" cy="34" r="3" fill="#38bdf8" />
          </>
        ) : (
          // Bulk Carrier / General Cargo holds and cranes
          <>
            <path d="M 244 38 L 244 16 L 268 16 L 268 38 Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
            <line x1="264" y1="16" x2="264" y2="8" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Cargo Holds / Hatches */}
            <rect x="68" y="32" width="32" height="6" fill="#075985" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="112" y="32" width="32" height="6" fill="#075985" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="156" y="32" width="32" height="6" fill="#075985" stroke="#38bdf8" strokeWidth="1" rx="1" />
            <rect x="200" y="32" width="32" height="6" fill="#075985" stroke="#38bdf8" strokeWidth="1" rx="1" />
            {/* Deck Cranes */}
            <line x1="105" y1="32" x2="105" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="105" y1="22" x2="118" y2="28" stroke="#38bdf8" strokeWidth="1" />
            <line x1="149" y1="32" x2="149" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="149" y1="22" x2="162" y2="28" stroke="#38bdf8" strokeWidth="1" />
            <line x1="193" y1="32" x2="193" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="193" y1="22" x2="206" y2="28" stroke="#38bdf8" strokeWidth="1" />
          </>
        )}
      </svg>
      <div className="vpd-silhouette-caption">
        <span>{vesselType || 'Commercial Merchant Vessel'}</span>
      </div>
    </div>
  );
}

export function VesselProfileDrawer({ vessel, onClose }: VesselProfileDrawerProps) {
  const navigate = useNavigate();
  const { isFavourite, toggle: toggleFavourite } = useFavourites();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [copiedImo, setCopiedImo] = useState(false);

  if (!vessel) return null;

  const displayName = vessel.name.replace(/^REFERENCE-/, '');
  const vesselPath = `/vessels/${vessel.id}`;
  const isFav = isFavourite(vesselPath);

  const handleCopyImo = () => {
    if (vessel.imo_number) {
      navigator.clipboard.writeText(vessel.imo_number);
      setCopiedImo(true);
      setTimeout(() => setCopiedImo(false), 2000);
    }
  };

  const handleViewLivePosition = () => {
    navigate(`/map?vessel=${vessel.id}`);
  };

  const handleOpenWorkspace = () => {
    navigate(`/vessels/${vessel.id}`);
  };

  return (
    <div className="vpd-overlay" onClick={onClose} role="presentation">
      <aside
        className="vpd-drawer"
        role="dialog"
        aria-label={`Vessel Profile: ${displayName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR / EYEBROW */}
        <div className="vpd-header">
          <div className="vpd-header-left">
            <div className="vpd-eyebrow">
              <Ship size={13} className="vpd-cyan" />
              <span>VESSEL PROFILE</span>
            </div>
            <h2 className="vpd-vessel-title">{displayName}</h2>
            <div className="vpd-header-meta">
              <StatusBadge status={vessel.status} />
              {vessel.imo_number ? (
                <span className="vpd-imo-chip">
                  IMO {vessel.imo_number}
                  <button
                    type="button"
                    className="vpd-copy-btn"
                    onClick={handleCopyImo}
                    title="Copy IMO Number"
                    aria-label="Copy IMO"
                  >
                    {copiedImo ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                  </button>
                </span>
              ) : (
                <span className="vpd-imo-chip muted">IMO UNREGISTERED</span>
              )}
              <span className="vpd-type-pill">{vessel.vessel_type || 'Bulk Carrier'}</span>
            </div>
          </div>
          <button
            type="button"
            className="vpd-close-btn"
            onClick={onClose}
            title="Close Profile Drawer"
            aria-label="Close Profile Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* VESSEL SILHOUETTE / TYPE VISUAL (Requirement 17) */}
        <div className="vpd-visual-banner">
          <VesselSilhouette vesselType={vessel.vessel_type} />
        </div>

        {/* NAVIGATION TABS (Requirement 15) */}
        <div className="vpd-tabs-bar">
          <button
            type="button"
            className={`vpd-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={13} />
            <span>OVERVIEW</span>
          </button>
          <button
            type="button"
            className={`vpd-tab-btn ${activeTab === 'specifications' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            <Ruler size={13} />
            <span>SPECIFICATIONS</span>
          </button>
          <button
            type="button"
            className={`vpd-tab-btn ${activeTab === 'voyage' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('voyage')}
          >
            <Compass size={13} />
            <span>VOYAGE</span>
          </button>
          <button
            type="button"
            className={`vpd-tab-btn ${activeTab === 'history' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Activity size={13} />
            <span>HISTORY</span>
          </button>
        </div>

        {/* TAB BODY CONTENT */}
        <div className="vpd-body">
          {activeTab === 'overview' && (
            <div className="vpd-tab-content">
              {/* SECTION: IDENTITY */}
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Ship size={13} className="vpd-cyan" />
                  <span>IDENTITY</span>
                </div>
                <div className="vpd-kv-grid">
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Vessel Name</span>
                    <span className="vpd-v highlight">{displayName}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">IMO Number</span>
                    <span className="vpd-v font-mono">{vessel.imo_number || 'Unavailable'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Flag State</span>
                    <span className="vpd-v">{vessel.flag || 'Liberia'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Type / Class</span>
                    <span className="vpd-v">{vessel.vessel_type || 'Bulk Carrier'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Operational Status</span>
                    <span className="vpd-v capitalize">{vessel.status || 'Active'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Registry Database ID</span>
                    <span className="vpd-v font-mono">VES-{vessel.id.toString().padStart(5, '0')}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: CAPACITY */}
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Anchor size={13} className="vpd-cyan" />
                  <span>CAPACITY &amp; TONNAGE</span>
                </div>
                <div className="vpd-kv-grid">
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Deadweight (DWT)</span>
                    <span className="vpd-v font-mono highlight">
                      {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Cargo Commodites</span>
                    <span className="vpd-v">{vessel.cargo_types || 'General Bulk Cargo'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: DIMENSIONS */}
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Ruler size={13} className="vpd-cyan" />
                  <span>DIMENSIONS</span>
                </div>
                <div className="vpd-kv-grid">
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Length Overall (LOA)</span>
                    <span className="vpd-v font-mono">{vessel.length_m ? `${vessel.length_m} m` : 'Unavailable'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Beam (Width)</span>
                    <span className="vpd-v font-mono">{vessel.width_m ? `${vessel.width_m} m` : 'Unavailable'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Max Design Draft</span>
                    <span className="vpd-v font-mono">{vessel.draft_m ? `${vessel.draft_m} m` : 'Unavailable'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="vpd-tab-content">
              {/* SECTION: BUILD & CLASSIFICATION */}
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Calendar size={13} className="vpd-cyan" />
                  <span>BUILD PARTICULARS</span>
                </div>
                <div className="vpd-kv-grid">
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Year Built</span>
                    <span className="vpd-v font-mono">{vessel.year_built || 'Unavailable'}</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Shipyard / Builder</span>
                    <span className="vpd-v muted">Data unavailable</span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Classification Society</span>
                    <span className="vpd-v muted">Data unavailable</span>
                  </div>
                </div>
              </div>

              {/* SECTION: PROPULSION & SPEED */}
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Gauge size={13} className="vpd-cyan" />
                  <span>PROPULSION &amp; SPEED</span>
                </div>
                <div className="vpd-kv-grid">
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Speed Laden</span>
                    <span className="vpd-v font-mono">
                      {vessel.speed_laden_knots ? `${vessel.speed_laden_knots} knots` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Speed Ballast</span>
                    <span className="vpd-v font-mono">
                      {vessel.speed_ballast_knots ? `${vessel.speed_ballast_knots} knots` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Fuel Consumption (Laden)</span>
                    <span className="vpd-v font-mono">
                      {vessel.fuel_laden_mt_day ? `${vessel.fuel_laden_mt_day} MT/day` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="vpd-kv-item">
                    <span className="vpd-k">Fuel Consumption (Ballast)</span>
                    <span className="vpd-v font-mono">
                      {vessel.fuel_ballast_mt_day ? `${vessel.fuel_ballast_mt_day} MT/day` : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voyage' && (
            <div className="vpd-tab-content">
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Compass size={13} className="vpd-cyan" />
                  <span>CURRENT VOYAGE &amp; TELEMETRY</span>
                </div>
                <div className="vpd-voyage-notice">
                  <Radio size={16} className="vpd-cyan" />
                  <div>
                    <p className="vpd-voyage-notice-title">Live AIS Voyage Telemetry</p>
                    <p className="vpd-voyage-notice-desc">
                      Real-time geographic positions, destination ETA, and waypoint corridors are monitored on the Live Vessel Map.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="vpd-btn-action-primary"
                  onClick={handleViewLivePosition}
                >
                  <Compass size={15} />
                  <span>VIEW LIVE POSITION ON MAP</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="vpd-tab-content">
              <div className="vpd-section">
                <div className="vpd-section-heading">
                  <Activity size={13} className="vpd-cyan" />
                  <span>HISTORICAL AUDIT LOGS</span>
                </div>
                <div className="vpd-empty-tab">
                  <p>Historical port calls and fixture records for this vessel are currently indexing.</p>
                  <span className="vpd-badge-subtle">Data status: Verified base registry</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS (Requirement 16) */}
        <div className="vpd-footer">
          <button
            type="button"
            className="vpd-btn-primary"
            onClick={handleViewLivePosition}
            title="Open Live Vessel Map focused on this vessel"
          >
            <Compass size={15} />
            <span>VIEW LIVE POSITION</span>
          </button>
          <button
            type="button"
            className="vpd-btn-secondary"
            onClick={handleOpenWorkspace}
            title="Open Deep Technical Dashboard Workspace"
          >
            <ExternalLink size={14} />
            <span>TECHNICAL WORKSPACE</span>
          </button>
          <button
            type="button"
            className={`vpd-btn-icon ${isFav ? 'is-fav' : ''}`}
            onClick={() => toggleFavourite({ id: vesselPath, name: displayName, path: vesselPath })}
            title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label="Toggle Watchlist"
          >
            <Star size={16} fill={isFav ? '#fbbf24' : 'none'} color={isFav ? '#fbbf24' : '#94a3b8'} />
          </button>
        </div>
      </aside>
    </div>
  );
}
