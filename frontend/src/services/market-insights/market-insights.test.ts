/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights Automated Test Suite
 */

import { MarketAnalyticsEngine } from './market-analytics-engine';
import { MarketInsightsService } from './market-insights.service';
import { MarketWatchlistService } from './market-watchlist.service';
import { STRUCTURED_MARKET_ROUTES } from './market-routes.data';
import type { MarketRouteCode } from '../../types/market-insights';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runMarketInsightsTestSuite() {
  console.log('====================================================');
  console.log('RUNNING MODULE 5: MARKET INSIGHTS TEST SUITE');
  console.log('====================================================');

  // 1. Percentage Change Calculations
  console.log('1. Testing MarketAnalyticsEngine.calculatePercentChange');
  assert(MarketAnalyticsEngine.calculatePercentChange(110, 100) === 10, 'Normal positive percentage change');
  assert(MarketAnalyticsEngine.calculatePercentChange(90, 100) === -10, 'Normal negative percentage change');
  assert(MarketAnalyticsEngine.calculatePercentChange(100, 0) === 100, 'Zero denominator returns 100');
  assert(MarketAnalyticsEngine.calculatePercentChange(0, 0) === 0, 'Zero to zero returns 0');
  assert(MarketAnalyticsEngine.calculatePercentChange(NaN, 100) === 0, 'NaN input returns 0');
  assert(MarketAnalyticsEngine.calculatePercentChange(100, Infinity) === 0, 'Infinity input returns 0');
  assert(MarketAnalyticsEngine.calculatePercentChange(-50, -100) === 50, 'Negative to less negative change');
  console.log('  ✅ Passed percentage change calculations');

  // 2. Fleet Utilization Calculations
  console.log('2. Testing MarketAnalyticsEngine.calculateFleetUtilization');
  assert(MarketAnalyticsEngine.calculateFleetUtilization(8200, 10000) === 82.0, 'Normal 82% utilization');
  assert(MarketAnalyticsEngine.calculateFleetUtilization(0, 10000) === 0, 'Zero active vessels returns 0%');
  assert(MarketAnalyticsEngine.calculateFleetUtilization(10000, 0) === 0, 'Zero total fleet returns 0%');
  assert(MarketAnalyticsEngine.calculateFleetUtilization(NaN, 100) === 0, 'NaN input returns 0%');
  console.log('  ✅ Passed fleet utilization calculations');

  // 3. Supply-Demand Balance & Directional Pressure
  console.log('3. Testing MarketAnalyticsEngine.calculateSupplyDemandBalance');
  const tightening = MarketAnalyticsEngine.calculateSupplyDemandBalance(1.0, 6.0, 84);
  assert(tightening.state === 'tightening', 'Tightening state detected');
  assert(tightening.ratio > 1.0, 'Ratio reflects tightening pressure');
  assert(tightening.confidence >= 70 && tightening.confidence <= 100, 'Confidence within bounds');

  const widening = MarketAnalyticsEngine.calculateSupplyDemandBalance(5.0, 1.0, 80);
  assert(widening.state === 'widening', 'Widening state detected');
  assert(widening.ratio < 1.0, 'Ratio reflects widening supply');

  const constrained = MarketAnalyticsEngine.calculateSupplyDemandBalance(2.0, 8.0, 94);
  assert(constrained.state === 'supply_constrained', 'High utilization triggers supply_constrained');

  const softening = MarketAnalyticsEngine.calculateSupplyDemandBalance(1.0, -4.0, 78);
  assert(softening.state === 'demand_softening', 'Negative demand triggers demand_softening');
  console.log('  ✅ Passed supply-demand balance logic');

  // 4. Market Trend Evaluation
  console.log('4. Testing MarketAnalyticsEngine.calculateMarketTrend');
  assert(MarketAnalyticsEngine.calculateMarketTrend([10, 11, 12, 14]) === 'increasing', 'Increasing series detected');
  assert(MarketAnalyticsEngine.calculateMarketTrend([14, 13, 11, 10]) === 'decreasing', 'Decreasing series detected');
  assert(MarketAnalyticsEngine.calculateMarketTrend([10, 10.1, 9.9, 10]) === 'stable', 'Stable series detected');
  assert(MarketAnalyticsEngine.calculateMarketTrend([]) === 'stable', 'Empty series returns stable');
  assert(MarketAnalyticsEngine.calculateMarketTrend([10]) === 'stable', 'Single item returns stable');
  console.log('  ✅ Passed market trend evaluation');

  // 5. Verification of All 12 Structured Routes
  console.log('5. Validating All 12 Structured Market Routes (C3, C5, P1, P2, P3, S8, TD3, TD15, TD19, TD25, TC2, TC14)');
  const expectedRoutes: MarketRouteCode[] = [
    'C3', 'C5', 'P1', 'P2', 'P3', 'S8',
    'TD3', 'TD15', 'TD19', 'TD25', 'TC2', 'TC14'
  ];

  assert(STRUCTURED_MARKET_ROUTES.length === 12, `Must contain exactly 12 benchmark routes, got ${STRUCTURED_MARKET_ROUTES.length}`);

  for (const code of expectedRoutes) {
    const route = STRUCTURED_MARKET_ROUTES.find(r => r.route_code === code);
    assert(route !== undefined, `Route ${code} must exist in repository`);
    assert(route!.distance_nm > 0, `Route ${code} must have positive distance`);
    assert(route!.origin_port.length > 0, `Route ${code} must have an origin port`);
    assert(route!.destination_port.length > 0, `Route ${code} must have a destination port`);
    assert(route!.commodity.length > 0, `Route ${code} must specify a commodity`);
    assert(route!.vessel_class.length > 0, `Route ${code} must specify a vessel class`);
  }
  console.log('  ✅ All 12 benchmark routes verified with complete metadata');

  // 6. Cascading Route Filter Logic
  console.log('6. Testing Cascading Market & Vessel Class Filters');
  const dryRoutes = MarketInsightsService.getStructuredRoutes({ sector: 'dry' });
  assert(dryRoutes.every(r => r.sector === 'dry'), 'Dry sector filter only returns dry routes');
  assert(dryRoutes.some(r => r.route_code === 'C5'), 'Dry sector includes C5');
  assert(!dryRoutes.some(r => r.route_code === 'TD3'), 'Dry sector excludes tanker TD3');

  const capesizeRoutes = MarketInsightsService.getStructuredRoutes({ sector: 'dry', vesselClass: 'Capesize' });
  assert(capesizeRoutes.length === 2, 'Capesize filter returns exactly C3 and C5');
  assert(capesizeRoutes.every(r => r.vessel_class === 'Capesize'), 'All are Capesize');

  const vlccRoutes = MarketInsightsService.getStructuredRoutes({ sector: 'tanker', vesselClass: 'VLCC' });
  assert(vlccRoutes.length === 2, 'VLCC filter returns exactly TD3 and TD15');
  assert(vlccRoutes.every(r => r.vessel_class === 'VLCC'), 'All are VLCC');

  const mrRoutes = MarketInsightsService.getStructuredRoutes({ sector: 'tanker', vesselClass: 'MR' });
  assert(mrRoutes.length === 2, 'MR filter returns exactly TC2 and TC14');
  console.log('  ✅ Cascading filters operate correctly');

  // 7. Synthesizing 5 Commercial Signals
  console.log('7. Testing MarketAnalyticsEngine.synthesizeMarketSignals');
  const supply = await MarketInsightsService.getSupplyMetrics();
  const demand = await MarketInsightsService.getDemandMetrics();
  const congestion = await MarketInsightsService.getCongestionMetrics();
  const availability = await MarketInsightsService.getVesselAvailability();
  const freight = MarketInsightsService.getRouteByCode('C5')?.freight || null;

  const signalSummary = MarketAnalyticsEngine.synthesizeMarketSignals(supply, demand, freight, congestion, availability);
  assert(signalSummary.signals.length === 5, 'Must synthesize 5 core commercial signals');
  assert(signalSummary.signals.some(s => s.key === 'supply'), 'Supply signal present');
  assert(signalSummary.signals.some(s => s.key === 'demand'), 'Demand signal present');
  assert(signalSummary.signals.some(s => s.key === 'freight'), 'Freight signal present');
  assert(signalSummary.signals.some(s => s.key === 'congestion'), 'Congestion signal present');
  assert(signalSummary.signals.some(s => s.key === 'availability'), 'Availability signal present');
  assert(signalSummary.pressure_narrative.length > 0, 'Balance narrative generated');
  console.log('  ✅ Passed commercial signals synthesis');

  // 8. Multi-Entity Comparison Factory
  console.log('8. Testing MarketInsightsService.compare');
  const routeComparison = MarketInsightsService.compare('route', 'C5', 'C3');
  assert(routeComparison.type === 'route', 'Route comparison type set');
  assert(routeComparison.metrics.length > 0, 'Generates comparison metric rows');
  assert(routeComparison.analytical_commentary.length > 0, 'Generates analytical commentary');

  const marketComparison = MarketInsightsService.compare('market', 'Dry Bulk', 'Tanker');
  assert(marketComparison.type === 'market', 'Market comparison type set');
  assert(marketComparison.metrics.length > 0, 'Market metrics generated');
  console.log('  ✅ Multi-entity comparison engine verified');

  // 9. Market Watchlist Persistence
  console.log('9. Testing MarketWatchlistService');
  const initialWatchlist = MarketWatchlistService.getWatchlist();
  assert(Array.isArray(initialWatchlist), 'Watchlist returns an array');
  assert(MarketWatchlistService.isWatched('C5'), 'Default watchlist contains C5');

  // Toggle watch C5 (should remove or unpin)
  const isNowPinned = MarketWatchlistService.toggleWatch({
    id: 'test-item',
    type: 'route',
    code: 'C5',
    title: 'C5 Route',
    sector: 'dry'
  });
  assert(!isNowPinned, 'Toggle watch unpinned C5');
  assert(!MarketWatchlistService.isWatched('C5'), 'C5 is no longer watched');

  // Re-pin C5
  const rePinned = MarketWatchlistService.toggleWatch({
    id: 'test-item',
    type: 'route',
    code: 'C5',
    title: 'C5 Route',
    sector: 'dry'
  });
  assert(rePinned, 'Toggle watch re-pinned C5');
  assert(MarketWatchlistService.isWatched('C5'), 'C5 is watched again');
  console.log('  ✅ Market watchlist persistence verified');

  // 10. Consolidated Workspace Payload
  console.log('10. Testing MarketInsightsService.getMarketWorkspace');
  const workspace = await MarketInsightsService.getMarketWorkspace({
    sector: 'dry',
    vesselClass: 'Capesize',
    routeCode: 'C5',
    timeHorizon: '30d',
    region: 'all',
    searchQuery: ''
  });

  assert(workspace.selectedRoute !== null, 'Selected route is populated');
  assert(workspace.selectedRoute?.route_code === 'C5', 'Selected route is C5');
  assert(workspace.supply.total_fleet_vessels > 0, 'Supply fleet is non-zero');
  assert(workspace.demand.total_cargo_demand_mt > 0, 'Demand is non-zero');
  assert(workspace.congestion.avg_waiting_time_hours > 0, 'Congestion wait hours is non-zero');
  assert(workspace.signals.signals.length === 5, '5 signals generated');
  assert(workspace.data_freshness.is_live_connected === true, 'Data freshness is live connected');
  console.log('  ✅ Consolidated workspace payload verified');

  console.log('====================================================');
  console.log('ALL 10 MARKET INSIGHTS TEST SUITES PASSED (100% SUCCESS)');
  console.log('====================================================');
}

runMarketInsightsTestSuite().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
