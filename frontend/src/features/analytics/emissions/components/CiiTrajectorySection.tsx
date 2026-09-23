/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Dedicated IMO MEPC CII Regulatory Analytics & Decarbonization Trajectory
 */

import { useState } from 'react';
import {
  Award,
  AlertTriangle,
} from 'lucide-react';
import type {
  EmissionsVesselRecord,
  CiiRating,
} from '../../../../types/emissions';

interface CiiTrajectorySectionProps {
  vessels: EmissionsVesselRecord[];
  onSelectVessel: (id: number) => void;
}

export function CiiTrajectorySection({ vessels, onSelectVessel }: CiiTrajectorySectionProps) {
  // Scenario toggles for decarbonization projections
  const [applyEplScenario, setApplyEplScenario] = useState(false);
  const [applyBiofuelScenario, setApplyBiofuelScenario] = useState(false);

  const ciiColors: Record<CiiRating, string> = {
    A: '#10b981',
    B: '#34d399',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
  };

  // Grade Counts
  const counts: Record<CiiRating, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  vessels.forEach((v) => {
    if (counts[v.ciiRating] !== undefined) counts[v.ciiRating]++;
  });

  const atRiskVessels = vessels.filter((v) => v.ciiRating === 'D' || v.ciiRating === 'E');

  // Annual required reduction factors Z under IMO MEPC 76/80
  const reductionTimeline = [
    { year: 2023, factorZ: '5.0%', reduction: '-5%' },
    { year: 2024, factorZ: '7.0%', reduction: '-7%' },
    { year: 2025, factorZ: '9.0%', reduction: '-9%' },
    { year: 2026, factorZ: '11.0%', reduction: '-11%' },
    { year: 2027, factorZ: '13.0%', reduction: '-13%' },
    { year: 2028, factorZ: '15.0%', reduction: '-15%' },
    { year: 2030, factorZ: '20.0%', reduction: '-20%' },
  ];

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: '#10b981' }} />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
              IMO CARBON INTENSITY INDICATOR (CII) & SEEMP COMPLIANCE
            </h3>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Operational rating distribution (Grades A to E) and annual tightening trajectory under MARPOL Annex VI
          </p>
        </div>

        {/* Decarbonization Scenario Simulation Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{ color: '#64748b' }}>Simulate:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: applyEplScenario ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={applyEplScenario}
              onChange={(e) => setApplyEplScenario(e.target.checked)}
              style={{ accentColor: '#0066cc' }}
            />
            Engine Power Limiting (EPL -15%)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: applyBiofuelScenario ? '#10b981' : '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={applyBiofuelScenario}
              onChange={(e) => setApplyBiofuelScenario(e.target.checked)}
              style={{ accentColor: '#10b981' }}
            />
            Biofuel B30 Blend
          </label>
        </div>
      </div>

      {/* A through E Rating Distribution Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
          const col = ciiColors[grade];
          const count = counts[grade];
          const pct = ((count / (vessels.length || 1)) * 100).toFixed(0);

          return (
            <div
              key={grade}
              style={{
                background: '#0f172a',
                border: `1px solid ${col}44`,
                borderRadius: '6px',
                padding: '0.75rem',
                textAlign: 'center',
                boxShadow: `0 2px 8px ${col}11`,
              }}
            >
              <div style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>GRADE</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: col, margin: '2px 0' }}>
                {grade}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                {count} vessels
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                {pct}% of fleet
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Trajectory Timeline + At-Risk Vessels List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Annual Tightening Trajectory Table */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
            IMO MEPC Required Annual Tightening Factor (Z-Factor)
          </h4>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.6875rem', color: '#94a3b8' }}>
            Reference line carbon reductions required vs 2019 IMO baseline:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {reductionTimeline.map((item) => (
              <div key={item.year} style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: '4px', padding: '6px 2px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{item.year}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8', margin: '2px 0' }}>
                  {item.factorZ}
                </div>
                <div style={{ fontSize: '0.625rem', color: '#10b981' }}>{item.reduction}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', padding: '8px', background: '#0d1829', borderRadius: '4px', fontSize: '0.6875rem', color: '#94a3b8' }}>
            💡 <strong>Regulatory Note:</strong> By 2026, required CII reference targets tighten by 11.0%. Vessels failing to maintain Grade C or above for 3 consecutive years must undergo mandatory verification of a SEEMP Corrective Action Plan.
          </div>
        </div>

        {/* At-Risk Vessels Warning List */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
              <AlertTriangle size={14} />
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                At-Risk Vessels (Grades D & E)
              </h4>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 700 }}>
              {atRiskVessels.length} ACTION REQUIRED
            </span>
          </div>

          {atRiskVessels.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#10b981', fontSize: '0.75rem' }}>
              ✓ All vessels in active fleet are currently operating within Grades A, B, or C.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {atRiskVessels.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVessel(v.id)}
                  style={{
                    background: '#0d1829',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.75rem' }}>
                      {v.name} ({v.vesselClass})
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      Attained AER: {v.attainedAer.toFixed(2)} vs Target {v.ciiTarget.toFixed(2)} g/dwt·nm
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `${ciiColors[v.ciiRating]}22`,
                      color: ciiColors[v.ciiRating],
                      border: `1px solid ${ciiColors[v.ciiRating]}55`,
                    }}
                  >
                    Grade {v.ciiRating}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
