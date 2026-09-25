import { Search, SlidersHorizontal, RefreshCw, AlertCircle, Radio } from 'lucide-react';
import { useApiStatus } from '../../api-status/ApiStatusContext';

interface DashboardHeaderProps {
  onOpenSearch: () => void;
  onOpenCustomize: () => void;
  lastUpdatedText?: string;
  isRefreshing?: boolean;
  backendStatus?: 'online' | 'offline' | 'degraded';
  supabaseStatus?: 'connected' | 'offline' | 'checking';
  aisProviderStatus?: 'configured' | 'unconfigured' | 'error';
  telemetryFreshness?: 'live' | 'recent' | 'stale' | 'unavailable';
  liveCount?: number;
  recentCount?: number;
  staleCount?: number;
  unavailableCount?: number;
  hasError?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function DashboardHeader({
  onOpenSearch,
  onOpenCustomize,
  lastUpdatedText = 'Just now',
  isRefreshing = false,
  backendStatus = 'online',
  supabaseStatus = 'connected',
  aisProviderStatus = 'unconfigured',
  telemetryFreshness = 'stale',
  liveCount = 0,
  recentCount = 0,
  staleCount = 0,
  unavailableCount = 0,
  hasError = false,
  onRefresh,
}: DashboardHeaderProps) {
  const { isOnline, isOffline, isChecking, checkNow } = useApiStatus();

  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      checkNow();
    }
  };

  const isActuallyOffline = isOffline || backendStatus === 'offline';
  const isDatabaseDown = supabaseStatus === 'offline';
  const isDegraded = !isActuallyOffline && !isDatabaseDown && (backendStatus === 'degraded' || hasError);
  const isSystemOperational = !isActuallyOffline && !isDatabaseDown && !isDegraded;

  return (
    <header className="cc-header">
      <div className="cc-header-left">
        <div className="cc-header-meta">
          <span>REAL-TIME FLEET INTELLIGENCE</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>COMMAND CONSOLE</span>
        </div>
        <h1 className="cc-header-title">
          MARITIME OVERVIEW
        </h1>
        <p className="cc-header-subtitle">
          Real-time visibility across vessels, trade, ports and freight markets.
        </p>
      </div>

      <div className="cc-header-right">
        {/* 1. Consolidated System Health Status Pill (FastAPI + Supabase DB) */}
        {isActuallyOffline || isDatabaseDown ? (
          <div
            className="cc-status-pill cc-status-pill--offline"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
              cursor: 'pointer',
            }}
            onClick={handleRefreshClick}
            title={isActuallyOffline ? "FastAPI service is unreachable. Click to attempt reconnection." : "Database connection failed. Click to re-sync."}
            role="button"
            tabIndex={0}
          >
            <AlertCircle size={12} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 700, letterSpacing: '0.04em' }}>
              {isActuallyOffline ? 'API OFFLINE' : 'DB OFFLINE'}
            </span>
          </div>
        ) : isChecking ? (
          <div
            className="cc-status-pill cc-status-pill--checking"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
            title="Checking OceanLens service connectivity..."
          >
            <RefreshCw
              size={11}
              color="#f59e0b"
              style={{ animation: 'spin 1.2s linear infinite' }}
            />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>VERIFYING...</span>
          </div>
        ) : isDegraded ? (
          <div
            className="cc-status-pill cc-status-pill--degraded"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.08)',
              cursor: 'pointer',
            }}
            onClick={handleRefreshClick}
            title="Partial service degradation detected. Click to re-sync."
            role="button"
            tabIndex={0}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>DEGRADED</span>
          </div>
        ) : (
          <div
            className="cc-status-pill cc-status-pill--online"
            style={{ cursor: 'pointer' }}
            onClick={handleRefreshClick}
            title="All systems operational: FastAPI microservice and Supabase PostgreSQL online. Click to verify."
            role="button"
            tabIndex={0}
          >
            <span className="cc-pulse-dot" />
            <span style={{ color: '#34d399', fontWeight: 700 }}>SERVICES ONLINE</span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>API + DB</span>
          </div>
        )}

        {/* 2. AIS Telemetry Freshness Status Pill */}
        {!isActuallyOffline && (
          isRefreshing ? (
            <div
              className="cc-status-pill cc-status-pill--syncing"
              style={{
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.08)',
              }}
            >
              <RefreshCw
                size={11}
                color="#38bdf8"
                style={{ animation: 'spin 1.2s linear infinite' }}
              />
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>SYNCING AIS...</span>
            </div>
          ) : liveCount > 0 ? (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(52, 211, 153, 0.35)',
                background: 'rgba(52, 211, 153, 0.07)',
                cursor: 'default',
              }}
              title="Verified live AIS telemetry stream active."
            >
              <span className="cc-pulse-dot" />
              <span style={{ color: '#34d399', fontWeight: 700 }}>LIVE AIS</span>
              <span style={{ color: '#64748b' }}>&middot;</span>
              <span style={{ color: '#94a3b8' }}>{liveCount} Live</span>
            </div>
          ) : recentCount > 0 ? (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(56, 189, 248, 0.35)',
                background: 'rgba(56, 189, 248, 0.07)',
                cursor: 'default',
              }}
              title="AIS telemetry observations are recent."
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>RECENT AIS</span>
              <span style={{ color: '#64748b' }}>&middot;</span>
              <span style={{ color: '#94a3b8' }}>{recentCount} Recent</span>
            </div>
          ) : (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(56, 189, 248, 0.35)',
                background: 'rgba(56, 189, 248, 0.07)',
                cursor: 'default',
              }}
              title="AIS fleet telemetry store active."
            >
              <Radio size={11} color="#38bdf8" />
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>AIS TELEMETRY</span>
              <span style={{ color: '#64748b' }}>&middot;</span>
              <span style={{ color: '#94a3b8' }}>{staleCount > 0 ? `${staleCount} Logged` : 'Active'}</span>
            </div>
          )
        )}

        <button
          type="button"
          className="cc-btn-action"
          onClick={onOpenSearch}
          title="Global Search (Ctrl+K)"
        >
          <Search size={13} color="#38bdf8" />
          <span>Search</span>
          <kbd style={{
            fontSize: '0.625rem',
            padding: '1px 4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            fontFamily: 'monospace',
          }}>
            Ctrl+K
          </kbd>
        </button>

        <button
          type="button"
          className="cc-btn-action"
          onClick={onOpenCustomize}
          title="Customize Visible Dashboard Modules"
        >
          <SlidersHorizontal size={13} color="#38bdf8" />
          <span>Customize</span>
        </button>
      </div>
    </header>
  );
}

