/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Domain Types & Data Contracts
 *
 * Provides strongly typed contracts for:
 * - Multi-Format Export Engine (CSV, SpreadsheetML Excel XML, JSON, TSV Clipboard)
 * - Centralized Column Mapping & Selection
 * - Automated Formatting & Formula Injection Prevention
 * - Data Provenance & Metadata Envelopes
 * - Shareable & Refreshable URL Serialization
 * - Custom Export Templates (Integrated with Module 29 Personalization)
 */

export type ExportFormat = 'csv' | 'xlsx' | 'excel' | 'json' | 'tsv';

export type ExportColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'percent'
  | 'status'
  | 'coordinates';

export interface ExportColumnDefinition<T = any> {
  key: string;
  header?: string;
  label?: string; // Ergonomic alias for header
  type?: ExportColumnType;
  formatter?: string; // Ergonomic string alias for common formatters (number, currency, date, status, coordinate)
  defaultVisible?: boolean;
  width?: number; // Approximate character width for Excel column sizing
  formatFn?: (value: any, row: T) => string | number;
}

export interface ExportProvenanceMetadata {
  datasetName?: string;
  source?: string; // Ergonomic alias for dataset / origin
  exportedAt?: string; // ISO 8601
  generatedBy?: string;
  recordCount?: number;
  totalRecordCount?: number; // Ergonomic alias
  activeFilters?: Record<string, any>;
  filtersApplied?: Record<string, any>; // Ergonomic alias
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  provenanceStatus?: 'CANONICAL_EMPIRICAL' | 'SIMULATED' | 'ESTIMATED' | 'USER_WORKSPACE';
  originUrl?: string;
  notes?: string;
  description?: string;
  executionTimeMs?: number;
  datasetDescription?: string;
  [key: string]: any;
}

export interface ExportRequest<T = any> {
  title: string;
  dataset: string;
  data: T[];
  columns: ExportColumnDefinition<T>[];
  selectedColumnKeys?: string[];
  format: ExportFormat;
  filename?: string;
  metadata?: ExportProvenanceMetadata;
  templateId?: string;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  filename: string;
  recordCount: number;
  byteSize: number;
  exportedAt: string;
  error?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  targetDataset: string;
  selectedColumnKeys: string[];
  columnOrder?: string[];
  defaultFormat: ExportFormat;
  createdAt: string;
  updatedAt: string;
}

export interface ShareableUrlConfig {
  entityOrView: string;
  parameters: Record<string, any>;
  baseUrl?: string;
}
