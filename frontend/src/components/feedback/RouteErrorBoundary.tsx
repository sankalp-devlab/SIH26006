/**
 * SIH 26006 Maritime Intelligence Platform
 * Route-Level Safety Error Boundary
 */

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred while rendering this view.';
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '1.25rem',
        }}
      >
        <AlertOctagon size={32} />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
        {errorStatus ? `Error ${errorStatus}` : 'Application Workspace Notice'}
      </h2>

      <p
        style={{
          maxWidth: '520px',
          fontSize: '0.875rem',
          color: '#94a3b8',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}
      >
        {errorMessage}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outline"
          icon={<RefreshCw size={14} />}
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
        <Link to="/dashboard">
          <Button variant="primary" icon={<Home size={14} />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>

      {import.meta.env.DEV && error instanceof Error && error.stack && (
        <details
          style={{
            marginTop: '2rem',
            maxWidth: '680px',
            textAlign: 'left',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #334155',
            fontSize: '11px',
            color: '#cbd5e1',
            fontFamily: 'monospace',
            overflowX: 'auto',
          }}
        >
          <summary style={{ cursor: 'pointer', color: '#38bdf8', marginBottom: '8px' }}>
            Technical Diagnostics (Developer Mode)
          </summary>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}
