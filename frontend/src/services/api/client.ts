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
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

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

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      let userFriendlyMessage: string;
      if (response.status === 401 || response.status === 403) {
        userFriendlyMessage = 'Session expired. Please sign in again.';
      } else if (response.status >= 500) {
        userFriendlyMessage = 'OceanLens API returned an internal error.';
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
    if (error instanceof ApiError) {
      throw error;
    }
    const isNetworkError =
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Failed to fetch')));
    const message = isNetworkError
      ? 'Unable to reach OceanLens API. Retrying...'
      : error instanceof Error
        ? error.message
        : 'Unknown network error';

    if (ENV.IS_DEV) {
      console.warn(`[OceanLens API Network Error] ${url}:`, error);
    }
    throw new ApiError(message, 0, error);
  }
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
