/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 31: EXCEL INTEGRATION & ANALYTICAL WORKBOOK ENGINE
 * Domain Types & Data Contracts
 *
 * Provides strongly typed contracts for:
 * - Multi-Sheet Analytical Workbook Generation (Data, Query Config, Pivot, Charts, Metadata)
 * - Maritime Shipping Pivot Engine Models
 * - Analytical Visualizations & Sparkbars for Excel
 * - Direct Platform Access & Refreshable Connections (.iqy Web Query & Power Query M)
 * - Microsoft Office Add-in Taskpane Bridge & Manifest Contracts
 * - Zero-Credential Data Envelopes & Provenance Guarantees
 */


import type { DataQueryConfig } from './data-query';

export type ExcelWorkbookType =
  | 'static_analytical'
  | 'refreshable_query'
  | 'add_in_connected';

export interface ExcelSheetSelection {
  dataLedger: boolean;
  queryConfig: boolean;
  pivotAnalysis: boolean;
  chartsAndVisuals: boolean;
  provenanceMetadata: boolean;
}

export interface ExcelAnalyticalWorkbookConfig {
  workbookTitle: string;
  datasetName: string;
  sheets?: Partial<ExcelSheetSelection>;
  includeFormulas?: boolean;       // Generates Excel formulas (=SUM, =AVERAGE, =SUBTOTAL)
  includeZebraStriping?: boolean;
  maxRowLimit?: number;             // Default 25,000 for browser safety
  customFilename?: string;
  targetCurrencySymbol?: string;    // Default '$'
  refreshUrl?: string;              // Secure refresh URL for live connection
}

export interface ExcelWorkbookResult {
  success: boolean;
  filename: string;
  byteSize: number;
  sheetCount: number;
  sheetsGenerated: string[];
  formulaCount: number;
  recordCount: number;
  generatedAt: string;
  workbookType: ExcelWorkbookType;
  error?: string;
}

/**
 * Pivot Matrix Model for Excel Cross-Tabulation
 */
export interface ExcelPivotDimension {
  key: string;
  label: string;
  isTime?: boolean;
}

export interface ExcelPivotMetric {
  key: string;
  label: string;
  aggregation: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT';
  formatter?: 'currency' | 'number' | 'percent' | 'integer';
  unit?: string;
}

export interface ExcelPivotAnalysisData {
  title: string;
  rowDimension: ExcelPivotDimension;
  colDimension: ExcelPivotDimension;
  metric: ExcelPivotMetric;
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, number | null>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
}

/**
 * Visual Chart & Sparkbar Model for Excel
 */
export interface ExcelVisualBarItem {
  label: string;
  category: string;
  value: number;
  percentage: number;
  visualBar: string;            // Unicode ASCII sparkbar: [████████░░] 78%
  deltaPercent?: number;         // e.g. +14.2%
  trendIndicator: 'UP' | 'DOWN' | 'STABLE';
}

export interface ExcelChartSection {
  title: string;
  description: string;
  metricLabel: string;
  items: ExcelVisualBarItem[];
  suggestedExcelChartType: 'ColumnClustered' | 'LineMarkers' | 'AreaStacked' | 'BarClustered';
  chartDataRange: string;       // e.g. "'Pivot Analysis'!$A$3:$M$9"
}

/**
 * Refreshable Connection Contract (Web Query .iqy & Power Query M)
 */
export interface ExcelRefreshConnection {
  connectionId: string;
  queryConfig: DataQueryConfig;
  iqyContent: string;           // Microsoft Excel Web Query (.iqy) file content
  powerQueryMCode: string;      // Power Query Advanced Editor M formula
  refreshUrl: string;           // Endpoint URL with query capability token
  expiresAt: string;            // ISO 8601 UTC timestamp
  securityStatus: 'ZERO_CREDENTIAL_SECURE';
}

/**
 * Office Add-in Taskpane Bridge Contracts
 */
export interface OfficeTaskpaneState {
  isOfficeInitialized: boolean;
  isHostExcel: boolean;
  hostVersion?: string;
  platform?: 'PC' | 'Mac' | 'OfficeOnline' | 'BrowserSimulator';
  activeSelectionAddress?: string;
}

export interface OfficeInsertRequest {
  tableName: string;
  sheetName?: string;
  startCell?: string;           // Default 'A1'
  headers: string[];
  rows: (string | number | boolean | null)[][];
  includeTotalsRow?: boolean;
}

export interface OfficeInsertResult {
  success: boolean;
  insertedAddress?: string;
  rowCount: number;
  columnCount: number;
  error?: string;
}

/**
 * Canonical Shipping Dimensions & Metrics for Excel Analysis
 */
export type MaritimeShippingDimensionKey =
  | 'vesselClass'
  | 'marketSegment'
  | 'corridorOrRoute'
  | 'originRegion'
  | 'destinationRegion'
  | 'cargoCommodity'
  | 'status'
  | 'vessel'
  | 'owner'
  | 'port'
  | 'year'
  | 'quarter'
  | 'month'
  | 'date';

export type MaritimeShippingMetricKey =
  | 'rateTceUsdPerDay'
  | 'volumeMetricTons'
  | 'voyageDistanceNm'
  | 'tonMilesBillion'
  | 'waitingDaysAtPort'
  | 'co2EmissionsMt'
  | 'bunkerPriceUsdPerMt'
  | 'vesselCount'
  | 'fuelConsumptionMt';

/**
 * Scoped Zero-Credential Capability Token Structure
 */
export interface CapabilityTokenPayload {
  entity: string;
  mode: string;
  start: string;
  end: string;
  granularity?: string;
  metrics: string[];
  filters: Array<{ f: string; op: string; v: any }>;
  exp: string; // ISO 8601 UTC expiration
  nonce: string;
}

/**
 * Backend API Refresh Response Structure
 */
export interface ExcelRefreshResponse<T = any> {
  status: 'success' | 'error';
  entity: string;
  recordCount: number;
  generatedAt: string;
  provenance: string;
  records: T[];
  error?: string;
}

