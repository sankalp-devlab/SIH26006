/**
 * Centralized API Configuration for OceanLens Maritime Intelligence Platform
 * 
 * Ensures all components and services use a consistent, environment-driven base URL
 * and health check configuration without scattered hardcoded endpoints.
 */

// Canonical deployed Render microservice URL
export const PRODUCTION_RENDER_BACKEND_URL = 'https://oceanlens-backend.onrender.com';
export const LOCAL_DEV_BACKEND_URL = 'http://127.0.0.1:8000';

const isProduction =
  (typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD)) ||
  (typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    window.location.hostname !== '0.0.0.0');

// Extract explicitly configured environment variable
const rawConfiguredUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_BASE_URL
    : undefined;

const configuredBaseUrl =
  typeof rawConfiguredUrl === 'string' && rawConfiguredUrl.trim() !== ''
    ? rawConfiguredUrl.trim()
    : undefined;

// Guard: Detect if an address points to local machine
const isLocalAddress = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('127.0.0.1') || lower.includes('localhost') || lower.includes('0.0.0.0');
};

// Resolve active base URL with fail-safe production guarantee
const resolveBaseUrl = (): string => {
  if (isProduction) {
    // In production (Vercel, Render, etc.): Never connect to localhost
    if (configuredBaseUrl && !isLocalAddress(configuredBaseUrl)) {
      return configuredBaseUrl;
    }
    return PRODUCTION_RENDER_BACKEND_URL;
  }

  // Local development
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  return LOCAL_DEV_BACKEND_URL;
};

const rawBaseUrl = resolveBaseUrl();

export const API_CONFIG = {
  // Base URL normalized without trailing slash
  BASE_URL: rawBaseUrl.replace(/\/+$/, ''),
  HEALTH_ENDPOINT: '/health',
  // 10s timeout keeps UI buttons and health checks responsive
  TIMEOUT_MS: 10000,
  RETRY_DELAYS_MS: [2000, 4000, 8000],
} as const;

/**
 * Builds a full URL for any API endpoint using the centralized base URL
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
}
