/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Demolition & Scrap Salvage Economics Section
 */

import type {
  VesselValuationRecord,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface DemolitionEconomicsSectionProps {
  vessel: VesselValuationRecord;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
}

export function DemolitionEconomicsSection({
  vessel,
  currency,
  rates,
}: DemolitionEconomicsSectionProps) {
  const scrapFloorPct = Math.min(100, Math.max(0, vessel.scrapFloorPct));
  const premiumPct = Math.max(0, 100 - scrapFloorPct);

  // Regional scrap price spreads relative to subcontinent baseline ($525/LDT)
  const regionalPrices = [
    { location: 'Subcontinent (Alang, India)', rate: vessel.scrapRatePerLdtUsd, highlight: true },
    { location: 'Chattogram (Bangladesh)', rate: vessel.scrapRatePerLdtUsd + 10, highlight: false },
    { location: 'Gadani (Pakistan)', rate: vessel.scrapRatePerLdtUsd - 5, highlight: false },
    { location: 'Aliaga (Turkey - Green Recycled)', rate: Math.round(vessel.scrapRatePerLdtUsd * 0.65), highlight: false },
  ];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            DEMOLITION / SCRAP SALVAGE ECONOMICS
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Liquidation scrap floor calculated from Lightweight Displacement Tonnage (LDT) and regional recycling benchmarks
          </p>
        </div>

        <span
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          Scrap Floor: {formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)}
        </span>
      </div>

      {/* Proportional Valuation Stack (Market Value = Scrap Floor + Commercial Trading Premium) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
          <span>
            Scrap Floor Backstop: <strong style={{ color: '#f59e0b' }}>{scrapFloorPct.toFixed(1)}%</strong> ({formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)})
          </span>
          <span>
            Net Commercial Trading Premium: <strong style={{ color: '#10b981' }}>{premiumPct.toFixed(1)}%</strong> ({formatValuation(vessel.valuationPremiumOverScrapUsdM, currency, rates)})
          </span>
        </div>

        <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#1e293b' }}>
          <div
            title={`Scrap Floor: ${formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)} (${scrapFloorPct.toFixed(1)}%)`}
            style={{
              width: `${scrapFloorPct}%`,
              background: 'linear-gradient(90deg, #b45309 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a111c',
              fontSize: '0.6875rem',
              fontWeight: 800,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {scrapFloorPct > 15 && `SCRAP FLOOR ${scrapFloorPct.toFixed(0)}%`}
          </div>

          <div
            title={`Valuation Premium: ${formatValuation(vessel.valuationPremiumOverScrapUsdM, currency, rates)} (${premiumPct.toFixed(1)}%)`}
            style={{
              width: `${premiumPct}%`,
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a111c',
              fontSize: '0.6875rem',
              fontWeight: 800,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {premiumPct > 15 && `COMMERCIAL TRADING PREMIUM ${premiumPct.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Breakdown Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* LDT Specs */}
        <div style={{ background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '1rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>LIGHTWEIGHT TONNAGE (LDT)</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
            {vessel.lightweightTons.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>LDT</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '4px' }}>
            ~{((vessel.lightweightTons / vessel.dwt) * 100).toFixed(1)}% of deadweight capacity
          </div>
        </div>

        {/* Subcontinent Scrap Price */}
        <div style={{ background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '1rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>SUBCONTINENT STEEL SCRAP</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
            ${vessel.scrapRatePerLdtUsd} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>USD / LDT</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '4px' }}>
            Alang, Chattogram & Gadani spot average
          </div>
        </div>

        {/* Total Scrap Salvage Value */}
        <div style={{ background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '1rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>TOTAL SCRAP SALVAGE VALUE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
            {formatValuation(vessel.demolitionScrapValueUsdM, currency, rates)}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#10b981', marginTop: '4px' }}>
            Guaranteed residual asset collateral
          </div>
        </div>

        {/* Valuation Premium Over Scrap */}
        <div style={{ background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '1rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>VALUATION GAP OVER SCRAP</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
            {formatValuation(vessel.valuationPremiumOverScrapUsdM, currency, rates)}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '4px' }}>
            Current market value above scrap floor
          </div>
        </div>
      </div>

      {/* Regional Demolition Benchmark Pricing Table */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
          Regional Demolition Recycling Price Matrix
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {regionalPrices.map((rp) => (
            <div
              key={rp.location}
              style={{
                background: rp.highlight ? 'rgba(245, 158, 11, 0.08)' : '#0a111c',
                border: rp.highlight ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1e293b',
                borderRadius: '4px',
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{rp.location}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
                ${rp.rate} / LDT
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
