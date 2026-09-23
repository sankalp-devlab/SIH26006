/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: First-Class Market Context Analytical Component
 */

import { Award } from 'lucide-react';
import type {
  MarketContextIntel,
  VesselValuationRecord,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface MarketContextPanelProps {
  selectedVessel: VesselValuationRecord;
  marketContext: MarketContextIntel;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
  onSelectComparableVessel?: (id: number) => void;
}

export function MarketContextPanel({
  selectedVessel,
  marketContext,
  currency,
  rates,
  onSelectComparableVessel: _onSelectComparableVessel,
}: MarketContextPanelProps) {
  const isPos = marketContext.comparablePremiumPct >= 0;
  const isTrendUp = marketContext.marketTrend === 'Rising';

  // Calculate position in the min-max segment span for the quartile scale
  const span = marketContext.maxMarketValueUsdM - marketContext.minMarketValueUsdM || 1;
  const vesselPosPct = Math.min(
    100,
    Math.max(0, ((selectedVessel.currentMarketValueUsdM - marketContext.minMarketValueUsdM) / span) * 100)
  );

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
              }}
            />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              MARKET CONTEXT & COMMERCIAL POSITIONING
            </h3>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Multi-horizon valuation context against the {marketContext.vesselClass} peer fleet ({marketContext.totalSegmentVessels.toLocaleString()} monitored vessels)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {marketContext.segmentName} &bull; {marketContext.vesselClass}
          </span>
        </div>
      </div>

      {/* Top Context Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* 1. Market Position & Premium */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.12) 0%, rgba(15, 36, 62, 0.25) 100%)',
            border: '1px solid rgba(0, 102, 204, 0.3)',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                MARKET POSITION
              </span>
              <Award size={14} style={{ color: '#38bdf8' }} />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
              {selectedVessel.marketPosition}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
              <span style={{ color: isPos ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {isPos ? '+' : ''}{marketContext.comparablePremiumPct}%
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>vs comparable average</span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#64748b' }}>
            Percentile Rank: <strong style={{ color: '#f8fafc' }}>Top {selectedVessel.segmentPercentile}%</strong> of segment
          </div>
        </div>

        {/* 2. Direct Selected vs Comparable Average */}
        <div
          style={{
            background: '#0a111c',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              COMPARABLE ASSET SPREAD
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>SELECTED ASSET</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(selectedVessel.currentMarketValueUsdM, currency, rates)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>PEER AVERAGE</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(marketContext.comparableAverageValueUsdM, currency, rates)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              padding: '4px 8px',
              borderRadius: '4px',
              background: '#0f172a',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
            }}
          >
            <span style={{ color: '#94a3b8' }}>Valuation Delta:</span>
            <strong style={{ color: isPos ? '#10b981' : '#ef4444' }}>
              {isPos ? '+' : ''}{formatValuation(selectedVessel.currentMarketValueUsdM - marketContext.comparableAverageValueUsdM, currency, rates)}
            </strong>
          </div>
        </div>

        {/* 3. Multi-Horizon Market Trend Velocities */}
        <div
          style={{
            background: '#0a111c',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                RECENT MARKET MOVEMENT
              </span>
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  background: isTrendUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isTrendUp ? '#10b981' : '#ef4444',
                }}
              >
                {marketContext.marketTrend.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, padding: '4px', background: '#0f172a', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.625rem', color: '#64748b' }}>30 DAYS</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  +{marketContext.segment1mChangePct}%
                </div>
              </div>

              <div style={{ flex: 1, padding: '4px', background: '#0f172a', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.625rem', color: '#64748b' }}>90 DAYS</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  +{marketContext.segment3mChangePct}%
                </div>
              </div>

              <div style={{ flex: 1, padding: '4px', background: '#0f172a', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.625rem', color: '#64748b' }}>12 MONTHS</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  +{marketContext.segment12mChangePct}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#64748b' }}>
            Segment Liquidity: <strong style={{ color: '#38bdf8' }}>{marketContext.spLiquidityRating}</strong> ({marketContext.spTransactionVolumeL12M} S&P deals L12M)
          </div>
        </div>

        {/* 4. Orderbook & Fundamentals */}
        <div
          style={{
            background: '#0a111c',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              FLEET FUNDAMENTALS
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Orderbook / Fleet:</span>
                <strong style={{ color: '#f8fafc' }}>{marketContext.orderbookToFleetRatioPct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Segment Median:</span>
                <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(marketContext.medianMarketValueUsdM, currency, rates)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Average Fleet Age:</span>
                <strong style={{ color: '#f8fafc' }}>{marketContext.averageFleetAgeYears} years</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#10b981' }}>
            Low orderbook supports firm second-hand asset prices
          </div>
        </div>
      </div>

      {/* Segment Quartile Distribution Meter */}
      <div
        style={{
          background: '#0a111c',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
            {marketContext.vesselClass} Valuation Percentile Distribution
          </h4>
          <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            Min: {formatValuation(marketContext.minMarketValueUsdM, currency, rates)} &bull; Max: {formatValuation(marketContext.maxMarketValueUsdM, currency, rates)}
          </span>
        </div>

        {/* Proportional Quartile Track */}
        <div style={{ position: 'relative', margin: '1.75rem 0 1rem 0' }}>
          <div style={{ display: 'flex', height: '10px', borderRadius: '4px', overflow: 'hidden', background: '#1e293b' }}>
            <div style={{ flex: 1, background: '#ef4444' }} title="Bottom 25% (< P25)" />
            <div style={{ flex: 1, background: '#f59e0b' }} title="25% - 50% (P25 - Median)" />
            <div style={{ flex: 1, background: '#38bdf8' }} title="50% - 75% (Median - P75)" />
            <div style={{ flex: 1, background: '#10b981' }} title="Top 25% (> P75)" />
          </div>

          {/* Selected Vessel Marker Pin */}
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: `${vesselPosPct}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: '#38bdf8',
                color: '#0a111c',
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedVessel.name}: {formatValuation(selectedVessel.currentMarketValueUsdM, currency, rates)}
            </span>
            <span style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #38bdf8' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '6px' }}>
            <span>P25: {formatValuation(marketContext.p25MarketValueUsdM, currency, rates)}</span>
            <span>Median: {formatValuation(marketContext.medianMarketValueUsdM, currency, rates)}</span>
            <span>P75: {formatValuation(marketContext.p75MarketValueUsdM, currency, rates)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
