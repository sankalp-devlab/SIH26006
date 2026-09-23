/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Operational Emissions Breakdown & States Distribution
 */

import type {
  OperationalState,
} from '../../../../types/emissions';

interface OperationalStateChartProps {
  operationsSummary: {
    state: OperationalState;
    label: string;
    totalCo2Mt: number;
    percentage: number;
    fuelMt: number;
    durationHours: number;
  }[];
}

export function OperationalStateChart({ operationsSummary }: OperationalStateChartProps) {
  const stateColors: Record<OperationalState, string> = {
    at_sea: '#10b981',
    laden: '#0ea5e9',
    ballast: '#64748b',
    port: '#f59e0b',
    maneuvering: '#ec4899',
    anchored: '#8b5cf6',
    loading: '#3b82f6',
    discharging: '#06b6d4',
    waiting: '#ef4444',
    drifting: '#a855f7',
  };

  const totalCo2 = operationsSummary.reduce((a, b) => a + b.totalCo2Mt, 0) || 1;
  const totalHours = operationsSummary.reduce((a, b) => a + b.durationHours, 0) || 1;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            OPERATIONAL EMISSIONS BY OPERATING STATE
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Analysis of carbon output across navigation, port hoteling, maneuvering, and anchorage waiting
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {totalCo2.toLocaleString()} mt CO₂ &bull; {totalHours.toLocaleString()} Total Operating Hours
        </span>
      </div>

      {/* Stacked Proportional Bar */}
      <div
        style={{
          display: 'flex',
          height: '24px',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '1rem',
          background: '#1e293b',
        }}
      >
        {operationsSummary.map((op) => {
          if (op.percentage <= 0) return null;
          const col = stateColors[op.state] || '#94a3b8';
          return (
            <div
              key={op.state}
              title={`${op.label}: ${op.totalCo2Mt} mt CO₂ (${op.percentage}%)`}
              style={{
                width: `${op.percentage}%`,
                background: col,
                transition: 'width 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Operations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {operationsSummary.map((op) => {
          const col = stateColors[op.state] || '#94a3b8';
          const ratePerHour = op.durationHours > 0 ? (op.totalCo2Mt * 1000 / op.durationHours).toFixed(0) : '0';

          return (
            <div
              key={op.state}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.8125rem' }}>
                    {op.label}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                    {op.durationHours} hrs &bull; {ratePerHour} kg CO₂/hr
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: col, fontSize: '0.9375rem', fontFamily: 'var(--font-mono, monospace)' }}>
                  {op.percentage}%
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                  {op.totalCo2Mt.toLocaleString()} mt CO₂
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
