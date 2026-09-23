/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — Service Layer & Multi-Format Exporters
 *
 * Provides:
 * - Deterministic synchronous query execution
 * - Bidirectional URL query string encoding and decoding for shareable links
 * - Multi-format data exporters (CSV, JSON, Clipboard TSV)
 * - Schema catalogs and template presets
 */

import type {
  DataQueryConfig,
  DataQueryExecutionResponse,
  EntitySchema,
  UnifiedMaritimeDataRecord,
  QueryTemplatePreset,
} from '../../types/data-query';
import {
  MARITIME_ENTITY_SCHEMAS,
  CANONICAL_MARITIME_DATASET,
  QUERY_PRESETS,
} from './data-query.data';
import {
  executeTimeSeriesQuery,
  executePivotQuery,
  executeRawDataQuery,
} from './data-query-engine';
import { ProvenanceService } from '../provenance/provenance.service';
import type { DataSourceOrigin } from '../../types/provenance';

export class DataQueryService {
  /**
   * Default initial query configuration
   */
  public static getDefaultConfig(): DataQueryConfig {
    return {
      mode: 'time_series',
      entity: 'freight_rates',
      fields: ['date', 'corridorOrRoute', 'vesselClass', 'rateTceUsdPerDay', 'originRegion', 'destinationRegion', 'status'],
      dimensions: ['vesselClass'],
      metrics: [
        { field: 'rateTceUsdPerDay', aggregation: 'AVG', alias: 'Average Spot TCE ($/day)' },
      ],
      transform: 'NONE',
      granularity: 'monthly',
      timeRange: {
        startDate: '2014-01-01',
        endDate: '2026-09-01',
        preset: '2014_PRESENT',
      },
      filters: [],
      pivot: {
        rowDimension: 'vesselClass',
        colDimension: 'year',
        valueMetric: 'rateTceUsdPerDay',
        aggregation: 'AVG',
      },
      limit: 100,
    };
  }

  /**
   * Get all schema catalogs
   */
  public static getEntitySchemas(): Record<string, EntitySchema> {
    return MARITIME_ENTITY_SCHEMAS;
  }

  /**
   * Get built-in templates
   */
  public static getQueryPresets(): QueryTemplatePreset[] {
    return QUERY_PRESETS;
  }

  /**
   * Execute Query with Performance Timing
   */
  public static async executeQuery(
    config: DataQueryConfig,
    page: number = 1,
    pageSize: number = 25
  ): Promise<DataQueryExecutionResponse> {
    const startTime = performance.now();

    // Use full canonical multi-year records
    const records: UnifiedMaritimeDataRecord[] = CANONICAL_MARITIME_DATASET;

    let timeSeriesResult;
    let rawDataResult;
    let pivotResult;

    switch (config.mode) {
      case 'time_series':
        timeSeriesResult = executeTimeSeriesQuery(records, config);
        break;
      case 'pivot':
        pivotResult = executePivotQuery(records, config);
        break;
      case 'raw_data':
      default:
        rawDataResult = executeRawDataQuery(records, config, page, pageSize);
        break;
    }

    const elapsed = Math.round(performance.now() - startTime);

    const shareableUrl = this.serializeQueryToUrl(config);
    const queryProvenance = this.resolveQueryProvenance(config);

    return {
      queryConfig: config,
      executedAt: new Date().toISOString(),
      executionTimeMs: Math.max(1, elapsed),
      timeSeriesResult,
      rawDataResult,
      pivotResult,
      coverageInfo: {
        historicalStart: '2014-01-01',
        historicalEnd: '2026-09-01',
        isTruncated: false,
      },
      shareableUrl,
      queryProvenance,
    };
  }

  /**
   * Resolves unified provenance metadata for a given query config
   */
  public static resolveQueryProvenance(config: DataQueryConfig) {
    const originMap: Record<string, DataSourceOrigin> = {
      freight_rates: 'baltic_exchange',
      fleet_movements: 'ais_satellite',
      trade_flows: 'customs_manifest',
      port_congestion: 'port_lineup_authority',
      fleet_emissions: 'calculated_analytics',
    };
    const origin: DataSourceOrigin = originMap[config.entity] || 'canonical_benchmark';
    const isEmissions = config.entity === 'fleet_emissions';

    if (isEmissions) {
      return ProvenanceService.createCalculatedProvenance(
        'Fleet CO2 Emissions',
        'IMO GHG Fourth Study Formula: Fuel(MT) * 3.114',
        'Dynamic calculations based on vessel deadweight, speed, and fuel consumption constants',
        [
          { field: 'capacity_tons', label: 'Vessel Deadweight (DWT)', sourceOrigin: 'class_society' },
          { field: 'speed_knots', label: 'AIS Speed Over Ground', sourceOrigin: 'ais_satellite' },
          { field: 'fuel_constant', label: 'Fuel Factor (3.114)', sourceOrigin: 'imo_gisis' },
        ],
        config.timeRange?.endDate || '2026-09-01'
      );
    }

    return ProvenanceService.createProvenance({
      origin,
      observedAt: config.timeRange?.endDate || '2026-09-01',
      state: 'historical',
      derivation: 'curated_empirical',
      confidenceScore: 0.96,
      metadataNotes: `Canonical dataset for entity ${config.entity} across 12+ years of empirical records.`,
    });
  }

  /**
   * Synchronous Initial Data Guarantee
   */
  public static getInitialExecution(): DataQueryExecutionResponse {
    const config = this.getDefaultConfig();
    const records = CANONICAL_MARITIME_DATASET;
    const timeSeriesResult = executeTimeSeriesQuery(records, config);
    const shareableUrl = this.serializeQueryToUrl(config);
    const queryProvenance = this.resolveQueryProvenance(config);

    return {
      queryConfig: config,
      executedAt: new Date().toISOString(),
      executionTimeMs: 4,
      timeSeriesResult,
      coverageInfo: {
        historicalStart: '2014-01-01',
        historicalEnd: '2026-09-01',
        isTruncated: false,
      },
      shareableUrl,
      queryProvenance,
    };
  }

  /**
   * Encodes query state to shareable URL params
   */
  public static serializeQueryToUrl(config: DataQueryConfig): string {
    const params = new URLSearchParams();
    params.set('mode', config.mode);
    params.set('entity', config.entity);
    params.set('start', config.timeRange.startDate);
    params.set('end', config.timeRange.endDate);
    params.set('granularity', config.granularity);
    params.set('transform', config.transform);

    if (config.metrics.length > 0) {
      params.set('metrics', config.metrics.map((m) => `${m.field}:${m.aggregation}`).join(','));
    }

    if (config.mode === 'pivot') {
      params.set('pRow', config.pivot.rowDimension);
      params.set('pCol', config.pivot.colDimension);
      params.set('pVal', config.pivot.valueMetric);
      params.set('pAgg', config.pivot.aggregation);
    }

    if (config.filters.length > 0) {
      params.set('filters', JSON.stringify(config.filters));
    }

    const base = typeof window !== 'undefined' && window.location
      ? window.location.origin + window.location.pathname
      : 'https://maritime-intelligence.local/data-query';
    return `${base}?${params.toString()}`;
  }

  /**
   * Restores query state from URL search params
   */
  public static deserializeQueryFromUrl(searchParams: URLSearchParams): Partial<DataQueryConfig> {
    const patch: Partial<DataQueryConfig> = {};

    const mode = searchParams.get('mode');
    if (mode === 'time_series' || mode === 'raw_data' || mode === 'pivot') {
      patch.mode = mode;
    }

    const entity = searchParams.get('entity');
    if (entity && MARITIME_ENTITY_SCHEMAS[entity]) {
      patch.entity = entity as DataQueryConfig['entity'];
    }

    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (start && end) {
      patch.timeRange = { startDate: start, endDate: end, preset: 'CUSTOM' };
    }

    const granularity = searchParams.get('granularity');
    if (granularity) {
      patch.granularity = granularity as DataQueryConfig['granularity'];
    }

    const transform = searchParams.get('transform');
    if (transform) {
      patch.transform = transform as DataQueryConfig['transform'];
    }

    const metricsStr = searchParams.get('metrics');
    if (metricsStr) {
      patch.metrics = metricsStr.split(',').map((pair) => {
        const [field, aggregation] = pair.split(':');
        return {
          field,
          aggregation: (aggregation as DataQueryConfig['metrics'][0]['aggregation']) || 'AVG',
        };
      });
    }

    const pRow = searchParams.get('pRow');
    const pCol = searchParams.get('pCol');
    const pVal = searchParams.get('pVal');
    const pAgg = searchParams.get('pAgg');
    if (pRow && pCol && pVal) {
      patch.pivot = {
        rowDimension: pRow,
        colDimension: pCol,
        valueMetric: pVal,
        aggregation: (pAgg as DataQueryConfig['pivot']['aggregation']) || 'AVG',
      };
    }

    const filtersStr = searchParams.get('filters');
    if (filtersStr) {
      try {
        patch.filters = JSON.parse(filtersStr);
      } catch {
        // ignore parse error
      }
    }

    return patch;
  }

  /**
   * CSV Exporter
   */
  public static exportToCsv(response: DataQueryExecutionResponse): void {
    let csvContent = '';

    if (response.timeSeriesResult) {
      const ts = response.timeSeriesResult;
      const headers = ['Date', ...ts.seriesKeys.map((k) => ts.seriesLabels[k] || k)];
      csvContent = headers.join(',') + '\n';
      ts.points.forEach((pt) => {
        const row = [pt.date, ...ts.seriesKeys.map((k) => pt.series[k] ?? '')];
        csvContent += row.join(',') + '\n';
      });
    } else if (response.pivotResult) {
      const p = response.pivotResult;
      const headers = [`${p.rowDimension} \\ ${p.colDimension}`, ...p.colKeys, 'Row Total'];
      csvContent = headers.join(',') + '\n';
      p.rowKeys.forEach((rKey) => {
        const row = [
          `"${rKey}"`,
          ...p.colKeys.map((cKey) => p.matrix[rKey]?.[cKey]?.value ?? ''),
          p.rowTotals[rKey]?.value ?? '',
        ];
        csvContent += row.join(',') + '\n';
      });
      // Col totals
      csvContent += ['Column Total', ...p.colKeys.map((cKey) => p.colTotals[cKey]?.value ?? ''), p.grandTotal.value].join(',') + '\n';
    } else if (response.rawDataResult) {
      const raw = response.rawDataResult;
      csvContent = raw.columns.join(',') + '\n';
      raw.records.forEach((rec) => {
        const row = raw.columns.map((col) => {
          const val = rec[col];
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return val ?? '';
        });
        csvContent += row.join(',') + '\n';
      });
    }

    this.downloadFile(csvContent, `sih_data_query_${response.queryConfig.entity}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * JSON Exporter
   */
  public static exportToJson(response: DataQueryExecutionResponse): void {
    const data = {
      query: response.queryConfig,
      executedAt: response.executedAt,
      result: response.timeSeriesResult || response.pivotResult || response.rawDataResult,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, `sih_data_query_${response.queryConfig.entity}_${Date.now()}.json`, 'application/json');
  }

  /**
   * Copy TSV to Clipboard for Microsoft Excel & Google Sheets
   */
  public static async copyTsvToClipboard(response: DataQueryExecutionResponse): Promise<boolean> {
    let tsvContent = '';

    if (response.timeSeriesResult) {
      const ts = response.timeSeriesResult;
      tsvContent = ['Date', ...ts.seriesKeys.map((k) => ts.seriesLabels[k] || k)].join('\t') + '\n';
      ts.points.forEach((pt) => {
        tsvContent += [pt.date, ...ts.seriesKeys.map((k) => pt.series[k] ?? '')].join('\t') + '\n';
      });
    } else if (response.pivotResult) {
      const p = response.pivotResult;
      tsvContent = [`${p.rowDimension} / ${p.colDimension}`, ...p.colKeys, 'Total'].join('\t') + '\n';
      p.rowKeys.forEach((rKey) => {
        tsvContent += [rKey, ...p.colKeys.map((cKey) => p.matrix[rKey]?.[cKey]?.value ?? ''), p.rowTotals[rKey]?.value ?? ''].join('\t') + '\n';
      });
    } else if (response.rawDataResult) {
      const raw = response.rawDataResult;
      tsvContent = raw.columns.join('\t') + '\n';
      raw.records.forEach((rec) => {
        tsvContent += raw.columns.map((col) => rec[col] ?? '').join('\t') + '\n';
      });
    }

    try {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    } catch {
      return false;
    }
  }

  private static downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
