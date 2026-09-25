import { ENV } from '../../config/env';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  retry?: boolean;
}

const MAX_AUTO_RETRIES = 1;
const RETRY_BACKOFF_MS = [1000];
const DEFAULT_TIMEOUT_MS = 12000; // 12s timeout ensures buttons never hang for long

function isTransientError(status: number, error?: unknown): boolean {
  // 502/503/504 indicates proxy/server spinning up or gateway timeout
  if (status === 502 || status === 503 || status === 504 || status === 408) {
    return true;
  }
  if (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('aborted') ||
        error.name === 'AbortError'))
  ) {
    return true;
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, timeoutMs = DEFAULT_TIMEOUT_MS, retry: explicitRetry, ...customConfig } = options;

  let url = `${ENV.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const method = (customConfig.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  const shouldRetry = explicitRetry ?? isIdempotent;
  const maxAttempts = shouldRetry ? MAX_AUTO_RETRIES : 0;

  let lastError: unknown;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    // Abort controller per attempt to prevent infinite hung connections
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      ...customConfig,
    };

    try {
      const response = await fetch(url, config);
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        lastStatus = response.status;
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }

        // If backend is spinning up (502/503/504) and we have retries left, wait and retry
        if (isTransientError(response.status) && attempt < maxAttempts) {
          const delay = RETRY_BACKOFF_MS[attempt] || 3000;
          if (ENV.IS_DEV) {
            console.warn(`[OceanLens API] Cold-start/Transient HTTP ${response.status} from ${url}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})...`);
          }
          await sleep(delay);
          continue;
        }

        let userFriendlyMessage: string;
        if (response.status === 401 || response.status === 403) {
          userFriendlyMessage = 'Session expired. Please sign in again.';
        } else if (response.status >= 500) {
          userFriendlyMessage = 'OceanLens API is waking up or returned a temporary server error.';
        } else if (typeof errorBody === 'object' && errorBody !== null && 'detail' in errorBody) {
          const detail = (errorBody as { detail: unknown }).detail;
          if (typeof detail === 'string') {
            userFriendlyMessage = detail;
          } else if (typeof detail === 'object' && detail !== null) {
            const detailObj = detail as Record<string, any>;
            if (Array.isArray(detailObj.violations) && detailObj.violations.length > 0) {
              userFriendlyMessage = detailObj.violations.join('; ');
            } else if (detailObj.message) {
              userFriendlyMessage = String(detailObj.message);
            } else {
              userFriendlyMessage = JSON.stringify(detail);
            }
          } else {
            userFriendlyMessage = String(detail);
          }
        } else if (typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody) {
          const err = (errorBody as { error: unknown }).error;
          userFriendlyMessage = typeof err === 'object' ? JSON.stringify(err) : String(err);
        } else {
          userFriendlyMessage = response.statusText || `Request failed with status ${response.status}`;
        }

        if (ENV.IS_DEV) {
          console.warn(`[OceanLens API ${response.status}] ${url}:`, errorBody);
        }

        throw new ApiError(userFriendlyMessage, response.status, errorBody);
      }

      // Return parsed json
      return (await response.json()) as T;
    } catch (error) {
      window.clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      lastError = error;
      if (isTransientError(lastStatus, error) && attempt < maxAttempts) {
        const delay = RETRY_BACKOFF_MS[attempt] || 3000;
        if (ENV.IS_DEV) {
          console.warn(`[OceanLens API] Transient connection glitch to ${url}. Reconnecting in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})...`);
        }
        await sleep(delay);
        continue;
      }

      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error &&
          (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('Failed to fetch') ||
            error.name === 'AbortError'));
      const message = isNetworkError
        ? 'OceanLens API service is waking up or temporarily unreachable. Auto-reconnecting...'
        : error instanceof Error
          ? error.message
          : 'Unknown network error';

      if (ENV.IS_DEV) {
        console.warn(`[OceanLens API Network Error] ${url}:`, error);
      }
      throw new ApiError(message, lastStatus, error);
    }
  }

  throw new ApiError(
    'Unable to reach OceanLens API after multiple connection attempts. Service may be starting.',
    lastStatus,
    lastError
  );
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
