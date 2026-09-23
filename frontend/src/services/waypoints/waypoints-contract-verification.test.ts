/**
 * Contract Verification Test Suite for Module 18: Waypoints Service Layer
 * Run with: npx tsx src/services/waypoints/waypoints-contract-verification.test.ts
 */

import { WaypointsService } from './waypoints.service';
import { MaritimeWaypointRecord } from '../../types/waypoints';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`CONTRACT TEST FAILED: ${message}`);
  }
}

async function runContractTests() {
  console.log('--- Starting Module 18: Waypoints Service Contract Verification ---');

  // Suite 1: getInitialWaypoints Synchronous Contract
  console.log('Suite 1: getInitialWaypoints Synchronous Contract');
  const initialData = WaypointsService.getInitialWaypoints();
  assert(initialData !== undefined && initialData !== null, 'Initial data must never be undefined or null');
  assert(Array.isArray(initialData.waypoints), 'initialData.waypoints must be an array');
  assert(initialData.waypoints.length === 34, `Expected 34 waypoints, got ${initialData.waypoints.length}`);
  assert(typeof initialData.activities === 'object', 'initialData.activities must be a record map');
  assert(typeof initialData.historicalTrends === 'object', 'initialData.historicalTrends must be a record map');
  console.log('✓ Synchronous initial data contract verified.');

  // Suite 2: Async getWaypoints Method
  console.log('Suite 2: Async getWaypoints Method');
  const asyncData = await WaypointsService.getWaypoints();
  assert(asyncData !== undefined && asyncData !== null, 'Async data must resolve to payload');
  assert(Array.isArray(asyncData.waypoints), 'asyncData.waypoints must be an array');
  assert(asyncData.waypoints.length === 34, `Expected 34 waypoints, got ${asyncData.waypoints.length}`);
  console.log('✓ Async data retrieval contract verified.');

  // Suite 3: Normalization Layer Resilience
  console.log('Suite 3: Normalization Layer Resilience');
  // Malformed: null
  const normNull = WaypointsService.normalizeWaypointsData(null);
  assert(Array.isArray(normNull.waypoints) && normNull.waypoints.length === 34, 'Null input gracefully falls back to canonical 34');

  // Malformed: empty object
  const normEmpty = WaypointsService.normalizeWaypointsData({});
  assert(Array.isArray(normEmpty.waypoints) && normEmpty.waypoints.length === 34, 'Empty object input gracefully falls back');

  // Malformed: waypoints with invalid coordinates
  const badCoordinatesPayload = {
    waypoints: [
      { id: 'wp-bad-1', name: 'Bad Lat', latitude: 120, longitude: 50 },
      { id: 'wp-bad-2', name: 'Bad Lng', latitude: 20, longitude: 250 },
      { id: 'wp-bad-3', name: 'NaN Lng', latitude: 20, longitude: NaN },
      { id: 'wp-good', name: 'Good WP', latitude: 10, longitude: 20 },
    ] as unknown as MaritimeWaypointRecord[],
    activities: {},
  };
  const normBad = WaypointsService.normalizeWaypointsData(badCoordinatesPayload);
  assert(normBad.waypoints.length === 1, `Expected 1 valid waypoint surviving normalization, got ${normBad.waypoints.length}`);
  assert(normBad.waypoints[0].id === 'wp-good', 'Only valid coordinate waypoint survived');
  console.log('✓ Normalization coordinate and shape resilience verified.');

  // Suite 4: Filter Getters
  console.log('Suite 4: Filter Options Extraction');
  const regions = WaypointsService.getAvailableRegions();
  const countries = WaypointsService.getAvailableCountries();
  const types = WaypointsService.getAvailableTypes();
  const classes = WaypointsService.getAvailableVesselClasses();

  assert(regions.length >= 6, `Expected at least 6 regions, got ${regions.length}`);
  assert(countries.length >= 10, `Expected at least 10 countries, got ${countries.length}`);
  assert(types.length === 5, `Expected 5 waypoint types, got ${types.length}`);
  assert(classes.length >= 8, `Expected at least 8 vessel classes, got ${classes.length}`);
  console.log(`✓ Filter getters verified: ${regions.length} regions, ${countries.length} countries, ${classes.length} vessel classes.`);

  // Suite 5: CSV Export Contract
  console.log('Suite 5: CSV Export Contract');
  const csv = WaypointsService.exportToCsv(initialData.waypoints, initialData.activities);
  assert(typeof csv === 'string', 'CSV must be a string');
  const lines = csv.split('\n');
  assert(lines.length === 35, `Expected header + 34 data rows (35 lines), got ${lines.length}`);
  assert(lines[0].startsWith('Waypoint ID,Name,Type'), 'CSV header structure verified');
  console.log('✓ CSV export contract verified.');

  console.log('--- ALL MODULE 18 CONTRACT VERIFICATION TESTS PASSED (5/5) ---');
}

runContractTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
