import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { etaService } from '../services/api/eta.service';
import type { ETACalculationRequest, ETACalculationResponse } from '../types/eta';

export type ETACalculationStatus =
  | 'idle'
  | 'calculating'
  | 'success'
  | 'error'
  | 'invalid_input';

export function useEtaCalculation() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ETACalculationStatus>('idle');
  const [eta, setEta] = useState<ETACalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (payload: ETACalculationRequest): Promise<ETACalculationResponse | null> => {
      if (!payload.vessel_id) {
        setStatus('invalid_input');
        setError('A valid fleet vessel is required to calculate voyage ETA.');
        return null;
      }

      if (!payload.route_id && (!payload.origin_port_id || !payload.destination_port_id) && !payload.cargo_id) {
        setStatus('invalid_input');
        setError('Route corridor or cargo itinerary information is required.');
        return null;
      }

      setStatus('calculating');
      setError(null);

      try {
        const result = await etaService.calculateETA(payload);
        setStatus('success');
        setEta(result);
        setError(null);

        // Invalidate bookings queries if active
        queryClient.invalidateQueries({ queryKey: ['bookings'] });

        return result;
      } catch (err: unknown) {
        setEta(null);
        setStatus('error');

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Unable to calculate voyage ETA. Please verify vessel operational speed and route distance.';

        setError(errMsg);
        return null;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setEta(null);
    setError(null);
  }, []);

  return {
    calculate,
    eta,
    status,
    isCalculating: status === 'calculating',
    error,
    reset,
  };
}
