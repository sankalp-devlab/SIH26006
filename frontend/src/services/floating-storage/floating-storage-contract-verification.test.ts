/**
 * Contract & Data Flow Verification Test Suite for Module 20: Floating Storage Service
 * Run with: npx tsx src/services/floating-storage/floating-storage-contract-verification.test.ts
 */

import { FloatingStorageService } from './floating-storage.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`CONTRACT TEST FAILED: ${message}`);
  }
}

async function runContractTests() {
  console.log('--- Starting Module 20: Floating Storage Contract Tests ---');

  // Test 1: Synchronous Initial Data Contract
  console.log('Test 1: Synchronous Initial Data Contract');
  const initial = FloatingStorageService.getInitialFloatingStorage();
  assert(initial !== undefined && initial !== null, 'Initial data must not be null/undefined');
  assert(Array.isArray(initial.vessels), 'initial.vessels must be an array');
  assert(initial.vessels.length === 42, `Expected 42 initial vessels, got ${initial.vessels.length}`);
  assert(
    Array.isArray(initial.historicalSnapshots),
    'initial.historicalSnapshots must be an array'
  );
  assert(
    initial.historicalSnapshots.length === 11,
    `Expected 11 snapshots, got ${initial.historicalSnapshots.length}`
  );
  assert(typeof initial.timestamp === 'string', 'Initial timestamp must be string');
  assert(initial.dataState === 'live', 'Initial dataState must be live');
  console.log('✓ Synchronous initial data contract verified.');

  // Test 2: Normalization against null, undefined, and corrupted inputs
  console.log('Test 2: Normalization Robustness');
  const normNull = FloatingStorageService.normalizeFloatingStoragePayload(null);
  assert(Array.isArray(normNull.vessels), 'normNull.vessels must be an array');
  assert(normNull.vessels.length === 42, 'normNull fallback to 42 mock vessels');

  const normUndefined = FloatingStorageService.normalizeFloatingStoragePayload(undefined);
  assert(normUndefined.vessels.length === 42, 'normUndefined fallback to 42 mock vessels');

  const normPrimitive = FloatingStorageService.normalizeFloatingStoragePayload('bad string');
  assert(normPrimitive.vessels.length === 42, 'normPrimitive fallback to 42 mock vessels');

  // Corrupted vessels array
  const corruptedVesselsPayload = {
    vessels: [
      null,
      123,
      { id: 'bad-1', vesselName: 'Incomplete' }, // missing lat/lng, volume
      {
        id: 'fs-valid-1',
        vesselName: 'Test Vessel',
        latitude: 1.25,
        longitude: 103.8,
        volumeBbl: 2000000,
      },
      {
        id: 'fs-invalid-coords',
        vesselName: 'Bad Coords',
        latitude: 95.0, // invalid > 90
        longitude: 100.0,
        volumeBbl: 1000000,
      },
    ],
    timestamp: '2026-03-01T00:00:00Z',
    dataState: 'live',
  };
  const normCorrupted =
    FloatingStorageService.normalizeFloatingStoragePayload(corruptedVesselsPayload);
  assert(normCorrupted.vessels.length === 1, 'Only valid vessel should be kept');
  assert(normCorrupted.vessels[0].id === 'fs-valid-1', 'Correct valid vessel preserved');

  // If candidate had empty/zero valid vessels, ensure fallback to 42 vessels
  const emptyVesselsPayload = { vessels: [] };
  const normEmpty = FloatingStorageService.normalizeFloatingStoragePayload(emptyVesselsPayload);
  assert(normEmpty.vessels.length === 42, 'Empty array triggers fallback to 42 mock vessels');
  console.log('✓ Normalization robustness verified.');

  // Test 3: Async Fetcher Contract
  console.log('Test 3: Async Fetcher Contract');
  const livePayload = await FloatingStorageService.getFloatingStorage();
  assert(livePayload.vessels.length === 42, 'Async fetch returns 42 vessels by default');
  assert(livePayload.dataState === 'live', 'Default dataState is live');

  const filteredPayload = await FloatingStorageService.getFloatingStorage({
    search: '',
    cargoType: 'Crude Oil',
    crudeGrade: 'all',
    region: 'all',
    minStationaryDays: 7,
    dataState: 'live',
    vesselClass: 'all',
  });
  assert(filteredPayload.vessels.length > 0, 'Filtered crude vessels stationary >= 7 days found');
  assert(
    filteredPayload.vessels.every((v) => v.cargoType === 'Crude Oil' && v.stationaryDays >= 7),
    'All vessels in payload must meet filter criteria'
  );
  console.log('✓ Async fetcher contract verified.');

  // Test 4: Vessel Lookup by ID
  console.log('Test 4: Vessel Lookup by ID');
  const v1 = await FloatingStorageService.getFloatingStorageById('fs-101');
  assert(v1 !== null, 'Vessel fs-101 must exist');
  assert(v1?.vesselName === 'OCEANIA STAR', 'fs-101 is OCEANIA STAR');

  const nonExistent = await FloatingStorageService.getFloatingStorageById('non-existent-id');
  assert(nonExistent === null, 'Non-existent ID must return null');
  console.log('✓ Vessel lookup by ID verified.');

  // Test 5: CSV Export Contract
  console.log('Test 5: CSV Export Contract');
  const csv = FloatingStorageService.exportToCsv(initial.vessels);
  assert(typeof csv === 'string', 'CSV output must be string');
  const lines = csv.split('\n');
  assert(lines.length === 43, `Expected header + 42 rows = 43 lines, got ${lines.length}`);
  assert(lines[0].includes('Vessel Name'), 'Header must contain Vessel Name');
  assert(lines[0].includes('IMO'), 'Header must contain IMO');
  assert(lines[0].includes('Crude Grade'), 'Header must contain Crude Grade');
  assert(lines[0].includes('Stationary Days'), 'Header must contain Stationary Days');
  assert(lines[1].includes('OCEANIA STAR'), 'First data row must contain OCEANIA STAR');
  console.log('✓ CSV export contract verified.');

  console.log('\n=============================================================');
  console.log('ALL MODULE 20 FLOATING STORAGE CONTRACT TESTS PASSED (5/5)');
  console.log('=============================================================');
}

runContractTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
