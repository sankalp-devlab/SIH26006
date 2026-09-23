import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mlCostService } from '../services/api/mlCost.service';
import type { MLCostPredictionRequest, MLCostPredictionResponse } from '../types/ml-cost';

export type MLCostPredictionHookStatus = 'idle' | 'predicting' | 'success' | 'error' | 'invalid_input';

export function useMlCostPrediction() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<MLCostPredictionHookStatus>('idle');
  const [prediction, setPrediction] = useState<MLCostPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(
    async (payload: MLCostPredictionRequest): Promise<MLCostPredictionResponse | null> => {
      if (!payload.vessel_id) {
        setStatus('invalid_input');
        setError('A valid fleet vessel is required to generate ML cost predictions.');
        return null;
      }

      if (!payload.route_id && (!payload.origin_port_id || !payload.destination_port_id) && !payload.cargo_id) {
        setStatus('invalid_input');
        setError('Route corridor or cargo itinerary information is required.');
        return null;
      }

      setStatus('predicting');
      setError(null);

      try {
        const result = await mlCostService.predictCost(payload);
        setStatus('success');
        setPrediction(result);
        setError(null);

        // Invalidate queries if relevant
        queryClient.invalidateQueries({ queryKey: ['cost_predictions'] });

        return result;
      } catch (err: unknown) {
        setPrediction(null);
        setStatus('error');

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Unable to execute XGBoost cost prediction. Please verify vessel and route parameters.';

        setError(errMsg);
        return null;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setPrediction(null);
    setError(null);
  }, []);

  return {
    predict,
    prediction,
    status,
    isPredicting: status === 'predicting',
    error,
    reset,
  };
}
