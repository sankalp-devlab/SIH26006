/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Notes & Operational Remarks Panel
 */

import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface VoyageNotesPanelProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const VoyageNotesPanel: React.FC<VoyageNotesPanelProps> = ({ notes, onChange }) => {
  return (
    <div className="voyage-panel-card">
      <div className="voyage-panel-header">
        <div>
          <div className="voyage-panel-title">
            <FileText size={17} style={{ color: 'var(--voyage-cyan)' }} />
            <span>Operational Remarks & Charter Party Notes</span>
          </div>
          <p className="voyage-panel-desc">
            Record charter party rider clauses, bunkering stem instructions, terminal draft constraints, and seasonal remarks.
          </p>
        </div>
      </div>

      <textarea
        className="voyage-dark-textarea"
        style={{
          width: '100%',
          minHeight: '160px',
          padding: '14px 16px',
          fontSize: '13px',
          lineHeight: 1.6,
          resize: 'vertical',
        }}
        placeholder="Enter chartering instructions, draft restrictions, weather contingencies, bunkering rendezvous coordinates, or owner requirements..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
          fontSize: '12px',
          color: 'var(--voyage-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--voyage-green)' }}>
          <CheckCircle2 size={13} />
          <span>Auto-persisted in active calculation state</span>
        </div>
        <span>{notes.length} characters recorded</span>
      </div>
    </div>
  );
};
