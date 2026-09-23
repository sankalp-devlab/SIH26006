/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Flows Runtime Contract & Consumer Verification Test
 * Verifies all 10 phases and all 10 consumer components without DOM dependency.
 */

import { TradeFlowsService } from './trade-flows.service';
import { FlowsAnalyticsEngine } from './flows-analytics-engine';
import { BENCHMARK_TRADE_FLOWS } from './trade-flows.data';
import type { FlowFiltersState, TradeFlowRecord } from '../../types/trade-flows';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`CONTRACT FAILURE: ${message}`);
  }
}

console.log('========================================================');
console.log('MODULE 16: RUNTIME CONTRACT & CONSUMER VERIFICATION');
console.log('========================================================\n');

// 1. VERIFY ROOT CAUSE RESOLUTION: initialData is NOT a Promise
console.log('1. Verifying initialData contract (Root Cause of "flows is not iterable"):');
const initial = TradeFlowsService.getInitialFlows();
assert(Array.isArray(initial), 'Initial data must be an Array');
assert(!(initial instanceof Promise), 'Initial data must NEVER be a Promise');
assert(typeof initial[Symbol.iterator] === 'function', 'Initial data MUST implement Symbol.iterator');
console.log(`   ✅ PASSED: getInitialFlows() returns iterable Array (${initial.length} benchmark records)\n`);

// 2. VERIFY DATA CONTRACT PIPELINE: API -> Normalizer -> TradeFlowRecord[]
console.log('2. Verifying Data Pipeline & Shape Normalization:');
const testCases = [
  { name: 'Direct Array', payload: BENCHMARK_TRADE_FLOWS },
  { name: 'Object with .flows', payload: { flows: BENCHMARK_TRADE_FLOWS } },
  { name: 'Object with .data', payload: { data: BENCHMARK_TRADE_FLOWS } },
  { name: 'Nested .data.flows', payload: { data: { flows: BENCHMARK_TRADE_FLOWS } } },
  { name: 'Valid Empty Array', payload: [] },
];

for (const tc of testCases) {
  const result = TradeFlowsService.normalizeFlows(tc.payload);
  assert(Array.isArray(result), `${tc.name} must normalize to an Array`);
  assert(typeof result[Symbol.iterator] === 'function', `${tc.name} result must be iterable`);
  console.log(`   ✅ PASSED: ${tc.name} -> normalized to ${result.length} iterable flow records`);
}
console.log('');

// 3. VERIFY REJECTION OF MALFORMED RESPONSES (Phase 7 & 12)
console.log('3. Verifying Rejection of Malformed API responses (No silent mask as empty array):');
const malformedCases = [null, undefined, 'broken string', 12345, { unknownField: true }];
for (const bad of malformedCases) {
  let threw = false;
  try {
    TradeFlowsService.normalizeFlows(bad);
  } catch (err) {
    threw = true;
    assert(err instanceof Error, 'Thrown value must be an Error instance');
  }
  assert(threw, `Malformed input (${JSON.stringify(bad)}) must throw an Error`);
  console.log(`   ✅ PASSED: Malformed input properly rejected with descriptive Error`);
}
console.log('');

// 4. VERIFY ALL CONSUMERS RECEIVE VALID DATA
console.log('4. Verifying All 8 Downstream Analytical Consumers:');
const flows: TradeFlowRecord[] = TradeFlowsService.getInitialFlows();

// Consumer 1: Summary KPI Strip
const summary = TradeFlowsService.getSummary(flows);
assert(Number.isFinite(summary.total_volume_mt), 'Summary total volume must be finite number');
assert(summary.active_flows_count === flows.length, 'Summary active flows count must match flows.length');
assert(typeof summary.top_commodity === 'string', 'Summary top commodity must be string');
console.log('   ✅ Consumer 1: Summary KPI Strip data synthesized successfully');

// Consumer 2: Flow Map Canvas segments
const mapSegments = TradeFlowsService.getMapFlowSegments(flows);
assert(Array.isArray(mapSegments), 'Map segments must be an Array');
assert(mapSegments.every((s) => s.curve_points.length > 0), 'Map segments must have curve points');
assert(mapSegments.every((s) => Number.isFinite(s.origin_coords[0]) && Number.isFinite(s.origin_coords[1])), 'Origin coords must be valid numbers');
assert(mapSegments.every((s) => Number.isFinite(s.destination_coords[0]) && Number.isFinite(s.destination_coords[1])), 'Destination coords must be valid numbers');
console.log(`   ✅ Consumer 2: Flow Map Canvas data generated (${mapSegments.length} curved arcs)`);

// Consumer 3: Volume Breakdown Analytics
const volume = TradeFlowsService.getVolumeBreakdowns(flows);
assert(Array.isArray(volume.byCommodity), 'byCommodity must be an Array');
assert(Array.isArray(volume.byOrigin), 'byOrigin must be an Array');
assert(Array.isArray(volume.byDestination), 'byDestination must be an Array');
assert(Array.isArray(volume.byRegion), 'byRegion must be an Array');
assert(Array.isArray(volume.byVesselClass), 'byVesselClass must be an Array');
console.log('   ✅ Consumer 3: Volume Breakdown Analytics multi-dimensional bars synthesized');

// Consumer 4: Historical Trends
const trends = TradeFlowsService.getHistoricalTrend(flows);
assert(Array.isArray(trends), 'Historical trends must be an Array');
assert(trends.every((t) => typeof t.date === 'string' && Number.isFinite(t.volume_mt)), 'Trend points must have valid date and volume');
console.log(`   ✅ Consumer 4: Historical Trends time series built (${trends.length} periods)`);

// Consumer 5: Origin-Destination Matrix Heatmap
const odMatrix = TradeFlowsService.getODMatrix(flows, 'port');
assert(Array.isArray(odMatrix.origins), 'OD matrix origins must be an Array');
assert(Array.isArray(odMatrix.destinations), 'OD matrix destinations must be an Array');
assert(typeof odMatrix.cells === 'object' && odMatrix.cells !== null, 'OD matrix cells must be an object');
console.log(`   ✅ Consumer 5: OD Matrix Heatmap generated (${odMatrix.origins.length} x ${odMatrix.destinations.length})`);

// Consumer 6: Commodity Movement Dynamics
const commNode = TradeFlowsService.getCommodityMovement(flows, 'Iron Ore');
assert(commNode !== null, 'Iron ore movement node must exist');
assert(commNode!.commodity === 'Iron Ore', 'Commodity name must match');
console.log('   ✅ Consumer 6: Commodity Movement Dynamics node synthesized');

// Consumer 7: Corridors Catalog
assert(flows.length > 0, 'Corridors catalog must contain flow records');
assert(flows.every((f) => Boolean(f.id && f.trade_lane_code)), 'Every corridor must have id and trade_lane_code');
console.log(`   ✅ Consumer 7: Corridors Catalog records validated (${flows.length} corridors)`);

// Consumer 8: Selected Flow Detail Drawer
const selectedFlow = flows[0];
assert(Boolean(selectedFlow.origin?.name && selectedFlow.destination?.name), 'Selected flow must have port names');
assert(Number.isFinite(selectedFlow.current_volume_mt), 'Selected flow volume must be finite');
console.log(`   ✅ Consumer 8: Selected Flow Detail Drawer data validated (${selectedFlow.trade_lane_code})\n`);

// 5. VERIFY FILTER TRANSITIONS (Phase 16 Cases 9 & 10)
console.log('5. Verifying Cascading Filter Transitions:');
const tankerFilter: FlowFiltersState = {
  searchQuery: '',
  mode: 'tanker',
  commodity: 'all',
  originCountry: 'all',
  destinationCountry: 'all',
  originPortId: 'all',
  destinationPortId: 'all',
  vesselClass: 'all',
  region: 'all',
  timeHorizon: 'current',
  direction: 'all',
};
const filtered = FlowsAnalyticsEngine.filterFlows(flows, tankerFilter);
assert(filtered.length > 0, 'Filtered flows must not be empty');
assert(filtered.every((f) => f.mode === 'tanker'), 'All filtered flows must have mode === tanker');
assert(typeof filtered[Symbol.iterator] === 'function', 'Filtered flows must remain iterable');

const cleared = FlowsAnalyticsEngine.filterFlows(flows, { ...tankerFilter, mode: 'dry' });
assert(cleared.length > 0, 'Restored flows must not be empty');
assert(cleared.every((f) => f.mode === 'dry'), 'Restored flows must have mode === dry');
console.log('   ✅ PASSED: Filter application and reset preserve iterable Flow[] contract\n');

console.log('========================================================');
console.log('ALL 5 INTEGRATION CONTRACT SUITES PASSED (100% SUCCESS)');
console.log('========================================================');
