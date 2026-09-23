/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics & Market Intelligence Unit Tests
 */

import { FreightAnalyticsEngine } from './freight-analytics-engine';
import { FreightAnalyticsService } from './freight-analytics.service';
import type { FreightRateBenchmark } from '../../types/freight-analytics';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- RUNNING FREIGHT ANALYTICS TEST SUITE ---');

  // Test 1: calculatePercentChange
  console.log('1. Testing calculatePercentChange');
  assert(FreightAnalyticsEngine.calculatePercentChange(110, 100) === 10, 'Normal positive pct change');
  assert(FreightAnalyticsEngine.calculatePercentChange(90, 100) === -10, 'Normal negative pct change');
  assert(FreightAnalyticsEngine.calculatePercentChange(100, 0) === 100, 'Zero denominator returns 100%');
  assert(FreightAnalyticsEngine.calculatePercentChange(0, 0) === 0, 'Zero to zero returns 0%');
  assert(FreightAnalyticsEngine.calculatePercentChange(NaN, 100) === 0, 'NaN input returns 0');
  assert(FreightAnalyticsEngine.calculatePercentChange(100, Infinity) === 0, 'Infinity input returns 0');

  // Test 2: computeSupplyUtilization
  console.log('2. Testing computeSupplyUtilization');
  const util = FreightAnalyticsEngine.computeSupplyUtilization(540, 280, 120, 60);
  assert(util === 82.0, `Utilization should be 82.0%, got ${util}`);
  assert(FreightAnalyticsEngine.computeSupplyUtilization(0, 0, 0, 0) === 0, 'Zero fleet utilization is 0');

  // Test 3: computeSpotFFASpreads
  console.log('3. Testing computeSpotFFASpreads');
  const sampleRates: FreightRateBenchmark[] = [
    {
      id: 'test-c5',
      route_code: 'C5',
      route_name: 'WAus-Qingdao',
      commodity: 'Iron Ore',
      origin_port: 'Port Hedland',
      destination_port: 'Qingdao',
      distance_nm: 3580,
      vessel_class: 'Capesize',
      segment: 'dry_bulk',
      region: 'pacific',
      rate_value: 10.0,
      rate_basis: 'per_mt',
      rate_currency: 'USD',
      change_1d_pct: 1.0,
      change_30d_pct: 5.0,
      high_52w: 15.0,
      low_52w: 7.0,
      sparkline_30d: [9, 10],
      historical_series: [],
      last_fixture_date: '2026-09-10'
    }
  ];

  const ffaCurves = await FreightAnalyticsService.getFFACurves('C5');
  const spreads = FreightAnalyticsEngine.computeSpotFFASpreads(sampleRates, ffaCurves);
  assert(spreads.length === 1, 'Computed 1 spread');
  assert(spreads[0].route_code === 'C5', 'Route code matches C5');
  assert(['contango', 'backwardation', 'neutral'].includes(spreads[0].state), 'Market structure computed');

  // Test 4: generateForecastProjections
  console.log('4. Testing generateForecastProjections');
  const forecast = FreightAnalyticsEngine.generateForecastProjections(sampleRates[0], 6.0, 3.5);
  assert(forecast.length === 5, 'Generates 5 forecast horizons (7d..90d)');
  assert(forecast[0].horizon === '7d', 'First horizon is 7d');
  assert(forecast[4].horizon === '90d', 'Last horizon is 90d');
  for (const pt of forecast) {
    assert(pt.projected_rate_usd > 0, 'Projected rate is positive');
    assert(pt.confidence_upper_usd > pt.projected_rate_usd, 'Upper band exceeds projection');
    assert(pt.confidence_lower_usd < pt.projected_rate_usd, 'Lower band below projection');
    assert(pt.confidence_score_pct >= 40 && pt.confidence_score_pct <= 100, 'Confidence score in bounds');
  }

  // Test 5: compareEntities
  console.log('5. Testing compareEntities');
  const comparison = FreightAnalyticsEngine.compareEntities(
    'route',
    { label: 'Route C5', metrics: { freight_rate: 9.65, distance_nm: 3580 } },
    { label: 'Route C3', metrics: { freight_rate: 24.80, distance_nm: 11200 } }
  );
  assert(comparison.metrics.length === 2, 'Two comparison metrics created');
  const rateMetric = comparison.metrics.find(m => m.name.includes('Freight Rate'));
  assert(rateMetric !== undefined, 'Found freight rate metric');
  assert(rateMetric!.delta === -15.15, 'Rate delta accurately computed');
  assert(comparison.analytical_commentary.length > 0, 'Commentary generated');

  // Test 6: exportToCsv
  console.log('6. Testing exportToCsv');
  const supply = await FreightAnalyticsService.getVesselSupply();
  const rates = await FreightAnalyticsService.getFreightRates();
  const csv = FreightAnalyticsEngine.exportToCsv(rates, supply.regional_distribution);
  assert(csv.includes('Route Code'), 'CSV contains Route Code header');
  assert(csv.includes('West Australia → Qingdao'), 'CSV contains C5 row');
  assert(csv.includes('Pacific Basin'), 'CSV contains Pacific region row');

  // Test 7: Service Filtering
  console.log('7. Testing FreightAnalyticsService filtering');
  const dryBulkRates = await FreightAnalyticsService.getFreightRates({
    dateRange: '30d',
    segment: 'dry_bulk',
    vesselClass: 'all',
    region: 'all',
    rateBasis: 'all',
    searchQuery: '',
    showOnlyCongested: false
  });
  assert(dryBulkRates.every(r => r.segment === 'dry_bulk'), 'All filtered rates are dry bulk');

  const searchResults = await FreightAnalyticsService.getFreightRates({
    dateRange: '30d',
    segment: 'all',
    vesselClass: 'all',
    region: 'all',
    rateBasis: 'all',
    searchQuery: 'TD3C',
    showOnlyCongested: false
  });
  assert(searchResults.length === 1 && searchResults[0].route_code === 'TD3C', 'Search query TD3C found 1 route');

  // Test 8: Market Summary
  console.log('8. Testing getMarketSummary');
  const summary = await FreightAnalyticsService.getMarketSummary();
  assert(summary.total_vessels_tracked > 0, 'Total vessels tracked is non-zero');
  assert(summary.active_commercial_supply_dwt > 0, 'Active supply DWT is non-zero');
  assert(summary.benchmark_freight_rate_usd > 0, 'Benchmark freight rate is non-zero');
  assert(summary.avg_anchorage_wait_hours > 0, 'Anchorage wait hours is non-zero');

  console.log('ALL 8 TEST SUITES PASSED CLEANLY (100% SUCCESS)');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
