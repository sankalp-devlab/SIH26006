/**
 * Unit Test Suite for Module 20: Floating Storage Analytics Engine
 * Run with: npx tsx src/services/floating-storage/floating-storage-analytics-engine.test.ts
 */

import {
  validateCoordinate,
  calculateSafePercent,
  calculateStationaryDays,
  filterFloatingStorage,
  synthesizeFloatingStorageSummary,
  aggregateByRegion,
  aggregateByCargoType,
  aggregateByCrudeGrade,
  aggregateByVesselClass,
  buildVolumeTrendSeries,
  buildHistoricalComparison,
} from './floating-storage-analytics-engine';

import {
  MOCK_FLOATING_STORAGE_VESSELS,
  HISTORICAL_STORAGE_SNAPSHOTS,
} from './floating-storage.data';

import type { FloatingStorageFiltersState } from '../../types/floating-storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 20: Floating Storage Analytics Engine Tests ---');

// Test 1: Coordinate Validation
console.log('Test 1: Coordinate Validation');
assert(validateCoordinate(1.28, 103.85) === true, 'Singapore valid coordinates');
assert(validateCoordinate(25.13, 56.36) === true, 'Fujairah valid coordinates');
assert(validateCoordinate(0, 0) === true, 'Equator / Prime Meridian');
assert(validateCoordinate(90, 180) === true, 'Upper boundary coordinates');
assert(validateCoordinate(-90, -180) === true, 'Lower boundary coordinates');
assert(validateCoordinate(91, 10) === false, 'Out of bounds latitude (>90)');
assert(validateCoordinate(-95, 10) === false, 'Out of bounds latitude (<-90)');
assert(validateCoordinate(10, 185) === false, 'Out of bounds longitude (>180)');
assert(validateCoordinate(10, -190) === false, 'Out of bounds longitude (<-180)');
assert(validateCoordinate(NaN, 10) === false, 'NaN latitude rejected');
assert(validateCoordinate(10, NaN) === false, 'NaN longitude rejected');
assert(validateCoordinate(Infinity, 10) === false, 'Infinity latitude rejected');
assert(validateCoordinate('1.28', 103.85) === false, 'String latitude rejected');
assert(validateCoordinate(null, undefined) === false, 'Null / Undefined rejected');
console.log('✓ Coordinate validation passed.');

// Test 2: Safe Percent Calculation
console.log('Test 2: Safe Percent Calculation');
assert(calculateSafePercent(25, 100) === 25, '25/100 = 25%');
assert(calculateSafePercent(1, 3, 2) === 33.33, '1/3 with 2 decimals = 33.33%');
assert(calculateSafePercent(0, 100) === 0, '0/100 = 0%');
assert(calculateSafePercent(50, 0) === 0, 'Division by zero yields 0%');
assert(calculateSafePercent(50, -10) === 0, 'Negative denominator yields 0%');
assert(calculateSafePercent(NaN, 100) === 0, 'NaN numerator yields 0%');
assert(calculateSafePercent(50, NaN) === 0, 'NaN denominator yields 0%');
console.log('✓ Safe percent calculation passed.');

// Test 3: Stationary Duration Calculation
console.log('Test 3: Stationary Duration Calculation');
const day1 = '2026-02-01T00:00:00Z';
const day10 = '2026-02-11T00:00:00Z';
assert(calculateStationaryDays(day1, day10) === 10, '10 full days diff');
assert(calculateStationaryDays(day1, day1) === 0, '0 days diff for identical timestamps');
assert(calculateStationaryDays(day10, day1) === 0, 'Inverted future start returns 0');
assert(calculateStationaryDays('invalid', day10) === 0, 'Invalid date string returns 0');
assert(calculateStationaryDays('', '') === 0, 'Empty string returns 0');
console.log('✓ Stationary duration calculation passed.');

// Test 4: 42-Vessel Dataset Integrity
console.log('Test 4: 42-Vessel Dataset Integrity');
assert(
  MOCK_FLOATING_STORAGE_VESSELS.length === 42,
  `Expected 42 commercial vessels, got ${MOCK_FLOATING_STORAGE_VESSELS.length}`
);

const validRegions = new Set([
  'Singapore & Malacca Straits',
  'Arabian Gulf & Fujairah',
  'West Africa & Gulf of Guinea',
  'Northwest Europe & Skaw',
  'US Gulf Coast & Caribbean',
  'Mediterranean & Black Sea',
  'East Asia & Zhoushan',
]);

const validCargoes = new Set([
  'Crude Oil',
  'Clean Petroleum Products',
  'Dirty Petroleum Products / Fuel Oil',
  'LNG Gas',
  'LPG Gas',
  'Chemicals',
]);

MOCK_FLOATING_STORAGE_VESSELS.forEach((v) => {
  assert(v.id.length > 0, 'Vessel ID missing');
  assert(v.vesselName.length > 0, `Vessel ${v.id} missing name`);
  assert(/^(IMO)?\d{7}$/.test(v.imoNumber), `Vessel ${v.id} has invalid IMO: ${v.imoNumber}`);
  assert(
    validateCoordinate(v.latitude, v.longitude),
    `Vessel ${v.vesselName} coordinates invalid: ${v.latitude}, ${v.longitude}`
  );
  assert(v.volumeBbl > 0, `Vessel ${v.vesselName} volumeBbl must be positive`);
  assert(v.volumeMt > 0, `Vessel ${v.vesselName} volumeMt must be positive`);
  assert(v.estimatedCargoValueUsd > 0, `Vessel ${v.vesselName} cargo value must be positive`);
  assert(v.dwt > 10000, `Vessel ${v.vesselName} DWT must be > 10000`);
  assert(v.stationaryDays >= 0, `Vessel ${v.vesselName} stationary days must be >= 0`);
  assert(v.speedKnots <= 0.8, `Vessel ${v.vesselName} speed must be stationary (<= 0.8 kts)`);
  assert(validRegions.has(v.region), `Vessel ${v.vesselName} has invalid region: ${v.region}`);
  assert(validCargoes.has(v.cargoType), `Vessel ${v.vesselName} has invalid cargo: ${v.cargoType}`);
  if (v.cargoType === 'Crude Oil') {
    assert(v.crudeGrade !== null, `Vessel ${v.vesselName} is Crude Oil but missing crudeGrade`);
  }
});
console.log('✓ 42-Vessel dataset integrity verified.');

// Test 5: Filtering
console.log('Test 5: Filtering Operations');
const defaultFilters: FloatingStorageFiltersState = {
  search: '',
  cargoType: 'all',
  crudeGrade: 'all',
  region: 'all',
  minStationaryDays: 0,
  dataState: 'live',
  vesselClass: 'all',
};

// Filter by search
const searchResult = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  search: 'OCEANIA STAR',
});
assert(searchResult.length === 1, `Expected 1 vessel for OCEANIA STAR, got ${searchResult.length}`);
assert(searchResult[0].vesselName === 'OCEANIA STAR', 'Found OCEANIA STAR');

// Filter by cargoType
const crudeVessels = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  cargoType: 'Crude Oil',
});
assert(crudeVessels.length > 0, 'Must have crude oil vessels');
assert(
  crudeVessels.every((v) => v.cargoType === 'Crude Oil'),
  'All filtered vessels must have Crude Oil cargo'
);

// Filter by crudeGrade
const murbanVessels = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  crudeGrade: 'Murban',
});
assert(murbanVessels.length > 0, 'Must have Murban crude vessels');
assert(
  murbanVessels.every((v) => v.crudeGrade === 'Murban'),
  'All filtered vessels must be Murban'
);

// Filter by region
const sgVessels = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  region: 'Singapore & Malacca Straits',
});
assert(sgVessels.length > 0, 'Must have Singapore vessels');
assert(
  sgVessels.every((v) => v.region === 'Singapore & Malacca Straits'),
  'All filtered vessels must be in Singapore region'
);

// Filter by minStationaryDays (>= 14)
const stationary14 = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  minStationaryDays: 14,
});
assert(stationary14.length > 0, 'Must have vessels stationary >= 14 days');
assert(
  stationary14.every((v) => v.stationaryDays >= 14),
  'All vessels must have stationaryDays >= 14'
);

// Filter by vesselClass
const vlccVessels = filterFloatingStorage(MOCK_FLOATING_STORAGE_VESSELS, {
  ...defaultFilters,
  vesselClass: 'VLCC',
});
assert(vlccVessels.length > 0, 'Must have VLCC vessels');
assert(
  vlccVessels.every((v) => v.vesselClass === 'VLCC'),
  'All filtered vessels must be VLCC'
);
console.log('✓ Filtering operations passed.');

// Test 6: Summary Synthesis
console.log('Test 6: Summary KPIs Synthesis');
const summary = synthesizeFloatingStorageSummary(MOCK_FLOATING_STORAGE_VESSELS);
assert(summary.totalVessels === 42, `Expected 42 vessels in summary, got ${summary.totalVessels}`);
assert(summary.totalVolumeBbl > 45_000_000, `Expected > 45M bbl, got ${summary.totalVolumeBbl}`);
assert(summary.totalVolumeMt > 6_000_000, `Expected > 6M MT, got ${summary.totalVolumeMt}`);
assert(
  summary.totalImmobilizedValueUsd > 3_000_000_000,
  `Expected > $3B USD value, got ${summary.totalImmobilizedValueUsd}`
);
assert(summary.averageStationaryDays > 0, 'Average stationary days must be positive');
assert(summary.topStorageRegion.length > 0, 'Top region must be identified');
assert(summary.dominantCargoType.length > 0, 'Dominant cargo type must be identified');
assert(summary.activeAnchorageHubsCount > 5, 'Active anchorage hubs must be > 5');

// Empty set guard
const emptySummary = synthesizeFloatingStorageSummary([]);
assert(emptySummary.totalVessels === 0, 'Empty set yields 0 vessels');
assert(emptySummary.totalVolumeBbl === 0, 'Empty set yields 0 bbl');
assert(emptySummary.totalImmobilizedValueUsd === 0, 'Empty set yields 0 USD');
console.log('✓ Summary KPIs synthesis passed.');

// Test 7: Regional Aggregations
console.log('Test 7: Regional Aggregations');
const regionalAgg = aggregateByRegion(MOCK_FLOATING_STORAGE_VESSELS);
assert(regionalAgg.length > 0, 'Regional aggregations must not be empty');
const totalVesselsFromRegions = regionalAgg.reduce((acc, r) => acc + r.vesselCount, 0);
assert(
  totalVesselsFromRegions === 42,
  `Regional vessels sum (${totalVesselsFromRegions}) must match 42`
);
const shareSum = regionalAgg.reduce((acc, r) => acc + r.sharePct, 0);
assert(Math.abs(shareSum - 100) < 1, `Share percentages should sum to approx 100%, got ${shareSum}`);
regionalAgg.forEach((r) => {
  assert(r.anchorages.length > 0, `Region ${r.region} must have at least one anchorage breakdown`);
});
console.log('✓ Regional aggregations passed.');

// Test 8: Cargo & Crude Grade Aggregations
console.log('Test 8: Cargo & Crude Grade Aggregations');
const cargoAgg = aggregateByCargoType(MOCK_FLOATING_STORAGE_VESSELS);
assert(cargoAgg.length > 0, 'Cargo aggregations must not be empty');
const totalVesselsCargo = cargoAgg.reduce((acc, c) => acc + c.vesselCount, 0);
assert(totalVesselsCargo === 42, `Cargo vessels sum must match 42`);

const gradeAgg = aggregateByCrudeGrade(MOCK_FLOATING_STORAGE_VESSELS);
assert(gradeAgg.length > 0, 'Crude grade aggregations must not be empty');
const crudeTotal = MOCK_FLOATING_STORAGE_VESSELS.filter((v) => v.cargoType === 'Crude Oil').length;
const gradeVesselsTotal = gradeAgg.reduce((acc, g) => acc + g.vesselCount, 0);
assert(
  gradeVesselsTotal === crudeTotal,
  `Crude grade count sum (${gradeVesselsTotal}) must match crude vessels total (${crudeTotal})`
);

const classAgg = aggregateByVesselClass(MOCK_FLOATING_STORAGE_VESSELS);
assert(classAgg.length > 0, 'Vessel class aggregations must not be empty');
console.log('✓ Cargo & Crude Grade aggregations passed.');

// Test 9: Historical Comparisons & Trends
console.log('Test 9: Historical Comparisons & Trends');
const trendSeries = buildVolumeTrendSeries(HISTORICAL_STORAGE_SNAPSHOTS);
assert(trendSeries.length === 11, `Expected 11 snapshots, got ${trendSeries.length}`);
trendSeries.forEach((pt) => {
  assert(pt.periodLabel.length > 0, 'Period label must not be empty');
  assert(pt.volumeBbl > 0, 'Volume bbl must be positive');
  assert(pt.vesselCount > 0, 'Vessel count must be positive');
});

const benchmark2024 = HISTORICAL_STORAGE_SNAPSHOTS.find((s) => s.periodLabel === '2024-Q1')!;
assert(benchmark2024 !== undefined, 'Benchmark 2024-Q1 must exist');
const comparison2024 = buildHistoricalComparison(
  MOCK_FLOATING_STORAGE_VESSELS,
  benchmark2024
);
assert(comparison2024.currentVessels === 42, 'Current vessels must be 42');
assert(comparison2024.benchmarkName.includes('2024-Q1'), 'Benchmark name must reference 2024-Q1');
assert(typeof comparison2024.vesselDelta === 'number', 'vesselDelta must be number');
assert(typeof comparison2024.volumeDeltaPct === 'number', 'volumeDeltaPct must be number');
assert(comparison2024.analysisNote.length > 10, 'Analysis note must be descriptive');
console.log('✓ Historical comparisons & trends passed.');

console.log('\n======================================================');
console.log('ALL MODULE 20 ANALYTICS ENGINE UNIT TESTS PASSED (9/9)');
console.log('======================================================');
