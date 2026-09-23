/**
 * Centralized API Configuration for OceanLens Maritime Intelligence Platform
 * 
 * Ensures all components and services use a consistent, environment-driven base URL
 * and health check configuration without scattered hardcoded endpoints.
 */

const rawBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000';

export const API_CONFIG = {
  // Base URL normalized without trailing slash
  BASE_URL: rawBaseUrl.replace(/\/+$/, ''),
  HEALTH_ENDPOINT: '/health',
  TIMEOUT_MS: 8000,
  RETRY_DELAYS_MS: [2000, 5000, 10000, 15000],
} as const;

/**
 * Builds a full URL for any API endpoint using the centralized base URL
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
}
