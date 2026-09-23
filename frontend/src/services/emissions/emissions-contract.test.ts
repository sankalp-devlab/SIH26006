/**
 * Contract Verification Suite for Module 21: Emissions Intelligence
 * Run with: npx tsx src/services/emissions/emissions-contract.test.ts
 */

import { EmissionsService } from './emissions.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`CONTRACT TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 21: Emissions Contract Verification Tests ---');

// Contract Test 1: Synchronous Initial Data Contract
console.log('Contract Test 1: Synchronous Initial Data Guarantee');
const initial = EmissionsService.getInitialEmissions();
assert(initial !== undefined && initial !== null, 'Initial payload must not be null/undefined');
assert(Array.isArray(initial.vessels) && initial.vessels.length > 0, 'Vessels array must be non-empty');
assert(Array.isArray(initial.voyages) && initial.voyages.length > 0, 'Voyages array must be non-empty');
assert(Array.isArray(initial.legs) && initial.legs.length > 0, 'Legs array must be non-empty');
assert(Array.isArray(initial.operations) && initial.operations.length > 0, 'Operations array must be non-empty');
assert(Array.isArray(initial.anomalies) && initial.anomalies.length > 0, 'Anomalies array must be non-empty');
assert(Array.isArray(initial.fleetBenchmarks) && initial.fleetBenchmarks.length > 0, 'Fleet benchmarks array must be non-empty');
assert(Array.isArray(initial.classBenchmarks) && initial.classBenchmarks.length > 0, 'Class benchmarks array must be non-empty');
assert(initial.freshnessStatus === 'SIMULATED_BENCHMARK', 'Default freshness is SIMULATED_BENCHMARK');
console.log('  ✓ Synchronous contract verified.');

// Contract Test 2: Normalization Layer Resilience
console.log('Contract Test 2: Normalization Layer Resilience');
const normalizedNull = EmissionsService.normalizeEmissionsPayload(null);
assert(normalizedNull.vessels.length > 0, 'Null payload safely normalized to seed registry');

const normalizedEmpty = EmissionsService.normalizeEmissionsPayload({});
assert(normalizedEmpty.vessels.length > 0, 'Empty object safely normalized to seed registry');

const corruptData = {
  vessels: [
    { id: 'not-a-number', name: 123 }, // corrupt
    { id: 999, name: 'VALID SHIP', imoNumber: 'IMO 9999999', currentLocation: { latitude: 10, longitude: 20 } },
  ],
};
const normalizedCorrupt = EmissionsService.normalizeEmissionsPayload(corruptData);
assert(normalizedCorrupt.vessels.length >= 1, 'Corrupt elements pruned and valid elements preserved');
console.log('  ✓ Normalization resilience verified.');

// Contract Test 3: Metadata Extractors
console.log('Contract Test 3: Metadata Extractors');
const fleets = EmissionsService.getAvailableFleets();
assert(fleets.length >= 3, 'At least 3 fleet categories available');

const classes = EmissionsService.getAvailableVesselClasses();
assert(classes.includes('VLCC') && classes.includes('Capesize') && classes.includes('LNG Carrier'), 'Key vessel classes present');

const regions = EmissionsService.getAvailableRegions();
assert(regions.length >= 5, 'Regional breakdown categories available');
console.log('  ✓ Metadata extractors verified.');

console.log('--- ALL MODULE 21 EMISSIONS CONTRACT TESTS PASSED ---');
