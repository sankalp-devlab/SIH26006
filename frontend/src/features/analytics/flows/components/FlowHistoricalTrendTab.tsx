/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Historical Trends & Time-Series Tab
 */

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface HistoricalPoint {
  date: string;
  volume_mt: number;
  voyages_count: number;
  import_mt: number;
  export_mt: number;
}

interface FlowHistoricalTrendTabProps {
  historicalTrend: HistoricalPoint[];
}

export function FlowHistoricalTrendTab({ historicalTrend }: FlowHistoricalTrendTabProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!historicalTrend || historicalTrend.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '3rem',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        No historical time-series observations available for the active filter selection.
      </div>
    );
  }

  // Calculate chart boundaries
  const maxVol = Math.max(...historicalTrend.map((t) => t.volume_mt), 1000000);
  const minVol = Math.min(...historicalTrend.map((t) => t.volume_mt), 0);
  const totalPeriods = historicalTrend.length;

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 240;
  const padX = 50;
  const padY = 30;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padY * 2;

  // Coordinate mapper
  const points = historicalTrend.map((pt, i) => {
    const x = padX + (i / Math.max(totalPeriods - 1, 1)) * plotWidth;
    const y = padY + plotHeight - ((pt.volume_mt - minVol) / (maxVol - minVol || 1)) * plotHeight;
    return { ...pt, x, y };
  });

  // Polyline & Area path string
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + plotHeight} L ${points[0].x} ${padY + plotHeight} Z`;

  // Summary statistics
  const firstVol = historicalTrend[0].volume_mt;
  const lastVol = historicalTrend[historicalTrend.length - 1].volume_mt;
  const periodChangePct = FlowsAnalyticsEngine.calculateSafePercent(lastVol - firstVol, firstVol);
  const avgMonthlyVol = historicalTrend.reduce((sum, t) => sum + t.volume_mt, 0) / (totalPeriods || 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Historical Trend Header & Key Metrics */}
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                Trade Volume Trajectory (6-Month Observation Series)
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              Monthly aggregated cargo throughput and vessel voyage frequency across active trade lanes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>6M Net Momentum</div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: periodChangePct >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {periodChangePct >= 0 ? `+${periodChangePct}%` : `${periodChangePct}%`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Average Monthly Run-Rate</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                {FlowsAnalyticsEngine.formatVolumeMT(avgMonthlyVol)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Peak Monthly Throughput</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8' }}>
                {FlowsAnalyticsEngine.formatVolumeMT(maxVol)}
              </div>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: 500 }}>
            <defs>
              <linearGradient id="flowVolGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padY + plotHeight * ratio;
              const val = maxVol - ratio * (maxVol - minVol);
              return (
                <g key={ratio}>
                  <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                  <text x={padX - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                    {FlowsAnalyticsEngine.formatVolumeMT(val)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#flowVolGradient)" />

            {/* Primary Volume Line */}
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Data Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g
                  key={p.date}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#ffffff' : '#38bdf8'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={padY + plotHeight + 18}
                    fill={isHovered ? '#ffffff' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '500'}
                    textAnchor="middle"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Card */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '0.6rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginTop: '0.75rem',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8' }}>Observed Period:</span>{' '}
              <strong style={{ color: '#f8fafc' }}>{points[hoveredIndex].date}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Volume:</span>{' '}
              <strong style={{ color: '#38bdf8' }}>{FlowsAnalyticsEngine.formatVolumeMT(points[hoveredIndex].volume_mt)}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Voyages:</span>{' '}
              <strong style={{ color: '#10b981' }}>{points[hoveredIndex].voyages_count} Completed</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
