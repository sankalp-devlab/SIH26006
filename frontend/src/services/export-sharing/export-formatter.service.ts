/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Centralized Formatting Service
 *
 * Provides standardized formatting across all export adapters:
 * - Number & Currency formatting (USD, MT, DWT, kts, NM)
 * - Dates & Timestamps (ISO 8601, localized date strings)
 * - Status tags & Coordinate strings
 * - Formula Injection Prevention (Sanitizes =, +, -, @ prefixes for Excel/CSV)
 */

import type { ExportColumnDefinition, ExportColumnType } from '../../types/export-sharing';

export class ExportFormatter {
  /**
   * Prevents CSV / Excel formula execution exploits
   * If string begins with =, +, -, @, \t, \r, escape with single quote
   */
  public static sanitizeFormulaInjection(value: string): string {
    if (typeof value !== 'string') return value;
    const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
    if (dangerousPrefixes.some((p) => value.startsWith(p))) {
      return `'${value}`;
    }
    return value;
  }

  /**
   * Extracts a nested property value using dot-notation (e.g. 'owner.name')
   */
  public static extractValue(row: any, key: string): any {
    if (!row || !key) return undefined;
    if (key.includes('.')) {
      return key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), row);
    }
    return row[key];
  }

  /**
   * Formats a raw cell value according to column definition and type
   */
  public static formatCellValue(
    rawValue: any,
    row: any,
    column: ExportColumnDefinition,
    options: { sanitizeFormulas?: boolean } = { sanitizeFormulas: true }
  ): string {
    // 1. Check custom column formatter function first
    if (column.formatFn) {
      const customFormatted = column.formatFn(rawValue, row);
      const strVal = customFormatted === null || customFormatted === undefined ? '' : String(customFormatted);
      return options.sanitizeFormulas ? this.sanitizeFormulaInjection(strVal) : strVal;
    }

    // 2. Handle null / undefined
    if (rawValue === null || rawValue === undefined) {
      return '';
    }

    // 3. Format based on type
    const colType: ExportColumnType = column.type || 'text';
    let formatted: string;

    switch (colType) {
      case 'number':
        if (typeof rawValue === 'number') {
          formatted = rawValue.toLocaleString('en-US');
        } else {
          const num = Number(rawValue);
          formatted = isNaN(num) ? String(rawValue) : num.toLocaleString('en-US');
        }
        break;

      case 'currency':
        if (typeof rawValue === 'number') {
          formatted = `$${rawValue.toLocaleString('en-US')}`;
        } else {
          const num = Number(rawValue);
          formatted = isNaN(num) ? String(rawValue) : `$${num.toLocaleString('en-US')}`;
        }
        break;

      case 'percent':
        if (typeof rawValue === 'number') {
          formatted = `${(rawValue > 1 ? rawValue : rawValue * 100).toFixed(1)}%`;
        } else {
          formatted = String(rawValue).endsWith('%') ? String(rawValue) : `${rawValue}%`;
        }
        break;

      case 'date':
        try {
          const d = new Date(rawValue);
          if (!isNaN(d.getTime())) {
            formatted = d.toISOString().slice(0, 10);
          } else {
            formatted = String(rawValue);
          }
        } catch {
          formatted = String(rawValue);
        }
        break;

      case 'coordinates':
        if (Array.isArray(rawValue) && rawValue.length >= 2) {
          formatted = `${Number(rawValue[0]).toFixed(4)}°, ${Number(rawValue[1]).toFixed(4)}°`;
        } else if (typeof rawValue === 'object' && rawValue !== null && 'lat' in rawValue) {
          const lon = (rawValue as any).lng ?? (rawValue as any).lon ?? (rawValue as any).longitude;
          formatted = `${Number(rawValue.lat).toFixed(4)}°, ${Number(lon).toFixed(4)}°`;
        } else if (typeof rawValue === 'number') {
          formatted = `${Number(rawValue).toFixed(4)}°`;
        } else {
          formatted = String(rawValue);
        }
        break;

      case 'status':
        formatted = String(rawValue)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        break;

      case 'text':
      default:
        if (Array.isArray(rawValue)) {
          formatted = rawValue.join(', ');
        } else if (typeof rawValue === 'object') {
          formatted = JSON.stringify(rawValue);
        } else {
          formatted = String(rawValue);
        }
        break;
    }

    return options.sanitizeFormulas ? this.sanitizeFormulaInjection(formatted) : formatted;
  }
}
