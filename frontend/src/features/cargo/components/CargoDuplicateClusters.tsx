import React from 'react';
import {
  GitMerge,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord } from '../../../types/cargo';

interface CargoDuplicateClustersProps {
  cargos: CargoRecord[];
  onOpenMerge: (primary: CargoRecord, duplicate: CargoRecord) => void;
  onOpenDetail: (cargo: CargoRecord) => void;
}

export const CargoDuplicateClusters: React.FC<CargoDuplicateClustersProps> = ({
  cargos,
  onOpenMerge,
  onOpenDetail,
}) => {
  // Group active cargos by duplicate_group_id
  const clusterMap = new Map<string, CargoRecord[]>();
  cargos.forEach((c) => {
    if (c.duplicate_group_id && c.status !== 'archived') {
      const existing = clusterMap.get(c.duplicate_group_id) || [];
      existing.push(c);
      clusterMap.set(c.duplicate_group_id, existing);
    }
  });

  const clusters = Array.from(clusterMap.entries());

  if (clusters.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={24} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          No Near-Duplicate Inquiries Detected
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '540px', lineHeight: 1.5 }}>
          The duplicate detection engine continuously analyzes incoming freight inquiries across Email, WhatsApp,
          and Slack streams. All active consignments currently represent distinct commercial parcels.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Informative Guidance Banner */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.8125rem',
          color: '#5b21b6',
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Deduplication Engine:</strong> Multi-broker circulars often introduce overlapping inquiry quotes.
          Review candidate clusters below to select the primary chartering record and merge secondary quotes without losing audit lineage.
        </span>
      </div>

      {clusters.map(([clusterId, clusterCargos]) => {
        const primary = clusterCargos.find((c) => c.status !== 'draft') || clusterCargos[0];
        const duplicates = clusterCargos.filter((c) => c.id !== primary.id);
        const info = primary.duplicate_cluster;

        return (
          <div
            key={clusterId}
            className="card"
            style={{
              padding: '1.25rem',
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-surface)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            {/* Cluster Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    CLUSTER: {clusterId}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {info?.similarity_score || 94}% Similarity Confidence
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 600, marginTop: '6px' }}>
                  {info?.reason || 'Multi-channel inquiry duplication across broker communication streams'}
                </div>
              </div>

              {duplicates.length > 0 && (
                <Button
                  size="sm"
                  icon={<GitMerge size={14} />}
                  onClick={() => onOpenMerge(primary, duplicates[0])}
                  style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none' }}
                >
                  Review & Merge Records
                </Button>
              )}
            </div>

            {/* Matching Signals Pills */}
            {info?.matching_signals && info.matching_signals.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Correlated Signals:
                </span>
                {info.matching_signals.map((sig) => (
                  <span
                    key={sig}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {sig}
                  </span>
                ))}
              </div>
            )}

            {/* Side-by-Side Candidates Comparison */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
              }}
            >
              {/* Primary Candidate Card */}
              <div
                style={{
                  border: '2px solid #8b5cf6',
                  borderRadius: '6px',
                  padding: '1rem',
                  backgroundColor: '#faf5ff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                    Primary Operational Record
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>{primary.source.toUpperCase()}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  {primary.reference_number} · {primary.shipper}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {primary.commodity}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                  <strong>Route:</strong> {primary.origin_port.name} → {primary.destination_port.name}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  <strong>Weight:</strong> {primary.weight_tons.toLocaleString()} MT
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  <strong>Laycan:</strong> {new Date(primary.ready_date).toLocaleDateString()} to {new Date(primary.deadline).toLocaleDateString()}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '2px 6px', color: '#6d28d9' }}
                    onClick={() => onOpenDetail(primary)}
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Duplicate Candidate Card(s) */}
              {duplicates.map((dup) => (
                <div
                  key={dup.id}
                  style={{
                    border: '1px dashed var(--color-border-medium)',
                    borderRadius: '6px',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Duplicate Inquiry Candidate
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{dup.source.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    {dup.reference_number} · {dup.shipper}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {dup.commodity}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                    <strong>Route:</strong> {dup.origin_port.name} → {dup.destination_port.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    <strong>Weight:</strong> {dup.weight_tons.toLocaleString()} MT
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    <strong>Laycan:</strong> {new Date(dup.ready_date).toLocaleDateString()} to {new Date(dup.deadline).toLocaleDateString()}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                      onClick={() => onOpenDetail(dup)}
                    >
                      View Details →
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#7c3aed', border: 'none' }}
                      onClick={() => onOpenMerge(primary, dup)}
                    >
                      Merge with Primary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
