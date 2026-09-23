/**
 * Unit Test Suite for Module 19: Fleet Intelligence Analytics Engine
 * Run with: npx tsx src/services/fleets/fleets-analytics-engine.test.ts
 */

import {
  validateCoordinate,
  calculateSafePercent,
  filterFleetVessels,
  synthesizeFleetSummary,
  aggregateByVesselClass,
  aggregateByCargoCategory,
  aggregateByOwner,
  aggregateByOperator,
  aggregateByRegion,
  buildFleetBenchmark,
  buildRegionalComparison,
} from './fleets-analytics-engine';

import {
  FLEET_VESSELS_REGISTRY,
  OWNERS_REGISTRY,
  OPERATORS_REGISTRY,
} from './fleets.data';

import type { FleetFiltersState } from '../../types/fleets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 19: Fleets Analytics Engine Tests ---');

// Test 1: Coordinate Validation
console.log('Test 1: Coordinate Validation');
assert(validateCoordinate(1.29, 103.85) === true, 'Singapore valid coordinates');
assert(validateCoordinate(51.95, 4.14) === true, 'Rotterdam valid coordinates');
assert(validateCoordinate(0, 0) === true, 'Equator / Prime Meridian');
assert(validateCoordinate(90, 180) === true, 'Boundary max coordinates');
assert(validateCoordinate(-90, -180) === true, 'Boundary min coordinates');
assert(validateCoordinate(90.1, 10) === false, 'Out of bounds latitude (>90)');
assert(validateCoordinate(-90.1, 10) === false, 'Out of bounds latitude (<-90)');
assert(validateCoordinate(10, 180.1) === false, 'Out of bounds longitude (>180)');
assert(validateCoordinate(10, -180.1) === false, 'Out of bounds longitude (<-180)');
assert(validateCoordinate(NaN, 10) === false, 'NaN latitude');
assert(validateCoordinate(10, NaN) === false, 'NaN longitude');
assert(validateCoordinate(Infinity, 10) === false, 'Infinity latitude');
assert(validateCoordinate(null, undefined) === false, 'Null / Undefined');
console.log('✓ Coordinate validation passed.');

// Test 2: Calculate Safe Percent
console.log('Test 2: Calculate Safe Percent');
assert(calculateSafePercent(50, 100) === 50, '50 / 100 should be 50%');
assert(calculateSafePercent(1, 3, 2) === 33.33, '1 / 3 should be 33.33%');
assert(calculateSafePercent(10, 0) === 0, 'Division by zero must safely yield 0');
assert(calculateSafePercent(0, 100) === 0, 'Zero numerator yields 0');
console.log('✓ Calculate safe percent passed.');

// Test 3: Seed Registry Integrity
console.log('Test 3: Seed Registry Integrity');
assert(FLEET_VESSELS_REGISTRY.length === 54, `Expected 54 vessels, got ${FLEET_VESSELS_REGISTRY.length}`);
assert(OWNERS_REGISTRY.length === 11, `Expected 11 owners, got ${OWNERS_REGISTRY.length}`);
assert(OPERATORS_REGISTRY.length === 10, `Expected 10 operators, got ${OPERATORS_REGISTRY.length}`);

FLEET_VESSELS_REGISTRY.forEach((v) => {
  assert(typeof v.id === 'number', `Vessel id must be number`);
  assert(v.name.length > 0, `Vessel ${v.id} missing name`);
  assert(v.imoNumber.startsWith('IMO ') && v.imoNumber.length === 11, `Vessel ${v.name} invalid IMO: ${v.imoNumber}`);
  assert(v.dwt > 0, `Vessel ${v.name} must have positive DWT`);
  assert(v.yearBuilt >= 1995 && v.yearBuilt <= 2026, `Vessel ${v.name} invalid yearBuilt: ${v.yearBuilt}`);
  assert(v.ownerId.length > 0 && v.ownerName.length > 0, `Vessel ${v.name} missing owner`);
  assert(v.operatorId.length > 0 && v.operatorName.length > 0, `Vessel ${v.name} missing operator`);
  assert(v.deployment !== undefined, `Vessel ${v.name} missing deployment`);
  assert(
    validateCoordinate(v.deployment.latitude, v.deployment.longitude),
    `Vessel ${v.name} has invalid coords (${v.deployment.latitude}, ${v.deployment.longitude})`
  );
});
console.log('✓ Seed registry integrity passed.');

// Test 4: Vessel Filtering
console.log('Test 4: Vessel Filtering');
const baseFilters: FleetFiltersState = {
  search: '',
  ownerId: 'all',
  operatorId: 'all',
  vesselClass: 'all',
  cargoCategory: 'all',
  region: 'all',
  country: 'all',
  deploymentStatus: 'all',
};

// 4a. All vessels
const allVessels = filterFleetVessels(FLEET_VESSELS_REGISTRY, baseFilters);
assert(allVessels.length === 54, `Empty filter should return all 54 vessels, got ${allVessels.length}`);

// 4b. Filter by owner
const euronavVessels = filterFleetVessels(FLEET_VESSELS_REGISTRY, {
  ...baseFilters,
  ownerId: 'own-euronav',
});
assert(euronavVessels.length > 0, 'Euronav vessels should be found');
assert(euronavVessels.every((v) => v.ownerId === 'own-euronav'), 'All filtered vessels must belong to Euronav');

// 4c. Filter by operator
const cargillVessels = filterFleetVessels(FLEET_VESSELS_REGISTRY, {
  ...baseFilters,
  operatorId: 'op-cargill',
});
assert(cargillVessels.length > 0, 'Cargill operated vessels should be found');
assert(cargillVessels.every((v) => v.operatorId === 'op-cargill'), 'All filtered vessels must have operator Cargill');

// 4d. Filter by vessel class
const capesizeVessels = filterFleetVessels(FLEET_VESSELS_REGISTRY, {
  ...baseFilters,
  vesselClass: 'Capesize',
});
assert(capesizeVessels.length > 0, 'Capesize vessels should be found');
assert(capesizeVessels.every((v) => v.vesselClass === 'Capesize'), 'All filtered vessels must be Capesize');

// 4e. Filter by region
const seaVessels = filterFleetVessels(FLEET_VESSELS_REGISTRY, {
  ...baseFilters,
  region: 'Southeast Asia',
});
assert(seaVessels.length > 0, 'Southeast Asia vessels should be found');
assert(seaVessels.every((v) => v.deployment.region === 'Southeast Asia'), 'All filtered vessels must be in Southeast Asia');

// 4f. Filter by search
const searchResult = filterFleetVessels(FLEET_VESSELS_REGISTRY, {
  ...baseFilters,
  search: 'OCEANIA STAR',
});
assert(searchResult.length === 1, `Search 'OCEANIA STAR' should return 1 vessel, got ${searchResult.length}`);
assert(searchResult[0].name === 'OCEANIA STAR', 'Search returned incorrect vessel');

console.log('✓ Vessel filtering passed.');

// Test 5: Summary Synthesis
console.log('Test 5: Summary Synthesis');
const summary = synthesizeFleetSummary(FLEET_VESSELS_REGISTRY);
assert(summary.totalVessels === 54, `Expected 54 vessels, got ${summary.totalVessels}`);
assert(summary.totalDwt > 5000000, `Total DWT should exceed 5M, got ${summary.totalDwt}`);
assert(summary.activeOwnersCount === 11, `Expected 11 owners, got ${summary.activeOwnersCount}`);
assert(summary.activeOperatorsCount === 10, `Expected 10 operators, got ${summary.activeOperatorsCount}`);
assert(summary.monitoredRegionsCount >= 5, `Expected at least 5 regions, got ${summary.monitoredRegionsCount}`);
assert(summary.underwayPct > 0 && summary.underwayPct <= 100, `Underway % should be within 0-100%, got ${summary.underwayPct}`);
assert(summary.avgFleetAgeYears > 0, `Avg fleet age should be positive, got ${summary.avgFleetAgeYears}`);
console.log('✓ Summary synthesis passed.');

// Test 6: Aggregations
console.log('Test 6: Aggregations');
const classAgg = aggregateByVesselClass(FLEET_VESSELS_REGISTRY);
assert(classAgg.length > 0, 'Class aggregation should return non-empty array');
const totalClassCount = classAgg.reduce((sum, item) => sum + item.vesselCount, 0);
assert(totalClassCount === 54, `Class counts must sum to 54, got ${totalClassCount}`);

const cargoAgg = aggregateByCargoCategory(FLEET_VESSELS_REGISTRY);
assert(cargoAgg.length > 0, 'Cargo aggregation should return non-empty array');
const totalCargoCount = cargoAgg.reduce((sum, item) => sum + item.vesselCount, 0);
assert(totalCargoCount === 54, `Cargo counts must sum to 54, got ${totalCargoCount}`);

const ownerAgg = aggregateByOwner(FLEET_VESSELS_REGISTRY);
assert(ownerAgg.length === 11, `Expected 11 aggregated owners, got ${ownerAgg.length}`);

const operatorAgg = aggregateByOperator(FLEET_VESSELS_REGISTRY);
assert(operatorAgg.length === 10, `Expected 10 aggregated operators, got ${operatorAgg.length}`);

const regionAgg = aggregateByRegion(FLEET_VESSELS_REGISTRY);
assert(regionAgg.length >= 5, `Expected at least 5 regions, got ${regionAgg.length}`);
console.log('✓ Aggregations passed.');

// Test 7: Benchmarking Engine
console.log('Test 7: Benchmarking Engine');
const benchmarkOwner = buildFleetBenchmark(
  FLEET_VESSELS_REGISTRY,
  'owner',
  'own-euronav',
  'own-frontline'
);
assert(benchmarkOwner.entityA.entityId === 'own-euronav', 'Entity A must be own-euronav');
assert(benchmarkOwner.entityB.entityId === 'own-frontline', 'Entity B must be own-frontline');
assert(benchmarkOwner.entityA.vesselCount > 0, 'Euronav must have vessels');
assert(benchmarkOwner.entityB.vesselCount > 0, 'Frontline must have vessels');
assert(typeof benchmarkOwner.dwtDelta === 'number', 'dwtDelta must be a number');
assert(typeof benchmarkOwner.vesselDelta === 'number', 'vesselDelta must be a number');

const benchmarkOperator = buildFleetBenchmark(
  FLEET_VESSELS_REGISTRY,
  'operator',
  'op-cargill',
  'op-vitol'
);
assert(benchmarkOperator.entityA.entityId === 'op-cargill', 'Entity A must be op-cargill');
assert(benchmarkOperator.entityB.entityId === 'op-vitol', 'Entity B must be op-vitol');
console.log('✓ Benchmarking engine passed.');

// Test 8: Regional Comparison Matrix
console.log('Test 8: Regional Comparison Matrix');
const regionalMatrix = buildRegionalComparison(FLEET_VESSELS_REGISTRY);
assert(regionalMatrix.length >= 5, `Expected at least 5 regions, got ${regionalMatrix.length}`);
const totalRegionalPct = regionalMatrix.reduce((sum, item) => sum + item.sharePct, 0);
assert(Math.round(totalRegionalPct) === 100, `Regional share % must sum to ~100%, got ${totalRegionalPct}`);
regionalMatrix.forEach((r) => {
  assert(r.vesselCount > 0, `Region ${r.region} must have positive vessel count`);
  assert(r.countries.length > 0, `Region ${r.region} must have country breakdown`);
});
console.log('✓ Regional comparison matrix passed.');

console.log('--- ALL MODULE 19 FLEET ANALYTICS ENGINE TESTS PASSED ---');
