import {
  Clock,
  GitCompare,
  Calendar,
  Ship,
  Droplets,
} from 'lucide-react';
import type {
  HistoricalComparisonResult,
  HistoricalStorageSnapshot,
} from '../../../../types/floating-storage';

interface FloatingStorageHistoricalTabProps {
  comparison: HistoricalComparisonResult | null;
  snapshots: HistoricalStorageSnapshot[];
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export function FloatingStorageHistoricalTab({
  comparison,
  snapshots,
  selectedPeriod,
  onSelectPeriod,
}: FloatingStorageHistoricalTabProps) {
  const currentSnapshot = snapshots.find((s) => s.periodLabel === selectedPeriod);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Selector & Benchmark Header */}
      <div className="fs-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
          }}
        >
          <div>
            <h3 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <GitCompare size={16} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Historical Macro Benchmark Comparison</span>
            </h3>
            <p className="fs-section-subtitle" style={{ margin: '4px 0 0 0' }}>
              Benchmark current active floating storage capacity against historical quarterly market conditions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="fs-period-select" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ol-text-secondary, #94A3B8)' }}>
              Benchmark Period:
            </label>
            <select
              id="fs-period-select"
              value={selectedPeriod}
              onChange={(e) => onSelectPeriod(e.target.value)}
              className="fs-filter-select"
              style={{ minWidth: '180px' }}
            >
              {snapshots.map((s) => (
                <option key={s.periodLabel} value={s.periodLabel}>
                  {s.periodLabel} ({s.marketContext.slice(0, 28)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-side KPI Comparison */}
        {comparison && (
          <div className="fs-grid-3col" style={{ marginTop: '8px' }}>
            {/* Vessel Count Comparison */}
            <div className="fs-subcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-muted, #64748B)', fontWeight: 700 }}>
                <span>Vessel Count</span>
                <Ship size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>Current Filtered</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ol-text-primary, #F1F5F9)' }}>{comparison.currentVessels}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>{comparison.benchmarkName}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ol-text-secondary, #94A3B8)' }}>{comparison.benchmarkVessels}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)' }}>
                <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Net Delta:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      comparison.vesselDelta > 0
                        ? 'var(--ol-emerald, #10B981)'
                        : comparison.vesselDelta < 0
                        ? 'var(--ol-rose, #F43F5E)'
                        : 'var(--ol-text-secondary, #94A3B8)',
                  }}
                >
                  {comparison.vesselDelta > 0 ? `+${comparison.vesselDelta}` : comparison.vesselDelta} vessels
                </span>
              </div>
            </div>

            {/* Stored Volume Comparison */}
            <div className="fs-subcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-muted, #64748B)', fontWeight: 700 }}>
                <span>Stored Volume (BBL)</span>
                <Droplets size={14} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>Current Filtered</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ol-cyan, #22D3EE)', fontFamily: 'var(--font-mono, monospace)' }}>
                    {(comparison.currentVolumeBbl / 1_000_000).toFixed(1)}M
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>{comparison.benchmarkName}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ol-text-secondary, #94A3B8)', fontFamily: 'var(--font-mono, monospace)' }}>
                    {(comparison.benchmarkVolumeBbl / 1_000_000).toFixed(1)}M
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)' }}>
                <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Volume Delta:</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    color:
                      comparison.volumeDeltaBbl > 0
                        ? 'var(--ol-emerald, #10B981)'
                        : comparison.volumeDeltaBbl < 0
                        ? 'var(--ol-rose, #F43F5E)'
                        : 'var(--ol-text-secondary, #94A3B8)',
                  }}
                >
                  {comparison.volumeDeltaBbl > 0 ? '+' : ''}
                  {(comparison.volumeDeltaBbl / 1_000_000).toFixed(1)}M bbl ({comparison.volumeDeltaPct}%)
                </span>
              </div>
            </div>

            {/* Market Context Insight */}
            <div className="fs-subcard" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-muted, #64748B)', fontWeight: 700 }}>
                <span>Benchmark Market Driver</span>
                <Clock size={14} style={{ color: '#C084FC' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)', lineHeight: 1.5, fontStyle: 'italic', margin: '4px 0' }}>
                "{currentSnapshot?.marketContext ?? 'Historical market benchmark'}"
              </div>
              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)', fontSize: '11px', color: 'var(--ol-amber, #F59E0B)', fontWeight: 600 }}>
                {comparison.analysisNote}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complete Historical Macro Table */}
      <div className="fs-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '14px' }}>
              <Calendar size={15} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Historical Quarterly Storage Benchmarks (2024 – 2026)</span>
            </h4>
            <p className="fs-section-subtitle" style={{ margin: '4px 0 0 0' }}>
              Offshore immobilized inventory tracking quarterly trends and geopolitical disruptions
            </p>
          </div>
          <span className="fs-header-badge">{snapshots.length} Quarters Recorded</span>
        </div>

        <div className="fs-table-container">
          <table className="fs-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Period</th>
                <th style={{ width: '110px' }}>Timestamp</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Vessels</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Volume (BBL)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Volume (MT)</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Avg Days</th>
                <th style={{ width: '180px' }}>Dominant Hub</th>
                <th>Macro Market Drivers</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap) => {
                const isSelected = snap.periodLabel === selectedPeriod;
                return (
                  <tr
                    key={snap.periodLabel}
                    onClick={() => onSelectPeriod(snap.periodLabel)}
                    className={isSelected ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: isSelected ? 'var(--ol-amber, #F59E0B)' : 'var(--ol-text-primary, #F1F5F9)' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--ol-amber, #F59E0B)' : 'var(--ol-text-muted, #64748B)',
                          }}
                        />
                        {snap.periodLabel}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
                      {snap.timestamp.slice(0, 10)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {snap.vesselCount}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)' }}>
                      {(snap.volumeBbl / 1_000_000).toFixed(1)}M
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {(snap.volumeMt / 1_000).toFixed(0)}k
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="fs-duration-pill" style={{ color: '#C084FC' }}>
                        {snap.avgStationaryDays.toFixed(0)}d
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {snap.topRegion.split('&')[0]}
                    </td>
                    <td style={{ fontSize: '11.5px', color: 'var(--ol-text-secondary, #94A3B8)', lineHeight: 1.4 }}>
                      {snap.marketContext}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

