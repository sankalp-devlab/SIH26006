/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Historical Comparison Workspace Tab
 * Benchmark comparisons across macro cycles: Current vs 1Y, 3Y, 5Y, and 10Y horizons.
 */

import { History } from 'lucide-react';
import type { HistoricalComparisonItem } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface HistoricalComparisonTabProps {
  comparisonData: HistoricalComparisonItem[];
}

export function HistoricalComparisonTab({
  comparisonData,
}: HistoricalComparisonTabProps) {
  const items = Array.isArray(comparisonData) ? comparisonData : [];
  const maxOrderbookPct = Math.max(...items.map((i) => i.orderbook_to_fleet_pct), 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Historical Cycle Context Banner */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <History size={18} color="#38bdf8" />
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: 0,
            }}
          >
            Macro Orderbook Cycle Comparison (Current vs 1Y, 3Y, 5Y, 10Y Ago)
          </h2>
        </div>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary, #94a3b8)',
            margin: 0,
            maxWidth: '840px',
          }}
        >
          Analyzing structural shipbuilding cycles, from the historic post-GFC oversupply peaks
          (50%+ orderbook-to-fleet ratio in 2008) down to the 2016/2021 ordering troughs and
          today&apos;s disciplined green-fuel replacement phase.
        </p>

        {/* SVG Multi-Period Ratio Comparison Bar */}
        <div style={{ marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <svg viewBox="0 0 900 200" style={{ width: '100%', minWidth: '600px', height: 'auto' }}>
            {/* Horizontal Grid */}
            {[5, 10, 15, 20].map((val) => (
              <line
                key={val}
                x1="40"
                y1={160 - (val / maxOrderbookPct) * 120}
                x2="860"
                y2={160 - (val / maxOrderbookPct) * 120}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {items.map((item, index) => {
              const x = 70 + index * 165;
              const barWidth = 48;
              const barHeight = (item.orderbook_to_fleet_pct / maxOrderbookPct) * 120;
              const y = 160 - barHeight;
              const isCurrent = index === 0;

              return (
                <g key={item.period_label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={isCurrent ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)'}
                    rx="4"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill={isCurrent ? '#38bdf8' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight="700"
                  >
                    {item.orderbook_to_fleet_pct.toFixed(1)}%
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y="178"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10.5"
                    fontWeight="600"
                  >
                    {item.period_label}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y="190"
                    textAnchor="middle"
                    fill="var(--color-text-muted, #64748b)"
                    fontSize="9"
                  >
                    Year {item.year}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #f8fafc)',
            margin: '0 0 1rem 0',
          }}
        >
          Historical Cycle Comparison Matrix
        </h3>

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
              <th style={{ padding: '0.65rem 0.75rem' }}>Horizon</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Calendar Year</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Active Trading Fleet</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Orderbook DWT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Orderbook / Fleet Ratio</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Annual Deliveries</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Annual Demolitions</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Avg Newbuild Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const isCurrent = idx === 0;
              return (
                <tr
                  key={item.period_label}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    background: isCurrent ? 'rgba(56, 189, 248, 0.06)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                    {item.period_label}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>{item.year}</td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                    {OrderbookAnalyticsEngine.formatDwt(item.active_fleet_dwt)}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                    {OrderbookAnalyticsEngine.formatDwt(item.orderbook_dwt)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          item.orderbook_to_fleet_pct > 15
                            ? '#f59e0b'
                            : item.orderbook_to_fleet_pct < 10
                            ? '#10b981'
                            : '#38bdf8',
                      }}
                    >
                      {item.orderbook_to_fleet_pct.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#10b981' }}>
                    +{OrderbookAnalyticsEngine.formatDwt(item.annual_deliveries_dwt)}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#f43f5e' }}>
                    -{OrderbookAnalyticsEngine.formatDwt(item.annual_demolitions_dwt)}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    {OrderbookAnalyticsEngine.formatUsdMillions(item.avg_newbuilding_price_usd_m)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
