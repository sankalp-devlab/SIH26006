/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Historical Volatility & Dispersion Profile
 * Canonical Enterprise Design System Refactor
 */

import React from 'react';
import { Activity, AlertCircle, TrendingUp } from 'lucide-react';
import type { RouteVolatilityMetrics } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface MarketVolatilityPanelProps {
  volatility: RouteVolatilityMetrics;
  routeCode: string;
}

export const MarketVolatilityPanel: React.FC<MarketVolatilityPanelProps> = ({
  volatility,
  routeCode,
}) => {
  if (!volatility.sufficientData) {
    return (
      <div className="mp-card" style={{ padding: '28px', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: 'var(--ol-text-muted, #64748B)', margin: '0 auto 8px' }} />
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>
          Insufficient Historical Settlement Data
        </h4>
        <p style={{ fontSize: '11.5px', color: 'var(--ol-text-muted, #64748B)', margin: '4px 0 0' }}>
          At least 3 historical settlement periods are required to calculate standard deviation for {routeCode}.
        </p>
      </div>
    );
  }

  const rateSpread = Math.max(0, volatility.highPrice30d - volatility.lowPrice30d);

  return (
    <div className="mp-card" style={{ padding: '20px', height: '100%', justifyContent: 'space-between' }}>
      {/* Header */}
      <div>
        <div className="mp-card-header">
          <div className="mp-card-header-left">
            <div className="mp-card-icon-wrap mp-icon-amber">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="mp-card-title">
                Historical Volatility & Dispersion
              </h3>
              <p className="mp-card-subtitle">
                Rolling standard deviation and multi-horizon freight rate variance for {routeCode}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
            ANNUALIZED 30D
          </span>
        </div>

        {/* 4-Metric Grid */}
        <div className="mp-volatility-grid" style={{ marginTop: '16px' }}>
          {/* 7D Rolling Volatility */}
          <div className="mp-vol-box">
            <div className="mp-vol-label">7-Day Rolling</div>
            <div className="mp-vol-value">{volatility.volatility7dPct}%</div>
            <div className="mp-vol-subtext">Short-term variance</div>
          </div>

          {/* 30D Rolling Volatility */}
          <div className="mp-vol-box">
            <div className="mp-vol-label">30-Day Rolling</div>
            <div className="mp-vol-value" style={{ color: '#F59E0B' }}>
              {volatility.volatility30dPct}%
            </div>
            <div className="mp-vol-subtext">Monthly dispersion</div>
          </div>

          {/* 90D Rolling Volatility */}
          <div className="mp-vol-box">
            <div className="mp-vol-label">90-Day Rolling</div>
            <div className="mp-vol-value" style={{ color: '#C084FC' }}>
              {volatility.volatility90dPct}%
            </div>
            <div className="mp-vol-subtext">Quarterly cyclical</div>
          </div>

          {/* 30D Standard Deviation */}
          <div className="mp-vol-box">
            <div className="mp-vol-label">Std Dev (30D)</div>
            <div className="mp-vol-value" style={{ color: 'var(--ol-cyan, #22D3EE)' }}>
              ${volatility.standardDeviation30d.toLocaleString()}
            </div>
            <div className="mp-vol-subtext">Sigma $/day spread</div>
          </div>
        </div>
      </div>

      {/* 30D High / Low Span Strip */}
      <div className="mp-span-strip" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>30-Day Range:</span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
            {formatFreightRate(volatility.lowPrice30d)}
          </span>
          <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>→</span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
            {formatFreightRate(volatility.highPrice30d)}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)', fontSize: '11px' }}>
          Max Spread: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>${Math.round(rateSpread).toLocaleString()}/day</strong>
        </div>
      </div>
    </div>
  );
};
