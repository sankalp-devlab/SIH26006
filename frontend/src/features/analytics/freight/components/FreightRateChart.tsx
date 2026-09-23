/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Rate Analysis Terminal Chart
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Maximize2,
  Calendar,
} from 'lucide-react';
import type {
  FreightRateBenchmark,
  FreightDateRange,
} from '../../../../types/freight-analytics';

interface FreightRateChartProps {
  rates: FreightRateBenchmark[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  dateRange: FreightDateRange;
  onDateRangeChange: (range: FreightDateRange) => void;
  onOpenComparison: () => void;
}

export const FreightRateChart: React.FC<FreightRateChartProps> = ({
  rates,
  selectedRouteCode,
  onSelectRoute,
  dateRange,
  onDateRangeChange: _onDateRangeChange,
  onOpenComparison,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeBenchmark = useMemo(() => {
    return rates.find((r) => r.route_code === selectedRouteCode) || rates[0];
  }, [rates, selectedRouteCode]);

  const series = useMemo(() => {
    if (!activeBenchmark || !activeBenchmark.historical_series) return [];
    const raw = activeBenchmark.historical_series;
    if (dateRange === '7d') return raw.slice(-7);
    if (dateRange === '30d') return raw.slice(-30);
    if (dateRange === '90d') return raw.slice(-90);
    return raw;
  }, [activeBenchmark, dateRange]);

  const chartData = useMemo(() => {
    if (series.length < 2) return null;
    const values = series.map((s) => s.rate);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = (maxVal - minVal) * 0.1 || 1;
    const min = Math.max(0, minVal - padding);
    const max = maxVal + padding;
    const range = max - min;

    const width = 800;
    const height = 260;

    const points = series.map((pt, idx) => {
      const x = (idx / (series.length - 1)) * (width - 40) + 20;
      const y = height - ((pt.rate - min) / range) * (height - 40) - 20;
      return { x, y, pt, idx };
    });

    const pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { min, max, range, width, height, points, pathD, areaD };
  }, [series]);

  const hoverItem = hoverIndex !== null && chartData ? chartData.points[hoverIndex] : null;

  return (
    <div className="freight-panel-card" style={{ height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="freight-panel-header">
        <div>
          <div className="freight-panel-title">
            <TrendingUp size={17} style={{ color: 'var(--freight-cyan)' }} />
            <span>Freight Rate Analysis & Benchmark Trajectory</span>
          </div>
          <p className="freight-panel-desc">
            {activeBenchmark
              ? `${activeBenchmark.route_code} — ${activeBenchmark.route_name} (${activeBenchmark.commodity})`
              : 'Historical freight rate trends'}
          </p>
        </div>

        {/* Route Quick Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {rates.slice(0, 6).map((r) => {
            const isSelected = r.route_code === selectedRouteCode;
            return (
              <button
                key={r.route_code}
                type="button"
                onClick={() => onSelectRoute(r.route_code)}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isSelected
                    ? '1px solid var(--freight-cyan)'
                    : '1px solid var(--freight-border)',
                  backgroundColor: isSelected
                    ? 'rgba(0, 217, 255, 0.15)'
                    : 'var(--freight-surface-secondary)',
                  color: isSelected ? 'var(--freight-cyan)' : 'var(--freight-text-secondary)',
                }}
              >
                {r.route_code}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onOpenComparison}
            style={{
              height: '28px',
              padding: '0 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid var(--freight-border)',
              color: 'var(--freight-text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Compare routes"
          >
            <Maximize2 size={12} />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Terminal Chart Wrap */}
      <div className="freight-terminal-chart-wrap" style={{ flex: 1 }}>
        {chartData ? (
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            {/* SVG Interactive Chart */}
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              style={{ width: '100%', height: '240px', overflow: 'visible', display: 'block' }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="freightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.28" />
                  <stop offset="85%" stopColor="#00D9FF" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="freightStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2F8CFF" />
                  <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((fraction) => {
                const y = chartData.height * fraction;
                const val = chartData.max - fraction * chartData.range;
                return (
                  <g key={fraction}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartData.width}
                      y2={y}
                      stroke="rgba(100, 190, 240, 0.1)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="10"
                      y={y - 4}
                      fill="#7189A3"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      ${val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <path d={chartData.areaD} fill="url(#freightAreaGradient)" />

              {/* Primary Curve Line */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="url(#freightStrokeGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Target Rectangles */}
              {chartData.points.map((p, i) => (
                <rect
                  key={i}
                  x={p.x - 10}
                  y="0"
                  width="20"
                  height={chartData.height}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                  onMouseEnter={() => setHoverIndex(i)}
                />
              ))}

              {/* Active Hover Point & Crosshair */}
              {hoverItem && (
                <g>
                  <line
                    x1={hoverItem.x}
                    y1="0"
                    x2={hoverItem.x}
                    y2={chartData.height}
                    stroke="rgba(0, 217, 255, 0.5)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={hoverItem.x}
                    cy={hoverItem.y}
                    r="5"
                    fill="#00D9FF"
                    stroke="#081A2A"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Floating Tooltip */}
            {hoverItem && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  backgroundColor: 'rgba(9, 26, 42, 0.95)',
                  border: '1px solid var(--freight-cyan)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--freight-text-muted)' }}>
                  <Calendar size={12} />
                  <span>{hoverItem.pt.date}</span>
                  <span style={{ color: 'var(--freight-cyan)', fontWeight: 700 }}>
                    {activeBenchmark?.route_code}
                  </span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--freight-cyan)' }}>
                  ${hoverItem.pt.rate.toFixed(2)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--freight-text-secondary)' }}>
                    {activeBenchmark?.rate_basis === 'per_day_tce' ? '/day' : '/MT'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--freight-text-muted)' }}>
            Loading benchmark time-series...
          </div>
        )}

        {/* Stats Strip */}
        {activeBenchmark && (
          <div className="freight-chart-stat-grid">
            <div className="freight-chart-stat-item">
              <span className="freight-chart-stat-label">52-Week High</span>
              <span className="freight-chart-stat-value" style={{ color: 'var(--freight-green)' }}>
                ${activeBenchmark.high_52w.toFixed(2)}
              </span>
            </div>
            <div className="freight-chart-stat-item">
              <span className="freight-chart-stat-label">52-Week Low</span>
              <span className="freight-chart-stat-value" style={{ color: 'var(--freight-red)' }}>
                ${activeBenchmark.low_52w.toFixed(2)}
              </span>
            </div>
            <div className="freight-chart-stat-item">
              <span className="freight-chart-stat-label">30D Movement</span>
              <span
                className="freight-chart-stat-value"
                style={{
                  color: activeBenchmark.change_30d_pct >= 0 ? 'var(--freight-green)' : 'var(--freight-red)',
                }}
              >
                {activeBenchmark.change_30d_pct >= 0 ? '+' : ''}
                {activeBenchmark.change_30d_pct}%
              </span>
            </div>
            <div className="freight-chart-stat-item">
              <span className="freight-chart-stat-label">Corridor Distance</span>
              <span className="freight-chart-stat-value" style={{ color: 'var(--freight-cyan)' }}>
                {activeBenchmark.distance_nm.toLocaleString()} NM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
