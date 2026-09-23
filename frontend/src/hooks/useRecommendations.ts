import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { recommendationService } from '../services/api/recommendation.service';
import type {
  RecommendationRequest,
  RecommendationResponse,
  OptimizationPreference,
  PreferenceProfile,
} from '../types/recommendation';

export type RecommendationHookStatus = 'idle' | 'loading' | 'success' | 'error' | 'invalid_input';

export function useRecommendations() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RecommendationHookStatus>('idle');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [preferences, setPreferences] = useState<PreferenceProfile[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<OptimizationPreference>('balanced');
  const [bunkerPrice, setBunkerPrice] = useState<number>(650.0);
  const [dailyHire, setDailyHire] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Load available preference profiles on mount
  useEffect(() => {
    let isMounted = true;
    recommendationService
      .getPreferences()
      .then((data) => {
        if (isMounted && data?.available_preferences) {
          setPreferences(data.available_preferences);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch recommendation preferences from backend:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const generate = useCallback(
    async (payload: RecommendationRequest): Promise<RecommendationResponse | null> => {
      if (!payload.cargo_id && (!payload.weight_tons || payload.weight_tons <= 0)) {
        setStatus('invalid_input');
        setError('Valid cargo weight or cargo identifier is required to generate recommendations.');
        return null;
      }

      setStatus('loading');
      setError(null);

      try {
        const finalPayload: RecommendationRequest = {
          ...payload,
          preference: payload.preference || selectedPreference,
          bunker_price_usd_per_mt: payload.bunker_price_usd_per_mt ?? bunkerPrice,
          daily_hire_usd: payload.daily_hire_usd ?? dailyHire,
        };

        const result = await recommendationService.generateRecommendations(finalPayload);
        setStatus('success');
        setRecommendations(result);
        setError(null);

        queryClient.invalidateQueries({ queryKey: ['recommendations'] });
        return result;
      } catch (err: unknown) {
        setRecommendations(null);
        setStatus('error');

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Failed to generate vessel and route recommendations.';

        setError(errMsg);
        return null;
      }
    },
    [selectedPreference, bunkerPrice, dailyHire, queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setRecommendations(null);
    setError(null);
  }, []);

  return {
    status,
    recommendations,
    preferences,
    selectedPreference,
    setSelectedPreference,
    bunkerPrice,
    setBunkerPrice,
    dailyHire,
    setDailyHire,
    error,
    generate,
    reset,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
