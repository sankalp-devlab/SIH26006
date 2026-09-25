import React from 'react';
import {
  Ship,
  X,
  CheckCircle2,
  DollarSign,
  Clock,
  Shield,
  Leaf,
  Compass,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { DetailedVesselIntelligence } from './VesselIntelligenceDetailPanel';
import type { OptimizationPreference } from '../../../types/recommendation';

interface MultiVesselComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: DetailedVesselIntelligence[];
  activePreference: OptimizationPreference;
  onPreferenceChange: (pref: OptimizationPreference) => void;
  onSelectVessel: (vessel: DetailedVesselIntelligence) => void;
  onRemoveFromCompare: (vesselId: number) => void;
}

export const MultiVesselComparisonModal: React.FC<MultiVesselComparisonModalProps> = ({
  isOpen,
  onClose,
  vessels,
  activePreference,
  onPreferenceChange,
  onSelectVessel,
  onRemoveFromCompare,
}) => {
  if (!isOpen || vessels.length === 0) return null;

  // Compute best vessel for the current preference
  const sortedVessels = [...vessels].sort((a, b) => {
    if (activePreference === 'lowest_cost') {
      return a.estimated_cost_usd - b.estimated_cost_usd;
    }
    if (activePreference === 'fastest_eta') {
      return a.voyage_hours - b.voyage_hours;
    }
    if (activePreference === 'lowest_risk') {
      return a.risk_score - b.risk_score;
    }
    // balanced default
    return b.recommendation_score - a.recommendation_score;
  });

  const bestVesselId = sortedVessels[0]?.vessel_id;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(5, 12, 28, 0.85)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface, #091A2A)',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          padding: '1.75rem',
          zIndex: 1301,
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                MULTI-VESSEL COMPARISON MATRIX
              </span>
              <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>&middot;</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Comparing {vessels.length} of max 4 vessels
              </span>
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Side-by-Side Vessel Feasibility Comparison
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Priority Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
            <Sparkles size={14} />
            <span>PRIORITIZATION FACTOR:</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'lowest_cost', label: 'Lowest Cost' },
              { key: 'fastest_eta', label: 'Fastest Delivery' },
              { key: 'lowest_risk', label: 'Lowest Risk' },
              { key: 'balanced', label: 'Balanced Optimization' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPreferenceChange(p.key as OptimizationPreference)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: activePreference === p.key ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  border: activePreference === p.key ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: activePreference === p.key ? '#ffffff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: activePreference === p.key ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(56, 189, 248, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '12px 14px', width: '220px', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Operational Metric
                </th>
                {vessels.map((v) => {
                  const isBest = v.vessel_id === bestVesselId;
                  return (
                    <th
                      key={v.vessel_id}
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        minWidth: '200px',
                        backgroundColor: isBest ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRight: isBest ? '1px solid rgba(56, 189, 248, 0.2)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          {isBest && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Top Rank ({activePreference.replace('_', ' ')})
                            </span>
                          )}
                          <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff' }}>{v.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{v.vessel_type}</div>
                        </div>

                        {vessels.length > 2 && (
                          <button
                            type="button"
                            onClick={() => onRemoveFromCompare(v.vessel_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              padding: '2px',
                            }}
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onSelectVessel(v)}
                          style={{
                            width: '100%',
                            background: isBest ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(56, 189, 248, 0.2)',
                            borderColor: isBest ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          [SELECT VESSEL]
                        </Button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Estimated Voyage Cost */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={14} color="#38bdf8" />
                    <span>Estimated Total Cost</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.9375rem' }}>
                      ${v.estimated_cost_usd.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      ${v.cost_per_ton_usd.toFixed(2)} / MT
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 2: Distance */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={14} color="#38bdf8" />
                    <span>Nautical Distance</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{v.distance_nm.toLocaleString()} NM</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{v.route_type}</div>
                  </td>
                ))}
              </tr>

              {/* Row 3: Voyage Time */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#38bdf8" />
                    <span>Voyage Duration</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>
                      {v.voyage_days} Days ({v.voyage_hours} hrs)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      At {v.speed_knots || 14} knots service speed
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 4: Estimated ETA */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#10b981" />
                    <span>Projected Arrival (ETA)</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>
                      {new Date(v.estimated_eta).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Dep: {new Date(v.departure_date).toLocaleDateString()}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 5: Capacity */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ship size={14} color="#38bdf8" />
                    <span>Deadweight Capacity</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>
                      {v.capacity_tons.toLocaleString()} MT DWT
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                      {v.utilization_pct.toFixed(1)}% Capacity Utilization
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Cargo Fit */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#38bdf8" />
                    <span>Cargo Compatibility</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>
                      SUITABLE ({v.score_tier || 'COMPATIBLE'})
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      MCDA Match: {v.recommendation_score}/100
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 7: Risk */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="#38bdf8" />
                    <span>Navigational Risk</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: v.risk_level === 'LOW' ? '#10b981' : '#f59e0b' }}>
                      {v.risk_score} / 100 ({v.risk_level})
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {v.chokepoints && v.chokepoints.length > 0 ? v.chokepoints.join(', ') : 'Open seaways'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 8: Port Compatibility */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#38bdf8" />
                    <span>Port Compatibility</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>COMPATIBLE</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Draft {v.draft_m || 12}m within channel limits
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 9: Fuel Consumption */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={14} color="#38bdf8" />
                    <span>Fuel Consumption</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>
                      {v.fuel_consumed_mt ? `${v.fuel_consumed_mt.toLocaleString()} MT` : 'Data unavailable'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {v.fuel_burn_rate_mt_day ? `${v.fuel_burn_rate_mt_day} MT/day` : 'Data unavailable'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 10: Emissions */}
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={14} color="#10b981" />
                    <span>Estimated CO2 Emissions</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: v.estimated_co2_emissions_mt ? '#38bdf8' : 'var(--color-text-muted)' }}>
                      {v.estimated_co2_emissions_mt ? `~${v.estimated_co2_emissions_mt.toLocaleString()} MT` : 'Not available'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {v.estimated_co2_emissions_mt ? 'IMO Conversion Factor' : 'Sensor data unavailable'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 11: Availability / Status */}
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ship size={14} color="#38bdf8" />
                    <span>Availability / Location</span>
                  </div>
                </td>
                {vessels.map((v) => (
                  <td key={v.vessel_id} style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, color: v.current_location ? '#10b981' : '#cbd5e1' }}>
                      {v.current_location ? 'Tracked Telemetry' : 'Fleet Active'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {v.current_location ? `${v.current_location.latitude.toFixed(2)}°, ${v.current_location.longitude.toFixed(2)}°` : 'Position not broadcasted'}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
};
