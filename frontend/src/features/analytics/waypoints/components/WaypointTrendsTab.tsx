/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Pure SVG Historical Trends & Transit Analysis Tab
 */

import { useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type {
  MaritimeWaypointRecord,
  WaypointHistoricalObservation,
  WaypointTimeHorizon,
} from '../../../../types/waypoints';

interface WaypointTrendsTabProps {
  selectedWaypoint: MaritimeWaypointRecord | null;
  history: WaypointHistoricalObservation[];
  timeHorizon: WaypointTimeHorizon;
  onTimeHorizonChange: (th: WaypointTimeHorizon) => void;
}

export function WaypointTrendsTab({
  selectedWaypoint,
  history,
  timeHorizon,
  onTimeHorizonChange,
}: WaypointTrendsTabProps) {
  const [activeMetric, setActiveMetric] = useState<'transits' | 'waiting' | 'congestion'>('transits');

  if (!selectedWaypoint || history.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '2.5rem',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#64748b' }} />
        <div>Please select a chokepoint from the map or registry to view historical trends.</div>
      </div>
    );
  }

  // Determine values for active metric
  const values = history.map((obs) => {
    if (activeMetric === 'transits') return obs.transitsCount;
    if (activeMetric === 'waiting') return obs.waitingCount;
    return obs.congestionIndex;
  });

  const maxValue = Math.max(...values, 10);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Build SVG path points
  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1 || 1)) * plotWidth;
    const y = svgHeight - paddingY - ((val - minValue) / range) * plotHeight;
    return { x, y, val, date: history[idx].timestamp };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

  const metricColors = {
    transits: '#38bdf8',
    waiting: '#f59e0b',
    congestion: '#c084fc',
  };

  const currentColor = metricColors[activeMetric];

  return (
    <div
      style={{
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color={currentColor} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Historical Telemetry & Transit Trends: {selectedWaypoint.name}
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
            Time-series telemetry tracking transit flows, anchorage queues, and bottleneck congestion.
          </p>
        </div>

        {/* Metric Selector Tabs & Time Window */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '2px', borderRadius: '8px', border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setActiveMetric('transits')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeMetric === 'transits' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeMetric === 'transits' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              24h Transits
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('waiting')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeMetric === 'waiting' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeMetric === 'waiting' ? '#f59e0b' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Waiting Queue
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('congestion')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeMetric === 'congestion' ? 'rgba(192, 132, 252, 0.2)' : 'transparent',
                color: activeMetric === 'congestion' ? '#c084fc' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Congestion Score
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['7d', '30d', '90d', '1y'] as WaypointTimeHorizon[]).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => onTimeHorizonChange(th)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: timeHorizon === th ? 700 : 500,
                  background: timeHorizon === th ? '#334155' : 'transparent',
                  color: timeHorizon === th ? '#f8fafc' : '#64748b',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {th.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(10, 15, 29, 0.6)', borderRadius: '8px', padding: '0.5rem 0' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = svgHeight - paddingY - pct * plotHeight;
            const val = Math.round(minValue + pct * range);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4,4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={currentColor} opacity="0.1" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={currentColor} strokeWidth="2.5" />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill={currentColor}
                stroke="#0f172a"
                strokeWidth="2"
              />
              {/* Show date label on x-axis periodically */}
              {(idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {pt.date}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Event Annotation Strip */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#cbd5e1',
        }}
      >
        <div>
          <strong style={{ color: '#38bdf8' }}>Strategic Observation: </strong>
          {selectedWaypoint.id === 'wp-suez' && 'Red Sea security diversions maintain Suez transits at ~40% below 2023 pre-crisis highs.'}
          {selectedWaypoint.id === 'wp-cape-good-hope' && 'Cape of Good Hope detour traffic up +85% year-over-year absorbing Asia-Europe container and bulk capacity.'}
          {selectedWaypoint.id === 'wp-panama' && 'Panama daily transit capacity operating at 34-36 daily booking slots with strict draft limits.'}
          {selectedWaypoint.id === 'wp-hormuz' && 'Strait of Hormuz petroleum transits steady at ~84 vessels/day carrying 21M b/d crude and Qatari LNG.'}
          {!['wp-suez', 'wp-cape-good-hope', 'wp-panama', 'wp-hormuz'].includes(selectedWaypoint.id) &&
            `${selectedWaypoint.name} exhibits consistent seasonal commercial movements with nominal turnaround times.`}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
          AIS Granularity: Daily Average
        </div>
      </div>
    </div>
  );
}
