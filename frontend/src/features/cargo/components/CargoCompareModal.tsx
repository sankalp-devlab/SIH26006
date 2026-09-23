import React from 'react';
import { GitCompare, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord } from '../../../types/cargo';

interface CargoCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargos: CargoRecord[];
  onOpenDetail?: (cargo: CargoRecord) => void;
}

export const CargoCompareModal: React.FC<CargoCompareModalProps> = ({
  isOpen,
  onClose,
  cargos,
  onOpenDetail: _onOpenDetail,
}) => {
  if (!isOpen || cargos.length === 0) return null;

  const fields: Array<{ label: string; render: (c: CargoRecord) => React.ReactNode }> = [
    { label: 'Reference ID', render: (c) => <strong>{c.reference_number}</strong> },
    { label: 'Ingestion Channel', render: (c) => c.source.toUpperCase() },
    { label: 'Shipper', render: (c) => c.shipper },
    { label: 'Consignee', render: (c) => c.consignee },
    { label: 'Commodity', render: (c) => c.commodity },
    { label: 'Cargo Category', render: (c) => c.cargo_type },
    { label: 'Weight (Tonnage)', render: (c) => `${c.weight_tons.toLocaleString()} MT` },
    { label: 'Volume (m³)', render: (c) => (c.volume_m3 ? `${c.volume_m3.toLocaleString()} m³` : 'N/A') },
    { label: 'Origin Seaport', render: (c) => `${c.origin_port.name} (${c.origin_port.unlocode || c.origin_port.country})` },
    { label: 'Destination Seaport', render: (c) => `${c.destination_port.name} (${c.destination_port.unlocode || c.destination_port.country})` },
    { label: 'Corridor Zone', render: (c) => c.zone },
    { label: 'Ready Date', render: (c) => new Date(c.ready_date).toLocaleDateString() },
    { label: 'Laycan Deadline', render: (c) => new Date(c.deadline).toLocaleDateString() },
    { label: 'Priority', render: (c) => c.priority.toUpperCase() },
    { label: 'Validation Status', render: (c) => c.validation_status.toUpperCase() },
    {
      label: 'Allocated Vessel',
      render: (c) =>
        c.matched_vessel ? (
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            {c.matched_vessel.vessel_name} ({c.matched_vessel.match_score}%)
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>Unmatched</span>
        ),
    },
    { label: 'Lineup Scope', render: (c) => (c.is_private ? 'Private Lineup' : 'Market Demand') },
  ];

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

      {/* Modal Card */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
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
              <GitCompare size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Multi-Consignment Comparison Matrix
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Comparing {cargos.length} selected freight consignments across commercial, nautical, and scheduling dimensions
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

        {/* Matrix Table */}
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            marginBottom: '1.25rem',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-surface-alt)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', width: '180px', color: 'var(--color-text-muted)' }}>
                  DIMENSION
                </th>
                {cargos.map((c) => (
                  <th key={c.id} style={{ padding: '10px 14px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-brand-accent)' }}>{c.reference_number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      {c.shipper}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr
                  key={field.label}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: idx % 2 === 0 ? 'var(--color-bg-surface)' : 'var(--color-bg-surface-alt)',
                  }}
                >
                  <td style={{ padding: '8px 14px', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {field.label}
                  </td>
                  {cargos.map((c) => (
                    <td key={c.id} style={{ padding: '8px 14px' }}>
                      {field.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
};
