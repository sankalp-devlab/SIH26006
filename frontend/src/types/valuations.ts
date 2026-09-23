/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Vessel Valuations Domain Types & Data Contracts
 * 
 * Provides enterprise-grade contracts for automated market valuation (AVM),
 * historical price evolution, demolition/scrap salvage economics, age-depreciation curves,
 * market context, comparable vessel benchmarking, and multi-vessel comparison.
 */

export type ValuationCurrency = 'USD' | 'EUR' | 'GBP';

export type ValuationTimeHorizon = '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'MAX';

export type ValuationChartMetric = 'market_value' | 'value_per_dwt' | 'demolition_value';

export type ValuationConfidence = 'High' | 'Medium' | 'Benchmark';

export type MarketPosition = 'Above Market' | 'At Market' | 'Below Market';

export type MarketTrendDirection = 'Rising' | 'Stable' | 'Declining';

export type DataFreshnessStatus = 'LIVE_SIGNAL_API' | 'SIMULATED_BENCHMARK';

export type ValuationTabType =
  | 'overview'
  | 'history'
  | 'market_context'
  | 'depreciation'
  | 'demolition'
  | 'comparables'
  | 'comparison'
  | 'registry';

/**
 * Single Vessel Valuation Intelligence Record
 */
export interface VesselValuationRecord {
  id: number;
  name: string;
  imoNumber: string;
  vesselClass: string;
  vesselType: string;
  marketSegment: string;
  dwt: number;
  grossTonnage: number;
  lightweightTons: number; // LDT
  yearBuilt: number;
  ageYears: number;
  flag: string;
  registeredOwner: string;
  commercialOperator: string;
  status: 'In Transit' | 'At Anchorage' | 'Moored' | 'Drydock';
  currentPort?: string;

  // Valuation Metrics (USD Millions unless specified)
  currentMarketValueUsdM: number;
  previousMarketValueUsdM: number;
  change1mUsdM: number;
  change1mPct: number;
  change3mUsdM: number;
  change3mPct: number;
  change1yUsdM: number;
  change1yPct: number;

  // Valuation Intensity & Scrap Economics
  valuationPerDwtUsd: number; // (Market Value * 1e6) / DWT
  newbuildingParityUsdM: number;
  demolitionScrapValueUsdM: number;
  scrapRatePerLdtUsd: number; // e.g. 525 USD/LDT
  valuationPremiumOverScrapUsdM: number; // Market Value - Demolition Value
  scrapFloorPct: number; // (Demolition Value / Market Value) * 100

  // Appraisal Governance
  valuationConfidence: ValuationConfidence;
  lastAppraisalDate: string;
  valuationModel: string;

  // Market Positioning
  marketPosition: MarketPosition;
  segmentPercentile: number; // e.g. 18 -> Top 18% of segment
  marketTrend: MarketTrendDirection;
  comparableAverageValueUsdM: number;
  comparablePremiumPct: number;

  // Historical Appraisal Series
  historicalPoints: ValuationHistoricalPoint[];

  // Valuation Drivers Attribution
  drivers: ValuationDriver[];

  // Active Market Signals
  signals: MarketSignal[];
}

/**
 * Single Point in Historical Valuation Time-Series
 */
export interface ValuationHistoricalPoint {
  date: string;
  timestamp: number;
  marketValueUsdM: number;
  demolitionValueUsdM: number;
  valuationPerDwtUsd: number;
  segmentAverageUsdM: number;
  marketBenchmarkUsdM: number;
  spVolumeIndex?: number;
}

/**
 * First-Class Market Context Analytical Model
 */
export interface MarketContextIntel {
  segmentName: string;
  vesselClass: string;
  totalSegmentVessels: number;
  medianMarketValueUsdM: number;
  p25MarketValueUsdM: number;
  p75MarketValueUsdM: number;
  minMarketValueUsdM: number;
  maxMarketValueUsdM: number;
  segment1mChangePct: number;
  segment3mChangePct: number;
  segment12mChangePct: number;
  spTransactionVolumeL12M: number;
  spLiquidityRating: 'High' | 'Moderate' | 'Low';
  orderbookToFleetRatioPct: number;
  averageFleetAgeYears: number;
  comparableAverageValueUsdM: number;
  comparablePremiumPct: number;
  marketPosition: MarketPosition;
  marketTrend: MarketTrendDirection;
  comparableVessels: ComparableVesselSummary[];
}

/**
 * Summary for Comparable Peer Vessels
 */
export interface ComparableVesselSummary {
  id: number;
  name: string;
  imoNumber: string;
  vesselClass: string;
  dwt: number;
  yearBuilt: number;
  ageYears: number;
  currentMarketValueUsdM: number;
  valuationPerDwtUsd: number;
  demolitionScrapValueUsdM: number;
  change1yPct: number;
  marketPosition: MarketPosition;
  owner: string;
}

/**
 * Valuation Driver Attribution
 */
export interface ValuationDriver {
  id: string;
  name: string;
  impactPct: number;
  direction: 'positive' | 'negative' | 'neutral';
  category: 'age' | 'freight' | 'sp_market' | 'newbuild' | 'demolition' | 'specifications';
  explanation: string;
}

/**
 * Market Signal Alert
 */
export interface MarketSignal {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'valuation' | 'demolition' | 'market' | 'depreciation';
  description: string;
  timestamp: string;
}

/**
 * Multi-Vessel Comparison Result (Up to 5 Vessels)
 */
export interface VesselValuationComparisonResult {
  vessels: VesselValuationRecord[];
  metrics: {
    key: string;
    label: string;
    unit: string;
    values: Record<number, number | string>;
    bestVesselId?: number;
    worstVesselId?: number;
    benchmarkValue?: number | string;
  }[];
}

/**
 * Segment Benchmark Distribution Model
 */
export interface SegmentValuationBenchmark {
  vesselClass: string;
  marketSegment: string;
  vesselCount: number;
  medianMarketValueUsdM: number;
  p25MarketValueUsdM: number;
  p75MarketValueUsdM: number;
  averageAgeYears: number;
  averageValuationPerDwtUsd: number;
  averageDemolitionValueUsdM: number;
  annualAppreciationPct: number;
}

/**
 * Global Valuation Filters State
 */
export interface ValuationFiltersState {
  vesselId: number | null;
  searchQuery: string;
  vesselClass: string | 'ALL';
  marketSegment: string | 'ALL';
  vesselType: string | 'ALL';
  ageBracket: 'ALL' | '0-5' | '5-10' | '10-15' | '15+';
  owner: string | 'ALL';
  currency: ValuationCurrency;
  timeHorizon: ValuationTimeHorizon;
  chartMetric: ValuationChartMetric;
  showBenchmarkOverlay: boolean;
  showSimilarVesselsOverlay: boolean;
  isLive: boolean;
}

/**
 * Data-Driven Analytical Narrative Insight
 */
export interface ValuationAnalyticalInsight {
  id: string;
  category: 'valuation' | 'market_context' | 'demolition' | 'depreciation' | 'sp_activity';
  badge: string;
  title: string;
  narrative: string;
  impactMetric: string;
  impactValue: string;
  urgency: 'info' | 'positive' | 'warning';
}

/**
 * Complete Module 22 Valuation Payload
 */
export interface ValuationPayload {
  vessels: VesselValuationRecord[];
  benchmarks: SegmentValuationBenchmark[];
  lastUpdated: string;
  freshnessStatus: DataFreshnessStatus;
  currencyRates: Record<ValuationCurrency, number>; // USD = 1.0, EUR = 0.92, GBP = 0.78
}
