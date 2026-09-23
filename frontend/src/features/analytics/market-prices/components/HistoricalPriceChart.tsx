/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Historical Price Time-Series
 * Canonical Enterprise Design System Refactor
 */

import React, { useState, useMemo } from 'react';
import { History, TrendingUp, Calendar } from 'lucide-react';
import type {
  HistoricalPricePoint,
  PriceTimeHorizon,
  PriceChartMetric,
  PriceAggregation,
} from '../../../../types/market-prices';

interface HistoricalPriceChartProps {
  historicalPoints: HistoricalPricePoint[];
  routeCode: string;
  vesselClass: string;
  timeHorizon: PriceTimeHorizon;
  onTimeHorizonChange: (th: PriceTimeHorizon) => void;
  chartMetric: PriceChartMetric;
  onChartMetricChange: (m: PriceChartMetric) => void;
  aggregation: PriceAggregation;
  onAggregationChange: (agg: PriceAggregation) => void;
  showSpotLine: boolean;
  showFfaLine: boolean;
  showSpreadBand: boolean;
}

export const HistoricalPriceChart: React.FC<HistoricalPriceChartProps> = ({
  historicalPoints,
  routeCode,
  vesselClass,
  timeHorizon,
  onTimeHorizonChange,
  chartMetric,
  onChartMetricChange,
  aggregation,
  onAggregationChange,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Slice points by horizon
  const filteredPoints = useMemo(() => {
    if (!historicalPoints || historicalPoints.length === 0) return [];
    let count = historicalPoints.length;
    switch (timeHorizon) {
      case '1D':
      case '5D':
      case '1M':
        count = Math.min(4, count);
        break;
      case '3M':
        count = Math.min(8, count);
        break;
      case '6M':
        count = Math.min(12, count);
        break;
      case '1Y':
        count = Math.min(18, count);
        break;
      case '3Y':
        count = Math.min(36, count);
        break;
      case 'MAX':
      default:
        count = historicalPoints.length;
        break;
    }
    return historicalPoints.slice(-count);
  }, [historicalPoints, timeHorizon]);

  // Chart dimensions with balanced aspect ratio
  const width = 860;
  const height = 280;
  const margin = { top: 20, right: 35, bottom: 42, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Min and Max values for scale
  const { minVal, valSpan } = useMemo(() => {
    if (filteredPoints.length === 0) return { minVal: 0, valSpan: 100 };
    const vals: number[] = [];
    filteredPoints.forEach((p) => {
      vals.push(p.spotRateUsdPerDay, p.ffaFrontMonthUsdPerDay);
      if (chartMetric === 'spread') vals.push(p.spreadUsdPerDay);
    });
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.1 || 1000;
    return {
      minVal: Math.max(0, min - pad),
      valSpan: max - min + pad * 2 || 1,
    };
  }, [filteredPoints, chartMetric]);

  // Point projection helpers
  const getX = (idx: number) =>
    margin.left + (idx / (filteredPoints.length - 1 || 1)) * innerWidth;
  const getY = (val: number) =>
    margin.top + innerHeight - ((val - minVal) / valSpan) * innerHeight;

  // Build SVG Paths
  const spotPath = useMemo(() => {
    if (filteredPoints.length === 0) return '';
    return filteredPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.spotRateUsdPerDay)}`)
      .join(' ');
  }, [filteredPoints, minVal, valSpan]);

  const ffaPath = useMemo(() => {
    if (filteredPoints.length === 0) return '';
    return filteredPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.ffaFrontMonthUsdPerDay)}`)
      .join(' ');
  }, [filteredPoints, minVal, valSpan]);

  const timeHorizons: PriceTimeHorizon[] = ['1M', '3M', '6M', '1Y', '3Y', 'MAX'];
  const activeHoverPoint = hoveredPointIndex !== null ? filteredPoints[hoveredPointIndex] : null;

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Header Controls */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-cyan">
            <History size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="mp-card-title">
                Historical Price Time-Series
              </h3>
              <span className="mp-corridor-code-badge" style={{ fontSize: '11px', padding: '2px 7px' }}>
                {routeCode} • {vesselClass}
              </span>
            </div>
            <p className="mp-card-subtitle">
              Physical spot freight earnings benchmarked against front-month FFA derivative settlements
            </p>
          </div>
        </div>

        {/* Range & Metric Toggles: Premium Segmented Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Metric Switcher */}
          <div className="mp-segmented-group">
            {(
              [
                { id: 'spot', label: 'Spot Only' },
                { id: 'ffa_prompt', label: 'FFA Front' },
                { id: 'spread', label: 'Spot vs FFA' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChartMetricChange(m.id)}
                className={`mp-segmented-btn ${chartMetric === m.id ? 'active' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Time Horizon Toggles */}
          <div className="mp-segmented-group" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
            {timeHorizons.map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => onTimeHorizonChange(th)}
                className={`mp-segmented-btn ${timeHorizon === th ? 'active' : ''}`}
              >
                {th}
              </button>
            ))}
          </div>

          {/* Aggregation Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', fontWeight: 600 }}>
              Agg:
            </span>
            <select
              value={aggregation}
              onChange={(e) => onAggregationChange(e.target.value as PriceAggregation)}
              className="mp-select"
            >
              <option value="daily">Daily Spot</option>
              <option value="weekly">Weekly Avg</option>
              <option value="monthly">Monthly Avg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend & Real-Time Hover Inspection Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '11.5px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#10B981', borderRadius: '2px' }} />
            <span style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontWeight: 600 }}>Physical Spot TCE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#A855F7', borderRadius: '2px' }} />
            <span style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontWeight: 600 }}>Front-Month FFA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(34, 211, 238, 0.4)', border: '1px solid var(--ol-cyan, #22D3EE)' }} />
            <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>Settlement Nodes</span>
          </div>
        </div>

        {activeHoverPoint ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono, monospace)', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.16)', padding: '4px 12px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>{activeHoverPoint.date}:</span>
            <span style={{ color: '#10B981', fontWeight: 700 }}>
              Spot: ${Math.round(activeHoverPoint.spotRateUsdPerDay).toLocaleString()}
            </span>
            <span style={{ color: '#C084FC', fontWeight: 700 }}>
              FFA: ${Math.round(activeHoverPoint.ffaFrontMonthUsdPerDay).toLocaleString()}
            </span>
            <span style={{ color: activeHoverPoint.spreadUsdPerDay >= 0 ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
              Spread: {activeHoverPoint.spreadUsdPerDay >= 0 ? '+' : ''}${Math.round(activeHoverPoint.spreadUsdPerDay).toLocaleString()}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
            Hover data points to inspect historical settlement metrics
          </span>
        )}
      </div>

      {/* High-Contrast SVG Time-Series Chart */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#061423', borderRadius: '8px', border: '1px solid rgba(100, 190, 240, 0.1)', padding: '6px 0' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
          onMouseLeave={() => setHoveredPointIndex(null)}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = margin.top + innerHeight * (1 - pct);
            const val = minVal + valSpan * pct;
            return (
              <g key={pct}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="rgba(100, 190, 240, 0.1)"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Physical Spot TCE Path */}
          {(chartMetric === 'spot' || chartMetric === 'spread') && (
            <path
              d={spotPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Front FFA Path */}
          {(chartMetric === 'ffa_prompt' || chartMetric === 'spread') && (
            <path
              d={ffaPath}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={chartMetric === 'spread' ? '4 3' : undefined}
            />
          )}

          {/* Interactive Hover Circles and X-Axis Labels */}
          {filteredPoints.map((pt, idx) => {
            const cx = getX(idx);
            const cySpot = getY(pt.spotRateUsdPerDay);
            const cyFfa = getY(pt.ffaFrontMonthUsdPerDay);
            const isHovered = hoveredPointIndex === idx;

            return (
              <g
                key={pt.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
              >
                {/* Vertical Cursor Indicator Line on Hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={margin.top}
                    x2={cx}
                    y2={margin.top + innerHeight}
                    stroke="rgba(34, 211, 238, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={margin.top + innerHeight + 18}
                  textAnchor="middle"
                  fill={isHovered ? '#22D3EE' : '#94A3B8'}
                  fontSize="10.5"
                  fontFamily="monospace"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {pt.date.slice(5)}
                </text>

                {/* Spot Circle */}
                {(chartMetric === 'spot' || chartMetric === 'spread') && (
                  <circle
                    cx={cx}
                    cy={cySpot}
                    r={isHovered ? 6 : 4}
                    fill="#10B981"
                    stroke="#091A2A"
                    strokeWidth="2"
                  />
                )}

                {/* FFA Circle */}
                {(chartMetric === 'ffa_prompt' || chartMetric === 'spread') && (
                  <circle
                    cx={cx}
                    cy={cyFfa}
                    r={isHovered ? 6 : 3.5}
                    fill="#A855F7"
                    stroke="#091A2A"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
