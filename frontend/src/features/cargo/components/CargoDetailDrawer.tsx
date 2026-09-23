import React, { useState, useEffect } from 'react';
import {
  X,
  Ship,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Lock,
  Share2,
  Archive,
  CheckCircle2,
  Radio,
  Mail,
  MessageSquare,
  FileCode,
  PenTool,
  Compass,
  DollarSign,
  Clock,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import type { CargoRecord, VesselMatchInfo } from '../../../types/cargo';
import { ProvenanceBadge } from '../../../components/provenance';
import { useRouteCalculation } from '../../../hooks/useRouteCalculation';
import { useCostCalculation } from '../../../hooks/useCostCalculation';
import { useEtaCalculation } from '../../../hooks/useEtaCalculation';
import { useMlEtaPrediction } from '../../../hooks/useMlEtaPrediction';
import { useMlCostPrediction } from '../../../hooks/useMlCostPrediction';
import { useRiskAssessment } from '../../../hooks/useRiskAssessment';
import { useRecommendations } from '../../../hooks/useRecommendations';
import { VoyageCostPanel } from './VoyageCostPanel';
import { EtaResultPanel } from './EtaResultPanel';
import { MlEtaPanel } from './MlEtaPanel';
import { MlCostPanel } from './MlCostPanel';
import { MaritimeRiskPanel } from './MaritimeRiskPanel';
import { RecommendationEnginePanel } from './RecommendationEnginePanel';
import { BookingReviewModal } from './BookingReviewModal';

interface CargoDetailDrawerProps {
  cargo: CargoRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVesselMatch: (cargo: CargoRecord) => void;
  onUnmatchVessel: (cargoId: number) => void;
  onValidateSingle: (cargoId: number) => void;
  onArchiveSingle: (cargoId: number) => void;
  onOpenShare: (cargo: CargoRecord) => void;
  onAssignVessel?: (cargoId: number, match: VesselMatchInfo) => void;
}

export const CargoDetailDrawer: React.FC<CargoDetailDrawerProps> = ({
  cargo,
  isOpen,
  onClose,
  onOpenVesselMatch,
  onUnmatchVessel,
  onValidateSingle,
  onArchiveSingle,
  onOpenShare,
  onAssignVessel,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'validation' | 'vessel' | 'history'>('overview');
  const [bookingVessel, setBookingVessel] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const { calculate, route: calcRoute, isCalculating, error: calcError } = useRouteCalculation();
  const {
    calculate: calculateCost,
    cost,
    isCalculating: isCalculatingCost,
    error: costError,
    reset: resetCost,
  } = useCostCalculation();
  const {
    calculate: calculateEta,
    eta,
    isCalculating: isCalculatingEta,
    error: etaError,
    reset: resetEta,
  } = useEtaCalculation();
  const {
    predict: predictMlEta,
    prediction: mlEta,
    isPredicting: isPredictingMlEta,
    error: mlEtaError,
    reset: resetMlEta,
  } = useMlEtaPrediction();
  const {
    predict: predictMlCost,
    prediction: mlCost,
    isPredicting: isPredictingMlCost,
    error: mlCostError,
    reset: resetMlCost,
  } = useMlCostPrediction();
  const {
    assess: assessRisk,
    assessment: riskAssessment,
    isAssessing: isAssessingRisk,
    error: riskError,
    reset: resetRisk,
  } = useRiskAssessment();
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
    error: recommendationError,
  } = useRecommendations();

  const handleTriggerRouteCalc = async () => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    await calculate({
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
      vessel_id: cargo.matched_vessel?.vessel_id,
      cargo_id: cargo.id,
      cargo_type: cargo.cargo_type,
      cargo_weight: cargo.weight_tons,
    });
  };

  const handleTriggerCostCalc = async (bunkerPrice?: number, dailyHire?: number) => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    const vesselId = cargo.matched_vessel?.vessel_id || 1;
    await calculateCost({
      cargo_id: cargo.id,
      vessel_id: vesselId,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
      bunker_price_usd_per_mt: bunkerPrice,
      daily_hire_usd: dailyHire,
    });
  };

  const handleTriggerEtaCalc = async (departureTimeOverride?: string) => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    const vesselId = cargo.matched_vessel?.vessel_id || 1;
    await calculateEta({
      cargo_id: cargo.id,
      vessel_id: vesselId,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
      departure_time: departureTimeOverride,
    });
  };

  const handleTriggerMlEta = async () => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    const vesselId = cargo.matched_vessel?.vessel_id || 1;
    await predictMlEta({
      cargo_id: cargo.id,
      vessel_id: vesselId,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
    });
  };

  const handleTriggerMlCost = async (bunkerPrice?: number, dailyHire?: number) => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    const vesselId = cargo.matched_vessel?.vessel_id || 1;
    await predictMlCost({
      cargo_id: cargo.id,
      vessel_id: vesselId,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
      bunker_price_usd_per_mt: bunkerPrice,
      daily_hire_usd: dailyHire,
    });
  };

  const handleTriggerRiskAssess = async () => {
    if (!cargo?.origin_port?.id || !cargo?.destination_port?.id) return;
    const vesselId = cargo.matched_vessel?.vessel_id || 1;
    await assessRisk({
      cargo_id: cargo.id,
      vessel_id: vesselId,
      origin_port_id: cargo.origin_port.id,
      destination_port_id: cargo.destination_port.id,
    });
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cargo) return null;

  const renderSourceIcon = (source: CargoRecord['source']) => {
    switch (source) {
      case 'email':
        return <Mail size={14} color="#0284c7" />;
      case 'whatsapp':
        return <MessageSquare size={14} color="#10b981" />;
      case 'slack':
        return <Radio size={14} color="#8b5cf6" />;
      case 'edi':
        return <FileCode size={14} color="#d97706" />;
      case 'manual':
      default:
        return <PenTool size={14} color="#64748b" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          height: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.35)',
          overflowY: 'auto',
          zIndex: 1001,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface-alt)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {cargo.reference_number}
              </span>
              {cargo.provenance ? (
                <ProvenanceBadge provenance={cargo.provenance} showInspector />
              ) : (
                <>
                  <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    {renderSourceIcon(cargo.source)} {cargo.source.toUpperCase()}
                  </span>
                  {cargo.is_private && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Lock size={10} /> Private Lineup
                    </span>
                  )}
                </>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {cargo.commodity} · {cargo.zone}
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Operational Actions Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {cargo.validation_status === 'valid' ? (
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={12} style={{ marginRight: '3px' }} /> Verified
              </span>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                icon={<CheckCircle2 size={13} color="#10b981" />}
                onClick={() => onValidateSingle(cargo.id)}
              >
                Mark as Validated
              </Button>
            )}

            {!cargo.matched_vessel ? (
              <Button
                size="sm"
                variant="primary"
                icon={<Ship size={13} />}
                onClick={() => onOpenVesselMatch(cargo)}
              >
                Match Vessel
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUnmatchVessel(cargo.id)}
                style={{ color: '#ef4444' }}
              >
                Unmatch Vessel
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              size="sm"
              variant="secondary"
              icon={<Share2 size={13} />}
              onClick={() => onOpenShare(cargo)}
            >
              Share Recap
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Archive size={13} />}
              onClick={() => onArchiveSingle(cargo.id)}
              title="Archive Consignment"
            >
              Archive
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border-subtle)',
            padding: '0 1.5rem',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'tracking', label: 'Operational Lifecycle' },
            { key: 'validation', label: `Diagnostics (${cargo.validation_issues.length})` },
            { key: 'vessel', label: 'Fleet Matching' },
            { key: 'history', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--color-brand-accent)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--color-brand-accent)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Commercial Parties */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Commercial Counterparties
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Shipper / Charterer</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {cargo.shipper}
                    </div>
                    {cargo.source_sender && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Origin Sender: {cargo.source_sender}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consignee / Receiver</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {cargo.consignee}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications & Packaging */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Cargo Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Category</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{cargo.cargo_type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Deadweight Tonnage</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-brand-accent)' }}>
                      {cargo.weight_tons.toLocaleString()} {cargo.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Volume</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {cargo.volume_m3 ? `${cargo.volume_m3.toLocaleString()} m³` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nautical Route Details & Module 11 Route Calculation */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    Nautical Seaway Corridor
                  </h4>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 217, 255, 0.12)',
                      color: '#00D9FF',
                      border: '1px solid rgba(0, 217, 255, 0.25)',
                    }}
                  >
                    MODULE 11
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Loading Seaport</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cargo.origin_port.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      UN/LOCODE: <code>{cargo.origin_port.unlocode || 'N/A'}</code> ({cargo.origin_port.country})
                    </div>
                    {cargo.pickup_location && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Berth: {cargo.pickup_location}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Discharge Seaport</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cargo.destination_port.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      UN/LOCODE: <code>{cargo.destination_port.unlocode || 'N/A'}</code> ({cargo.destination_port.country})
                    </div>
                    {cargo.delivery_location && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Berth: {cargo.delivery_location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Module 11 Route Calculation Status / Results */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                  {calcRoute ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Calculated Maritime Distance</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-accent)' }}>
                            {calcRoute.distance_nm.toLocaleString()} NM{' '}
                            <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                              ({calcRoute.distance_km.toLocaleString()} km)
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Compass size={13} />}
                          onClick={() => {
                            onClose();
                            navigate('/routes');
                          }}
                        >
                          View Corridor on Map
                        </Button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF' }}>
                          {calcRoute.route_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span>&bull;</span>
                        <span>
                          {calcRoute.waypoints.length} chokepoint waypoint{calcRoute.waypoints.length === 1 ? '' : 's'}
                        </span>
                        <span>&bull;</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Feasible</span>
                      </div>

                      {calcRoute.restrictions && calcRoute.restrictions.length > 0 && (
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '11px',
                            color: '#f59e0b',
                          }}
                        >
                          {calcRoute.restrictions[0]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Maritime Route Feasibility
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {cargo.matched_vessel ? `Evaluate route for ${cargo.matched_vessel.vessel_name}` : 'Calculate distance & transit corridors'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Compass size={14} />}
                        disabled={isCalculating}
                        onClick={handleTriggerRouteCalc}
                      >
                        {isCalculating ? 'Calculating...' : 'Calculate Route'}
                      </Button>
                    </div>
                  )}

                  {calcError && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                      {calcError}
                    </div>
                  )}

                  {/* Module 12 Cost Calculation Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    {!cost ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Voyage Cost Engine
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Authoritative fuel burn, operating cost, and cost per tonne
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<DollarSign size={14} />}
                          disabled={isCalculatingCost}
                          onClick={() => handleTriggerCostCalc()}
                        >
                          {isCalculatingCost ? 'Calculating voyage cost...' : 'Calculate Cost'}
                        </Button>
                      </div>
                    ) : (
                      <VoyageCostPanel
                        cost={cost}
                        isLoading={isCalculatingCost}
                        onRecalculateWithScenario={(bunker, hire) => handleTriggerCostCalc(bunker, hire)}
                      />
                    )}

                    {costError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {costError}
                      </div>
                    )}
                  </div>

                  {/* Module 16 XGBoost ML Cost Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    {!mlCost ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            XGBoost ML Cost Engine
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Machine learning voyage transportation cost with baseline economic comparison
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<BrainCircuit size={14} />}
                          disabled={isPredictingMlCost}
                          onClick={() => handleTriggerMlCost()}
                        >
                          {isPredictingMlCost ? 'Predicting ML Cost...' : 'Predict ML Cost'}
                        </Button>
                      </div>
                    ) : (
                      <MlCostPanel
                        prediction={mlCost}
                        isLoading={isPredictingMlCost}
                        onPredict={() => handleTriggerMlCost()}
                      />
                    )}

                    {mlCostError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {mlCostError}
                      </div>
                    )}
                  </div>

                  {/* Module 13 ETA Calculation Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    {!eta ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Voyage ETA Engine
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Authoritative baseline arrival date, sailing duration, and speed metrics
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Clock size={14} />}
                          disabled={isCalculatingEta}
                          onClick={() => handleTriggerEtaCalc()}
                        >
                          {isCalculatingEta ? 'Calculating estimated arrival...' : 'Calculate ETA'}
                        </Button>
                      </div>
                    ) : (
                      <EtaResultPanel
                        eta={eta}
                        isLoading={isCalculatingEta}
                        onRecalculateWithDeparture={(dep) => handleTriggerEtaCalc(dep)}
                      />
                    )}

                    {etaError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {etaError}
                      </div>
                    )}
                  </div>

                  {/* Module 15 XGBoost ML ETA Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    {!mlEta ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            XGBoost ML ETA Engine
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            First Machine Learning prediction module with baseline comparative audit
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<BrainCircuit size={14} />}
                          disabled={isPredictingMlEta}
                          onClick={() => handleTriggerMlEta()}
                        >
                          {isPredictingMlEta ? 'Predicting ML ETA...' : 'Predict ML ETA'}
                        </Button>
                      </div>
                    ) : (
                      <MlEtaPanel
                        prediction={mlEta}
                        isLoading={isPredictingMlEta}
                        onPredict={() => handleTriggerMlEta()}
                      />
                    )}

                    {mlEtaError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {mlEtaError}
                      </div>
                    )}
                  </div>

                  {/* Module 17 Maritime Risk Assessment Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    {!riskAssessment ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Maritime Risk Assessment Engine
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Physical canal draft clearance, chokepoints, vessel fit, and deadweight overload audit
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<ShieldAlert size={14} />}
                          disabled={isAssessingRisk}
                          onClick={() => handleTriggerRiskAssess()}
                          style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        >
                          {isAssessingRisk ? 'Assessing Risk...' : 'Assess Voyage Risk'}
                        </Button>
                      </div>
                    ) : (
                      <MaritimeRiskPanel
                        assessment={riskAssessment}
                        isLoading={isAssessingRisk}
                        onAssess={() => handleTriggerRiskAssess()}
                      />
                    )}

                    {riskError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {riskError}
                      </div>
                    )}
                  </div>

                  {/* Module 18 Maritime Recommendation Engine Integration */}
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="#0284c7" /> Maritime Recommendation Engine
                          <span className="badge badge-info" style={{ fontSize: '0.675rem' }}>MCDA v1.0.0</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {recommendations?.recommended_vessel
                            ? `Top match: ${recommendations.recommended_vessel.name} (${recommendations.recommended_vessel.recommendation_score}/100, ${recommendations.recommended_vessel.score_tier})`
                            : 'Multi-criteria decision analysis across fleet capacity fit, voyage cost, speed, and safety'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!recommendations ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Sparkles size={14} />}
                            disabled={isLoadingRecommendations}
                            onClick={() => handleTriggerRecommendations()}
                            style={{ borderColor: 'rgba(2, 132, 199, 0.4)', color: '#0284c7' }}
                          >
                            {isLoadingRecommendations ? 'Optimizing...' : 'Run Recommendations'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Sparkles size={14} />}
                            onClick={() => setActiveTab('vessel')}
                            style={{ borderColor: 'rgba(2, 132, 199, 0.4)', color: '#0284c7' }}
                          >
                            View Decision Analysis ({recommendations.eligible_candidates_count} Eligible)
                          </Button>
                        )}
                      </div>
                    </div>
                    {recommendationError && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                        {recommendationError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Laycan Schedule */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Laycan Scheduling
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Ready Date</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {new Date(cargo.ready_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cancelling Laycan</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {new Date(cargo.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Priority Rating</div>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: cargo.priority === 'urgent' ? '#ef4444' : 'var(--color-text-primary)' }}>
                      {cargo.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRACKING LIFECYCLE TAB */}
          {activeTab === 'tracking' && (
            <div>
              <div style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Operational progression of consignment from multi-channel message ingestion through final discharge:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '7px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    backgroundColor: 'var(--color-border-subtle)',
                  }}
                />

                {cargo.lifecycle_stages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed';
                  const isCurrent = stage.status === 'current';

                  return (
                    <div key={stage.stage} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-23px',
                          top: '2px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#10b981' : isCurrent ? 'var(--color-brand-accent)' : 'var(--color-border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px',
                          boxShadow: '0 0 0 3px var(--color-bg-surface)',
                        }}
                      >
                        {isCompleted && '✓'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: isCurrent ? 700 : 600, fontSize: '0.875rem', color: isCurrent ? 'var(--color-brand-accent)' : 'var(--color-text-primary)' }}>
                          {idx + 1}. {stage.label}
                        </span>
                        {stage.timestamp && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                            {new Date(stage.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {stage.description}
                      </div>
                      {stage.location && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Location: {stage.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. VALIDATION DIAGNOSTICS TAB */}
          {activeTab === 'validation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: cargo.validation_status === 'valid' ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${cargo.validation_status === 'valid' ? '#a7f3d0' : '#fde68a'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {cargo.validation_status === 'valid' ? (
                  <ShieldCheck size={28} color="#10b981" />
                ) : (
                  <AlertTriangle size={28} color="#d97706" />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: cargo.validation_status === 'valid' ? '#065f46' : '#92400e' }}>
                    {cargo.validation_status === 'valid' ? 'Consignment Technical Checks Passed' : 'Validation Attention Required'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: cargo.validation_status === 'valid' ? '#047857' : '#b45309', marginTop: '2px' }}>
                    {cargo.validation_issues.length === 0
                      ? 'Seaport UN/LOCODEs, draft limits, and laycan timing are validated against platform master models.'
                      : `${cargo.validation_issues.length} issue(s) detected that may impact fixture confirmation.`}
                  </div>
                </div>
              </div>

              {cargo.validation_issues.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cargo.validation_issues.map((issue) => (
                    <div
                      key={issue.id}
                      style={{
                        padding: '0.875rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-surface-alt)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {issue.severity === 'error' ? (
                          <AlertCircle size={14} color="#ef4444" />
                        ) : (
                          <AlertTriangle size={14} color="#f59e0b" />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                          Field: <code>{issue.field}</code>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--color-text-primary)' }}>
                        {issue.message}
                      </div>
                      {issue.suggestion && (
                        <div style={{ fontSize: '0.6875rem', marginTop: '4px', color: 'var(--color-text-muted)' }}>
                          <strong>Recommended action:</strong> {issue.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {cargo.validation_status !== 'valid' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => onValidateSingle(cargo.id)}
                  >
                    Manual Override: Mark Verified & Valid
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 4. FLEET MATCHING TAB */}
          {activeTab === 'vessel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cargo.matched_vessel && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                      Currently Allocated Fleet Vessel
                    </span>
                    <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                      {cargo.matched_vessel.vessel_name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {cargo.matched_vessel.imo_number} &middot; {cargo.matched_vessel.vessel_type}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
                        {cargo.matched_vessel.match_score}%
                      </div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Current Match</div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Radio size={13} color="#00D9FF" />}
                      onClick={() => {
                        onClose();
                        navigate(`/tracking?vesselId=${cargo.matched_vessel?.vessel_id}`);
                      }}
                      style={{ borderColor: 'rgba(0, 217, 255, 0.4)', color: '#00D9FF' }}
                    >
                      Track Vessel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ color: '#ef4444' }}
                      onClick={() => onUnmatchVessel(cargo.id)}
                    >
                      Remove Allocation
                    </Button>
                  </div>
                </div>
              )}

              {/* Module 18 Recommendation Engine Panel */}
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
                onInitiateBooking={(vessel) => {
                  setBookingVessel(vessel);
                  setIsBookingModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Module 19 Booking Review & Confirmation Modal */}
          {isBookingModalOpen && cargo && bookingVessel && (
            <BookingReviewModal
              isOpen={isBookingModalOpen}
              onClose={() => setIsBookingModalOpen(false)}
              cargo={cargo}
              selectedVessel={bookingVessel}
              recommendations={recommendations}
              onBookingSuccess={(b) => {
                console.log('[CargoDetailDrawer] Booking successfully persisted:', b);
              }}
            />
          )}

          {/* 5. AUDIT TRAIL TAB */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cargo.activity_log.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                      {item.action}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {item.note}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-brand-accent)', marginTop: '2px' }}>
                    Operator: {item.user}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
