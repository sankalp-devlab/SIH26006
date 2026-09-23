/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 31: EXCEL INTEGRATION & ANALYTICAL WORKBOOK ENGINE
 * Microsoft Office.js Add-in Taskpane Bridge & Controller
 *
 * Coordinates live interaction with Microsoft Excel desktop & online:
 * - Detects Office.js environment (host, platform, version)
 * - Inserts tabular data, headers, and totals directly into the active worksheet
 * - Provides graceful fallback simulator when opened in a standard browser
 */

import type {
  OfficeInsertRequest,
  OfficeInsertResult,
  OfficeTaskpaneState,
} from '../../types/excel-integration';

export class OfficeJsService {
  private static isInitialized = false;
  private static state: OfficeTaskpaneState = {
    isOfficeInitialized: false,
    isHostExcel: false,
    platform: 'BrowserSimulator',
  };

  /**
   * Initializes Office.js runtime or detects browser simulator mode
   */
  public static async initialize(): Promise<OfficeTaskpaneState> {
    if (this.isInitialized) return this.state;

    if (typeof window !== 'undefined' && (window as any).Office) {
      try {
        await new Promise<void>((resolve) => {
          (window as any).Office.onReady((info: any) => {
            const isExcel = info.host === (window as any).Office.HostType.Excel;
            this.state = {
              isOfficeInitialized: true,
              isHostExcel: isExcel,
              platform: info.platform || 'PC',
              hostVersion: (window as any).Office.context?.diagnostics?.version,
            };
            resolve();
          });
        });
      } catch (err) {
        console.warn('[OfficeJsService] Office.js failed to initialize, using simulator mode:', err);
      }
    } else {
      // Browser simulator mode
      this.state = {
        isOfficeInitialized: false,
        isHostExcel: false,
        platform: 'BrowserSimulator',
      };
    }

    this.isInitialized = true;
    return this.state;
  }

  /**
   * Returns current taskpane status
   */
  public static getState(): OfficeTaskpaneState {
    return this.state;
  }

  /**
   * Checks if running inside genuine Microsoft Excel Office runtime
   */
  public static isRunningInExcel(): boolean {
    return this.state.isOfficeInitialized && this.state.isHostExcel;
  }

  /**
   * Writes data directly into the active Excel worksheet
   */
  public static async insertTableIntoActiveWorksheet(
    request: OfficeInsertRequest
  ): Promise<OfficeInsertResult> {
    // 1. Live Microsoft Excel execution via Excel.run
    if (this.isRunningInExcel() && (window as any).Excel) {
      try {
        let insertedRangeAddress = '';
        await (window as any).Excel.run(async (context: any) => {
          const sheet = request.sheetName
            ? context.workbook.worksheets.getItem(request.sheetName)
            : context.workbook.worksheets.getActiveWorksheet();

          const startCell = request.startCell || 'A1';
          const totalRows = request.rows.length + 1; // +1 for headers
          const totalCols = request.headers.length;

          // Target range from startCell
          const targetRange = sheet.getRange(startCell).getResizedRange(totalRows - 1, totalCols - 1);
          const allData = [request.headers, ...request.rows];

          targetRange.values = allData;

          // Format header row
          const headerRange = targetRange.getRow(0);
          headerRange.format.fill.color = '#0F172A';
          headerRange.format.font.color = '#38BDF8';
          headerRange.format.font.bold = true;

          // Auto-fit columns
          targetRange.format.autofitColumns();

          targetRange.load('address');
          await context.sync();
          insertedRangeAddress = targetRange.address;
        });

        return {
          success: true,
          insertedAddress: insertedRangeAddress,
          rowCount: request.rows.length,
          columnCount: request.headers.length,
        };
      } catch (err: any) {
        console.error('[OfficeJsService] Excel.run insertion failed:', err);
        return {
          success: false,
          rowCount: request.rows.length,
          columnCount: request.headers.length,
          error: err?.message || 'Failed to insert table via Excel.run',
        };
      }
    }

    // 2. Browser Simulator Mode (Safe fallback with realistic feedback)
    console.log(
      `[OfficeJsService Simulator] Inserted ${request.rows.length} rows × ${request.headers.length} cols at ${request.startCell || 'A1'}`
    );

    return {
      success: true,
      insertedAddress: `Sheet1!${request.startCell || 'A1'}:${String.fromCharCode(64 + Math.min(26, request.headers.length))}${request.rows.length + 1}`,
      rowCount: request.rows.length,
      columnCount: request.headers.length,
    };
  }
}
