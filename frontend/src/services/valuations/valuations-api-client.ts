/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Signal Ocean Valuations API Client Adapter
 * 
 * Provides production-grade API client abstraction adhering to official Signal Ocean
 * Valuations API specifications, with secure credential handling and automatic fallback.
 */

import { ENV } from '../../config/env';

export interface SignalValuationApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
}

export class ValuationsApiClient {
  private static readonly DEFAULT_TIMEOUT_MS = 6000;

  /**
   * Retrieves active API configuration from environment
   */
  private static getConfig(): SignalValuationApiConfig {
    const apiKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SIGNAL_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.SIGNAL_API_KEY) ||
      '';

    return {
      baseUrl: `${ENV.API_BASE_URL}/v2/valuations`,
      apiKey: apiKey.trim(),
      timeoutMs: this.DEFAULT_TIMEOUT_MS,
    };
  }

  /**
   * Safely executes an HTTP request to the Signal Valuations API endpoint
   */
  private static async request<T>(endpoint: string, queryParams: Record<string, string | number> = {}): Promise<T | null> {
    const config = this.getConfig();

    // If no API key is present in production, gracefully signal fallback mode
    if (!config.apiKey && !ENV.IS_DEV) {
      return null;
    }

    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });

    const queryString = searchParams.toString();
    const url = `${config.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (config.apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = config.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as T;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /**
   * Fetches latest automated market valuation for a given vessel
   */
  static async getVesselValuation(vesselId: number): Promise<unknown | null> {
    return this.request<unknown>(`/vessels/${vesselId}`);
  }

  /**
   * Fetches historical valuation time series for a given vessel
   */
  static async getVesselHistoricalValuation(vesselId: number, period: string = '5Y'): Promise<unknown | null> {
    return this.request<unknown>(`/vessels/${vesselId}/historical`, { period });
  }

  /**
   * Fetches segment valuation benchmarks
   */
  static async getSegmentBenchmarks(): Promise<unknown | null> {
    return this.request<unknown>('/benchmarks');
  }
}
