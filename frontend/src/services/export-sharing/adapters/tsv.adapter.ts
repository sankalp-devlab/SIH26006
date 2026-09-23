/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — TSV Clipboard Format Adapter
 *
 * Implements tab-separated plaintext generation for spreadsheet clipboard paste:
 * - Direct Ctrl+V support in Microsoft Excel, Google Sheets, LibreOffice Calc
 * - Formula injection sanitization
 * - Safe newline and tab replacement inside cell text
 */

import type { ExportColumnDefinition } from '../../../types/export-sharing';
import { ExportFormatter } from '../export-formatter.service';

export class TsvAdapter {
  private static cleanTsvCell(val: string): string {
    if (val === null || val === undefined) return '';
    // Replace tabs and newlines with spaces to avoid breaking TSV table structure
    return String(val).replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
  }

  public static generate<T = any>(data: T[], columns: ExportColumnDefinition<T>[]): string {
    const lines: string[] = [];

    // Header row
    lines.push(columns.map((c) => this.cleanTsvCell(c.header || c.label || c.key)).join('\t'));

    // Data rows
    for (const row of data) {
      const rowValues = columns.map((col) => {
        const raw = ExportFormatter.extractValue(row, col.key);
        const formatted = ExportFormatter.formatCellValue(raw, row, col, { sanitizeFormulas: true });
        return this.cleanTsvCell(formatted);
      });
      lines.push(rowValues.join('\t'));
    }

    return lines.join('\n');
  }
}
