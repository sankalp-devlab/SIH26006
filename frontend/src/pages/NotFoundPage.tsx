import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Compass, ArrowLeft, BarChart2, Radio, Ship, Compass as MapIcon, Activity } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '78vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(6, 182, 212, 0.07) 0%, rgba(8, 14, 26, 0.98) 70%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(6, 182, 212, 0.22)',
          borderRadius: '16px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.08)',
          padding: '2.75rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Radar / Beacon Graphic */}
        <div
          style={{
            position: 'relative',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '2px solid rgba(6, 182, 212, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)',
          }}
        >
          <Compass size={42} color="#06b6d4" style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }} />
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid #080e1a',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
            }}
          />
        </div>

        {/* Telemetry Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#22d3ee',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          <Radio size={12} className="animate-pulse" />
          <span>Navigation Unresolved • HTTP 404</span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: '#f8fafc',
            marginBottom: '0.625rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          404 — Navigation Route Not Found
        </h1>

        {/* Required Message */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            maxWidth: '440px',
            marginBottom: '1.25rem',
          }}
        >
          The requested page could not be located. Check the route or return to the Analytics Hub.
        </p>

        {/* Unresolved Route Telemetry Chip */}
        {location.pathname && (
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'rgba(2, 6, 23, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: '#64748b',
            }}
          >
            <span>TARGET WAYPOINT:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{location.pathname}</span>
          </div>
        )}

        {/* Real Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            marginBottom: '2rem',
          }}
        >
          {/* Button 1: Return to Analytics Hub */}
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            style={{
              flex: '1 1 200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '8px',
              backgroundColor: '#06b6d4',
              color: '#080e1a',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#22d3ee')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#06b6d4')}
          >
            <BarChart2 size={16} />
            <span>Return to Analytics Hub</span>
          </button>

          {/* Button 2: Back to Previous Page */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              flex: '1 1 180px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              color: '#e2e8f0',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Previous Page</span>
          </button>
        </div>

        {/* Quick Route Shortcuts */}
        <div
          style={{
            borderTop: '1px solid rgba(148, 163, 184, 0.12)',
            paddingTop: '1.25rem',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>
            OR NAVIGATE DIRECTLY TO ACTIVE PLATFORM HUBS
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Link
              to="/dashboard"
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/vessels"
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              Fleet Vessels
            </Link>
            <Link
              to="/analytics/market-prices"
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            >
              Market Prices (M23)
            </Link>
            <Link
              to="/map"
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              Live Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
