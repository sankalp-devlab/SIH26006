/**
 * Environment configuration helper
 * Centralizes environment variable access with robust fallbacks
 */

import { API_CONFIG } from './api';

export const ENV = {
  API_BASE_URL: API_CONFIG.BASE_URL,
  CARTO_API_KEY: (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_CARTO_API_KEY || import.meta.env?.VITE_MAP_API_KEY)) || '',
  IS_DEV: typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV),
  IS_PROD: typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD),
} as const;
