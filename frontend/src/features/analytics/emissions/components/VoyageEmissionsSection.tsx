/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Voyage-Level Emissions & Cumulative Trajectory Visualization
 */

import { useState } from 'react';
import type {
  EmissionsVoyageRecord,
} from '../../../../types/emissions';

interface VoyageEmissionsSectionProps {
  voyages: EmissionsVoyageRecord[];
  selectedVoyageId: string | null;
  onSelectVoyage: (id: string) => void;
}

export function VoyageEmissionsSection({
  voyages,
  selectedVoyageId,
  onSelectVoyage,
}: VoyageEmissionsSectionProps) {
  const [activeVoyageId, setActiveVoyageId] = useState<string>(
    selectedVoyageId || (voyages[0]?.voyageId ?? '')
  );

  const currentVoyage = voyages.find((vy) => vy.voyageId === activeVoyageId) || voyages[0];

  const handleSelect = (id: string) => {
    setActiveVoyageId(id);
    onSelectVoyage(id);
  };

  if (!currentVoyage) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No voyage records available.
      </div>
    );
  }

  // Pure SVG accumulation line setup
  const timeline = currentVoyage.accumulationTimeline || [];
  const svgWidth = 640;
  const svgHeight = 180;
  const margin = { top: 20, right: 30, bottom: 30, left: 50 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const maxCo2 = Math.max(...timeline.map((t) => t.cumulativeCo2Mt), currentVoyage.co2Mt, 1);
  const maxDist = Math.max(...timeline.map((t) => t.distanceCoveredNm), currentVoyage.distanceNm, 1);

  const getX = (dist: number) => margin.left + (dist / maxDist) * innerWidth;
  const getY = (co2: number) => margin.top + innerHeight - (co2 / maxCo2) * innerHeight;

  const pointsPath = timeline.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.distanceCoveredNm).toFixed(1)} ${getY(pt.cumulativeCo2Mt).toFixed(1)}`).join(' ');
  const areaPath = timeline.length > 0
    ? `${pointsPath} L ${getX(timeline[timeline.length - 1].distanceCoveredNm)} ${margin.top + innerHeight} L ${getX(0)} ${margin.top + innerHeight} Z`
    : '';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            VOYAGE EMISSIONS & ACCUMULATION TRAJECTORY
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Voyage-level carbon intensity, checkpoint accumulations, and EU ETS compliance scope
          </p>
        </div>

        {/* Voyage Selector Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {voyages.map((vy) => (
            <button
              key={vy.voyageId}
              type="button"
              onClick={() => handleSelect(vy.voyageId)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: activeVoyageId === vy.voyageId ? '1px solid #0066cc' : '1px solid #1e293b',
                background: activeVoyageId === vy.voyageId ? 'rgba(0, 102, 204, 0.2)' : '#0f172a',
                color: activeVoyageId === vy.voyageId ? '#38bdf8' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {vy.voyageId} ({vy.vesselName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Voyage Card + Cumulative Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Voyage Identity & Metrics Card */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                {currentVoyage.voyageId}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 600,
                }}
              >
                {currentVoyage.status}
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {currentVoyage.originPort} &rarr; {currentVoyage.destinationPort}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Vessel: <strong style={{ color: '#f8fafc' }}>{currentVoyage.vesselName}</strong> ({currentVoyage.imoNumber})
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>TOTAL CO₂</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                  {currentVoyage.co2Mt} mt
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>FUEL CONSUMED</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono, monospace)' }}>
                  {currentVoyage.fuelConsumedMt} mt
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>VOYAGE EEOI</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
                  {currentVoyage.eeoi}
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>DISTANCE</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {currentVoyage.distanceNm.toLocaleString()} nm
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>DURATION</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {currentVoyage.durationDays} days
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b' }}>AVG SPEED</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {currentVoyage.avgSpeedKnots} kts
                </div>
              </div>
            </div>
          </div>

          {/* EU ETS Footer Tag */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#94a3b8' }}>EU ETS Carbon Liability:</span>
            {currentVoyage.euEtsApplicable ? (
              <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }}>
                €{currentVoyage.euEtsEstimatedEur.toLocaleString()} (Taxable)
              </strong>
            ) : (
              <span style={{ color: '#64748b' }}>Non-EU Transit Route</span>
            )}
          </div>
        </div>

        {/* Voyage Accumulation Timeline Chart */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
              Emissions Accumulation Curve Along Voyage Track
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>
              ● Cumulative CO₂ (mt) vs Distance (nm)
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '420px', display: 'block' }}>
              <defs>
                <linearGradient id="voyageAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = margin.top + innerHeight * p;
                const val = Math.round(maxCo2 * (1 - p));
                return (
                  <g key={p}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + innerWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text x={margin.left - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">
                      {val} mt
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              {areaPath && <path d={areaPath} fill="url(#voyageAreaGradient)" />}
              {pointsPath && (
                <path d={pointsPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Checkpoint Markers */}
              {timeline.map((pt) => {
                const cx = getX(pt.distanceCoveredNm);
                const cy = getY(pt.cumulativeCo2Mt);
                return (
                  <g key={pt.checkpointName}>
                    <circle cx={cx} cy={cy} r="4" fill="#0d1829" stroke="#10b981" strokeWidth="2" />
                    <text
                      x={cx}
                      y={margin.top + innerHeight + 14}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {pt.distanceCoveredNm} nm
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Checkpoint list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '0.75rem', fontSize: '0.6875rem' }}>
            {timeline.map((pt, i) => (
              <span key={pt.checkpointName} style={{ color: '#94a3b8', background: '#0d1829', padding: '2px 6px', borderRadius: '4px' }}>
                <strong style={{ color: '#f8fafc' }}>{i + 1}. {pt.checkpointName}</strong> ({pt.cumulativeCo2Mt} mt CO₂)
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
