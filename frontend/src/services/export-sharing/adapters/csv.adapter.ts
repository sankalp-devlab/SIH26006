/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — CSV Format Adapter
 *
 * Implements RFC 4180 compliant CSV generation:
 * - UTF-8 Byte Order Mark (\uFEFF) for immediate native Microsoft Excel compatibility
 * - Strict double-quote escaping ("" for ")
 * - Centralized cell formatting and formula injection prevention
 * - Optional provenance metadata comment block
 */

import type { ExportColumnDefinition, ExportProvenanceMetadata } from '../../../types/export-sharing';
import { ExportFormatter } from '../export-formatter.service';

export class CsvAdapter {
  /**
   * Escapes a single cell string according to RFC 4180 rules
   */
  private static escapeCell(val: string): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Generates complete CSV content as a UTF-8 BOM string
   */
  public static generate<T = any>(
    data: T[],
    columns: ExportColumnDefinition<T>[],
    metadata?: ExportProvenanceMetadata,
    includeMetadataHeader: boolean = false
  ): string {
    const lines: string[] = [];

    // Optional metadata comment block
    if (includeMetadataHeader && metadata) {
      lines.push(`# SIH 26006 Maritime Intelligence Export`);
      lines.push(`# Dataset: ${metadata.datasetName}`);
      lines.push(`# Exported At: ${metadata.exportedAt}`);
      lines.push(`# Records: ${metadata.recordCount}`);
      if (metadata.provenanceStatus) {
        lines.push(`# Provenance: ${metadata.provenanceStatus}`);
      }
      lines.push('');
    }

    // Header Row
    const headerRow = columns.map((col) => this.escapeCell(col.header || col.label || col.key)).join(',');
    lines.push(headerRow);

    // Data Rows
    for (const row of data) {
      const rowValues = columns.map((col) => {
        const raw = ExportFormatter.extractValue(row, col.key);
        const formatted = ExportFormatter.formatCellValue(raw, row, col, { sanitizeFormulas: true });
        return this.escapeCell(formatted);
      });
      lines.push(rowValues.join(','));
    }

    // Prefix with UTF-8 BOM (\uFEFF) to ensure Microsoft Excel displays non-ASCII chars cleanly
    return '\uFEFF' + lines.join('\r\n');
  }
}
