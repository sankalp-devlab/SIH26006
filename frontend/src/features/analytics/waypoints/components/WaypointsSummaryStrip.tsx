/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Executive Summary Strip (5 KPI Cards)
 */

import {
  Compass,
  Ship,
  Clock,
  AlertTriangle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import type { WaypointSummaryMetrics } from '../../../../types/waypoints';

interface WaypointsSummaryStripProps {
  summary: WaypointSummaryMetrics;
  onSelectBottleneck?: (id: string) => void;
}

export function WaypointsSummaryStrip({
  summary,
  onSelectBottleneck,
}: WaypointsSummaryStripProps) {
  const getCongestionColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 35) return '#eab308';
    return '#10b981';
  };

  const getCongestionLabel = (score: number) => {
    if (score >= 70) return 'Severe Delays';
    if (score >= 50) return 'Elevated Queue';
    if (score >= 35) return 'Moderate Flow';
    return 'Nominal Flow';
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Card 1: Active Chokepoints */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Monitored Chokepoints
          </span>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
            }}
          >
            <Compass size={16} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {summary.activeChokepointsCount}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>of 34 configured</span>
        </div>
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
            100% AIS Coverage Active
          </span>
        </div>
      </div>

      {/* Card 2: In-Zone Vessel Traffic */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Fleet In Transit Zone
          </span>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: 'rgba(129, 140, 248, 0.12)',
              color: '#818cf8',
            }}
          >
            <Ship size={16} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {summary.totalVesselsInChokepoints.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>vessels</span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <strong style={{ color: '#a5b4fc' }}>{summary.totalTransits24h.toLocaleString()}</strong> transits recorded in past 24h
        </div>
      </div>

      {/* Card 3: Queues & Waiting Vessels */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Anchorage & Queues
          </span>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
            }}
          >
            <Clock size={16} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
            {summary.totalWaitingVessels.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>vessels queued</span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Waiting share: <strong style={{ color: '#f8fafc' }}>
            {((summary.totalWaitingVessels / (summary.totalVesselsInChokepoints || 1)) * 100).toFixed(1)}%
          </strong> of active fleet
        </div>
      </div>

      {/* Card 4: Global Congestion Index */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Congestion Index
          </span>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: `${getCongestionColor(summary.globalCongestionIndex)}22`,
              color: getCongestionColor(summary.globalCongestionIndex),
            }}
          >
            <Activity size={16} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: getCongestionColor(summary.globalCongestionIndex),
            }}
          >
            {summary.globalCongestionIndex}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 100 benchmark</span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: getCongestionColor(summary.globalCongestionIndex) }}>
          Status: <strong>{getCongestionLabel(summary.globalCongestionIndex)}</strong>
        </div>
      </div>

      {/* Card 5: Cape Detour & Top Bottleneck */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Critical Bottleneck
          </span>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={16} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              if (summary.topBottleneckId && onSelectBottleneck) {
                onSelectBottleneck(summary.topBottleneckId);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#f8fafc',
              fontSize: '1.15rem',
              fontWeight: 700,
            }}
          >
            <span>{summary.topBottleneckName}</span>
            <ArrowUpRight size={15} color="#38bdf8" />
          </button>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Cape Detour Share: <strong style={{ color: '#f59e0b' }}>{summary.capeDetourVolumePct}%</strong> vs Suez
        </div>
      </div>
    </div>
  );
}
