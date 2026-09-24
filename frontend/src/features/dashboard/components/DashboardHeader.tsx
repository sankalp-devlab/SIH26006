import { Search, SlidersHorizontal, RefreshCw, AlertCircle, Radio } from 'lucide-react';
import { useApiStatus } from '../../api-status/ApiStatusContext';

interface DashboardHeaderProps {
  onOpenSearch: () => void;
  onOpenCustomize: () => void;
  lastUpdatedText?: string;
  isRefreshing?: boolean;
  backendStatus?: 'online' | 'offline' | 'degraded';
  aisProviderStatus?: 'configured' | 'unconfigured' | 'error';
  telemetryFreshness?: 'live' | 'stale' | 'unavailable';
  liveCount?: number;
  staleCount?: number;
  hasError?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function DashboardHeader({
  onOpenSearch,
  onOpenCustomize,
  lastUpdatedText = 'Just now',
  isRefreshing = false,
  backendStatus = 'online',
  aisProviderStatus = 'unconfigured',
  telemetryFreshness = 'stale',
  liveCount = 0,
  staleCount = 0,
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
  const isDegraded = !isActuallyOffline && (backendStatus === 'degraded' || aisProviderStatus === 'unconfigured' || hasError);
  const isSystemOperational = !isActuallyOffline && backendStatus === 'online' && aisProviderStatus === 'configured' && !hasError;

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
        {/* 1. Distinct Backend API Health Status Pill */}
        {isActuallyOffline ? (
          <div
            className="cc-status-pill cc-status-pill--offline"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
              cursor: 'pointer',
            }}
            onClick={handleRefreshClick}
            title="FastAPI service is unreachable. Click to attempt reconnection."
            role="button"
            tabIndex={0}
          >
            <AlertCircle size={12} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 700, letterSpacing: '0.04em' }}>
              API OFFLINE
            </span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>Unreachable</span>
          </div>
        ) : isChecking ? (
          <div
            className="cc-status-pill cc-status-pill--checking"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
            title="Checking OceanLens API connectivity..."
          >
            <RefreshCw
              size={11}
              color="#f59e0b"
              style={{ animation: 'spin 1.2s linear infinite' }}
            />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>VERIFYING LINK...</span>
          </div>
        ) : backendStatus === 'degraded' ? (
          <div
            className="cc-status-pill cc-status-pill--degraded"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.08)',
              cursor: 'pointer',
            }}
            onClick={handleRefreshClick}
            title="Partial backend telemetry received. Click to re-sync."
            role="button"
            tabIndex={0}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>API DEGRADED</span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>Partial Feed</span>
          </div>
        ) : (
          <div
            className="cc-status-pill cc-status-pill--online"
            style={{ cursor: 'pointer' }}
            onClick={handleRefreshClick}
            title="FastAPI microservice connection active and healthy. Click to verify health."
            role="button"
            tabIndex={0}
          >
            <span className="cc-pulse-dot" />
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>API ONLINE</span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>FastAPI</span>
          </div>
        )}

        {/* 2. Distinct External AIS Telemetry & Freshness Status Pill */}
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
          ) : aisProviderStatus === 'unconfigured' ? (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(245, 158, 11, 0.35)',
                background: 'rgba(245, 158, 11, 0.07)',
                cursor: 'default',
              }}
              title="External AIS stream is unconfigured. Operating on authentic Supabase reference records and logged positions."
            >
              <Radio size={11} color="#f59e0b" />
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>AIS UNCONFIGURED</span>
              <span style={{ color: '#64748b' }}>&middot;</span>
              <span style={{ color: '#94a3b8' }}>
                {staleCount > 0 ? `${staleCount} Stale` : 'Reference Fleet'}
              </span>
            </div>
          ) : aisProviderStatus === 'configured' && telemetryFreshness === 'live' ? (
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
          ) : aisProviderStatus === 'configured' && telemetryFreshness === 'stale' ? (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(245, 158, 11, 0.35)',
                background: 'rgba(245, 158, 11, 0.07)',
                cursor: 'default',
              }}
              title="AIS provider configured but telemetry observations are older than 2 hours."
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>STALE AIS</span>
              <span style={{ color: '#64748b' }}>&middot;</span>
              <span style={{ color: '#94a3b8' }}>{staleCount} Stale</span>
            </div>
          ) : (
            <div
              className="cc-status-pill"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.07)',
              }}
              title="AIS provider reported an error."
            >
              <AlertCircle size={11} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: 700 }}>AIS ERROR</span>
            </div>
          )
        )}

        {/* 3. System Operational Status Pill */}
        <div
          className="cc-status-pill"
          style={{
            borderColor: isActuallyOffline
              ? 'rgba(239, 68, 68, 0.3)'
              : isDegraded
              ? 'rgba(245, 158, 11, 0.3)'
              : 'rgba(52, 211, 153, 0.25)',
            background: isActuallyOffline
              ? 'rgba(239, 68, 68, 0.05)'
              : isDegraded
              ? 'rgba(245, 158, 11, 0.05)'
              : 'rgba(52, 211, 153, 0.04)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isActuallyOffline
                ? '#ef4444'
                : isDegraded
                ? '#f59e0b'
                : '#34d399',
              boxShadow: isSystemOperational
                ? '0 0 6px rgba(52, 211, 153, 0.6)'
                : isActuallyOffline
                ? '0 0 6px rgba(239, 68, 68, 0.6)'
                : 'none',
            }}
          />
          <span style={{ color: '#94a3b8', fontSize: '0.625rem' }}>SYSTEM:</span>
          <span
            style={{
              color: isActuallyOffline ? '#ef4444' : isDegraded ? '#f59e0b' : '#34d399',
              fontWeight: 700,
            }}
          >
            {isActuallyOffline
              ? 'DISCONNECTED'
              : isChecking
              ? 'VERIFYING'
              : isDegraded
              ? 'DEGRADED'
              : 'OPERATIONAL'}
          </span>
        </div>

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

