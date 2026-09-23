/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Shipyard Intelligence & Capacity Workspace Tab
 * Tracks global yard orderbook backlog, drydock utilization, and geographic market share.
 */

import { Building2, Globe2 } from 'lucide-react';
import type { ShipyardRecord } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface ShipyardsTabProps {
  shipyards: ShipyardRecord[];
}

export function ShipyardsTab({ shipyards }: ShipyardsTabProps) {
  const yards = Array.isArray(shipyards) ? shipyards : [];

  // Group by Country
  const countryBreakdown: Record<string, { share: number; dwt: number; contracts: number }> = {};
  for (const y of yards) {
    const c = y.country;
    if (!countryBreakdown[c]) {
      countryBreakdown[c] = { share: 0, dwt: 0, contracts: 0 };
    }
    countryBreakdown[c].share += y.market_share_pct || 0;
    countryBreakdown[c].dwt += y.orderbook_dwt || 0;
    countryBreakdown[c].contracts += y.total_active_orders || 0;
  }

  const sortedCountries = Object.entries(countryBreakdown).sort(
    (a, b) => b[1].share - a[1].share
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Geographic Market Share Cards */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Globe2 size={18} color="#38bdf8" />
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: 0,
            }}
          >
            Global Shipbuilding Market Share by Nation (Active Orderbook DWT)
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {sortedCountries.map(([country, data]) => {
            const flag =
              country === 'China'
                ? '🇨🇳'
                : country === 'South Korea'
                ? '🇰🇷'
                : country === 'Japan'
                ? '🇯🇵'
                : '🌍';
            const color =
              country === 'China'
                ? '#ef4444'
                : country === 'South Korea'
                ? '#38bdf8'
                : country === 'Japan'
                ? '#f59e0b'
                : '#94a3b8';

            return (
              <div
                key={country}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border-subtle, #1e293b)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {flag} {country}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color }}>
                    {data.share.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-border-subtle, #1e293b)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: `${data.share}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary, #94a3b8)',
                  }}
                >
                  <span>{data.contracts} contracted hulls</span>
                  <span>{OrderbookAnalyticsEngine.formatDwt(data.dwt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Shipyards Intelligence Table */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#38bdf8" />
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #f8fafc)',
                margin: 0,
              }}
            >
              Shipyard Group Ranking & Capacity Backlog Coverage
            </h3>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
            Drydock slots booked through 2028-2029 across major Tier-1 yards
          </div>
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '0.65rem 0.75rem' }}>Shipyard Group / Yard</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Country</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Market Share</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Orderbook DWT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Active Contracts</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Backlog Horizon</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Drydock Slots</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Core Specialization</th>
            </tr>
          </thead>
          <tbody>
            {yards.map((y) => (
              <tr
                key={y.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                }}
              >
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{y.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)' }}>
                    Group: {y.group}
                  </div>
                </td>
                <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>{y.country}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                    {y.market_share_pct.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                  {OrderbookAnalyticsEngine.formatDwt(y.orderbook_dwt)}
                </td>
                <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                  <strong>{y.total_active_orders}</strong> vessels
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {(() => {
                    const backlog = y.backlog_years ?? Math.max(y.earliest_available_slot_year - 2025, 1);
                    return (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background:
                            backlog > 3
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(56, 189, 248, 0.12)',
                          color: backlog > 3 ? '#ef4444' : '#38bdf8',
                        }}
                      >
                        {backlog.toFixed(1)} yrs backlog
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                  {y.dock_slots_count} dock slots
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {y.primary_vessel_classes.map((spec: string) => (
                      <span
                        key={spec}
                        style={{
                          fontSize: '0.675rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
