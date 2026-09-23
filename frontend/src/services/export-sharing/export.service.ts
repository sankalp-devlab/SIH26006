/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Unified Export Service
 *
 * Coordinates multi-format export execution:
 * - Format selection & adapter routing (CSV, Excel XML, JSON, TSV Clipboard)
 * - Column filtering and custom sequencing
 * - Clean file download triggering & memory management
 * - Clipboard operations with error feedback
 */

import type {
  ExportRequest,
  ExportResult,
  ExportColumnDefinition,
  ExportFormat,
  ExportProvenanceMetadata,
} from '../../types/export-sharing';
import { CsvAdapter } from './adapters/csv.adapter';
import { ExcelXmlAdapter } from './adapters/excel-xml.adapter';
import { JsonAdapter } from './adapters/json.adapter';
import { TsvAdapter } from './adapters/tsv.adapter';

export class ExportService {
  /**
   * Resolves active columns to export based on selectedColumnKeys or defaultVisible
   */
  public static resolveActiveColumns<T>(
    columns: ExportColumnDefinition<T>[],
    selectedKeys?: string[]
  ): ExportColumnDefinition<T>[] {
    const normalized: ExportColumnDefinition<T>[] = columns.map((c) => ({
      ...c,
      header: c.header || c.label || c.key,
    }));

    if (selectedKeys && selectedKeys.length > 0) {
      // Order according to selectedKeys sequence
      const colMap = new Map<string, ExportColumnDefinition<T>>(normalized.map((c) => [c.key, c]));
      return selectedKeys
        .map((k) => colMap.get(k))
        .filter((c): c is ExportColumnDefinition<T> => Boolean(c));
    }
    // Fall back to defaultVisible or all columns
    const filtered = normalized.filter((c) => c.defaultVisible !== false);
    return filtered.length > 0 ? filtered : normalized;
  }

  /**
   * Generates sanitized default filename
   */
  public static generateFilename(baseTitle: string, format: string): string {
    const cleanTitle = baseTitle
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 40);
    const dateStr = new Date().toISOString().slice(0, 10);
    const ext = format === 'xlsx' ? 'xls' : format; // Excel XML uses .xls for native Excel association
    return `sih26006_${cleanTitle}_${dateStr}.${ext}`;
  }

  /**
   * Executes an export request and triggers file download or clipboard copy
   */
  public static async executeExport<T = any>(request: ExportRequest<T>): Promise<ExportResult> {
    try {
      const activeColumns = this.resolveActiveColumns(request.columns, request.selectedColumnKeys);
      const filename = request.filename || this.generateFilename(request.title, request.format);
      const exportedAt = new Date().toISOString();

      if (request.data.length === 0) {
        return {
          success: false,
          format: request.format,
          filename,
          recordCount: 0,
          byteSize: 0,
          exportedAt,
          error: 'Dataset is empty. No records available to export.',
        };
      }

      // Handle TSV Clipboard format
      if (request.format === 'tsv') {
        const tsvContent = TsvAdapter.generate(request.data, activeColumns);
        const copied = await this.copyToClipboard(tsvContent);
        return {
          success: copied,
          format: 'tsv',
          filename: 'clipboard',
          recordCount: request.data.length,
          byteSize: new Blob([tsvContent]).size,
          exportedAt,
          error: copied ? undefined : 'Clipboard write permission was denied by the browser.',
        };
      }

      // Handle file formats
      let fileContent: string;
      let mimeType: string;

      switch (request.format) {
        case 'xlsx':
        case 'excel':
          fileContent = ExcelXmlAdapter.generate(request.title, request.data, activeColumns, request.metadata);
          mimeType = 'application/vnd.ms-excel;charset=utf-8;';
          break;

        case 'json':
          fileContent = JsonAdapter.generate(request.title, request.data, activeColumns, request.metadata);
          mimeType = 'application/json;charset=utf-8;';
          break;

        case 'csv':
        default:
          fileContent = CsvAdapter.generate(request.data, activeColumns, request.metadata, true);
          mimeType = 'text/csv;charset=utf-8;';
          break;
      }

      const byteSize = new Blob([fileContent]).size;
      this.triggerFileDownload(fileContent, filename, mimeType);

      return {
        success: true,
        format: request.format,
        filename,
        recordCount: request.data.length,
        byteSize,
        exportedAt,
      };
    } catch (err: any) {
      console.error('[ExportService] Export failed:', err);
      return {
        success: false,
        format: request.format,
        filename: request.filename || 'export-failed',
        recordCount: request.data.length,
        byteSize: 0,
        exportedAt: new Date().toISOString(),
        error: err?.message || 'Unknown export error occurred.',
      };
    }
  }

  /**
   * Ergonomic shortcut for exporting data with direct parameters
   */
  public static async exportData<T = any>(options: {
    format: ExportFormat;
    dataset: string;
    data: T[];
    columns: ExportColumnDefinition<T>[];
    metadata?: ExportProvenanceMetadata;
    title?: string;
    filename?: string;
  }): Promise<ExportResult> {
    return this.executeExport({
      title: options.title || options.dataset,
      dataset: options.dataset,
      data: options.data,
      columns: options.columns,
      format: options.format,
      filename: options.filename,
      metadata: options.metadata,
    });
  }

  /**
   * Copies text to system clipboard using navigator.clipboard with fallback
   */
  public static async copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to document.execCommand
      }
    }

    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch {
        document.body.removeChild(textarea);
        return false;
      }
    }
    return false;
  }

  /**
   * Triggers browser download dialog and cleans up Object URL
   */
  private static triggerFileDownload(content: string, filename: string, mimeType: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
