import React, { useState, useMemo } from 'react';
import {
  Activity,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type { TimeSeriesQueryResult } from '../../../types/data-query';

interface TimeSeriesViewProps {
  data?: TimeSeriesQueryResult;
  isLoading?: boolean;
}

const SERIES_COLORS = [
  '#00D4FF', // cyan
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
];

export const TimeSeriesView: React.FC<TimeSeriesViewProps> = ({
  data,
  isLoading,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = data?.points || [];
  const seriesKeys = data?.seriesKeys || [];

  // Dimensions & Scales
  const width = 880;
  const height = 340;
  const margin = { top: 25, right: 35, bottom: 45, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { minVal, valSpan } = useMemo(() => {
    if (points.length === 0) return { minVal: 0, valSpan: 100 };
    const allVals: number[] = [];
    points.forEach((pt) => {
      seriesKeys.forEach((k) => {
        const v = pt.series[k];
        if (v !== undefined && !isNaN(v)) allVals.push(v);
      });
    });
    if (allVals.length === 0) return { minVal: 0, valSpan: 100 };

    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    const pad = (max - min) * 0.1 || 500;
    return {
      minVal: min - pad,
      valSpan: max - min + pad * 2 || 1,
    };
  }, [points, seriesKeys]);

  const getX = (idx: number) =>
    margin.left + (idx / Math.max(1, points.length - 1)) * innerWidth;

  const getY = (val: number) =>
    margin.top + innerHeight - ((val - minVal) / valSpan) * innerHeight;

  // Build SVG Paths
  const paths = useMemo(() => {
    if (points.length === 0) return {};
    const res: Record<string, string> = {};

    seriesKeys.forEach((key) => {
      res[key] = points
        .map((pt, idx) => {
          const val = pt.series[key] ?? 0;
          return `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`;
        })
        .join(' ');
    });
    return res;
  }, [points, seriesKeys, minVal, valSpan]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-lg, 12px)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        }}
      >
        <Activity size={36} style={{ color: 'var(--ol-cyan, #00D4FF)', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)', margin: 0 }}>
          Aggregating and resampling multi-year time-series...
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', marginTop: '4px' }}>
          Computing projections, trends, and analytical moving averages
        </p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-lg, 12px)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        }}
      >
        <AlertCircle size={36} style={{ color: 'var(--ol-amber, #F59E0B)', margin: '0 auto 14px' }} />
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', margin: '0 0 6px 0' }}>
          No Historical Data Points Found For Active Parameters
        </p>
        <p style={{ fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)', margin: 0 }}>
          Try expanding the historical date window or loosening condition filters in the builder above.
        </p>
      </div>
    );
  }

  const activeHover = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--ol-surface-primary, #091B2E)',
        border: '1px solid var(--ol-border, #183A52)',
        borderRadius: 'var(--ol-radius-lg, 12px)',
        boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
        boxSizing: 'border-box',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Top Legend & Statistical Summary */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--ol-border, #183A52)',
        }}
      >
        {/* Series Legend Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ol-text-muted, #94A3B8)', letterSpacing: '0.05em' }}>
            <TrendingUp size={13} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
            <span>Series:</span>
          </div>
          {seriesKeys.map((k, idx) => {
            const color = SERIES_COLORS[idx % SERIES_COLORS.length];
            const label = data?.seriesLabels[k] || k;
            return (
              <div
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--ol-radius-md, 6px)',
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  border: '1px solid var(--ol-border, #183A52)',
                  fontSize: '12px',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
                <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Statistical KPI summary */}
        {data?.summary && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              padding: '6px 14px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              border: '1px solid var(--ol-border, #183A52)',
            }}
          >
            <div style={{ color: 'var(--ol-text-muted, #94A3B8)' }}>
              Min: <strong style={{ color: 'var(--ol-red, #F43F5E)' }}>${data.summary.min.toLocaleString()}</strong>
            </div>
            <span style={{ color: 'var(--ol-border, #183A52)' }}>|</span>
            <div style={{ color: 'var(--ol-text-muted, #94A3B8)' }}>
              Avg: <strong style={{ color: 'var(--ol-cyan, #00D4FF)' }}>${Math.round(data.summary.avg).toLocaleString()}</strong>
            </div>
            <span style={{ color: 'var(--ol-border, #183A52)' }}>|</span>
            <div style={{ color: 'var(--ol-text-muted, #94A3B8)' }}>
              Max: <strong style={{ color: 'var(--ol-green, #10B981)' }}>${data.summary.max.toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>

      {/* SVG Time-Series Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            overflow: 'visible',
            userSelect: 'none',
            display: 'block',
            minWidth: '550px',
          }}
        >
          <defs>
            {seriesKeys.map((key, idx) => {
              const color = SERIES_COLORS[idx % SERIES_COLORS.length];
              return (
                <linearGradient key={`grad_${key}`} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margin.top + innerHeight * (1 - ratio);
            const val = minVal + valSpan * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="rgba(100,190,240,0.12)"
                  strokeDasharray="4 4"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  fill="var(--ol-text-muted, #94A3B8)"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Time-Series Lines */}
          {seriesKeys.map((key, idx) => {
            const color = SERIES_COLORS[idx % SERIES_COLORS.length];
            return (
              <g key={key}>
                <path
                  d={paths[key] || ''}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Vertical Hover Crosshair */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={margin.top}
              x2={getX(hoveredIdx)}
              y2={margin.top + innerHeight}
              stroke="var(--ol-cyan, #00D4FF)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Hover interaction overlay rects */}
          {points.map((_, idx) => {
            const x = getX(idx);
            const stepW = innerWidth / Math.max(1, points.length);
            return (
              <rect
                key={idx}
                x={x - stepW / 2}
                y={margin.top}
                width={stepW}
                height={innerHeight}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* X-axis date labels */}
          {points
            .filter((_, i) => i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1)
            .map((pt, i, arr) => {
              const originalIdx = points.indexOf(pt);
              const x = getX(originalIdx);
              const anchor = i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle';
              return (
                <text
                  key={pt.date}
                  x={x}
                  y={height - 12}
                  fill="var(--ol-text-muted, #94A3B8)"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor={anchor}
                >
                  {pt.date}
                </text>
              );
            })}
        </svg>

        {/* Hover Tooltip Card */}
        {activeHover && hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              pointerEvents: 'none',
              backgroundColor: 'var(--ol-bg-deep, #040E19)',
              border: '1px solid rgba(0, 212, 255, 0.45)',
              borderRadius: 'var(--ol-radius-lg, 10px)',
              padding: '12px 14px',
              boxShadow: 'var(--ol-shadow-lg, 0 12px 28px rgba(0,0,0,0.5))',
              fontSize: '12px',
              zIndex: 20,
              width: '230px',
              left: `${Math.min(72, Math.max(8, (hoveredIdx / points.length) * 100))}%`,
              transition: 'left 0.08s ease',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-cyan, #00D4FF)',
                fontWeight: 700,
                borderBottom: '1px solid var(--ol-border, #183A52)',
                paddingBottom: '6px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={13} style={{ color: 'var(--ol-text-muted, #94A3B8)' }} />
              <span>{activeHover.date}</span>
            </div>
            {seriesKeys.map((k, idx) => {
              const color = SERIES_COLORS[idx % SERIES_COLORS.length];
              const val = activeHover.series[k];
              const label = data?.seriesLabels[k] || k;
              return (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontFamily: 'var(--font-mono, monospace)',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {label}:
                    </span>
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {val !== undefined ? val.toLocaleString() : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
