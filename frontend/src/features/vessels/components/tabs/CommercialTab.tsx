import {
  Navigation,
  Calendar,
  Building,
  Briefcase,
  History,
  Package,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface CommercialTabProps {
  data: EnrichedVesselDetail;
}

export function CommercialTab({ data }: CommercialTabProps) {
  const { commercial } = data;
  const { current_voyage } = commercial;

  return (
    <div className="vdd-tab-pane">
      {/* Current Active Commercial Voyage */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Navigation size={14} />
          Current Commercial Voyage ({current_voyage.voyage_number})
        </h4>

        <div className="vdd-voyage-card">
          <div className="vdd-voyage-header">
            <div className="port origin">
              <span className="sub">Load Port</span>
              <span className="name">{current_voyage.origin_port}</span>
            </div>
            <div className="transit-indicator">
              <span className="badge">{current_voyage.status}</span>
              <div className="line" />
            </div>
            <div className="port destination">
              <span className="sub">Discharge Port</span>
              <span className="name">{current_voyage.destination_port}</span>
            </div>
          </div>

          <div className="vdd-voyage-grid">
            <div>
              <span className="label"><Calendar size={12} /> Departure</span>
              <span className="val">{current_voyage.departure_date}</span>
            </div>
            <div>
              <span className="label"><Calendar size={12} /> Expected Arrival (ETA)</span>
              <span className="val highlight">{current_voyage.eta_date}</span>
            </div>
            <div>
              <span className="label"><Navigation size={12} /> Distance Remaining</span>
              <span className="val">~{current_voyage.distance_to_go_nm.toLocaleString()} NM</span>
            </div>
            <div>
              <span className="label"><Package size={12} /> Cargo Manifest</span>
              <span className="val">{current_voyage.cargo_quantity_mt.toLocaleString()} MT {current_voyage.cargo_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Fixture Details */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Briefcase size={14} />
          Charter &amp; Fixture Terms
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Building size={13} /> Active Charterer</span>
            <span className="val primary">{current_voyage.charterer}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Commercial Freight Rate</span>
            <span className="val highlight">{current_voyage.fixture_rate}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Laycan Window</span>
            <span className="val">{current_voyage.laycan_window}</span>
          </div>
        </div>
      </div>

      {/* Commercial Control & Operators */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Building size={14} />
          Commercial Control &amp; Management
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key">Commercial Operator</span>
            <span className="val">{commercial.commercial_operator}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Technical Manager</span>
            <span className="val">{commercial.technical_manager}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Registered Owner</span>
            <span className="val">{commercial.registered_owner}</span>
          </div>
          {commercial.commercial_pool && (
            <div className="vdd-kv-row">
              <span className="key">Commercial Revenue Pool</span>
              <span className="val">{commercial.commercial_pool}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Voyages Table */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <History size={14} />
          Completed Fixture History
        </h4>
        <div className="vdd-history-table-wrapper">
          <table className="vdd-history-table">
            <thead>
              <tr>
                <th>Voyage ID</th>
                <th>Trade Corridor</th>
                <th>Cargo Consignment</th>
                <th>Charterer</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {commercial.recent_voyages.map((v) => (
                <tr key={v.voyage_id}>
                  <td className="code">{v.voyage_id}</td>
                  <td>
                    <span dangerouslySetInnerHTML={{ __html: v.route }} />
                  </td>
                  <td>{v.cargo}</td>
                  <td>{v.charterer}</td>
                  <td className="date">{v.completed_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
