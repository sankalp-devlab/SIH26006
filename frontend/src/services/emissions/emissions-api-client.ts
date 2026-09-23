/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Signal Ocean Emissions API Client Adapter
 * 
 * Provides production-grade API client abstraction adhering to official Signal Ocean
 * Emissions API specifications, with secure credential handling and automatic fallback.
 */

import { ENV } from '../../config/env';

export interface SignalApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
}

export class EmissionsApiClient {
  private static readonly DEFAULT_TIMEOUT_MS = 6000;

  /**
   * Retrieves active API configuration from environment
   */
  private static getConfig(): SignalApiConfig {
    const apiKey =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SIGNAL_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.SIGNAL_API_KEY) ||
      '';

    return {
      baseUrl: `${ENV.API_BASE_URL}/v2/emissions`,
      apiKey: apiKey.trim(),
      timeoutMs: this.DEFAULT_TIMEOUT_MS,
    };
  }

  /**
   * Safely executes an HTTP request to the Signal Emissions API endpoint
   */
  private static async request<T>(endpoint: string, queryParams: Record<string, string | number> = {}): Promise<T | null> {
    const config = this.getConfig();

    // If no API key is present in environment, gracefully signal fallback mode immediately
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
      headers['Signal-API-Key'] = config.apiKey;
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
        console.warn(`[EmissionsApiClient] Signal API returned status ${response.status} for ${endpoint}. Initiating benchmark fallback.`);
        return null;
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      // Suppress network crash; return null so service layer seamlessly serves verified benchmark data
      console.info(`[EmissionsApiClient] Live Signal API unavailable (${err instanceof Error ? err.message : 'timeout'}). Serving Signal-compatible benchmark dataset.`);
      return null;
    }
  }

  /**
   * Fetch vessel emissions by IMO or fleet query
   */
  public static async getVesselEmissions(imo?: string): Promise<unknown | null> {
    const endpoint = imo ? `/vessels/${encodeURIComponent(imo)}` : '/vessels';
    return this.request(endpoint);
  }

  /**
   * Fetch voyage emissions
   */
  public static async getVoyageEmissions(voyageId?: string): Promise<unknown | null> {
    const endpoint = voyageId ? `/voyages/${encodeURIComponent(voyageId)}` : '/voyages';
    return this.request(endpoint);
  }

  /**
   * Fetch leg emissions
   */
  public static async getLegEmissions(voyageId?: string): Promise<unknown | null> {
    return this.request('/legs', voyageId ? { voyageId } : {});
  }

  /**
   * Fetch operations emissions
   */
  public static async getOperationsEmissions(): Promise<unknown | null> {
    return this.request('/operations');
  }

  /**
   * Fetch benchmarks
   */
  public static async getBenchmarks(): Promise<unknown | null> {
    return this.request('/benchmarks');
  }
}
