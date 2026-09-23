/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices & Forward Freight Service
 *
 * Central service layer providing synchronous initial data guarantee,
 * API normalization, metadata lookups, and browser-side CSV/JSON data export utilities.
 */

import type {
  MarketPricesPayload,
  SpotPriceRecord,
  FfaContractRecord,
  RouteForwardCurve,
  HistoricalPricePoint,
  MarketSegmentType,
  VesselClassType,
} from '../../types/market-prices';
import { MarketPricesApiClient } from './market-prices-api-client';

export class MarketPricesService {
  /**
   * Synchronous Initial Data Guarantee: prevents null renders and layout shifts
   */
  public static getInitialData(): MarketPricesPayload {
    return MarketPricesApiClient.buildCanonicalPayload();
  }

  /**
   * Fetches latest market price payload
   */
  public static async fetchPayload(forceLive: boolean = false): Promise<MarketPricesPayload> {
    return MarketPricesApiClient.fetchMarketPricesPayload(forceLive);
  }

  /**
   * Metadata Extractors
   */
  public static getAvailableRouteCodes(payload: MarketPricesPayload): string[] {
    return Array.from(new Set(payload.routes.map((r) => r.routeCode)));
  }

  public static getAvailableVesselClasses(payload: MarketPricesPayload): VesselClassType[] {
    return Array.from(new Set(payload.routes.map((r) => r.vesselClass)));
  }

  public static getAvailableSegments(payload: MarketPricesPayload): MarketSegmentType[] {
    return Array.from(new Set(payload.routes.map((r) => r.marketSegment)));
  }

  /**
   * CSV & JSON Export Utilities
   */
  private static triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static exportSpotPricesCsv(spotPrices: SpotPriceRecord[]): void {
    const headers = [
      'Route Code',
      'Route Name',
      'Origin',
      'Destination',
      'Vessel Class',
      'Segment',
      'Region',
      'Rate TCE ($/day)',
      'Unit',
      '1D Change ($)',
      '1D Change (%)',
      '7D Change (%)',
      '30D Change (%)',
      '52W High ($)',
      '52W Low ($)',
      'Market Status',
      'Last Fixture',
    ];

    const rows = spotPrices.map((s) => [
      s.routeCode,
      `"${s.routeName}"`,
      `"${s.originPort}"`,
      `"${s.destinationPort}"`,
      s.vesselClass,
      s.marketSegment,
      s.region,
      s.rateTceUsdPerDay,
      s.rateUnit,
      s.change1dUsd,
      s.change1dPct,
      s.change7dPct,
      s.change30dPct,
      s.high52wUsd,
      s.low52wUsd,
      s.marketStatus,
      s.lastFixtureDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `sih_market_spot_prices_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  public static exportFfaContractsCsv(ffaContracts: FfaContractRecord[], routeCode?: string): void {
    const filtered = routeCode
      ? ffaContracts.filter((c) => c.routeCode === routeCode)
      : ffaContracts;

    const headers = [
      'Contract ID',
      'Route Code',
      'Vessel Class',
      'Tenor Period',
      'Tenor Label',
      'Settlement Date',
      'Bid ($/day)',
      'Ask ($/day)',
      'Mid ($/day)',
      '1D Change (%)',
      'Volume (Lots)',
      'Open Interest (Lots)',
    ];

    const rows = filtered.map((c) => [
      c.id,
      c.routeCode,
      c.vesselClass,
      c.tenor,
      `"${c.tenorLabel}"`,
      c.settlementDate,
      c.bidPriceUsdPerDay,
      c.askPriceUsdPerDay,
      c.midPriceUsdPerDay,
      c.change1dPct,
      c.volumeLots,
      c.openInterestLots,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(
      blob,
      `sih_ffa_contracts_${routeCode || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  public static exportForwardCurveCsv(curve: RouteForwardCurve): void {
    const headers = [
      'Tenor Period',
      'Tenor Label',
      'Rate ($/day)',
      'Spread to Spot ($)',
      'Spread to Spot (%)',
      'Bid ($/day)',
      'Ask ($/day)',
      'Volume (Lots)',
      'Open Interest (Lots)',
    ];

    const rows = curve.points.map((p) => [
      p.tenor,
      `"${p.tenorLabel}"`,
      p.rateUsdPerDay,
      p.spreadToSpotUsd,
      p.spreadToSpotPct,
      p.bidPriceUsdPerDay,
      p.askPriceUsdPerDay,
      p.volumeLots,
      p.openInterestLots,
    ]);

    const headerNote = `# Route: ${curve.routeCode} (${curve.vesselClass}) | Current Spot: $${curve.currentSpotTceUsdPerDay}/day | Structure: ${curve.curveStructure}\n`;
    const csvContent = headerNote + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `sih_forward_curve_${curve.routeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  public static exportHistoricalPricesCsv(
    historicalPoints: HistoricalPricePoint[],
    routeCode: string
  ): void {
    const headers = [
      'Appraisal Date',
      'Timestamp',
      'Spot Rate ($/day)',
      'Front-Month FFA ($/day)',
      'Spread ($/day)',
      'Spread (%)',
      'Volume (Lots)',
    ];

    const rows = historicalPoints.map((p) => [
      `"${p.date}"`,
      p.timestamp,
      p.spotRateUsdPerDay,
      p.ffaFrontMonthUsdPerDay,
      p.spreadUsdPerDay,
      p.spreadPct,
      p.volumeLots || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, `sih_historical_prices_${routeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  public static exportMarketReportJson(payload: MarketPricesPayload): void {
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    this.triggerDownload(blob, `sih_market_prices_report_${new Date().toISOString().slice(0, 10)}.json`);
  }
}
