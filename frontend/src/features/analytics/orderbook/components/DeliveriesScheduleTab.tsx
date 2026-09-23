/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Forward Deliveries Schedule & Timeline Workspace Tab
 * Projects quarterly delivery flows (2026-2030) with sector stacking and yard slippage risk.
 */

import { useState } from 'react';
import {
  CalendarClock,
  AlertCircle,
  Ship,
  CheckCircle,
} from 'lucide-react';
import type { DeliveryRecord } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface DeliveriesScheduleTabProps {
  deliveries: DeliveryRecord[];
  deliveryTimeline: ReturnType<typeof OrderbookAnalyticsEngine.buildDeliveryTimeline>;
}

export function DeliveriesScheduleTab({
  deliveries,
  deliveryTimeline,
}: DeliveriesScheduleTabProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);

  const timeline = Array.isArray(deliveryTimeline) ? deliveryTimeline : [];
  const maxQuarterDwt = Math.max(...timeline.map((t) => t.total_dwt), 1);

  const filteredDeliveries = selectedQuarter
    ? deliveries.filter((d) => d.delivery_quarter === selectedQuarter)
    : deliveries;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quarterly Forward Deliveries Bar Chart */}
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
              <CalendarClock size={18} color="#10b981" />
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #f8fafc)',
                  margin: 0,
                }}
              >
                Forward Scheduled Deliveries Pipeline (2026 – 2029+)
              </h2>
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary, #94a3b8)',
                margin: '0.25rem 0 0 0',
              }}
            >
              Quarterly fleet injection timeline by Deadweight Tonnage with multi-sector composition.
            </p>
          </div>

          {/* Sector Legend */}
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
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#38bdf8' }} />
              <span>Dry Bulk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
              <span>Tankers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
              <span>Gas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#c084fc' }} />
              <span>Container</span>
            </div>
          </div>
        </div>

        {/* SVG Quarterly Stacked Timeline */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <svg
            viewBox="0 0 960 260"
            style={{ width: '100%', minWidth: '700px', height: 'auto' }}
          >
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map((frac, idx) => (
              <line
                key={idx}
                x1="40"
                y1={200 - frac * 150}
                x2="920"
                y2={200 - frac * 150}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {timeline.map((item, index) => {
              const x = 60 + index * 80;
              const barWidth = 36;
              const isSelected = selectedQuarter === item.quarter;

              // Stack segment heights
              const totalH = Math.min((item.total_dwt / maxQuarterDwt) * 150, 150);
              const dryH = item.total_dwt > 0 ? (item.dry_dwt / item.total_dwt) * totalH : 0;
              const tankerH = item.total_dwt > 0 ? (item.tanker_dwt / item.total_dwt) * totalH : 0;
              const gasH = item.total_dwt > 0 ? (item.gas_dwt / item.total_dwt) * totalH : 0;
              const contH = item.total_dwt > 0 ? (item.container_dwt / item.total_dwt) * totalH : 0;

              let curY = 200;

              return (
                <g
                  key={item.quarter}
                  onClick={() =>
                    setSelectedQuarter(selectedQuarter === item.quarter ? null : item.quarter)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Glow */}
                  {isSelected && (
                    <rect
                      x={x - 6}
                      y="30"
                      width={barWidth + 12}
                      height="180"
                      fill="rgba(56, 189, 248, 0.1)"
                      rx="4"
                    />
                  )}

                  {/* Dry Segment */}
                  {dryH > 0 && (
                    <rect
                      x={x}
                      y={(curY -= dryH)}
                      width={barWidth}
                      height={dryH}
                      fill="#38bdf8"
                      rx={tankerH === 0 && gasH === 0 && contH === 0 ? 3 : 0}
                    />
                  )}

                  {/* Tanker Segment */}
                  {tankerH > 0 && (
                    <rect
                      x={x}
                      y={(curY -= tankerH)}
                      width={barWidth}
                      height={tankerH}
                      fill="#f59e0b"
                      rx={gasH === 0 && contH === 0 ? 3 : 0}
                    />
                  )}

                  {/* Gas Segment */}
                  {gasH > 0 && (
                    <rect
                      x={x}
                      y={(curY -= gasH)}
                      width={barWidth}
                      height={gasH}
                      fill="#10b981"
                      rx={contH === 0 ? 3 : 0}
                    />
                  )}

                  {/* Container Segment */}
                  {contH > 0 && (
                    <rect
                      x={x}
                      y={(curY -= contH)}
                      width={barWidth}
                      height={contH}
                      fill="#c084fc"
                      rx={3}
                    />
                  )}

                  {/* Top DWT Label */}
                  {item.total_dwt > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={200 - totalH - 6}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {OrderbookAnalyticsEngine.formatDwt(item.total_dwt)}
                    </text>
                  )}

                  {/* Quarter Label on X Axis */}
                  <text
                    x={x + barWidth / 2}
                    y="218"
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '500'}
                  >
                    {item.quarter}
                  </text>

                  {/* Vessel Count sub-label */}
                  <text
                    x={x + barWidth / 2}
                    y="230"
                    textAnchor="middle"
                    fill="var(--color-text-muted, #64748b)"
                    fontSize="8.5"
                  >
                    {item.total_vessels} ships
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Quarter Filter Pill */}
        {selectedQuarter && (
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.85rem',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: '#38bdf8' }}>
              Filtering to deliveries scheduled for <strong>{selectedQuarter}</strong>
            </span>
            <button
              onClick={() => setSelectedQuarter(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline',
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Deliveries Scheduled Roster */}
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
            <Ship size={16} color="#38bdf8" />
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #f8fafc)',
                margin: 0,
              }}
            >
              Scheduled Delivery Events ({filteredDeliveries.length} entries)
            </h3>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted, #64748b)',
            }}
          >
            Yard congestion & engine lead-time slippage monitors active
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
              <th style={{ padding: '0.65rem 0.75rem' }}>Hull / ID</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Vessel Name</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Sector & Class</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Shipyard & Country</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Owner</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Capacity DWT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Delivery Target</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Delivery Type</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Slippage Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((d) => {
              const isDelivered = d.delivery_type === 'actual';
              return (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <td
                    style={{
                      padding: '0.65rem 0.75rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#38bdf8',
                    }}
                  >
                    {d.hull_number}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                    {d.vessel_name}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                    {d.vessel_class} ({d.sector})
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                    {d.shipyard_name}, {d.shipyard_country}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                    {d.owner_name}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                    {OrderbookAnalyticsEngine.formatDwt(d.capacity_dwt)}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                    {d.delivery_quarter} ({d.delivery_date})
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: isDelivered
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(56, 189, 248, 0.15)',
                        color: isDelivered ? '#10b981' : '#38bdf8',
                      }}
                    >
                      {d.delivery_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color:
                          d.slippage_risk === 'high'
                            ? '#ef4444'
                            : d.slippage_risk === 'medium'
                            ? '#f59e0b'
                            : '#10b981',
                      }}
                    >
                      {d.slippage_risk === 'high' ? (
                        <AlertCircle size={12} />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      <span style={{ textTransform: 'capitalize' }}>
                        {d.slippage_risk} Risk
                      </span>
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
