/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Visual Centerpiece Hero Card
 */

import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import type {
  VesselValuationRecord,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface ValuationCenterpieceProps {
  vessel: VesselValuationRecord;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
}

export function ValuationCenterpiece({ vessel, currency, rates }: ValuationCenterpieceProps) {
  const isUp = vessel.change1yPct >= 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(13, 24, 41, 0.95) 0%, rgba(15, 36, 62, 0.8) 100%)',
        border: '1px solid rgba(0, 102, 204, 0.35)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 102, 204, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Left: Main Fair Market Value Display */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURRENT ESTIMATED FAIR MARKET VALUATION (FMV)
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <ShieldCheck size={12} />
              <span>{vessel.valuationConfidence} Confidence</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '0.4rem 0' }}>
            <span
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                lineHeight: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {formatValuation(vessel.currentMarketValueUsdM, currency, rates)}
            </span>

            {/* 12-Month Movement Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: isUp ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                color: isUp ? '#10b981' : '#ef4444',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {isUp ? '+' : ''}{formatValuation(vessel.change1yUsdM, currency, rates)} ({isUp ? '+' : ''}{vessel.change1yPct}%)
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#94a3b8' }}>12-month movement</span>
            </div>
          </div>

          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Automated valuation based on {vessel.valuationModel} &bull; Appraised on {vessel.lastAppraisalDate}
          </p>
        </div>

        {/* Right: Valuation Spreads & Parity Metrics */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            background: 'rgba(10, 17, 28, 0.7)',
            padding: '1rem',
            borderRadius: '6px',
            border: '1px solid #1e293b',
          }}
        >
          {/* Newbuild Parity */}
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>NEWBUILDING PARITY</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              {formatValuation(vessel.newbuildingParityUsdM, currency, rates)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
              {( (vessel.currentMarketValueUsdM / vessel.newbuildingParityUsdM) * 100 ).toFixed(1)}% of newbuild
            </div>
          </div>

          <div style={{ width: '1px', background: '#1e293b' }} />

          {/* Demolition Scrap Floor */}
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>DEMOLITION SCRAP FLOOR</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              {formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
              {vessel.scrapFloorPct.toFixed(1)}% floor backstop
            </div>
          </div>

          <div style={{ width: '1px', background: '#1e293b' }} />

          {/* Net Valuation Premium over Scrap */}
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>PREMIUM OVER SCRAP</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10b981', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              {formatValuation(vessel.valuationPremiumOverScrapUsdM, currency, rates)}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
              Trading asset premium
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
