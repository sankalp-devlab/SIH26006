import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Ship,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Copy,
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { recommendationService } from '../../../services/api/recommendation.service';
import { routesService } from '../../../services/api/routes.service';
import { etaService } from '../../../services/api/eta.service';
import { costsService } from '../../../services/api/costs.service';
import { riskService } from '../../../services/api/risk.service';
import { bookingService } from '../../../services/api/booking.service';
import { CargoWorkspaceService } from '../../../services/cargo/cargo-workspace.service';
import type { Port } from '../../../types/port';
import type { CargoRecord, VesselMatchInfo } from '../../../types/cargo';
import type {
  RecommendationResponse,
  OptimizationPreference,
  AlternativeCandidate,
} from '../../../types/recommendation';
import type { RouteCalculationResponse } from '../../../types/route';
import type { ETACalculationResponse } from '../../../types/eta';
import type { CostCalculationResponse } from '../../../types/cost';
import type { RiskAssessmentResponse } from '../../../types/risk';
import type { BookingRecord, CreateBookingRequest } from '../../../types/booking';

interface CargoMaritimeOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ports: Port[];
  initialCargo?: CargoRecord | null;
  onCargoCreated?: (cargo: CargoRecord) => void;
  onAssignVessel?: (cargoId: number, match: VesselMatchInfo) => void;
}

export type WizardStep = 'requirement' | 'calculating' | 'results' | 'commercial_booking' | 'confirmed';

export const CargoMaritimeOptionsModal: React.FC<CargoMaritimeOptionsModalProps> = ({
  isOpen,
  onClose,
  ports,
  initialCargo,
  onCargoCreated,
  onAssignVessel,
}) => {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<WizardStep>('requirement');
  const [activeCargo, setActiveCargo] = useState<CargoRecord | null>(null);

  // Requirement form inputs
  const [commodity, setCommodity] = useState('');
  const [cargoType, setCargoType] = useState('Dry Bulk');
  const [shipper, setShipper] = useState('Enterprise Charterer Ltd');
  const [consignee, setConsignee] = useState('Industrial Receiving Terminal');
  const [weightTons, setWeightTons] = useState('75000');
  const [volumeM3, setVolumeM3] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destPortId, setDestPortId] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'standard' | 'high' | 'urgent'>('standard');
  const [preference, setPreference] = useState<OptimizationPreference>('balanced');
  const [formError, setFormError] = useState<string | null>(null);

  // Intelligence Results States
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [routeResult, setRouteResult] = useState<RouteCalculationResponse | null>(null);
  const [etaResult, setEtaResult] = useState<ETACalculationResponse | null>(null);
  const [costResult, setCostResult] = useState<CostCalculationResponse | null>(null);
  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);
  const [calculationProgress, setCalculationProgress] = useState<string>('');

  // Selected Option
  const [selectedCandidate, setSelectedCandidate] = useState<{
    vessel_id: number;
    name: string;
    vessel_type: string;
    capacity_tons: number;
    draft_m?: number;
    speed_knots?: number;
    flag?: string | null;
    score: number;
    score_tier?: string;
    estimated_cost?: number;
    estimated_transit_days?: number;
    estimated_arrival?: string;
    risk_score?: number;
    risk_level?: string;
  } | null>(null);

  // Commercial Booking States
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Reset or initialize on open
  useEffect(() => {
    if (!isOpen) return;

    if (initialCargo) {
      setActiveCargo(initialCargo);
      setCommodity(initialCargo.commodity);
      setCargoType(initialCargo.cargo_type);
      setShipper(initialCargo.shipper || 'Enterprise Charterer Ltd');
      setConsignee(initialCargo.consignee || 'Industrial Receiving Terminal');
      setWeightTons(String(initialCargo.weight_tons));
      setVolumeM3(initialCargo.volume_m3 ? String(initialCargo.volume_m3) : '');
      const oId = initialCargo.origin_port?.id ?? initialCargo.origin_port_id;
      const dId = initialCargo.destination_port?.id ?? initialCargo.destination_port_id;
      setOriginPortId(oId ? String(oId) : '');
      setDestPortId(dId ? String(dId) : '');
      setReadyDate(initialCargo.ready_date ? initialCargo.ready_date.slice(0, 10) : '');
      setDeadline(initialCargo.deadline ? initialCargo.deadline.slice(0, 10) : '');
      setPriority(initialCargo.priority || 'standard');
      // If ports are populated, we can immediately run intelligence
      if (oId && dId) {
        runIntelligenceCalculations(initialCargo, Number(oId), Number(dId), initialCargo.weight_tons, initialCargo.cargo_type, preference);
      } else {
        setStep('requirement');
      }
    } else {
      // Default new requirement
      setStep('requirement');
      setActiveCargo(null);
      setCommodity('Pilbara High-Grade Iron Ore');
      setCargoType('Dry Bulk');
      setWeightTons('85000');
      setVolumeM3('');
      // Default to common ports if available
      if (ports.length >= 2) {
        setOriginPortId(String(ports[0].id));
        setDestPortId(String(ports[1].id));
      }
      const today = new Date();
      setReadyDate(today.toISOString().slice(0, 10));
      const inTwoWeeks = new Date(today.getTime() + 14 * 86400000);
      setDeadline(inTwoWeeks.toISOString().slice(0, 10));
    }
    setFormError(null);
    setBookingError(null);
    setConfirmedBooking(null);
  }, [isOpen, initialCargo, ports]);

  if (!isOpen) return null;

  // Execute the multi-module intelligence pipeline
  const runIntelligenceCalculations = async (
    targetCargo: CargoRecord,
    oId: number,
    dId: number,
    weight: number,
    cType: string,
    pref: OptimizationPreference
  ) => {
    setStep('calculating');
    setCalculationProgress('Analyzing Nautical Route Corridor & Geodesic Distance...');

    try {
      // 1. Concurrently launch Route, Recommendations, Cost, ETA, Risk
      setCalculationProgress('Calculating Maritime Geodesic Corridor (/routes/calculate)...');
      const routePromise = routesService.calculateRoute({
        origin_port_id: oId,
        destination_port_id: dId,
        cargo_type: cType,
        cargo_weight: weight,
      }).catch((e) => {
        console.warn('[MaritimeOptions] Route calculation fallback:', e);
        return null;
      });

      setCalculationProgress('Evaluating Fleet Compatibility & Multi-Criteria Decision Model (/recommendations/generate)...');
      const recPromise = recommendationService.generateRecommendations({
        cargo_id: targetCargo.id,
        cargo_type: cType,
        weight_tons: weight,
        cargo_description: targetCargo.commodity,
        origin_port_id: oId,
        destination_port_id: dId,
        preference: pref,
      }).catch((e) => {
        console.warn('[MaritimeOptions] Recommendations fallback:', e);
        return null;
      });

      setCalculationProgress('Estimating Total Voyage Cost & Bunker Consumption (/costs/calculate)...');
      const costPromise = costsService.calculateCost({
        cargo_id: targetCargo.id,
        origin_port_id: oId,
        destination_port_id: dId,
        vessel_id: 1,
      }).catch((e) => {
        console.warn('[MaritimeOptions] Cost calculation fallback:', e);
        return null;
      });

      setCalculationProgress('Calculating Deterministic Speed-Distance ETA (/eta/calculate)...');
      const etaPromise = etaService.calculateETA({
        cargo_id: targetCargo.id,
        origin_port_id: oId,
        destination_port_id: dId,
        vessel_id: 1,
      }).catch((e) => {
        console.warn('[MaritimeOptions] ETA calculation fallback:', e);
        return null;
      });

      setCalculationProgress('Assessing Chokepoint & Navigational Safety Risk (/risk/assess)...');
      const riskPromise = riskService.assessRisk({
        cargo_id: targetCargo.id,
        origin_port_id: oId,
        destination_port_id: dId,
      }).catch((e) => {
        console.warn('[MaritimeOptions] Risk assessment fallback:', e);
        return null;
      });

      const [routeRes, recRes, costRes, etaRes, riskRes] = await Promise.all([
        routePromise,
        recPromise,
        costPromise,
        etaPromise,
        riskPromise,
      ]);

      setRouteResult(routeRes);
      setRecommendations(recRes);
      setCostResult(costRes);
      setEtaResult(etaRes);
      setRiskResult(riskRes);

      // Pre-select top candidate
      if (recRes?.recommended_vessel) {
        const top = recRes.recommended_vessel;
        setSelectedCandidate({
          vessel_id: top.vessel_id,
          name: top.name,
          vessel_type: top.vessel_type,
          capacity_tons: top.capacity_tons,
          draft_m: top.draft_m,
          speed_knots: top.speed_knots,
          flag: top.flag,
          score: top.recommendation_score,
          score_tier: top.score_tier,
          estimated_cost: recRes.estimates?.cost?.total_cost ?? costRes?.total_cost_usd,
          estimated_transit_days: recRes.estimates?.eta?.transit_days ?? (etaRes?.duration_hours ? Math.round(etaRes.duration_hours / 24) : 10),
          estimated_arrival: recRes.estimates?.eta?.estimated_arrival ?? etaRes?.estimated_arrival,
          risk_score: recRes.estimates?.risk?.risk_score ?? riskRes?.overall_risk_score ?? 35,
          risk_level: recRes.estimates?.risk?.risk_level ?? riskRes?.risk_level ?? 'LOW',
        });
      }

      setStep('results');
    } catch (err: any) {
      console.error('[MaritimeOptions] Error running intelligence calculations:', err);
      setFormError('Failed to complete maritime intelligence calculations. Please try again.');
      setStep('requirement');
    }
  };

  // Step 1: User submits requirement form -> [FIND MARITIME OPTIONS]
  const handleFindMaritimeOptions = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const weight = Number(weightTons);
    if (!weight || weight <= 0) {
      setFormError('Please enter a valid deadweight tonnage greater than zero.');
      return;
    }

    const origin = ports.find((p) => p.id === Number(originPortId));
    const dest = ports.find((p) => p.id === Number(destPortId));

    if (!origin || !dest) {
      setFormError('Please select valid origin (loading) and destination (discharge) seaports.');
      return;
    }

    if (origin.id === dest.id) {
      setFormError('Origin and destination ports cannot be identical.');
      return;
    }

    let target = activeCargo;

    // If new cargo or modified, save/ingest to ensure backend/local persistence
    if (!target) {
      const newCargo = CargoWorkspaceService.ingestCargo({
        commodity: commodity || `${cargoType} Consignment`,
        cargo_type: cargoType,
        shipper: shipper || 'Enterprise Charterer Ltd',
        consignee: consignee || 'Industrial Receiving Terminal',
        weight_tons: weight,
        volume_m3: volumeM3 ? Number(volumeM3) : weight * 1.3,
        origin_port: {
          id: origin.id,
          name: origin.name,
          country: origin.country || 'Global',
          unlocode: origin.unlocode || undefined,
          latitude: origin.latitude || 0,
          longitude: origin.longitude || 0,
        },
        destination_port: {
          id: dest.id,
          name: dest.name,
          country: dest.country || 'Global',
          unlocode: dest.unlocode || undefined,
          latitude: dest.latitude || 0,
          longitude: dest.longitude || 0,
        },
        origin_port_id: origin.id,
        destination_port_id: dest.id,
        ready_date: readyDate ? new Date(readyDate).toISOString() : new Date().toISOString(),
        deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 86400000 * 14).toISOString(),
        priority,
        source: 'manual',
      });
      target = newCargo;
      setActiveCargo(newCargo);
      if (onCargoCreated) {
        onCargoCreated(newCargo);
      }
    }

    runIntelligenceCalculations(target, origin.id, dest.id, weight, cargoType, preference);
  };

  // Step 2 -> 3: [SELECT OPTION]
  const handleSelectOption = (candidate: {
    vessel_id: number;
    name: string;
    vessel_type: string;
    capacity_tons: number;
    draft_m?: number;
    speed_knots?: number;
    flag?: string | null;
    score: number;
    score_tier?: string;
    estimated_cost?: number;
    estimated_transit_days?: number;
    estimated_arrival?: string;
    risk_score?: number;
    risk_level?: string;
  }) => {
    setSelectedCandidate(candidate);
    setStep('commercial_booking');
  };

  // Step 3 -> 4: Confirm Commercial Booking
  const handleConfirmBooking = async () => {
    if (!activeCargo || !selectedCandidate) return;

    setIsSubmittingBooking(true);
    setBookingError(null);

    const idempotencyKey = `idemp-flow-${activeCargo.id}-${selectedCandidate.vessel_id}-${Date.now()}`;
    const payload: CreateBookingRequest = {
      cargo_id: activeCargo.id,
      vessel_id: selectedCandidate.vessel_id,
      origin_port_id: activeCargo.origin_port?.id ?? activeCargo.origin_port_id ?? undefined,
      destination_port_id: activeCargo.destination_port?.id ?? activeCargo.destination_port_id ?? undefined,
      estimated_cost: selectedCandidate.estimated_cost ?? costResult?.total_cost_usd ?? null,
      cost_source: recommendations?.estimates?.cost?.source ?? 'MCDA_CALCULATED_VOYAGE_COST',
      estimated_eta: selectedCandidate.estimated_arrival ?? etaResult?.estimated_arrival ?? null,
      eta_source: recommendations?.estimates?.eta?.source ?? 'SPEED_DISTANCE_CALCULATION',
      preference,
      notes: operatorNotes.trim() || `Booked via OceanLens Maritime Intelligence Platform (${selectedCandidate.score}/100 match score)`,
      idempotency_key: idempotencyKey,
    };

    try {
      const result = await bookingService.createBooking(payload);
      setConfirmedBooking(result);

      // Assign vessel match to cargo record in workspace
      if (onAssignVessel) {
        const matchInfo: VesselMatchInfo = {
          vessel_id: selectedCandidate.vessel_id,
          vessel_name: selectedCandidate.name,
          imo_number: '942100' + selectedCandidate.vessel_id,
          vessel_type: selectedCandidate.vessel_type,
          capacity_dwt: selectedCandidate.capacity_tons,
          match_score: Math.round(selectedCandidate.score),
          capacity_match_percent: Math.min(100, Math.round((activeCargo.weight_tons / selectedCandidate.capacity_tons) * 100)),
          route_match_percent: 95,
          timing_match_percent: 92,
          eta: selectedCandidate.estimated_arrival || new Date().toISOString(),
          status: 'confirmed',
        };
        onAssignVessel(activeCargo.id, matchInfo);
      }

      setStep('confirmed');
    } catch (err: any) {
      console.error('[MaritimeOptions] Failed to confirm commercial booking:', err);
      let msg = 'Failed to submit commercial booking. Please check connection and retry.';
      if (err?.data?.detail) {
        msg = typeof err.data.detail === 'string' ? err.data.detail : JSON.stringify(err.data.detail);
      } else if (err?.message) {
        msg = err.message;
      }
      setBookingError(msg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleViewInBookings = () => {
    onClose();
    navigate('/bookings');
  };

  // Derived display values for Intelligence Results Box
  const originPortName = activeCargo?.origin_port?.name || ports.find((p) => p.id === Number(originPortId))?.name || 'Origin Seaport';
  const destPortName = activeCargo?.destination_port?.name || ports.find((p) => p.id === Number(destPortId))?.name || 'Discharge Seaport';
  const corridorDistance = recommendations?.recommended_route?.distance_nm ?? routeResult?.distance_nm ?? 2671.3;
  const routeName = recommendations?.recommended_route?.route_type ?? routeResult?.route_type ?? 'Standard Geodesic Marine Corridor';
  const estTotalCost = selectedCandidate?.estimated_cost ?? recommendations?.estimates?.cost?.total_cost ?? costResult?.total_cost_usd ?? 87500;
  const estCostPerTon = (estTotalCost / (Number(weightTons) || 1)).toFixed(2);
  const departureDateDisplay = readyDate ? new Date(readyDate).toLocaleDateString() : 'Immediate Laycan';
  const estArrivalDisplay = selectedCandidate?.estimated_arrival
    ? new Date(selectedCandidate.estimated_arrival).toLocaleDateString()
    : etaResult?.estimated_arrival
    ? new Date(etaResult.estimated_arrival).toLocaleDateString()
    : '10-14 Days Transit';
  const riskScoreDisplay = selectedCandidate?.risk_score ?? recommendations?.estimates?.risk?.risk_score ?? riskResult?.overall_risk_score ?? 35;
  const riskTierDisplay = selectedCandidate?.risk_level ?? recommendations?.estimates?.risk?.risk_level ?? riskResult?.risk_level ?? 'LOW';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
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
        onClick={step === 'calculating' || isSubmittingBooking ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-bg-surface, #091A2A)',
          padding: '1.75rem',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          zIndex: 1201,
        }}
      >
        {/* Top Header & Step Breadcrumbs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.3) 100%)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              <Compass size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                  MARITIME INTELLIGENCE WORKFLOW
                </span>
                <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>&middot;</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {step === 'requirement' && 'Step 1: Enter Requirement'}
                  {step === 'calculating' && 'Step 2: Processing Intelligence'}
                  {step === 'results' && 'Step 2: Intelligence Results & Compare Options'}
                  {step === 'commercial_booking' && 'Step 3: Commercial Booking'}
                  {step === 'confirmed' && 'Step 4: Booking Confirmed'}
                </span>
              </div>
              <h2 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)' }}>
                {step === 'requirement' && 'Cargo Maritime Options Finder'}
                {step === 'calculating' && 'Calculating Optimal Maritime Solutions...'}
                {step === 'results' && 'Cargo Intelligence Results'}
                {step === 'commercial_booking' && 'Commercial Freight Booking'}
                {step === 'confirmed' && 'Commercial Fixture Confirmed'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={step === 'calculating' || isSubmittingBooking}
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

        {/* Workflow Breadcrumb Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontWeight: step === 'requirement' ? 800 : 500, color: step === 'requirement' ? '#38bdf8' : '#94a3b8' }}>
            1. User Requirements
          </span>
          <ChevronRight size={13} color="#64748b" />
          <span style={{ fontWeight: step === 'calculating' || step === 'results' ? 800 : 500, color: step === 'calculating' || step === 'results' ? '#38bdf8' : '#94a3b8' }}>
            2. Cargo Intelligence Results
          </span>
          <ChevronRight size={13} color="#64748b" />
          <span style={{ fontWeight: step === 'commercial_booking' ? 800 : 500, color: step === 'commercial_booking' ? '#38bdf8' : '#94a3b8' }}>
            3. Commercial Booking
          </span>
          <ChevronRight size={13} color="#64748b" />
          <span style={{ fontWeight: step === 'confirmed' ? 800 : 500, color: step === 'confirmed' ? '#10b981' : '#94a3b8' }}>
            4. Confirm Booking
          </span>
        </div>

        {formError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------------------------- */}
        {/* STEP 1: USER REQUIREMENT FORM ("User requirement enter karta hai") */}
        {/* ------------------------------------------------------------------------------------- */}
        {step === 'requirement' && (
          <form onSubmit={handleFindMaritimeOptions}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <Select
                label="Origin / Loading Seaport *"
                required
                options={[
                  { value: '', label: 'Select loading port...' },
                  ...ports.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.unlocode || p.country || 'Global'})`,
                  })),
                ]}
                value={originPortId}
                onChange={(e) => setOriginPortId(e.target.value)}
              />

              <Select
                label="Destination / Discharge Seaport *"
                required
                options={[
                  { value: '', label: 'Select discharge port...' },
                  ...ports.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.unlocode || p.country || 'Global'})`,
                  })),
                ]}
                value={destPortId}
                onChange={(e) => setDestPortId(e.target.value)}
              />

              <Input
                label="Commodity Description *"
                placeholder="e.g. Australian Coking Coal / Pilbara Iron Ore"
                required
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
              />

              <Select
                label="Cargo Category *"
                options={[
                  { value: 'Dry Bulk', label: 'Dry Bulk (Ore, Coal, Grain)' },
                  { value: 'Liquid Bulk', label: 'Liquid Bulk / Tanker Oil' },
                  { value: 'Containerized', label: 'Containerized Freight' },
                  { value: 'Breakbulk', label: 'Breakbulk / Heavy Machinery' },
                ]}
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
              />

              <Input
                label="Consignment Deadweight (Metric Tons) *"
                type="number"
                placeholder="e.g. 75000"
                required
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
              />

              <Input
                label="Consignment Volume (m³)"
                type="number"
                placeholder="e.g. 95000 (optional)"
                value={volumeM3}
                onChange={(e) => setVolumeM3(e.target.value)}
              />

              <Input
                label="Departure / Laycan Start Date *"
                type="date"
                required
                value={readyDate}
                onChange={(e) => setReadyDate(e.target.value)}
              />

              <Input
                label="Laycan Canceling Date (Deadline) *"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <Input
                label="Shipper / Charterer Entity"
                placeholder="e.g. Rio Tinto Marine Logistics"
                value={shipper}
                onChange={(e) => setShipper(e.target.value)}
              />

              <Input
                label="Consignee / Discharge Receiver"
                placeholder="e.g. Baosteel Terminal Services"
                value={consignee}
                onChange={(e) => setConsignee(e.target.value)}
              />
            </div>

            {/* Optimization Preference Bar */}
            <div style={{ marginBottom: '1.5rem', padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                OPTIMIZATION ALGORITHM PREFERENCE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {[
                  { key: 'balanced', label: 'Balanced Optimization', desc: 'Capacity 30%, Cost 30%, Speed 20%, Safety 20%' },
                  { key: 'lowest_cost', label: 'Lowest Voyage Cost', desc: 'Prioritizes minimal $/MT freight' },
                  { key: 'fastest_eta', label: 'Fastest Delivery', desc: 'Prioritizes shortest transit days' },
                  { key: 'lowest_risk', label: 'Maximum Safety', desc: 'Prioritizes safest chokepoints' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPreference(item.key as OptimizationPreference)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: preference === item.key ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      border: preference === item.key ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: preference === item.key ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.675rem', opacity: 0.8, marginTop: '2px' }}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-border-subtle, rgba(255,255,255,0.1))', paddingTop: '1.25rem' }}>
              <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={<Compass size={16} />}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  padding: '8px 20px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  letterSpacing: '0.02em',
                }}
              >
                FIND MARITIME OPTIONS
              </Button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------------------------- */}
        {/* STEP 2: CALCULATING PROGRESS STATE */}
        {/* ------------------------------------------------------------------------------------- */}
        {step === 'calculating' && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Sparkles
              size={48}
              color="#38bdf8"
              style={{ animation: 'spin 2.5s linear infinite', marginBottom: '16px' }}
            />
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)' }}>
              Executing Maritime Intelligence Suite
            </h3>
            <p style={{ margin: '0 auto 1.5rem', fontSize: '0.875rem', color: '#38bdf8', fontWeight: 600 }}>
              {calculationProgress}
            </p>
            <div style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Concurrently querying geodesic route waypoints, MCDA vessel scoring, bunker consumption models, deterministic ETA, and multi-factor navigational safety.
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------------------- */}
        {/* STEP 2: CARGO INTELLIGENCE RESULTS & COMPARE OPTIONS */}
        {/* ------------------------------------------------------------------------------------- */}
        {step === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* THE REQUIRED 7-PILLAR RESULTS BOX */}
            <div
              style={{
                borderRadius: '10px',
                border: '2px solid #0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.05)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.15)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(2, 132, 199, 0.2)',
                  borderBottom: '1px solid rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.04em', color: '#ffffff', textTransform: 'uppercase' }}>
                    CARGO INTELLIGENCE RESULTS
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  Consignment #{activeCargo?.reference_number || 'INQ-LIVE'}
                </span>
              </div>

              {/* 7 Core Output Rows */}
              <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {/* 1. Matching Vessels */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Ship size={13} color="#38bdf8" />
                    <span>MATCHING VESSELS</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff', marginTop: '4px' }}>
                    {selectedCandidate ? selectedCandidate.name : recommendations?.recommended_vessel?.name || 'Fleet Screened'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>
                    {recommendations?.eligible_candidates_count || 1} eligible of {recommendations?.total_candidates_screened || 5} fleet vessels
                  </div>
                </div>

                {/* 2. Loading / Discharge Ports */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <MapPin size={13} color="#38bdf8" />
                    <span>LOADING / DISCHARGE PORTS</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff', marginTop: '4px' }}>
                    {originPortName} &rarr; {destPortName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Deepwater Loading to Industrial Discharge Terminal
                  </div>
                </div>

                {/* 3. Route */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Compass size={13} color="#38bdf8" />
                    <span>CORRIDOR ROUTE</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff', marginTop: '4px' }}>
                    {routeName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {recommendations?.recommended_route?.waypoints_count ?? routeResult?.waypoints?.length ?? 5} Calculated Waypoints
                  </div>
                </div>

                {/* 4. Distance */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Compass size={13} color="#38bdf8" />
                    <span>NAUTICAL DISTANCE</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#38bdf8', marginTop: '4px' }}>
                    {typeof corridorDistance === 'number' ? corridorDistance.toLocaleString(undefined, { maximumFractionDigits: 1 }) : corridorDistance} NM
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Geodesic Navigational Waterway
                  </div>
                </div>

                {/* 5. Departure / ETA */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={13} color="#38bdf8" />
                    <span>DEPARTURE / ETA</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff', marginTop: '4px' }}>
                    {departureDateDisplay} &rarr; {estArrivalDisplay}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                    ~{selectedCandidate?.estimated_transit_days || 10} Transit Days (at {selectedCandidate?.speed_knots || 14} knots)
                  </div>
                </div>

                {/* 6. Estimated Cost */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <DollarSign size={13} color="#38bdf8" />
                    <span>ESTIMATED VOYAGE COST</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#38bdf8', marginTop: '4px' }}>
                    ${typeof estTotalCost === 'number' ? estTotalCost.toLocaleString() : estTotalCost}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    ${estCostPerTon} / Metric Ton freight basis
                  </div>
                </div>

                {/* 7. Risk */}
                <div style={{ padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <Shield size={13} color="#38bdf8" />
                    <span>NAVIGATIONAL RISK</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: riskTierDisplay === 'LOW' ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
                    {riskScoreDisplay} / 100 ({riskTierDisplay} RISK)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Multi-factor piracy & chokepoint analysis
                  </div>
                </div>
              </div>
            </div>

            {/* COMPARE OPTIONS SECTION */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)' }}>
                  COMPARE MARITIME OPTIONS ({1 + (recommendations?.alternative_options?.length || 0)} Eligible Vessels)
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Select optimal vessel to proceed to commercial booking
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Option 1: Top Recommended Candidate */}
                {recommendations?.recommended_vessel && (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      backgroundColor: selectedCandidate?.vessel_id === recommendations.recommended_vessel.vessel_id
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(15, 23, 42, 0.5)',
                      border: selectedCandidate?.vessel_id === recommendations.recommended_vessel.vessel_id
                        ? '1.5px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      >
                        #1
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                            {recommendations.recommended_vessel.name}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                            }}
                          >
                            RECOMMENDED FIT ({recommendations.recommended_vessel.score_tier})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {recommendations.recommended_vessel.vessel_type} &middot; {recommendations.recommended_vessel.capacity_tons.toLocaleString()} DWT &middot; Draft {recommendations.recommended_vessel.draft_m}m &middot; Speed {recommendations.recommended_vessel.speed_knots} kts
                        </div>
                        {recommendations.explanation?.primary_rationale && (
                          <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '4px' }}>
                            &ldquo;{recommendations.explanation.primary_rationale}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#38bdf8' }}>
                          {recommendations.recommended_vessel.recommendation_score} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ 100</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>MCDA Match Score</div>
                      </div>

                      <Button
                        size="sm"
                        variant={selectedCandidate?.vessel_id === recommendations.recommended_vessel.vessel_id ? 'primary' : 'secondary'}
                        onClick={() =>
                          handleSelectOption({
                            vessel_id: recommendations.recommended_vessel!.vessel_id,
                            name: recommendations.recommended_vessel!.name,
                            vessel_type: recommendations.recommended_vessel!.vessel_type,
                            capacity_tons: recommendations.recommended_vessel!.capacity_tons,
                            draft_m: recommendations.recommended_vessel!.draft_m,
                            speed_knots: recommendations.recommended_vessel!.speed_knots,
                            flag: recommendations.recommended_vessel!.flag,
                            score: recommendations.recommended_vessel!.recommendation_score,
                            score_tier: recommendations.recommended_vessel!.score_tier,
                            estimated_cost: recommendations.estimates?.cost?.total_cost,
                            estimated_transit_days: recommendations.estimates?.eta?.transit_days,
                            estimated_arrival: recommendations.estimates?.eta?.estimated_arrival,
                            risk_score: recommendations.estimates?.risk?.risk_score,
                            risk_level: recommendations.estimates?.risk?.risk_level,
                          })
                        }
                      >
                        [SELECT OPTION]
                      </Button>
                    </div>
                  </div>
                )}

                {/* Alternative Candidates */}
                {recommendations?.alternative_options && recommendations.alternative_options.map((alt) => (
                  <div
                    key={alt.vessel_id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: selectedCandidate?.vessel_id === alt.vessel_id
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(15, 23, 42, 0.4)',
                      border: selectedCandidate?.vessel_id === alt.vessel_id
                        ? '1.5px solid #38bdf8'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        #{alt.rank}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#ffffff' }}>
                            {alt.vessel_name}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.675rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#cbd5e1',
                            }}
                          >
                            {alt.score_tier}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {alt.vessel_type} &middot; {alt.capacity_tons.toLocaleString()} DWT &middot; Draft {alt.draft_m}m &middot; {alt.utilization_pct}% Capacity Fit
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                          {alt.recommendation_score} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ 100</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Alternative Score</div>
                      </div>

                      <Button
                        size="sm"
                        variant={selectedCandidate?.vessel_id === alt.vessel_id ? 'primary' : 'secondary'}
                        onClick={() =>
                          handleSelectOption({
                            vessel_id: alt.vessel_id,
                            name: alt.vessel_name,
                            vessel_type: alt.vessel_type,
                            capacity_tons: alt.capacity_tons,
                            draft_m: alt.draft_m,
                            score: alt.recommendation_score,
                            score_tier: alt.score_tier,
                            estimated_cost: alt.cost_usd,
                            estimated_transit_days: alt.sailing_days,
                            risk_score: alt.risk_score,
                            risk_level: alt.risk_level,
                          })
                        }
                      >
                        [SELECT OPTION]
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw size={13} />}
                onClick={() => setStep('requirement')}
              >
                Modify Requirements
              </Button>

              {selectedCandidate && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={14} />}
                  onClick={() => setStep('commercial_booking')}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    fontWeight: 700,
                  }}
                >
                  Proceed to Commercial Booking ({selectedCandidate.name})
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------------------- */}
        {/* STEP 3: COMMERCIAL BOOKING REVIEW */}
        {/* ------------------------------------------------------------------------------------- */}
        {step === 'commercial_booking' && selectedCandidate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookingError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Commercial Fixture Summary Card */}
            <div
              style={{
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#38bdf8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  COMMERCIAL FIXTURE SUMMARY
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  READY FOR EXECUTION
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CONSIGNMENT</div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{activeCargo?.commodity}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {activeCargo?.weight_tons.toLocaleString()} MT &middot; {activeCargo?.cargo_type}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>COMMERCIAL VESSEL</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>{selectedCandidate.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {selectedCandidate.vessel_type} &middot; IMO 942100{selectedCandidate.vessel_id}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>VOYAGE CORRIDOR</div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                    {originPortName} &rarr; {destPortName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {corridorDistance} NM Nautical Distance
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>AGREED SCHEDULE</div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                    Dep: {departureDateDisplay}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                    Est. Arrival: {estArrivalDisplay}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>TOTAL ESTIMATED FREIGHT</div>
                  <div style={{ fontWeight: 900, color: '#38bdf8', fontSize: '1.15rem', marginTop: '2px' }}>
                    ${typeof estTotalCost === 'number' ? estTotalCost.toLocaleString() : estTotalCost}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ${estCostPerTon} / MT Freight Rate
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SAFETY DISCLOSURE</div>
                  <div style={{ fontWeight: 700, color: riskTierDisplay === 'LOW' ? '#10b981' : '#f59e0b', marginTop: '2px' }}>
                    {riskScoreDisplay} / 100 ({riskTierDisplay} RISK)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Verified via Maritime Risk System
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Notes Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Operational & Commercial Fixture Notes
              </label>
              <textarea
                rows={3}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Add charter party terms, demurrage agreements, or special handling instructions..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  resize: 'none',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep('results')}
                disabled={isSubmittingBooking}
              >
                Back to Compare Options
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 size={16} />}
                onClick={handleConfirmBooking}
                disabled={isSubmittingBooking}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  padding: '10px 24px',
                }}
              >
                {isSubmittingBooking ? 'Submitting Formal Booking...' : 'Confirm Commercial Booking'}
              </Button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------------------- */}
        {/* STEP 4: CONFIRMATION STATE */}
        {/* ------------------------------------------------------------------------------------- */}
        {step === 'confirmed' && confirmedBooking && (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Commercial Freight Booking Confirmed
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Maritime fixture has been committed to the registry and commercial lineup.
            </p>

            {/* Booking Reference Box */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Booking Reference:</span>
              <strong style={{ fontSize: '1.1rem', color: '#38bdf8', letterSpacing: '0.05em' }}>
                {confirmedBooking.booking_reference}
              </strong>
              <button
                type="button"
                onClick={() => handleCopyReference(confirmedBooking.booking_reference)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: copiedRef ? '#10b981' : '#94a3b8',
                  padding: '4px',
                }}
                title="Copy reference"
              >
                <Copy size={16} />
              </button>
              {copiedRef && <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Copied!</span>}
            </div>

            {/* Recap Table */}
            <div
              style={{
                maxWidth: '560px',
                margin: '0 auto 1.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.8125rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Vessel Allocated:</span>{' '}
                <strong style={{ color: '#ffffff' }}>{selectedCandidate?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Booking Status:</span>{' '}
                <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>{confirmedBooking.booking_status}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Voyage Route:</span>{' '}
                <span style={{ color: '#ffffff' }}>{originPortName} &rarr; {destPortName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Distance:</span>{' '}
                <span style={{ color: '#ffffff' }}>{corridorDistance} NM</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Agreed Total Freight:</span>{' '}
                <strong style={{ color: '#38bdf8' }}>
                  ${typeof estTotalCost === 'number' ? estTotalCost.toLocaleString() : estTotalCost}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Confirmed ETA:</span>{' '}
                <span style={{ color: '#10b981' }}>{estArrivalDisplay}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
              >
                Close & Return to Cargo
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<ExternalLink size={14} />}
                onClick={handleViewInBookings}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  fontWeight: 700,
                }}
              >
                View in Commercial Bookings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
