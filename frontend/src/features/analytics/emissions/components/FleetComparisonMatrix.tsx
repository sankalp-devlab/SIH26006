/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Multi-Fleet Comparative Emissions Analytics
 */

import {
  TrendingDown,
} from 'lucide-react';
import type {
  FleetEmissionsBenchmark,
  CiiRating,
} from '../../../../types/emissions';

interface FleetComparisonMatrixProps {
  fleetBenchmarks: FleetEmissionsBenchmark[];
}

export function FleetComparisonMatrix({ fleetBenchmarks }: FleetComparisonMatrixProps) {
  const ciiColors: Record<CiiRating, string> = {
    A: '#10b981',
    B: '#34d399',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
  };

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            FLEET-LEVEL EMISSIONS BENCHMARKING
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Comparative environmental performance across commercial fleets and global industry baseline
          </p>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {fleetBenchmarks.map((fleet, idx) => {
          const isIndustryBenchmark = fleet.fleetId === 'flt-industry-benchmark';
          const rColor = ciiColors[fleet.avgCiiRating];
          const totalVessels = Object.values(fleet.ciiDistribution).reduce((a, b) => a + b, 0) || 1;

          return (
            <div
              key={fleet.fleetId}
              style={{
                background: isIndustryBenchmark ? 'rgba(56, 189, 248, 0.05)' : '#0f172a',
                border: isIndustryBenchmark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 700 }}>
                      RANK #{idx + 1}
                    </span>
                    <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                      {fleet.fleetName}
                    </h4>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: `${rColor}22`,
                      color: rColor,
                      border: `1px solid ${rColor}55`,
                    }}
                  >
                    CII {fleet.avgCiiRating}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  {fleet.vesselCount} Monitored Vessels &bull; {fleet.co2IntensityKgPerNm} kg CO₂/nm
                </div>

                {/* Key Metrics Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#94a3b8' }}>Total CO₂</span>
                    <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
                      {fleet.totalCo2Mt.toLocaleString()} mt
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#94a3b8' }}>Average AER</span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
                      {fleet.avgAer.toFixed(2)} g/dwt·nm
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#94a3b8' }}>Average EEOI</span>
                    <strong style={{ color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)' }}>
                      {fleet.avgEeoi.toFixed(2)} g/t·nm
                    </strong>
                  </div>
                </div>

                {/* Mini CII Distribution Proportional Meter */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginBottom: '2px' }}>
                    <span>CII Distribution</span>
                    <span>{fleet.annualCo2ReductionPct}% Annual Reduction</span>
                  </div>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#1e293b' }}>
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((r) => {
                      const count = fleet.ciiDistribution[r] || 0;
                      const pct = (count / totalVessels) * 100;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={r}
                          title={`Grade ${r}: ${count}`}
                          style={{ width: `${pct}%`, background: ciiColors[r] }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: '#10b981' }}>
                <TrendingDown size={12} />
                <span>-{fleet.annualCo2ReductionPct}% decarbonization rate vs baseline</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
