/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Movement Drivers & Attribution Breakdown
 */

import {
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { ValuationDriver } from '../../../../types/valuations';

interface ValuationMovementAnalyticsProps {
  drivers: ValuationDriver[];
}

export function ValuationMovementAnalytics({ drivers }: ValuationMovementAnalyticsProps) {
  if (!drivers || drivers.length === 0) return null;

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            VALUATION MOVEMENT & ATTRIBUTION DRIVERS
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Quantitative factor breakdown explaining asset valuation premium, depreciation, and market shifts
          </p>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.875rem',
        }}
      >
        {drivers.map((drv) => {
          const isPos = drv.direction === 'positive';
          const isNeg = drv.direction === 'negative';

          return (
            <div
              key={drv.id}
              style={{
                background: '#0a111c',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', flex: 1, paddingRight: '8px' }}>
                    {drv.name}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: isPos ? 'rgba(16, 185, 129, 0.15)' : isNeg ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: isPos ? '#10b981' : isNeg ? '#ef4444' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isPos ? <TrendingUp size={12} /> : isNeg ? <TrendingDown size={12} /> : null}
                    <span>{isPos ? '+' : ''}{drv.impactPct}%</span>
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {drv.explanation}
                </p>
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#1e293b',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.abs(drv.impactPct) * 4)}%`,
                    background: isPos ? '#10b981' : isNeg ? '#ef4444' : '#64748b',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
