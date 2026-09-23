import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  Scale,
  Anchor,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface CargoTabProps {
  data: EnrichedVesselDetail;
}

export function CargoTab({ data }: CargoTabProps) {
  const { cargo } = data;
  const navigate = useNavigate();
  const current = cargo.current_cargo;
  const history = cargo.cargo_history;

  return (
    <div className="vdb-tab-pane">
      <div className="vdb-grid-2col">
        {/* 1. CURRENT STOWED CARGO MANIFEST */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Package size={16} className="text-secondary" />
              <h3 className="card-title">Current Cargo Manifest</h3>
            </div>
            <span className="badge badge-success">{current.status}</span>
          </div>

          <div className="card-body">
            <div className="vdb-cargo-highlight-box">
              <div className="commodity-name">{current.commodity}</div>
              <div className="commodity-category">{current.category}</div>
            </div>

            <div className="vdb-key-val-list" style={{ marginTop: '1rem' }}>
              <div className="vdb-kv-row highlight">
                <span className="vdb-kv-label"><Scale size={13} /> Bill of Lading Quantity</span>
                <span className="vdb-kv-val font-mono text-emerald">
                  {current.quantity_mt.toLocaleString()} Metric Tons
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Stowage Factor</span>
                <span className="vdb-kv-val font-mono">{current.stowage_factor} m³/MT</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label"><Anchor size={13} /> Port of Loading</span>
                <span className="vdb-kv-val">{current.loading_port}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label"><Anchor size={13} /> Port of Discharge</span>
                <span className="vdb-kv-val">{current.discharge_port}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label"><Calendar size={13} /> Laycan Window</span>
                <span className="vdb-kv-val font-mono">{current.laycan}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label"><AlertTriangle size={13} /> IMO Classification</span>
                <span className="vdb-kv-val text-amber text-xs font-mono">{current.hazard_class}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => navigate('/cargo')}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={13} />
                <span>Explore Global Cargo Flows & Fixtures</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. HISTORICAL CARGO SHIPMENTS */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Layers size={16} className="text-secondary" />
              <h3 className="card-title">Historical Cargo Shipments</h3>
            </div>
            <span className="badge badge-outline">Past Voyages</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Voyage</th>
                    <th>Commodity</th>
                    <th style={{ textAlign: 'right' }}>Tonnage</th>
                    <th>Discharge</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.voyage_id}>
                      <td className="font-mono text-xs">{h.voyage_id}</td>
                      <td className="font-semibold text-cyan">{h.commodity}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {h.quantity_mt.toLocaleString()} MT
                      </td>
                      <td className="text-muted text-sm">{h.completed_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
