/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Corridors Catalog Table
 */

import { Eye } from 'lucide-react';
import type { TradeFlowRecord } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowCorridorsTabProps {
  flows: TradeFlowRecord[];
  onSelectFlow: (id: string) => void;
}

export function FlowCorridorsTab({ flows, onSelectFlow }: FlowCorridorsTabProps) {
  if (!flows || flows.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '3rem',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        No trade corridors match the current filter selection.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            Structured Trade Corridors Catalog ({flows.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Authoritative maritime trade lanes with distance, transit cycles, and volume intensity.
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Corridor Code</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Commodity</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Origin Port</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Destination Port</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Vessel Class</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Current Volume</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Distance / Transit</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Active Fleet</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((flow) => {
              const formattedVolMt = FlowsAnalyticsEngine.formatVolumeMT(flow.current_volume_mt);
              const formattedNative = FlowsAnalyticsEngine.formatNativeVolume(flow.volume_native, flow.native_unit);

              return (
                <tr
                  key={flow.id}
                  style={{
                    borderBottom: '1px solid #1e293b',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Code */}
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#38bdf8' }}>
                    {flow.trade_lane_code}
                  </td>

                  {/* Commodity */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 500 }}>{flow.commodity}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{flow.commodity_group}</div>
                  </td>

                  {/* Origin */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ color: '#f8fafc' }}>{flow.origin.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{flow.origin.country}</div>
                  </td>

                  {/* Destination */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ color: '#f8fafc' }}>{flow.destination.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{flow.destination.country}</div>
                  </td>

                  {/* Vessel Class */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {flow.primary_vessel_class}
                    </span>
                  </td>

                  {/* Volume */}
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{formattedVolMt}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formattedNative}</div>
                  </td>

                  {/* Distance / Transit */}
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ color: '#f8fafc' }}>{flow.distance_nm.toLocaleString()} NM</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>~{flow.typical_transit_days} sea days</div>
                  </td>

                  {/* Active Vessels */}
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                    {flow.active_vessel_count} vessels
                  </td>

                  {/* Action */}
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onSelectFlow(flow.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Eye size={12} />
                      Inspect
                    </button>
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
