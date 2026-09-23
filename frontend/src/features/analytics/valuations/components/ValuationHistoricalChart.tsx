/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Interactive Historical Valuation Time-Series SVG Chart
 */

import { useState, useMemo } from 'react';
import type {
  ValuationHistoricalPoint,
  ValuationTimeHorizon,
  ValuationChartMetric,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface ValuationHistoricalChartProps {
  historicalPoints: ValuationHistoricalPoint[];
  timeHorizon: ValuationTimeHorizon;
  onTimeHorizonChange: (h: ValuationTimeHorizon) => void;
  chartMetric: ValuationChartMetric;
  onChartMetricChange: (m: ValuationChartMetric) => void;
  showBenchmarkOverlay: boolean;
  onToggleBenchmarkOverlay: () => void;
  showSimilarVesselsOverlay: boolean;
  onToggleSimilarVesselsOverlay: () => void;
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
  vesselName: string;
  vesselClass: string;
}

export function ValuationHistoricalChart({
  historicalPoints,
  timeHorizon,
  onTimeHorizonChange,
  chartMetric,
  onChartMetricChange,
  showBenchmarkOverlay,
  onToggleBenchmarkOverlay,
  showSimilarVesselsOverlay,
  onToggleSimilarVesselsOverlay,
  currency,
  rates,
  vesselName,
  vesselClass,
}: ValuationHistoricalChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Slice historical points based on selected time horizon
  const visiblePoints = useMemo(() => {
    if (!historicalPoints || historicalPoints.length === 0) return [];
    let count = 12; // 1Y default
    if (timeHorizon === '3M') count = 3;
    else if (timeHorizon === '6M') count = 6;
    else if (timeHorizon === '1Y') count = 12;
    else if (timeHorizon === '3Y') count = 36;
    else if (timeHorizon === '5Y') count = 60;
    else if (timeHorizon === 'MAX') count = historicalPoints.length;

    return historicalPoints.slice(-count);
  }, [historicalPoints, timeHorizon]);

  // Metric value extractor
  const getVal = (pt: ValuationHistoricalPoint, metric: ValuationChartMetric): number => {
    if (metric === 'market_value') return pt.marketValueUsdM;
    if (metric === 'value_per_dwt') return pt.valuationPerDwtUsd;
    if (metric === 'demolition_value') return pt.demolitionValueUsdM;
    return pt.marketValueUsdM;
  };

  // Dimensions & Scales
  const width = 840;
  const height = 300;
  const margin = { top: 25, right: 30, bottom: 40, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yMin = useMemo(() => {
    if (visiblePoints.length === 0) return 0;
    const allVals = visiblePoints.flatMap((p) => [
      getVal(p, chartMetric),
      showSimilarVesselsOverlay ? (chartMetric === 'market_value' ? p.segmentAverageUsdM : getVal(p, chartMetric) * 0.95) : getVal(p, chartMetric),
      showBenchmarkOverlay ? (chartMetric === 'market_value' ? p.marketBenchmarkUsdM : getVal(p, chartMetric) * 0.9) : getVal(p, chartMetric),
      chartMetric === 'market_value' ? p.demolitionValueUsdM : getVal(p, chartMetric),
    ]);
    return Math.max(0, Math.floor(Math.min(...allVals) * 0.9));
  }, [visiblePoints, chartMetric, showSimilarVesselsOverlay, showBenchmarkOverlay]);

  const yMax = useMemo(() => {
    if (visiblePoints.length === 0) return 100;
    const allVals = visiblePoints.flatMap((p) => [
      getVal(p, chartMetric),
      showSimilarVesselsOverlay ? (chartMetric === 'market_value' ? p.segmentAverageUsdM : getVal(p, chartMetric) * 1.05) : getVal(p, chartMetric),
      showBenchmarkOverlay ? (chartMetric === 'market_value' ? p.marketBenchmarkUsdM : getVal(p, chartMetric) * 1.08) : getVal(p, chartMetric),
    ]);
    return Math.ceil(Math.max(...allVals) * 1.08);
  }, [visiblePoints, chartMetric, showSimilarVesselsOverlay, showBenchmarkOverlay]);

  const getX = (index: number) => {
    if (visiblePoints.length <= 1) return margin.left + innerWidth / 2;
    return margin.left + (index / (visiblePoints.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = yMax - yMin || 1;
    return margin.top + innerHeight - ((val - yMin) / range) * innerHeight;
  };

  // Build SVG Path Strings
  const vesselPath = useMemo(() => {
    if (visiblePoints.length === 0) return '';
    return visiblePoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(getVal(pt, chartMetric)).toFixed(1)}`)
      .join(' ');
  }, [visiblePoints, chartMetric, yMin, yMax]);

  const vesselArea = useMemo(() => {
    if (visiblePoints.length === 0) return '';
    const lastX = getX(visiblePoints.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const bottomY = (margin.top + innerHeight).toFixed(1);
    return `${vesselPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [vesselPath, visiblePoints]);

  const segmentAvgPath = useMemo(() => {
    if (!showSimilarVesselsOverlay || visiblePoints.length === 0) return '';
    return visiblePoints
      .map((pt, i) => {
        const val = chartMetric === 'market_value' ? pt.segmentAverageUsdM : getVal(pt, chartMetric) * 0.96;
        return `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`;
      })
      .join(' ');
  }, [visiblePoints, showSimilarVesselsOverlay, chartMetric, yMin, yMax]);

  const benchmarkPath = useMemo(() => {
    if (!showBenchmarkOverlay || visiblePoints.length === 0) return '';
    return visiblePoints
      .map((pt, i) => {
        const val = chartMetric === 'market_value' ? pt.marketBenchmarkUsdM : getVal(pt, chartMetric) * 0.94;
        return `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`;
      })
      .join(' ');
  }, [visiblePoints, showBenchmarkOverlay, chartMetric, yMin, yMax]);

  const demoFloorPath = useMemo(() => {
    if (chartMetric !== 'market_value' || visiblePoints.length === 0) return '';
    return visiblePoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.demolitionValueUsdM).toFixed(1)}`)
      .join(' ');
  }, [visiblePoints, chartMetric, yMin, yMax]);

  const hoveredPoint = hoveredIndex !== null ? visiblePoints[hoveredIndex] : null;

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
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            HISTORICAL VALUATION TRAJECTORY
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Multi-year appraisal records with peer segment and market benchmark overlays
          </p>
        </div>

        {/* Controls: Metric Modes & Time Ranges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Metric Mode Toggle */}
          <div style={{ display: 'flex', background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '2px' }}>
            {(
              [
                { id: 'market_value', label: 'Market Value ($M)' },
                { id: 'value_per_dwt', label: 'Valuation / DWT' },
                { id: 'demolition_value', label: 'Demolition Floor' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChartMetricChange(m.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: chartMetric === m.id ? '#0066cc' : 'transparent',
                  color: chartMetric === m.id ? '#ffffff' : '#94a3b8',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', background: '#0a111c', border: '1px solid #1e293b', borderRadius: '6px', padding: '2px' }}>
            {(['3M', '6M', '1Y', '3Y', '5Y', 'MAX'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onTimeHorizonChange(h)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: timeHorizon === h ? '#38bdf8' : 'transparent',
                  color: timeHorizon === h ? '#0a111c' : '#94a3b8',
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#38bdf8', borderRadius: '2px' }} />
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{vesselName}</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showSimilarVesselsOverlay}
            onChange={onToggleSimilarVesselsOverlay}
            style={{ accentColor: '#10b981' }}
          />
          <span style={{ width: '12px', height: '2px', background: '#10b981', borderStyle: 'dashed' }} />
          <span>{vesselClass} Segment Average</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showBenchmarkOverlay}
            onChange={onToggleBenchmarkOverlay}
            style={{ accentColor: '#a855f7' }}
          />
          <span style={{ width: '12px', height: '2px', background: '#a855f7' }} />
          <span>Global Market Index</span>
        </label>

        {chartMetric === 'market_value' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ width: '12px', height: '2px', background: '#f59e0b', borderStyle: 'dotted' }} />
            <span style={{ color: '#f59e0b' }}>Demolition Scrap Floor</span>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="vesselValGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Horizontal Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = yMin + (yMax - yMin) * pct;
            const yPos = getY(val);
            return (
              <g key={pct}>
                <line
                  x1={margin.left}
                  y1={yPos}
                  x2={width - margin.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4, 4"
                />
                <text
                  x={margin.left - 8}
                  y={yPos + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {chartMetric === 'value_per_dwt' ? `$${Math.round(val)}` : `$${val.toFixed(0)}M`}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {visiblePoints.map((pt, i) => {
            const skipFactor = visiblePoints.length > 24 ? 6 : visiblePoints.length > 12 ? 3 : 1;
            if (i % skipFactor !== 0 && i !== visiblePoints.length - 1) return null;
            const xPos = getX(i);
            return (
              <text
                key={pt.date}
                x={xPos}
                y={margin.top + innerHeight + 20}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {pt.date}
              </text>
            );
          })}

          {/* Demolition Floor Line (if in market value mode) */}
          {demoFloorPath && (
            <path
              d={demoFloorPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3, 3"
              opacity="0.85"
            />
          )}

          {/* Global Benchmark Overlay */}
          {benchmarkPath && (
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="5, 5"
              opacity="0.8"
            />
          )}

          {/* Segment Average Overlay */}
          {segmentAvgPath && (
            <path
              d={segmentAvgPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4, 4"
              opacity="0.85"
            />
          )}

          {/* Primary Vessel Area & Line */}
          {vesselArea && <path d={vesselArea} fill="url(#vesselValGrad)" />}
          {vesselPath && (
            <path
              d={vesselPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair and Trigger Areas */}
          {visiblePoints.map((pt, i) => {
            const xPos = getX(i);
            const yPos = getY(getVal(pt, chartMetric));
            const isHovered = hoveredIndex === i;

            return (
              <g key={pt.date}>
                {/* Hit area for mouse hover */}
                <rect
                  x={xPos - innerWidth / (visiblePoints.length * 2)}
                  y={margin.top}
                  width={innerWidth / visiblePoints.length}
                  height={innerHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {isHovered && (
                  <>
                    <line
                      x1={xPos}
                      y1={margin.top}
                      x2={xPos}
                      y2={margin.top + innerHeight}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2, 2"
                    />
                    <circle
                      cx={xPos}
                      cy={yPos}
                      r="5"
                      fill="#38bdf8"
                      stroke="#0d1829"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '15px',
              left: `${Math.min(Math.max(margin.left + 20, getX(hoveredIndex)), width - 220)}px`,
              background: 'rgba(10, 17, 28, 0.92)',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#f8fafc',
              fontSize: '0.75rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              {hoveredPoint.date}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ color: '#94a3b8' }}>{vesselName}:</span>
              <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono, monospace)' }}>
                {chartMetric === 'value_per_dwt'
                  ? `$${hoveredPoint.valuationPerDwtUsd.toFixed(1)}/DWT`
                  : formatValuation(hoveredPoint.marketValueUsdM, currency, rates)}
              </strong>
            </div>

            {showSimilarVesselsOverlay && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#10b981' }}>
                <span>Segment Avg:</span>
                <strong style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(hoveredPoint.segmentAverageUsdM, currency, rates)}
                </strong>
              </div>
            )}

            {showBenchmarkOverlay && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#a855f7' }}>
                <span>Market Index:</span>
                <strong style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(hoveredPoint.marketBenchmarkUsdM, currency, rates)}
                </strong>
              </div>
            )}

            {chartMetric === 'market_value' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#f59e0b' }}>
                <span>Scrap Floor:</span>
                <strong style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatValuation(hoveredPoint.demolitionValueUsdM, currency, rates)}
                </strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
