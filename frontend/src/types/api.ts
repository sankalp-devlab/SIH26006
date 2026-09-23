import type { Port } from './port';
import type { Vessel } from './vessel';
import type { Cargo } from './cargo';
import type { Route } from './route';

/**
 * Generic API response wrappers matching FastAPI / Supabase responses
 */

export interface ApiResponse<T> {
  count?: number;
  message?: string;
  error?: string;
  data?: T;
}

export interface PortsResponse {
  count: number;
  ports: Port[];
}

export interface VesselsResponse {
  count: number;
  vessels: Vessel[];
}

export interface CargoResponse {
  count: number;
  cargo: Cargo[];
}

export interface RoutesResponse {
  count: number;
  routes: Route[];
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
