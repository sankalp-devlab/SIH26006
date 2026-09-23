/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Vessel Age & Non-Linear Depreciation Curve Visualization
 */

import { useState, useMemo } from 'react';
import type {
  VesselValuationRecord,
  ComparableVesselSummary,
  ValuationCurrency,
} from '../../../../types/valuations';
import { formatValuation } from '../../../../services/valuations/valuations-analytics-engine';

interface VesselAgeCurveSectionProps {
  selectedVessel: VesselValuationRecord;
  comparableVessels: ComparableVesselSummary[];
  depreciationCurve: { age: number; theoreticalValueUsdM: number }[];
  currency: ValuationCurrency;
  rates: Record<ValuationCurrency, number>;
  onSelectVessel: (id: number) => void;
}

export function VesselAgeCurveSection({
  selectedVessel,
  comparableVessels,
  depreciationCurve,
  currency,
  rates,
  onSelectVessel,
}: VesselAgeCurveSectionProps) {
  const [hoveredVesselId, setHoveredVesselId] = useState<number | null>(null);

  const width = 800;
  const height = 280;
  const margin = { top: 25, right: 30, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Max value calculation
  const maxVal = useMemo(() => {
    const vals = [
      selectedVessel.newbuildingParityUsdM,
      ...comparableVessels.map((v) => v.currentMarketValueUsdM),
      ...depreciationCurve.map((c) => c.theoreticalValueUsdM),
    ];
    return Math.ceil(Math.max(...vals) * 1.08);
  }, [selectedVessel, comparableVessels, depreciationCurve]);

  const maxAge = 25;

  const getX = (age: number) => margin.left + (Math.min(maxAge, Math.max(0, age)) / maxAge) * innerWidth;
  const getY = (val: number) => margin.top + innerHeight - (Math.min(maxVal, Math.max(0, val)) / maxVal) * innerHeight;

  // Build SVG Path for continuous curve
  const curvePath = useMemo(() => {
    if (!depreciationCurve || depreciationCurve.length === 0) return '';
    return depreciationCurve
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.age).toFixed(1)} ${getY(pt.theoreticalValueUsdM).toFixed(1)}`)
      .join(' ');
  }, [depreciationCurve, maxVal]);

  const hoveredPeer = comparableVessels.find((v) => v.id === hoveredVesselId);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            VESSEL AGE VS VALUATION DEPRECIATION CURVE
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Non-linear shipping lifecycle decay curve plotted against active {selectedVessel.vesselClass} fleet sales
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#38bdf8' }} />
            <span>Theoretical Lifecycle Decay</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>Peer Vessel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', border: '2px solid #ffffff' }} />
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedVessel.name}</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredVesselId(null)}
        >
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = maxVal * pct;
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
                  ${Math.round(val)}M
                </text>
              </g>
            );
          })}

          {/* Demolition Floor Baseline */}
          <line
            x1={margin.left}
            y1={getY(selectedVessel.demolitionScrapValueUsdM)}
            x2={width - margin.right}
            y2={getY(selectedVessel.demolitionScrapValueUsdM)}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3, 3"
            opacity="0.8"
          />
          <text
            x={width - margin.right}
            y={getY(selectedVessel.demolitionScrapValueUsdM) - 6}
            fill="#f59e0b"
            fontSize="9"
            textAnchor="end"
          >
            Scrap Floor (${selectedVessel.demolitionScrapValueUsdM.toFixed(1)}M)
          </text>

          {/* X Axis Grid Lines & Labels */}
          {[0, 5, 10, 15, 20, 25].map((age) => {
            const xPos = getX(age);
            return (
              <g key={age}>
                <line
                  x1={xPos}
                  y1={margin.top}
                  x2={xPos}
                  y2={margin.top + innerHeight}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4, 4"
                />
                <text
                  x={xPos}
                  y={margin.top + innerHeight + 20}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {age} yrs
                </text>
              </g>
            );
          })}

          {/* Theoretical Curve */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4, 4"
              opacity="0.75"
            />
          )}

          {/* Peer Comparable Vessels Scatter Dots */}
          {comparableVessels.map((peer) => {
            if (peer.id === selectedVessel.id) return null;
            const cx = getX(peer.ageYears);
            const cy = getY(peer.currentMarketValueUsdM);
            const isHovered = hoveredVesselId === peer.id;

            return (
              <g
                key={peer.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectVessel(peer.id)}
                onMouseEnter={() => setHoveredVesselId(peer.id)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#38bdf8' : '#10b981'}
                  stroke="#0d1829"
                  strokeWidth="1.5"
                />
                {isHovered && (
                  <text
                    x={cx}
                    y={cy - 10}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {peer.name}: ${peer.currentMarketValueUsdM.toFixed(1)}M
                  </text>
                )}
              </g>
            );
          })}

          {/* Selected Vessel Prominent Dot with Pulse */}
          <g>
            <circle
              cx={getX(selectedVessel.ageYears)}
              cy={getY(selectedVessel.currentMarketValueUsdM)}
              r="10"
              fill="rgba(236, 72, 153, 0.25)"
              stroke="#ec4899"
              strokeWidth="1"
            />
            <circle
              cx={getX(selectedVessel.ageYears)}
              cy={getY(selectedVessel.currentMarketValueUsdM)}
              r="5"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={getX(selectedVessel.ageYears)}
              y={getY(selectedVessel.currentMarketValueUsdM) - 14}
              fill="#ec4899"
              fontSize="11"
              fontWeight="800"
              textAnchor="middle"
            >
              {selectedVessel.name} (${selectedVessel.currentMarketValueUsdM.toFixed(1)}M)
            </text>
          </g>
        </svg>

        {/* Hover Tooltip for Peer Vessels */}
        {hoveredPeer && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'rgba(10, 17, 28, 0.95)',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.75rem',
              color: '#f8fafc',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>{hoveredPeer.name} ({hoveredPeer.vesselClass})</div>
            <div style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>
              Age: {hoveredPeer.ageYears.toFixed(1)} yrs &bull; {hoveredPeer.dwt.toLocaleString()} DWT
            </div>
            <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span>Market Value:</span>
              <strong style={{ color: '#10b981' }}>{formatValuation(hoveredPeer.currentMarketValueUsdM, currency, rates)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span>Valuation / DWT:</span>
              <strong>${hoveredPeer.valuationPerDwtUsd.toFixed(1)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
