/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics 4-Card KPI Intelligence Grid
 */

import React from 'react';
import {
  Ship,
  TrendingUp,
  Activity,
  Anchor,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { FreightMarketSummary, VesselSupplyBreakdown } from '../../../../types/freight-analytics';

interface FreightKpiGridProps {
  summary?: FreightMarketSummary;
  supply?: VesselSupplyBreakdown;
  isLoading: boolean;
}

export const FreightKpiGrid: React.FC<FreightKpiGridProps> = ({
  summary,
  supply,
  isLoading,
}) => {
  if (isLoading || !summary) {
    return (
      <div className="freight-kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="freight-kpi-card freight-skeleton"
            style={{ height: '150px' }}
          />
        ))}
      </div>
    );
  }

  const formatDwt = (dwt: number) => {
    if (dwt >= 1_000_000_000) return `${(dwt / 1_000_000_000).toFixed(1)}B DWT`;
    if (dwt >= 1_000_000) return `${(dwt / 1_000_000).toFixed(1)}M DWT`;
    return `${dwt.toLocaleString()} DWT`;
  };

  const isRateUp = summary.rate_change_pct >= 0;
  const isContango = summary.market_sentiment === 'contango';
  const isSupplyUp = summary.supply_change_pct >= 0;
  const isCongested = summary.global_congestion_index_pct > 12;

  return (
    <div className="freight-kpi-grid">
      {/* 1. COMMERCIAL SUPPLY CARD */}
      <div className="freight-kpi-card">
        <div className="freight-kpi-top">
          <span className="freight-kpi-label">Commercial Supply</span>
          <div
            className="freight-kpi-icon-wrap"
            style={{
              backgroundColor: 'rgba(0, 217, 255, 0.12)',
              color: 'var(--freight-cyan)',
            }}
          >
            <Ship size={18} />
          </div>
        </div>

        <div className="freight-kpi-middle">
          <div className="freight-kpi-value" style={{ color: 'var(--freight-text)' }}>
            {(supply?.total_vessels ?? summary.total_vessels_tracked).toLocaleString()}
            <span className="freight-kpi-unit">Vessels</span>
          </div>
        </div>

        <div>
          <div className="freight-kpi-bottom">
            <span>{formatDwt(supply?.total_dwt_mt ?? summary.active_commercial_supply_dwt)}</span>
            <span className={`freight-kpi-badge ${isSupplyUp ? 'positive' : 'negative'}`}>
              {isSupplyUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{isSupplyUp ? '+' : ''}{summary.supply_change_pct || 1.8}% 30d</span>
            </span>
          </div>
          <div className="freight-kpi-gauge">
            <div
              className="freight-kpi-gauge-fill"
              style={{
                width: `${Math.min(100, Math.max(20, supply?.supply_utilization_pct ?? 82))}%`,
                backgroundColor: 'var(--freight-cyan)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. BENCHMARK RATE CARD */}
      <div className="freight-kpi-card">
        <div className="freight-kpi-top">
          <span className="freight-kpi-label">Benchmark Rate</span>
          <div
            className="freight-kpi-icon-wrap"
            style={{
              backgroundColor: 'rgba(32, 201, 138, 0.12)',
              color: 'var(--freight-green)',
            }}
          >
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="freight-kpi-middle">
          <div className="freight-kpi-value" style={{ color: 'var(--freight-green)' }}>
            ${summary.benchmark_freight_rate_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <div className="freight-kpi-bottom">
            <span>Baltic Weighted Avg</span>
            <span className={`freight-kpi-badge ${isRateUp ? 'positive' : 'negative'}`}>
              {isRateUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{isRateUp ? '+' : ''}{summary.rate_change_pct}% 1d</span>
            </span>
          </div>
          <div className="freight-kpi-gauge">
            <div
              className="freight-kpi-gauge-fill"
              style={{
                width: '100%',
                backgroundColor: 'var(--freight-green)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. SPOT vs FFA SPREAD CARD */}
      <div className="freight-kpi-card">
        <div className="freight-kpi-top">
          <span className="freight-kpi-label">Spot vs FFA Spread</span>
          <div
            className="freight-kpi-icon-wrap"
            style={{
              backgroundColor: isContango ? 'rgba(32, 201, 138, 0.12)' : 'rgba(255, 176, 32, 0.12)',
              color: isContango ? 'var(--freight-green)' : 'var(--freight-amber)',
            }}
          >
            <Activity size={18} />
          </div>
        </div>

        <div className="freight-kpi-middle">
          <div
            className="freight-kpi-value"
            style={{ color: isContango ? 'var(--freight-green)' : 'var(--freight-amber)' }}
          >
            {summary.ffa_spot_spread_usd >= 0 ? '+$' : '-$'}
            {Math.abs(summary.ffa_spot_spread_usd).toLocaleString()}
          </div>
        </div>

        <div>
          <div className="freight-kpi-bottom">
            <span style={{ fontWeight: 600 }}>{summary.market_sentiment.toUpperCase()}</span>
            <span className={`freight-kpi-badge ${isContango ? 'positive' : 'neutral'}`}>
              <span>{isContango ? 'Contango' : 'Backwardation'}</span>
            </span>
          </div>
          <div className="freight-kpi-gauge">
            <div
              className="freight-kpi-gauge-fill"
              style={{
                width: `${Math.min(100, Math.max(25, Math.abs(summary.ffa_spot_spread_usd) / 50))}%`,
                backgroundColor: isContango ? 'var(--freight-green)' : 'var(--freight-amber)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. CONGESTION INDEX CARD */}
      <div className="freight-kpi-card">
        <div className="freight-kpi-top">
          <span className="freight-kpi-label">Congestion Index</span>
          <div
            className="freight-kpi-icon-wrap"
            style={{
              backgroundColor: isCongested ? 'rgba(255, 77, 85, 0.14)' : 'rgba(0, 217, 255, 0.12)',
              color: isCongested ? 'var(--freight-red)' : 'var(--freight-cyan)',
            }}
          >
            <Anchor size={18} />
          </div>
        </div>

        <div className="freight-kpi-middle">
          <div
            className="freight-kpi-value"
            style={{ color: isCongested ? 'var(--freight-red)' : 'var(--freight-text)' }}
          >
            {summary.global_congestion_index_pct}%
          </div>
        </div>

        <div>
          <div className="freight-kpi-bottom">
            <span>{(supply?.waiting_anchorage_count ?? 148).toLocaleString()} at anchor</span>
            <span className={`freight-kpi-badge ${isCongested ? 'negative' : 'positive'}`}>
              <span>{isCongested ? 'Elevated' : 'Normal'}</span>
            </span>
          </div>
          <div className="freight-kpi-gauge">
            <div
              className="freight-kpi-gauge-fill"
              style={{
                width: `${Math.min(100, Math.max(5, summary.global_congestion_index_pct * 3))}%`,
                backgroundColor: isCongested ? 'var(--freight-red)' : 'var(--freight-cyan)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
