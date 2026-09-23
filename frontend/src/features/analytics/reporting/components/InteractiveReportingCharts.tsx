import React, { useState } from 'react';
import {
  LineChart,
  BarChart3,
  PieChart,
  MousePointerClick,
  Sparkles,
  Info,
} from 'lucide-react';
import type {
  MonthlyTimeSeriesPoint,
  CorridorBarPoint,
  SegmentSharePoint,
  DrillDownContext,
  ReportMetricFocus,
} from '../../../../types/reporting';

interface InteractiveReportingChartsProps {
  timeSeries: MonthlyTimeSeriesPoint[];
  corridors: CorridorBarPoint[];
  segmentShare: SegmentSharePoint[];
  metricFocus: ReportMetricFocus;
  onDrillDown: (context: DrillDownContext) => void;
}

/* ── Shared style tokens ── */
const S = {
  card: {
    backgroundColor: 'var(--ol-surface-primary)',
    border: '1px solid var(--ol-border)',
    borderRadius: 'var(--ol-radius-lg)',
    padding: '20px 24px',
    boxShadow: 'var(--ol-shadow-sm)',
    boxSizing: 'border-box' as const,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 650,
    color: 'var(--ol-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'var(--ol-text-muted)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '16px',
  },
  badge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--ol-surface-elevated)',
    color: 'var(--ol-text-secondary)',
    border: '1px solid var(--ol-border)',
    whiteSpace: 'nowrap' as const,
  },
};

export const InteractiveReportingCharts: React.FC<InteractiveReportingChartsProps> = ({
  timeSeries,
  corridors,
  segmentShare,
  metricFocus,
  onDrillDown,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyTimeSeriesPoint | null>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [hoveredCorridor, setHoveredCorridor] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  /* ── SVG dimensions for Time Series ── */
  const svgWidth = 900;
  const svgHeight = 240;
  const padding = { top: 28, right: 30, bottom: 42, left: 68 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const metricConfig: Record<ReportMetricFocus, { label: string; unit: string; format: (v: number) => string }> = {
    tce_rate: {
      label: 'Spot TCE Rate ($/day)',
      unit: '$/day',
      format: (v) => `$${Math.round(v).toLocaleString()}/day`,
    },
    cargo_volume: {
      label: 'Cargo Volume Lifted (k MT)',
      unit: 'k MT',
      format: (v) => `${v.toLocaleString()}k MT`,
    },
    ton_miles: {
      label: 'Ton-Mile Demand (Billion TM)',
      unit: 'B TM',
      format: (v) => `${v.toFixed(1)}B TM`,
    },
    co2_emissions: {
      label: 'Fleet CO2 Emissions (hundred MT)',
      unit: 'hMT',
      format: (v) => `${(v * 100).toLocaleString()} MT`,
    },
  };

  const currentCfg = metricConfig[metricFocus];

  const values = timeSeries.map((p) => p.value);
  const minVal = values.length ? Math.min(...values) * 0.85 : 0;
  const maxVal = values.length ? Math.max(...values) * 1.15 : 100000;
  const valRange = maxVal - minVal || 1;

  const getX = (idx: number) => padding.left + (idx / Math.max(timeSeries.length - 1, 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / valRange) * chartHeight;

  const pointsCoords = timeSeries.map((p, idx) => ({ x: getX(idx), y: getY(p.value), p }));
  const linePathD = pointsCoords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');
  const areaPathD = pointsCoords.length
    ? `${linePathD} L ${pointsCoords[pointsCoords.length - 1].x} ${padding.top + chartHeight} L ${pointsCoords[0].x} ${padding.top + chartHeight} Z`
    : '';

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minVal + ratio * valRange;
    return { val, y: padding.top + chartHeight - ratio * chartHeight };
  });

  const maxCorridorVal = Math.max(...corridors.map((c) => c.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>

      {/* ── Instruction Banner ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(0, 217, 255, 0.04)',
        border: '1px solid rgba(0, 217, 255, 0.18)',
        borderRadius: 'var(--ol-radius-lg)',
        padding: '12px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: 'var(--ol-radius-sm)',
            backgroundColor: 'var(--ol-cyan-subtle)',
            color: 'var(--ol-cyan)',
            border: '1px solid rgba(0,217,255,0.2)',
            flexShrink: 0,
          }}>
            <MousePointerClick size={15} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              Interactive Data Point Drill-Down Enabled
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--ol-cyan-subtle)',
                color: 'var(--ol-cyan)',
                border: '1px solid rgba(0,217,255,0.2)',
              }}>Step 4 of 8</span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--ol-text-muted)' }}>
              Click any monthly node on the trend curve or any corridor bar below to open the underlying empirical fixture ledger.
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--ol-text-muted)',
          backgroundColor: 'var(--ol-surface-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--ol-radius-sm)',
          border: '1px solid var(--ol-border)',
          flexShrink: 0,
        }}>
          <Info size={13} style={{ color: 'var(--ol-cyan)', flexShrink: 0 }} />
          <span>Clicking isolates date &amp; corridor slices</span>
        </div>
      </div>

      {/* ── Chart 1: Monthly Time-Series ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div>
            <h3 style={S.sectionTitle}>
              <LineChart size={16} style={{ color: 'var(--ol-cyan)' }} />
              Monthly Market Trend &amp; Trajectory Curve
            </h3>
            <p style={S.sectionSubtitle}>{currentCfg.label} — interactive time series with clickable observation nodes</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--ol-cyan)', display: 'inline-block' }} />
              <span style={{ color: 'var(--ol-text-secondary)' }}>Audited Monthly Metric</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '2px', backgroundColor: 'var(--ol-border)', display: 'inline-block', borderBottom: '1px dashed var(--ol-text-muted)' }} />
              <span style={{ color: 'var(--ol-text-muted)' }}>Market Baseline</span>
            </div>
          </div>
        </div>

        {/* SVG Container with horizontal scroll only if needed */}
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', minWidth: '520px', height: '220px', display: 'block', userSelect: 'none' }}
          >
            <defs>
              <linearGradient id="m25-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ol-cyan)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--ol-cyan)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines & labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left} y1={tick.y}
                  x2={svgWidth - padding.right} y2={tick.y}
                  stroke="rgba(100,190,240,0.1)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill="var(--ol-text-muted)"
                  fontSize="10"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {metricFocus === 'tce_rate'
                    ? `$${Math.round(tick.val / 1000)}k`
                    : tick.val >= 1000
                    ? `${Math.round(tick.val / 1000)}k`
                    : tick.val.toFixed(0)}
                </text>
              </g>
            ))}

            {/* Y-axis base line */}
            <line
              x1={padding.left} y1={padding.top}
              x2={padding.left} y2={padding.top + chartHeight}
              stroke="var(--ol-border)"
            />

            {/* Area fill */}
            {areaPathD && <path d={areaPathD} fill="url(#m25-area-gradient)" />}

            {/* Main Trend Line */}
            {linePathD && (
              <path
                d={linePathD}
                fill="none"
                stroke="var(--ol-cyan)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active Vertical Crosshair */}
            {hoveredPointIdx !== null && (
              <line
                x1={pointsCoords[hoveredPointIdx]?.x || 0}
                y1={padding.top}
                x2={pointsCoords[hoveredPointIdx]?.x || 0}
                y2={padding.top + chartHeight}
                stroke="rgba(0,217,255,0.5)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {/* Interactive Observation Nodes */}
            {pointsCoords.map((pt, idx) => {
              const isHovered = hoveredPointIdx === idx;
              return (
                <g
                  key={idx}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => { setHoveredPoint(pt.p); setHoveredPointIdx(idx); }}
                  onMouseLeave={() => { setHoveredPoint(null); setHoveredPointIdx(null); }}
                  onClick={() => {
                    onDrillDown({
                      datePeriod: pt.p.period,
                      metricValue: pt.p.value,
                      recordCount: pt.p.fixtureCount,
                      label: `${pt.p.label} — ${pt.p.topSegment} (${pt.p.fixtureCount} Fixtures)`,
                      segment: pt.p.topSegment as any,
                    });
                  }}
                >
                  {/* Enlarged invisible hit target */}
                  <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                  {/* Pulsing outer ring on hover */}
                  {isHovered && (
                    <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(0,217,255,0.18)" />
                  )}

                  {/* Visible node */}
                  <circle
                    cx={pt.x} cy={pt.y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? 'var(--ol-cyan)' : 'var(--ol-surface-primary)'}
                    stroke="var(--ol-cyan)"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />

                  {/* X-axis tick labels (every Nth point) */}
                  {(idx % Math.ceil(timeSeries.length / 10) === 0 || idx === timeSeries.length - 1) && (
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill="var(--ol-text-muted)"
                      fontSize="10"
                      fontFamily="var(--font-mono, monospace)"
                    >
                      {pt.p.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip — positioned absolutely inside the scroll wrapper */}
          {hoveredPoint && hoveredPointIdx !== null && (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 30,
                backgroundColor: 'var(--ol-bg-deep)',
                border: '1px solid rgba(0,217,255,0.35)',
                borderRadius: 'var(--ol-radius-lg)',
                padding: '12px 14px',
                boxShadow: 'var(--ol-shadow-lg)',
                fontSize: '12px',
                width: '240px',
                top: '8px',
                left: `${Math.min(Math.max(2, (pointsCoords[hoveredPointIdx]?.x / svgWidth) * 100 - 15), 60)}%`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ol-border)', paddingBottom: '8px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--ol-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} style={{ color: 'var(--ol-cyan)' }} />
                  {hoveredPoint.label}
                </span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--ol-surface-elevated)', color: 'var(--ol-text-secondary)' }}>
                  {hoveredPoint.period}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Metric Value', value: currentCfg.format(hoveredPoint.value), color: 'var(--ol-cyan)' },
                  { label: 'Audited Fixtures', value: `${hoveredPoint.fixtureCount} transactions`, color: 'var(--ol-text-primary)' },
                  { label: 'Trading Vessels', value: `${hoveredPoint.vesselCount} ships`, color: 'var(--ol-text-primary)' },
                  { label: 'Top Benchmark', value: hoveredPoint.topRoute, color: 'var(--ol-text-secondary)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--ol-text-muted)' }}>{label}:</span>
                    <span style={{ fontWeight: 600, color }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--ol-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--ol-cyan)' }}>
                <MousePointerClick size={11} />
                Click node to drill down
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid: Chart 2 (Corridors) + Chart 3 (Donut) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '20px',
      }}
        className="m25-charts-grid"
      >
        {/* Chart 2: Corridor Breakdown */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div style={S.cardHeader}>
            <div>
              <h3 style={S.sectionTitle}>
                <BarChart3 size={16} style={{ color: 'var(--ol-green)' }} />
                Benchmark Shipping Corridor Performance
              </h3>
              <p style={S.sectionSubtitle}>Click any corridor bar to isolate that commercial route</p>
            </div>
            <span style={S.badge}>Top {corridors.length} Corridors</span>
          </div>

          {/* Corridor Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {corridors.map((c) => {
              const pct = Math.round((c.value / maxCorridorVal) * 100);
              const isHov = hoveredCorridor === c.routeCode;
              return (
                <div
                  key={c.routeCode}
                  id={`bar-corridor-${c.routeCode}`}
                  onClick={() => {
                    onDrillDown({
                      datePeriod: '',
                      routeCode: c.routeCode,
                      routeName: c.routeName,
                      recordCount: c.fixtureCount,
                      label: `Route ${c.routeCode}: ${c.routeName} (${c.fixtureCount} Fixtures)`,
                    });
                  }}
                  onMouseEnter={() => setHoveredCorridor(c.routeCode)}
                  onMouseLeave={() => setHoveredCorridor(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--ol-radius-md)',
                    cursor: 'pointer',
                    border: `1px solid ${isHov ? 'rgba(32,201,138,0.4)' : 'var(--ol-border)'}`,
                    backgroundColor: isHov ? 'var(--ol-surface-elevated)' : 'var(--ol-surface-secondary)',
                    transition: 'all 0.15s ease',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 auto' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: isHov ? 'var(--ol-green)' : 'var(--ol-text-primary)', flexShrink: 0 }}>
                        {c.routeCode}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--ol-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                        title={c.routeName}>
                        {c.routeName}
                      </span>
                      <span style={{ ...S.badge, flexShrink: 0 }}>{c.basin}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {metricFocus === 'tce_rate' ? `$${c.value.toLocaleString()}/day` : `${c.value.toLocaleString()} ${c.unit}`}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--ol-text-muted)' }}>({c.fixtureCount} fix)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--ol-surface-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        width: `${Math.max(pct, 4)}%`,
                        background: isHov
                          ? 'linear-gradient(90deg, var(--ol-green), var(--ol-cyan))'
                          : 'linear-gradient(90deg, #20C98A, #06b6d4)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--ol-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ol-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MousePointerClick size={12} style={{ color: 'var(--ol-green)' }} />
              Clicking a bar filters drill-down to that corridor
            </span>
            <span>Auto-sorted by performance</span>
          </div>
        </div>

        {/* Chart 3: Segment Donut */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div>
            <h3 style={S.sectionTitle}>
              <PieChart size={16} style={{ color: '#818cf8' }} />
              Cargo Segment Distribution
            </h3>
            <p style={S.sectionSubtitle}>Proportional payload volume share</p>
          </div>

          {/* Donut SVG */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', margin: '8px 0' }}>
            <svg width="160" height="160" viewBox="0 0 170 170" style={{ userSelect: 'none', display: 'block' }}>
              <circle cx="85" cy="85" r="58" fill="transparent" stroke="var(--ol-surface-elevated)" strokeWidth="24" />
              {(() => {
                let accumulatedAngle = 0;
                return segmentShare.map((seg) => {
                  const circumference = 2 * Math.PI * 58;
                  const strokeDash = (seg.sharePct / 100) * circumference;
                  const strokeGap = circumference - strokeDash;
                  const rotation = (accumulatedAngle / 100) * 360 - 90;
                  accumulatedAngle += seg.sharePct;
                  const isHov = hoveredSegment === seg.segment;
                  return (
                    <circle
                      key={seg.segment}
                      cx="85" cy="85" r="58"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHov ? 28 : 22}
                      strokeDasharray={`${strokeDash} ${strokeGap}`}
                      transform={`rotate(${rotation} 85 85)`}
                      style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease' }}
                      onMouseEnter={() => setHoveredSegment(seg.segment)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => onDrillDown({
                        datePeriod: '',
                        segment: seg.segment,
                        recordCount: seg.count,
                        label: `${seg.segment} Sector (${seg.sharePct}% Share)`,
                      })}
                    />
                  );
                });
              })()}
            </svg>
            {/* Center label */}
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ol-text-primary)', lineHeight: 1.2 }}>100%</div>
              <div style={{ fontSize: '10px', color: 'var(--ol-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {segmentShare.map((seg) => {
              const isHov = hoveredSegment === seg.segment;
              return (
                <div
                  key={seg.segment}
                  onClick={() => onDrillDown({
                    datePeriod: '',
                    segment: seg.segment,
                    recordCount: seg.count,
                    label: `${seg.segment} Sector (${seg.sharePct}% Share)`,
                  })}
                  onMouseEnter={() => setHoveredSegment(seg.segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 'var(--ol-radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: isHov ? 'var(--ol-surface-elevated)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    fontSize: '12px',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: 'var(--ol-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{seg.segment}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ol-text-primary)' }}>{seg.sharePct}%</span>
                    <span style={{ fontSize: '10px', color: 'var(--ol-text-muted)' }}>({seg.count} fix)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--ol-border)', fontSize: '11px', color: 'var(--ol-text-muted)', textAlign: 'center' }}>
            Click slice to isolate segment transactions
          </div>
        </div>
      </div>
    </div>
  );
};
