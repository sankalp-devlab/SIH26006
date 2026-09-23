import {
  ShieldCheck,
  CheckCircle2,
  Flag,
  Anchor,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface SanctionsTabProps {
  data: EnrichedVesselDetail;
}

export function SanctionsTab({ data }: SanctionsTabProps) {
  const { compliance, vessel } = data;

  return (
    <div className="vdb-tab-pane">
      {/* 1. MASTER SCREENING CLEARANCE BANNER */}
      <div className="card vdb-section-card">
        <div className="card-body">
          <div className="vdb-sanctions-banner clear">
            <div className="banner-icon">
              <ShieldCheck size={36} color="#10b981" />
            </div>
            <div className="banner-content">
              <div className="banner-title-row">
                <h3 className="banner-title">Sanctions Screening Status: {compliance.sanctions_status}</h3>
                <span className="badge badge-success">Audited & Verified</span>
              </div>
              <p className="banner-desc">
                Automated continuous screening of vessel IMO {vessel.imo_number || 'N/A'}, registered owner,
                and technical managers against international maritime restrictive registries returned zero hits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REGISTRY SCREENING BREAKDOWN */}
      <div className="vdb-grid-3col" style={{ marginTop: '1.25rem' }}>
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <h4 className="card-title text-sm">US Treasury OFAC SDN</h4>
            <span className="badge badge-success text-xs">PASS</span>
          </div>
          <div className="card-body">
            <p className="text-muted text-sm">
              Screened against the Specially Designated Nationals and Blocked Persons list including Venezuela, Iran & Russia maritime programs.
            </p>
            <div className="vdb-screening-meta">
              <CheckCircle2 size={14} color="#10b981" />
              <span>Zero Matches Found</span>
            </div>
          </div>
        </div>

        <div className="card-body card vdb-section-card">
          <div className="card-header vdb-card-header" style={{ padding: '0 0 0.75rem 0' }}>
            <h4 className="card-title text-sm">EU Restrictive Measures</h4>
            <span className="badge badge-success text-xs">PASS</span>
          </div>
          <p className="text-muted text-sm">
            Audited for compliance with European Union Council regulations regarding crude/petroleum price caps and dual-use cargo restrictions.
          </p>
          <div className="vdb-screening-meta">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Compliant for EU Corridors</span>
          </div>
        </div>

        <div className="card-body card vdb-section-card">
          <div className="card-header vdb-card-header" style={{ padding: '0 0 0.75rem 0' }}>
            <h4 className="card-title text-sm">UN Security Council</h4>
            <span className="badge badge-success text-xs">PASS</span>
          </div>
          <p className="text-muted text-sm">
            Verified against the United Nations Security Council Consolidated Sanctions List for international trade and maritime embargoes.
          </p>
          <div className="vdb-screening-meta">
            <CheckCircle2 size={14} color="#10b981" />
            <span>Cleared for UN Waters</span>
          </div>
        </div>
      </div>

      {/* 3. PORT STATE CONTROL & FLAG RISK */}
      <div className="vdb-grid-2col" style={{ marginTop: '1.25rem' }}>
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Anchor size={16} className="text-secondary" />
              <h3 className="card-title">Port State Control (PSC) Performance</h3>
            </div>
            <span className="badge badge-outline">Paris & Tokyo MoU</span>
          </div>
          <div className="card-body">
            <div className="vdb-key-val-list">
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Last PSC Inspection</span>
                <span className="vdb-kv-val font-mono">{compliance.last_psc_inspection_date}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Inspection Port</span>
                <span className="vdb-kv-val">{compliance.last_psc_port}</span>
              </div>
              <div className="vdb-kv-row highlight">
                <span className="vdb-kv-label">Recorded Deficiencies</span>
                <span className="vdb-kv-val font-mono text-emerald font-semibold">
                  {compliance.psc_inspection_deficiencies} Deficiencies (Clean Bill)
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Detention History</span>
                <span className="vdb-kv-val text-emerald">0 Detentions in past 36 months</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Flag size={16} className="text-secondary" />
              <h3 className="card-title">Flag State Performance & Risk</h3>
            </div>
            <span className="badge badge-success">{vessel.flag || 'Liberia'}</span>
          </div>
          <div className="card-body">
            <div className="vdb-key-val-list">
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Paris MoU Flag Rating</span>
                <span className="vdb-kv-val text-emerald font-semibold">{compliance.flag_state_risk}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Tokyo MoU Status</span>
                <span className="vdb-kv-val text-emerald">White List</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">US Coast Guard Qualship 21</span>
                <span className="vdb-kv-val">Eligible / Enrolled</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div className="text-xs text-muted font-medium mb-1">Statutory Compliance Notes</div>
              <ul className="vdb-regulatory-list">
                {compliance.regulatory_notes.map((note, idx) => (
                  <li key={idx} className="text-xs text-muted">
                    &bull; {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
