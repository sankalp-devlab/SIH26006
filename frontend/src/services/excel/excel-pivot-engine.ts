/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 31: EXCEL INTEGRATION & ANALYTICAL WORKBOOK ENGINE
 * Maritime Shipping Pivot Engine
 *
 * Transforms raw records or DataQuery results into pivot-ready cross-tabulation
 * matrices supporting:
 * - Shipping Dimensions: vesselClass, marketSegment, corridorOrRoute, originRegion,
 *   destinationRegion, cargoCommodity, status, year, quarter, month, date.
 * - Shipping Metrics: rateTceUsdPerDay, volumeMetricTons, voyageDistanceNm,
 *   tonMilesBillion, waitingDaysAtPort, co2EmissionsMt, bunkerPriceUsdPerMt, vesselCount.
 * - Dynamic Aggregations: SUM, AVG, MIN, MAX, COUNT.
 * - Excel formula mapping: row sums, column sums, and grand totals.
 */

import type {
  ExcelPivotAnalysisData,
  ExcelPivotDimension,
  ExcelPivotMetric,
} from '../../types/excel-integration';
import type {
  DataQueryConfig,
  PivotQueryResult,
} from '../../types/data-query';

export class ExcelPivotEngine {
  public static readonly SHIPPING_DIMENSIONS: Record<string, { label: string; isTime?: boolean }> = {
    vessel: { label: 'Vessel Name' },
    vesselClass: { label: 'Vessel Class' },
    owner: { label: 'Owner / Operator' },
    port: { label: 'Port / Terminal' },
    marketSegment: { label: 'Market Segment' },
    corridorOrRoute: { label: 'Trade Corridor / Route' },
    originRegion: { label: 'Origin Region' },
    destinationRegion: { label: 'Destination Region' },
    cargoCommodity: { label: 'Cargo Commodity' },
    status: { label: 'Voyage Status' },
    year: { label: 'Year', isTime: true },
    quarter: { label: 'Quarter', isTime: true },
    month: { label: 'Month', isTime: true },
    date: { label: 'Date', isTime: true },
  };

  public static readonly SHIPPING_METRICS: Record<
    string,
    { label: string; unit: string; formatter: 'currency' | 'number' | 'integer' | 'percent' }
  > = {
    rateTceUsdPerDay: { label: 'Spot TCE Rate', unit: 'USD/day', formatter: 'currency' },
    volumeMetricTons: { label: 'Cargo Volume', unit: 'MT', formatter: 'number' },
    voyageDistanceNm: { label: 'Voyage Distance', unit: 'NM', formatter: 'number' },
    tonMilesBillion: { label: 'Cargo Ton-Miles', unit: 'Billion TM', formatter: 'number' },
    waitingDaysAtPort: { label: 'Port Congestion Waiting', unit: 'Days', formatter: 'number' },
    fuelConsumptionMt: { label: 'Fuel Consumption', unit: 'MT', formatter: 'number' },
    co2EmissionsMt: { label: 'CO2 Emissions', unit: 'MT', formatter: 'number' },
    bunkerPriceUsdPerMt: { label: 'VLSFO Bunker Price', unit: 'USD/MT', formatter: 'currency' },
    vesselCount: { label: 'Vessel Count', unit: 'Units', formatter: 'integer' },
  };

  /**
   * Adapts an executed Module 24 PivotQueryResult into an ExcelPivotAnalysisData model
   */
  public static fromDataQueryPivot(
    pivotResult: PivotQueryResult,
    config: DataQueryConfig
  ): ExcelPivotAnalysisData {
    const rowDimKey = pivotResult.rowDimension;
    const colDimKey = pivotResult.colDimension;
    const metricKey = config.pivot.valueMetric;
    const aggregation = config.pivot.aggregation;

    const rowDim: ExcelPivotDimension = {
      key: rowDimKey,
      label: this.SHIPPING_DIMENSIONS[rowDimKey]?.label || rowDimKey,
      isTime: this.SHIPPING_DIMENSIONS[rowDimKey]?.isTime,
    };

    const colDim: ExcelPivotDimension = {
      key: colDimKey,
      label: this.SHIPPING_DIMENSIONS[colDimKey]?.label || colDimKey,
      isTime: this.SHIPPING_DIMENSIONS[colDimKey]?.isTime,
    };

    const metricMeta = this.SHIPPING_METRICS[metricKey] || {
      label: metricKey,
      unit: '',
      formatter: 'number',
    };

    const metric: ExcelPivotMetric = {
      key: metricKey,
      label: metricMeta.label,
      aggregation,
      formatter: metricMeta.formatter,
      unit: metricMeta.unit,
    };

    const matrix: Record<string, Record<string, number | null>> = {};
    for (const r of pivotResult.rowKeys) {
      matrix[r] = {};
      for (const c of pivotResult.colKeys) {
        matrix[r][c] = pivotResult.matrix[r]?.[c]?.value ?? null;
      }
    }

    const rowTotals: Record<string, number> = {};
    for (const r of pivotResult.rowKeys) {
      rowTotals[r] = pivotResult.rowTotals[r]?.value ?? 0;
    }

    const colTotals: Record<string, number> = {};
    for (const c of pivotResult.colKeys) {
      colTotals[c] = pivotResult.colTotals[c]?.value ?? 0;
    }

    return {
      title: `${rowDim.label} × ${colDim.label} (${metric.label} [${metric.aggregation}])`,
      rowDimension: rowDim,
      colDimension: colDim,
      metric,
      rowKeys: pivotResult.rowKeys,
      colKeys: pivotResult.colKeys,
      matrix,
      rowTotals,
      colTotals,
      grandTotal: pivotResult.grandTotal.value ?? 0,
    };
  }

  /**
   * Computes an Excel Pivot Matrix directly from raw records
   */
  public static computePivot<T extends Record<string, any>>(
    records: T[],
    rowDimKey: string,
    colDimKey: string,
    metricKey: string,
    aggregation: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT' = 'AVG'
  ): ExcelPivotAnalysisData {
    const rowDim: ExcelPivotDimension = {
      key: rowDimKey,
      label: this.SHIPPING_DIMENSIONS[rowDimKey]?.label || rowDimKey,
      isTime: this.SHIPPING_DIMENSIONS[rowDimKey]?.isTime,
    };

    const colDim: ExcelPivotDimension = {
      key: colDimKey,
      label: this.SHIPPING_DIMENSIONS[colDimKey]?.label || colDimKey,
      isTime: this.SHIPPING_DIMENSIONS[colDimKey]?.isTime,
    };

    const metricMeta = this.SHIPPING_METRICS[metricKey] || {
      label: metricKey,
      unit: '',
      formatter: 'number' as const,
    };

    const metric: ExcelPivotMetric = {
      key: metricKey,
      label: metricMeta.label,
      aggregation,
      formatter: metricMeta.formatter,
      unit: metricMeta.unit,
    };

    // Grouping structure: rowKey -> colKey -> number[]
    const groups = new Map<string, Map<string, number[]>>();
    const rowSet = new Set<string>();
    const colSet = new Set<string>();

    for (const rec of records) {
      const rVal = String(rec[rowDimKey] ?? 'Unknown');
      const cVal = String(rec[colDimKey] ?? 'Unknown');
      let val = metricKey === 'vesselCount' ? 1 : Number(rec[metricKey]);
      if (isNaN(val)) val = 0;

      rowSet.add(rVal);
      colSet.add(cVal);

      if (!groups.has(rVal)) groups.set(rVal, new Map());
      const rowGroup = groups.get(rVal)!;
      if (!rowGroup.has(cVal)) rowGroup.set(cVal, []);
      rowGroup.get(cVal)!.push(val);
    }

    const rowKeys = rowSet.size > 0 ? Array.from(rowSet).sort() : ['All'];
    const colKeys = colSet.size > 0 ? Array.from(colSet).sort() : ['Total'];

    const aggregateValues = (vals: number[]): number | null => {
      if (!vals || vals.length === 0) return null;
      switch (aggregation) {
        case 'SUM':
          return vals.reduce((a, b) => a + b, 0);
        case 'AVG':
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        case 'MIN':
          return Math.min(...vals);
        case 'MAX':
          return Math.max(...vals);
        case 'COUNT':
          return vals.length;
      }
    };

    const matrix: Record<string, Record<string, number | null>> = {};
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};

    const allColBuckets: Record<string, number[]> = {};
    colKeys.forEach((c) => (allColBuckets[c] = []));
    const allValues: number[] = [];

    for (const r of rowKeys) {
      matrix[r] = {};
      const rowVals: number[] = [];

      for (const c of colKeys) {
        const bucket = groups.get(r)?.get(c) || [];
        const agg = aggregateValues(bucket);
        matrix[r][c] = agg !== null ? Math.round(agg * 100) / 100 : null;

        if (bucket.length > 0) {
          rowVals.push(...bucket);
          allColBuckets[c].push(...bucket);
          allValues.push(...bucket);
        }
      }

      const rowAgg = aggregateValues(rowVals);
      rowTotals[r] = rowAgg !== null ? Math.round(rowAgg * 100) / 100 : 0;
    }

    for (const c of colKeys) {
      const colAgg = aggregateValues(allColBuckets[c]);
      colTotals[c] = colAgg !== null ? Math.round(colAgg * 100) / 100 : 0;
    }

    const grandAgg = aggregateValues(allValues);
    const grandTotal = grandAgg !== null ? Math.round(grandAgg * 100) / 100 : 0;

    return {
      title: `${rowDim.label} × ${colDim.label} (${metric.label} [${metric.aggregation}])`,
      rowDimension: rowDim,
      colDimension: colDim,
      metric,
      rowKeys,
      colKeys,
      matrix,
      rowTotals,
      colTotals,
      grandTotal,
    };
  }
}
