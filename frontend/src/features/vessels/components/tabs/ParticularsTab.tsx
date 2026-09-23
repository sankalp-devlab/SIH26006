import {
  Ruler,
  Ship,
  Cpu,
  Award,
  Wrench,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface ParticularsTabProps {
  data: EnrichedVesselDetail;
}

export function ParticularsTab({ data }: ParticularsTabProps) {
  const { vessel, technical, commercial } = data;

  return (
    <div className="vdb-tab-pane">
      <div className="vdb-grid-2col">
        {/* 1. PRINCIPAL PARTICULARS & DIMENSIONS */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Ruler size={16} className="text-secondary" />
              <h3 className="card-title">Dimensions & Hull Tonnages</h3>
            </div>
            <span className="badge badge-outline">Naval Architecture</span>
          </div>
          <div className="card-body">
            <div className="vdb-key-val-list">
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Length Overall (LOA)</span>
                <span className="vdb-kv-val font-mono">{technical.loa_m ?? '—'} m</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Moulded Beam (Width)</span>
                <span className="vdb-kv-val font-mono">{technical.beam_m ?? '—'} m</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Moulded Depth</span>
                <span className="vdb-kv-val font-mono">{technical.depth_m ?? '—'} m</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Summer Scantling Draught</span>
                <span className="vdb-kv-val font-mono">{technical.summer_draft_m ?? '—'} m</span>
              </div>
              <div className="vdb-kv-row highlight">
                <span className="vdb-kv-label">Deadweight Tonnage (DWT)</span>
                <span className="vdb-kv-val font-mono text-emerald">
                  {technical.dwt_mt ? `${technical.dwt_mt.toLocaleString()} MT` : '—'}
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Gross Tonnage (GT)</span>
                <span className="vdb-kv-val font-mono">
                  {technical.gross_tonnage ? `${technical.gross_tonnage.toLocaleString()} GT` : '—'}
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Net Tonnage (NT)</span>
                <span className="vdb-kv-val font-mono">
                  {technical.net_tonnage ? `${technical.net_tonnage.toLocaleString()} NT` : '—'}
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Lightweight Tonnage (LDT)</span>
                <span className="vdb-kv-val font-mono">
                  {technical.lightweight_tons ? `${technical.lightweight_tons.toLocaleString()} MT` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SHIPBUILDING & CLASSIFICATION */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Award size={16} className="text-secondary" />
              <h3 className="card-title">Construction & Classification</h3>
            </div>
            <span className="badge badge-success">Classed & Active</span>
          </div>
          <div className="card-body">
            <div className="vdb-key-val-list">
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Year of Build</span>
                <span className="vdb-kv-val font-mono">{vessel.year_built ?? '—'}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Shipbuilder / Yard</span>
                <span className="vdb-kv-val">{technical.shipyard}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Hull Configuration</span>
                <span className="vdb-kv-val">{technical.hull_type}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Classification Society</span>
                <span className="vdb-kv-val font-semibold">{technical.classification_society}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Class Notation</span>
                <span className="vdb-kv-val font-mono text-muted text-xs">
                  {technical.class_notation}
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Flag Registry</span>
                <span className="vdb-kv-val">{vessel.flag || 'Liberia'}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Commercial Ownership</span>
                <span className="vdb-kv-val">{commercial.registered_owner}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Technical Management</span>
                <span className="vdb-kv-val">{commercial.technical_manager}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROPULSION & MACHINERY */}
        <div className="card vdb-section-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Cpu size={16} className="text-secondary" />
              <h3 className="card-title">Machinery, Engines & Auxiliary Systems</h3>
            </div>
            <span className="badge badge-outline">Tier III Compliant</span>
          </div>
          <div className="card-body">
            <div className="vdb-grid-3col">
              <div className="vdb-machinery-card">
                <div className="vdb-mach-icon"><Cpu size={18} /></div>
                <div className="vdb-mach-title">Main Engine</div>
                <div className="vdb-mach-model">{technical.main_engine_model}</div>
                <div className="vdb-mach-spec font-mono text-emerald">
                  {technical.main_engine_power_kw.toLocaleString()} kW (MCR)
                </div>
              </div>

              <div className="vdb-mach-card">
                <div className="vdb-mach-icon"><Wrench size={18} /></div>
                <div className="vdb-mach-title">Auxiliary Generators</div>
                <div className="vdb-mach-model">{technical.aux_engines}</div>
                <div className="vdb-mach-spec text-muted">Synchronized Electrical Power</div>
              </div>

              <div className="vdb-mach-card">
                <div className="vdb-mach-icon"><Ship size={18} /></div>
                <div className="vdb-mach-title">Propulsion & Thrusters</div>
                <div className="vdb-mach-model">{technical.propeller_type}</div>
                <div className="vdb-mach-spec text-cyan">
                  {technical.bow_thruster ? 'Bow Thruster Fitted (Tunnel)' : 'Conventional Tug Assisted'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
