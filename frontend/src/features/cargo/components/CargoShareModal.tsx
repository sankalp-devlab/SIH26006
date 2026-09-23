import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord } from '../../../types/cargo';

interface CargoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargo: CargoRecord | null;
}

export const CargoShareModal: React.FC<CargoShareModalProps> = ({
  isOpen,
  onClose,
  cargo,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !cargo) return null;

  const recapText = `================================================
OCEAN LENS FREIGHT CONSIGNMENT RECAP
================================================
Reference:       ${cargo.reference_number}
Scope:           ${cargo.is_private ? 'PRIVATE COMPANY LINEUP' : 'PUBLIC MARKET INQUIRY'}
Source Channel:  ${cargo.source.toUpperCase()} (${cargo.source_sender || 'Platform Ingestion'})

COMMERCIAL PARTIES:
Shipper:         ${cargo.shipper}
Consignee:       ${cargo.consignee}
Commodity:       ${cargo.commodity}
Cargo Category:  ${cargo.cargo_type}

SPECIFICATIONS:
Deadweight:      ${cargo.weight_tons.toLocaleString()} ${cargo.unit}
Volume:          ${cargo.volume_m3 ? `${cargo.volume_m3.toLocaleString()} m³` : 'N/A'}

CORRIDOR & ROUTING:
Loading Seaport: ${cargo.origin_port.name} (${cargo.origin_port.unlocode || cargo.origin_port.country})
Discharge Port:  ${cargo.destination_port.name} (${cargo.destination_port.unlocode || cargo.destination_port.country})
Corridor Zone:   ${cargo.zone}

SCHEDULING:
Ready Date:      ${new Date(cargo.ready_date).toLocaleDateString()}
Laycan Canceling:${new Date(cargo.deadline).toLocaleDateString()}
Priority:        ${cargo.priority.toUpperCase()}

STATUS & ALLOCATION:
Operational:     ${cargo.status.toUpperCase()}
Validation:      ${cargo.validation_status.toUpperCase()}
Fleet Vessel:    ${cargo.matched_vessel ? `${cargo.matched_vessel.vessel_name} (${cargo.matched_vessel.imo_number}) - Match Score: ${cargo.matched_vessel.match_score}%` : 'OPEN / UNMATCHED'}
================================================
Generated via SIH 26006 Maritime Intelligence Platform
Timestamp: ${new Date().toISOString()}
================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(recapText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cargo, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${cargo.reference_number}_recap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1101,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Share Freight Consignment Recap
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Formatted chartering fixture recap ready for export to brokers, charterers, and port agents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Code/Text Recap Container */}
        <div style={{ marginBottom: '1.25rem' }}>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              lineHeight: 1.45,
              backgroundColor: 'var(--color-bg-surface-alt)',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border-subtle)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '340px',
              overflowY: 'auto',
              color: 'var(--color-text-primary)',
            }}
          >
            {recapText}
          </pre>
        </div>

        {/* Footer with Copy and Download buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={14} />}
            onClick={handleDownloadJSON}
          >
            Download JSON
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
