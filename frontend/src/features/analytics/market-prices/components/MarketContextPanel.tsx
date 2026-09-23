/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Market Context & Commercial Synthesis
 * Canonical Enterprise Design System Refactor
 */

import React from 'react';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Scale,
  Layers,
} from 'lucide-react';
import type { MarketContextMetrics, RouteForwardCurve, SpotPriceRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface MarketContextPanelProps {
  context: MarketContextMetrics;
  spot: SpotPriceRecord;
  curve: RouteForwardCurve;
}

export const MarketContextPanel: React.FC<MarketContextPanelProps> = ({
  context,
  spot,
  curve,
}) => {
  const isBullish = context.momentumScore > 0;

  return (
    <div className="mp-card" style={{ padding: '20px', height: '100%', justifyContent: 'space-between' }}>
      {/* Header */}
      <div>
        <div className="mp-card-header">
          <div className="mp-card-header-left">
            <div className="mp-card-icon-wrap mp-icon-purple">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="mp-card-title">
                Market Context & Commercial Synthesis
              </h3>
              <p className="mp-card-subtitle">
                Quantitative momentum synthesis and forward curve term-structure bias for {spot.routeCode}
              </p>
            </div>
          </div>

          {/* Momentum Badge */}
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: isBullish ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                color: isBullish ? '#10B981' : '#F43F5E',
                border: `1px solid ${isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
              }}
            >
              {isBullish ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{context.momentumDirection} ({context.momentumScore > 0 ? '+' : ''}{context.momentumScore})</span>
            </span>
          </div>
        </div>

        {/* Narrative Insight Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <div className="mp-context-card">
            <div className="mp-context-header">
              <Scale size={13} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>Term-Structure Bias</span>
            </div>
            <p className="mp-context-body">
              {context.marketBiasText}
            </p>
          </div>

          <div className="mp-context-card">
            <div className="mp-context-header">
              <TrendingUp size={13} style={{ color: '#C084FC' }} />
              <span>Forward Derivatives Consensus</span>
            </div>
            <p className="mp-context-body">
              {context.forwardExpectation}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Valuation Percentile Strip */}
      <div className="mp-span-strip" style={{ marginTop: '16px', flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-primary, #F1F5F9)' }}>
            Historical Valuation Percentile
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)' }}>
            {context.historicalPercentileRank}th Percentile
          </span>
        </div>

        {/* Gauge Progress Bar */}
        <div className="mp-percentile-track">
          <div
            className="mp-percentile-fill"
            style={{ width: `${context.historicalPercentileRank}%` }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
          <span>5Y Min: {formatFreightRate(context.recentLowUsd)}</span>
          <span>Forward: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{curve.curveStructure}</strong></span>
          <span>5Y Max: {formatFreightRate(context.recentHighUsd)}</span>
        </div>
      </div>
    </div>
  );
};
