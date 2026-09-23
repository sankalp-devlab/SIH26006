/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Interactive Emissions Time-Series Trend Visualization
 */

import { useState, useMemo } from 'react';
import {
  Calendar,
  Eye,
} from 'lucide-react';
import type {
  HistoricalEmissionsPoint,
  EmissionsMetric,
  EmissionsTimeAggregation,
} from '../../../../types/emissions';

interface EmissionsTrendChartProps {
  trendPoints: HistoricalEmissionsPoint[];
  selectedMetric: EmissionsMetric;
  onMetricChange: (metric: EmissionsMetric) => void;
  aggregation: EmissionsTimeAggregation;
  onAggregationChange: (agg: EmissionsTimeAggregation) => void;
}

export function EmissionsTrendChart({
  trendPoints,
  selectedMetric,
  onMetricChange,
  aggregation,
  onAggregationChange,
}: EmissionsTrendChartProps) {
  // Overlays state
  const [showPreviousPeriod, setShowPreviousPeriod] = useState(true);
  const [showFleetAverage, setShowFleetAverage] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(true);

  // Hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Metric definitions
  const metricConfigs: Record<
    EmissionsMetric,
    { label: string; unit: string; color: string; getValue: (pt: HistoricalEmissionsPoint) => number }
  > = {
    co2: { label: 'CO₂ Total', unit: 'mt', color: '#10b981', getValue: (pt) => pt.co2Mt },
    nox: { label: 'Total NOx', unit: 'mt', color: '#f59e0b', getValue: (pt) => pt.noxMt },
    sox: { label: 'Total SOx', unit: 'mt', color: '#a855f7', getValue: (pt) => pt.soxMt },
    eeoi: { label: 'EEOI', unit: 'g/t·nm', color: '#0066cc', getValue: (pt) => pt.eeoi },
    aer: { label: 'AER', unit: 'g/dwt·nm', color: '#38bdf8', getValue: (pt) => pt.aer },
    fuel: { label: 'Fuel Consumed', unit: 'mt', color: '#eab308', getValue: (pt) => pt.fuelMt },
  };

  const activeMetricConfig = metricConfigs[selectedMetric] || metricConfigs.co2;

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const margin = { top: 20, right: 30, bottom: 35, left: 60 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // Extract series values
  const seriesData = useMemo(() => {
    if (!trendPoints || trendPoints.length === 0) return [];

    return trendPoints.map((pt) => {
      const val = activeMetricConfig.getValue(pt);
      // Derive baseline and benchmark values proportionally if not directly in point
      const scale = val / (pt.co2Mt || 1);
      return {
        point: pt,
        current: val,
        previous: selectedMetric === 'co2' ? pt.prevPeriodCo2Mt : parseFloat((pt.prevPeriodCo2Mt * scale).toFixed(2)),
        fleetAvg: selectedMetric === 'co2' ? pt.fleetAvgCo2Mt : parseFloat((pt.fleetAvgCo2Mt * scale).toFixed(2)),
        benchmark: selectedMetric === 'co2' ? pt.benchmarkCo2Mt : parseFloat((pt.benchmarkCo2Mt * scale).toFixed(2)),
      };
    });
  }, [trendPoints, activeMetricConfig, selectedMetric]);

  // Compute min/max for scale
  const { minVal, maxVal } = useMemo(() => {
    if (seriesData.length === 0) return { minVal: 0, maxVal: 100 };
    let min = Infinity;
    let max = -Infinity;

    seriesData.forEach((d) => {
      min = Math.min(min, d.current);
      max = Math.max(max, d.current);
      if (showPreviousPeriod) {
        min = Math.min(min, d.previous);
        max = Math.max(max, d.previous);
      }
      if (showFleetAverage) {
        min = Math.min(min, d.fleetAvg);
        max = Math.max(max, d.fleetAvg);
      }
      if (showBenchmark) {
        min = Math.min(min, d.benchmark);
        max = Math.max(max, d.benchmark);
      }
    });

    const pad = (max - min) * 0.1 || 10;
    return {
      minVal: Math.max(0, Math.floor(min - pad)),
      maxVal: Math.ceil(max + pad),
    };
  }, [seriesData, showPreviousPeriod, showFleetAverage, showBenchmark]);

  // Coordinate scales
  const getX = (idx: number) => {
    if (seriesData.length <= 1) return margin.left + innerWidth / 2;
    return margin.left + (idx / (seriesData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return margin.top + innerHeight - ((val - minVal) / range) * innerHeight;
  };

  // Generate SVG path strings
  const currentPath = useMemo(() => {
    if (seriesData.length === 0) return '';
    return seriesData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.current).toFixed(1)}`).join(' ');
  }, [seriesData, minVal, maxVal]);

  const currentAreaPath = useMemo(() => {
    if (seriesData.length === 0) return '';
    const bottomY = margin.top + innerHeight;
    const linePart = seriesData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.current).toFixed(1)}`).join(' ');
    const lastX = getX(seriesData.length - 1);
    const firstX = getX(0);
    return `${linePart} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [seriesData, minVal, maxVal]);

  const prevPath = useMemo(() => {
    if (!showPreviousPeriod || seriesData.length === 0) return '';
    return seriesData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.previous).toFixed(1)}`).join(' ');
  }, [seriesData, showPreviousPeriod, minVal, maxVal]);

  const fleetAvgPath = useMemo(() => {
    if (!showFleetAverage || seriesData.length === 0) return '';
    return seriesData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.fleetAvg).toFixed(1)}`).join(' ');
  }, [seriesData, showFleetAverage, minVal, maxVal]);

  const benchmarkPath = useMemo(() => {
    if (!showBenchmark || seriesData.length === 0) return '';
    return seriesData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.benchmark).toFixed(1)}`).join(' ');
  }, [seriesData, showBenchmark, minVal, maxVal]);

  // Y-axis ticks (5 ticks)
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const val = minVal + ((maxVal - minVal) / (count - 1)) * i;
      ticks.push(Math.round(val));
    }
    return ticks;
  }, [minVal, maxVal]);

  const hoveredData = hoverIndex !== null && seriesData[hoverIndex] ? seriesData[hoverIndex] : null;

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
      {/* Top Header: Title, Metric Toggles & Controls */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
              EMISSIONS TIME-SERIES TREND ANALYTICS
            </h3>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(0, 102, 204, 0.15)',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              IMO BASELINE
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Historical emissions trajectory with operational benchmarks and previous-period overlay
          </p>
        </div>

        {/* Metric Switcher Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(Object.keys(metricConfigs) as EmissionsMetric[]).map((mKey) => {
            const conf = metricConfigs[mKey];
            const isSelected = selectedMetric === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => onMetricChange(mKey)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: isSelected ? `1px solid ${conf.color}` : '1px solid #1e293b',
                  background: isSelected ? `${conf.color}22` : '#0f172a',
                  color: isSelected ? conf.color : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {conf.label}
              </button>
            );
          })}
        </div>

        {/* Aggregation Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0f172a',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid #1e293b',
          }}
        >
          <span style={{ fontSize: '0.6875rem', color: '#64748b', padding: '0 6px' }}>
            <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Agg:
          </span>
          {(['hour', 'day', 'week', 'month'] as const).map((agg) => (
            <button
              key={agg}
              type="button"
              onClick={() => onAggregationChange(agg)}
              style={{
                padding: '3px 8px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: aggregation === agg ? '#0066cc' : 'transparent',
                color: aggregation === agg ? '#ffffff' : '#94a3b8',
              }}
            >
              {agg.charAt(0).toUpperCase() + agg.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '6px',
          marginBottom: '0.75rem',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Eye size={12} /> Overlays:
        </span>

        {/* Current period indicator */}
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: activeMetricConfig.color, fontWeight: 600 }}>
          <span style={{ width: '12px', height: '3px', background: activeMetricConfig.color, borderRadius: '2px' }} />
          Current Period ({activeMetricConfig.unit})
        </span>

        {/* Previous Period Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#94a3b8' }}>
          <input
            type="checkbox"
            checked={showPreviousPeriod}
            onChange={(e) => setShowPreviousPeriod(e.target.checked)}
            style={{ accentColor: '#64748b' }}
          />
          <span style={{ width: '12px', height: '2px', borderBottom: '2px dashed #64748b' }} />
          Previous Period
        </label>

        {/* Fleet Average Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#38bdf8' }}>
          <input
            type="checkbox"
            checked={showFleetAverage}
            onChange={(e) => setShowFleetAverage(e.target.checked)}
            style={{ accentColor: '#38bdf8' }}
          />
          <span style={{ width: '12px', height: '3px', background: '#38bdf8', borderRadius: '2px' }} />
          Fleet Average
        </label>

        {/* Industry Benchmark Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#f59e0b' }}>
          <input
            type="checkbox"
            checked={showBenchmark}
            onChange={(e) => setShowBenchmark(e.target.checked)}
            style={{ accentColor: '#f59e0b' }}
          />
          <span style={{ width: '12px', height: '2px', borderBottom: '2px dashed #f59e0b' }} />
          Industry Benchmark
        </label>
      </div>

      {/* Pure SVG Visualization Area */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="emissionsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeMetricConfig.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={activeMetricConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines & Y-ticks */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + innerWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X-axis ticks */}
          {seriesData.map((d, i) => {
            const x = getX(i);
            return (
              <g key={d.point.timestamp}>
                <text
                  x={x}
                  y={margin.top + innerHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {d.point.date}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={currentAreaPath} fill="url(#emissionsAreaGradient)" />

          {/* Previous Period Series (Dashed) */}
          {showPreviousPeriod && prevPath && (
            <path
              d={prevPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* Fleet Average Series */}
          {showFleetAverage && fleetAvgPath && (
            <path
              d={fleetAvgPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.75"
              opacity="0.9"
            />
          )}

          {/* Industry Benchmark Series (Dashed) */}
          {showBenchmark && benchmarkPath && (
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.75"
              strokeDasharray="5 3"
            />
          )}

          {/* Current Period Series (Solid Vibrant) */}
          {currentPath && (
            <path
              d={currentPath}
              fill="none"
              stroke={activeMetricConfig.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {seriesData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.current);
            const isHovered = hoverIndex === i;

            return (
              <g key={d.point.timestamp}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill="#0d1829"
                  stroke={activeMetricConfig.color}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ transition: 'all 0.15s ease' }}
                />
              </g>
            );
          })}

          {/* Hover Crosshair & Trigger Rectangles */}
          {seriesData.map((_, i) => {
            const x = getX(i);
            const halfStep = innerWidth / (seriesData.length > 1 ? (seriesData.length - 1) * 2 : 2);
            return (
              <rect
                key={i}
                x={x - halfStep}
                y={margin.top}
                width={halfStep * 2}
                height={innerHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Vertical Crosshair Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={margin.top}
              x2={getX(hoverIndex)}
              y2={margin.top + innerHeight}
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>

        {/* Interactive Floating Tooltip */}
        {hoveredData && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: `${Math.min(svgWidth - 220, Math.max(margin.left, getX(hoverIndex) - 100))}px`,
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              fontSize: '0.75rem',
              color: '#f8fafc',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '180px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              {hoveredData.point.date} ({hoveredData.point.timestamp})
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
              <span style={{ color: activeMetricConfig.color, fontWeight: 600 }}>Current:</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                {hoveredData.current.toLocaleString()} {activeMetricConfig.unit}
              </span>
            </div>
            {showPreviousPeriod && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', color: '#94a3b8' }}>
                <span>Previous Period:</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {hoveredData.previous.toLocaleString()} {activeMetricConfig.unit}
                </span>
              </div>
            )}
            {showFleetAverage && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', color: '#38bdf8' }}>
                <span>Fleet Average:</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {hoveredData.fleetAvg.toLocaleString()} {activeMetricConfig.unit}
                </span>
              </div>
            )}
            {showBenchmark && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', color: '#f59e0b' }}>
                <span>Benchmark:</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                  {hoveredData.benchmark.toLocaleString()} {activeMetricConfig.unit}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
