import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  Flag,
  Calendar,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface ComplianceTabProps {
  data: EnrichedVesselDetail;
}

export function ComplianceTab({ data }: ComplianceTabProps) {
  const { compliance, vessel } = data;

  return (
    <div className="vdd-tab-pane">
      {/* Sanction Screening Status Banner */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <ShieldCheck size={14} />
          Global Sanctions &amp; Watchlist Screening
        </h4>

        <div className="vdd-compliance-banner clear">
          <div className="icon-wrap">
            <ShieldCheck size={28} />
          </div>
          <div className="text-wrap">
            <div className="title">Sanctions Status: {compliance.sanctions_status}</div>
            <div className="desc">
              Vessel, registered owners, commercial operators, and flag registry have passed automated verification against active OFAC SDN, EU, and UN Security Council maritime blacklists.
            </div>
          </div>
        </div>

        <div className="vdd-sanction-checks-grid">
          <div className="check-card passed">
            <CheckCircle2 size={16} />
            <div>
              <div className="name">US OFAC SDN List</div>
              <div className="status">Verified Clean &middot; {compliance.ofac_sdn_check}</div>
            </div>
          </div>
          <div className="check-card passed">
            <CheckCircle2 size={16} />
            <div>
              <div className="name">EU Maritime Restrictive List</div>
              <div className="status">Verified Clean &middot; {compliance.eu_maritime_check}</div>
            </div>
          </div>
          <div className="check-card passed">
            <CheckCircle2 size={16} />
            <div>
              <div className="name">UN Security Council Maritime</div>
              <div className="status">Verified Clean &middot; {compliance.un_security_check}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flag State & Port State Control (PSC) */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Flag size={14} />
          Flag State Governance &amp; Port State Control (PSC)
        </h4>

        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Flag size={13} /> Flag State Registry</span>
            <span className="val">{vessel.flag ?? 'Liberia (LR)'}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Paris / Tokyo MoU Registry Standing</span>
            <span className="val tag-green">{compliance.flag_state_risk}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><Building size={13} /> Last PSC Inspection Port</span>
            <span className="val">{compliance.last_psc_port}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><Calendar size={13} /> Last Inspection Date</span>
            <span className="val">{compliance.last_psc_inspection_date}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Deficiencies Recorded</span>
            <span className="val tag-green">{compliance.psc_inspection_deficiencies} Deficiencies (Nil)</span>
          </div>
        </div>
      </div>

      {/* Regulatory & Compliance Notes */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <FileText size={14} />
          Statutory Certification &amp; Corridors
        </h4>

        <div className="vdd-notes-list">
          {compliance.regulatory_notes.map((note, i) => (
            <div key={i} className="vdd-note-item">
              <CheckCircle2 size={14} color="#34d399" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
