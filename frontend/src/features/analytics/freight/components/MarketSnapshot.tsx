/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Market Snapshot Panel
 */

import React from 'react';
import {
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Scale,
} from 'lucide-react';
import type {
  FreightMarketSummary,
  VesselSupplyBreakdown,
  FreightRateBenchmark,
} from '../../../../types/freight-analytics';

interface MarketSnapshotProps {
  summary?: FreightMarketSummary;
  supply?: VesselSupplyBreakdown;
  activeBenchmark?: FreightRateBenchmark;
  onOpenComparison: () => void;
}

export const MarketSnapshot: React.FC<MarketSnapshotProps> = ({
  summary,
  supply,
  activeBenchmark,
  onOpenComparison,
}) => {
  if (!summary) {
    return (
      <div className="freight-panel-card freight-skeleton" style={{ height: '100%' }} />
    );
  }

  const formatDwt = (dwt: number) => {
    if (dwt >= 1_000_000) return `${(dwt / 1_000_000).toFixed(1)}M DWT`;
    return `${dwt.toLocaleString()} DWT`;
  };

  // Determine market direction from actual rate_change_pct
  const getDirectionBadge = () => {
    if (summary.rate_change_pct > 0.5) {
      return {
        label: 'Rising',
        icon: <ArrowUpRight size={13} />,
        color: 'var(--freight-green)',
        bg: 'rgba(32, 201, 138, 0.12)',
      };
    }
    if (summary.rate_change_pct < -0.5) {
      return {
        label: 'Falling',
        icon: <ArrowDownRight size={13} />,
        color: 'var(--freight-red)',
        bg: 'rgba(255, 77, 85, 0.12)',
      };
    }
    return {
      label: 'Stable',
      icon: <Minus size={13} />,
      color: 'var(--freight-cyan)',
      bg: 'rgba(0, 217, 255, 0.12)',
    };
  };

  const direction = getDirectionBadge();

  return (
    <div className="freight-panel-card" style={{ height: '100%', boxSizing: 'border-box' }}>
      <div className="freight-panel-header">
        <div>
          <div className="freight-panel-title">
            <Compass size={17} style={{ color: 'var(--freight-cyan)' }} />
            <span>Market Snapshot</span>
          </div>
          <p className="freight-panel-desc">Key commercial freight indicators & balance</p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: direction.color,
            backgroundColor: direction.bg,
            border: `1px solid ${direction.color}33`,
          }}
        >
          {direction.icon}
          <span>{direction.label}</span>
        </div>
      </div>

      {/* Snapshot Metric Rows */}
      <div className="freight-snapshot-rows" style={{ flex: 1 }}>
        {/* Benchmark Rate */}
        <div className="freight-snapshot-row">
          <div>
            <div className="freight-snapshot-metric">Baltic Benchmark</div>
            <div className="freight-snapshot-sub">Weighted market average</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="freight-snapshot-value" style={{ color: 'var(--freight-green)' }}>
              ${summary.benchmark_freight_rate_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: summary.rate_change_pct >= 0 ? 'var(--freight-green)' : 'var(--freight-red)' }}>
              {summary.rate_change_pct >= 0 ? '+' : ''}{summary.rate_change_pct}% 1d
            </div>
          </div>
        </div>

        {/* Spot Rate for Selected Corridor */}
        {activeBenchmark && (
          <div className="freight-snapshot-row">
            <div>
              <div className="freight-snapshot-metric">Corridor Spot ({activeBenchmark.route_code})</div>
              <div className="freight-snapshot-sub">{activeBenchmark.commodity}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="freight-snapshot-value" style={{ color: 'var(--freight-cyan)' }}>
                ${activeBenchmark.rate_value.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--freight-text-secondary)' }}>
                {activeBenchmark.rate_basis === 'per_day_tce' ? '$/day TCE' : '$/MT'}
              </div>
            </div>
          </div>
        )}

        {/* FFA Prompt Benchmark */}
        <div className="freight-snapshot-row">
          <div>
            <div className="freight-snapshot-metric">FFA Derivatives Prompt</div>
            <div className="freight-snapshot-sub">Front-month contract (M0)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="freight-snapshot-value" style={{ color: 'var(--freight-text)' }}>
              ${summary.ffa_benchmark_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--freight-amber)' }}>
              Spread: {summary.ffa_spot_spread_usd >= 0 ? '+$' : '-$'}{Math.abs(summary.ffa_spot_spread_usd).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Commercial Supply DWT */}
        <div className="freight-snapshot-row">
          <div>
            <div className="freight-snapshot-metric">Commercial Fleet Supply</div>
            <div className="freight-snapshot-sub">
              {(supply?.total_vessels ?? summary.total_vessels_tracked).toLocaleString()} vessels active
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="freight-snapshot-value" style={{ color: 'var(--freight-text)' }}>
              {formatDwt(supply?.total_dwt_mt ?? summary.active_commercial_supply_dwt)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--freight-cyan)' }}>
              {supply?.supply_utilization_pct ?? 82.4}% operating
            </div>
          </div>
        </div>

        {/* Congestion Index & Anchorage */}
        <div className="freight-snapshot-row">
          <div>
            <div className="freight-snapshot-metric">Global Congestion Index</div>
            <div className="freight-snapshot-sub">
              {summary.avg_anchorage_wait_hours}h avg dwell time
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              className="freight-snapshot-value"
              style={{
                color: summary.global_congestion_index_pct > 12 ? 'var(--freight-red)' : 'var(--freight-cyan)',
              }}
            >
              {summary.global_congestion_index_pct}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--freight-text-secondary)' }}>
              {(supply?.waiting_anchorage_count ?? 148).toLocaleString()} at anchor
            </div>
          </div>
        </div>
      </div>

      {/* Action to compare */}
      <button
        type="button"
        onClick={onOpenComparison}
        className="freight-action-btn"
        style={{
          marginTop: '16px',
          width: '100%',
          borderColor: 'rgba(0, 217, 255, 0.3)',
          color: 'var(--freight-cyan)',
          backgroundColor: 'rgba(0, 217, 255, 0.05)',
        }}
      >
        <Scale size={14} />
        <span>Compare Corridors Side-by-Side</span>
      </button>
    </div>
  );
};
