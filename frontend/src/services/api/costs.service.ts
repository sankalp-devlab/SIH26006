import { apiClient } from './client';
import type { CostCalculationRequest, CostCalculationResponse } from '../../types/cost';

export const costsService = {
  calculateCost: async (
    payload: CostCalculationRequest
  ): Promise<CostCalculationResponse> => {
    return apiClient.post<CostCalculationResponse>('/costs/calculate', payload, {
      timeoutMs: 35000,
      retry: true,
    });
  },
};
