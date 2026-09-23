/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Granular Detail Drawer
 * Comprehensive metadata, historical observations, and cross-module deep links.
 */

import {
  X,
  Anchor,
  Navigation,
  Ruler,
  TrendingUp,
  ExternalLink,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TradeFlowRecord } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowDetailDrawerProps {
  flow: TradeFlowRecord | null;
  onClose: () => void;
}

export function FlowDetailDrawer({ flow, onClose }: FlowDetailDrawerProps) {
  const navigate = useNavigate();

  if (!flow) return null;

  const formattedVolMt = FlowsAnalyticsEngine.formatVolumeMT(flow.current_volume_mt);
  const formattedNative = FlowsAnalyticsEngine.formatNativeVolume(flow.volume_native, flow.native_unit);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 480,
        maxWidth: '90vw',
        background: 'var(--color-bg-surface, #0f172a)',
        borderLeft: '1px solid var(--color-border-subtle, #1e293b)',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1e293b',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '0.15rem 0.4rem',
                borderRadius: 4,
              }}
            >
              {flow.trade_lane_code}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Mode: <strong style={{ color: '#f8fafc' }}>{flow.mode}</strong>
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0.25rem 0 0' }}>
            {flow.commodity} Corridor
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: 6,
          }}
          title="Close drawer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        {/* Origin & Destination Route Banner */}
        <div
          style={{
            background: 'var(--color-bg-surface-alt, #1e293b)',
            border: '1px solid var(--color-border-subtle, #334155)',
            borderRadius: 8,
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Origin */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.72rem', fontWeight: 600 }}>
              <Anchor size={12} />
              LOAD PORT
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {flow.origin.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {flow.origin.country} {flow.origin.unlocode ? `(${flow.origin.unlocode})` : ''}
            </div>
          </div>

          <div style={{ padding: '0 0.75rem', color: '#64748b' }}>&rarr;</div>

          {/* Destination */}
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>
              <Navigation size={12} />
              DISCHARGE PORT
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {flow.destination.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {flow.destination.country} {flow.destination.unlocode ? `(${flow.destination.unlocode})` : ''}
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Volume Throughput</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', margin: '0.15rem 0' }}>
              {formattedVolMt}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{formattedNative}</div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Fleet</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', margin: '0.15rem 0' }}>
              {flow.active_vessel_count} Vessels
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Primary: {flow.primary_vessel_class}</div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Nautical Distance</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: '0.15rem 0' }}>
              {flow.distance_nm.toLocaleString()} NM
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Direct routing</div>
          </div>

          <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Average Transit</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: '0.15rem 0' }}>
              ~{flow.typical_transit_days} Days
            </div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>At benchmark laden speed</div>
          </div>
        </div>

        {/* Vessel Class Compatibility */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Compatible Vessel Classes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {flow.vessel_classes.map((vc) => (
              <span
                key={vc}
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: 4,
                  background: vc === flow.primary_vessel_class ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  color: vc === flow.primary_vessel_class ? '#38bdf8' : '#cbd5e1',
                  border: vc === flow.primary_vessel_class ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #334155',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                {vc} {vc === flow.primary_vessel_class ? '(Benchmark)' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Historical Observations Table */}
        {flow.historical_series && flow.historical_series.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Historical Monthly Throughput
            </div>
            <div style={{ border: '1px solid #334155', borderRadius: 6, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Month</th>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Volume (MT)</th>
                    <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Voyages</th>
                  </tr>
                </thead>
                <tbody>
                  {flow.historical_series.map((pt) => (
                    <tr key={pt.date} style={{ borderTop: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.4rem 0.6rem', color: '#f8fafc', fontWeight: 600 }}>{pt.date}</td>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#38bdf8' }}>
                        {FlowsAnalyticsEngine.formatVolumeMT(pt.volume_mt)}
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', color: '#cbd5e1' }}>
                        {pt.voyages_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cross-Module Integration Actions */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
            Cross-Module Intelligence Links
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Link to Port Insights for Origin */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/ports?portId=${flow.origin.id}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Anchor size={14} style={{ color: '#10b981' }} />
                Inspect Origin Port: {flow.origin.name} (M13)
              </span>
              <ExternalLink size={12} />
            </button>

            {/* Link to Port Insights for Destination */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/ports?portId=${flow.destination.id}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Navigation size={14} style={{ color: '#f59e0b' }} />
                Inspect Destination Port: {flow.destination.name} (M13)
              </span>
              <ExternalLink size={12} />
            </button>

            {/* Link to Distance Calculator */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                navigate(
                  `/distance-calculator?origin=${encodeURIComponent(flow.origin.name)}&destination=${encodeURIComponent(
                    flow.destination.name
                  )}`
                )
              }
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Ruler size={14} style={{ color: '#38bdf8' }} />
                Simulate Voyage in Distance Calculator (M12)
              </span>
              <ExternalLink size={12} />
            </button>

            {/* Link to Market Insights */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/market-insights?sector=${flow.mode}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={14} style={{ color: '#c084fc' }} />
                Analyze Freight Corridors in Market Insights (M5)
              </span>
              <ExternalLink size={12} />
            </button>

            {/* Link to Cargo List */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/cargo?commodity=${encodeURIComponent(flow.commodity)}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={14} style={{ color: '#f59e0b' }} />
                Find Active Shipments in Cargo Book (M9)
              </span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Source & Freshness Metadata */}
        <div
          style={{
            marginTop: 'auto',
            padding: '0.75rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 6,
            fontSize: '0.7rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <div>
            Verified Source: <strong style={{ color: '#cbd5e1' }}>{flow.data_source}</strong>
            <br />
            Last Updated: {new Date(flow.updated_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
