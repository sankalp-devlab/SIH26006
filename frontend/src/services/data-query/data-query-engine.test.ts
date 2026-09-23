/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — Analytics Engine Unit Tests
 */

import {
  evaluateFilterCondition,
  calculateAggregation,
  getGranularityBucketKey,
  applyAnalyticalTransform,
  executeTimeSeriesQuery,
  executePivotQuery,
  executeRawDataQuery,
  parseCustomSql,
} from './data-query-engine';
import { CANONICAL_MARITIME_DATASET } from './data-query.data';
import type { DataQueryConfig } from '../../types/data-query';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Starting Module 24: Data Query Engine Tests ---');

// Test 1: Filter Conditions
console.log('Test 1: Filter Evaluation Operators (=, !=, >, IN)');
const sample = CANONICAL_MARITIME_DATASET[0];
assert(evaluateFilterCondition(sample, { id: '1', field: 'vesselClass', operator: '=', value: sample.vesselClass }), '= operator matches');
assert(evaluateFilterCondition(sample, { id: '2', field: 'vesselClass', operator: '!=', value: 'NonExistent' }), '!= operator matches');
assert(evaluateFilterCondition(sample, { id: '3', field: 'rateTceUsdPerDay', operator: '>', value: 1000 }), '> operator matches');
assert(evaluateFilterCondition(sample, { id: '4', field: 'vesselClass', operator: 'IN', value: ['VLCC', 'Suezmax', 'MR'] }), 'IN operator matches');
console.log('  ✓ Filter evaluations verified.');

// Test 2: Aggregations
console.log('Test 2: Mathematical Aggregations (SUM, AVG, MIN, MAX, COUNT)');
const testNums = [10, 20, 30, 40, 50];
assert(calculateAggregation(testNums, 'SUM') === 150, 'SUM equals 150');
assert(calculateAggregation(testNums, 'AVG') === 30, 'AVG equals 30');
assert(calculateAggregation(testNums, 'MIN') === 10, 'MIN equals 10');
assert(calculateAggregation(testNums, 'MAX') === 50, 'MAX equals 50');
assert(calculateAggregation(testNums, 'COUNT') === 5, 'COUNT equals 5');
console.log('  ✓ Aggregation formulas verified.');

// Test 3: Time Granularity Buckets
console.log('Test 3: Time Granularity Buckets');
assert(getGranularityBucketKey('2024-05-15', 'annual') === '2024', 'Annual bucket');
assert(getGranularityBucketKey('2024-05-15', 'quarterly') === '2024-Q2', 'Quarterly bucket');
assert(getGranularityBucketKey('2024-05-15', 'monthly') === '2024-05', 'Monthly bucket');
console.log('  ✓ Time granularity bucketing verified.');

// Test 4: Analytical Transforms (SMA, CumSum, Index 100)
console.log('Test 4: Analytical Transforms');
const rawSeries = [100, 110, 120, 130, 140, 150, 160];
const sma = applyAnalyticalTransform(rawSeries, 'SMA_7D');
assert(sma.length === rawSeries.length, 'SMA length preserved');
assert(sma[sma.length - 1] === 130, 'SMA calculation correct');

const cumsum = applyAnalyticalTransform([10, 20, 30], 'CUMSUM');
assert(cumsum[2] === 60, 'CumSum calculation correct');

const index100 = applyAnalyticalTransform([50, 75, 100], 'INDEX_BASE_100');
assert(index100[0] === 100, 'Base 100 first index');
assert(index100[1] === 150, 'Base 100 second index');
console.log('  ✓ Analytical transforms verified.');

// Test 5: Time-Series Execution
console.log('Test 5: Time-Series Query Execution');
const tsConfig: DataQueryConfig = {
  mode: 'time_series',
  entity: 'freight_rates',
  fields: [],
  dimensions: ['vesselClass'],
  metrics: [{ field: 'rateTceUsdPerDay', aggregation: 'AVG', alias: 'Avg TCE' }],
  transform: 'NONE',
  granularity: 'monthly',
  timeRange: { startDate: '2020-01-01', endDate: '2023-12-31', preset: 'CUSTOM' },
  filters: [{ id: 'f1', field: 'vesselClass', operator: '=', value: 'VLCC' }],
  pivot: { rowDimension: 'vesselClass', colDimension: 'year', valueMetric: 'rateTceUsdPerDay', aggregation: 'AVG' },
  limit: 100,
};

const tsResult = executeTimeSeriesQuery(CANONICAL_MARITIME_DATASET, tsConfig);
assert(tsResult.points.length === 48, `48 monthly points for 2020..2023, got ${tsResult.points.length}`);
assert(tsResult.summary.avg > 0, 'Average TCE is positive');
console.log('  ✓ Time-series query execution verified.');

// Test 6: Pivot Matrix Execution
console.log('Test 6: Pivot Matrix Query Execution');
const pivotConfig: DataQueryConfig = {
  ...tsConfig,
  mode: 'pivot',
  pivot: {
    rowDimension: 'vesselClass',
    colDimension: 'year',
    valueMetric: 'rateTceUsdPerDay',
    aggregation: 'AVG',
  },
};
const pivotResult = executePivotQuery(CANONICAL_MARITIME_DATASET, pivotConfig);
assert(pivotResult.rowKeys.length > 0, 'Row keys present');
assert(pivotResult.colKeys.length > 0, 'Col keys present');
assert(pivotResult.grandTotal.value !== null && pivotResult.grandTotal.value > 0, 'Grand total present');
console.log('  ✓ Pivot matrix execution verified.');

// Test 7: Raw Data Query Execution
console.log('Test 7: Raw Data Query Execution with Pagination');
const rawConfig: DataQueryConfig = {
  ...tsConfig,
  mode: 'raw_data',
  sortField: 'rateTceUsdPerDay',
  sortOrder: 'desc',
};
const rawResult = executeRawDataQuery(CANONICAL_MARITIME_DATASET, rawConfig, 1, 10);
assert(rawResult.records.length === 10, 'Page size 10 respected');
assert(rawResult.totalPages > 1, 'Multiple pages calculated');
console.log('  ✓ Raw data query execution verified.');

// Test 8: Custom SQL Parser
console.log('Test 8: Custom SQL Parser');
const parsed = parseCustomSql('SELECT rateTceUsdPerDay, vesselClass FROM freight_rates ORDER BY date DESC LIMIT 25');
assert(parsed.entity === 'freight_rates', 'Parsed entity');
assert(parsed.limit === 25, 'Parsed limit');
assert(parsed.sortOrder === 'desc', 'Parsed sort order');
console.log('  ✓ Custom SQL parser verified.');

console.log('--- ALL MODULE 24 DATA QUERY ENGINE TESTS PASSED ---');
