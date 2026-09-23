/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Executive Valuation KPI Command Bar
 */

import {
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  Calendar,
  Award,
} from 'lucide-react';
import type {
  VesselValuationRecord,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface ValuationKpiBarProps {
  vessel: VesselValuationRecord;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
}

export function ValuationKpiBar({ vessel, currency, rates }: ValuationKpiBarProps) {
  const is1mUp = vessel.change1mPct >= 0;
  const is1yUp = vessel.change1yPct >= 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.875rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* 1. Current Market Valuation */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #0066cc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Current Market Value
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.625rem',
              fontWeight: 700,
              background: 'rgba(0, 102, 204, 0.15)',
              color: '#38bdf8',
            }}
          >
            FMV
          </span>
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f8fafc',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {formatValuation(vessel.currentMarketValueUsdM, currency, rates)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem' }}>
          {is1mUp ? (
            <TrendingUp size={12} style={{ color: '#10b981' }} />
          ) : (
            <TrendingDown size={12} style={{ color: '#ef4444' }} />
          )}
          <span style={{ color: is1mUp ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {is1mUp ? '+' : ''}{vessel.change1mPct}%
          </span>
          <span style={{ color: '#64748b' }}>vs prior appraisal</span>
        </div>
      </div>

      {/* 2. 12M Trajectory Change */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #10b981',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            12M Valuation Change
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.625rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            YoY
          </span>
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: is1yUp ? '#10b981' : '#ef4444',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {is1yUp ? '+' : ''}{vessel.change1yPct}%
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span>{is1yUp ? '+' : ''}{formatValuation(vessel.change1yUsdM, currency, rates)}</span>
          <span style={{ color: '#64748b' }}>over past 12 months</span>
        </div>
      </div>

      {/* 3. Scrap / Demolition Floor */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #f59e0b',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Demolition Scrap Floor
          </span>
          <Shield size={14} style={{ color: '#f59e0b' }} />
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f8fafc',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span>{vessel.scrapFloorPct.toFixed(1)}% of value</span>
          <span style={{ color: '#64748b' }}>@ ${vessel.scrapRatePerLdtUsd}/LDT</span>
        </div>
      </div>

      {/* 4. Valuation / DWT */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #38bdf8',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Valuation / DWT
          </span>
          <Layers size={14} style={{ color: '#38bdf8' }} />
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#38bdf8',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            ${vessel.valuationPerDwtUsd.toFixed(1)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Top {vessel.segmentPercentile}%</span>
          <span style={{ color: '#64748b' }}>in {vessel.vesselClass} fleet</span>
        </div>
      </div>

      {/* 5. Vessel Age & Vintage */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #8b5cf6',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Vessel Age
          </span>
          <Calendar size={14} style={{ color: '#8b5cf6' }} />
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f8fafc',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {vessel.ageYears.toFixed(1)} <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>years</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span>{vessel.yearBuilt} Built</span>
          <span style={{ color: '#64748b' }}>&bull; {vessel.ageYears < 7 ? 'Eco Modern' : 'Mid-Life'}</span>
        </div>
      </div>

      {/* 6. Market Position */}
      <div
        style={{
          background: '#0d1829',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '3px solid #ec4899',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Market Position
          </span>
          <Award size={14} style={{ color: '#ec4899' }} />
        </div>

        <div style={{ margin: '0.5rem 0' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: vessel.marketPosition === 'Above Market' ? '#10b981' : vessel.marketPosition === 'At Market' ? '#38bdf8' : '#ef4444',
            }}
          >
            {vessel.marketPosition}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>
            {vessel.comparablePremiumPct >= 0 ? '+' : ''}{vessel.comparablePremiumPct}%
          </span>
          <span style={{ color: '#64748b' }}>vs peer average</span>
        </div>
      </div>
    </div>
  );
}
