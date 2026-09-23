import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { API_CONFIG } from '../../config/api';

export type ApiConnectionStatus = 'online' | 'offline' | 'checking';

export interface ApiStatusContextValue {
  status: ApiConnectionStatus;
  isOnline: boolean;
  isOffline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  failureCount: number;
  checkNow: () => Promise<boolean>;
}

const ApiStatusContext = createContext<ApiStatusContextValue | undefined>(undefined);

const RETRY_DELAYS = API_CONFIG.RETRY_DELAYS_MS; // [2000, 5000, 10000, 15000]
const PERIODIC_INTERVAL_MS = 15000;

export function ApiStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ApiConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState<number>(0);

  const failureCountRef = useRef(0);
  const isCheckingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) return status === 'online';
    isCheckingRef.current = true;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    const healthUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}`;

    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const isHealthy =
          data &&
          (data.status === 'ok' ||
            data.status === 'healthy' ||
            data.status === 'success');

        if (isHealthy) {
          failureCountRef.current = 0;
          setFailureCount(0);
          setStatus('online');
          setLastChecked(new Date());
          isCheckingRef.current = false;
          return true;
        }
      }
      throw new Error(`Health check returned status ${res.status}`);
    } catch {
      window.clearTimeout(timeoutId);
      failureCountRef.current += 1;
      setFailureCount(failureCountRef.current);
      setStatus('offline');
      setLastChecked(new Date());
      isCheckingRef.current = false;
      return false;
    }
  }, [status]);

  // Schedule next health check based on online/offline state & progressive retry
  const scheduleNextCheck = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let delay = PERIODIC_INTERVAL_MS;
    if (status === 'offline' || failureCountRef.current > 0) {
      const idx = Math.min(failureCountRef.current - 1, RETRY_DELAYS.length - 1);
      delay = RETRY_DELAYS[Math.max(0, idx)];
    }

    timerRef.current = window.setTimeout(async () => {
      await checkHealth();
      scheduleNextCheck();
    }, delay);
  }, [checkHealth, status]);

  // Initial check & auto-resilience listeners
  useEffect(() => {
    let isMounted = true;

    checkHealth().then(() => {
      if (isMounted) scheduleNextCheck();
    });

    const handleFocusOrOnline = () => {
      checkHealth().then(() => {
        if (isMounted) scheduleNextCheck();
      });
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);

    return () => {
      isMounted = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
    };
  }, [checkHealth, scheduleNextCheck]);

  const value: ApiStatusContextValue = {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isChecking: status === 'checking',
    lastChecked,
    failureCount,
    checkNow: checkHealth,
  };

  return <ApiStatusContext.Provider value={value}>{children}</ApiStatusContext.Provider>;
}

export function useApiStatus(): ApiStatusContextValue {
  const context = useContext(ApiStatusContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      status: 'offline',
      isOnline: false,
      isOffline: true,
      isChecking: false,
      lastChecked: null,
      failureCount: 1,
      checkNow: async () => false,
    };
  }
  return context;
}
