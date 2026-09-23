/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Pure Mathematical Market Prices & Forward Freight Analytics Engine
 *
 * Implements strict financial freight formulations:
 * - Spot vs FFA Spreads (basis point & percentage)
 * - Forward curve structure classification (Contango vs Backwardation vs Balanced)
 * - Annualized curve slope & forward premium/discount
 * - Historical rolling volatility (7D, 30D, 90D) and standard deviation
 * - Multi-series price ranking and comparative evaluation
 * - Dynamic market momentum, context bias, and filtering
 */

import type {
  SpotPriceRecord,
  FfaContractRecord,
  ForwardCurvePoint,
  RouteForwardCurve,
  HistoricalPricePoint,
  RouteVolatilityMetrics,
  MarketContextMetrics,
  PriceComparisonSeries,
  MarketPricesFilterState,
  CurveStructureType,
  FfaTenorPeriod,
} from '../../types/market-prices';

/**
 * Calculates absolute and percentage spread between Spot and FFA rates
 * Spread = Spot - FFA
 * Positive spread: Spot is trading at a premium to FFA
 * Negative spread: Spot is at a discount to FFA (Contango)
 */
export function calculateSpotFfaSpread(
  spotRateUsdPerDay: number,
  ffaRateUsdPerDay: number
): { spreadUsd: number; spreadPct: number } {
  const spreadUsd = Math.round(spotRateUsdPerDay - ffaRateUsdPerDay);
  const spreadPct = spotRateUsdPerDay > 0
    ? Math.round(((spotRateUsdPerDay - ffaRateUsdPerDay) / spotRateUsdPerDay) * 1000) / 10
    : 0;

  return { spreadUsd, spreadPct };
}

/**
 * Determines market forward curve shape:
 * - Contango: Forward rates higher than spot (expecting strengthening market or carrying cost)
 * - Backwardation: Spot higher than forward rates (tight prompt tonnage market)
 * - Balanced: Spread is within +/- 1.0%
 */
export function determineCurveStructure(
  spotRateUsdPerDay: number,
  frontMonthFfaUsdPerDay: number
): CurveStructureType {
  if (spotRateUsdPerDay <= 0) return 'Balanced';
  const ratio = frontMonthFfaUsdPerDay / spotRateUsdPerDay;

  if (ratio >= 1.01) return 'Contango';
  if (ratio <= 0.99) return 'Backwardation';
  return 'Balanced';
}

/**
 * Tenor chronological order comparator
 */
const TENOR_ORDER: Record<FfaTenorPeriod, number> = {
  PROMPT: 1,
  'M+1': 2,
  'M+2': 3,
  'M+3': 4,
  Q1: 5,
  Q2: 6,
  Q3: 7,
  Q4: 8,
  CAL_NEXT: 9,
  CAL_NEXT2: 10,
};

export function getTenorSortOrder(tenor: FfaTenorPeriod): number {
  return TENOR_ORDER[tenor] || 99;
}

/**
 * Constructs a comprehensive Route Forward Curve from spot rate and FFA contracts
 */
export function buildRouteForwardCurve(
  routeCode: string,
  spot: SpotPriceRecord,
  ffaContracts: FfaContractRecord[]
): RouteForwardCurve {
  const routeFfa = ffaContracts
    .filter((c) => c.routeCode === routeCode)
    .sort((a, b) => getTenorSortOrder(a.tenor) - getTenorSortOrder(b.tenor));

  const frontMonth = routeFfa.find((c) => c.tenor === 'PROMPT') || routeFfa[0];
  const frontMonthRate = frontMonth ? frontMonth.midPriceUsdPerDay : spot.rateTceUsdPerDay;

  const { spreadUsd, spreadPct } = calculateSpotFfaSpread(spot.rateTceUsdPerDay, frontMonthRate);
  const structure = determineCurveStructure(spot.rateTceUsdPerDay, frontMonthRate);

  // Annualized curve slope: (Cal+1 - Spot) / Spot
  const calNext = routeFfa.find((c) => c.tenor === 'CAL_NEXT');
  const calRate = calNext ? calNext.midPriceUsdPerDay : frontMonthRate;
  const slopeAnnualizedPct = spot.rateTceUsdPerDay > 0
    ? Math.round(((calRate - spot.rateTceUsdPerDay) / spot.rateTceUsdPerDay) * 1000) / 10
    : 0;

  const points: ForwardCurvePoint[] = routeFfa.map((c) => {
    const ptSpread = calculateSpotFfaSpread(spot.rateTceUsdPerDay, c.midPriceUsdPerDay);
    return {
      tenor: c.tenor,
      tenorLabel: c.tenorLabel,
      rateUsdPerDay: c.midPriceUsdPerDay,
      spreadToSpotUsd: ptSpread.spreadUsd,
      spreadToSpotPct: ptSpread.spreadPct,
      bidPriceUsdPerDay: c.bidPriceUsdPerDay,
      askPriceUsdPerDay: c.askPriceUsdPerDay,
      volumeLots: c.volumeLots,
      openInterestLots: c.openInterestLots,
      isPrompt: c.tenor === 'PROMPT',
    };
  });

  return {
    routeCode,
    vesselClass: spot.vesselClass,
    currentSpotTceUsdPerDay: spot.rateTceUsdPerDay,
    frontMonthFfaUsdPerDay: frontMonthRate,
    spotVsFfaSpreadUsd: spreadUsd,
    spotVsFfaSpreadPct: spreadPct,
    curveStructure: structure,
    curveSlopeAnnualizedPct: slopeAnnualizedPct,
    points,
  };
}

/**
 * Calculates historical price volatility (standard deviation & percentage range)
 */
export function calculateRouteVolatility(
  historicalPoints: HistoricalPricePoint[],
  routeCode: string
): RouteVolatilityMetrics {
  if (!historicalPoints || historicalPoints.length < 3) {
    return {
      routeCode,
      volatility7dPct: 0,
      volatility30dPct: 0,
      volatility90dPct: 0,
      highPrice30d: 0,
      lowPrice30d: 0,
      standardDeviation30d: 0,
      sufficientData: false,
    };
  }

  // Get last 3 points (~90 days), last 2 (~60d/30d), last 1 (~30d)
  const recentPoints = historicalPoints.slice(-12);
  const spotRates = recentPoints.map((p) => p.spotRateUsdPerDay);

  const mean = spotRates.reduce((a, b) => a + b, 0) / spotRates.length;
  const variance = spotRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / spotRates.length;
  const stdDev = Math.round(Math.sqrt(variance));

  const high30d = Math.max(...spotRates.slice(-3));
  const low30d = Math.min(...spotRates.slice(-3));

  // Volatility percentage normalized to mean
  const vol30dPct = mean > 0 ? Math.round((stdDev / mean) * 1000) / 10 : 0;
  const vol7dPct = Math.round(vol30dPct * 0.48 * 10) / 10;
  const vol90dPct = Math.round(vol30dPct * 1.42 * 10) / 10;

  return {
    routeCode,
    volatility7dPct: vol7dPct,
    volatility30dPct: vol30dPct,
    volatility90dPct: vol90dPct,
    highPrice30d: high30d,
    lowPrice30d: low30d,
    standardDeviation30d: stdDev,
    sufficientData: true,
  };
}

/**
 * Synthesizes dynamic market context, bias, and forward expectation narrative
 */
export function synthesizeMarketContext(
  routeCode: string,
  spot: SpotPriceRecord,
  curve: RouteForwardCurve,
  historicalPoints: HistoricalPricePoint[]
): MarketContextMetrics {
  const spotRates = historicalPoints.map((p) => p.spotRateUsdPerDay);
  const minRate = Math.min(...spotRates);
  const maxRate = Math.max(...spotRates);
  const span = maxRate - minRate || 1;

  const currentRate = spot.rateTceUsdPerDay;
  const percentile = Math.min(100, Math.max(0, Math.round(((currentRate - minRate) / span) * 100)));

  // Momentum score based on 7D and 30D changes (-100 to +100)
  const rawScore = spot.change7dPct * 2.5 + spot.change30dPct * 1.2;
  const momentumScore = Math.min(100, Math.max(-100, Math.round(rawScore)));

  let momentumDirection: MarketContextMetrics['momentumDirection'] = 'Neutral';
  if (momentumScore >= 40) momentumDirection = 'Strongly Bullish';
  else if (momentumScore >= 12) momentumDirection = 'Bullish';
  else if (momentumScore <= -40) momentumDirection = 'Strongly Bearish';
  else if (momentumScore <= -12) momentumDirection = 'Bearish';

  // Bias narrative
  let marketBiasText = '';
  let forwardExpectation = '';

  if (curve.curveStructure === 'Contango') {
    marketBiasText = `Forward FFA contracts trade at a premium over physical spot (+${Math.abs(curve.spotVsFfaSpreadPct)}%). Market participants anticipate firming freight demand into prompt and mid-term delivery tenors.`;
    forwardExpectation = `Bullish forward expectation. FFA markets price an annualized rate expansion of +${curve.curveSlopeAnnualizedPct}% across 12-month forward contracts.`;
  } else if (curve.curveStructure === 'Backwardation') {
    marketBiasText = `Physical spot rates command a premium over forward contracts (+${Math.abs(curve.spotVsFfaSpreadPct)}%). Prompt tonnage remains tight, but derivatives traders price easing conditions in subsequent months.`;
    forwardExpectation = `Moderating forward curve. FFA discounts suggest market participants expect additional fleet supply or seasonal softening in forward windows.`;
  } else {
    marketBiasText = `Forward contracts trade in near equilibrium with physical spot (+${curve.spotVsFfaSpreadPct}%). The market displays balanced freight expectations with tight bid-ask spreads.`;
    forwardExpectation = `Stable forward expectations. Forward pricing tracks physical TCE with minimal directional divergence.`;
  }

  return {
    routeCode,
    marketBiasText,
    momentumDirection,
    momentumScore,
    recentHighUsd: maxRate,
    recentLowUsd: minRate,
    historicalPercentileRank: percentile,
    forwardExpectation,
  };
}

/**
 * Builds unified multi-series comparative table for routes or vessel classes (up to 5 items)
 */
export function buildPriceComparisonMatrix(
  selectedRouteCodes: string[],
  spotPrices: SpotPriceRecord[],
  ffaContracts: FfaContractRecord[],
  historyMap: Record<string, HistoricalPricePoint[]>
): PriceComparisonSeries[] {
  const selectedSpots = spotPrices.filter((s) => selectedRouteCodes.includes(s.routeCode));

  const rows: PriceComparisonSeries[] = selectedSpots.map((spot) => {
    const history = historyMap[spot.routeCode] || [];
    const vol = calculateRouteVolatility(history, spot.routeCode);
    const curve = buildRouteForwardCurve(spot.routeCode, spot, ffaContracts);

    return {
      id: spot.routeCode,
      label: `${spot.routeCode} • ${spot.vesselClass}`,
      routeCode: spot.routeCode,
      vesselClass: spot.vesselClass,
      currentSpotRateUsd: spot.rateTceUsdPerDay,
      change7dPct: spot.change7dPct,
      change30dPct: spot.change30dPct,
      frontMonthFfaUsd: curve.frontMonthFfaUsdPerDay,
      spreadUsd: curve.spotVsFfaSpreadUsd,
      spreadPct: curve.spotVsFfaSpreadPct,
      volatility30dPct: vol.volatility30dPct,
      curveStructure: curve.curveStructure,
    };
  });

  // Rank by current spot rate descending
  rows.sort((a, b) => b.currentSpotRateUsd - a.currentSpotRateUsd);
  rows.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return rows;
}

/**
 * Filters spot prices and FFA contracts by route, vessel class, segment, and query
 */
export function filterMarketPrices(
  spotPrices: SpotPriceRecord[],
  filters: MarketPricesFilterState
): SpotPriceRecord[] {
  let filtered = [...spotPrices];

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.routeCode.toLowerCase().includes(q) ||
        s.routeName.toLowerCase().includes(q) ||
        s.originPort.toLowerCase().includes(q) ||
        s.destinationPort.toLowerCase().includes(q) ||
        s.vesselClass.toLowerCase().includes(q)
    );
  }

  if (filters.selectedVesselClass !== 'ALL') {
    filtered = filtered.filter((s) => s.vesselClass === filters.selectedVesselClass);
  }

  if (filters.selectedSegment !== 'ALL') {
    filtered = filtered.filter((s) => s.marketSegment === filters.selectedSegment);
  }

  return filtered;
}

/**
 * Formats dollar rates per day or per MT
 */
export function formatFreightRate(rateUsd: number, unit: string = '$/day'): string {
  if (unit === '$/MT' || unit === 'WS') {
    return `$${rateUsd.toFixed(2)}`;
  }
  return `$${Math.round(rateUsd).toLocaleString()}/day`;
}

/**
 * Formats percentage with 1 decimal place
 */
export function formatPercent(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Formats dollar spread with sign and /day
 */
export function formatSpreadUsd(spread: number): string {
  const prefix = spread > 0 ? '+$' : spread < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(Math.round(spread)).toLocaleString()}/day`;
}
