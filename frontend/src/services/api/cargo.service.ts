import { apiClient } from './client';
import type { CargoResponse } from '../../types/api';
import type { Cargo, CreateCargoPayload } from '../../types/cargo';

export const cargoService = {
  getCargo: async (limit: number = 50): Promise<CargoResponse> => {
    return apiClient.get<CargoResponse>('/cargo', {
      params: { limit },
    });
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
