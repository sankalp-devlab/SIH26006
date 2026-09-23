/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — Pure Mathematical Analytics Engine
 *
 * Implements:
 * - Deterministic multi-attribute filter evaluation
 * - Time-series grouping and frequency resampling (daily, weekly, monthly, quarterly, annual)
 * - Analytical transforms (SMA 7D/30D, YoY % Change, Cumulative Sum, Base 100 Index)
 * - High-speed Pivot Matrix cross-tabulation with row/col/grand summaries
 * - SQL-like Declarative Query parser
 */

import type {
  UnifiedMaritimeDataRecord,
  DataQueryConfig,
  QueryFilterCondition,
  TimeRangeConfig,
  AggregationFunction,
  AnalyticalTransform,
  TimeSeriesQueryResult,
  TimeSeriesPoint,
  PivotQueryResult,
  PivotCell,
  RawDataQueryResult,
} from '../../types/data-query';

/**
 * Filter Evaluation Engine
 */
export function evaluateFilterCondition(
  record: UnifiedMaritimeDataRecord,
  cond: QueryFilterCondition
): boolean {
  const raw = (record as unknown as Record<string, unknown>)[cond.field];
  if (raw === undefined || raw === null) return false;

  const target = cond.value;

  switch (cond.operator) {
    case '=':
      return String(raw).toLowerCase() === String(target).toLowerCase();
    case '!=':
      return String(raw).toLowerCase() !== String(target).toLowerCase();
    case '>':
      return Number(raw) > Number(target);
    case '<':
      return Number(raw) < Number(target);
    case '>=':
      return Number(raw) >= Number(target);
    case '<=':
      return Number(raw) <= Number(target);
    case 'CONTAINS':
      return String(raw).toLowerCase().includes(String(target).toLowerCase());
    case 'IN': {
      const list = Array.isArray(target)
        ? target.map((v) => String(v).toLowerCase())
        : String(target).split(',').map((v) => v.trim().toLowerCase());
      return list.includes(String(raw).toLowerCase());
    }
    default:
      return true;
  }
}

export function filterMaritimeRecords(
  records: UnifiedMaritimeDataRecord[],
  filters: QueryFilterCondition[],
  timeRange: TimeRangeConfig
): UnifiedMaritimeDataRecord[] {
  const start = timeRange.startDate;
  const end = timeRange.endDate;

  return records.filter((r) => {
    // Date filter
    if (r.date < start || r.date > end) return false;

    // Conditions filter
    for (const f of filters) {
      if (!evaluateFilterCondition(r, f)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Math Aggregations
 */
export function calculateAggregation(
  values: number[],
  agg: AggregationFunction
): number {
  if (values.length === 0) return 0;

  switch (agg) {
    case 'SUM':
      return values.reduce((sum, v) => sum + v, 0);
    case 'AVG':
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    case 'MIN':
      return Math.min(...values);
    case 'MAX':
      return Math.max(...values);
    case 'COUNT':
      return values.length;
    default:
      return values.reduce((sum, v) => sum + v, 0) / values.length;
  }
}

/**
 * Time Granularity Bucket Key Generator
 */
export function getGranularityBucketKey(
  dateStr: string,
  granularity: DataQueryConfig['granularity']
): string {
  const [yearStr, monthStr] = dateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  switch (granularity) {
    case 'annual':
      return `${y}`;
    case 'quarterly': {
      const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4';
      return `${y}-${q}`;
    }
    case 'monthly':
      return `${yearStr}-${monthStr}`;
    case 'weekly': {
      // Approximation for weekly bucket
      const day = parseInt(dateStr.split('-')[2] || '01', 10);
      const weekNum = Math.min(4, Math.floor(day / 7) + 1);
      return `${yearStr}-${monthStr}-W${weekNum}`;
    }
    case 'daily':
    default:
      return dateStr;
  }
}

/**
 * Analytical Transformations (SMA, YoY, CumSum, Base 100)
 */
export function applyAnalyticalTransform(
  points: number[],
  transform: AnalyticalTransform
): number[] {
  if (points.length === 0 || transform === 'NONE') return points;

  switch (transform) {
    case 'SMA_7D': {
      const window = 7;
      return points.map((_, idx, arr) => {
        const start = Math.max(0, idx - window + 1);
        const slice = arr.slice(start, idx + 1);
        return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100;
      });
    }
    case 'SMA_30D': {
      const window = 30;
      return points.map((_, idx, arr) => {
        const start = Math.max(0, idx - window + 1);
        const slice = arr.slice(start, idx + 1);
        return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100;
      });
    }
    case 'YOY_PCT': {
      // 12-period lag for monthly data
      const lag = 12;
      return points.map((val, idx, arr) => {
        if (idx < lag) return 0;
        const prev = arr[idx - lag];
        if (prev === 0) return 0;
        return Math.round(((val - prev) / prev) * 1000) / 10;
      });
    }
    case 'CUMSUM': {
      let run = 0;
      return points.map((v) => {
        run += v;
        return Math.round(run * 100) / 100;
      });
    }
    case 'INDEX_BASE_100': {
      const base = points[0] || 1;
      return points.map((v) => Math.round((v / base) * 1000) / 10);
    }
    default:
      return points;
  }
}

/**
 * Execute Time-Series Query
 */
export function executeTimeSeriesQuery(
  records: UnifiedMaritimeDataRecord[],
  config: DataQueryConfig
): TimeSeriesQueryResult {
  const filtered = filterMaritimeRecords(records, config.filters, config.timeRange);

  // Bucket records by time key
  const bucketMap: Record<string, UnifiedMaritimeDataRecord[]> = {};
  filtered.forEach((r) => {
    const key = getGranularityBucketKey(r.date, config.granularity);
    if (!bucketMap[key]) bucketMap[key] = [];
    bucketMap[key].push(r);
  });

  const sortedDates = Object.keys(bucketMap).sort();

  const seriesKeys: string[] = [];
  const seriesLabels: Record<string, string> = {};
  const seriesUnits: Record<string, string> = {};

  // Determine series definitions
  const activeMetrics = config.metrics.length > 0
    ? config.metrics
    : [{ field: 'rateTceUsdPerDay', aggregation: 'AVG' as AggregationFunction, alias: 'Avg TCE' }];

  activeMetrics.forEach((m) => {
    const key = `${m.field}_${m.aggregation}`;
    seriesKeys.push(key);
    seriesLabels[key] = m.alias || `${m.aggregation} of ${m.field}`;
    seriesUnits[key] = m.field.includes('Tce') ? '$/day' : m.field.includes('Metric') ? 'MT' : '';
  });

  // Calculate series values per bucket
  const rawSeriesValues: Record<string, number[]> = {};
  seriesKeys.forEach((k) => (rawSeriesValues[k] = []));

  sortedDates.forEach((dateKey) => {
    const bucketRecords = bucketMap[dateKey];
    activeMetrics.forEach((m, mIdx) => {
      const vals = bucketRecords
        .map((r) => Number((r as unknown as Record<string, unknown>)[m.field]))
        .filter((n) => !isNaN(n));
      const aggVal = calculateAggregation(vals, m.aggregation);
      rawSeriesValues[seriesKeys[mIdx]].push(Math.round(aggVal * 100) / 100);
    });
  });

  // Apply transforms to each series
  const transformedValues: Record<string, number[]> = {};
  seriesKeys.forEach((k) => {
    transformedValues[k] = applyAnalyticalTransform(rawSeriesValues[k], config.transform);
  });

  // Construct final Points
  let totalSum = 0;
  let allVals: number[] = [];

  const points: TimeSeriesPoint[] = sortedDates.map((dateKey, idx) => {
    const ptSeries: Record<string, number> = {};
    seriesKeys.forEach((k) => {
      const val = transformedValues[k][idx];
      ptSeries[k] = val;
      allVals.push(val);
      totalSum += val;
    });

    return {
      date: dateKey,
      timestamp: new Date(dateKey).getTime() || idx,
      series: ptSeries,
    };
  });

  const min = allVals.length > 0 ? Math.min(...allVals) : 0;
  const max = allVals.length > 0 ? Math.max(...allVals) : 0;
  const avg = allVals.length > 0 ? totalSum / allVals.length : 0;

  return {
    seriesKeys,
    seriesLabels,
    seriesUnits,
    points,
    summary: {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      total: Math.round(totalSum * 100) / 100,
      observationCount: points.length,
    },
  };
}

/**
 * Execute Pivot Matrix Query
 */
export function executePivotQuery(
  records: UnifiedMaritimeDataRecord[],
  config: DataQueryConfig
): PivotQueryResult {
  const filtered = filterMaritimeRecords(records, config.filters, config.timeRange);

  const { rowDimension, colDimension, valueMetric, aggregation } = config.pivot;

  const matrix: Record<string, Record<string, PivotCell>> = {};
  const rowTotalsValues: Record<string, number[]> = {};
  const colTotalsValues: Record<string, number[]> = {};
  const grandTotalValues: number[] = [];

  const rowKeysSet = new Set<string>();
  const colKeysSet = new Set<string>();

  // Intermediate accumulator
  const cellAccumulator: Record<string, Record<string, number[]>> = {};

  filtered.forEach((r) => {
    const rowVal = String((r as unknown as Record<string, unknown>)[rowDimension] ?? 'Unknown');
    const colVal = String((r as unknown as Record<string, unknown>)[colDimension] ?? 'Unknown');
    const metricVal = Number((r as unknown as Record<string, unknown>)[valueMetric]);

    if (!isNaN(metricVal)) {
      rowKeysSet.add(rowVal);
      colKeysSet.add(colVal);

      if (!cellAccumulator[rowVal]) cellAccumulator[rowVal] = {};
      if (!cellAccumulator[rowVal][colVal]) cellAccumulator[rowVal][colVal] = [];
      cellAccumulator[rowVal][colVal].push(metricVal);

      if (!rowTotalsValues[rowVal]) rowTotalsValues[rowVal] = [];
      rowTotalsValues[rowVal].push(metricVal);

      if (!colTotalsValues[colVal]) colTotalsValues[colVal] = [];
      colTotalsValues[colVal].push(metricVal);

      grandTotalValues.push(metricVal);
    }
  });

  const rowKeys = Array.from(rowKeysSet).sort();
  const colKeys = Array.from(colKeysSet).sort();

  // Populate formatted matrix
  rowKeys.forEach((rKey) => {
    matrix[rKey] = {};
    colKeys.forEach((cKey) => {
      const vals = cellAccumulator[rKey]?.[cKey] || [];
      if (vals.length > 0) {
        const aggregated = calculateAggregation(vals, aggregation);
        matrix[rKey][cKey] = {
          value: Math.round(aggregated * 100) / 100,
          formatted: formatMetricValue(aggregated, valueMetric),
          count: vals.length,
        };
      } else {
        matrix[rKey][cKey] = {
          value: null,
          formatted: '—',
          count: 0,
        };
      }
    });
  });

  // Calculate row totals
  const rowTotals: Record<string, PivotCell> = {};
  rowKeys.forEach((rKey) => {
    const vals = rowTotalsValues[rKey] || [];
    const agg = calculateAggregation(vals, aggregation);
    rowTotals[rKey] = {
      value: Math.round(agg * 100) / 100,
      formatted: formatMetricValue(agg, valueMetric),
      count: vals.length,
    };
  });

  // Calculate column totals
  const colTotals: Record<string, PivotCell> = {};
  colKeys.forEach((cKey) => {
    const vals = colTotalsValues[cKey] || [];
    const agg = calculateAggregation(vals, aggregation);
    colTotals[cKey] = {
      value: Math.round(agg * 100) / 100,
      formatted: formatMetricValue(agg, valueMetric),
      count: vals.length,
    };
  });

  // Grand total
  const grandAgg = calculateAggregation(grandTotalValues, aggregation);
  const grandTotal: PivotCell = {
    value: Math.round(grandAgg * 100) / 100,
    formatted: formatMetricValue(grandAgg, valueMetric),
    count: grandTotalValues.length,
  };

  return {
    rowDimension,
    colDimension,
    rowKeys,
    colKeys,
    matrix,
    rowTotals,
    colTotals,
    grandTotal,
  };
}

/**
 * Execute Raw Data Ledger Query
 */
export function executeRawDataQuery(
  records: UnifiedMaritimeDataRecord[],
  config: DataQueryConfig,
  page: number = 1,
  pageSize: number = 25
): RawDataQueryResult {
  let filtered = filterMaritimeRecords(records, config.filters, config.timeRange);

  // Sorting
  if (config.sortField) {
    const field = config.sortField;
    const isAsc = config.sortOrder === 'asc';
    filtered.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[field];
      const valB = (b as unknown as Record<string, unknown>)[field];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }
      return isAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  const totalMatchingRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalMatchingRecords / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginatedSlice = filtered.slice(startIdx, startIdx + pageSize);

  // Determine active columns
  const activeColumns = config.fields && config.fields.length > 0
    ? config.fields
    : ['date', 'corridorOrRoute', 'vesselClass', 'rateTceUsdPerDay', 'originRegion', 'destinationRegion', 'status'];

  const columnTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'> = {};
  if (filtered.length > 0) {
    const sample = filtered[0] as unknown as Record<string, unknown>;
    activeColumns.forEach((col) => {
      const val = sample[col];
      if (typeof val === 'number') columnTypes[col] = 'number';
      else if (typeof val === 'boolean') columnTypes[col] = 'boolean';
      else if (col.toLowerCase().includes('date')) columnTypes[col] = 'date';
      else columnTypes[col] = 'string';
    });
  }

  return {
    columns: activeColumns,
    columnTypes,
    records: paginatedSlice as unknown as Record<string, unknown>[],
    totalMatchingRecords,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Declarative SQL-like Query Parser
 * Example: SELECT rateTceUsdPerDay, vesselClass FROM freight_rates WHERE year >= 2020 ORDER BY date DESC LIMIT 50
 */
export function parseCustomSql(sql: string): Partial<DataQueryConfig> {
  const clean = sql.trim().replace(/;$/, '');
  const config: Partial<DataQueryConfig> = {};

  // FROM entity
  const fromMatch = clean.match(/FROM\s+([a-zA-Z0-9_]+)/i);
  if (fromMatch) {
    const entity = fromMatch[1].toLowerCase();
    if (
      entity === 'freight_rates' ||
      entity === 'trade_flows' ||
      entity === 'fleet_movements' ||
      entity === 'port_congestion' ||
      entity === 'fleet_emissions'
    ) {
      config.entity = entity;
    }
  }

  // LIMIT
  const limitMatch = clean.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    config.limit = parseInt(limitMatch[1], 10);
  }

  // ORDER BY
  const orderMatch = clean.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)\s*(ASC|DESC)?/i);
  if (orderMatch) {
    config.sortField = orderMatch[1];
    config.sortOrder = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC' ? 'desc' : 'asc';
  }

  // SELECT fields
  const selectMatch = clean.match(/SELECT\s+(.+?)\s+FROM/i);
  if (selectMatch) {
    const fieldsStr = selectMatch[1].trim();
    if (fieldsStr !== '*') {
      config.fields = fieldsStr.split(',').map((f) => f.trim());
    }
  }

  return config;
}

/**
 * Format Helpers
 */
export function formatMetricValue(val: number, fieldName: string): string {
  if (fieldName.toLowerCase().includes('tce')) {
    return `$${Math.round(val).toLocaleString()}`;
  }
  if (fieldName.toLowerCase().includes('bunker')) {
    return `$${Math.round(val).toLocaleString()}/MT`;
  }
  if (fieldName.toLowerCase().includes('volume') || fieldName.toLowerCase().includes('co2')) {
    return `${Math.round(val).toLocaleString()} MT`;
  }
  if (fieldName.toLowerCase().includes('tonmiles')) {
    return `${val.toFixed(1)}B TM`;
  }
  if (fieldName.toLowerCase().includes('waiting')) {
    return `${val.toFixed(1)} Days`;
  }
  return val.toLocaleString();
}
