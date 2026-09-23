/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook Analytics Engine Unit Test Suite
 */

import { OrderbookAnalyticsEngine } from './orderbook-analytics-engine';
import { OrderbookService } from './orderbook.service';
import {
  BENCHMARK_ORDERS,
  BENCHMARK_DELIVERIES,
  BENCHMARK_DEMOLITIONS,
  BENCHMARK_FLEET_SNAPSHOTS,
  BENCHMARK_SHIPYARDS,
} from './orderbook.data';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Running Module 17: Orderbook Analytics Engine Test Suite ---');

// Test 1: calculateSafePercent
console.log('Test 1: calculateSafePercent safeguards');
assert(OrderbookAnalyticsEngine.calculateSafePercent(50, 100) === 50, '50/100 should be 50%');
assert(OrderbookAnalyticsEngine.calculateSafePercent(10, 0) === 0, 'Zero denominator must return 0');
assert(OrderbookAnalyticsEngine.calculateSafePercent(NaN, 100) === 0, 'NaN numerator must return 0');
assert(OrderbookAnalyticsEngine.calculateSafePercent(10, NaN) === 0, 'NaN denominator must return 0');
console.log('✓ Test 1 passed');

// Test 2: formatDwt & formatUsdMillions
console.log('Test 2: Number formatting utilities');
assert(OrderbookAnalyticsEngine.formatDwt(0) === '0 DWT', '0 DWT formatting');
assert(OrderbookAnalyticsEngine.formatDwt(210000) === '210k DWT', '210,000 DWT formatting');
assert(OrderbookAnalyticsEngine.formatDwt(378000000) === '378.0M DWT', '378M DWT formatting');
assert(OrderbookAnalyticsEngine.formatUsdMillions(84.5) === '$84.5M', '$84.5M formatting');
console.log('✓ Test 2 passed');

// Test 3: synthesizeSummaryMetrics
console.log('Test 3: synthesizeSummaryMetrics 6-pillar KPI calculation');
const summary = OrderbookAnalyticsEngine.synthesizeSummaryMetrics(
  BENCHMARK_ORDERS,
  BENCHMARK_DELIVERIES,
  BENCHMARK_DEMOLITIONS,
  BENCHMARK_FLEET_SNAPSHOTS,
  BENCHMARK_SHIPYARDS
);
assert(summary.active_fleet_vessels > 10000, 'Total active fleet vessels should exceed 10,000');
assert(summary.active_fleet_dwt > 1000000000, 'Total active fleet DWT should exceed 1 billion DWT');
assert(summary.orderbook_vessels === BENCHMARK_ORDERS.length, 'Orderbook vessel count must match benchmark orders');
assert(summary.orderbook_to_fleet_pct > 0 && summary.orderbook_to_fleet_pct < 50, 'Orderbook to fleet ratio reasonable');
assert(summary.green_propulsion_share_pct > 50, 'Green propulsion share should exceed 50%');
console.log(`✓ Test 3 passed (Orderbook: ${summary.orderbook_vessels} vessels, Ratio: ${summary.orderbook_to_fleet_pct}%)`);

// Test 4: calculateFleetGrowthSeries formula
console.log('Test 4: calculateFleetGrowthSeries formula (Beginning + Del - Demo = Ending)');
const growthSeries = OrderbookAnalyticsEngine.calculateFleetGrowthSeries(
  BENCHMARK_FLEET_SNAPSHOTS,
  BENCHMARK_DELIVERIES,
  BENCHMARK_DEMOLITIONS
);
assert(growthSeries.length >= 5, 'Growth series must include multiple years');
for (const pt of growthSeries) {
  const calculatedEnd = pt.beginning_fleet_dwt + pt.deliveries_dwt - pt.demolitions_dwt;
  assert(
    Math.abs(pt.ending_fleet_dwt - calculatedEnd) < 5,
    `Year ${pt.year}: Ending DWT (${pt.ending_fleet_dwt}) must equal Beginning + Del - Demo (${calculatedEnd})`
  );
  assert(pt.growth_rate_pct >= 0, `Year ${pt.year} growth rate must be non-negative`);
}
console.log('✓ Test 4 passed (Ending Fleet DWT matches Beginning + Deliveries - Demolitions)');

// Test 5: aggregateByVesselClass
console.log('Test 5: aggregateByVesselClass ratios');
const classAgg = OrderbookAnalyticsEngine.aggregateByVesselClass(BENCHMARK_ORDERS, BENCHMARK_FLEET_SNAPSHOTS);
assert(classAgg.length === BENCHMARK_FLEET_SNAPSHOTS.length, 'Should aggregate for all fleet classes');
assert(classAgg[0].orderbook_to_fleet_pct >= classAgg[1].orderbook_to_fleet_pct, 'Must be sorted descending by ratio');
const lngClass = classAgg.find((c) => c.vessel_class.includes('LNG'));
assert(lngClass !== undefined && lngClass.orderbook_to_fleet_pct > 30, 'LNG Carrier orderbook ratio should exceed 30%');
console.log('✓ Test 5 passed');

// Test 6: aggregateByShipyard
console.log('Test 6: aggregateByShipyard market share');
const yardAgg = OrderbookAnalyticsEngine.aggregateByShipyard(BENCHMARK_ORDERS, BENCHMARK_SHIPYARDS);
assert(yardAgg.length === BENCHMARK_SHIPYARDS.length, 'Should aggregate all shipyards');
assert(yardAgg[0].market_share_pct >= yardAgg[1].market_share_pct, 'Must be sorted descending by market share');
assert(yardAgg.some((y) => y.group === 'HD Hyundai'), 'Must include HD Hyundai');
assert(yardAgg.some((y) => y.group === 'CSSC'), 'Must include CSSC');
console.log('✓ Test 6 passed');

// Test 7: buildDeliveryTimeline
console.log('Test 7: buildDeliveryTimeline forward scheduling');
const timeline = OrderbookAnalyticsEngine.buildDeliveryTimeline(BENCHMARK_DELIVERIES);
assert(timeline.length > 0, 'Timeline must not be empty');
assert(timeline.every((t) => t.total_dwt > 0), 'Every scheduled period must have positive DWT');
assert(timeline.every((t) => typeof t.quarter === 'string'), 'Every period must have a quarter label');
console.log(`✓ Test 7 passed (${timeline.length} delivery quarters mapped)`);

// Test 8: aggregatePropulsionMix
console.log('Test 8: aggregatePropulsionMix green propulsion adoption');
const propMix = OrderbookAnalyticsEngine.aggregatePropulsionMix(BENCHMARK_ORDERS);
assert(propMix.length > 0, 'Propulsion mix must not be empty');
const dualFuel = propMix.find((p) => p.propulsion === 'Dual-Fuel LNG');
assert(dualFuel !== undefined && dualFuel.count > 0, 'Dual-Fuel LNG must be represented');
console.log('✓ Test 8 passed');

// Test 9: filterOrders multi-criteria constraints
console.log('Test 9: filterOrders constraints');
const dryOrders = OrderbookAnalyticsEngine.filterOrders(BENCHMARK_ORDERS, {
  searchQuery: '',
  sector: 'dry',
  vesselClass: 'all',
  shipyardCountry: 'all',
  shipyardGroup: 'all',
  status: 'all',
  propulsionType: 'all',
  deliveryYear: 'all',
});
assert(dryOrders.length > 0, 'Should find dry bulk orders');
assert(dryOrders.every((o) => o.sector === 'dry'), 'All filtered orders must be dry sector');

const searchMaersk = OrderbookAnalyticsEngine.filterOrders(BENCHMARK_ORDERS, {
  searchQuery: 'maersk',
  sector: 'all',
  vesselClass: 'all',
  shipyardCountry: 'all',
  shipyardGroup: 'all',
  status: 'all',
  propulsionType: 'all',
  deliveryYear: 'all',
});
assert(searchMaersk.length >= 1, 'Search for Maersk should return container order');
console.log('✓ Test 9 passed');

// Test 10: normalizeOrderbookData with wrappers & snake_case
console.log('Test 10: normalizeOrderbookData shape unwrap & field mapping');
const wrapped = OrderbookService.normalizeOrderbookData({
  data: {
    orders: [
      {
        id: 'RAW-01',
        hull_number: 'H-99',
        vessel_name: 'Raw Explorer',
        vessel_class: 'Capesize',
        sector: 'DRY',
        shipyard_name: 'Jiangnan Yard',
        shipyard_country: 'China',
        capacity_dwt: 210000,
        expected_delivery_date: '2026-10-10',
        contract_price_usd_m: 85,
        status: 'UNDER_CONSTRUCTION',
      },
    ],
  },
});
assert(wrapped.orders.length === 1, 'Should unwrap 1 order');
assert(wrapped.orders[0].vessel_name === 'Raw Explorer', 'Vessel name preserved');
assert(wrapped.orders[0].sector === 'dry', 'Sector lowercased');
assert(wrapped.orders[0].status === 'under_construction', 'Status normalized');
console.log('✓ Test 10 passed');

// Test 11: getInitialOrderbook returns synchronous iterable arrays
console.log('Test 11: getInitialOrderbook synchronous contract');
const initial = OrderbookService.getInitialOrderbook();
assert(Array.isArray(initial.orders), 'orders must be an Array');
assert(Array.isArray(initial.deliveries), 'deliveries must be an Array');
assert(Array.isArray(initial.shipyards), 'shipyards must be an Array');
assert(!(initial.orders instanceof Promise), 'orders must NOT be a Promise');
console.log('✓ Test 11 passed');

// Test 12: Malformed response rejection
console.log('Test 12: normalizeOrderbookData malformed response rejection');
let errorCaught = false;
try {
  OrderbookService.normalizeOrderbookData(null);
} catch {
  errorCaught = true;
}
assert(errorCaught, 'Null must throw an Error');
console.log('✓ Test 12 passed');

// Test 13: Empty array resilience
console.log('Test 13: Empty array resilience across all engine methods');
assert(OrderbookAnalyticsEngine.aggregateByVesselClass([], []).length === 0, 'aggregateByVesselClass empty');
assert(OrderbookAnalyticsEngine.aggregateByShipyard([], []).length === 0, 'aggregateByShipyard empty');
assert(OrderbookAnalyticsEngine.buildDeliveryTimeline([]).length === 0, 'buildDeliveryTimeline empty');
assert(OrderbookAnalyticsEngine.aggregatePropulsionMix([]).length === 0, 'aggregatePropulsionMix empty');
assert(OrderbookAnalyticsEngine.filterOrders([], {} as any).length === 0, 'filterOrders empty');
console.log('✓ Test 13 passed');

// Test 14: CSV export formatting
console.log('Test 14: exportToCsv formatting');
const csv = OrderbookService.exportToCsv(BENCHMARK_ORDERS.slice(0, 3));
assert(csv.includes('Order ID,Hull Number,Vessel Name'), 'CSV must contain headers');
assert(csv.includes('Berge Hesperus'), 'CSV must contain vessel names');
console.log('✓ Test 14 passed');

console.log('----------------------------------------------------');
console.log('ALL 14/14 ORDERBOOK ANALYTICS UNIT TESTS PASSED!');
console.log('----------------------------------------------------');
