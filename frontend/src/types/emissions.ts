/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Emissions Intelligence Domain Types & Data Contracts
 * 
 * Provides end-to-end data contracts for Vessel, Voyage, Leg, Operation,
 * and Fleet level environmental and carbon compliance intelligence.
 */

export type EmissionsMetric = 'co2' | 'nox' | 'sox' | 'eeoi' | 'aer' | 'fuel';

export type EmissionsScope = 'tank_to_wake' | 'well_to_wake' | 'eu_ets';

export type EmissionsTimeHorizon = '7d' | '30d' | '90d' | '1y' | 'all';

export type EmissionsTimeAggregation = 'hour' | 'day' | 'week' | 'month';

export type OperationalState =
  | 'laden'
  | 'ballast'
  | 'at_sea'
  | 'maneuvering'
  | 'anchored'
  | 'drifting'
  | 'port'
  | 'loading'
  | 'discharging'
  | 'waiting';

export type CiiRating = 'A' | 'B' | 'C' | 'D' | 'E';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DataFreshnessStatus = 'LIVE_SIGNAL_API' | 'SIMULATED_BENCHMARK';

/**
 * Single Vessel Emissions & Carbon Intelligence Record
 */
export interface EmissionsVesselRecord {
  id: number;
  name: string;
  imoNumber: string;
  vesselClass: string;
  vesselType: string;
  dwt: number;
  grossTonnage: number;
  yearBuilt: number;
  flag: string;
  ownerName: string;
  operatorName: string;
  fleetId: string;
  fleetName: string;
  fuelType: 'VLSFO' | 'LSMGO' | 'HFO_SCRUBBER' | 'LNG' | 'BIOFUEL_BLEND';
  scrubberFitted: boolean;
  totalDistanceNm: number;
  totalFuelConsumedMt: number;
  totalCo2Mt: number;
  co2IntensityKgPerNm: number;
  totalNoxMt: number;
  totalSoxMt: number;
  attainedEeoi: number; // gCO2 / t·nm
  attainedAer: number;  // gCO2 / dwt·nm
  ciiScore: number;     // gCO2 / dwt·nm
  ciiTarget: number;    // IMO reference line
  ciiRating: CiiRating;
  historicalRatings: { year: number; rating: CiiRating; score: number }[];
  co2TrendPct: number;  // % change vs baseline
  status: 'At Sea' | 'In Port' | 'Anchored' | 'Maneuvering' | 'Drydock';
  currentRegion: string;
  currentLocation: {
    latitude: number;
    longitude: number;
    subArea: string;
    speedKnots: number;
  };
  currentVoyageId: string;
  cargoUtilizationPct: number;
  secaComplianceStatus: 'Compliant' | 'SECA Fuel Active' | 'Exempt (Scrubber)';
}

/**
 * Voyage-Level Emissions Intelligence
 */
export interface EmissionsVoyageRecord {
  voyageId: string;
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  arrivalDate: string;
  distanceNm: number;
  durationDays: number;
  avgSpeedKnots: number;
  cargoCommodity: string;
  cargoQuantityMt: number;
  fuelConsumedMt: number;
  co2Mt: number;
  noxMt: number;
  soxMt: number;
  eeoi: number; // gCO2 / t·nm
  aer: number;  // gCO2 / dwt·nm
  status: 'Completed' | 'In Transit' | 'Scheduled';
  euEtsApplicable: boolean;
  euEtsEstimatedEur: number;
  accumulationTimeline: {
    checkpointName: string;
    distanceCoveredNm: number;
    cumulativeCo2Mt: number;
    cumulativeFuelMt: number;
    timestamp: string;
  }[];
}

/**
 * Leg-Level Emissions Intelligence
 */
export interface EmissionsLegRecord {
  legId: string;
  voyageId: string;
  legNumber: number;
  legType: 'laden' | 'ballast';
  origin: string;
  destination: string;
  distanceNm: number;
  durationDays: number;
  speedKnots: number;
  fuelBurnMt: number;
  co2Mt: number;
  noxMt: number;
  soxMt: number;
  eeoi: number;
  aer: number;
  isSecaZone: boolean;
  isAnomalous: boolean;
  anomalyDeviationPct?: number;
  anomalyExplanation?: string;
}

/**
 * Operational State Emissions Record
 */
export interface EmissionsOperationRecord {
  operationId: string;
  vesselId: number;
  vesselName: string;
  voyageId: string;
  state: OperationalState;
  durationHours: number;
  fuelConsumedMt: number;
  co2Mt: number;
  noxMt: number;
  soxMt: number;
  emissionRateKgPerHour: number;
  description: string;
}

/**
 * Detected Emissions Hotspot / Anomaly Item
 */
export interface EmissionsAnomaly {
  id: string;
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  voyageId?: string;
  timestamp: string;
  metric: EmissionsMetric;
  currentValue: number;
  baselineValue: number;
  deviationPct: number;
  severity: AnomalySeverity;
  title: string;
  explanation: string;
  recommendedAction: string;
  resolved: boolean;
}

/**
 * Fleet-Level Benchmark Entity
 */
export interface FleetEmissionsBenchmark {
  fleetId: string;
  fleetName: string;
  vesselCount: number;
  totalCo2Mt: number;
  co2IntensityKgPerNm: number;
  totalFuelMt: number;
  totalNoxMt: number;
  totalSoxMt: number;
  avgEeoi: number;
  avgAer: number;
  avgCiiScore: number;
  avgCiiRating: CiiRating;
  ciiDistribution: Record<CiiRating, number>;
  annualCo2ReductionPct: number;
}

/**
 * Industry & Vessel Class Benchmark
 */
export interface VesselClassBenchmark {
  vesselClass: string;
  vesselCount: number;
  p25Aer: number;
  medianAer: number;
  p75Aer: number;
  medianEeoi: number;
  medianCo2Intensity: number;
  imoCiiReferenceLine: number;
  recommendedSpeedKnots: number;
}

/**
 * Time-Series Historical Trend Observation Point
 */
export interface HistoricalEmissionsPoint {
  date: string;
  timestamp: string;
  co2Mt: number;
  noxMt: number;
  soxMt: number;
  eeoi: number;
  aer: number;
  fuelMt: number;
  distanceNm: number;
  prevPeriodCo2Mt: number;
  fleetAvgCo2Mt: number;
  benchmarkCo2Mt: number;
}

/**
 * Global Emissions Filter State
 */
export interface EmissionsFiltersState {
  search: string;
  timeHorizon: EmissionsTimeHorizon;
  timeAggregation: EmissionsTimeAggregation;
  metric: EmissionsMetric;
  fleet: string;
  vesselClass: string;
  vesselId: string;
  region: string;
  voyageId: string;
  operationalState: string;
  scope: EmissionsScope;
  isLive: boolean;
}

/**
 * Executive Summary KPIs
 */
export interface EmissionsSummaryMetrics {
  totalCo2Mt: number;
  co2PerNauticalMileKg: number;
  totalNoxMt: number;
  totalSoxMt: number;
  avgEeoi: number;
  avgAer: number;
  fleetCiiScore: number;
  fleetCiiRating: CiiRating;
  ciiDistribution: Record<CiiRating, number>;
  totalFuelConsumedMt: number;
  totalDistanceNm: number;
  vesselCount: number;
  voyageCount: number;
  // Deltas vs previous period
  co2DeltaPct: number;
  co2PerNmDeltaPct: number;
  noxDeltaPct: number;
  soxDeltaPct: number;
  eeoiDeltaPct: number;
  aerDeltaPct: number;
  ciiDeltaPct: number;
  // Mini sparkline data arrays (last 10 periods)
  co2Sparkline: number[];
  intensitySparkline: number[];
  eeoiSparkline: number[];
  aerSparkline: number[];
}

/**
 * Side-by-Side Comparison Matrix for up to 5 Vessels
 */
export interface VesselComparisonItem {
  vessel: EmissionsVesselRecord;
  co2DeltaVsBenchmarkPct: number;
  aerDeltaVsBenchmarkPct: number;
  eeoiDeltaVsBenchmarkPct: number;
  isBestInClass: Record<EmissionsMetric, boolean>;
  isWorstInClass: Record<EmissionsMetric, boolean>;
}

export interface VesselComparisonResult {
  vessels: VesselComparisonItem[];
  benchmark: VesselClassBenchmark;
  metricSummaries: {
    metric: EmissionsMetric;
    label: string;
    unit: string;
    benchmarkValue: number;
    vesselValues: { vesselId: number; value: number; highlight: 'best' | 'worst' | 'above' | 'below' }[];
  }[];
}

/**
 * Dynamic Narrative Insight Generated by Analytics Engine
 */
export interface EmissionsAnalyticalInsight {
  id: string;
  category: 'efficiency' | 'compliance' | 'operational' | 'fleet';
  badge: string;
  title: string;
  narrative: string;
  impactMetric: string;
  impactValue: string;
  urgency: 'info' | 'warning' | 'positive';
}

/**
 * Complete Normalized Payload for TanStack Query & Synchronous Cache
 */
export interface EmissionsPayload {
  vessels: EmissionsVesselRecord[];
  voyages: EmissionsVoyageRecord[];
  legs: EmissionsLegRecord[];
  operations: EmissionsOperationRecord[];
  anomalies: EmissionsAnomaly[];
  fleetBenchmarks: FleetEmissionsBenchmark[];
  classBenchmarks: VesselClassBenchmark[];
  historicalTrends: Record<EmissionsTimeHorizon, HistoricalEmissionsPoint[]>;
  freshnessStatus: DataFreshnessStatus;
  lastUpdated: string;
  timestamp: string;
}
