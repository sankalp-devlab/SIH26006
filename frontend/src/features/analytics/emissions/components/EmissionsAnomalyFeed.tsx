/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Emissions Hotspots & Anomaly Detection Intelligence Panel
 */

import { useState } from 'react';
import {
  ShieldAlert,
} from 'lucide-react';
import type {
  EmissionsAnomaly,
  AnomalySeverity,
} from '../../../../types/emissions';

interface EmissionsAnomalyFeedProps {
  anomalies: EmissionsAnomaly[];
  onSelectVessel: (vesselId: number) => void;
}

export function EmissionsAnomalyFeed({ anomalies, onSelectVessel }: EmissionsAnomalyFeedProps) {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AnomalySeverity>('ALL');

  const severityStyles: Record<AnomalySeverity, { bg: string; color: string; border: string }> = {
    LOW: { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
    MEDIUM: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
    HIGH: { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', border: 'rgba(249, 115, 22, 0.3)' },
    CRITICAL: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' },
  };

  const filtered = severityFilter === 'ALL' ? anomalies : anomalies.filter((a) => a.severity === severityFilter);

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
              EMISSIONS HOTSPOTS & OPERATIONAL ANOMALIES
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Automated pattern detection flagging statistical CO₂ surges, fuel burn spikes, and SECA non-compliance
            </p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div style={{ display: 'flex', gap: '4px', fontSize: '0.75rem' }}>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: severityFilter === sev ? '#0066cc' : '#0f172a',
                color: severityFilter === sev ? '#ffffff' : '#94a3b8',
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0.875rem',
        }}
      >
        {filtered.map((anomaly) => {
          const style = severityStyles[anomaly.severity];

          return (
            <div
              key={anomaly.id}
              style={{
                background: '#0f172a',
                border: `1px solid ${style.border}`,
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: style.bg,
                      color: style.color,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    {anomaly.severity} SEVERITY &bull; +{anomaly.deviationPct}%
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                    {anomaly.timestamp}
                  </span>
                </div>

                <h4 style={{ margin: '0.35rem 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                  {anomaly.title}
                </h4>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                  onClick={() => onSelectVessel(anomaly.vesselId)}
                >
                  {anomaly.vesselName} ({anomaly.imoNumber}) {anomaly.voyageId && `&bull; ${anomaly.voyageId}`}
                </div>

                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  {anomaly.explanation}
                </p>
              </div>

              {/* Recommended Action Footer */}
              <div
                style={{
                  paddingTop: '0.625rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.6875rem',
                  color: '#cbd5e1',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                }}
              >
                <strong style={{ color: '#f59e0b' }}>Action Plan: </strong>
                {anomaly.recommendedAction}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
