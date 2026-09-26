import { apiClient } from './client';
import type {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationPreferencesResponse,
} from '../../types/recommendation';

export const recommendationService = {
  getPreferences: async (): Promise<RecommendationPreferencesResponse> => {
    return apiClient.get<RecommendationPreferencesResponse>('/recommendations/preferences');
  },

  generateRecommendations: async (
    payload: RecommendationRequest
  ): Promise<RecommendationResponse> => {
    return apiClient.post<RecommendationResponse>('/recommendations/generate', payload, {
      timeoutMs: 45000,
      retry: true,
    });
  },
};
