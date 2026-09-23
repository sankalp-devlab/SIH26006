/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Fleet Growth Trajectory Workspace Tab
 * Displays empirical fleet expansion formula: Beginning + Deliveries - Demolitions = Ending Fleet
 * Distinct visual styling for Historical (2020-2025), Current (2026), and Projected (2027-2030).
 */

import { useState } from 'react';
import {
  TrendingUp,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { FleetGrowthPoint } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface FleetGrowthTabProps {
  growthSeries: FleetGrowthPoint[];
  vesselClassBreakdown: ReturnType<typeof OrderbookAnalyticsEngine.aggregateByVesselClass>;
}

export function FleetGrowthTab({
  growthSeries,
  vesselClassBreakdown,
}: FleetGrowthTabProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Safeguard: Ensure valid series
  const series = Array.isArray(growthSeries) ? growthSeries : [];
  const maxFleetDwt = Math.max(...series.map((s) => s.ending_fleet_dwt), 1);
  const maxAnnualDwt = Math.max(
    ...series.map((s) => Math.max(s.deliveries_dwt, s.demolitions_dwt)),
    1
  );

  const activePoint = series.find((s) => s.year === hoveredYear) || series[series.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Fleet Growth Chart Card */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#38bdf8" />
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #f8fafc)',
                  margin: 0,
                }}
              >
                Fleet Growth Trajectory & Newbuilding Impact (2020 – 2030)
              </h2>
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary, #94a3b8)',
                margin: '0.25rem 0 0 0',
              }}
            >
              Formula:{' '}
              <strong style={{ color: '#f8fafc' }}>
                Beginning Fleet + Scheduled Deliveries – Demolitions = Ending Fleet
              </strong>
            </p>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary, #94a3b8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#10b981',
                }}
              />
              <span>Deliveries</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#f43f5e',
                }}
              />
              <span>Demolitions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '14px',
                  height: '3px',
                  background: '#38bdf8',
                }}
              />
              <span>Ending Fleet DWT</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px dashed #38bdf8',
              }}
            >
              <span>Projected (2027+)</span>
            </div>
          </div>
        </div>

        {/* SVG Visualization */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <svg
            viewBox="0 0 960 300"
            style={{ width: '100%', minWidth: '700px', height: 'auto' }}
          >
            <defs>
              <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="demolitionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
              </linearGradient>
              <pattern
                id="projectedStripe"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line stroke="rgba(56, 189, 248, 0.15)" strokeWidth="3" y2="8" />
              </pattern>
            </defs>

            {/* Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((frac, idx) => (
              <line
                key={idx}
                x1="50"
                y1={240 - frac * 180}
                x2="920"
                y2={240 - frac * 180}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Projected Horizon Background Demarcation */}
            {(() => {
              const startProjIdx = series.findIndex((s) => s.period_type === 'projected');
              if (startProjIdx >= 0) {
                const xStart = 70 + startProjIdx * 75 - 15;
                const width = (series.length - startProjIdx) * 75 + 10;
                return (
                  <g>
                    <rect
                      x={xStart}
                      y="30"
                      width={width}
                      height="210"
                      fill="url(#projectedStripe)"
                      rx="6"
                    />
                    <text
                      x={xStart + 10}
                      y="45"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="600"
                      letterSpacing="0.05em"
                    >
                      FORWARD PROJECTIONS
                    </text>
                  </g>
                );
              }
              return null;
            })()}

            {/* Columns per Year */}
            {series.map((point, index) => {
              const xCenter = 70 + index * 75;
              const barWidth = 24;

              // Deliveries Bar (drawn upwards from baseline)
              const delHeight = Math.min((point.deliveries_dwt / maxAnnualDwt) * 110, 110);
              const delY = 160 - delHeight;

              // Demolitions Bar (drawn downwards from baseline)
              const demoHeight = Math.min((point.demolitions_dwt / maxAnnualDwt) * 110, 110);
              const demoY = 160;

              const isHovered = hoveredYear === point.year;
              const isProjected = point.period_type === 'projected';
              const isCurrent = point.period_type === 'current';

              return (
                <g
                  key={point.year}
                  onMouseEnter={() => setHoveredYear(point.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Highlight Column on Hover */}
                  {isHovered && (
                    <rect
                      x={xCenter - 34}
                      y="30"
                      width="68"
                      height="220"
                      fill="rgba(56, 189, 248, 0.08)"
                      rx="4"
                    />
                  )}

                  {/* Deliveries Bar */}
                  <rect
                    x={xCenter - 14}
                    y={delY}
                    width={barWidth / 2}
                    height={Math.max(delHeight, 2)}
                    fill="url(#deliveriesGrad)"
                    rx="2"
                    stroke={isProjected ? '#10b981' : 'none'}
                    strokeDasharray={isProjected ? '2 2' : 'none'}
                  />

                  {/* Demolitions Bar */}
                  <rect
                    x={xCenter + 2}
                    y={demoY}
                    width={barWidth / 2}
                    height={Math.max(demoHeight, 2)}
                    fill="url(#demolitionsGrad)"
                    rx="2"
                    stroke={isProjected ? '#f43f5e' : 'none'}
                    strokeDasharray={isProjected ? '2 2' : 'none'}
                  />

                  {/* Year Label on Axis */}
                  <text
                    x={xCenter}
                    y="256"
                    textAnchor="middle"
                    fill={
                      isCurrent
                        ? '#38bdf8'
                        : isProjected
                        ? '#94a3b8'
                        : '#cbd5e1'
                    }
                    fontSize="11"
                    fontWeight={isCurrent || isHovered ? '700' : '500'}
                  >
                    {point.year}
                    {isCurrent ? '*' : ''}
                  </text>

                  {/* Period Badge Subtitle */}
                  <text
                    x={xCenter}
                    y="268"
                    textAnchor="middle"
                    fill={isCurrent ? '#38bdf8' : '#64748b'}
                    fontSize="9"
                  >
                    {point.period_type === 'historical'
                      ? 'Hist'
                      : point.period_type === 'current'
                      ? 'Now'
                      : 'Proj'}
                  </text>

                  {/* Deliveries Metric Top Label */}
                  {isHovered && (
                    <text
                      x={xCenter}
                      y={delY - 6}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="10"
                      fontWeight="600"
                    >
                      +{OrderbookAnalyticsEngine.formatDwt(point.deliveries_dwt)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Ending Fleet Trend Line */}
            <path
              d={series.reduce((acc, point, index) => {
                const x = 70 + index * 75;
                const y = 240 - (point.ending_fleet_dwt / maxFleetDwt) * 190;
                return `${acc} ${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* Trend Points on Line */}
            {series.map((point, index) => {
              const x = 70 + index * 75;
              const y = 240 - (point.ending_fleet_dwt / maxFleetDwt) * 190;
              const isHovered = hoveredYear === point.year;
              return (
                <circle
                  key={point.year}
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#0b0f19"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Selected Year Quick Callout */}
        {activePoint && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border-subtle, #1e293b)',
              borderRadius: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="#38bdf8" />
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                Year {activePoint.year} Focus ({activePoint.period_type.toUpperCase()}):
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Beginning: </span>
                <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>
                  {OrderbookAnalyticsEngine.formatDwt(activePoint.beginning_fleet_dwt)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+ Deliveries: </span>
                <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>
                  {OrderbookAnalyticsEngine.formatDwt(activePoint.deliveries_dwt)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>– Demolitions: </span>
                <strong style={{ color: '#f43f5e', fontSize: '0.85rem' }}>
                  {OrderbookAnalyticsEngine.formatDwt(activePoint.demolitions_dwt)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>= Ending Fleet: </span>
                <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>
                  {OrderbookAnalyticsEngine.formatDwt(activePoint.ending_fleet_dwt)}
                </strong>
              </div>
              <div
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background:
                    activePoint.growth_rate_pct >= 0
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(244, 63, 94, 0.15)',
                  color: activePoint.growth_rate_pct >= 0 ? '#10b981' : '#f43f5e',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {activePoint.growth_rate_pct >= 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                <span>
                  {activePoint.growth_rate_pct >= 0 ? '+' : ''}
                  {activePoint.growth_rate_pct.toFixed(1)}% YoY
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vessel Class Orderbook-to-Fleet Breakdown Card */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="#f59e0b" />
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: 0,
            }}
          >
            Sector Orderbook-to-Fleet Ratios & Supply Overhang Index
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {vesselClassBreakdown.map((fs) => {
            const ratio = fs.orderbook_to_fleet_pct;
            const isHeavy = ratio > 25;
            const isMedium = ratio > 15;
            const statusColor = isHeavy ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';

            return (
              <div
                key={fs.vessel_class}
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
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                    {fs.vessel_class}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: statusColor,
                    }}
                  >
                    {ratio.toFixed(1)}% Ratio
                  </span>
                </div>

                {/* Ratio Progress Bar */}
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-border-subtle, #1e293b)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(ratio * 2, 100)}%`,
                      height: '100%',
                      background: statusColor,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
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
                  <span>
                    Trading: <strong>{fs.active_vessels_count.toLocaleString()}</strong> (
                    {OrderbookAnalyticsEngine.formatDwt(fs.active_dwt)})
                  </span>
                  <span>
                    On Order: <strong>{fs.order_count}</strong> (
                    {OrderbookAnalyticsEngine.formatDwt(fs.order_dwt)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Fleet Dynamics Data Table */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Info size={16} color="#38bdf8" />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: 0,
            }}
          >
            Annual Fleet Growth & Replacement Accounting Ledger
          </h3>
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
              <th style={{ padding: '0.65rem 0.75rem' }}>Year</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Beginning Fleet</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Deliveries (+)</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Demolitions (-)</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Net Additions</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Ending Fleet</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>YoY Growth</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => {
              const isCurrent = point.period_type === 'current';
              const isProjected = point.period_type === 'projected';
              return (
                <tr
                  key={point.year}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    background: isCurrent ? 'rgba(56, 189, 248, 0.04)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    {point.year}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: isCurrent
                          ? 'rgba(56, 189, 248, 0.15)'
                          : isProjected
                          ? 'rgba(168, 85, 247, 0.15)'
                          : 'rgba(100, 116, 139, 0.15)',
                        color: isCurrent
                          ? '#38bdf8'
                          : isProjected
                          ? '#c084fc'
                          : '#94a3b8',
                      }}
                    >
                      {point.period_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                    {OrderbookAnalyticsEngine.formatDwt(point.beginning_fleet_dwt)}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#10b981', fontWeight: 600 }}>
                    +{OrderbookAnalyticsEngine.formatDwt(point.deliveries_dwt)}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#f43f5e', fontWeight: 600 }}>
                    -{OrderbookAnalyticsEngine.formatDwt(point.demolitions_dwt)}
                  </td>
                  <td
                    style={{
                      padding: '0.65rem 0.75rem',
                      fontWeight: 600,
                      color: point.net_additions_dwt >= 0 ? '#38bdf8' : '#f59e0b',
                    }}
                  >
                    {point.net_additions_dwt >= 0 ? '+' : ''}
                    {OrderbookAnalyticsEngine.formatDwt(point.net_additions_dwt)}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    {OrderbookAnalyticsEngine.formatDwt(point.ending_fleet_dwt)}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: point.growth_rate_pct >= 0 ? '#10b981' : '#f43f5e',
                      }}
                    >
                      {point.growth_rate_pct >= 0 ? '+' : ''}
                      {point.growth_rate_pct.toFixed(1)}%
                    </span>
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
