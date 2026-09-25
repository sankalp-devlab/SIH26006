import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApiStatus } from './ApiStatusContext';

interface ApiStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export const ApiStatusBadge: React.FC<ApiStatusBadgeProps> = ({
  compact = false,
  className = '',
}) => {
  const { status, isOnline, isChecking, failureCount, checkNow } = useApiStatus();

  if (isChecking || status === 'checking') {
    const isWaking = failureCount > 0;
    return (
      <div
        className={`api-status-badge api-status--checking ${className}`}
        title={
          isWaking
            ? 'OceanLens API is spinning up from sleep mode (Render free tier). Reconnecting automatically...'
            : 'Checking OceanLens API connectivity...'
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '4px 6px' : '3px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: isWaking ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)',
          border: isWaking
            ? '1px solid rgba(245, 158, 11, 0.35)'
            : '1px solid rgba(100, 116, 139, 0.25)',
          color: isWaking ? '#f59e0b' : '#94a3b8',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onClick={() => checkNow()}
      >
        <RefreshCw size={12} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
        {!compact && <span>{isWaking ? 'Waking Server...' : 'Connecting...'}</span>}
      </div>
    );
  }

  if (isOnline) {
    return (
      <div
        className={`api-status-badge api-status--online ${className}`}
        title="FastAPI backend is online & operational (Click to re-check)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '4px 6px' : '3px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onClick={() => checkNow()}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)',
          }}
        />
        <Wifi size={12} />
        {!compact && <span>API Online</span>}
      </div>
    );
  }

  return (
    <div
      className={`api-status-badge api-status--offline ${className}`}
      title="FastAPI backend server is waking up or unreachable. Click to retry connection."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: compact ? '4px 6px' : '3px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onClick={() => checkNow()}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)',
        }}
      />
      <WifiOff size={12} />
      {!compact && <span>Server Offline (Retry)</span>}
    </div>
  );
};
