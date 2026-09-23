/**
 * Contract & Runtime Verification Suite for Module 19: Fleets Service Layer
 * Run with: npx tsx src/services/fleets/fleets-contract-verification.test.ts
 */

import {
  FleetsService,
  normalizeFleetPayload,
} from './fleets.service';
import {
  FLEET_VESSELS_REGISTRY,
} from './fleets.data';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`CONTRACT TEST FAILED: ${message}`);
  }
}

async function runContractTests() {
  console.log('--- Starting Module 19: Fleets Contract & Runtime Verification ---');

  // Test 1: Synchronous Initial Data Contract
  console.log('Test 1: Synchronous Initial Data Contract');
  const initial = FleetsService.getInitialFleets();
  assert(initial !== null && initial !== undefined, 'Initial payload must not be null or undefined');
  assert(Array.isArray(initial.vessels), 'initial.vessels must be an iterable Array');
  assert(initial.vessels.length === 54, `initial.vessels must contain 54 vessels, got ${initial.vessels.length}`);
  assert(Array.isArray(initial.owners), 'initial.owners must be an iterable Array');
  assert(initial.owners.length === 11, `initial.owners must contain 11 owners, got ${initial.owners.length}`);
  assert(Array.isArray(initial.operators), 'initial.operators must be an iterable Array');
  assert(initial.operators.length === 10, `initial.operators must contain 10 operators, got ${initial.operators.length}`);
  assert(typeof initial.timestamp === 'string', 'initial.timestamp must be a string');
  console.log('✓ Synchronous initial data contract passed.');

  // Test 2: Payload Normalization Resilience
  console.log('Test 2: Payload Normalization Resilience');
  // 2a. Null & Undefined
  const normNull = normalizeFleetPayload(null);
  assert(Array.isArray(normNull.vessels) && normNull.vessels.length === 54, 'null payload should fallback to seed');
  const normUndef = normalizeFleetPayload(undefined);
  assert(Array.isArray(normUndef.vessels) && normUndef.vessels.length === 54, 'undefined payload should fallback to seed');

  // 2b. Empty object
  const normEmpty = normalizeFleetPayload({});
  assert(Array.isArray(normEmpty.vessels) && normEmpty.vessels.length === 54, 'empty object should fallback to seed');

  // 2c. Non-array properties
  const normCorrupt = normalizeFleetPayload({
    vessels: 'not-an-array',
    owners: 12345,
    operators: null,
  });
  assert(Array.isArray(normCorrupt.vessels) && normCorrupt.vessels.length === 54, 'corrupted vessels should fallback');
  assert(Array.isArray(normCorrupt.owners) && normCorrupt.owners.length === 11, 'corrupted owners should fallback');
  assert(Array.isArray(normCorrupt.operators) && normCorrupt.operators.length === 10, 'corrupted operators should fallback');

  // 2d. Array with invalid objects
  const normFiltered = normalizeFleetPayload({
    vessels: [
      { id: 999, name: 'Invalid Vessel' }, // missing imo, coords, etc.
      FLEET_VESSELS_REGISTRY[0],
    ],
  });
  assert(normFiltered.vessels.length === 1, 'Invalid items must be filtered out');
  assert(normFiltered.vessels[0].name === FLEET_VESSELS_REGISTRY[0].name, 'Valid items must be preserved');
  console.log('✓ Payload normalization resilience passed.');

  // Test 3: Owner & Operator List Lookups
  console.log('Test 3: Owner & Operator List Lookups');
  const allOwners = FleetsService.getOwnersList();
  assert(allOwners.length === 11, `Expected 11 owners, got ${allOwners.length}`);
  const allOperators = FleetsService.getOperatorsList();
  assert(allOperators.length === 10, `Expected 10 operators, got ${allOperators.length}`);

  // Subset lookups
  const subsetVessels = FLEET_VESSELS_REGISTRY.slice(0, 5);
  const subsetOwners = FleetsService.getOwnersList(subsetVessels);
  assert(subsetOwners.length <= 5 && subsetOwners.length > 0, 'Subset owners should match subset vessels');
  const subsetOperators = FleetsService.getOperatorsList(subsetVessels);
  assert(subsetOperators.length <= 5 && subsetOperators.length > 0, 'Subset operators should match subset vessels');
  console.log('✓ Owner & Operator list lookups passed.');

  // Test 4: Region and Country Lookups
  console.log('Test 4: Region and Country Lookups');
  const regions = FleetsService.getAvailableRegions();
  assert(regions.length >= 5, `Expected at least 5 distinct regions, got ${regions.length}`);
  assert(regions.includes('Southeast Asia'), 'Should include Southeast Asia');
  assert(regions.includes('Middle East Gulf & Red Sea'), 'Should include Middle East Gulf & Red Sea');

  const allCountries = FleetsService.getAvailableCountries();
  assert(allCountries.length >= 8, `Expected at least 8 distinct countries, got ${allCountries.length}`);

  const seaCountries = FleetsService.getAvailableCountries(FLEET_VESSELS_REGISTRY, 'Southeast Asia');
  assert(seaCountries.includes('Singapore'), 'Southeast Asia should include Singapore');
  console.log('✓ Region and Country lookups passed.');

  // Test 5: CSV Export Sanitization
  console.log('Test 5: CSV Export Sanitization');
  const csv = FleetsService.exportToCsv(FLEET_VESSELS_REGISTRY);
  assert(typeof csv === 'string', 'CSV output must be a string');
  assert(csv.startsWith('Vessel Name,IMO Number,Vessel Class'), 'CSV must have correct header row');
  const lines = csv.trim().split('\n');
  assert(lines.length === 55, `CSV must have 1 header line + 54 data lines, got ${lines.length}`);
  console.log('✓ CSV export sanitization passed.');

  // Test 6: Asynchronous Service Contract
  console.log('Test 6: Asynchronous Service Contract');
  const asyncPayload = await FleetsService.getFleets();
  assert(Array.isArray(asyncPayload.vessels) && asyncPayload.vessels.length === 54, 'Async vessels array must be valid');
  assert(Array.isArray(asyncPayload.owners) && asyncPayload.owners.length === 11, 'Async owners array must be valid');
  assert(Array.isArray(asyncPayload.operators) && asyncPayload.operators.length === 10, 'Async operators array must be valid');
  console.log('✓ Asynchronous service contract passed.');

  console.log('--- ALL MODULE 19 FLEET CONTRACT TESTS PASSED ---');
}

runContractTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
