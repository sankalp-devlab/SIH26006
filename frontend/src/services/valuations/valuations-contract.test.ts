/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Service Contract Verification Tests
 * Run with: npx tsx src/services/valuations/valuations-contract.test.ts
 */

import { ValuationsService } from './valuations.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 22: Valuation Contract Verification Tests ---');

// Contract Test 1: Synchronous Initial Data Guarantee
console.log('Contract Test 1: Synchronous Initial Data Guarantee');
const initial = ValuationsService.getInitialData();
assert(initial !== null && initial !== undefined, 'Initial payload must never be null');
assert(Array.isArray(initial.vessels) && initial.vessels.length === 18, 'Must provide 18 canonical vessels');
assert(Array.isArray(initial.benchmarks) && initial.benchmarks.length > 0, 'Must provide segment benchmarks');
assert(initial.freshnessStatus === 'SIMULATED_BENCHMARK', 'Initial data should mark status as SIMULATED_BENCHMARK');
assert(initial.currencyRates.USD === 1.0, 'USD rate must equal 1.0');
console.log('  ✓ Synchronous contract verified.');

// Contract Test 2: Vessel Record Integrity
console.log('Contract Test 2: Vessel Record Integrity');
initial.vessels.forEach((v) => {
  assert(v.id > 0, `Vessel ID must be positive: ${v.name}`);
  assert(v.imoNumber.startsWith('IMO '), `IMO must follow standard format: ${v.imoNumber}`);
  assert(v.currentMarketValueUsdM > 0, `Market value must be positive: ${v.currentMarketValueUsdM}`);
  assert(v.dwt > 0, `DWT must be positive: ${v.dwt}`);
  assert(v.lightweightTons > 0, `LDT must be positive: ${v.lightweightTons}`);
  assert(v.demolitionScrapValueUsdM > 0, `Demolition value must be positive: ${v.demolitionScrapValueUsdM}`);
  assert(v.valuationPerDwtUsd > 0, `Valuation/DWT must be positive: ${v.valuationPerDwtUsd}`);
  assert(Array.isArray(v.historicalPoints) && v.historicalPoints.length > 0, `Historical points must exist: ${v.name}`);
  assert(Array.isArray(v.drivers) && v.drivers.length > 0, `Valuation drivers must exist: ${v.name}`);
  assert(Array.isArray(v.signals), `Signals must be an array: ${v.name}`);
});
console.log('  ✓ Vessel record integrity verified.');

// Contract Test 3: Metadata Extractors
console.log('Contract Test 3: Metadata Extractors');
const classes = ValuationsService.getAvailableVesselClasses();
assert(classes.length >= 6, 'Should extract multiple vessel classes');
assert(classes.includes('VLCC') && classes.includes('Capesize'), 'Should include core maritime classes');

const segments = ValuationsService.getAvailableSegments();
assert(segments.length >= 3, 'Should extract multiple market segments');
assert(segments.includes('Dry Bulk') && segments.includes('Crude Tanker'), 'Should include primary segments');

const owners = ValuationsService.getAvailableOwners();
assert(owners.length >= 5, 'Should extract owners');
console.log('  ✓ Metadata extractors verified.');

console.log('--- ALL MODULE 22 VALUATION CONTRACT TESTS PASSED ---');
