/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows 6-Pillar KPI Summary Strip
 */


import {
  Weight,
  GitCommit,
  Anchor,
  Navigation,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { FlowSummaryMetrics } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowSummaryStripProps {
  summary: FlowSummaryMetrics;
}

export function FlowSummaryStrip({ summary }: FlowSummaryStripProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* 1. Total Flow Volume */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Total Flow Volume
          </span>
          <div style={{ color: '#38bdf8' }}>
            <Weight size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
          {summary.total_volume_formatted}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
            +3.4% vs Prior
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>• {summary.active_vessels_sum} Voyages</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
          }}
        />
      </div>

      {/* 2. Active Trade Lanes */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Active Corridors
          </span>
          <div style={{ color: '#818cf8' }}>
            <GitCommit size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
          {summary.active_flows_count}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
            Avg Transit: <strong style={{ color: '#f8fafc' }}>{summary.avg_transit_days}d</strong>
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #818cf8, #a855f7)',
          }}
        />
      </div>

      {/* 3. Origin Ports */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Origin Ports
          </span>
          <div style={{ color: '#10b981' }}>
            <Anchor size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
          {summary.origin_ports_count}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
            Export Share: <strong style={{ color: '#10b981' }}>{FlowsAnalyticsEngine.formatVolumeMT(summary.export_volume_mt)}</strong>
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #10b981, #059669)',
          }}
        />
      </div>

      {/* 4. Destination Ports */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Destination Ports
          </span>
          <div style={{ color: '#f59e0b' }}>
            <Navigation size={16} />
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
          {summary.destination_ports_count}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
            Import Demand: <strong style={{ color: '#f59e0b' }}>{FlowsAnalyticsEngine.formatVolumeMT(summary.import_volume_mt || summary.total_volume_mt)}</strong>
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          }}
        />
      </div>

      {/* 5. Top Commodity */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Top Commodity
          </span>
          <div style={{ color: '#c084fc' }}>
            <Layers size={16} />
          </div>
        </div>
        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={summary.top_commodity}
        >
          {summary.top_commodity}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>
            {FlowsAnalyticsEngine.formatVolumeMT(summary.top_commodity_volume_mt)}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            ({FlowsAnalyticsEngine.calculateSafePercent(summary.top_commodity_volume_mt, summary.total_volume_mt)}% share)
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #c084fc, #9333ea)',
          }}
        />
      </div>

      {/* 6. Top Route */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Leading Corridor
          </span>
          <div style={{ color: '#06b6d4' }}>
            <ArrowRight size={16} />
          </div>
        </div>
        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={summary.top_route}
        >
          {summary.top_route}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 600 }}>
            {FlowsAnalyticsEngine.formatVolumeMT(summary.top_route_volume_mt)}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Peak Flow</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #06b6d4, #0284c7)',
          }}
        />
      </div>
    </div>
  );
}
