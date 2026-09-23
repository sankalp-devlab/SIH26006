import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { routesService } from '../services/api/routes.service';
import type {
  RouteCalculationRequest,
  RouteCalculationResponse,
  RouteCalculationStatus,
} from '../types/route';

export function useRouteCalculation() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RouteCalculationStatus>('idle');
  const [route, setRoute] = useState<RouteCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (payload: RouteCalculationRequest): Promise<RouteCalculationResponse | null> => {
      // 1. Client-side sanity checks
      if (!payload.origin_port_id || !payload.destination_port_id) {
        setStatus('invalid_input');
        setError('Please select both origin and destination ports.');
        return null;
      }

      if (payload.origin_port_id === payload.destination_port_id) {
        setStatus('invalid_input');
        setError('Origin port and destination port cannot be the same.');
        return null;
      }

      setStatus('calculating');
      setError(null);

      try {
        const result = await routesService.calculateRoute(payload);

        if (result.status === 'no_route') {
          setStatus('no_route');
          setRoute(null);
          setError('No feasible maritime route found between the selected ports.');
          return null;
        }

        setStatus('success');
        setRoute(result);
        setError(null);

        // Invalidate routes query so the routes table gets updated with the persisted record
        queryClient.invalidateQueries({ queryKey: ['routes'] });

        return result;
      } catch (err: unknown) {
        setRoute(null);

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Unable to calculate route. Please try again.';

        if (errMsg.toLowerCase().includes('coordinates are unavailable')) {
          setStatus('missing_data');
          setError('Route calculation requires valid geographic coordinates.');
        } else if (
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('same')
        ) {
          setStatus('invalid_input');
          setError(errMsg);
        } else {
          setStatus('api_error');
          setError(errMsg);
        }

        return null;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setRoute(null);
    setError(null);
  }, []);

  return {
    status,
    isCalculating: status === 'calculating',
    isSuccess: status === 'success',
    isError: status === 'api_error' || status === 'invalid_input' || status === 'missing_data' || status === 'no_route',
    route,
    error,
    calculate,
    reset,
  };
}
