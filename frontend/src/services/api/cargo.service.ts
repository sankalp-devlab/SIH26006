import { apiClient } from './client';
import type { CargoResponse } from '../../types/api';
import type { Cargo, CreateCargoPayload } from '../../types/cargo';

/**
 * Normalizes any raw cargo payload into a safe Cargo[] array.
 * Handles { cargo: [...] }, { data: [...] }, { items: [...] }, { results: [...] }, and raw [...]
 */
export function normalizeCargo(raw: unknown): Cargo[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Cargo[];
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.cargo)) return obj.cargo as Cargo[];
    if (Array.isArray(obj.data)) return obj.data as Cargo[];
    if (Array.isArray(obj.items)) return obj.items as Cargo[];
    if (Array.isArray(obj.results)) return obj.results as Cargo[];
  }
  return [];
}

/**
 * Normalizes any raw API response into a valid CargoResponse object.
 */
export function normalizeCargoResponse(raw: unknown): CargoResponse {
  const cargo = normalizeCargo(raw);
  let count = cargo.length;
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
    cargo,
  };
}

export const cargoService = {
  getCargo: async (limit: number = 50): Promise<CargoResponse> => {
    const raw = await apiClient.get<unknown>('/cargo', {
      params: { limit },
    });
    return normalizeCargoResponse(raw);
  },

  getCargoById: async (cargoId: number): Promise<Cargo> => {
    return apiClient.get<Cargo>(`/cargo/${cargoId}`);
  },

  createCargo: async (cargo: CreateCargoPayload): Promise<{ message: string; cargo: Cargo }> => {
    return apiClient.post<{ message: string; cargo: Cargo }>('/cargo', cargo);
  },

  updateCargo: async (
    cargoId: number,
    cargo: Partial<CreateCargoPayload>
  ): Promise<{ message: string; cargo: Cargo }> => {
    return apiClient.put<{ message: string; cargo: Cargo }>(`/cargo/${cargoId}`, cargo);
  },

  deleteCargo: async (cargoId: number): Promise<{ message: string; cargo: Cargo }> => {
    return apiClient.delete<{ message: string; cargo: Cargo }>(`/cargo/${cargoId}`);
  },
};
