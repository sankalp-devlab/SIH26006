/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Vessel Emissions Profile & CII Performance Slide-Over Drawer
 */

import { useState } from 'react';
import {
  X,
  Ship,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import type {
  EmissionsVesselRecord,
  EmissionsVoyageRecord,
  EmissionsLegRecord,
  CiiRating,
} from '../../../../types/emissions';

interface EmissionsVesselDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: EmissionsVesselRecord | null;
  voyages: EmissionsVoyageRecord[];
  legs: EmissionsLegRecord[];
}

export function EmissionsVesselDrawer({
  isOpen,
  onClose,
  vessel,
  voyages,
  legs,
}: EmissionsVesselDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'voyage' | 'cii'>('overview');

  if (!isOpen || !vessel) return null;

  const ciiColors: Record<CiiRating, string> = {
    A: '#10b981',
    B: '#34d399',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
  };

  const gradeColor = ciiColors[vessel.ciiRating];
  const currentVoyage = voyages.find((vy) => vy.voyageId === vessel.currentVoyageId) || voyages[0];
  const vesselLegs = legs.filter((leg) => currentVoyage && leg.voyageId === currentVoyage.voyageId);

  // Required improvement calculation
  const ciiGapPct = (((vessel.ciiScore - vessel.ciiTarget) / vessel.ciiTarget) * 100).toFixed(1);
  const requiresImprovement = vessel.ciiScore > vessel.ciiTarget;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '560px',
        background: '#0a111c',
        borderLeft: '1px solid #1e293b',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: '#0d1829',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(0, 102, 204, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Ship size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                {vessel.name}
              </h2>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: `${gradeColor}22`,
                  color: gradeColor,
                  border: `1px solid ${gradeColor}66`,
                }}
              >
                CII Grade {vessel.ciiRating}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              {vessel.imoNumber} &bull; {vessel.vesselClass} &bull; {vessel.dwt.toLocaleString()} DWT &bull; {vessel.flag}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #1e293b',
          background: '#0f172a',
          padding: '0 1.5rem',
        }}
      >
        {(
          [
            { id: 'overview', label: 'Emissions Profile' },
            { id: 'cii', label: 'CII & Regulation' },
            { id: 'voyage', label: 'Voyage & Legs' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #0066cc' : '2px solid transparent',
              color: activeTab === t.id ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Current Operational Location Banner */}
        <div
          style={{
            background: '#0d1829',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
          }}
        >
          <MapPin size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ color: '#94a3b8' }}>Current Deployment: </span>
            <strong style={{ color: '#f8fafc' }}>{vessel.currentLocation.subArea}</strong>
            <span style={{ color: '#64748b' }}> ({vessel.currentLocation.latitude.toFixed(2)}°, {vessel.currentLocation.longitude.toFixed(2)}°)</span>
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: vessel.status === 'At Sea' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: vessel.status === 'At Sea' ? '#10b981' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {vessel.status} ({vessel.currentLocation.speedKnots} kts)
          </span>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Metric Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
              }}
            >
              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>TOTAL CO₂ EMISSIONS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#f8fafc' }}>
                  {vessel.totalCo2Mt.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mt</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: vessel.co2TrendPct <= 0 ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                  {vessel.co2TrendPct <= 0 ? '↓' : '↑'} {Math.abs(vessel.co2TrendPct)}% vs baseline
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>CO₂ / NAUTICAL MILE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8' }}>
                  {vessel.co2IntensityKgPerNm} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>kg/nm</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                  Across {vessel.totalDistanceNm.toLocaleString()} nm
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>ATTAINED EEOI</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#f8fafc' }}>
                  {vessel.attainedEeoi.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>g/t·nm</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                  Cargo utilization: {vessel.cargoUtilizationPct}%
                </div>
              </div>

              <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>ATTAINED AER</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: gradeColor }}>
                  {vessel.attainedAer.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>g/dwt·nm</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                  IMO Target: {vessel.ciiTarget.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Technical & Commercial Specifications */}
            <div
              style={{
                background: '#0d1829',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                Technical & Compliance Configuration
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Owner / Operator: </span>
                  <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{vessel.ownerName}</div>
                  <div style={{ color: '#94a3b8' }}>{vessel.operatorName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Fleet Assignment: </span>
                  <div style={{ color: '#38bdf8', fontWeight: 600 }}>{vessel.fleetName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Bunker Fuel Mode: </span>
                  <div style={{ color: '#f8fafc' }}>{vessel.fuelType}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Scrubber / EGCS: </span>
                  <div style={{ color: vessel.scrubberFitted ? '#10b981' : '#94a3b8' }}>
                    {vessel.scrubberFitted ? 'Fitted (Hybrid SOx Scrubber)' : 'None (Compliant Fuel)'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>SECA Compliance: </span>
                  <div style={{ color: '#10b981' }}>{vessel.secaComplianceStatus}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Year Built: </span>
                  <div style={{ color: '#f8fafc' }}>{vessel.yearBuilt} ({2026 - vessel.yearBuilt} yrs)</div>
                </div>
              </div>
            </div>

            {/* Emissions Breakdown by Gas */}
            <div
              style={{
                background: '#0d1829',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                Cumulative Gas Discharges (MARPOL Annex VI)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                    <span style={{ color: '#94a3b8' }}>Carbon Dioxide (CO₂)</span>
                    <strong style={{ color: '#f8fafc' }}>{vessel.totalCo2Mt.toLocaleString()} mt</strong>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                    <span style={{ color: '#94a3b8' }}>Nitrogen Oxides (NOx)</span>
                    <strong style={{ color: '#f59e0b' }}>{vessel.totalNoxMt.toFixed(1)} mt</strong>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (vessel.totalNoxMt / (vessel.totalCo2Mt * 0.05)) * 100)}%`, height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                    <span style={{ color: '#94a3b8' }}>Sulfur Oxides (SOx)</span>
                    <strong style={{ color: '#a855f7' }}>{vessel.totalSoxMt.toFixed(1)} mt</strong>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (vessel.totalSoxMt / (vessel.totalCo2Mt * 0.01)) * 100)}%`, height: '100%', background: '#a855f7' }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CII & REGULATION */}
        {activeTab === 'cii' && (
          <>
            {/* CII Rating Scale Box */}
            <div
              style={{
                background: '#0d1829',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                  IMO MEPC Carbon Intensity Indicator
                </h4>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: `${gradeColor}22`,
                    color: gradeColor,
                    border: `1px solid ${gradeColor}55`,
                  }}
                >
                  Grade {vessel.ciiRating} &bull; Attained
                </span>
              </div>

              {/* A-E Visual Meter */}
              <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                {(['A', 'B', 'C', 'D', 'E'] as const).map((r) => {
                  const isCurrent = vessel.ciiRating === r;
                  return (
                    <div
                      key={r}
                      style={{
                        flex: 1,
                        background: isCurrent ? ciiColors[r] : `${ciiColors[r]}33`,
                        color: isCurrent ? '#ffffff' : ciiColors[r],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: isCurrent ? `2px solid #ffffff` : 'none',
                        boxShadow: isCurrent ? `0 0 12px ${ciiColors[r]}` : 'none',
                      }}
                    >
                      {r}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
                <span>Major Superior (A)</span>
                <span>Baseline (C)</span>
                <span>Inferior (E)</span>
              </div>

              {/* Metrics vs Reference Target */}
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Attained CII Score</span>
                  <strong style={{ fontFamily: 'var(--font-mono, monospace)', color: gradeColor }}>
                    {vessel.ciiScore.toFixed(2)} gCO₂/dwt·nm
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>IMO MEPC Reference Target</span>
                  <strong style={{ fontFamily: 'var(--font-mono, monospace)', color: '#f8fafc' }}>
                    {vessel.ciiTarget.toFixed(2)} gCO₂/dwt·nm
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Required Gap / Surplus</span>
                  <strong style={{ color: requiresImprovement ? '#ef4444' : '#10b981' }}>
                    {requiresImprovement ? `+${ciiGapPct}% (Exceeds Target)` : `${ciiGapPct}% (Within Envelope)`}
                  </strong>
                </div>
              </div>

              {requiresImprovement && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#f87171',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>SEEMP Part III Corrective Action Required:</strong> Vessel is operating in an inferior band.
                    Engine power limitation (EPL) or bio-fuel blending must be submitted to flag administration.
                  </div>
                </div>
              )}
            </div>

            {/* Historical 4-Year Trajectory */}
            <div
              style={{
                background: '#0d1829',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                Historical CII Rating Trajectory (2023–2026)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                {vessel.historicalRatings.map((hr) => (
                  <div key={hr.year} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{hr.year}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: ciiColors[hr.rating], margin: '4px 0' }}>
                      {hr.rating}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                      {hr.score.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 3: VOYAGE & LEGS */}
        {activeTab === 'voyage' && (
          <>
            {currentVoyage ? (
              <div
                style={{
                  background: '#0d1829',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 600 }}>CURRENT VOYAGE</span>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                    {currentVoyage.voyageId}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
                  {currentVoyage.originPort} &rarr; {currentVoyage.destinationPort}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                  Cargo: {currentVoyage.cargoQuantityMt.toLocaleString()} mt {currentVoyage.cargoCommodity} &bull; Distance: {currentVoyage.distanceNm.toLocaleString()} nm
                </p>

                {/* Voyage Leg Breakdown */}
                <h5 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Voyage Leg Breakdown
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {vesselLegs.map((leg) => (
                    <div
                      key={leg.legId}
                      style={{
                        background: '#0f172a',
                        border: leg.isAnomalous ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #1e293b',
                        borderRadius: '4px',
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                          Leg {leg.legNumber}: {leg.origin} &rarr; {leg.destination}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#10b981' }}>
                          {leg.co2Mt} mt CO₂
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.6875rem', marginTop: '4px' }}>
                        <span>Speed: {leg.speedKnots} kts</span>
                        <span>Fuel: {leg.fuelBurnMt} mt</span>
                        <span>EEOI: {leg.eeoi}</span>
                      </div>
                      {leg.isAnomalous && (
                        <div style={{ marginTop: '4px', color: '#ef4444', fontSize: '0.6875rem' }}>
                          ⚠️ Anomaly (+{leg.anomalyDeviationPct}%): {leg.anomalyExplanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No active voyage recorded for this vessel.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
