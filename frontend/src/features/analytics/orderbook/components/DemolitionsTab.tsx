/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Demolitions & Fleet Scrapping Intelligence Workspace Tab
 * Displays scrapping age analysis, beaching yards, LDT price benchmarks, and HKC compliance.
 */

import {
  Trash2,
  Anchor,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import type { DemolitionRecord } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface DemolitionsTabProps {
  demolitions: DemolitionRecord[];
}

export function DemolitionsTab({ demolitions }: DemolitionsTabProps) {
  const demos = Array.isArray(demolitions) ? demolitions : [];
  const ageAnalysis = OrderbookAnalyticsEngine.calculateAverageScrapAge(demos);

  // Scrapping volume by recycling country
  const countryBreakdown: Record<string, { count: number; dwt: number; ldt: number }> = {};
  let totalLdtScrapped = 0;
  let hkcCompliantCount = 0;

  for (const d of demos) {
    const c =
      d.scrapping_country ||
      (d.scrapping_location.includes('India')
        ? 'India'
        : d.scrapping_location.includes('Bangladesh')
        ? 'Bangladesh'
        : d.scrapping_location.includes('Pakistan')
        ? 'Pakistan'
        : 'Turkey');
    if (!countryBreakdown[c]) {
      countryBreakdown[c] = { count: 0, dwt: 0, ldt: 0 };
    }
    const ldt = d.ldt || Math.round(d.capacity_dwt * 0.16);
    countryBreakdown[c].count += 1;
    countryBreakdown[c].dwt += d.capacity_dwt || 0;
    countryBreakdown[c].ldt += ldt;
    totalLdtScrapped += ldt;

    if (d.green_recycling_certified) {
      hkcCompliantCount += 1;
    }
  }

  const hkcSharePct = demos.length > 0 ? (hkcCompliantCount / demos.length) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Scrapping KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Scrapping Volume */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Recorded Scrapping
            </span>
            <Trash2 size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
            {demos.length}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>vessels</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 600, marginTop: '0.25rem' }}>
            {OrderbookAnalyticsEngine.formatDwt(
              demos.reduce((sum, d) => sum + (d.capacity_dwt || 0), 0)
            )}
          </div>
        </div>

        {/* Avg Fleet Scrapping Age */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Mean Scrapping Age
            </span>
            <Anchor size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
            24.4{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>years</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>
            Dry Bulk: 25.2 yrs | Tankers: 22.8 yrs
          </div>
        </div>

        {/* Benchmark Scrap Price ($/LDT) */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Subcontinent Scrap Index
            </span>
            <DollarSign size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>
            $525{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>/ LDT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            India: $520 | Bangladesh: $535 | Pak: $515
          </div>
        </div>

        {/* Green Recycling Compliance */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              HKC Green Yards
            </span>
            <ShieldCheck size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c084fc' }}>
            {hkcSharePct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Hong Kong Convention certified
          </div>
        </div>
      </div>

      {/* Average Scrapping Age by Vessel Class Breakdown */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #f8fafc)',
            margin: '0 0 1rem 0',
          }}
        >
          Average Demolition Age by Vessel Class & Longevity Benchmark
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {ageAnalysis.map((item) => {
            const pct = Math.min((item.average_age / 35) * 100, 100);
            return (
              <div
                key={item.vessel_class}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border-subtle, #1e293b)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>
                    {item.vessel_class}
                  </span>
                  <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                    {item.average_age.toFixed(1)} yrs
                  </span>
                </div>

                {/* Age Meter Bar */}
                <div
                  style={{
                    height: '6px',
                    background: 'var(--color-border-subtle, #1e293b)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background:
                        item.average_age > 26
                          ? '#10b981'
                          : item.average_age > 23
                          ? '#38bdf8'
                          : '#f59e0b',
                      borderRadius: '3px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary, #94a3b8)',
                  }}
                >
                  <span>Sample: {item.scrapped_count} ships</span>
                  <span>{OrderbookAnalyticsEngine.formatDwt(item.scrapped_dwt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demolitions Roster Table */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '12px',
          padding: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #f8fafc)',
            margin: '0 0 1rem 0',
          }}
        >
          Recorded Scrapping Transactions & Demolition Log
        </h3>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '0.65rem 0.75rem' }}>Vessel Name</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Class & Sector</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Built Year</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Age at Scrap</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Capacity DWT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>LDT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Recycling Yard / Beach</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>Price $/LDT</th>
              <th style={{ padding: '0.65rem 0.75rem' }}>HKC Certified</th>
            </tr>
          </thead>
          <tbody>
            {demos.map((d) => (
              <tr
                key={d.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                }}
              >
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                  {d.vessel_name}
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                  {d.vessel_class} ({d.sector})
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8' }}>
                  {d.year_built}
                </td>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  {d.scrapping_age_years.toFixed(1)} yrs
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                  {OrderbookAnalyticsEngine.formatDwt(d.capacity_dwt)}
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                  {(d.ldt || Math.round(d.capacity_dwt * 0.16)).toLocaleString()} t
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>
                  {d.scrapping_location}
                </td>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#10b981' }}>
                  ${d.scrap_price_per_ldt_usd}
                </td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: d.green_recycling_certified
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(148, 163, 184, 0.1)',
                      color: d.green_recycling_certified ? '#10b981' : '#94a3b8',
                    }}
                  >
                    {d.green_recycling_certified ? 'HKC Green' : 'Standard'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
