import { Search, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { useApiStatus } from '../../api-status/ApiStatusContext';

interface DashboardHeaderProps {
  onOpenSearch: () => void;
  onOpenCustomize: () => void;
  lastUpdatedText?: string;
  isRefreshing?: boolean;
  hasError?: boolean;
}

export function DashboardHeader({
  onOpenSearch,
  onOpenCustomize,
  lastUpdatedText = 'Just now',
  isRefreshing = false,
  hasError = false,
}: DashboardHeaderProps) {
  const { status, isOnline, isOffline, isChecking, checkNow } = useApiStatus();

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
        {/* Dynamic Telemetry Feed Status Pill */}
        {isOffline ? (
          <div
            className="cc-status-pill cc-status-pill--offline"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.08)',
              cursor: 'pointer',
            }}
            onClick={() => checkNow()}
            title="FastAPI service is unreachable. Click to attempt reconnection."
            role="button"
            tabIndex={0}
          >
            <AlertCircle size={12} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 700, letterSpacing: '0.04em' }}>
              API OFFLINE
            </span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>Cached / Stale</span>
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
        ) : isRefreshing ? (
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
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>SYNCING FEED...</span>
          </div>
        ) : hasError ? (
          <div
            className="cc-status-pill cc-status-pill--degraded"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.08)',
              cursor: 'pointer',
            }}
            onClick={() => checkNow()}
            title="Partial telemetry received. Click to re-sync."
            role="button"
            tabIndex={0}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>PARTIAL FEED</span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>Updated {lastUpdatedText}</span>
          </div>
        ) : (
          <div
            className="cc-status-pill cc-status-pill--online"
            style={{ cursor: 'pointer' }}
            onClick={() => checkNow()}
            title="API connection active. Click to verify health."
            role="button"
            tabIndex={0}
          >
            <span className="cc-pulse-dot" />
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>LIVE DATA</span>
            <span style={{ color: '#64748b' }}>&middot;</span>
            <span style={{ color: '#94a3b8' }}>Updated {lastUpdatedText}</span>
          </div>
        )}

        {/* Dynamic System Operational Status Pill */}
        <div
          className="cc-status-pill"
          style={{
            borderColor: isOffline
              ? 'rgba(239, 68, 68, 0.3)'
              : hasError
              ? 'rgba(245, 158, 11, 0.3)'
              : 'rgba(52, 211, 153, 0.25)',
            background: isOffline
              ? 'rgba(239, 68, 68, 0.05)'
              : hasError
              ? 'rgba(245, 158, 11, 0.05)'
              : 'rgba(52, 211, 153, 0.04)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOffline
                ? '#ef4444'
                : hasError
                ? '#f59e0b'
                : '#34d399',
              boxShadow: isOnline && !hasError
                ? '0 0 6px rgba(52, 211, 153, 0.6)'
                : isOffline
                ? '0 0 6px rgba(239, 68, 68, 0.6)'
                : 'none',
            }}
          />
          <span style={{ color: '#94a3b8', fontSize: '0.625rem' }}>SYSTEM:</span>
          <span
            style={{
              color: isOffline ? '#ef4444' : hasError ? '#f59e0b' : '#34d399',
              fontWeight: 700,
            }}
          >
            {isOffline ? 'DISCONNECTED' : isChecking ? 'VERIFYING' : hasError ? 'DEGRADED' : 'OPERATIONAL'}
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

