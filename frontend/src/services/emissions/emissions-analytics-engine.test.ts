/**
 * Unit Test Suite for Module 21: Emissions Analytics Engine
 * Run with: npx tsx src/services/emissions/emissions-analytics-engine.test.ts
 */

import {
  validateCoordinate,
  calculateSafePercent,
  calculateCo2,
  calculateNox,
  calculateSox,
  calculateAer,
  calculateEeoi,
  calculateCiiRating,
  filterVessels,
  synthesizeEmissionsSummary,
  buildVesselComparisonResult,
  aggregateOperationsByState,
  generateAnalyticalInsights,
} from './emissions-analytics-engine';

import {
  CANONICAL_EMISSIONS_VESSELS,
  CANONICAL_VOYAGES,
  CANONICAL_OPERATIONS,
  CANONICAL_ANOMALIES,
  CANONICAL_CLASS_BENCHMARKS,
} from './emissions.data';

import type { EmissionsFiltersState } from '../../types/emissions';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 21: Emissions Analytics Engine Tests ---');

// Test 1: Coordinate Validation
console.log('Test 1: Coordinate Validation');
assert(validateCoordinate(26.65, 50.16) === true, 'Ras Tanura valid coordinates');
assert(validateCoordinate(-34.85, 18.25) === true, 'Cape of Good Hope valid coordinates');
assert(validateCoordinate(0, 0) === true, 'Prime Meridian / Equator');
assert(validateCoordinate(90, 180) === true, 'Max boundary');
assert(validateCoordinate(-90, -180) === true, 'Min boundary');
assert(validateCoordinate(91, 50) === false, 'Out of bounds latitude (>90)');
assert(validateCoordinate(-90.5, 50) === false, 'Out of bounds latitude (<-90)');
assert(validateCoordinate(20, 180.5) === false, 'Out of bounds longitude (>180)');
assert(validateCoordinate(20, -181) === false, 'Out of bounds longitude (<-180)');
assert(validateCoordinate(NaN, 50) === false, 'NaN latitude');
assert(validateCoordinate(null, undefined) === false, 'Null/Undefined coordinates');
console.log('  ✓ Coordinate validation passed.');

// Test 2: Safe Percent Calculation
console.log('Test 2: Safe Percent Calculation');
assert(calculateSafePercent(50, 100) === 50.0, '50/100 = 50%');
assert(calculateSafePercent(10, 0) === 0, 'Zero denominator guarded');
assert(calculateSafePercent(10, -5) === 0, 'Negative denominator guarded');
assert(calculateSafePercent(NaN, 10) === 0, 'NaN guarded');
console.log('  ✓ Safe percent passed.');

// Test 3: IMO MEPC CO2 Emission Factors
console.log('Test 3: IMO MEPC CO2 Factors');
const vlsfoCo2 = calculateCo2(1000, 'VLSFO');
assert(Math.abs(vlsfoCo2 - 3114.0) < 0.1, `VLSFO CF 3.114 check (got ${vlsfoCo2})`);

const lsmgoCo2 = calculateCo2(1000, 'LSMGO');
assert(Math.abs(lsmgoCo2 - 3206.0) < 0.1, `LSMGO CF 3.206 check (got ${lsmgoCo2})`);

const lngCo2 = calculateCo2(1000, 'LNG');
assert(Math.abs(lngCo2 - 2750.0) < 0.1, `LNG CF 2.750 check (got ${lngCo2})`);
console.log('  ✓ IMO MEPC CO2 factors passed.');

// Test 4: NOx Engine Tier Emissions
console.log('Test 4: NOx Engine Tier Emissions');
const noxTier2 = calculateNox(1000, false);
assert(Math.abs(noxTier2 - 78.0) < 0.1, `Tier II NOx factor 0.078 check (got ${noxTier2})`);

const noxTier3 = calculateNox(1000, true);
assert(Math.abs(noxTier3 - 18.0) < 0.1, `Tier III NOx factor 0.018 check (got ${noxTier3})`);
console.log('  ✓ NOx engine tier calculations passed.');

// Test 5: SOx Sulfur & Scrubber Abatement
console.log('Test 5: SOx Sulfur & Scrubber Abatement');
const soxVlsfo = calculateSox(1000, 'VLSFO', false);
assert(soxVlsfo === 10.0, `VLSFO 0.50% S check (got ${soxVlsfo})`);

const soxLsmgo = calculateSox(1000, 'LSMGO', false);
assert(soxLsmgo === 2.0, `LSMGO 0.10% S check (got ${soxLsmgo})`);

const soxScrubber = calculateSox(1000, 'VLSFO', true);
assert(soxScrubber === 1.0, `Scrubber 95% abatement check (got ${soxScrubber})`);
console.log('  ✓ SOx calculations passed.');

// Test 6: AER & EEOI Mathematical Formulation
console.log('Test 6: AER & EEOI Mathematical Formulation');
// 10,089.4 mt CO2 across 308,000 DWT and 48,200 nm
const aer = calculateAer(10089.4, 308000, 48200);
assert(aer > 0 && aer < 5, `AER calculation range check (got ${aer})`);

// 2,771.5 mt CO2 across 295,000 mt cargo and 6,420 nm
const eeoi = calculateEeoi(2771.5, 295000, 6420);
assert(eeoi > 0 && eeoi < 10, `EEOI calculation range check (got ${eeoi})`);
console.log('  ✓ AER & EEOI passed.');

// Test 7: IMO MEPC CII Rating Engine
console.log('Test 7: IMO MEPC CII Rating Engine');
const target = 3.0;
assert(calculateCiiRating(2.4, target) === 'A', 'Ratio 0.80 -> Grade A');
assert(calculateCiiRating(2.7, target) === 'B', 'Ratio 0.90 -> Grade B');
assert(calculateCiiRating(3.0, target) === 'C', 'Ratio 1.00 -> Grade C');
assert(calculateCiiRating(3.4, target) === 'D', 'Ratio 1.13 -> Grade D');
assert(calculateCiiRating(3.9, target) === 'E', 'Ratio 1.30 -> Grade E');
console.log('  ✓ CII rating engine passed.');

// Test 8: Vessel Filtering
console.log('Test 8: Vessel Filtering');
const baseFilters: EmissionsFiltersState = {
  search: '',
  timeHorizon: '30d',
  timeAggregation: 'day',
  metric: 'co2',
  fleet: 'all',
  vesselClass: 'all',
  vesselId: 'all',
  region: 'all',
  voyageId: 'all',
  operationalState: 'all',
  scope: 'tank_to_wake',
  isLive: true,
};

const allFiltered = filterVessels(CANONICAL_EMISSIONS_VESSELS, baseFilters);
assert(allFiltered.length === CANONICAL_EMISSIONS_VESSELS.length, 'All vessels returned on empty filter');

const searchFiltered = filterVessels(CANONICAL_EMISSIONS_VESSELS, { ...baseFilters, search: 'OCEANIA' });
assert(searchFiltered.length === 1 && searchFiltered[0].name === 'OCEANIA STAR', 'Search filter by name');

const classFiltered = filterVessels(CANONICAL_EMISSIONS_VESSELS, { ...baseFilters, vesselClass: 'VLCC' });
assert(classFiltered.length === 3, 'Vessel class filter (VLCC = 3)');
console.log('  ✓ Vessel filtering passed.');

// Test 9: Executive Summary Synthesis
console.log('Test 9: Executive Summary Synthesis');
const summary = synthesizeEmissionsSummary(CANONICAL_EMISSIONS_VESSELS, CANONICAL_VOYAGES);
assert(summary.totalCo2Mt > 50000, `Total CO2 mt aggregated (got ${summary.totalCo2Mt})`);
assert(summary.vesselCount === CANONICAL_EMISSIONS_VESSELS.length, 'Vessel count matches');
assert(summary.avgAer > 1 && summary.avgAer < 8, `Average AER reasonable (got ${summary.avgAer})`);
assert(summary.ciiDistribution.A > 0, 'CII distribution has Grade A vessels');
assert(summary.co2Sparkline.length === 10, '10-point sparkline generated');
console.log('  ✓ Summary synthesis passed.');

// Test 10: Multi-Vessel Comparison Matrix
console.log('Test 10: Multi-Vessel Comparison Matrix');
const selectedVessels = [CANONICAL_EMISSIONS_VESSELS[0], CANONICAL_EMISSIONS_VESSELS[1], CANONICAL_EMISSIONS_VESSELS[2]];
const vlccBenchmark = CANONICAL_CLASS_BENCHMARKS[0];
const compResult = buildVesselComparisonResult(selectedVessels, vlccBenchmark);
assert(compResult.vessels.length === 3, '3 vessels compared');
assert(compResult.metricSummaries.length === 6, '6 comparison metrics analyzed');
assert(compResult.vessels.some((v) => v.isBestInClass.co2 || v.isBestInClass.aer), 'Best in class flagged');
console.log('  ✓ Multi-vessel comparison passed.');

// Test 11: Operational States Aggregation
console.log('Test 11: Operational States Aggregation');
const opsSummary = aggregateOperationsByState(CANONICAL_OPERATIONS);
assert(opsSummary.length > 0, 'Operational states aggregated');
assert(opsSummary.some((o) => o.state === 'at_sea'), 'At sea state present');
assert(opsSummary.reduce((acc, o) => acc + o.percentage, 0) > 95, 'Percentages sum to ~100%');
console.log('  ✓ Operational state aggregation passed.');

// Test 12: Analytical Insights Engine
console.log('Test 12: Analytical Insights Engine');
const insights = generateAnalyticalInsights(
  CANONICAL_EMISSIONS_VESSELS,
  CANONICAL_VOYAGES,
  CANONICAL_OPERATIONS,
  CANONICAL_ANOMALIES
);
assert(insights.length >= 4, `Generated ${insights.length} dynamic insights`);
assert(insights.some((i) => i.category === 'efficiency'), 'Efficiency insight generated');
assert(insights.some((i) => i.category === 'compliance'), 'Compliance alert generated');
console.log('  ✓ Analytical insights engine passed.');

console.log('--- ALL MODULE 21 EMISSIONS ANALYTICS ENGINE TESTS PASSED ---');
