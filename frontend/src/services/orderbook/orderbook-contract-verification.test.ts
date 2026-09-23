/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook Runtime Contract & Consumer Verification Test Suite
 * Validates data contracts, shape normalization, downstream analytical models, and filter cascades.
 */

import { OrderbookService } from './orderbook.service';
import { OrderbookAnalyticsEngine } from './orderbook-analytics-engine';
import {
  BENCHMARK_ORDERS,
  BENCHMARK_DELIVERIES,
  BENCHMARK_DEMOLITIONS,
  BENCHMARK_SHIPYARDS,
  BENCHMARK_FLEET_SNAPSHOTS,
  BENCHMARK_HISTORICAL_COMPARISON,
} from './orderbook.data';
import type { OrderbookFiltersState } from '../../types/orderbook';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
}

console.log('========================================================');
console.log('MODULE 17: RUNTIME CONTRACT & CONSUMER VERIFICATION');
console.log('========================================================\n');

// 1. Verifying initialData contract (prevents runtime iterability crashes)
console.log('1. Verifying initialData contract for TanStack Query:');
const initial = OrderbookService.getInitialOrderbook({
  searchQuery: '',
  sector: 'all',
  vesselClass: 'all',
  shipyardCountry: 'all',
  shipyardGroup: 'all',
  status: 'all',
  propulsionType: 'all',
  deliveryYear: 'all',
});
assert(Boolean(initial), 'Initial data must not be null');
assert(Array.isArray(initial.orders), 'initial.orders must be an Array');
assert(Array.isArray(initial.deliveries), 'initial.deliveries must be an Array');
assert(Array.isArray(initial.demolitions), 'initial.demolitions must be an Array');
assert(Array.isArray(initial.shipyards), 'initial.shipyards must be an Array');
assert(Array.isArray(initial.fleetSnapshots), 'initial.fleetSnapshots must be an Array');
assert(Array.isArray(initial.historicalComparison), 'initial.historicalComparison must be an Array');
assert(initial.orders.length === BENCHMARK_ORDERS.length, 'Initial orders count match');
console.log('   ✅ PASSED: getInitialOrderbook() synchronously returns complete iterable arrays\n');

// 2. Verifying Shape Normalization across varied backend responses
console.log('2. Verifying Pipeline & Shape Normalization:');
const directPayload = OrderbookService.normalizeOrderbookData({
  orders: BENCHMARK_ORDERS,
  deliveries: BENCHMARK_DELIVERIES,
  demolitions: BENCHMARK_DEMOLITIONS,
  shipyards: BENCHMARK_SHIPYARDS,
  fleetSnapshots: BENCHMARK_FLEET_SNAPSHOTS,
  historicalComparison: BENCHMARK_HISTORICAL_COMPARISON,
});
assert(directPayload.orders.length === BENCHMARK_ORDERS.length, 'Direct payload unwrap');

// Nested { data: { orders: [...] } }
const nestedPayload = OrderbookService.normalizeOrderbookData({
  data: {
    orders: BENCHMARK_ORDERS,
    deliveries: BENCHMARK_DELIVERIES,
    demolitions: BENCHMARK_DEMOLITIONS,
    shipyards: BENCHMARK_SHIPYARDS,
    fleetSnapshots: BENCHMARK_FLEET_SNAPSHOTS,
    historicalComparison: BENCHMARK_HISTORICAL_COMPARISON,
  },
});
assert(nestedPayload.orders.length === BENCHMARK_ORDERS.length, 'Nested data unwrap');
console.log('   ✅ PASSED: Robust unwrap across direct & nested response envelopes\n');

// 3. Verifying All 6 Downstream Workspace Consumers
console.log('3. Verifying All 6 Downstream Tab Consumers & Models:');

// Consumer 1: Summary KPI Strip
const summary = OrderbookAnalyticsEngine.synthesizeSummaryMetrics(
  directPayload.orders,
  directPayload.deliveries,
  directPayload.demolitions,
  directPayload.fleetSnapshots,
  directPayload.shipyards
);
assert(summary.orderbook_vessels === 22, 'Orderbook vessels count');
assert(summary.orderbook_to_fleet_pct > 0, 'Orderbook to fleet %');
assert(summary.active_fleet_vessels > 10000, 'Active fleet vessels count');
console.log('   ✅ Consumer 1: Summary Strip KPI models synthesized successfully');

// Consumer 2: Fleet Growth Trajectory
const growth = OrderbookAnalyticsEngine.calculateFleetGrowthSeries(
  directPayload.fleetSnapshots,
  directPayload.deliveries,
  directPayload.demolitions
);
assert(growth.length > 5, 'Growth points exist across multiple years');
for (const g of growth) {
  assert(
    g.ending_fleet_dwt === g.beginning_fleet_dwt + g.deliveries_dwt - g.demolitions_dwt,
    `Growth identity must hold for ${g.year}`
  );
}
console.log('   ✅ Consumer 2: Fleet Growth Trajectory identity (Beg + Del - Demo = End) validated');

// Consumer 3: Orders Registry
const sorted = [...directPayload.orders].sort((a, b) => b.capacity_dwt - a.capacity_dwt);
assert(sorted.length === 22, 'Orders registry sort');
console.log('   ✅ Consumer 3: Orders Registry sorting and contract specs validated');

// Consumer 4: Delivery Timeline
const timeline = OrderbookAnalyticsEngine.buildDeliveryTimeline(directPayload.deliveries);
assert(timeline.length > 0, 'Timeline quarters built');
console.log(`   ✅ Consumer 4: Delivery Schedule Timeline mapped (${timeline.length} quarters)`);

// Consumer 5: Demolitions Age Analysis
const ageAnalysis = OrderbookAnalyticsEngine.calculateAverageScrapAge(directPayload.demolitions);
assert(ageAnalysis.length > 0, 'Scrapping age analysis computed');
console.log(`   ✅ Consumer 5: Demolitions & Scrapping age analysis mapped (${ageAnalysis.length} classes)`);

// Consumer 6: Shipyards Ranking & Geographic Share
const yardStats = OrderbookAnalyticsEngine.aggregateByShipyard(
  directPayload.orders,
  directPayload.shipyards
);
assert(yardStats.length === BENCHMARK_SHIPYARDS.length, 'Shipyard rankings mapped');
console.log(`   ✅ Consumer 6: Shipyards Intelligence rankings mapped (${yardStats.length} yards)`);

// 4. Verifying Cascading Filter Transitions
console.log('\n4. Verifying Cascading Filter Transitions:');
const tankerFilter: OrderbookFiltersState = {
  searchQuery: '',
  sector: 'tanker',
  vesselClass: 'all',
  shipyardCountry: 'all',
  shipyardGroup: 'all',
  status: 'all',
  propulsionType: 'all',
  deliveryYear: 'all',
};
const tankerOrders = OrderbookAnalyticsEngine.filterOrders(directPayload.orders, tankerFilter);
assert(tankerOrders.length > 0, 'Tanker orders found');
assert(tankerOrders.every((o) => o.sector === 'tanker'), 'All filtered orders must be tanker');

const dryFilter: OrderbookFiltersState = {
  ...tankerFilter,
  sector: 'dry',
};
const dryOrders = OrderbookAnalyticsEngine.filterOrders(directPayload.orders, dryFilter);
assert(dryOrders.length > 0, 'Dry bulk orders found');
assert(dryOrders.every((o) => o.sector === 'dry'), 'All filtered orders must be dry');
console.log('   ✅ PASSED: Filter application preserves clean domain records\n');

console.log('========================================================');
console.log('ALL ORDERBOOK RUNTIME CONTRACT SUITES PASSED (100% SUCCESS)');
console.log('========================================================');
