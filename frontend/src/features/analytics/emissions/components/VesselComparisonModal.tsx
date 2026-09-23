/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Multi-Vessel Comparison Engine Modal (Up to 5 Vessels)
 */

import {
  X,
  GitCompare,
} from 'lucide-react';
import type {
  VesselComparisonResult,
} from '../../../../types/emissions';

interface VesselComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonResult: VesselComparisonResult;
  onRemoveVessel: (id: number) => void;
  onClearAll: () => void;
}

export function VesselComparisonModal({
  isOpen,
  onClose,
  comparisonResult,
  onRemoveVessel,
  onClearAll,
}: VesselComparisonModalProps) {
  if (!isOpen) return null;

  const { vessels, metricSummaries, benchmark } = comparisonResult;

  const highlightStyles = {
    best: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', label: 'BEST' },
    worst: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', label: 'WORST' },
    above: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', label: '> BENCHMARK' },
    below: { background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', label: '< BENCHMARK' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          background: '#0a111c',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0d1829',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(0, 102, 204, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitCompare size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                VESSEL EMISSIONS COMPARISON ENGINE
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Side-by-side multi-variable carbon intensity benchmark matrix (Max 5 vessels)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {vessels.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Clear Selection
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {vessels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <p>No vessels currently selected for comparison.</p>
              <span style={{ fontSize: '0.75rem' }}>
                Check the boxes next to vessels in the table to add them here.
              </span>
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#94a3b8', minWidth: '160px' }}>
                      METRIC & SPEC
                    </th>
                    {/* Vessel Headers */}
                    {vessels.map((item) => (
                      <th
                        key={item.vessel.id}
                        style={{
                          padding: '10px',
                          textAlign: 'center',
                          color: '#f8fafc',
                          minWidth: '150px',
                          background: 'rgba(15, 23, 42, 0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 700 }}>{item.vessel.name}</span>
                          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                            {item.vessel.imoNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              background: '#1e293b',
                              color: '#38bdf8',
                            }}
                          >
                            {item.vessel.vesselClass}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveVessel(item.vessel.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.6875rem',
                              cursor: 'pointer',
                              marginTop: '4px',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                    {/* Benchmark Header */}
                    <th
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.05)',
                        minWidth: '140px',
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{benchmark.vesselClass} BENCHMARK</div>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Industry Median</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* CII Rating Row */}
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>
                      CII Rating Grade
                    </td>
                    {vessels.map((item) => (
                      <td key={item.vessel.id} style={{ padding: '10px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            background: item.vessel.ciiRating === 'A' ? '#10b98122' : '#f59e0b22',
                            color: item.vessel.ciiRating === 'A' ? '#10b981' : '#f59e0b',
                            border: `1px solid ${item.vessel.ciiRating === 'A' ? '#10b981' : '#f59e0b'}55`,
                          }}
                        >
                          Grade {item.vessel.ciiRating}
                        </span>
                      </td>
                    ))}
                    <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>
                      Grade C
                    </td>
                  </tr>

                  {/* Dynamic Metric Rows */}
                  {metricSummaries.map((summary) => (
                    <tr key={summary.metric} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>
                        <div>{summary.label}</div>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>({summary.unit})</span>
                      </td>
                      {vessels.map((item) => {
                        const vVal = summary.vesselValues.find((vv) => vv.vesselId === item.vessel.id);
                        const style = vVal ? highlightStyles[vVal.highlight] : highlightStyles.below;

                        return (
                          <td key={item.vessel.id} style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#f8fafc', fontSize: '0.875rem' }}>
                              {vVal ? vVal.value.toLocaleString() : '-'}
                            </div>
                            {vVal && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  padding: '1px 4px',
                                  borderRadius: '3px',
                                  marginTop: '2px',
                                  background: style.background,
                                  color: style.color,
                                  border: style.border,
                                }}
                              >
                                {style.label}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#f59e0b' }}>
                        {summary.benchmarkValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
