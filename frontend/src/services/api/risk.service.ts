import { apiClient } from './client';
import type { RiskAssessmentRequest, RiskAssessmentResponse } from '../../types/risk';

export const riskService = {
  assessRisk: async (
    payload: RiskAssessmentRequest
  ): Promise<RiskAssessmentResponse> => {
    return apiClient.post<RiskAssessmentResponse>('/risk/assess', payload, {
      timeoutMs: 35000,
      retry: true,
    });
  },
};
