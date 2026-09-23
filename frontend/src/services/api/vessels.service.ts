import { apiClient } from './client';
import type { VesselsResponse } from '../../types/api';
import type { Vessel } from '../../types/vessel';

/**
 * Normalizes any raw vessels payload into a safe Vessel[] array.
 * Handles { vessels: [...] }, { data: [...] }, { items: [...] }, { results: [...] }, and raw [...]
 */
export function normalizeVessels(raw: unknown): Vessel[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Vessel[];
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.vessels)) return obj.vessels as Vessel[];
    if (Array.isArray(obj.data)) return obj.data as Vessel[];
    if (Array.isArray(obj.items)) return obj.items as Vessel[];
    if (Array.isArray(obj.results)) return obj.results as Vessel[];
  }
  return [];
}

/**
 * Normalizes any raw API response into a valid VesselsResponse object.
 */
export function normalizeVesselsResponse(raw: unknown): VesselsResponse {
  const vessels = normalizeVessels(raw);
  let count = vessels.length;
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
    vessels,
  };
}

export const vesselsService = {
  getVessels: async (limit: number = 50): Promise<VesselsResponse> => {
    const raw = await apiClient.get<unknown>('/vessels', {
      params: { limit },
    });
    return normalizeVesselsResponse(raw);
  },

  searchVessels: async (name: string): Promise<VesselsResponse> => {
    const raw = await apiClient.get<unknown>('/vessels/search', {
      params: { name },
    });
    return normalizeVesselsResponse(raw);
  },

  getVesselById: async (vesselId: number): Promise<Vessel> => {
    return apiClient.get<Vessel>(`/vessels/${vesselId}`);
  },
};

