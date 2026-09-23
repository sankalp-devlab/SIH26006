import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Ship,
  MapPin,
  Star,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Anchor,
  Compass,
  Gauge,
} from 'lucide-react';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { useFavourites } from '../../../hooks/useFavourites';
import type { EnrichedVesselDetail } from '../../../types/vessel-detail';
import { MapDataService } from '../../../services/map/map-data.service';
import { VesselTechnicalIllustration } from './VesselTechnicalIllustration';

interface VesselHeaderProps {
  data: EnrichedVesselDetail;
}

export function VesselHeader({ data }: VesselHeaderProps) {
  const { vessel, commercial } = data;
  const navigate = useNavigate();
  const { isFavourite, toggle: toggleFavourite } = useFavourites();

  const [copiedImo, setCopiedImo] = useState(false);

  const [vesselPos] = MapDataService.enrichVesselsWithPositions([vessel]);
  const vesselPath = `/vessels/${vessel.id}`;
  const isFav = isFavourite(vesselPath);

  const handleCopyImo = () => {
    if (vessel.imo_number) {
      navigator.clipboard.writeText(vessel.imo_number);
      setCopiedImo(true);
      setTimeout(() => setCopiedImo(false), 2000);
    }
  };

  const handleToggleFav = () => {
    toggleFavourite({
      id: `vessel-${vessel.id}`,
      name: vessel.name,
      path: vesselPath,
      icon: 'Ship',
    });
  };

  const latStr = vesselPos?.latitude != null
    ? vesselPos.latitude >= 0 ? `${vesselPos.latitude.toFixed(2)}° N` : `${Math.abs(vesselPos.latitude).toFixed(2)}° S`
    : '—';
  const lngStr = vesselPos?.longitude != null
    ? vesselPos.longitude >= 0 ? `${vesselPos.longitude.toFixed(2)}° E` : `${Math.abs(vesselPos.longitude).toFixed(2)}° W`
    : '—';

  return (
    <header className="vdb-header">
      {/* Top Breadcrumb Nav */}
      <div className="vdb-breadcrumb-bar">
        <Link to="/vessels" className="vdb-back-link">
          <ArrowLeft size={14} />
          <span>Fleet Registry</span>
        </Link>
        <span className="vdb-breadcrumb-separator">/</span>
        <span className="vdb-breadcrumb-current">{vessel.name}</span>
      </div>

      {/* Main Identity Row */}
      <div className="vdb-identity-row">
        <div className="vdb-identity-left">
          <div className="vdb-avatar">
            <Ship size={26} />
          </div>
          <div className="vdb-title-meta">
            <div className="vdb-name-badge-row">
              <h1 className="vdb-vessel-name">{vessel.name}</h1>
              <StatusBadge status={vessel.status} />
            </div>
            <div className="vdb-tags-row">
              {vessel.imo_number && (
                <span className="vdb-imo-pill">
                  IMO {vessel.imo_number}
                  <button
                    type="button"
                    onClick={handleCopyImo}
                    className="vdb-mini-copy-btn"
                    title="Copy IMO Number"
                    aria-label="Copy IMO"
                  >
                    {copiedImo ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                  </button>
                </span>
              )}
              <span className="vdb-dot">&middot;</span>
              <span className="vdb-meta-tag">{vessel.vessel_type || 'Bulk Carrier'}</span>
              <span className="vdb-dot">&middot;</span>
              <span className="vdb-meta-tag">{vessel.flag || 'Liberia'}</span>
              <span className="vdb-dot">&middot;</span>
              <span className="vdb-meta-tag">
                {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT DWT` : '—'}
              </span>
              {vessel.year_built && (
                <>
                  <span className="vdb-dot">&middot;</span>
                  <span className="vdb-meta-tag">Built {vessel.year_built}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="vdb-actions-right">
          <button
            type="button"
            className="btn btn-primary btn-sm vdb-action-btn"
            onClick={() => navigate(`/map?vessel=${vessel.id}`)}
            title="Track vessel on Live Geospatial Map"
          >
            <MapPin size={14} />
            <span>Track on Live Map</span>
          </button>

          <button
            type="button"
            className={`btn btn-secondary btn-sm vdb-star-btn ${isFav ? 'active' : ''}`}
            onClick={handleToggleFav}
            title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label="Toggle Watchlist"
          >
            <Star size={14} fill={isFav ? '#fbbf24' : 'none'} color={isFav ? '#fbbf24' : '#94a3b8'} />
            <span>{isFav ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Technical Blueprint Vessel Illustration Banner */}
      <VesselTechnicalIllustration
        vessel={vessel}
        loa={data.technical.loa_m}
        beam={data.technical.beam_m}
        draft={data.technical.summer_draft_m}
      />

      {/* Persistent Live Telemetry Ribbon */}
      <div className="vdb-telemetry-ribbon" role="region" aria-label="Live Telemetry Ribbon">
        <div className="vdb-telemetry-card">
          <div className="vdb-telemetry-card-top">
            <MapPin size={13} className="vdb-cyan" />
            <span className="vdb-telemetry-card-label">POSITION</span>
          </div>
          <div className="vdb-telemetry-card-val highlight font-mono">{latStr}</div>
          <div className="vdb-telemetry-card-sub font-mono">{lngStr}</div>
        </div>

        <div className="vdb-telemetry-card">
          <div className="vdb-telemetry-card-top">
            <Gauge size={13} className="vdb-cyan" />
            <span className="vdb-telemetry-card-label">SOG SPEED</span>
          </div>
          <div className="vdb-telemetry-card-val font-mono">
            {vesselPos?.speed_knots != null ? `${vesselPos.speed_knots.toFixed(1)} kn` : '14.0 kn'}
          </div>
          <div className="vdb-telemetry-card-sub">Speed Over Ground</div>
        </div>

        <div className="vdb-telemetry-card">
          <div className="vdb-telemetry-card-top">
            <Compass size={13} className="vdb-cyan" />
            <span className="vdb-telemetry-card-label">COG COURSE</span>
          </div>
          <div className="vdb-telemetry-card-val font-mono">
            {vesselPos?.heading != null ? `${vesselPos.heading}°` : '154°'}
          </div>
          <div className="vdb-telemetry-card-sub">Course Over Ground</div>
        </div>

        <div className="vdb-telemetry-card">
          <div className="vdb-telemetry-card-top">
            <Anchor size={13} className="vdb-cyan" />
            <span className="vdb-telemetry-card-label">CURRENT DRAFT</span>
          </div>
          <div className="vdb-telemetry-card-val font-mono">
            {vessel.draft_m != null ? `${vessel.draft_m.toFixed(1)} m` : '12.8 m'}
          </div>
          <div className="vdb-telemetry-card-sub">Scantling Draft</div>
        </div>

        <div className="vdb-telemetry-card highlight-card">
          <div className="vdb-telemetry-card-top">
            <Calendar size={13} className="vdb-cyan" />
            <span className="vdb-telemetry-card-label">DESTINATION / ETA</span>
          </div>
          <div className="vdb-telemetry-card-val font-semibold">
            {commercial.current_voyage.destination_port}
          </div>
          <div className="vdb-telemetry-card-sub font-mono text-emerald">
            ETA {commercial.current_voyage.eta_date}
          </div>
        </div>
      </div>
    </header>
  );
}
