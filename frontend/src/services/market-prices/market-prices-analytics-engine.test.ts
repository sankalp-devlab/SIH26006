/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices Analytics Engine Test Suite
 * Run with: npx tsx src/services/market-prices/market-prices-analytics-engine.test.ts
 */

import {
  calculateSpotFfaSpread,
  determineCurveStructure,
  buildRouteForwardCurve,
  calculateRouteVolatility,
  synthesizeMarketContext,
  buildPriceComparisonMatrix,
  filterMarketPrices,
  formatFreightRate,
} from './market-prices-analytics-engine';

import {
  CANONICAL_SPOT_PRICES,
  CANONICAL_FFA_CONTRACTS,
  CANONICAL_HISTORICAL_SERIES,
} from './market-prices.data';

import type { MarketPricesFilterState } from '../../types/market-prices';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 23: Market Prices Analytics Engine Tests ---');

// Test 1: Spot vs FFA Spread Formulations
console.log('Test 1: Spot vs FFA Spread Formulations');
const spread1 = calculateSpotFfaSpread(50000, 45000);
assert(spread1.spreadUsd === 5000, `Expected +$5000 spread, got ${spread1.spreadUsd}`);
assert(spread1.spreadPct === 10.0, `Expected 10.0% spread, got ${spread1.spreadPct}`);

const spread2 = calculateSpotFfaSpread(40000, 44000);
assert(spread2.spreadUsd === -4000, `Expected -$4000 spread, got ${spread2.spreadUsd}`);
assert(spread2.spreadPct === -10.0, `Expected -10.0% spread, got ${spread2.spreadPct}`);
console.log('  ✓ Spread formulations verified.');

// Test 2: Curve Structure Classification
console.log('Test 2: Curve Structure Classification (Contango vs Backwardation vs Balanced)');
const contango = determineCurveStructure(40000, 42000);
assert(contango === 'Contango', `Expected Contango for forward premium, got ${contango}`);

const backwardation = determineCurveStructure(50000, 48000);
assert(backwardation === 'Backwardation', `Expected Backwardation for prompt premium, got ${backwardation}`);

const balanced = determineCurveStructure(50000, 50200);
assert(balanced === 'Balanced', `Expected Balanced within 1%, got ${balanced}`);
console.log('  ✓ Curve structure classification verified.');

// Test 3: Forward Curve Builder
console.log('Test 3: Route Forward Curve Builder');
const td3cSpot = CANONICAL_SPOT_PRICES.find((s) => s.routeCode === 'TD3C')!;
const curve = buildRouteForwardCurve('TD3C', td3cSpot, CANONICAL_FFA_CONTRACTS);

assert(curve.routeCode === 'TD3C', 'Route code should match');
assert(curve.points.length === 10, `Expected 10 tenor points, got ${curve.points.length}`);
assert(curve.points[0].tenor === 'PROMPT', 'First point must be PROMPT');
assert(curve.currentSpotTceUsdPerDay === td3cSpot.rateTceUsdPerDay, 'Spot price must match');
assert(['Contango', 'Backwardation', 'Balanced'].includes(curve.curveStructure), 'Valid curve structure');
console.log('  ✓ Forward curve builder verified.');

// Test 4: Historical Volatility Metrics
console.log('Test 4: Historical Volatility Engine');
const history = CANONICAL_HISTORICAL_SERIES['TD3C'];
const vol = calculateRouteVolatility(history, 'TD3C');
assert(vol.sufficientData === true, 'Historical series should have sufficient data');
assert(vol.volatility30dPct > 0, `Expected positive 30D volatility, got ${vol.volatility30dPct}`);
assert(vol.highPrice30d >= vol.lowPrice30d, 'High price must be >= low price');
assert(vol.standardDeviation30d > 0, 'Standard deviation must be positive');
console.log('  ✓ Historical volatility engine verified.');

// Test 5: Market Context & Bias Synthesis
console.log('Test 5: Market Context & Bias Synthesis');
const context = synthesizeMarketContext('TD3C', td3cSpot, curve, history);
assert(typeof context.marketBiasText === 'string' && context.marketBiasText.length > 20, 'Bias text must be generated');
assert(context.historicalPercentileRank >= 0 && context.historicalPercentileRank <= 100, 'Percentile rank must be between 0 and 100');
assert(context.momentumScore >= -100 && context.momentumScore <= 100, 'Momentum score must be between -100 and +100');
console.log('  ✓ Market context & bias synthesis verified.');

// Test 6: Multi-Series Comparison Matrix
console.log('Test 6: Multi-Series Comparison Matrix');
const selectedRoutes = ['TD3C', 'TD20', 'C5'];
const compMatrix = buildPriceComparisonMatrix(
  selectedRoutes,
  CANONICAL_SPOT_PRICES,
  CANONICAL_FFA_CONTRACTS,
  CANONICAL_HISTORICAL_SERIES
);
assert(compMatrix.length === 3, `Expected 3 compared routes, got ${compMatrix.length}`);
assert(compMatrix[0].rank === 1, 'Top route must be rank 1');
assert(compMatrix[0].currentSpotRateUsd >= compMatrix[1].currentSpotRateUsd, 'Matrix must be sorted descending by spot rate');
console.log('  ✓ Multi-series comparison matrix verified.');

// Test 7: Global Filtering Logic
console.log('Test 7: Global Filtering Logic');
const defaultFilters: MarketPricesFilterState = {
  searchQuery: '',
  selectedRouteCode: 'ALL',
  selectedVesselClass: 'ALL',
  selectedSegment: 'ALL',
  selectedPricingMode: 'ALL',
  timeHorizon: '1Y',
  chartMetric: 'spot',
  chartAggregation: 'monthly',
  isLive: false,
  showSpotLine: true,
  showFfaLine: true,
  showSpreadBand: true,
};

const allSpots = filterMarketPrices(CANONICAL_SPOT_PRICES, defaultFilters);
assert(allSpots.length === CANONICAL_SPOT_PRICES.length, 'Default filter should return all spots');

const vlccSpots = filterMarketPrices(CANONICAL_SPOT_PRICES, {
  ...defaultFilters,
  selectedVesselClass: 'VLCC',
});
assert(vlccSpots.length === 2, `Expected 2 VLCC routes (TD3C and TD22), got ${vlccSpots.length}`);
vlccSpots.forEach((s) => assert(s.vesselClass === 'VLCC', 'All returned items must be VLCC'));

const searched = filterMarketPrices(CANONICAL_SPOT_PRICES, {
  ...defaultFilters,
  searchQuery: 'Qingdao',
});
assert(searched.length > 0, 'Search for Qingdao should return routes');
console.log('  ✓ Global filtering logic verified.');

// Test 8: Rate Formatter
console.log('Test 8: Rate Formatting Formulations');
const formattedDay = formatFreightRate(48500, '$/day');
assert(formattedDay === '$48,500/day', `Expected $48,500/day, got ${formattedDay}`);
const formattedMt = formatFreightRate(10.45, '$/MT');
assert(formattedMt === '$10.45', `Expected $10.45, got ${formattedMt}`);
console.log('  ✓ Rate formatting verified.');

console.log('--- ALL MODULE 23 MARKET PRICES ANALYTICS ENGINE TESTS PASSED ---');
