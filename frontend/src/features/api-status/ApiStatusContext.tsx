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

// Progressive fast retries during wake-up (3s, 5s, 8s, 12s)
const RECOVERY_RETRY_DELAYS = [3000, 5000, 8000, 12000];
const STEADY_INTERVAL_MS = 25000;

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
            data.status === 'success' ||
            data.status === 'awake');

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
      // Require at least 2 consecutive probe failures before declaring offline
      // Prevents 1-strike false alarms from temporary cold-start delays
      if (failureCountRef.current >= 2) {
        setStatus('offline');
      } else {
        setStatus('checking');
      }
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

    let delay = STEADY_INTERVAL_MS;
    if (status !== 'online' || failureCountRef.current > 0) {
      const idx = Math.min(failureCountRef.current, RECOVERY_RETRY_DELAYS.length - 1);
      delay = RECOVERY_RETRY_DELAYS[Math.max(0, idx)];
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

  // Active Tab Keep-Alive Heartbeat: keeps Render awake as long as a browser tab is open
  useEffect(() => {
    const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (well below Render's 15m threshold)
    const keepAliveUrl = `${API_CONFIG.BASE_URL}/keep-alive`;

    const sendKeepAlivePing = () => {
      if (document.visibilityState === 'visible') {
        fetch(keepAliveUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }).catch(() => {
          // Heartbeat failures handled silently; regular checkHealth monitors health
        });
      }
    };

    const heartbeatTimer = window.setInterval(sendKeepAlivePing, HEARTBEAT_INTERVAL_MS);

    // Also trigger on tab unminimizing / regaining visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendKeepAlivePing();
        checkHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkHealth]);

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
