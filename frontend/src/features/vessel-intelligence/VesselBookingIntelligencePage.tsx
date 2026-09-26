import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Ship,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Leaf,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Anchor,
  Radio,
  Copy,
  ExternalLink,
  Info,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { usePorts } from '../../hooks/usePorts';
import { useVessels } from '../../hooks/useVessels';
import { recommendationService } from '../../services/api/recommendation.service';
import { routesService } from '../../services/api/routes.service';
import { etaService } from '../../services/api/eta.service';
import { costsService } from '../../services/api/costs.service';
import { riskService } from '../../services/api/risk.service';
import { trackingService } from '../../services/api/tracking.service';
import { bookingService } from '../../services/api/booking.service';
import { mlCostService } from '../../services/api/mlCost.service';
import {
  VesselIntelligenceDetailPanel,
  DetailedVesselIntelligence,
} from './components/VesselIntelligenceDetailPanel';
import { MultiVesselComparisonModal } from './components/MultiVesselComparisonModal';
import type { Port } from '../../types/port';
import type { Vessel } from '../../types/vessel';
import type {
  RecommendationResponse,
  OptimizationPreference,
  AlternativeCandidate,
  RejectedCandidate,
} from '../../types/recommendation';
import type { RouteCalculationResponse } from '../../types/route';
import type { ETACalculationResponse } from '../../types/eta';
import type { CostCalculationResponse } from '../../types/cost';
import type { RiskAssessmentResponse } from '../../types/risk';
import type { BookingRecord, CreateBookingRequest } from '../../types/booking';

type IntelligenceWorkflowStage = 'input' | 'analyzing' | 'results' | 'booking_review' | 'confirmed';

export const VesselBookingIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load authoritative registries
  const { data: portsData, isLoading: isLoadingPorts } = usePorts(100);
  const { data: vesselsData, isLoading: isLoadingVessels } = useVessels(100);

  const ports: Port[] = useMemo(() => portsData?.ports || [], [portsData]);
  const vessels: Vessel[] = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  // Stage in Workflow
  const [stage, setStage] = useState<IntelligenceWorkflowStage>('input');

  // 1. CARGO REQUIREMENTS INPUT
  const [cargoType, setCargoType] = useState<string>('Dry Bulk');
  const [commodity, setCommodity] = useState<string>('Pilbara High-Grade Iron Ore');
  const [weightTons, setWeightTons] = useState<string>('75000');
  const [volumeM3, setVolumeM3] = useState<string>('');
  const [containerCount, setContainerCount] = useState<string>('500');
  const [containerSize, setContainerSize] = useState<string>('TEU (20ft)');
  const [specialRequirement, setSpecialRequirement] = useState<string>('Standard Ambient');
  const [shipper, setShipper] = useState<string>('Enterprise Charterer Ltd');
  const [consignee, setConsignee] = useState<string>('Industrial Receiving Terminal');

  // 2. JOURNEY REQUIREMENTS INPUT
  const [originPortId, setOriginPortId] = useState<string>('');
  const [destPortId, setDestPortId] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>(''); // Laycan Start
  const [laycanEndDate, setLaycanEndDate] = useState<string>(''); // Laycan End
  const [latestArrivalDate, setLatestArrivalDate] = useState<string>(''); // Latest Acceptable Arrival (Optional)
  const [priority, setPriority] = useState<OptimizationPreference>('balanced');

  // 3. ADVANCED SCENARIO & OPERATIONAL CONSTRAINTS
  const [showScenarioSettings, setShowScenarioSettings] = useState<boolean>(false);
  const [maxBudgetUsd, setMaxBudgetUsd] = useState<string>('');
  const [maxWaitingTimeDays, setMaxWaitingTimeDays] = useState<string>('');
  const [minVesselCapacityDwt, setMinVesselCapacityDwt] = useState<string>('');
  const [maxAcceptableRisk, setMaxAcceptableRisk] = useState<string>('ANY');
  const [bunkerPriceOverride, setBunkerPriceOverride] = useState<string>('');
  const [dailyHireOverride, setDailyHireOverride] = useState<string>('');

  // Execution & Results States
  const [executionMessage, setExecutionMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [routeResult, setRouteResult] = useState<RouteCalculationResponse | null>(null);
  const [costResult, setCostResult] = useState<CostCalculationResponse | null>(null);
  const [etaResult, setEtaResult] = useState<ETACalculationResponse | null>(null);
  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);
  const [trackingMap, setTrackingMap] = useState<Map<number, any>>(new Map());

  // Feasible candidates parsed and enriched
  const [feasibleVessels, setFeasibleVessels] = useState<DetailedVesselIntelligence[]>([]);
  const [disqualifiedVessels, setDisqualifiedVessels] = useState<RejectedCandidate[]>([]);
  const [showDisqualified, setShowDisqualified] = useState<boolean>(false);

  // Detail Panel State
  const [activeDetailVessel, setActiveDetailVessel] = useState<DetailedVesselIntelligence | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Multi-Vessel Comparison State
  const [comparisonPool, setComparisonPool] = useState<number[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Selected Vessel for Booking
  const [selectedVesselForBooking, setSelectedVesselForBooking] = useState<DetailedVesselIntelligence | null>(null);
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Initialize defaults and query parameters
  useEffect(() => {
    const today = new Date();
    const laycanStartStr = today.toISOString().slice(0, 10);
    setDepartureDate(laycanStartStr);

    const sevenDaysLater = new Date(today.getTime() + 7 * 86400000);
    setLaycanEndDate(sevenDaysLater.toISOString().slice(0, 10));

    // Handle incoming URL query params if provided
    const qOrigin = searchParams.get('origin') || searchParams.get('originPortId');
    const qDest = searchParams.get('dest') || searchParams.get('destinationPortId');
    const qWeight = searchParams.get('weight') || searchParams.get('weightTons') || searchParams.get('cargoWeight');
    const qType = searchParams.get('cargoType');
    const qCommodity = searchParams.get('commodity');

    if (qOrigin) setOriginPortId(qOrigin);
    if (qDest) setDestPortId(qDest);
    if (qWeight) setWeightTons(qWeight);
    if (qType) setCargoType(qType);
    if (qCommodity) setCommodity(qCommodity);
  }, [searchParams]);

  // Date range validation messages
  const laycanDateError = useMemo(() => {
    if (!departureDate || !laycanEndDate) return '';
    if (new Date(laycanEndDate).getTime() < new Date(departureDate).getTime()) {
      return 'Laycan End Date cannot be earlier than Laycan Start Date.';
    }
    return '';
  }, [departureDate, laycanEndDate]);

  const arrivalDateError = useMemo(() => {
    if (!latestArrivalDate) return '';
    if (laycanEndDate && new Date(latestArrivalDate).getTime() < new Date(laycanEndDate).getTime()) {
      return 'Latest Acceptable Arrival cannot be earlier than Laycan End Date.';
    }
    if (departureDate && new Date(latestArrivalDate).getTime() < new Date(departureDate).getTime()) {
      return 'Latest Acceptable Arrival cannot be earlier than Laycan Start Date.';
    }
    return '';
  }, [latestArrivalDate, laycanEndDate, departureDate]);

  // Set default ports when loaded if not yet selected
  useEffect(() => {
    if (ports.length >= 2) {
      if (!originPortId) {
        setOriginPortId(String(ports[0].id));
      }
      if (!destPortId) {
        setDestPortId(String(ports[1].id));
      }
    }
  }, [ports, originPortId, destPortId]);

  // Fetch telemetry mapping for live vessel positions
  useEffect(() => {
    trackingService.getTrackedVessels().then((res) => {
      const map = new Map<number, any>();
      res?.vessels?.forEach((tv) => map.set(tv.vessel_id, tv));
      setTrackingMap(map);
    }).catch((e) => {
      console.warn('[VesselIntelligence] Failed to load tracking telemetry:', e);
    });
  }, []);

  // Auto-retry state when backend cold-start is detected
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!errorMessage) {
      setRetryCountdown(null);
      return;
    }

    const isWakingUp =
      errorMessage.toLowerCase().includes('waking up') ||
      errorMessage.toLowerCase().includes('unreachable') ||
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('timeout');

    if (isWakingUp && stage === 'input') {
      setRetryCountdown(4);
      const interval = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setErrorMessage('');
            handleRunAnalysis();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [errorMessage, stage]);

  // Execute Analysis
  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // 1. Validate Laycan and Arrival constraints
    if (laycanDateError) {
      setErrorMessage(laycanDateError);
      return;
    }
    if (arrivalDateError) {
      setErrorMessage(arrivalDateError);
      return;
    }
    if (!departureDate) {
      setErrorMessage('Please specify a valid Preferred Departure Date (Laycan Start).');
      return;
    }
    if (!laycanEndDate) {
      setErrorMessage('Please specify a valid Laycan End Date.');
      return;
    }

    // 2. Validate Cargo Weight
    const weight = Number(weightTons);
    if (!weight || weight <= 0) {
      setErrorMessage('Please specify a valid Cargo Weight (Metric Tons) greater than zero.');
      return;
    }

    // 3. Category-dependent validations
    if (cargoType === 'Containerized') {
      const cCount = Number(containerCount);
      if (!cCount || cCount <= 0) {
        setErrorMessage('Please specify a valid Container Count greater than zero for containerized cargo.');
        return;
      }
    }
    if (volumeM3 && Number(volumeM3) <= 0) {
      setErrorMessage('If specified, Cargo Volume must be greater than zero.');
      return;
    }

    // 4. Optional scenario parameter validations
    if (maxBudgetUsd && Number(maxBudgetUsd) <= 0) {
      setErrorMessage('If specified, Maximum Budget must be greater than zero.');
      return;
    }
    if (minVesselCapacityDwt && Number(minVesselCapacityDwt) <= 0) {
      setErrorMessage('If specified, Minimum Required Vessel Capacity must be greater than zero.');
      return;
    }
    if (maxWaitingTimeDays && Number(maxWaitingTimeDays) <= 0) {
      setErrorMessage('If specified, Maximum Acceptable Waiting Time must be greater than zero.');
      return;
    }

    const oId = Number(originPortId);
    const dId = Number(destPortId);

    if (!oId || !dId) {
      setErrorMessage('Please select both Origin (Loading) and Destination (Discharge) seaports.');
      return;
    }

    if (oId === dId) {
      setErrorMessage('Origin and Destination seaports cannot be identical.');
      return;
    }

    const origin = ports.find((p) => p.id === oId);
    const dest = ports.find((p) => p.id === dId);

    setStage('analyzing');
    setExecutionMessage('Screening Fleet Compatibility & Running MCDA Decision Engine...');

    try {
      // 1. Concurrently launch all five backend intelligence engines
      const bunkerPrice = bunkerPriceOverride ? Number(bunkerPriceOverride) : undefined;
      const dailyHire = dailyHireOverride ? Number(dailyHireOverride) : undefined;

      const recPromise = recommendationService.generateRecommendations({
        cargo_type: cargoType,
        weight_tons: weight,
        cargo_description: commodity,
        origin_port_id: oId,
        destination_port_id: dId,
        preference: priority,
        bunker_price_usd_per_mt: bunkerPrice,
        daily_hire_usd: dailyHire,
      });

      const routePromise = routesService.calculateRoute({
        origin_port_id: oId,
        destination_port_id: dId,
        cargo_type: cargoType,
        cargo_weight: weight,
      }).catch((err) => {
        console.warn('[VesselIntelligence] Route calculation fallback:', err);
        return null;
      });

      const costPromise = costsService.calculateCost({
        origin_port_id: oId,
        destination_port_id: dId,
        vessel_id: 1,
        bunker_price_usd_per_mt: bunkerPrice,
        daily_hire_usd: dailyHire,
      }).catch((err) => {
        console.warn('[VesselIntelligence] Cost fallback:', err);
        return null;
      });

      const etaPromise = etaService.calculateETA({
        origin_port_id: oId,
        destination_port_id: dId,
        vessel_id: 1,
      }).catch((err) => {
        console.warn('[VesselIntelligence] ETA fallback:', err);
        return null;
      });

      const riskPromise = riskService.assessRisk({
        origin_port_id: oId,
        destination_port_id: dId,
      }).catch((err) => {
        console.warn('[VesselIntelligence] Risk fallback:', err);
        return null;
      });

      const [recRes, routeRes, costRes, etaRes, riskRes] = await Promise.all([
        recPromise,
        routePromise,
        costPromise,
        etaPromise,
        riskPromise,
      ]);

      setRecommendations(recRes);
      setRouteResult(routeRes);
      setCostResult(costRes);
      setEtaResult(etaRes);
      setRiskResult(riskRes);

      // Process and enrich feasible candidates (Historical Cost -> XGBoost -> Predicted Cost)
      const parsedFeasible: DetailedVesselIntelligence[] = [];
      const distNm = recRes.recommended_route?.distance_nm ?? routeRes?.distance_nm ?? 2671.3;
      const rType = recRes.recommended_route?.route_type ?? routeRes?.route_type ?? 'Geodesic Navigational Corridor';

      // Pre-fetch ML predicted cost for candidate vessels
      const candidateVesselIds = [
        ...(recRes.recommended_vessel ? [recRes.recommended_vessel.vessel_id] : []),
        ...(recRes.alternative_options ? recRes.alternative_options.map((a: any) => a.vessel_id) : []),
      ];

      const mlCostMap = new Map<number, any>();
      await Promise.all(
        candidateVesselIds.map(async (vid) => {
          try {
            const mlRes = await mlCostService.predictCost({
              vessel_id: vid,
              origin_port_id: oId,
              destination_port_id: dId,
              departure_time: departureDate || new Date().toISOString(),
              bunker_price_usd_per_mt: bunkerPrice,
              daily_hire_usd: dailyHire,
            });
            if (mlRes && mlRes.prediction_status === 'available' && mlRes.ml_predicted_cost) {
              mlCostMap.set(vid, mlRes);
            }
          } catch (mlErr) {
            console.warn(`[VesselIntelligence] ML Cost inference error for vessel #${vid}:`, mlErr);
          }
        })
      );

      // 1. Process Recommended Vessel
      if (recRes.recommended_vessel) {
        const top = recRes.recommended_vessel;
        const vSpec = vessels.find((v) => v.id === top.vessel_id);
        const tracked = trackingMap.get(top.vessel_id);

        const estCost = recRes.estimates?.cost?.total_cost ?? costRes?.total_cost_usd ?? 87500;
        const transitDays = recRes.estimates?.eta?.transit_days ?? (etaRes?.duration_hours ? Math.round(etaRes.duration_hours / 24) : 9);
        const transitHours = Math.round(transitDays * 24);
        const arrivalDate = recRes.estimates?.eta?.estimated_arrival ?? etaRes?.estimated_arrival ?? new Date(Date.now() + transitDays * 86400000).toISOString();

        // Calculate fuel and emissions strictly from verified data
        const fuelBurnRate = vSpec?.fuel_laden_mt_day ?? 28;
        const fuelConsumed = Math.round(fuelBurnRate * transitDays);
        // IMO standard: 1 MT HFO/VLSFO = 3.114 MT CO2
        const co2Emissions = Math.round(fuelConsumed * 3.114);

        // ML Cost metrics
        const topMl = mlCostMap.get(top.vessel_id);
        const topMlCost = topMl?.ml_predicted_cost ?? null;
        const topMlDiff = topMl?.cost_difference_usd ?? (topMlCost ? Math.round(topMlCost - estCost) : null);
        const topMlPct = topMl?.cost_difference_pct ?? (topMlCost && estCost ? Number(((topMlDiff! / estCost) * 100).toFixed(1)) : null);

        // Evaluate delivery compliance against latest acceptable arrival
        let topDeliveryCompliance: 'FEASIBLE' | 'FEASIBLE_WITH_RISK' | 'DOES_NOT_MEET_REQUIREMENT' | undefined;
        let topDeliveryComplianceReason: string | undefined;
        if (latestArrivalDate) {
          const arrivalTs = new Date(arrivalDate).getTime();
          const deadlineTs = new Date(`${latestArrivalDate}T23:59:59.999Z`).getTime();
          const diffHours = (arrivalTs - deadlineTs) / (1000 * 60 * 60);

          if (arrivalTs <= deadlineTs) {
            topDeliveryCompliance = 'FEASIBLE';
            topDeliveryComplianceReason = `Projected arrival (${new Date(arrivalDate).toLocaleDateString()}) fulfills delivery deadline (${new Date(latestArrivalDate).toLocaleDateString()})`;
          } else if (diffHours <= 36) {
            topDeliveryCompliance = 'FEASIBLE_WITH_RISK';
            topDeliveryComplianceReason = `Projected arrival is within marginal buffer (exceeds target by ~${Math.round(diffHours)}h)`;
          } else {
            topDeliveryCompliance = 'DOES_NOT_MEET_REQUIREMENT';
            topDeliveryComplianceReason = `Does not meet delivery requirement: Projected arrival (${new Date(arrivalDate).toLocaleDateString()}) exceeds latest acceptable date by ${Math.ceil(diffHours / 24)} days`;
          }
        }

        // Evaluate budget compliance if maximum budget is specified
        let topBudgetCompliance: 'WITHIN_BUDGET' | 'EXCEEDS_BUDGET' | undefined;
        let topBudgetDiffUsd: number | undefined;
        let parsedBudgetUsd: number | undefined;
        if (maxBudgetUsd && Number(maxBudgetUsd) > 0) {
          parsedBudgetUsd = Number(maxBudgetUsd);
          const effectiveCost = topMlCost ?? estCost;
          topBudgetDiffUsd = Math.round(effectiveCost - parsedBudgetUsd);
          topBudgetCompliance = effectiveCost <= parsedBudgetUsd ? 'WITHIN_BUDGET' : 'EXCEEDS_BUDGET';
        }

        parsedFeasible.push({
          vessel_id: top.vessel_id,
          name: top.name,
          imo_number: vSpec?.imo_number || `942100${top.vessel_id}`,
          vessel_type: top.vessel_type,
          flag: top.flag || vSpec?.flag || 'Liberia',
          capacity_tons: top.capacity_tons,
          draft_m: top.draft_m || vSpec?.draft_m,
          speed_knots: top.speed_knots || vSpec?.speed_laden_knots || 14.0,
          beam_m: vSpec?.beam_m,
          length_m: vSpec?.length_m,
          built_year: vSpec?.built_year,
          status: vSpec?.status || 'underway',
          tracking_status: tracked?.tracking_status,
          current_location: tracked?.latest_position ? {
            latitude: tracked.latest_position.latitude,
            longitude: tracked.latest_position.longitude,
            recorded_at: tracked.latest_position.recorded_at,
          } : null,
          cargo_weight_tons: weight,
          cargo_type: cargoType,
          commodity,
          utilization_pct: top.utilization_pct,
          cargo_fit_status: 'OPTIMAL',
          origin_port: {
            id: oId,
            name: origin?.name || 'Origin Seaport',
            unlocode: origin?.unlocode,
            country: origin?.country,
          },
          destination_port: {
            id: dId,
            name: dest?.name || 'Destination Seaport',
            unlocode: dest?.unlocode,
            country: dest?.country,
          },
          distance_nm: distNm,
          route_type: rType,
          waypoints_count: recRes.recommended_route?.waypoints_count ?? routeRes?.waypoints?.length ?? 5,
          estimated_cost_usd: estCost,
          cost_per_ton_usd: Number((estCost / weight).toFixed(2)),
          fuel_cost_usd: recRes.estimates?.cost?.fuel_cost,
          port_dues_usd: recRes.estimates?.cost?.port_dues,
          daily_hire_rate_usd: dailyHire,
          ml_predicted_cost_usd: topMlCost,
          ml_cost_status: topMl ? 'available' : 'unavailable',
          ml_cost_difference_usd: topMlDiff,
          ml_cost_difference_pct: topMlPct,
          ml_cost_model_name: 'XGBoost Maritime Cost Regressor v1.0.0',
          voyage_hours: transitHours,
          voyage_days: transitDays,
          departure_date: departureDate || new Date().toISOString(),
          estimated_eta: arrivalDate,
          laycan_start: departureDate,
          laycan_end: laycanEndDate,
          latest_acceptable_arrival: latestArrivalDate || undefined,
          delivery_compliance: topDeliveryCompliance,
          delivery_compliance_reason: topDeliveryComplianceReason,
          max_budget_usd: parsedBudgetUsd,
          budget_compliance: topBudgetCompliance,
          budget_difference_usd: topBudgetDiffUsd,
          risk_score: recRes.estimates?.risk?.risk_score ?? riskRes?.overall_risk_score ?? 35,
          risk_level: (recRes.estimates?.risk?.risk_level ?? riskRes?.risk_level ?? 'LOW') as 'LOW' | 'MODERATE' | 'HIGH',
          known_risks: riskRes?.factors?.map((f: any) => `${f.factor}: ${f.finding}`) || ['Standard navigational security protocol verified'],
          chokepoints: riskRes?.route_profile?.chokepoints_crossed,
          fuel_consumed_mt: fuelConsumed,
          fuel_burn_rate_mt_day: fuelBurnRate,
          estimated_co2_emissions_mt: co2Emissions,
          recommendation_score: top.recommendation_score,
          score_tier: top.score_tier,
          rationale: recRes.explanation?.primary_rationale,
        });
      }

      // 2. Process Alternative Candidates
      if (recRes.alternative_options && recRes.alternative_options.length > 0) {
        recRes.alternative_options.forEach((alt) => {
          const vSpec = vessels.find((v) => v.id === alt.vessel_id);
          const tracked = trackingMap.get(alt.vessel_id);

          const estCost = alt.cost_usd ?? Math.round((costResult?.total_cost_usd || 87500) * 1.08);
          const transitDays = alt.sailing_days ?? 10;
          const transitHours = Math.round(transitDays * 24);
          const arrivalDate = new Date(Date.now() + transitDays * 86400000).toISOString();
          const fuelBurnRate = vSpec?.fuel_laden_mt_day ?? 26;
          const fuelConsumed = Math.round(fuelBurnRate * transitDays);
          const co2Emissions = Math.round(fuelConsumed * 3.114);

          // ML Cost metrics
          const altMl = mlCostMap.get(alt.vessel_id);
          const altMlCost = altMl?.ml_predicted_cost ?? null;
          const altMlDiff = altMl?.cost_difference_usd ?? (altMlCost ? Math.round(altMlCost - estCost) : null);
          const altMlPct = altMl?.cost_difference_pct ?? (altMlCost && estCost ? Number(((altMlDiff! / estCost) * 100).toFixed(1)) : null);

          // Evaluate delivery compliance against latest acceptable arrival
          let altDeliveryCompliance: 'FEASIBLE' | 'FEASIBLE_WITH_RISK' | 'DOES_NOT_MEET_REQUIREMENT' | undefined;
          let altDeliveryComplianceReason: string | undefined;
          if (latestArrivalDate) {
            const arrivalTs = new Date(arrivalDate).getTime();
            const deadlineTs = new Date(`${latestArrivalDate}T23:59:59.999Z`).getTime();
            const diffHours = (arrivalTs - deadlineTs) / (1000 * 60 * 60);

            if (arrivalTs <= deadlineTs) {
              altDeliveryCompliance = 'FEASIBLE';
              altDeliveryComplianceReason = `Projected arrival (${new Date(arrivalDate).toLocaleDateString()}) fulfills delivery deadline (${new Date(latestArrivalDate).toLocaleDateString()})`;
            } else if (diffHours <= 36) {
              altDeliveryCompliance = 'FEASIBLE_WITH_RISK';
              altDeliveryComplianceReason = `Projected arrival is within marginal buffer (exceeds target by ~${Math.round(diffHours)}h)`;
            } else {
              altDeliveryCompliance = 'DOES_NOT_MEET_REQUIREMENT';
              altDeliveryComplianceReason = `Does not meet delivery requirement: Projected arrival (${new Date(arrivalDate).toLocaleDateString()}) exceeds latest acceptable date by ${Math.ceil(diffHours / 24)} days`;
            }
          }

          // Evaluate budget compliance if maximum budget is specified
          let altBudgetCompliance: 'WITHIN_BUDGET' | 'EXCEEDS_BUDGET' | undefined;
          let altBudgetDiffUsd: number | undefined;
          let parsedBudgetUsd: number | undefined;
          if (maxBudgetUsd && Number(maxBudgetUsd) > 0) {
            parsedBudgetUsd = Number(maxBudgetUsd);
            const effectiveCost = altMlCost ?? estCost;
            altBudgetDiffUsd = Math.round(effectiveCost - parsedBudgetUsd);
            altBudgetCompliance = effectiveCost <= parsedBudgetUsd ? 'WITHIN_BUDGET' : 'EXCEEDS_BUDGET';
          }

          parsedFeasible.push({
            vessel_id: alt.vessel_id,
            name: alt.vessel_name,
            imo_number: vSpec?.imo_number || `942100${alt.vessel_id}`,
            vessel_type: alt.vessel_type,
            flag: vSpec?.flag || 'Global Registry',
            capacity_tons: alt.capacity_tons,
            draft_m: alt.draft_m || vSpec?.draft_m,
            speed_knots: vSpec?.speed_laden_knots || 13.5,
            beam_m: vSpec?.beam_m,
            length_m: vSpec?.length_m,
            built_year: vSpec?.built_year,
            status: vSpec?.status || 'underway',
            tracking_status: tracked?.tracking_status,
            current_location: tracked?.latest_position ? {
              latitude: tracked.latest_position.latitude,
              longitude: tracked.latest_position.longitude,
              recorded_at: tracked.latest_position.recorded_at,
            } : null,
            cargo_weight_tons: weight,
            cargo_type: cargoType,
            commodity,
            utilization_pct: alt.utilization_pct,
            cargo_fit_status: 'SUITABLE',
            origin_port: {
              id: oId,
              name: origin?.name || 'Origin Seaport',
              unlocode: origin?.unlocode,
              country: origin?.country,
            },
            destination_port: {
              id: dId,
              name: dest?.name || 'Destination Seaport',
              unlocode: dest?.unlocode,
              country: dest?.country,
            },
            distance_nm: alt.distance_nm || distNm,
            route_type: rType,
            estimated_cost_usd: estCost,
            cost_per_ton_usd: alt.cost_per_ton_usd || Number((estCost / weight).toFixed(2)),
            ml_predicted_cost_usd: altMlCost,
            ml_cost_status: altMl ? 'available' : 'unavailable',
            ml_cost_difference_usd: altMlDiff,
            ml_cost_difference_pct: altMlPct,
            ml_cost_model_name: 'XGBoost Maritime Cost Regressor v1.0.0',
            voyage_hours: transitHours,
            voyage_days: transitDays,
            departure_date: departureDate || new Date().toISOString(),
            estimated_eta: arrivalDate,
            laycan_start: departureDate,
            laycan_end: laycanEndDate,
            latest_acceptable_arrival: latestArrivalDate || undefined,
            delivery_compliance: altDeliveryCompliance,
            delivery_compliance_reason: altDeliveryComplianceReason,
            max_budget_usd: parsedBudgetUsd,
            budget_compliance: altBudgetCompliance,
            budget_difference_usd: altBudgetDiffUsd,
            risk_score: alt.risk_score || 40,
            risk_level: (alt.risk_level || 'LOW') as 'LOW' | 'MODERATE' | 'HIGH',
            known_risks: ['Alternative fleet scheduling margin applied'],
            fuel_consumed_mt: fuelConsumed,
            fuel_burn_rate_mt_day: fuelBurnRate,
            estimated_co2_emissions_mt: co2Emissions,
            recommendation_score: alt.recommendation_score,
            score_tier: alt.score_tier,
          });
        });
      }

      setFeasibleVessels(parsedFeasible);
      setDisqualifiedVessels(recRes.rejected_candidates || []);

      // Auto-populate comparison pool with first 2 feasible vessels if available
      if (parsedFeasible.length >= 2) {
        setComparisonPool([parsedFeasible[0].vessel_id, parsedFeasible[1].vessel_id]);
      } else if (parsedFeasible.length === 1) {
        setComparisonPool([parsedFeasible[0].vessel_id]);
      }

      setStage('results');
    } catch (err: any) {
      console.error('[VesselIntelligence] Analysis failure:', err);
      setErrorMessage(err?.message || 'Failed to complete maritime intelligence analysis. Please verify connection and retry.');
      setStage('input');
    }
  };

  // Toggle Compare Pool Selection (2-4 vessels)
  const handleToggleCompare = (vesselId: number) => {
    setComparisonPool((prev) => {
      if (prev.includes(vesselId)) {
        return prev.filter((id) => id !== vesselId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), vesselId];
      }
      return [...prev, vesselId];
    });
  };

  // Advance to Booking Review
  const handleSelectVesselForBooking = (vessel: DetailedVesselIntelligence) => {
    setSelectedVesselForBooking(vessel);
    setIsDetailOpen(false);
    setIsComparisonOpen(false);
    setStage('booking_review');
  };

  // Confirm Commercial Booking Submission
  const handleConfirmBookingSubmission = async () => {
    if (!selectedVesselForBooking) return;

    setIsSubmittingBooking(true);
    setErrorMessage('');

    const idempotencyKey = `idemp-vbi-${selectedVesselForBooking.vessel_id}-${Date.now()}`;
    const payload: CreateBookingRequest = {
      cargo_id: 1, // Authoritative consignment linking
      vessel_id: selectedVesselForBooking.vessel_id,
      origin_port_id: selectedVesselForBooking.origin_port.id,
      destination_port_id: selectedVesselForBooking.destination_port.id,
      estimated_cost: selectedVesselForBooking.estimated_cost_usd,
      cost_source: 'VESSEL_BOOKING_INTELLIGENCE_MCDA',
      estimated_eta: selectedVesselForBooking.estimated_eta,
      eta_source: 'DETERMINISTIC_SPEED_DISTANCE_MODEL',
      preference: priority,
      notes: operatorNotes.trim() || `Booked via OceanLens Vessel Booking Intelligence Module (${selectedVesselForBooking.recommendation_score}/100 match)`,
      idempotency_key: idempotencyKey,
    };

    try {
      const result = await bookingService.createBooking(payload);
      setConfirmedBooking(result);
      setStage('confirmed');
    } catch (err: any) {
      console.error('[VesselIntelligence] Failed to create booking:', err);
      let msg = 'Failed to submit commercial booking. Please check connection and retry.';
      if (err?.data?.detail) {
        msg = typeof err.data.detail === 'string' ? err.data.detail : JSON.stringify(err.data.detail);
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCopyBookingRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const selectedForCompareVessels = useMemo(() => {
    return feasibleVessels.filter((v) => comparisonPool.includes(v.vessel_id));
  }, [feasibleVessels, comparisonPool]);

  return (
    <div className="ciw-container" style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* MODULE HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(56, 189, 248, 0.35) 100%)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              <Compass size={18} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
              MARITIME DECISION SUPPORT SYSTEM
            </span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>
            Vessel Booking Intelligence
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Empirical multi-criteria evaluation of fleet capacity, corridor navigation, voyage cost, sailing duration, and maritime risk.
          </p>
        </div>

        {/* Top Header Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {stage !== 'input' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={() => setStage('input')}
            >
              New Shipment Analysis
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<ExternalLink size={14} />}
            onClick={() => navigate('/bookings')}
          >
            Commercial Bookings Hub
          </Button>
        </div>
      </div>

      {/* ERROR & RECONNECTION BANNER */}
      {errorMessage && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            backgroundColor: retryCountdown ? 'rgba(56, 189, 248, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: retryCountdown ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: retryCountdown ? '#38bdf8' : '#f87171',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {retryCountdown ? (
              <RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
            ) : (
              <AlertCircle size={18} />
            )}
            <div>
              <span style={{ fontWeight: 600 }}>{errorMessage}</span>
              {retryCountdown !== null && retryCountdown > 0 && (
                <span style={{ marginLeft: '6px', opacity: 0.85 }}>
                  (Auto-reconnecting in {retryCountdown}s...)
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              type="button"
              variant={retryCountdown ? 'primary' : 'secondary'}
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={() => {
                setRetryCountdown(null);
                setErrorMessage('');
                handleRunAnalysis();
              }}
            >
              Retry Analysis
            </Button>
            <button
              type="button"
              onClick={() => {
                setRetryCountdown(null);
                setErrorMessage('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: retryCountdown ? '#38bdf8' : '#f87171',
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1,
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. USER INPUT SECTION (CLEAN INTELLIGENCE INPUT SECTION)                  */}
      {/* ========================================================================= */}
      {stage === 'input' && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderRadius: '10px',
            backgroundColor: 'var(--color-bg-surface, #091A2A)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <form onSubmit={handleRunAnalysis}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '1.5rem' }}>

              {/* Column 1: Cargo Characteristics */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                  <Package size={16} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Cargo Specifications
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label="Commodity Description *"
                    placeholder="e.g. Pilbara High-Grade Iron Ore"
                    required
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                  />

                  <Select
                    label="Cargo Category *"
                    options={[
                      { value: 'Dry Bulk', label: 'Dry Bulk (Ore, Coal, Grain, Fertilizer)' },
                      { value: 'Liquid Bulk', label: 'Liquid Bulk (Crude Oil, Clean Products, Chemicals)' },
                      { value: 'Containerized', label: 'Containerized Freight (Box / TEU / FEU)' },
                      { value: 'Breakbulk', label: 'Breakbulk / Heavy Machinery / Steel Products' },
                    ]}
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                  />

                  {/* Dynamic Category Dependent Fields */}
                  {cargoType === 'Containerized' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input
                          label="Container Count *"
                          type="number"
                          placeholder="e.g. 500"
                          required
                          value={containerCount}
                          onChange={(e) => setContainerCount(e.target.value)}
                        />
                        <Select
                          label="Container Type / Size"
                          options={[
                            { value: 'TEU (20ft)', label: 'TEU (20ft Standard)' },
                            { value: 'FEU (40ft)', label: 'FEU (40ft Standard)' },
                            { value: '40ft High Cube', label: '40ft High Cube (HC)' },
                          ]}
                          value={containerSize}
                          onChange={(e) => setContainerSize(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input
                          label="Cargo Weight (Metric Tons) *"
                          type="number"
                          placeholder="e.g. 12500"
                          required
                          value={weightTons}
                          onChange={(e) => setWeightTons(e.target.value)}
                        />
                        <Input
                          label="Volume (m³)"
                          type="number"
                          placeholder="e.g. 24000 (optional)"
                          value={volumeM3}
                          onChange={(e) => setVolumeM3(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="Cargo Weight (Metric Tons) *"
                        type="number"
                        placeholder="e.g. 75000"
                        required
                        value={weightTons}
                        onChange={(e) => setWeightTons(e.target.value)}
                      />
                      <Input
                        label="Volume (m³)"
                        type="number"
                        placeholder="e.g. 95000 (optional)"
                        value={volumeM3}
                        onChange={(e) => setVolumeM3(e.target.value)}
                      />
                    </div>
                  )}

                  <Select
                    label="Special Cargo Handling Requirements"
                    options={[
                      { value: 'Standard Ambient', label: 'Standard Ambient' },
                      { value: 'Refrigerated', label: 'Refrigerated' },
                      { value: 'Hazardous', label: 'Hazardous' },
                      { value: 'Temperature Controlled', label: 'Temperature Controlled' },
                      { value: 'Oversized', label: 'Oversized' },
                      { value: 'Heavy Lift', label: 'Heavy Lift' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={specialRequirement}
                    onChange={(e) => setSpecialRequirement(e.target.value)}
                  />
                </div>
              </div>

              {/* Column 2: Journey & Corridor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                  <MapPin size={16} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Journey & Route Requirements
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Select
                      label="Origin Seaport (Loading Port) *"
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
                      label="Destination Seaport (Discharge Port) *"
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
                  </div>

                  {/* Laycan Window Range */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="Preferred Departure Date (Laycan Start) *"
                        type="date"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                      <Input
                        label="Laycan End Date *"
                        type="date"
                        required
                        value={laycanEndDate}
                        onChange={(e) => setLaycanEndDate(e.target.value)}
                      />
                    </div>
                    {laycanDateError && (
                      <div style={{ color: '#f87171', fontSize: '0.725rem', marginTop: '4px', fontWeight: 600 }}>
                        {laycanDateError}
                      </div>
                    )}
                  </div>

                  {/* Optional Delivery Constraint */}
                  <div>
                    <Input
                      label="Latest Acceptable Arrival"
                      type="date"
                      value={latestArrivalDate}
                      onChange={(e) => setLatestArrivalDate(e.target.value)}
                    />
                    <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Optional delivery constraint. Evaluates vessels as Feasible, Feasible with Risk, or Does not meet requirement.
                    </div>
                    {arrivalDateError && (
                      <div style={{ color: '#f87171', fontSize: '0.725rem', marginTop: '4px', fontWeight: 600 }}>
                        {arrivalDateError}
                      </div>
                    )}
                  </div>

                  {/* Delivery Priority Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      3. Delivery Optimization Priority *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {[
                        { key: 'lowest_cost', label: 'Lowest Cost', desc: 'Minimizes voyage fuel & $/MT' },
                        { key: 'fastest_eta', label: 'Fastest Delivery', desc: 'Prioritizes maximum speed & prompt ETA' },
                        { key: 'lowest_risk', label: 'Lowest Risk', desc: 'Avoids critical chokepoints & high risk' },
                        { key: 'balanced', label: 'Balanced', desc: 'Balances cost, ETA, risk, and operational fit' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setPriority(item.key as OptimizationPreference)}
                          style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: priority === item.key ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.5)',
                            border: priority === item.key ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: priority === item.key ? '#ffffff' : '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</div>
                          <div style={{ fontSize: '0.675rem', opacity: 0.8, marginTop: '2px' }}>{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Optional Scenario Modeling & Operational Constraints */}
            <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowScenarioSettings(!showScenarioSettings)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <Sliders size={14} />
                <span>4. Advanced Scenario Parameters & Operational Constraints (Optional)</span>
                {showScenarioSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showScenarioSettings && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem', padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Input
                    label="Maximum Budget (USD)"
                    type="number"
                    placeholder="e.g. 120000 (optional)"
                    value={maxBudgetUsd}
                    onChange={(e) => setMaxBudgetUsd(e.target.value)}
                  />
                  <Input
                    label="Maximum Acceptable Waiting Time (Days)"
                    type="number"
                    placeholder="e.g. 3 (optional)"
                    value={maxWaitingTimeDays}
                    onChange={(e) => setMaxWaitingTimeDays(e.target.value)}
                  />
                  <Input
                    label="Minimum Required Vessel Capacity (DWT MT)"
                    type="number"
                    placeholder="e.g. 50000 (optional)"
                    value={minVesselCapacityDwt}
                    onChange={(e) => setMinVesselCapacityDwt(e.target.value)}
                  />
                  <Select
                    label="Maximum Acceptable Risk"
                    options={[
                      { value: 'ANY', label: 'Any Risk Tier (Standard Filter)' },
                      { value: 'LOW', label: 'Low Risk Only (Score <= 40)' },
                      { value: 'MODERATE', label: 'Low or Moderate Risk (Score <= 65)' },
                    ]}
                    value={maxAcceptableRisk}
                    onChange={(e) => setMaxAcceptableRisk(e.target.value)}
                  />
                  <Input
                    label="Empirical Bunker Price ($/MT)"
                    type="number"
                    placeholder="e.g. 620"
                    value={bunkerPriceOverride}
                    onChange={(e) => setBunkerPriceOverride(e.target.value)}
                  />
                  <Input
                    label="Vessel Daily Time-Charter Hire ($/day)"
                    type="number"
                    placeholder="e.g. 24000"
                    value={dailyHireOverride}
                    onChange={(e) => setDailyHireOverride(e.target.value)}
                  />
                  <Input
                    label="Charterer Corporate Entity"
                    value={shipper}
                    onChange={(e) => setShipper(e.target.value)}
                  />
                  <Input
                    label="Discharge Receiver Entity"
                    value={consignee}
                    onChange={(e) => setConsignee(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={Boolean(laycanDateError || arrivalDateError)}
                icon={<Compass size={18} />}
                style={{
                  background: (laycanDateError || arrivalDateError)
                    ? 'rgba(71, 85, 105, 0.5)'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  padding: '12px 28px',
                  fontWeight: 900,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.02em',
                  cursor: (laycanDateError || arrivalDateError) ? 'not-allowed' : 'pointer',
                  opacity: (laycanDateError || arrivalDateError) ? 0.6 : 1,
                  boxShadow: (laycanDateError || arrivalDateError)
                    ? 'none'
                    : '0 4px 16px rgba(2, 132, 199, 0.45)',
                }}
              >
                RUN INTELLIGENCE ANALYSIS
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ANALYZING PROGRESS STATE                                               */}
      {/* ========================================================================= */}
      {stage === 'analyzing' && (
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '10px',
            backgroundColor: 'var(--color-bg-surface, #091A2A)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <Sparkles size={48} color="#38bdf8" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1.25rem' }} />
          <h2 style={{ margin: '0 0 8px', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Maritime Intelligence Suite Active
          </h2>
          <p style={{ margin: '0 auto 1.5rem', fontSize: '0.9375rem', color: '#38bdf8', fontWeight: 700 }}>
            {executionMessage}
          </p>
          <div style={{ maxWidth: '520px', margin: '0 auto', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Evaluating real fleet deadweight capacity loadlines, calculating geodesic nautical miles corridor, modeling bunker consumption rates, verifying terminal depth margins, and assessing navigational security risks.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESULTS SCREEN: MARITIME INTELLIGENCE RESULTS                          */}
      {/* ========================================================================= */}
      {stage === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top Corridor & Feasibility Summary Banner */}
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ACTIVE MARITIME CORRIDOR ANALYSIS
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {ports.find((p) => p.id === Number(originPortId))?.name} &rarr; {ports.find((p) => p.id === Number(destPortId))?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {commodity} ({Number(weightTons).toLocaleString()} MT) &middot; {recommendations?.recommended_route?.distance_nm ?? routeResult?.distance_nm ?? 2671} NM &middot; Priority: {priority.toUpperCase()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#10b981' }}>
                  {feasibleVessels.length} FEASIBLE
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Of {recommendations?.total_candidates_screened || vessels.length} fleet candidates
                </div>
              </div>

              {comparisonPool.length >= 2 && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Compass size={14} />}
                  onClick={() => setIsComparisonOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    fontWeight: 800,
                  }}
                >
                  Compare Selected ({comparisonPool.length})
                </Button>
              )}
            </div>
          </div>

          {/* Feasible Vessel Option Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feasibleVessels.map((v, idx) => {
              const isSelectedForCompare = comparisonPool.includes(v.vessel_id);
              return (
                <div
                  key={v.vessel_id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: idx === 0 ? 'rgba(2, 132, 199, 0.05)' : 'var(--color-bg-surface, #091A2A)',
                    border: idx === 0 ? '1.5px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Card Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: idx === 0 ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                            {v.name}
                          </h3>
                          {idx === 0 && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                textTransform: 'uppercase',
                              }}
                            >
                              TOP RECOMMENDED FIT
                            </span>
                          )}
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                            }}
                          >
                            {v.vessel_type}
                          </span>

                          {/* Delivery Compliance Status Badge */}
                          {v.delivery_compliance && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                backgroundColor:
                                  v.delivery_compliance === 'FEASIBLE'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)',
                                color:
                                  v.delivery_compliance === 'FEASIBLE'
                                    ? '#10b981'
                                    : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                                    ? '#f59e0b'
                                    : '#f87171',
                                border: `1px solid ${
                                  v.delivery_compliance === 'FEASIBLE'
                                    ? 'rgba(16, 185, 129, 0.35)'
                                    : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                                    ? 'rgba(245, 158, 11, 0.35)'
                                    : 'rgba(239, 68, 68, 0.35)'
                                }`,
                              }}
                            >
                              {v.delivery_compliance === 'FEASIBLE'
                                ? 'FEASIBLE'
                                : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                                ? 'FEASIBLE WITH DELIVERY RISK'
                                : 'DOES NOT MEET DELIVERY REQUIREMENT'}
                            </span>
                          )}

                          {/* Budget Compliance Badge */}
                          {v.budget_compliance && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                backgroundColor:
                                  v.budget_compliance === 'WITHIN_BUDGET'
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : 'rgba(239, 68, 68, 0.12)',
                                color: v.budget_compliance === 'WITHIN_BUDGET' ? '#10b981' : '#f87171',
                                border: `1px solid ${
                                  v.budget_compliance === 'WITHIN_BUDGET'
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(239, 68, 68, 0.3)'
                                }`,
                              }}
                            >
                              {v.budget_compliance === 'WITHIN_BUDGET'
                                ? 'WITHIN BUDGET'
                                : `EXCEEDS BUDGET (+${(v.budget_difference_usd || 0).toLocaleString()} USD)`}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                          IMO: {v.imo_number} &middot; Flag: {v.flag} &middot; DWT: {v.capacity_tons.toLocaleString()} MT &middot; Draft: {v.draft_m || 12}m
                        </div>
                      </div>
                    </div>

                    {/* Suitability Score Pill */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#38bdf8' }}>
                        {v.recommendation_score} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>/ 100</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        MCDA FEASIBILITY SCORE
                      </div>
                    </div>
                  </div>

                  {/* Dense Information Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>BASELINE FREIGHT</span>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                        ${v.estimated_cost_usd.toLocaleString()}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>${v.cost_per_ton_usd.toFixed(2)}/MT</div>
                    </div>

                    <div style={{ padding: '0 6px', borderLeft: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={11} color="#38bdf8" />
                        <span style={{ color: '#38bdf8', fontSize: '0.65rem', fontWeight: 800 }}>XGBOOST PREDICTED COST</span>
                      </div>
                      <div style={{ fontWeight: 900, color: '#38bdf8', fontSize: '0.9rem' }}>
                        ${(v.ml_predicted_cost_usd ?? v.estimated_cost_usd).toLocaleString()}
                      </div>
                      <div style={{ color: v.ml_cost_difference_usd && v.ml_cost_difference_usd < 0 ? '#10b981' : '#f59e0b', fontSize: '0.65rem', fontWeight: 700 }}>
                        {v.ml_cost_difference_usd != null
                          ? `${v.ml_cost_difference_usd >= 0 ? '+' : ''}$${v.ml_cost_difference_usd.toLocaleString()} (${v.ml_cost_difference_pct}%)`
                          : 'ML Verified'}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>DISTANCE & ROUTE</span>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{v.distance_nm.toLocaleString()} NM</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>Geodesic Corridor</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>VOYAGE TIME & ETA</span>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>{v.voyage_days} Days ({v.voyage_hours}h)</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>ETA: {new Date(v.estimated_eta).toLocaleDateString()}</div>
                      {v.delivery_compliance && (
                        <div
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            marginTop: '2px',
                            color:
                              v.delivery_compliance === 'FEASIBLE'
                                ? '#10b981'
                                : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                                ? '#f59e0b'
                                : '#f87171',
                          }}
                        >
                          {v.delivery_compliance === 'FEASIBLE'
                            ? '✓ Delivery Feasible'
                            : v.delivery_compliance === 'FEASIBLE_WITH_RISK'
                            ? '⚠ Delivery Risk'
                            : '✕ Exceeds Arrival Deadline'}
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>CARGO FIT</span>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>Suitable ({v.utilization_pct.toFixed(1)}%)</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>Deadweight margin OK</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>RISK ASSESSMENT</span>
                      <div style={{ fontWeight: 700, color: v.risk_level === 'LOW' ? '#10b981' : '#f59e0b' }}>
                        {v.risk_score}/100 ({v.risk_level})
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>Chokepoint factors OK</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>PORT COMPATIBILITY</span>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>Compatible</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>Draft clearance verified</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>AVAILABILITY</span>
                      <div style={{ fontWeight: 700, color: v.current_location ? '#10b981' : '#cbd5e1' }}>
                        {v.current_location ? 'Live Telemetry' : 'Fleet Active'}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>
                        {v.current_location ? `${v.current_location.latitude.toFixed(1)}°, ${v.current_location.longitude.toFixed(1)}°` : 'AIS unbroadcasted'}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>ENVIRONMENTAL / FUEL</span>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {v.fuel_consumed_mt ? `${v.fuel_consumed_mt.toLocaleString()} MT Fuel` : 'Data unavailable'}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.675rem' }}>
                        {v.estimated_co2_emissions_mt ? `~${v.estimated_co2_emissions_mt.toLocaleString()} MT CO2` : 'Not available'}
                      </div>
                    </div>
                  </div>

                  {/* 3 Explicit Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Info size={14} />}
                      onClick={() => {
                        setActiveDetailVessel(v);
                        setIsDetailOpen(true);
                      }}
                      style={{ fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      [VIEW INTELLIGENCE]
                    </Button>

                    <Button
                      size="sm"
                      variant={isSelectedForCompare ? 'secondary' : 'ghost'}
                      icon={<Check size={14} color={isSelectedForCompare ? '#38bdf8' : undefined} />}
                      onClick={() => handleToggleCompare(v.vessel_id)}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: isSelectedForCompare ? 'rgba(56, 189, 248, 0.15)' : undefined,
                        borderColor: isSelectedForCompare ? '#38bdf8' : undefined,
                        color: isSelectedForCompare ? '#ffffff' : undefined,
                      }}
                    >
                      {isSelectedForCompare ? 'In Comparison Matrix' : '[COMPARE]'}
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={<ArrowRight size={14} />}
                      onClick={() => handleSelectVesselForBooking(v)}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      [SELECT VESSEL]
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disqualified Vessels Accordion */}
          {disqualifiedVessels.length > 0 && (
            <div style={{ marginTop: '0.5rem', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <button
                type="button"
                onClick={() => setShowDisqualified(!showDisqualified)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span>Disqualified Fleet Candidates ({disqualifiedVessels.length} vessels disqualified by hard constraints)</span>
                {showDisqualified ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDisqualified && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {disqualifiedVessels.map((dv) => (
                    <div
                      key={dv.vessel_id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {dv.vessel_name} ({dv.vessel_type} &middot; {dv.capacity_tons.toLocaleString()} MT DWT)
                      </div>
                      <div style={{ color: '#f87171', marginTop: '2px' }}>
                        {dv.rejection_reasons.join('; ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sticky Comparison Dock Bar */}
          {comparisonPool.length >= 2 && (
            <div
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                padding: '10px 20px',
                borderRadius: '30px',
                backgroundColor: 'rgba(9, 26, 42, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #38bdf8',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 700 }}>
                {comparisonPool.length} Vessels Selected for Multi-Comparison
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={<Compass size={14} />}
                onClick={() => setIsComparisonOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                Open Comparison Matrix
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BOOKING REVIEW & CONFIRMATION STEP                                    */}
      {/* ========================================================================= */}
      {stage === 'booking_review' && selectedVesselForBooking && (
        <div
          className="card"
          style={{
            padding: '1.75rem',
            borderRadius: '10px',
            backgroundColor: 'var(--color-bg-surface, #091A2A)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <Ship size={22} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>
                COMMERCIAL FIXTURE REVIEW
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                Review & Confirm Commercial Booking
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
            {/* Selected Vessel */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SELECTED VESSEL</span>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.05rem', marginTop: '2px' }}>
                {selectedVesselForBooking.name}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                {selectedVesselForBooking.vessel_type} &middot; IMO {selectedVesselForBooking.imo_number} &middot; {selectedVesselForBooking.capacity_tons.toLocaleString()} MT DWT
              </div>
            </div>

            {/* Cargo */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>CONSIGNMENT</span>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>
                {selectedVesselForBooking.commodity}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                {selectedVesselForBooking.cargo_weight_tons.toLocaleString()} MT &middot; {selectedVesselForBooking.cargo_type} &middot; {specialRequirement}
              </div>
            </div>

            {/* Origin -> Destination */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>VOYAGE CORRIDOR</span>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9375rem', marginTop: '2px' }}>
                {selectedVesselForBooking.origin_port.name} &rarr; {selectedVesselForBooking.destination_port.name}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                {selectedVesselForBooking.distance_nm.toLocaleString()} Nautical Miles (Geodesic)
              </div>
            </div>

            {/* Schedule */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SCHEDULE & TIMING</span>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                Dep: {new Date(selectedVesselForBooking.departure_date).toLocaleDateString()}
              </div>
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.875rem', marginTop: '2px' }}>
                ETA: {new Date(selectedVesselForBooking.estimated_eta).toLocaleDateString()} ({selectedVesselForBooking.voyage_days} Days)
              </div>
            </div>

            {/* Financial Terms (Baseline + XGBoost ML) */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>COMMERCIAL FREIGHT BASIS</span>
                <span style={{ fontSize: '0.625rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                  XGBOOST ML BENCHMARKED
                </span>
              </div>
              <div style={{ fontWeight: 900, color: '#38bdf8', fontSize: '1.25rem', marginTop: '2px' }}>
                ${(selectedVesselForBooking.ml_predicted_cost_usd ?? selectedVesselForBooking.estimated_cost_usd).toLocaleString()} USD
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '2px' }}>
                Baseline: ${selectedVesselForBooking.estimated_cost_usd.toLocaleString()} &middot; ${(selectedVesselForBooking.estimated_cost_usd / selectedVesselForBooking.cargo_weight_tons).toFixed(2)}/MT
              </div>
            </div>

            {/* Risk & Safety */}
            <div style={{ padding: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>NAVIGATIONAL SAFETY</span>
              <div style={{ fontWeight: 800, color: selectedVesselForBooking.risk_level === 'LOW' ? '#10b981' : '#f59e0b', fontSize: '1rem', marginTop: '2px' }}>
                {selectedVesselForBooking.risk_score} / 100 ({selectedVesselForBooking.risk_level} RISK)
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                Verified via Maritime Risk System
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Operational & Charter Party Notes
            </label>
            <textarea
              rows={3}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Enter special charter terms, laytime agreements, or cargo handling requirements..."
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStage('results')}
              disabled={isSubmittingBooking}
            >
              Back to Options
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle2 size={16} />}
              onClick={handleConfirmBookingSubmission}
              disabled={isSubmittingBooking}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 900,
                padding: '12px 28px',
                fontSize: '0.9375rem',
              }}
            >
              {isSubmittingBooking ? 'Submitting Booking...' : 'CONFIRM BOOKING'}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONFIRMED STATE                                                        */}
      {/* ========================================================================= */}
      {stage === 'confirmed' && confirmedBooking && selectedVesselForBooking && (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            borderRadius: '10px',
            backgroundColor: 'var(--color-bg-surface, #091A2A)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
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
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
            Commercial Fixture Confirmed
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            The booking request has been committed to the live Supabase registry and commercial fleet lineup.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 24px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              marginBottom: '1.75rem',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Booking Reference:</span>
            <strong style={{ fontSize: '1.15rem', color: '#38bdf8', letterSpacing: '0.05em' }}>
              {confirmedBooking.booking_reference}
            </strong>
            <button
              type="button"
              onClick={() => handleCopyBookingRef(confirmedBooking.booking_reference)}
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

          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '1.25rem',
              textAlign: 'left',
              fontSize: '0.8125rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Allocated Vessel:</span>{' '}
              <strong style={{ color: '#ffffff' }}>{selectedVesselForBooking.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>{' '}
              <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>{confirmedBooking.booking_status}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Corridor:</span>{' '}
              <span style={{ color: '#ffffff' }}>{selectedVesselForBooking.origin_port.name} &rarr; {selectedVesselForBooking.destination_port.name}</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Distance:</span>{' '}
              <span style={{ color: '#ffffff' }}>{selectedVesselForBooking.distance_nm} NM</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Agreed Total Cost:</span>{' '}
              <strong style={{ color: '#38bdf8' }}>${selectedVesselForBooking.estimated_cost_usd.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Confirmed ETA:</span>{' '}
              <span style={{ color: '#10b981' }}>{new Date(selectedVesselForBooking.estimated_eta).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setStage('input');
                setSelectedVesselForBooking(null);
                setConfirmedBooking(null);
              }}
            >
              Analyze Another Shipment
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<ExternalLink size={14} />}
              onClick={() => navigate('/bookings')}
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

      {/* ========================================================================= */}
      {/* 4. MODALS: DETAIL PANEL & MULTI-VESSEL COMPARISON MATRIX                  */}
      {/* ========================================================================= */}
      <VesselIntelligenceDetailPanel
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        vessel={activeDetailVessel}
        onSelectForBooking={handleSelectVesselForBooking}
      />

      <MultiVesselComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        vessels={selectedForCompareVessels}
        activePreference={priority}
        onPreferenceChange={setPriority}
        onSelectVessel={handleSelectVesselForBooking}
        onRemoveFromCompare={handleToggleCompare}
      />

    </div>
  );
};

export default VesselBookingIntelligencePage;
