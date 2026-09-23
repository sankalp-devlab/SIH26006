/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — Domain Types & Data Contracts
 *
 * Professional maritime data explorer supporting:
 * - Query Modes: Time Series, Raw Data, Pivot Aggregation
 * - Mathematical & Analytical Functions (SUM, AVG, MIN, MAX, COUNT, SMA, YoY, CumSum)
 * - Historical Coverage back to 2014 (12+ years of real maritime data)
 * - Dynamic Multi-Attribute Filters & Custom SQL-like Query Console
 * - Refreshable URLs, Shareable State, and Multi-format Exports (CSV, JSON, TSV)
 */

export type QueryMode = 'time_series' | 'raw_data' | 'pivot';

export type MaritimeDatasetEntity =
  | 'freight_rates'
  | 'trade_flows'
  | 'fleet_movements'
  | 'port_congestion'
  | 'fleet_emissions';

export type AggregationFunction =
  | 'SUM'
  | 'AVG'
  | 'MIN'
  | 'MAX'
  | 'COUNT';

export type AnalyticalTransform =
  | 'NONE'
  | 'SMA_7D'
  | 'SMA_30D'
  | 'YOY_PCT'
  | 'CUMSUM'
  | 'INDEX_BASE_100';

export type TimeGranularity =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual';

export type FilterOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'CONTAINS'
  | 'IN';

export interface QueryFilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface TimeRangeConfig {
  startDate: string; // ISO format '2014-01-01'
  endDate: string;   // ISO format '2026-09-01'
  preset?: '2014_PRESENT' | '10Y' | '5Y' | '3Y' | '1Y' | 'YTD' | 'CUSTOM';
}

export interface MetricSelection {
  field: string;
  aggregation: AggregationFunction;
  alias?: string;
}

export interface PivotConfig {
  rowDimension: string;
  colDimension: string;
  valueMetric: string;
  aggregation: AggregationFunction;
}

export interface DataQueryConfig {
  mode: QueryMode;
  entity: MaritimeDatasetEntity;
  fields: string[];
  dimensions: string[];
  metrics: MetricSelection[];
  transform: AnalyticalTransform;
  granularity: TimeGranularity;
  timeRange: TimeRangeConfig;
  filters: QueryFilterCondition[];
  pivot: PivotConfig;
  customSql?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  limit: number;
}

/**
 * Standard Schema Metadata for Maritime Entities
 */
export interface EntityFieldDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  isDimension: boolean;
  isMetric: boolean;
  unit?: string;
  description: string;
  supportedAggregations?: AggregationFunction[];
}

export interface EntitySchema {
  entity: MaritimeDatasetEntity;
  label: string;
  description: string;
  historicalStart: string; // '2014-01-01'
  historicalEnd: string;   // '2026-09-01'
  totalRecordsCount: number;
  fields: EntityFieldDefinition[];
}

/**
 * Raw Unified Maritime Record with Historical Depth (2014–2026)
 */
export interface UnifiedMaritimeDataRecord {
  id: string;
  date: string;              // 'YYYY-MM-DD'
  year: number;              // 2014..2026
  month: number;             // 1..12
  quarter: string;           // 'Q1'..'Q4'
  entity: MaritimeDatasetEntity;
  vesselClass: string;       // 'VLCC', 'Suezmax', 'Aframax', 'Capesize', 'Panamax', 'LNG Carrier'
  marketSegment: string;     // 'Crude Tanker', 'Clean Product', 'Dry Bulk', 'LNG'
  corridorOrRoute: string;   // 'TD3C', 'TD20', 'TC2', 'C5', 'C3', 'BLNG1g'
  originRegion: string;      // 'Middle East', 'West Africa', 'US Gulf', 'Australia', 'Brazil'
  destinationRegion: string; // 'China', 'Northwest Europe', 'India', 'Japan/Korea', 'US Atlantic'
  cargoCommodity: string;    // 'Crude Oil', 'Gasoline', 'Iron Ore', 'Thermal Coal', 'LNG'
  rateTceUsdPerDay: number;
  volumeMetricTons: number;
  voyageDistanceNm: number;
  tonMilesBillion: number;
  waitingDaysAtPort: number;
  co2EmissionsMt: number;
  bunkerPriceUsdPerMt: number;
  status: 'Completed' | 'In-Transit' | 'Fixed' | 'Discharging';
}

/**
 * Time-Series Data Point
 */
export interface TimeSeriesPoint {
  date: string;
  timestamp: number;
  series: Record<string, number>;
}

/**
 * Time-Series Output Model
 */
export interface TimeSeriesQueryResult {
  seriesKeys: string[];
  seriesLabels: Record<string, string>;
  seriesUnits: Record<string, string>;
  points: TimeSeriesPoint[];
  summary: {
    min: number;
    max: number;
    avg: number;
    total: number;
    observationCount: number;
  };
}

/**
 * Pivot Table Output Model
 */
export interface PivotCell {
  value: number | null;
  formatted: string;
  count: number;
}

export interface PivotQueryResult {
  rowDimension: string;
  colDimension: string;
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, PivotCell>>;
  rowTotals: Record<string, PivotCell>;
  colTotals: Record<string, PivotCell>;
  grandTotal: PivotCell;
}

/**
 * Raw Data Output Model
 */
export interface RawDataQueryResult {
  columns: string[];
  columnTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  records: Record<string, unknown>[];
  totalMatchingRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Complete Execution Payload
 */
export interface DataQueryExecutionResponse {
  queryConfig: DataQueryConfig;
  executedAt: string;
  executionTimeMs: number;
  timeSeriesResult?: TimeSeriesQueryResult;
  rawDataResult?: RawDataQueryResult;
  pivotResult?: PivotQueryResult;
  coverageInfo: {
    historicalStart: string;
    historicalEnd: string;
    isTruncated: boolean;
    unavailableRangeNoted?: string;
  };
  shareableUrl: string;
  queryProvenance?: import('./provenance').DataProvenance;
}

/**
 * Pre-engineered Maritime Query Template
 */
export interface QueryTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'Commercial' | 'Operations' | 'Decarbonization' | 'Macro Trends';
  config: Partial<DataQueryConfig>;
}
