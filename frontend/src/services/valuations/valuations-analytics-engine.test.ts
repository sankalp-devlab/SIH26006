/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Analytics Engine Test Suite
 * Run with: npx tsx src/services/valuations/valuations-analytics-engine.test.ts
 */

import {
  calculateLightweightTonnage,
  calculateDemolitionValue,
  calculateValuationPerDwt,
  calculateScrapFloorRatio,
  calculateTheoreticalAgeValue,
  generateDepreciationCurvePoints,
  generateMarketContext,
  generateValuationComparison,
  generateValuationInsights,
  convertCurrency,
  formatValuation,
  filterValuationVessels,
} from './valuations-analytics-engine';

import {
  CANONICAL_VESSEL_VALUATIONS,
  CANONICAL_VALUATION_BENCHMARKS,
} from './valuations.data';

import type { ValuationFiltersState } from '../../types/valuations';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 22: Valuation Analytics Engine Tests ---');

// Test 1: LDT Calculations
console.log('Test 1: Lightweight Tonnage (LDT) Formulas');
const bulkerLdt = calculateLightweightTonnage(180000, 'Dry Bulk Carrier');
assert(bulkerLdt === 30600, `Bulker LDT should be 30,600 (17% of DWT), got ${bulkerLdt}`);
const tankerLdt = calculateLightweightTonnage(300000, 'Crude Oil Tanker');
assert(tankerLdt === 49500, `Tanker LDT should be 49,500 (16.5% of DWT), got ${tankerLdt}`);
const containerLdt = calculateLightweightTonnage(100000, 'Fully Cellular Container');
assert(containerLdt === 28000, `Container LDT should be 28,000 (28% of DWT), got ${containerLdt}`);
const lngLdt = calculateLightweightTonnage(90000, 'Liquefied Gas Carrier');
assert(lngLdt === 28800, `LNG Carrier LDT should be 28,800 (32% of DWT), got ${lngLdt}`);
console.log('  ✓ LDT formulations verified.');

// Test 2: Demolition Scrap Value Calculations
console.log('Test 2: Demolition Scrap Value & Floor');
const demoVal = calculateDemolitionValue(30000, 525);
assert(demoVal === 15.8, `30,000 LDT @ $525/LDT should equal 15.8, got ${demoVal}`);
const zeroDemo = calculateDemolitionValue(0, 525);
assert(zeroDemo === 0, `Zero LDT should result in 0, got ${zeroDemo}`);
console.log('  ✓ Demolition scrap floor verified.');

// Test 3: Valuation per DWT
console.log('Test 3: Valuation per DWT');
const valPerDwt = calculateValuationPerDwt(74.2, 208000);
assert(valPerDwt === 356.7, `$74.2M on 208,000 DWT should equal 356.7, got ${valPerDwt}`);
console.log('  ✓ Valuation per DWT verified.');

// Test 4: Scrap Floor Ratio
console.log('Test 4: Scrap Floor Ratio');
const ratio = calculateScrapFloorRatio(18.7, 74.2);
assert(ratio === 25.2, `Scrap floor ratio should equal 25.2%, got ${ratio}`);
console.log('  ✓ Scrap floor ratio verified.');

// Test 5: Non-linear Age Depreciation
console.log('Test 5: Age Depreciation Decay');
const newbuild = 92.0;
const scrapFloor = 18.7;
const valAtAge0 = calculateTheoreticalAgeValue(newbuild, scrapFloor, 0);
assert(valAtAge0 === newbuild, `Value at age 0 must equal newbuild parity, got ${valAtAge0}`);
const valAtAge5 = calculateTheoreticalAgeValue(newbuild, scrapFloor, 5);
assert(valAtAge5 < newbuild && valAtAge5 > scrapFloor, 'Value at age 5 must depreciate between newbuild and scrap floor');
const valAtAge25 = calculateTheoreticalAgeValue(newbuild, scrapFloor, 25);
assert(valAtAge25 >= scrapFloor, 'Value at age 25 must respect scrap floor');
const points = generateDepreciationCurvePoints(newbuild, scrapFloor);
assert(points.length === 26, `Curve must generate 26 points (0 to 25 yrs), got ${points.length}`);
console.log('  ✓ Non-linear age depreciation verified.');

// Test 6: Market Context
console.log('Test 6: Market Context & Comparable Analytics');
const testVessel = CANONICAL_VESSEL_VALUATIONS[0];
const context = generateMarketContext(
  testVessel,
  CANONICAL_VESSEL_VALUATIONS,
  CANONICAL_VALUATION_BENCHMARKS
);
assert(context.vesselClass === testVessel.vesselClass, 'Context class must match selected vessel');
assert(context.totalSegmentVessels > 0, 'Total segment vessels must be positive');
assert(context.medianMarketValueUsdM > 0, 'Median market value must be positive');
assert(context.comparableVessels.length > 0, 'Must identify comparable peer vessels');
assert(['Above Market', 'At Market', 'Below Market'].includes(context.marketPosition), 'Must assign valid market position');
console.log('  ✓ Market context analytics verified.');

// Test 7: Multi-Vessel Comparison
console.log('Test 7: Multi-Vessel Comparison Matrix');
const compVessels = [
  CANONICAL_VESSEL_VALUATIONS[0],
  CANONICAL_VESSEL_VALUATIONS[1],
  CANONICAL_VESSEL_VALUATIONS[2],
];
const comparison = generateValuationComparison(compVessels, CANONICAL_VALUATION_BENCHMARKS[0]);
assert(comparison.vessels.length === 3, 'Must compare 3 vessels');
assert(comparison.metrics.length >= 5, 'Must contain multiple analytical metrics');
console.log('  ✓ Multi-vessel comparison engine verified.');

// Test 8: Narrative Insights Generator
console.log('Test 8: Narrative Insights Generator');
const insights = generateValuationInsights(testVessel, context);
assert(insights.length >= 4, `Must produce at least 4 synthesized insights, got ${insights.length}`);
assert(typeof insights[0].narrative === 'string' && insights[0].narrative.length > 10, 'Insight must contain narrative');
console.log('  ✓ Narrative insights generator verified.');

// Test 9: Currency Conversion
console.log('Test 9: Currency Conversion');
const rates = { USD: 1.0, EUR: 0.92, GBP: 0.78 };
const eur = convertCurrency(100, 'EUR', rates);
assert(eur === 92.0, `100 USD @ 0.92 should equal 92.0 EUR, got ${eur}`);
const gbp = convertCurrency(100, 'GBP', rates);
assert(gbp === 78.0, `100 USD @ 0.78 should equal 78.0 GBP, got ${gbp}`);
const formattedUsd = formatValuation(74.2, 'USD', rates);
assert(formattedUsd === '$74.2M', `Formatted USD should be $74.2M, got ${formattedUsd}`);
console.log('  ✓ Currency conversion and formatting verified.');

// Test 10: Filtering
console.log('Test 10: Global Filtering Logic');
const filters: ValuationFiltersState = {
  vesselId: null,
  searchQuery: '',
  vesselClass: 'ALL',
  marketSegment: 'ALL',
  vesselType: 'ALL',
  ageBracket: 'ALL',
  owner: 'ALL',
  currency: 'USD',
  timeHorizon: '1Y',
  chartMetric: 'market_value',
  showBenchmarkOverlay: true,
  showSimilarVesselsOverlay: true,
  isLive: false,
};
const all = filterValuationVessels(CANONICAL_VESSEL_VALUATIONS, filters);
assert(all.length === CANONICAL_VESSEL_VALUATIONS.length, 'Default filter should return all vessels');
const newcastlemaxes = filterValuationVessels(CANONICAL_VESSEL_VALUATIONS, {
  ...filters,
  vesselClass: 'Newcastlemax',
});
assert(newcastlemaxes.length > 0, 'Should find Newcastlemax vessels');
newcastlemaxes.forEach((v) => assert(v.vesselClass === 'Newcastlemax', 'All filtered must be Newcastlemax'));
console.log('  ✓ Filtering logic verified.');

console.log('--- ALL MODULE 22 VALUATION ANALYTICS ENGINE TESTS PASSED ---');
