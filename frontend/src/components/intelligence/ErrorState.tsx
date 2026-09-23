import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Temporarily Unavailable',
  message = 'Failed to retrieve real-time maritime telemetry. You may retry or inspect your connection.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      style={{
        padding: '24px 20px',
        backgroundColor: 'var(--ol-red-subtle)',
        border: '1px solid rgba(255, 77, 85, 0.28)',
        borderRadius: 'var(--ol-radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 77, 85, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ol-red)',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 650, color: '#FFA4A8' }}>
            {title}
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-secondary)' }}>
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="ol-btn ol-btn-danger ol-btn-sm"
        >
          <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
};
