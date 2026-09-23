/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Volume Analytics Tab
 */

import { Layers, Anchor, Navigation, Globe, Ship } from 'lucide-react';
import type { FlowVolumeBreakdownItem, FlowSummaryMetrics } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowVolumeTabProps {
  volumeBreakdowns: {
    byCommodity: FlowVolumeBreakdownItem[];
    byOrigin: FlowVolumeBreakdownItem[];
    byDestination: FlowVolumeBreakdownItem[];
    byRegion: FlowVolumeBreakdownItem[];
    byVesselClass: FlowVolumeBreakdownItem[];
  };
  summary: FlowSummaryMetrics;
}

export function FlowVolumeTab({ volumeBreakdowns, summary }: FlowVolumeTabProps) {
  const { byCommodity, byOrigin, byDestination, byRegion, byVesselClass } = volumeBreakdowns;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Bilateral Trade Balance Overview Card */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem' }}>
          Global Maritime Bilateral Balance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Export Cargo</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', margin: '0.2rem 0' }}>
              {FlowsAnalyticsEngine.formatVolumeMT(summary.export_volume_mt)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Outbound loading across {summary.origin_ports_count} origin terminals</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Import Cargo</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', margin: '0.2rem 0' }}>
              {FlowsAnalyticsEngine.formatVolumeMT(summary.import_volume_mt || summary.total_volume_mt)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Discharge demand across {summary.destination_ports_count} import terminals</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Fleet Deployment</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', margin: '0.2rem 0' }}>
              {summary.active_vessels_sum} Vessels
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Average transit cycle: {summary.avg_transit_days} sea days</div>
          </div>
        </div>
      </div>

      {/* Grid: Multi-Dimensional Breakdowns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* 1. Volume by Commodity */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={16} style={{ color: '#c084fc' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Volume by Commodity
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {byCommodity.map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(item.volume_mt)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      background: '#c084fc',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Volume by Origin Hub */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Anchor size={16} style={{ color: '#10b981' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Top Export Load Hubs
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {byOrigin.slice(0, 6).map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(item.volume_mt)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      background: '#10b981',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Volume by Destination Hub */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Navigation size={16} style={{ color: '#f59e0b' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Top Import Discharge Hubs
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {byDestination.slice(0, 6).map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(item.volume_mt)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      background: '#f59e0b',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Volume by Vessel Class */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Ship size={16} style={{ color: '#38bdf8' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Parcel Size / Vessel Class Distribution
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {byVesselClass.map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(item.volume_mt)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      background: '#38bdf8',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Volume by Regional Corridor */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Globe size={16} style={{ color: '#818cf8' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Volume by Regional Theater
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {byRegion.map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(item.volume_mt)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, item.percentage)}%`,
                      background: '#818cf8',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
