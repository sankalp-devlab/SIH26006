/**
 * Unit Test Suite for Module 18: Maritime Waypoints Analytics Engine
 * Run with: npx tsx src/services/waypoints/waypoints-analytics-engine.test.ts
 */

import {
  validateCoordinate,
  calculateCongestionLevel,
  calculateSafePercent,
  filterWaypoints,
  synthesizeGlobalSummary,
  rankWaypoints,
  aggregateByVesselClass,
  aggregateByMode,
  compareWaypoints,
  filterHistoricalTrends,
} from './waypoints-analytics-engine';

import {
  CHOKEPOINTS_REGISTRY,
  BENCHMARK_ACTIVITIES,
  GENERATED_HISTORICAL_TRENDS,
} from './waypoints.data';

import { WaypointFiltersState } from '../../types/waypoints';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 18: Waypoints Analytics Engine Tests ---');

// Test 1: Coordinate Validation
console.log('Test 1: Coordinate Validation');
assert(validateCoordinate(29.93, 32.55) === true, 'Suez Canal valid coordinates');
assert(validateCoordinate(-34.35, 18.47) === true, 'Cape of Good Hope valid coordinates');
assert(validateCoordinate(0, 0) === true, 'Equator / Prime Meridian');
assert(validateCoordinate(90, 180) === true, 'Boundary coordinates');
assert(validateCoordinate(-90, -180) === true, 'Negative boundary coordinates');
assert(validateCoordinate(91, 10) === false, 'Out of bounds latitude (>90)');
assert(validateCoordinate(-95, 10) === false, 'Out of bounds latitude (<-90)');
assert(validateCoordinate(10, 185) === false, 'Out of bounds longitude (>180)');
assert(validateCoordinate(10, -190) === false, 'Out of bounds longitude (<-180)');
assert(validateCoordinate(NaN, 10) === false, 'NaN latitude');
assert(validateCoordinate(10, NaN) === false, 'NaN longitude');
assert(validateCoordinate(Infinity, 10) === false, 'Infinity latitude');
assert(validateCoordinate('29.93', 32.55) === false, 'String latitude');
assert(validateCoordinate(null, undefined) === false, 'Null / Undefined');
console.log('✓ Coordinate validation passed.');

// Test 2: 34-Chokepoints Registry Integrity
console.log('Test 2: 34-Chokepoints Registry Integrity');
assert(CHOKEPOINTS_REGISTRY.length === 34, `Expected exactly 34 waypoints, got ${CHOKEPOINTS_REGISTRY.length}`);
CHOKEPOINTS_REGISTRY.forEach((wp) => {
  assert(wp.id.startsWith('wp-'), `Waypoint ID must start with wp-, got ${wp.id}`);
  assert(wp.name.length > 0, `Waypoint ${wp.id} missing name`);
  assert(validateCoordinate(wp.latitude, wp.longitude), `Waypoint ${wp.id} has invalid coordinates: ${wp.latitude}, ${wp.longitude}`);
  assert(wp.supportedModes.length > 0, `Waypoint ${wp.id} must support at least one mode`);
  assert(wp.primaryVesselClasses.length > 0, `Waypoint ${wp.id} must define primary vessel classes`);
  assert(wp.physicalConstraints.transitDurationHours > 0, `Waypoint ${wp.id} must have positive transit duration`);
  assert(wp.physicalConstraints.nominalDailyCapacity > 0, `Waypoint ${wp.id} must have positive daily capacity`);
  assert(BENCHMARK_ACTIVITIES[wp.id] !== undefined, `Benchmark activity missing for ${wp.id}`);
  assert(GENERATED_HISTORICAL_TRENDS[wp.id] !== undefined, `Historical trend missing for ${wp.id}`);
});
console.log('✓ All 34 chokepoints verified with authentic coordinates and constraints.');

// Test 3: Safe Percentage Calculation
console.log('Test 3: Safe Percentage Calculation');
assert(calculateSafePercent(50, 100) === 50.0, '50 / 100 = 50%');
assert(calculateSafePercent(1, 3) === 33.3, '1 / 3 = 33.3%');
assert(calculateSafePercent(0, 100) === 0, '0 / 100 = 0%');
assert(calculateSafePercent(50, 0) === 0, 'Zero denominator returns 0');
assert(calculateSafePercent(50, -10) === 0, 'Negative denominator returns 0');
assert(calculateSafePercent(NaN, 100) === 0, 'NaN numerator returns 0');
assert(calculateSafePercent(50, NaN) === 0, 'NaN denominator returns 0');
console.log('✓ Safe percentage calculation passed.');

// Test 4: Congestion Level Computation
console.log('Test 4: Congestion Level Computation');
assert(calculateCongestionLevel(85) === 'CRITICAL', '85 is CRITICAL');
assert(calculateCongestionLevel(75) === 'CRITICAL', '75 is CRITICAL');
assert(calculateCongestionLevel(70) === 'HIGH', '70 is HIGH');
assert(calculateCongestionLevel(60) === 'HIGH', '60 is HIGH');
assert(calculateCongestionLevel(50) === 'MODERATE', '50 is MODERATE');
assert(calculateCongestionLevel(35) === 'MODERATE', '35 is MODERATE');
assert(calculateCongestionLevel(25) === 'LOW', '25 is LOW');
assert(calculateCongestionLevel(0) === 'LOW', '0 is LOW');
console.log('✓ Congestion level computation passed.');

// Test 5: Filtering Waypoints
console.log('Test 5: Filtering Waypoints');
const baseFilters: WaypointFiltersState = {
  search: '',
  mode: 'all',
  vesselClass: 'all',
  region: 'all',
  country: 'all',
  waypointType: 'all',
  timeHorizon: '30d',
  congestionLevel: 'all',
};

const allWps = filterWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, baseFilters);
assert(allWps.length === 34, `Expected all 34 waypoints with empty filter, got ${allWps.length}`);

// Text search
const searchSuez = filterWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, { ...baseFilters, search: 'suez' });
assert(searchSuez.some((w) => w.id === 'wp-suez'), 'Search "suez" finds Suez Canal');
assert(searchSuez.length >= 1, 'Search "suez" returns matching waypoints');

// Mode filter: LNG
const lngWps = filterWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, { ...baseFilters, mode: 'lng' });
assert(lngWps.length > 0 && lngWps.every((w) => w.supportedModes.includes('lng')), 'LNG filter only returns LNG supported waypoints');

// Region filter
const middleEastWps = filterWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, { ...baseFilters, region: 'Middle East / Red Sea' });
assert(middleEastWps.length === 1 && middleEastWps[0].id === 'wp-suez', 'Region Middle East / Red Sea matches Suez');

// Type filter: CANAL
const canals = filterWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, { ...baseFilters, waypointType: 'CANAL' });
assert(canals.length === 3, `Expected 3 canals (Suez, Panama, Kiel), got ${canals.length}`);
console.log('✓ Multi-filter architecture passed.');

// Test 6: Summary Metrics Synthesis
console.log('Test 6: Summary Metrics Synthesis');
const summary = synthesizeGlobalSummary(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, baseFilters);
assert(summary.activeChokepointsCount === 34, 'Active chokepoints count must be 34');
assert(summary.totalVesselsInChokepoints > 500, 'Total vessels must be substantial');
assert(summary.totalWaitingVessels > 50, 'Total waiting vessels must be populated');
assert(summary.globalCongestionIndex > 0 && summary.globalCongestionIndex <= 100, 'Congestion index must be 0-100');
assert(summary.capeDetourVolumePct > 50, 'Cape detour percentage should reflect current Red Sea situation');
assert(summary.topBottleneckName.length > 0, 'Top bottleneck identified');
console.log(`✓ Global summary verified: ${summary.totalVesselsInChokepoints} vessels across ${summary.activeChokepointsCount} chokepoints, top bottleneck: ${summary.topBottleneckName}`);

// Test 7: Ranking Engine
console.log('Test 7: Ranking Engine');
const topTransits = rankWaypoints(CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES, 'transits24h', 5);
assert(topTransits.length === 5, 'Top 5 transits returned');
assert(topTransits[0].value >= topTransits[1].value, 'Ranked descending');
assert(topTransits[0].waypoint.id === 'wp-singapore' || topTransits[0].waypoint.id === 'wp-malacca', 'Singapore/Malacca lead global transit volume');
console.log(`✓ Transit rankings verified: #1 is ${topTransits[0].waypoint.name} with ${topTransits[0].value} transits/24h`);

// Test 8: Aggregations by Vessel Class and Mode
console.log('Test 8: Aggregations by Vessel Class and Mode');
const classAgg = aggregateByVesselClass(BENCHMARK_ACTIVITIES);
assert(classAgg.length > 0, 'Vessel class aggregation returned rows');
assert(classAgg[0].totalActive > 0, 'Top class has active vessels');

const modeAgg = aggregateByMode(BENCHMARK_ACTIVITIES);
assert(modeAgg.length === 4, 'Expected all 4 modes (tanker, dry, lng, lpg)');
const totalModePct = modeAgg.reduce((sum, m) => sum + m.percentage, 0);
assert(Math.round(totalModePct) === 100, `Mode percentages sum to ~100%, got ${totalModePct}`);
console.log('✓ Class and mode aggregations passed.');

// Test 9: Comparison Engine
console.log('Test 9: Comparison Engine');
const comp = compareWaypoints(['wp-suez', 'wp-cape-good-hope', 'wp-panama'], CHOKEPOINTS_REGISTRY, BENCHMARK_ACTIVITIES);
assert(comp.waypoints.length === 3, 'Compared 3 waypoints');
assert(comp.metrics.length === 3, 'Generated 3 comparison metrics');
const suezMetric = comp.metrics.find((m) => m.waypointId === 'wp-suez');
const capeMetric = comp.metrics.find((m) => m.waypointId === 'wp-cape-good-hope');
assert(suezMetric !== undefined && capeMetric !== undefined, 'Suez and Cape metrics present');
console.log(`✓ Comparison engine verified: Suez (${suezMetric?.transits24h} transits) vs Cape (${capeMetric?.transits24h} transits)`);

// Test 10: Historical Trend Filtering
console.log('Test 10: Historical Trend Filtering');
const suezHistory = GENERATED_HISTORICAL_TRENDS['wp-suez'];
const slice7d = filterHistoricalTrends(suezHistory, '7d');
const slice1y = filterHistoricalTrends(suezHistory, '1y');
assert(slice7d.length === 5, `Expected 5 observations for 7d, got ${slice7d.length}`);
assert(slice1y.length === suezHistory.length, '1y returns full historical series');
console.log('✓ Historical trend slicing passed.');

console.log('--- ALL MODULE 18 UNIT TESTS PASSED SUCCESSFULLY (10/10) ---');
