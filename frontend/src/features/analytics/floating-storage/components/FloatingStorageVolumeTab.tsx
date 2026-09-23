import { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Fuel,
  Compass,
  Info,
} from 'lucide-react';
import type {
  RegionalStorageAggregation,
  CargoStorageAggregation,
  CrudeGradeStorageAggregation,
  HistoricalStorageSnapshot,
} from '../../../../types/floating-storage';

interface FloatingStorageVolumeTabProps {
  trendSeries: HistoricalStorageSnapshot[];
  regionalAggregations: RegionalStorageAggregation[];
  cargoAggregations: CargoStorageAggregation[];
  crudeGradeAggregations: CrudeGradeStorageAggregation[];
  vesselClassAggregations: Array<{
    vesselClass: string;
    vesselCount: number;
    totalVolumeBbl: number;
    totalVolumeMt: number;
    sharePct: number;
  }>;
}

export function FloatingStorageVolumeTab({
  trendSeries,
  regionalAggregations,
  cargoAggregations,
  crudeGradeAggregations,
  vesselClassAggregations,
}: FloatingStorageVolumeTabProps) {
  const [hoveredSnapshot, setHoveredSnapshot] = useState<HistoricalStorageSnapshot | null>(null);

  // Calculate bounds for SVG trend chart
  const maxVolume = Math.max(...trendSeries.map((s) => s.volumeBbl), 70_000_000);
  const minVolume = Math.min(...trendSeries.map((s) => s.volumeBbl), 30_000_000) * 0.9;
  const volumeRange = maxVolume - minVolume || 1;

  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = trendSeries.map((s, idx) => {
    const x = paddingX + (idx / (trendSeries.length - 1 || 1)) * innerWidth;
    const y = paddingY + innerHeight - ((s.volumeBbl - minVolume) / volumeRange) * innerHeight;
    return { x, y, snapshot: s };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Macro Volume Trend SVG Chart */}
      <div className="fs-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
          }}
        >
          <div>
            <h3 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp size={16} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Global Floating Storage Volume Trajectory (2024 – 2026)</span>
            </h3>
            <p className="fs-section-subtitle" style={{ margin: '4px 0 0 0' }}>
              Historical quarterly offshore immobilized inventory benchmarks and market cycle dynamics
            </p>
          </div>
          {hoveredSnapshot && (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: 'var(--ol-amber, #F59E0B)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {hoveredSnapshot.periodLabel}: {(hoveredSnapshot.volumeBbl / 1_000_000).toFixed(1)}M bbl ({hoveredSnapshot.vesselCount} vessels)
            </div>
          )}
        </div>

        {/* SVG Chart Container */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: '220px', userSelect: 'none' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="fsVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + innerHeight * (1 - ratio);
              const valBbl = minVolume + volumeRange * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                    strokeWidth="0.8"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {(valBbl / 1_000_000).toFixed(0)}M
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            <path d={areaD} fill="url(#fsVolumeGradient)" />

            {/* Line Stroke */}
            <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Data Points */}
            {points.map((pt, idx) => (
              <g
                key={idx}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredSnapshot(pt.snapshot)}
                onMouseLeave={() => setHoveredSnapshot(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#071524"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={chartHeight - 10}
                  fill="#94a3b8"
                  fontSize="9.5"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {pt.snapshot.periodLabel}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Market Context Banner */}
        <div className="fs-info-banner">
          <Info size={16} style={{ color: 'var(--ol-amber, #F59E0B)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>Economic Contango &amp; Arbitrage Dynamics: </strong>
            Offshore floating storage surges when prompt crude/fuel oil trade at a steep discount to future contract prices (super-contango spread exceeds vessel charter rates + demurrage + boil-off costs). Recent peaks correlate with seasonal refinery turnarounds and Red Sea routing diversions.
          </div>
        </div>
      </div>

      {/* 2. Multi-dimensional Grid Breakdowns */}
      <div className="fs-grid-2col">
        {/* A. Regional Volume Breakdown */}
        <div className="fs-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
            }}
          >
            <h4 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '13px' }}>
              <Compass size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Volume by Offshore Hub Region</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
              {regionalAggregations.length} hubs
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {regionalAggregations.map((reg) => (
              <div key={reg.region} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{reg.region}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
                    <span style={{ color: 'var(--ol-cyan, #22D3EE)', fontWeight: 700 }}>
                      {(reg.totalVolumeBbl / 1_000_000).toFixed(1)}M bbl
                    </span>
                    <span style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '11px' }}>({reg.sharePct}%)</span>
                  </div>
                </div>
                <div className="fs-progress-track">
                  <div
                    className="fs-progress-fill"
                    style={{ width: `${reg.sharePct}%`, backgroundColor: 'var(--ol-amber, #F59E0B)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  <span>{reg.vesselCount} vessels • Avg {reg.avgStationaryDays.toFixed(0)}d stationary</span>
                  <span>Dominant: <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{reg.topCrudeGrade}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B. Cargo Type Distribution */}
        <div className="fs-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
            }}
          >
            <h4 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '13px' }}>
              <Layers size={14} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>Volume by Cargo Commodity</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
              {cargoAggregations.length} types
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {cargoAggregations.map((cargo) => (
              <div key={cargo.cargoType} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>{cargo.cargoType}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
                    <span style={{ color: 'var(--ol-cyan, #22D3EE)', fontWeight: 700 }}>
                      {(cargo.totalVolumeBbl / 1_000_000).toFixed(1)}M bbl
                    </span>
                    <span style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '11px' }}>({cargo.sharePct}%)</span>
                  </div>
                </div>
                <div className="fs-progress-track">
                  <div
                    className="fs-progress-fill"
                    style={{ width: `${cargo.sharePct}%`, backgroundColor: 'var(--ol-cyan, #22D3EE)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  <span>{cargo.vesselCount} vessels • ${(cargo.totalValueUsd / 1_000_000).toFixed(0)}M USD</span>
                  <span>Avg {cargo.avgStationaryDays.toFixed(0)}d duration</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Crude Benchmark Grade Distribution */}
        <div className="fs-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
            }}
          >
            <h4 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '13px' }}>
              <Fuel size={14} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              <span>Crude Benchmark Grades Immobilized</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
              {crudeGradeAggregations.length} grades
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginTop: '6px' }}>
            {crudeGradeAggregations.map((grade) => (
              <div key={grade.crudeGrade} className="fs-subcard" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '12px' }}>
                      {grade.crudeGrade}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                      {grade.vesselCount} tankers • Origin: {grade.primaryOriginRegion.split('&')[0]}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ol-amber, #F59E0B)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {(grade.totalVolumeBbl / 1_000_000).toFixed(2)}M bbl
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-emerald, #10B981)', fontWeight: 600, marginTop: '2px' }}>
                      ${(grade.totalValueUsd / 1_000_000).toFixed(0)}M USD
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* D. Vessel Class Breakdown */}
        <div className="fs-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(100, 190, 240, 0.1)',
            }}
          >
            <h4 className="fs-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '13px' }}>
              <BarChart3 size={14} style={{ color: '#C084FC' }} />
              <span>Storage Capacity by Vessel Class</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)' }}>
              {vesselClassAggregations.length} classes
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {vesselClassAggregations.map((cls) => (
              <div key={cls.vesselClass} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>{cls.vesselClass}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono, monospace)' }}>
                    <span style={{ color: '#C084FC', fontWeight: 700 }}>
                      {(cls.totalVolumeBbl / 1_000_000).toFixed(1)}M bbl
                    </span>
                    <span style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '11px' }}>({cls.sharePct}%)</span>
                  </div>
                </div>
                <div className="fs-progress-track">
                  <div
                    className="fs-progress-fill"
                    style={{ width: `${cls.sharePct}%`, backgroundColor: '#C084FC' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  <span>{cls.vesselCount} vessels</span>
                  <span>{(cls.totalVolumeMt / 1_000).toFixed(0)}k MT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

