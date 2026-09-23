/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Leg-Level Emissions & Comparative Breakdown
 */

import {
  AlertTriangle,
} from 'lucide-react';
import type {
  EmissionsLegRecord,
} from '../../../../types/emissions';

interface LegEmissionsSectionProps {
  legs: EmissionsLegRecord[];
}

export function LegEmissionsSection({ legs }: LegEmissionsSectionProps) {
  if (!legs || legs.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No leg records available for the selected filters.
      </div>
    );
  }

  // Find max CO2 for proportional relative bars
  const maxCo2 = Math.max(...legs.map((l) => l.co2Mt), 1);

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
            LEG-LEVEL EMISSIONS INTELLIGENCE
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Granular leg breakdown across origin-destination corridors with anomaly deviation tracking
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {legs.length} total active legs recorded
        </span>
      </div>

      {/* Leg Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {legs.map((leg) => {
          const pctOfMax = (leg.co2Mt / maxCo2) * 100;
          return (
            <div
              key={leg.legId}
              style={{
                background: leg.isAnomalous ? 'rgba(239, 68, 68, 0.05)' : '#0f172a',
                border: leg.isAnomalous ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: leg.legType === 'laden' ? 'rgba(0, 102, 204, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: leg.legType === 'laden' ? '#38bdf8' : '#cbd5e1',
                    }}
                  >
                    LEG {leg.legNumber < 10 ? `0${leg.legNumber}` : leg.legNumber} &bull; {leg.legType.toUpperCase()}
                  </span>

                  {leg.isAnomalous ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      <AlertTriangle size={12} />
                      +{leg.anomalyDeviationPct}% ANOMALY
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                      {leg.voyageId}
                    </span>
                  )}
                </div>

                {/* Corridor */}
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', margin: '0.25rem 0' }}>
                  {leg.origin} &rarr; {leg.destination}
                </div>

                {/* Relative Bar */}
                <div style={{ margin: '0.5rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '2px' }}>
                    <span>CO₂ Intensity Contribution</span>
                    <strong style={{ color: leg.isAnomalous ? '#ef4444' : '#10b981' }}>{leg.co2Mt} mt CO₂</strong>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pctOfMax}%`,
                        height: '100%',
                        background: leg.isAnomalous ? '#ef4444' : '#10b981',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>DISTANCE</div>
                    <strong style={{ color: '#f8fafc' }}>{leg.distanceNm} nm</strong>
                  </div>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>SPEED</div>
                    <strong style={{ color: '#f8fafc' }}>{leg.speedKnots} kts</strong>
                  </div>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>FUEL BURN</div>
                    <strong style={{ color: '#f8fafc' }}>{leg.fuelBurnMt} mt</strong>
                  </div>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>NOx</div>
                    <strong style={{ color: '#f59e0b' }}>{leg.noxMt} t</strong>
                  </div>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>SOx</div>
                    <strong style={{ color: '#a855f7' }}>{leg.soxMt} t</strong>
                  </div>
                  <div style={{ background: '#0d1829', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>EEOI</div>
                    <strong style={{ color: '#38bdf8' }}>{leg.eeoi}</strong>
                  </div>
                </div>
              </div>

              {/* Anomaly Explanation Alert */}
              {leg.isAnomalous && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '6px 8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    color: '#fca5a5',
                    lineHeight: 1.35,
                  }}
                >
                  <strong>Root Cause:</strong> {leg.anomalyExplanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
