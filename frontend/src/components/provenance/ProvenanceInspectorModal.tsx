/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Provenance Inspector & Audit Modal
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import {
  Clock,
  Lock,
  GitFork,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { DataProvenance } from '../../types/provenance';
import { ProvenanceService } from '../../services/provenance/provenance.service';

interface ProvenanceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: DataProvenance;
}

export const ProvenanceInspectorModal: React.FC<ProvenanceInspectorModalProps> = ({
  isOpen,
  onClose,
  provenance,
}) => {
  const meta = ProvenanceService.ORIGIN_METADATA[provenance.origin] || {
    label: provenance.originLabel || provenance.origin,
    category: 'Telemetry',
    description: 'Maritime observation stream',
  };

  const isPrivate = provenance.privacy === 'workspace_private';
  const hasLineage = !!provenance.lineage;
  const hasConflict = !!provenance.conflict?.hasConflict;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Provenance & Freshness Audit"
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header Summary Card */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 8,
            background: isPrivate ? 'rgba(139, 92, 246, 0.08)' : 'rgba(56, 189, 248, 0.06)',
            border: `1px solid ${isPrivate ? 'rgba(139, 92, 246, 0.25)' : 'rgba(56, 189, 248, 0.2)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: isPrivate ? '#c084fc' : '#38bdf8',
                }}
              >
                {meta.category} &middot; {provenance.derivation.replace(/_/g, ' ')}
              </span>
              {provenance.isPlannedConnector && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  Connector Planned
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 600 }}>
              {meta.label}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {meta.description}
            </p>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background:
                  provenance.freshness === 'LIVE'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : provenance.freshness === 'STALE'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                color:
                  provenance.freshness === 'LIVE'
                    ? '#34d399'
                    : provenance.freshness === 'STALE'
                    ? '#fbbf24'
                    : '#38bdf8',
                border:
                  provenance.freshness === 'LIVE'
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {provenance.freshness}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
              {provenance.ageHumanized || 'Just now'}
            </div>
          </div>
        </div>

        {/* Observation Timestamps & Privacy Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} /> Observed Timestamp (UTC)
            </div>
            <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600, marginTop: 4, fontFamily: 'monospace' }}>
              {provenance.observedAt}
            </div>
            {provenance.receivedAt && (
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                Platform Ingested: {provenance.receivedAt}
              </div>
            )}
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lock size={12} /> Privacy &amp; Tenancy Scope
            </div>
            <div style={{ fontSize: '0.88rem', color: isPrivate ? '#c084fc' : '#38bdf8', fontWeight: 600, marginTop: 4 }}>
              {isPrivate ? 'Workspace Private (Tenant Isolated)' : 'Authenticated Platform Data'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
              {isPrivate ? 'Never shared to public feeds or peer accounts' : 'Verified global maritime feed'}
            </div>
          </div>
        </div>

        {/* Data Lineage Card (If Calculated Metric) */}
        {hasLineage && provenance.lineage && (
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22d3ee', fontSize: '0.78rem', fontWeight: 700 }}>
              <GitFork size={14} /> Mathematical Lineage &amp; Input Sources
            </div>
            <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600, margin: '6px 0 2px' }}>
              {provenance.lineage.formulaName}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 10 }}>
              {provenance.lineage.formulaDescription}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {provenance.lineage.inputs.map((inp, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'rgba(0, 0, 0, 0.25)',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{inp.label}</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                    {inp.contributingValue !== undefined ? String(inp.contributingValue) : inp.sourceOrigin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflict Warning (If Conflicting Sources) */}
        {hasConflict && provenance.conflict && (
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
              <AlertTriangle size={15} /> Multi-Source Conflict Resolution
            </div>
            <p style={{ margin: '4px 0 10px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              {provenance.conflict.warningMessage}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {provenance.conflict.conflictingSources.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 4,
                    background: 'rgba(0, 0, 0, 0.3)',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>{s.label} ({s.origin})</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{String(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence & Zero-Credential Statement */}
        <div
          style={{
            padding: 12,
            borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#34d399" />
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              Zero-Credential Certified: No internal secrets or private API tokens exposed.
            </span>
          </div>
          {provenance.confidenceScore !== undefined && (
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
              {(provenance.confidenceScore * 100).toFixed(0)}% Empirical Confidence
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
