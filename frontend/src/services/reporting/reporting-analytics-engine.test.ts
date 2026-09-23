import assert from 'node:assert';
import {
  ALL_REPORTING_TRANSACTIONS,
  filterTransactionsByState,
  computeExecutiveKpiRibbon,
  computeMonthlyTimeSeries,
  computeCorridorBreakdown,
  computeSegmentShare,
  extractDrillDownSlice,
  applyDrillDownSecondaryFilters,
  generateDecisionRecommendations,
  compileExecutiveDossier,
} from './reporting-analytics-engine';
import { ReportingService } from './reporting.service';
import type { ReportFilterState, DrillDownContext, DrillDownFilterState } from '../../types/reporting';

console.log('--- RUNNING MODULE 25 REPORTING ENGINE TESTS ---');

// Test 1: Dataset Generation & Coverage
assert(ALL_REPORTING_TRANSACTIONS.length > 1000, `Expected > 1000 records, got ${ALL_REPORTING_TRANSACTIONS.length}`);
const years = Array.from(new Set(ALL_REPORTING_TRANSACTIONS.map((r) => r.date.substring(0, 4))));
assert(years.includes('2014'), 'Must include 2014 historical data');
assert(years.includes('2026'), 'Must include 2026 current data');
console.log('✓ Test 1 Passed: Dataset spans 2014 to 2026 with', ALL_REPORTING_TRANSACTIONS.length, 'records');

// Test 2: Filter Level 1
const filter: ReportFilterState = {
  view: 'commercial',
  timeHorizon: '1Y',
  segment: 'Crude Tanker',
  vesselClass: 'VLCC',
  basin: 'Middle East',
  metricFocus: 'tce_rate',
};

const filtered = filterTransactionsByState(ALL_REPORTING_TRANSACTIONS, filter);
assert(filtered.length > 0, 'Filtered records should not be empty');
filtered.forEach((r) => {
  assert.strictEqual(r.segment, 'Crude Tanker');
  assert.strictEqual(r.vesselClass, 'VLCC');
  assert.strictEqual(r.basin, 'Middle East');
  const y = parseInt(r.date.substring(0, 4), 10);
  assert(y >= 2025, `Expected year >= 2025 for 1Y horizon, got ${y}`);
});
console.log('✓ Test 2 Passed: Level 1 filters accurately restrict records');

// Test 3: Executive KPI Ribbon
const kpis = computeExecutiveKpiRibbon(filtered, 'tce_rate');
assert.strictEqual(kpis.length, 5, 'Must yield 5 executive KPI cards');
const tceKpi = kpis.find((k) => k.id === 'kpi-tce');
assert(tceKpi, 'Must include TCE KPI');
assert(tceKpi!.numericValue > 0, 'Average TCE must be positive');
console.log('✓ Test 3 Passed: KPI ribbon computed accurately with avg TCE:', tceKpi!.value);

// Test 4: Monthly Time Series & Clickable Points
const timeSeries = computeMonthlyTimeSeries(filtered, 'tce_rate');
assert(timeSeries.length > 0, 'Time series points must not be empty');
const samplePoint = timeSeries[0];
assert(samplePoint.period, 'Must have period');
assert(samplePoint.label, 'Must have label');
assert(samplePoint.value > 0, 'Must have positive value');
assert(samplePoint.fixtureCount > 0, 'Must have fixture count');
console.log('✓ Test 4 Passed: Monthly time series generated with', timeSeries.length, 'interactive nodes');

// Test 5: Corridor Breakdown
const corridors = computeCorridorBreakdown(filtered, 'tce_rate');
assert(corridors.length > 0, 'Corridors must not be empty');
assert(corridors[0].value >= (corridors[1]?.value || 0), 'Corridors should be sorted descending');
console.log('✓ Test 5 Passed: Top corridor identified:', corridors[0].routeName, 'at', corridors[0].value, corridors[0].unit);

// Test 6: Segment Share Donut
const all2026Filter: ReportFilterState = {
  view: 'commercial',
  timeHorizon: 'YTD',
  segment: 'all',
  vesselClass: 'all',
  basin: 'all',
  metricFocus: 'tce_rate',
};
const all2026 = filterTransactionsByState(ALL_REPORTING_TRANSACTIONS, all2026Filter);
const segShare = computeSegmentShare(all2026);
assert(segShare.length > 0, 'Segment share should not be empty');
const totalPct = segShare.reduce((acc, s) => acc + s.sharePct, 0);
assert(Math.abs(totalPct - 100) < 2, `Total segment share should be near 100%, got ${totalPct}`);
console.log('✓ Test 6 Passed: Segment share correctly sums to', totalPct.toFixed(1), '%');

// Test 7: Drill-Down Context & Slice Extraction
const drillContext: DrillDownContext = {
  datePeriod: '2026-05',
  segment: 'Crude Tanker',
  vesselClass: 'VLCC',
  recordCount: 5,
  label: 'May 2026 — VLCC Arabian Gulf to China',
};
const drillSlice = extractDrillDownSlice(all2026, drillContext);
assert(drillSlice.length > 0, 'Drill-down slice must not be empty');
drillSlice.forEach((r) => {
  assert(r.date.startsWith('2026-05'), 'Date must match drill period');
  assert.strictEqual(r.segment, 'Crude Tanker');
  assert.strictEqual(r.vesselClass, 'VLCC');
});
console.log('✓ Test 7 Passed: Extracted drill-down slice of', drillSlice.length, 'records');

// Test 8: Level 2 Secondary Filtering
const secFilters: DrillDownFilterState = {
  status: 'Completed',
  cargoSubType: 'Arab Light',
  minTce: 30000,
  searchTerm: 'APOLLO',
};
const secFiltered = applyDrillDownSecondaryFilters(drillSlice, secFilters);
secFiltered.forEach((r) => {
  assert.strictEqual(r.commercialStatus, 'Completed');
  assert.strictEqual(r.cargoSubType, 'Arab Light');
  assert(r.tceRate >= 30000);
  assert(r.vesselName.includes('APOLLO'));
});
console.log('✓ Test 8 Passed: Secondary level 2 filters correctly reduced records to', secFiltered.length);

// Test 9: Decision Recommendations
const decisions = generateDecisionRecommendations(all2026, drillContext);
assert(decisions.length >= 3, 'Must produce at least 3 strategic decisions');
const categories = decisions.map((d) => d.category);
assert(categories.includes('chartering'), 'Must include chartering recommendation');
assert(categories.includes('hedging'), 'Must include hedging recommendation');
assert(categories.includes('decarbonization'), 'Must include decarbonization recommendation');
assert(categories.includes('allocation'), 'Must include allocation recommendation when drill-down provided');
console.log('✓ Test 9 Passed: Algorithmic decision matrix generated', decisions.length, 'actionable recommendations');

// Test 10: Executive Dossier Compilation
const dossier = compileExecutiveDossier(
  filter,
  kpis,
  corridors,
  {
    context: drillContext,
    filteredCount: drillSlice.length,
    avgTce: 64500,
    totalVolumeMt: 1200000,
    primaryCharterers: ['Unipec Asia', 'Saudi Aramco'],
  },
  decisions
);
assert(dossier.id.startsWith('DOSSIER-'), 'Dossier ID formatted');
assert(dossier.kpiSummary.length === 5, 'Dossier contains full KPI summary');
assert(dossier.recommendations.length > 0, 'Dossier includes recommendations');
console.log('✓ Test 10 Passed: Executive dossier compiled:', dossier.title);

// Test 11: URL Parameter Round-Trip
const urlParams = ReportingService.serializeToUrlParams(filter, drillContext, secFilters);
assert.strictEqual(urlParams.get('segment'), 'Crude Tanker');
assert.strictEqual(urlParams.get('drillPeriod'), '2026-05');
assert.strictEqual(urlParams.get('drillStatus'), 'Completed');

const restored = ReportingService.deserializeUrlParams(urlParams);
assert.strictEqual(restored.filters.segment, 'Crude Tanker');
assert.strictEqual(restored.drillDown?.datePeriod, '2026-05');
assert.strictEqual(restored.drillDownFilters.status, 'Completed');
assert.strictEqual(restored.drillDownFilters.cargoSubType, 'Arab Light');
assert.strictEqual(restored.drillDownFilters.minTce, 30000);
console.log('✓ Test 11 Passed: URL search params round-trip successfully verified');

console.log('====================================================');
console.log('ALL 11 REPORTING ENGINE & CONTRACT TESTS PASSED 100%');
console.log('====================================================');
