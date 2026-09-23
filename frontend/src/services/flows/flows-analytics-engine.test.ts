/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Analytics Engine Unit Tests
 */

import { FlowsAnalyticsEngine } from './flows-analytics-engine';
import { TradeFlowsService } from './trade-flows.service';
import { BENCHMARK_TRADE_FLOWS } from './trade-flows.data';
import type { FlowFiltersState } from '../../types/trade-flows';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Running Trade Flows Analytics Engine Test Suite ---');

// Test 1: calculateSafePercent
console.log('Test 1: calculateSafePercent edge cases');
assert(FlowsAnalyticsEngine.calculateSafePercent(50, 100) === 50, '50/100 should be 50%');
assert(FlowsAnalyticsEngine.calculateSafePercent(10, 0) === 0, 'Division by zero must return 0');
assert(FlowsAnalyticsEngine.calculateSafePercent(NaN, 100) === 0, 'NaN numerator must return 0');
assert(FlowsAnalyticsEngine.calculateSafePercent(10, NaN) === 0, 'NaN denominator must return 0');
assert(FlowsAnalyticsEngine.calculateSafePercent(1, 3) === 33.3, '1/3 should round to 33.3%');
console.log('✓ Test 1 passed');

// Test 2: formatVolumeMT & formatNativeVolume
console.log('Test 2: Volume formatting utilities');
assert(FlowsAnalyticsEngine.formatVolumeMT(0) === '0 MT', '0 should format to 0 MT');
assert(FlowsAnalyticsEngine.formatVolumeMT(NaN) === '0 MT', 'NaN should format to 0 MT');
assert(FlowsAnalyticsEngine.formatVolumeMT(480000) === '480k MT', '480,000 should format to 480k MT');
assert(FlowsAnalyticsEngine.formatVolumeMT(18500000) === '18.5M MT', '18.5M should format to 18.5M MT');
assert(FlowsAnalyticsEngine.formatNativeVolume(62780000, 'bbl') === '62.8M bbl', '62.8M bbl formatting');
assert(FlowsAnalyticsEngine.formatNativeVolume(9110000, 'm3') === '9.11M m3', '9.11M m3 formatting');
console.log('✓ Test 2 passed');

// Test 3: aggregateFlowVolume
console.log('Test 3: aggregateFlowVolume');
assert(FlowsAnalyticsEngine.aggregateFlowVolume([]) === 0, 'Empty flows should aggregate to 0 MT');
const dryFlows = BENCHMARK_TRADE_FLOWS.filter((f) => f.mode === 'dry');
const dryTotal = FlowsAnalyticsEngine.aggregateFlowVolume(dryFlows);
assert(dryTotal > 50000000, 'Dry bulk benchmark volume should exceed 50M MT');
console.log(`✓ Test 3 passed (Dry Total: ${FlowsAnalyticsEngine.formatVolumeMT(dryTotal)})`);

// Test 4: filterFlows
console.log('Test 4: filterFlows multi-attribute constraints');
const baseFilters: FlowFiltersState = {
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

// Filter by tanker mode
const tankerOnly = FlowsAnalyticsEngine.filterFlows(BENCHMARK_TRADE_FLOWS, baseFilters);
assert(tankerOnly.length > 0, 'Should return tanker flows');
assert(tankerOnly.every((f) => f.mode === 'tanker'), 'All flows must have tanker mode');

// Filter by commodity
const crudeOnly = FlowsAnalyticsEngine.filterFlows(BENCHMARK_TRADE_FLOWS, {
  ...baseFilters,
  commodity: 'Crude Oil',
});
assert(crudeOnly.length >= 3, 'Should find at least 3 crude oil corridors');
assert(crudeOnly.every((f) => f.commodity === 'Crude Oil'), 'All flows must be Crude Oil');

// Filter by origin country
const saudiOnly = FlowsAnalyticsEngine.filterFlows(BENCHMARK_TRADE_FLOWS, {
  ...baseFilters,
  originCountry: 'Saudi Arabia',
});
assert(saudiOnly.length >= 2, 'Should find at least 2 Saudi export flows');
assert(saudiOnly.every((f) => f.origin.country === 'Saudi Arabia'), 'Origin must be Saudi Arabia');

// Search query
const searchRotterdam = FlowsAnalyticsEngine.filterFlows(BENCHMARK_TRADE_FLOWS, {
  ...baseFilters,
  mode: 'tanker',
  searchQuery: 'rotterdam',
});
assert(searchRotterdam.length >= 1, 'Search query for Rotterdam should match US-NL crude');
console.log('✓ Test 4 passed');

// Test 5: synthesizeFlowSummary
console.log('Test 5: synthesizeFlowSummary KPI calculation');
const emptySummary = FlowsAnalyticsEngine.synthesizeFlowSummary([]);
assert(emptySummary.total_volume_mt === 0, 'Empty summary volume should be 0');
assert(emptySummary.active_flows_count === 0, 'Empty summary active flows should be 0');
assert(emptySummary.top_commodity === 'None', 'Empty summary top commodity should be None');

const drySummary = FlowsAnalyticsEngine.synthesizeFlowSummary(dryFlows);
assert(drySummary.active_flows_count === dryFlows.length, 'Active flows count must match dry flow count');
assert(drySummary.origin_ports_count > 0, 'Origin ports count must be > 0');
assert(drySummary.destination_ports_count > 0, 'Destination ports count must be > 0');
assert(drySummary.top_commodity === 'Iron Ore', 'Dry bulk top commodity should be Iron Ore');
assert(drySummary.avg_transit_days > 0, 'Average transit days must be > 0');
console.log(`✓ Test 5 passed (Top Commodity: ${drySummary.top_commodity}, Active: ${drySummary.active_flows_count})`);

// Test 6: aggregateByCommodity & aggregateByOrigin
console.log('Test 6: Multi-dimensional aggregations');
const commBreakdown = FlowsAnalyticsEngine.aggregateByCommodity(dryFlows);
assert(commBreakdown.length > 0, 'Commodity breakdown must not be empty');
assert(commBreakdown[0].label === 'Iron Ore', 'Iron Ore should have highest volume');
assert(commBreakdown[0].percentage > 0, 'Percentage must be greater than 0');

const originBreakdown = FlowsAnalyticsEngine.aggregateByOrigin(dryFlows, 'port');
assert(originBreakdown.length > 0, 'Origin breakdown must not be empty');
assert(originBreakdown[0].volume_mt >= originBreakdown[1].volume_mt, 'Breakdown must be sorted descending');
console.log('✓ Test 6 passed');

// Test 7: buildODMatrix
console.log('Test 7: buildODMatrix heatmap generation');
const emptyMatrix = FlowsAnalyticsEngine.buildODMatrix([]);
assert(emptyMatrix.origins.length === 0, 'Empty matrix origins should be empty');
assert(emptyMatrix.total_matrix_volume_mt === 0, 'Empty matrix total should be 0');

const odMatrix = FlowsAnalyticsEngine.buildODMatrix(dryFlows, 'port');
assert(odMatrix.origins.length > 0, 'OD Matrix must have origin ports');
assert(odMatrix.destinations.length > 0, 'OD Matrix must have destination ports');
assert(odMatrix.max_volume_mt > 0, 'OD Matrix max volume must be > 0');

// Check cell values
const hedlandQingdaoKey = 'Port Hedland:::Qingdao';
const cell = odMatrix.cells[hedlandQingdaoKey];
assert(cell !== undefined, 'Cell for Port Hedland to Qingdao must exist');
assert(cell.volume_mt === 18500000, 'Volume for Port Hedland to Qingdao should be 18.5M MT');
assert(cell.heat_intensity >= 0.8, 'Heat intensity for top route should be high');
assert(cell.voyages_count === 94, 'Voyages count should be 94');
console.log(`✓ Test 7 passed (Matrix: ${odMatrix.origins.length} Origins x ${odMatrix.destinations.length} Destinations)`);

// Test 8: buildHistoricalTrend
console.log('Test 8: buildHistoricalTrend time-series');
const trend = FlowsAnalyticsEngine.buildHistoricalTrend(dryFlows);
assert(trend.length === 6, 'Should have 6 months of historical trend observations');
assert(trend[0].date === '2026-04', 'First observation should be 2026-04');
assert(trend[5].date === '2026-09', 'Last observation should be 2026-09');
assert(trend.every((t) => t.volume_mt > 0), 'Every month must have positive volume');
console.log('✓ Test 8 passed');

// Test 9: buildMapFlowSegments
console.log('Test 9: buildMapFlowSegments arc calculation');
const segments = FlowsAnalyticsEngine.buildMapFlowSegments(BENCHMARK_TRADE_FLOWS);
assert(segments.length === BENCHMARK_TRADE_FLOWS.length, 'Should generate segment for each valid flow');
assert(segments.every((s) => s.curve_points.length === 17), 'Each arc should have 17 curve points (16 steps + 1)');
assert(segments.every((s) => s.stroke_width >= 2.5 && s.stroke_width <= 9.5), 'Stroke width must be clamped');

const tankerSegment = segments.find((s) => s.mode === 'tanker');
assert(tankerSegment?.stroke_color === '#f59e0b', 'Tanker segment stroke color should be amber');

const drySegment = segments.find((s) => s.mode === 'dry');
assert(drySegment?.stroke_color === '#38bdf8', 'Dry segment stroke color should be cyan');

const lngSegment = segments.find((s) => s.mode === 'lng');
assert(lngSegment?.stroke_color === '#c084fc', 'LNG segment stroke color should be purple');

const lpgSegment = segments.find((s) => s.mode === 'lpg');
assert(lpgSegment?.stroke_color === '#10b981', 'LPG segment stroke color should be emerald');
console.log('✓ Test 9 passed');

// Test 10: buildCommodityMovement
console.log('Test 10: buildCommodityMovement single-commodity drilldown');
const ironOreMove = FlowsAnalyticsEngine.buildCommodityMovement(dryFlows, 'Iron Ore');
assert(ironOreMove !== null, 'Iron Ore movement profile must not be null');
assert(ironOreMove!.commodity === 'Iron Ore', 'Commodity name should match');
assert(ironOreMove!.top_origins.length >= 2, 'Should have at least 2 top origins');
assert(ironOreMove!.top_destinations.length >= 2, 'Should have at least 2 top destinations');
assert(ironOreMove!.historical_trend.length === 6, 'Should have 6 months historical trend');
console.log('✓ Test 10 passed');
 
// Test 11: normalizeFlows with varied wrapper shapes
console.log('Test 11: normalizeFlows with varied API response shapes');
// Direct array
const directArray = TradeFlowsService.normalizeFlows(BENCHMARK_TRADE_FLOWS);
assert(Array.isArray(directArray) && directArray.length === BENCHMARK_TRADE_FLOWS.length, 'Direct array should normalize');

// Wrapped in { flows: [...] }
const wrappedFlows = TradeFlowsService.normalizeFlows({ flows: BENCHMARK_TRADE_FLOWS });
assert(Array.isArray(wrappedFlows) && wrappedFlows.length === BENCHMARK_TRADE_FLOWS.length, '{ flows: [...] } should unwrap');

// Wrapped in { data: { flows: [...] } }
const nestedFlows = TradeFlowsService.normalizeFlows({ data: { flows: BENCHMARK_TRADE_FLOWS } });
assert(Array.isArray(nestedFlows) && nestedFlows.length === BENCHMARK_TRADE_FLOWS.length, '{ data: { flows: [...] } } should unwrap');

// Valid empty array
const emptyNormalized = TradeFlowsService.normalizeFlows([]);
assert(Array.isArray(emptyNormalized) && emptyNormalized.length === 0, 'Empty array should normalize to empty array');
console.log('✓ Test 11 passed');

// Test 12: normalizeFlows with snake_case and backend variations
console.log('Test 12: normalizeFlows field normalization (snake_case to canonical)');
const backendPayload = [
  {
    id: 'BACKEND-01',
    route_code: 'SA-CN-CRUDE',
    mode: 'TANKER',
    commodity_name: 'Crude Oil',
    origin_port: 'Ras Tanura',
    origin_country: 'Saudi Arabia',
    origin_latitude: 26.64,
    origin_longitude: 50.16,
    destination_port: 'Ningbo-Zhoushan',
    destination_country: 'China',
    destination_latitude: 29.87,
    destination_longitude: 121.55,
    flow_volume: 12500000,
    volume_native: 91500000,
    native_unit: 'bbl',
    direction: 'EXPORT',
    vessel_class: 'VLCC',
    transit_days: 22,
  },
];
const normalizedBackend = TradeFlowsService.normalizeFlows(backendPayload);
assert(normalizedBackend.length === 1, 'Should normalize 1 backend record');
assert(normalizedBackend[0].trade_lane_code === 'SA-CN-CRUDE', 'route_code mapped to trade_lane_code');
assert(normalizedBackend[0].commodity === 'Crude Oil', 'commodity_name mapped to commodity');
assert(normalizedBackend[0].mode === 'tanker', 'Mode lowercased to tanker');
assert(normalizedBackend[0].origin.name === 'Ras Tanura', 'origin_port mapped to origin.name');
assert(normalizedBackend[0].destination.name === 'Ningbo-Zhoushan', 'destination_port mapped to destination.name');
assert(normalizedBackend[0].current_volume_mt === 12500000, 'flow_volume mapped to current_volume_mt');
assert(normalizedBackend[0].primary_vessel_class === 'VLCC', 'vessel_class mapped to primary_vessel_class');
console.log('✓ Test 12 passed');

// Test 13: normalizeFlows rejection on malformed structures
console.log('Test 13: normalizeFlows malformed response rejection');
let errorThrown = false;
try {
  TradeFlowsService.normalizeFlows(null);
} catch {
  errorThrown = true;
}
assert(errorThrown, 'Null response must throw descriptive error');

errorThrown = false;
try {
  TradeFlowsService.normalizeFlows({ brokenKey: 123 });
} catch {
  errorThrown = true;
}
assert(errorThrown, 'Object without flows/data must throw descriptive error');
console.log('✓ Test 13 passed');

// Test 14: getInitialFlows synchronous contract
console.log('Test 14: getInitialFlows returns synchronous TradeFlowRecord[]');
const initialFlows = TradeFlowsService.getInitialFlows();
assert(Array.isArray(initialFlows), 'Initial flows must be a real array');
assert(!(initialFlows instanceof Promise), 'Initial flows must NOT be a Promise');
assert(initialFlows.length > 0, 'Initial benchmark flows must be populated');
console.log('✓ Test 14 passed');

// Test 15: Engine methods with empty array
console.log('Test 15: FlowsAnalyticsEngine resilience on empty array input');
assert(FlowsAnalyticsEngine.aggregateByCommodity([]).length === 0, 'aggregateByCommodity([]) should return []');
assert(FlowsAnalyticsEngine.aggregateByOrigin([], 'port').length === 0, 'aggregateByOrigin([]) should return []');
assert(FlowsAnalyticsEngine.aggregateByDestination([], 'port').length === 0, 'aggregateByDestination([]) should return []');
assert(FlowsAnalyticsEngine.aggregateByRegion([]).length === 0, 'aggregateByRegion([]) should return []');
assert(FlowsAnalyticsEngine.aggregateByVesselClass([]).length === 0, 'aggregateByVesselClass([]) should return []');
assert(FlowsAnalyticsEngine.buildCommodityMovement([], 'Iron Ore') === null, 'buildCommodityMovement([]) should return null');
assert(FlowsAnalyticsEngine.buildMapFlowSegments([]).length === 0, 'buildMapFlowSegments([]) should return []');
assert(FlowsAnalyticsEngine.buildHistoricalTrend([]).length === 0, 'buildHistoricalTrend([]) should return []');
console.log('✓ Test 15 passed');

console.log('----------------------------------------------------');
console.log('ALL 15/15 TRADE FLOWS ANALYTICS UNIT TESTS PASSED!');
console.log('----------------------------------------------------');
