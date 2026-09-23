import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { riskService } from '../services/api/risk.service';
import type { RiskAssessmentRequest, RiskAssessmentResponse } from '../types/risk';

export type RiskAssessmentHookStatus = 'idle' | 'assessing' | 'success' | 'error' | 'invalid_input';

export function useRiskAssessment() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RiskAssessmentHookStatus>('idle');
  const [assessment, setAssessment] = useState<RiskAssessmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback(
    async (payload: RiskAssessmentRequest): Promise<RiskAssessmentResponse | null> => {
      if (!payload.vessel_id) {
        setStatus('invalid_input');
        setError('A valid fleet vessel is required to assess voyage risk.');
        return null;
      }

      if (!payload.route_id && (!payload.origin_port_id || !payload.destination_port_id) && !payload.cargo_id) {
        setStatus('invalid_input');
        setError('Route corridor or cargo itinerary information is required for risk assessment.');
        return null;
      }

      setStatus('assessing');
      setError(null);

      try {
        const result = await riskService.assessRisk(payload);
        setStatus('success');
        setAssessment(result);
        setError(null);

        // Invalidate queries if relevant
        queryClient.invalidateQueries({ queryKey: ['risk_assessments'] });

        return result;
      } catch (err: unknown) {
        setAssessment(null);
        setStatus('error');

        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Unable to execute maritime risk assessment. Please verify vessel and route parameters.';

        setError(errMsg);
        return null;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setAssessment(null);
    setError(null);
  }, []);

  return {
    status,
    assessment,
    error,
    assess,
    reset,
    isAssessing: status === 'assessing',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
