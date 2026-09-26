import { apiClient } from './client';
import type { ETACalculationRequest, ETACalculationResponse } from '../../types/eta';

export const etaService = {
  calculateETA: async (
    payload: ETACalculationRequest
  ): Promise<ETACalculationResponse> => {
    return apiClient.post<ETACalculationResponse>('/eta/calculate', payload, {
      timeoutMs: 35000,
      retry: true,
    });
  },
};
