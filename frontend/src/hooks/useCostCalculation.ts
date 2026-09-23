import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { costsService } from '../services/api/costs.service';
import type { CostCalculationRequest, CostCalculationResponse } from '../types/cost';

export type CostCalculationStatus =
  | 'idle'
  | 'calculating'
  | 'success'
  | 'error'
  | 'invalid_input';

export function useCostCalculation() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CostCalculationStatus>('idle');
  const [cost, setCost] = useState<CostCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (payload: CostCalculationRequest): Promise<CostCalculationResponse | null> => {
      if (!payload.vessel_id) {
        setStatus('invalid_input');
        setError('A valid fleet vessel is required to calculate voyage cost.');
        return null;
      }

      if (!payload.route_id && (!payload.origin_port_id || !payload.destination_port_id) && !payload.cargo_id) {
        setStatus('invalid_input');
        setError('Route corridor or cargo origin/destination information is required.');
        return null;
      }

      setStatus('calculating');
      setError(null);

      try {
        const result = await costsService.calculateCost(payload);
        setStatus('success');
        setCost(result);
        setError(null);

        // Optionally invalidate bookings / voyages queries if active
        queryClient.invalidateQueries({ queryKey: ['bookings'] });

        return result;
      } catch (err: unknown) {
        setCost(null);
        setStatus('error');

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Unable to calculate voyage cost. Please check vessel and route parameters.';

        setError(errMsg);
        return null;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setCost(null);
    setError(null);
  }, []);

  return {
    status,
    isCalculating: status === 'calculating',
    isSuccess: status === 'success',
    isError: status === 'error' || status === 'invalid_input',
    cost,
    error,
    calculate,
    reset,
  };
}
