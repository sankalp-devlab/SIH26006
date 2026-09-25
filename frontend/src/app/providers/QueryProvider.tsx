import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '../../services/api/client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Enhanced resilience for Render cold-starts (up to 3 retries with backoff)
            retry: (failureCount, error) => {
              if (failureCount >= 3) return false;
              if (error instanceof ApiError) {
                // Do not retry 4xx client errors (400, 401, 403, 404), but retry 408/429/5xx/network errors
                if (
                  error.status >= 400 &&
                  error.status < 500 &&
                  error.status !== 408 &&
                  error.status !== 429
                ) {
                  return false;
                }
              }
              return true;
            },
            retryDelay: (attemptIndex) => Math.min(1500 * (2 ** attemptIndex), 10000), // 1.5s, 3s, 6s...
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            staleTime: 1000 * 60 * 3, // 3 minutes cache default
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
