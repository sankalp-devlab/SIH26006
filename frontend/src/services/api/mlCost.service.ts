import { apiClient } from './client';
import type { MLCostPredictionRequest, MLCostPredictionResponse } from '../../types/ml-cost';

export const mlCostService = {
  predictCost: async (
    payload: MLCostPredictionRequest
  ): Promise<MLCostPredictionResponse> => {
    return apiClient.post<MLCostPredictionResponse>('/ml/cost/predict', payload, {
      timeoutMs: 35000,
      retry: true,
    });
  },
};
