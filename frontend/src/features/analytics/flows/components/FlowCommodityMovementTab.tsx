/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Commodity Movement Analysis Tab
 */

import { useState } from 'react';
import { Layers, ExternalLink, Anchor, Navigation, Ship } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TradeFlowRecord } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowCommodityMovementTabProps {
  flows: TradeFlowRecord[];
  activeCommodity: string;
  availableCommodities: string[];
}

export function FlowCommodityMovementTab({
  flows,
  activeCommodity,
  availableCommodities,
}: FlowCommodityMovementTabProps) {
  const navigate = useNavigate();
  const [selectedCommodity, setSelectedCommodity] = useState<string>(
    activeCommodity !== 'all' && activeCommodity ? activeCommodity : availableCommodities[0] || 'Iron Ore'
  );

  const node = FlowsAnalyticsEngine.buildCommodityMovement(flows, selectedCommodity);

  if (!node) {
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
        <p>No active trade corridors found for {selectedCommodity} in this sector.</p>
        <select
          value={selectedCommodity}
          onChange={(e) => setSelectedCommodity(e.target.value)}
          style={{
            padding: '0.4rem 0.75rem',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: 6,
            marginTop: '0.5rem',
          }}
        >
          {availableCommodities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Commodity Selector */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(192, 132, 252, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Layers size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {node.commodity} Supply-to-Sink Dynamics
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Mode: <strong style={{ color: '#38bdf8', textTransform: 'uppercase' }}>{node.mode}</strong> • Total Volume: {FlowsAnalyticsEngine.formatVolumeMT(node.total_volume_mt)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: 6,
              fontSize: '0.8rem',
            }}
          >
            {availableCommodities.map((comm) => (
              <option key={comm} value={comm}>
                {comm}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/cargo?commodity=${encodeURIComponent(node.commodity)}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            View in Cargo Book (M9)
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Grid: Origins, Destinations, Parcel Size */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Origins */}
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
              Primary Producing / Loading Basins
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {node.top_origins.map((orig) => (
              <div key={orig.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#f1f5f9' }}>{orig.name}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(orig.volume_mt)}</strong> ({orig.pct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${orig.pct}%`, background: '#10b981', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Destinations */}
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
              Primary Discharge / Refining Hubs
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {node.top_destinations.map((dest) => (
              <div key={dest.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#f1f5f9' }}>{dest.name}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(dest.volume_mt)}</strong> ({dest.pct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dest.pct}%`, background: '#f59e0b', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vessel Class / Parcel Segmentation */}
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
              Vessel Parcel Segmentation
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {node.vessel_distribution.map((vc) => (
              <div key={vc.vessel_class}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#f1f5f9' }}>{vc.vessel_class}</span>
                  <span style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc' }}>{FlowsAnalyticsEngine.formatVolumeMT(vc.volume_mt)}</strong> ({vc.pct}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${vc.pct}%`, background: '#38bdf8', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
