/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — JSON Format Adapter
 *
 * Implements structured JSON dataset export with provenance metadata envelope:
 * - Schema versioning (SIH26006_EXPORT_V1)
 * - Complete execution metadata (timestamps, filters, source status)
 * - Clean mapped object records
 */

import type { ExportColumnDefinition, ExportProvenanceMetadata } from '../../../types/export-sharing';
import { ExportFormatter } from '../export-formatter.service';

export class JsonAdapter {
  public static generate<T = any>(
    title: string,
    data: T[],
    columns: ExportColumnDefinition<T>[],
    metadata?: ExportProvenanceMetadata
  ): string {
    const formattedRecords = data.map((row) => {
      const recordObj: Record<string, any> = {};
      for (const col of columns) {
        const raw = ExportFormatter.extractValue(row, col.key);
        // Retain native numbers/booleans for JSON, otherwise format
        if (col.type === 'number' && typeof raw === 'number') {
          recordObj[col.key] = raw;
        } else {
          recordObj[col.key] = ExportFormatter.formatCellValue(raw, row, col, { sanitizeFormulas: false });
        }
      }
      return recordObj;
    });

    const datasetName = metadata?.datasetName || title;
    const payload = {
      schema: 'SIH26006_EXPORT_V1',
      schemaVersion: 'SIH26006_EXPORT_V1',
      title,
      dataset: datasetName,
      metadata: metadata || {
        datasetName,
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        provenanceStatus: 'CANONICAL_EMPIRICAL',
      },
      columns: columns.map((c) => ({ key: c.key, header: c.header || c.label || c.key, type: c.type || 'text' })),
      recordCount: formattedRecords.length,
      totalRecords: formattedRecords.length,
      records: formattedRecords,
      data: formattedRecords,
    };

    return JSON.stringify(payload, null, 2);
  }
}
