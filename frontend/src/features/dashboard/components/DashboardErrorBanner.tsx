import { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ServerCrash, Radio, Info } from 'lucide-react';

interface DashboardErrorBannerProps {
  title?: string;
  message?: string;
  badge?: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  technicalDetails?: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function DashboardErrorBanner({
  title = 'Unable to load maritime telemetry feed',
  message = 'OceanLens could not connect to the FastAPI maritime service. Displaying cached intelligence where available.',
  badge,
  variant = 'error',
  onRetry,
  isRetrying = false,
  technicalDetails,
  onDismiss,
  className = '',
}: DashboardErrorBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const defaultBadge =
    variant === 'warning'
      ? 'DEGRADED TELEMETRY'
      : variant === 'info'
      ? 'SYSTEM NOTICE'
      : 'API CONNECTION DEGRADED';

  const displayBadge = badge || defaultBadge;

  return (
    <div
      className={`cc-error-banner cc-error-banner--${variant} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="cc-error-banner-main">
        <div className="cc-error-banner-icon-wrap" aria-hidden="true">
          {variant === 'warning' ? (
            <Radio size={18} className="cc-error-banner-icon" color="#f59e0b" />
          ) : variant === 'info' ? (
            <Info size={18} className="cc-error-banner-icon" color="#38bdf8" />
          ) : (
            <AlertTriangle size={18} className="cc-error-banner-icon" color="#ef4444" />
          )}
        </div>

        <div className="cc-error-banner-content">
          <div className="cc-error-banner-title-row">
            <h3 className="cc-error-banner-title">{title}</h3>
            <span className={`cc-error-banner-badge cc-error-banner-badge--${variant}`}>
              {displayBadge}
            </span>
          </div>
          <p className="cc-error-banner-desc">{message}</p>
        </div>

        <div className="cc-error-banner-actions">
          {onRetry && (
            <button
              type="button"
              className="cc-error-banner-retry-btn"
              onClick={onRetry}
              disabled={isRetrying}
              title="Retry connecting to OceanLens API"
            >
              <RefreshCw
                size={13}
                className={isRetrying ? 'animate-spin' : ''}
                style={{
                  animation: isRetrying ? 'spin 1s linear infinite' : 'none',
                }}
              />
              <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
            </button>
          )}

          {technicalDetails && (
            <button
              type="button"
              className="cc-error-banner-toggle-btn"
              onClick={() => setShowDetails((prev) => !prev)}
              aria-expanded={showDetails}
              title="Toggle technical error diagnostics"
            >
              <span>Diagnostics</span>
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              className="cc-error-banner-dismiss-btn"
              onClick={onDismiss}
              title="Dismiss warning"
              aria-label="Dismiss warning"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {showDetails && technicalDetails && (
        <div className="cc-error-banner-details">
          <div className="cc-error-details-header">
            <ServerCrash size={12} color={variant === 'warning' ? '#f59e0b' : '#f87171'} />
            <span>DIAGNOSTIC TELEMETRY LOG</span>
          </div>
          <pre className="cc-error-details-pre">
            <code>{technicalDetails}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
