import { apiClient } from './client';
import type { MLEtaPredictionRequest, MLEtaPredictionResponse } from '../../types/ml-eta';

export const mlEtaService = {
  predictETA: async (
    payload: MLEtaPredictionRequest
  ): Promise<MLEtaPredictionResponse> => {
    return apiClient.post<MLEtaPredictionResponse>('/ml/eta/predict', payload);
  },
};
