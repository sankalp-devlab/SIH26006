/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices & Forward Freight API Client Adapter
 *
 * Provides resilient HTTP communication with Signal Ocean and Baltic Exchange market price APIs,
 * with non-blocking timeouts and instantaneous typed fallback to canonical benchmark models.
 */

import { ENV } from '../../config/env';
import type { MarketPricesPayload } from '../../types/market-prices';
import {
  CANONICAL_ROUTES,
  CANONICAL_SPOT_PRICES,
  CANONICAL_FFA_CONTRACTS,
  CANONICAL_HISTORICAL_SERIES,
  CANONICAL_MARKET_SIGNALS,
} from './market-prices.data';
import { buildRouteForwardCurve } from './market-prices-analytics-engine';

export class MarketPricesApiClient {
  private static readonly REQUEST_TIMEOUT_MS = 4000;

  /**
   * Builds the fallback benchmark payload
   */
  public static buildCanonicalPayload(): MarketPricesPayload {
    const curves: Record<string, ReturnType<typeof buildRouteForwardCurve>> = {};
    CANONICAL_SPOT_PRICES.forEach((spot) => {
      curves[spot.routeCode] = buildRouteForwardCurve(
        spot.routeCode,
        spot,
        CANONICAL_FFA_CONTRACTS
      );
    });

    return {
      routes: CANONICAL_ROUTES,
      spotPrices: CANONICAL_SPOT_PRICES,
      ffaContracts: CANONICAL_FFA_CONTRACTS,
      forwardCurves: curves,
      historicalSeries: CANONICAL_HISTORICAL_SERIES,
      signals: CANONICAL_MARKET_SIGNALS,
      lastUpdated: '13 Sep 2026 • 17:30 UTC',
      freshnessStatus: 'CANONICAL_BENCHMARK_ENGINE',
    };
  }

  /**
   * Fetches market prices with graceful fallback
   */
  public static async fetchMarketPricesPayload(
    forceLive: boolean = false
  ): Promise<MarketPricesPayload> {
    if (!forceLive) {
      return this.buildCanonicalPayload();
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

    try {
      const url = `${ENV.API_BASE_URL}/market-prices/overview`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const json = await response.json();
      if (json && Array.isArray(json.spotPrices) && json.spotPrices.length > 0) {
        return {
          ...json,
          freshnessStatus: 'LIVE_SIGNAL_API',
        };
      }

      return this.buildCanonicalPayload();
    } catch {
      clearTimeout(timer);
      // Fallback silently to canonical dataset
      return this.buildCanonicalPayload();
    }
  }
}
