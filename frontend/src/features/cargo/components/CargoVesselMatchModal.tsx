import React, { useMemo, useState } from 'react';
import {
  Ship,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CargoWorkspaceService } from '../../../services/cargo/cargo-workspace.service';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { RecommendationEnginePanel } from './RecommendationEnginePanel';
import type { CargoRecord, VesselMatchInfo } from '../../../types/cargo';
import type { Vessel } from '../../../types/vessel';

interface CargoVesselMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargo: CargoRecord | null;
  availableVessels: Vessel[];
  onAssignVessel: (cargoId: number, match: VesselMatchInfo) => void;
}

export const CargoVesselMatchModal: React.FC<CargoVesselMatchModalProps> = ({
  isOpen,
  onClose,
  cargo,
  availableVessels,
  onAssignVessel,
}) => {
  const [matchMode, setMatchMode] = useState<'mcda' | 'heuristic'>('mcda');

  const {
    recommendations,
    isLoading: isLoadingRecommendations,
    selectedPreference,
    setSelectedPreference,
    bunkerPrice,
    setBunkerPrice,
    dailyHire,
    setDailyHire,
    generate: generateRecommendations,
  } = useRecommendations();

  const handleTriggerRecommendations = async () => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    await generateRecommendations({
      cargo_id: cargo.id,
      cargo_type: cargo.cargo_type,
      weight_tons: cargo.weight_tons,
      cargo_description: cargo.description || cargo.commodity,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
      preference: selectedPreference,
      bunker_price_usd_per_mt: bunkerPrice,
      daily_hire_usd: dailyHire,
    });
  };

  const matches = useMemo(() => {
    if (!cargo) return [];
    return CargoWorkspaceService.getMatchingVesselsForCargo(cargo, availableVessels);
  }, [cargo, availableVessels]);

  if (!isOpen || !cargo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1101,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ship size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Fleet Vessel Allocation Engine
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Intelligent multi-criteria recommendation and laycan matching for consignment {cargo.reference_number}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setMatchMode('mcda')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: matchMode === 'mcda' ? '2px solid #0284c7' : '1px solid var(--color-border-subtle)',
              backgroundColor: matchMode === 'mcda' ? 'rgba(2, 132, 199, 0.1)' : 'var(--color-bg-surface-alt)',
              color: matchMode === 'mcda' ? '#0284c7' : 'var(--color-text-secondary)',
              fontWeight: matchMode === 'mcda' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} /> Multi-Criteria Recommendation Engine (Module 18)
          </button>

          <button
            type="button"
            onClick={() => setMatchMode('heuristic')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: matchMode === 'heuristic' ? '2px solid #0284c7' : '1px solid var(--color-border-subtle)',
              backgroundColor: matchMode === 'heuristic' ? 'rgba(2, 132, 199, 0.1)' : 'var(--color-bg-surface-alt)',
              color: matchMode === 'heuristic' ? '#0284c7' : 'var(--color-text-secondary)',
              fontWeight: matchMode === 'heuristic' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            <Ship size={14} /> Quick Laycan Listing ({matches.length})
          </button>
        </div>

        {/* MCDA Recommendation Engine View */}
        {matchMode === 'mcda' ? (
          <div style={{ marginBottom: '1rem' }}>
            <RecommendationEnginePanel
              cargo={cargo}
              recommendations={recommendations}
              isLoading={isLoadingRecommendations}
              selectedPreference={selectedPreference}
              onPreferenceChange={setSelectedPreference}
              bunkerPrice={bunkerPrice}
              onBunkerPriceChange={setBunkerPrice}
              dailyHire={dailyHire}
              onDailyHireChange={setDailyHire}
              onGenerate={handleTriggerRecommendations}
              onAssignVessel={onAssignVessel}
            />
          </div>
        ) : (
          <>
            {/* Cargo Target Summary */}
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--color-bg-surface-alt)',
                borderRadius: '6px',
                border: '1px solid var(--color-border-subtle)',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Consignment</div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', marginTop: '2px' }}>{cargo.commodity}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Required Tonnage</div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-brand-accent)', marginTop: '2px' }}>
                  {cargo.weight_tons.toLocaleString()} MT
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Nautical Corridor</div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginTop: '2px' }}>
                  {cargo.origin_port.name} → {cargo.destination_port.name}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Laycan Window</div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginTop: '2px' }}>
                  {new Date(cargo.ready_date).toLocaleDateString()} to {new Date(cargo.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Matching Fleet Vessels List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Recommended Fleet Vessels ({matches.length})
              </span>

          {matches.map((v) => {
            const isAssigned = cargo.matched_vessel?.vessel_id === v.vessel_id;

            return (
              <div
                key={v.vessel_id}
                style={{
                  border: isAssigned ? '2px solid #10b981' : '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '1rem',
                  backgroundColor: isAssigned ? '#f0fdf4' : 'var(--color-bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {v.vessel_name}
                    </h4>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {v.imo_number}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {v.vessel_type} · {v.capacity_dwt.toLocaleString()} DWT
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '8px', fontSize: '0.75rem' }}>
                    <span>
                      DWT Fit: <strong style={{ color: '#10b981' }}>{v.capacity_match_percent}%</strong>
                    </span>
                    <span>
                      Corridor Proximity: <strong style={{ color: '#10b981' }}>{v.route_match_percent}%</strong>
                    </span>
                    <span>
                      Laycan ETA: <strong style={{ color: '#10b981' }}>{new Date(v.eta).toLocaleDateString()}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                    {v.match_score}%
                  </div>
                  {isAssigned ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle2 size={13} /> Assigned
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onAssignVessel(cargo.id, v)}
                    >
                      Assign Vessel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
