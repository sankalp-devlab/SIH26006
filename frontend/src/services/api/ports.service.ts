import { apiClient } from './client';
import type { PortsResponse } from '../../types/api';
import type { Port } from '../../types/port';

/**
 * Normalizes any raw ports payload into a safe Port[] array.
 * Handles { ports: [...] }, { data: [...] }, { items: [...] }, { results: [...] }, and raw [...]
 */
export function normalizePorts(raw: unknown): Port[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Port[];
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.ports)) return obj.ports as Port[];
    if (Array.isArray(obj.data)) return obj.data as Port[];
    if (Array.isArray(obj.items)) return obj.items as Port[];
    if (Array.isArray(obj.results)) return obj.results as Port[];
  }
  return [];
}

/**
 * Normalizes any raw API response into a valid PortsResponse object.
 */
export function normalizePortsResponse(raw: unknown): PortsResponse {
  const ports = normalizePorts(raw);
  let count = ports.length;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.count === 'number') {
      count = obj.count;
    } else if (typeof obj.total === 'number') {
      count = obj.total;
    }
  }
  return {
    count,
    ports,
  };
}

export const portsService = {
  getPorts: async (limit: number = 50): Promise<PortsResponse> => {
    const raw = await apiClient.get<unknown>('/ports', {
      params: { limit },
    });
    return normalizePortsResponse(raw);
  },

  searchPorts: async (name: string): Promise<PortsResponse> => {
    const raw = await apiClient.get<unknown>('/ports/search', {
      params: { name },
    });
    return normalizePortsResponse(raw);
  },

  getPortById: async (portId: number): Promise<Port> => {
    return apiClient.get<Port>(`/ports/${portId}`);
  },
};

