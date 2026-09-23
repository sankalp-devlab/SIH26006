/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices v2 Domain Types & Data Contracts
 *
 * Implements first-class co-equal modeling of Spot Prices and FFA Contracts,
 * forward curve dynamics (Contango/Backwardation), historical price time-series,
 * route and vessel-class taxonomies, multi-series comparisons, and market signals.
 */

export type MarketSegmentType =
  | 'Crude Tanker'
  | 'Clean Product'
  | 'Dry Bulk'
  | 'LNG'
  | 'LPG';

export type VesselClassType =
  | 'VLCC'
  | 'Suezmax'
  | 'Aframax'
  | 'LR1'
  | 'MR'
  | 'Newcastlemax'
  | 'Capesize'
  | 'Panamax'
  | 'Supramax'
  | 'LNG Carrier'
  | 'VLGC';

export type FfaTenorPeriod =
  | 'PROMPT'
  | 'M+1'
  | 'M+2'
  | 'M+3'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'CAL_NEXT'
  | 'CAL_NEXT2';

export type CurveStructureType = 'Contango' | 'Backwardation' | 'Balanced';

export type PriceTimeHorizon =
  | '1D'
  | '5D'
  | '1M'
  | '3M'
  | '6M'
  | '1Y'
  | '3Y'
  | 'MAX';

export type PriceChartMetric =
  | 'spot'
  | 'ffa_prompt'
  | 'spread'
  | 'pct_change';

export type PriceAggregation =
  | 'intraday'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type DataFreshnessStatus =
  | 'LIVE_SIGNAL_API'
  | 'CANONICAL_BENCHMARK_ENGINE';

export type MarketPricesTabType =
  | 'overview'
  | 'spot'
  | 'ffa'
  | 'curve'
  | 'history'
  | 'compare'
  | 'movement'
  | 'ledger';

/**
 * Physical Spot Freight Price Record
 */
export interface SpotPriceRecord {
  routeCode: string;
  routeName: string;
  originPort: string;
  destinationPort: string;
  distanceNm: number;
  vesselClass: VesselClassType;
  marketSegment: MarketSegmentType;
  region: 'Middle East' | 'Atlantic' | 'Pacific' | 'Americas' | 'Cross-Med';
  cargoType: string;
  rateTceUsdPerDay: number;
  rateWorldscaleOrPerMt?: number;
  rateUnit: '$/day' | 'WS' | '$/MT';
  change1dUsd: number;
  change1dPct: number;
  change7dPct: number;
  change30dPct: number;
  high52wUsd: number;
  low52wUsd: number;
  lastFixtureDate: string;
  marketStatus: 'Firm' | 'Steady' | 'Softening' | 'Volatile';
  sparkline7d: number[];
}

/**
 * Forward Freight Agreement (FFA) Contract Record
 */
export interface FfaContractRecord {
  id: string;
  routeCode: string;
  vesselClass: VesselClassType;
  tenor: FfaTenorPeriod;
  tenorLabel: string; // e.g. "Oct 2026", "Nov 2026", "Q1 2027", "Cal 2027"
  settlementDate: string;
  bidPriceUsdPerDay: number;
  askPriceUsdPerDay: number;
  midPriceUsdPerDay: number;
  change1dUsd: number;
  change1dPct: number;
  volumeLots: number;
  openInterestLots: number;
  historicalMidPoints: { date: string; mid: number }[];
}

/**
 * Point on the Forward Freight Curve
 */
export interface ForwardCurvePoint {
  tenor: FfaTenorPeriod;
  tenorLabel: string;
  rateUsdPerDay: number;
  spreadToSpotUsd: number;
  spreadToSpotPct: number;
  bidPriceUsdPerDay: number;
  askPriceUsdPerDay: number;
  volumeLots: number;
  openInterestLots: number;
  isPrompt: boolean;
}

/**
 * Forward Freight Curve Model for a Route
 */
export interface RouteForwardCurve {
  routeCode: string;
  vesselClass: VesselClassType;
  currentSpotTceUsdPerDay: number;
  frontMonthFfaUsdPerDay: number;
  spotVsFfaSpreadUsd: number;
  spotVsFfaSpreadPct: number;
  curveStructure: CurveStructureType;
  curveSlopeAnnualizedPct: number;
  points: ForwardCurvePoint[];
}

/**
 * Point in Historical Time-Series
 */
export interface HistoricalPricePoint {
  date: string;
  timestamp: number;
  spotRateUsdPerDay: number;
  ffaFrontMonthUsdPerDay: number;
  spreadUsdPerDay: number;
  spreadPct: number;
  volumeLots?: number;
}

/**
 * Route Metadata & Corridor Specs
 */
export interface MaritimeRouteSpec {
  routeCode: string;
  routeName: string;
  originPort: string;
  destinationPort: string;
  distanceNm: number;
  vesselClass: VesselClassType;
  marketSegment: MarketSegmentType;
  description: string;
  typicalVoyageDays: number;
  hasFfaContracts: boolean;
}

/**
 * Volatility Metrics Model
 */
export interface RouteVolatilityMetrics {
  routeCode: string;
  volatility7dPct: number;
  volatility30dPct: number;
  volatility90dPct: number;
  highPrice30d: number;
  lowPrice30d: number;
  standardDeviation30d: number;
  sufficientData: boolean;
}

/**
 * Market Context & Bias Model
 */
export interface MarketContextMetrics {
  routeCode: string;
  marketBiasText: string;
  momentumDirection: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish';
  momentumScore: number; // -100 to +100
  recentHighUsd: number;
  recentLowUsd: number;
  historicalPercentileRank: number; // 0 to 100
  forwardExpectation: string;
}

/**
 * Analytical Market Signal
 */
export interface MarketPriceSignal {
  id: string;
  routeCode: string;
  vesselClass: VesselClassType;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'spot_breakout' | 'ffa_divergence' | 'volatility_spike' | 'historical_extremum';
  description: string;
  timestamp: string;
}

/**
 * Multi-Series Comparison Item
 */
export interface PriceComparisonSeries {
  id: string;
  label: string;
  routeCode: string;
  vesselClass: VesselClassType;
  currentSpotRateUsd: number;
  change7dPct: number;
  change30dPct: number;
  frontMonthFfaUsd: number;
  spreadUsd: number;
  spreadPct: number;
  volatility30dPct: number;
  curveStructure: CurveStructureType;
  rank?: number;
}

/**
 * Global Filters State for Market Prices
 */
export interface MarketPricesFilterState {
  searchQuery: string;
  selectedRouteCode: string;
  selectedVesselClass: string | 'ALL';
  selectedSegment: MarketSegmentType | 'ALL';
  selectedPricingMode: 'ALL' | 'SPOT_ONLY' | 'FFA_ONLY' | 'SPOT_AND_FFA';
  timeHorizon: PriceTimeHorizon;
  chartMetric: PriceChartMetric;
  chartAggregation: PriceAggregation;
  isLive: boolean;
  showSpotLine: boolean;
  showFfaLine: boolean;
  showSpreadBand: boolean;
}

/**
 * Complete Module 23 Data Payload
 */
export interface MarketPricesPayload {
  routes: MaritimeRouteSpec[];
  spotPrices: SpotPriceRecord[];
  ffaContracts: FfaContractRecord[];
  forwardCurves: Record<string, RouteForwardCurve>;
  historicalSeries: Record<string, HistoricalPricePoint[]>;
  signals: MarketPriceSignal[];
  lastUpdated: string;
  freshnessStatus: DataFreshnessStatus;
}
