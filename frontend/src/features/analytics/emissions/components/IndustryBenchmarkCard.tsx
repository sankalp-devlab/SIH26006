/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Industry Benchmarking & Percentile Distribution Card
 */

import {
  Award,
} from 'lucide-react';
import type {
  VesselClassBenchmark,
  EmissionsVesselRecord,
} from '../../../../types/emissions';

interface IndustryBenchmarkCardProps {
  selectedVessel: EmissionsVesselRecord | null;
  classBenchmarks: VesselClassBenchmark[];
}

export function IndustryBenchmarkCard({
  selectedVessel,
  classBenchmarks,
}: IndustryBenchmarkCardProps) {
  // Use selected vessel or benchmark prototype
  const vClass = selectedVessel?.vesselClass || 'Capesize';
  const benchmark = classBenchmarks.find((b) => b.vesselClass === vClass) || classBenchmarks[0];

  const vesselAer = selectedVessel ? selectedVessel.attainedAer : benchmark.medianAer * 0.92;
  const benchmarkAer = benchmark.medianAer;

  const aerDeltaPct = (((benchmarkAer - vesselAer) / benchmarkAer) * 100).toFixed(1);
  const isBetter = parseFloat(aerDeltaPct) > 0;

  // Calculate approximate percentile
  let percentile = 50;
  if (vesselAer <= benchmark.p25Aer) {
    percentile = 15; // Top 15%
  } else if (vesselAer <= benchmark.medianAer) {
    percentile = 35; // Top 35%
  } else if (vesselAer <= benchmark.p75Aer) {
    percentile = 65;
  } else {
    percentile = 85;
  }

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
            INDUSTRY ENVIRONMENTAL BENCHMARK & PERCENTILE MATRIX
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Comparison against {benchmark.vesselClass} peer fleet ({benchmark.vesselCount.toLocaleString()} vessels sampled globally)
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8',
            fontWeight: 600,
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          {vClass} Class Baseline
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Highlight Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(15, 36, 62, 0.3) 100%)',
            border: '1px solid rgba(0, 102, 204, 0.3)',
            borderRadius: '6px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Award size={16} />
              CII BENCHMARK PERFORMANCE
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              {selectedVessel ? selectedVessel.name : `Fleet Sample (${vClass})`}
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isBetter ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono, monospace)' }}>
              Top {percentile}%
            </div>
            <p style={{ margin: '0.2rem 0 1rem 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              of comparable {benchmark.vesselClass} vessels in international trades
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Class Benchmark:</span>
                <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }}>
                  {benchmarkAer.toFixed(2)} gCO₂/dwt·nm
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Vessel Attained:</span>
                <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
                  {vesselAer.toFixed(2)} gCO₂/dwt·nm
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#94a3b8' }}>Performance Delta:</span>
                <strong style={{ color: isBetter ? '#10b981' : '#ef4444' }}>
                  {isBetter ? `${aerDeltaPct}% better than benchmark` : `${Math.abs(parseFloat(aerDeltaPct))}% higher than benchmark`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Percentile Quartiles Distribution Chart */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
              Carbon Intensity Percentile Distribution (AER)
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.6875rem', color: '#94a3b8' }}>
              Lower is more efficient. Vessels below the 25th percentile achieve IMO Grade A/B compliance.
            </p>

            {/* Quartile Scale Bar */}
            <div style={{ position: 'relative', margin: '2rem 0 1.5rem 0' }}>
              <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: '#10b981' }} title="Top 25% (< P25)" />
                <div style={{ flex: 1, background: '#34d399' }} title="25% - 50% (P25 - Median)" />
                <div style={{ flex: 1, background: '#f59e0b' }} title="50% - 75% (Median - P75)" />
                <div style={{ flex: 1, background: '#ef4444' }} title="Bottom 25% (> P75)" />
              </div>

              {/* Pin indicator for current vessel */}
              <div
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: `${percentile}%`,
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
                  {vesselAer.toFixed(2)}
                </span>
                <span style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #38bdf8' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '6px' }}>
                <span>Top 25% ({benchmark.p25Aer})</span>
                <span>Median ({benchmark.medianAer})</span>
                <span>Bottom 25% ({benchmark.p75Aer})</span>
              </div>
            </div>

            {/* Other Metrics Percentiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ background: '#0d1829', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>EEOI BENCHMARK</div>
                <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
                  {benchmark.medianEeoi} g/t·nm
                </strong>
              </div>
              <div style={{ background: '#0d1829', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>RECOMMENDED SPEED</div>
                <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                  {benchmark.recommendedSpeedKnots} kts (Eco)
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
