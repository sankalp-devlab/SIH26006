/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Multi-Vessel Valuation Comparison Matrix (Up to 5 Vessels)
 */

import {
  X,
  GitCompare,
  Trash2,
} from 'lucide-react';
import type {
  VesselValuationComparisonResult,
  VesselValuationRecord,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface VesselComparisonMatrixProps {
  comparisonResult: VesselValuationComparisonResult;
  allVessels: VesselValuationRecord[];
  onRemoveVessel: (id: number) => void;
  onAddVessel: (id: number) => void;
  onClearAll: () => void;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
  onSelectVessel: (id: number) => void;
}

export function VesselComparisonMatrix({
  comparisonResult,
  allVessels,
  onRemoveVessel,
  onAddVessel,
  onClearAll,
  currency,
  rates,
  onSelectVessel,
}: VesselComparisonMatrixProps) {
  const { vessels, metrics } = comparisonResult;

  const remainingVessels = allVessels.filter((v) => !vessels.some((comp) => comp.id === v.id));

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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={18} style={{ color: '#38bdf8' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
              MULTI-VESSEL VALUATION COMPARISON ENGINE
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Side-by-side asset comparison matrix evaluating up to 5 vessels against segment benchmark
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Add Vessel Dropdown */}
          {vessels.length < 5 && remainingVessels.length > 0 && (
            <select
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) {
                  onAddVessel(id);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: '#0a111c',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>+ Add Vessel to Compare ({vessels.length}/5)</option>
              {remainingVessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vesselClass} &bull; ${v.currentMarketValueUsdM.toFixed(1)}M)
                </option>
              ))}
            </select>
          )}

          {vessels.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {vessels.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
          No vessels selected for comparison. Use the vessel registry table or the dropdown above to add up to 5 vessels.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b' }}>
                <th style={{ padding: '10px', color: '#64748b', textTransform: 'uppercase', fontSize: '0.6875rem', minWidth: '180px' }}>
                  Analytical Metric
                </th>
                {vessels.map((v) => (
                  <th
                    key={v.id}
                    style={{
                      padding: '10px',
                      color: '#f8fafc',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      minWidth: '160px',
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderLeft: '1px solid #1e293b',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelectVessel(v.id)}
                        title="Click to view full dossier"
                      >
                        <div style={{ color: '#38bdf8' }}>{v.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 400 }}>
                          {v.vesselClass} &bull; {v.dwt.toLocaleString()} DWT
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveVessel(v.id)}
                        title="Remove vessel from comparison"
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
                <th
                  style={{
                    padding: '10px',
                    color: '#a855f7',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    minWidth: '140px',
                    background: 'rgba(168, 85, 247, 0.08)',
                    borderLeft: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                >
                  Segment Benchmark
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.key} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>
                    {m.label} ({m.unit})
                  </td>
                  {vessels.map((v) => {
                    const rawVal = m.values[v.id];
                    const isBest = m.bestVesselId === v.id && vessels.length > 1;
                    const isWorst = m.worstVesselId === v.id && vessels.length > 1;

                    let displayVal: string;
                    if (m.key === 'currentMarketValueUsdM' || m.key === 'demolitionScrapValueUsdM') {
                      displayVal = formatValuation(Number(rawVal), currency, rates);
                    } else if (m.key === 'change1yPct') {
                      const num = Number(rawVal);
                      displayVal = `${num >= 0 ? '+' : ''}${num}%`;
                    } else if (m.key === 'valuationPerDwtUsd') {
                      displayVal = `$${Number(rawVal).toFixed(1)}`;
                    } else if (m.key === 'ageYears') {
                      displayVal = `${Number(rawVal).toFixed(1)} yrs`;
                    } else if (m.key === 'scrapFloorPct') {
                      displayVal = `${Number(rawVal).toFixed(1)}%`;
                    } else {
                      displayVal = String(rawVal);
                    }

                    return (
                      <td
                        key={v.id}
                        style={{
                          padding: '10px',
                          borderLeft: '1px solid #1e293b',
                          background: isBest ? 'rgba(16, 185, 129, 0.05)' : isWorst ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: isBest ? '#10b981' : isWorst ? '#ef4444' : '#f8fafc' }}>
                            {displayVal}
                          </span>

                          {isBest && (
                            <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '3px', background: '#10b981', color: '#0a111c', fontWeight: 700 }}>
                              BEST
                            </span>
                          )}

                          {isWorst && (
                            <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 600 }}>
                              WORST
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td
                    style={{
                      padding: '10px',
                      borderLeft: '1px solid rgba(168, 85, 247, 0.3)',
                      background: 'rgba(168, 85, 247, 0.04)',
                      color: '#a855f7',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                    }}
                  >
                    {m.benchmarkValue || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
