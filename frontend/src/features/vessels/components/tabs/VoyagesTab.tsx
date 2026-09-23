import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  PlayCircle,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface VoyagesTabProps {
  data: EnrichedVesselDetail;
}

export function VoyagesTab({ data }: VoyagesTabProps) {
  const { vessel, commercial } = data;
  const navigate = useNavigate();
  const current = commercial.current_voyage;
  const history = commercial.recent_voyages;

  return (
    <div className="vdb-tab-pane">
      {/* 1. CURRENT ACTIVE VOYAGE WORKSPACE */}
      <div className="card vdb-section-card">
        <div className="card-header vdb-card-header">
          <div className="vdb-card-title-group">
            <Navigation size={16} className="text-secondary" />
            <h3 className="card-title">Active Commercial Voyage &middot; {current.voyage_number}</h3>
          </div>
          <span className="badge badge-success">{current.status}</span>
        </div>

        <div className="card-body">
          {/* Origin -> Destination Banner */}
          <div className="vdb-voyage-ports-banner">
            <div className="vdb-port-block origin">
              <div className="vdb-port-label">Origin / Loading Port</div>
              <div className="vdb-port-name">{current.origin_port}</div>
              <div className="vdb-port-date">
                <Clock size={12} /> Dep: {current.departure_date}
              </div>
            </div>

            <div className="vdb-voyage-corridor-indicator">
              <div className="vdb-corridor-line" />
              <div className="vdb-corridor-chip">
                <span>~{current.distance_to_go_nm.toLocaleString()} NM to go</span>
              </div>
              <ChevronRight size={20} className="vdb-corridor-arrow" />
            </div>

            <div className="vdb-port-block destination">
              <div className="vdb-port-label">Destination / Discharge Port</div>
              <div className="vdb-port-name">{current.destination_port}</div>
              <div className="vdb-port-date text-emerald">
                <Calendar size={12} /> ETA: {current.eta_date}
              </div>
            </div>
          </div>

          {/* Voyage Commercial Particulars Grid */}
          <div className="vdb-grid-4col" style={{ marginTop: '1.25rem' }}>
            <div className="vdb-voyage-metric-card">
              <span className="label">Charterer</span>
              <span className="val font-semibold">{current.charterer}</span>
            </div>
            <div className="vdb-voyage-metric-card">
              <span className="label">Agreed Hire Rate</span>
              <span className="val text-emerald font-mono">{current.fixture_rate}</span>
            </div>
            <div className="vdb-voyage-metric-card">
              <span className="label">Laycan Window</span>
              <span className="val font-mono">{current.laycan_window}</span>
            </div>
            <div className="vdb-voyage-metric-card">
              <span className="label">Cargo Manifest</span>
              <span className="val font-semibold text-cyan">
                {current.cargo_name} ({current.cargo_quantity_mt.toLocaleString()} MT)
              </span>
            </div>
          </div>

          {/* Action to Map */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/map?vessel=${vessel.id}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MapPin size={13} />
              <span>Inspect Voyage Trajectory on Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HISTORICAL COMPLETED VOYAGES */}
      <div className="card vdb-section-card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header vdb-card-header">
          <div className="vdb-card-title-group">
            <Calendar size={16} className="text-secondary" />
            <h3 className="card-title">Completed Voyage History</h3>
          </div>
          <span className="badge badge-outline">{history.length} Fixtures Logged</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Voyage ID</th>
                  <th>Route (Load &rarr; Discharge)</th>
                  <th>Commodity</th>
                  <th>Charterer</th>
                  <th>Discharge Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((voyage) => (
                  <tr key={voyage.voyage_id}>
                    <td className="font-mono text-xs">{voyage.voyage_id}</td>
                    <td
                      className="font-medium"
                      dangerouslySetInnerHTML={{ __html: voyage.route }}
                    />
                    <td>
                      <span className="badge badge-outline">{voyage.cargo}</span>
                    </td>
                    <td>{voyage.charterer}</td>
                    <td className="text-muted text-sm">{voyage.completed_date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/map?vessel=${vessel.id}&mode=historical`)}
                        title="Replay Historical AIS Track"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '11px' }}
                      >
                        <PlayCircle size={12} />
                        <span>Replay Track</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
