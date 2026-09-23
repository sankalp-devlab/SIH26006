import {
  Compass,
  Ship,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { RouteCalculationResponse, RouteCalculationStatus } from '../../../types/route';

interface RouteDetailsPanelProps {
  route: RouteCalculationResponse | null;
  status: RouteCalculationStatus;
  error: string | null;
}

export function RouteDetailsPanel({ route, status, error }: RouteDetailsPanelProps) {
  if (status === 'calculating') {
    return (
      <div
        className="card"
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'inline-block', animation: 'spin 2s linear infinite', marginBottom: '12px' }}>
          <Compass size={36} color="var(--color-brand-accent)" />
        </div>
        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>
          Calculating Maritime Route...
        </h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Evaluating global navigational chokepoints, canal draft restrictions, and multi-leg corridors.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 700, color: '#ef4444' }}>
              Route Calculation Error
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div
        className="card"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-muted)',
        }}
      >
        <Compass size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          No Route Calculated
        </h4>
        <p style={{ margin: '0 auto', fontSize: '0.8125rem', maxWidth: '320px' }}>
          Select an origin and destination port above, then click <strong>Calculate Maritime Route</strong> to generate real nautical geometry.
        </p>
      </div>
    );
  }

  const formatRouteType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface-alt)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Calculated Maritime Route Details
          </h3>
        </div>
        <span
          className="badge"
          style={{
            backgroundColor: route.distance_type === 'maritime' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: route.distance_type === 'maritime' ? '#00D9FF' : '#f59e0b',
            border: `1px solid ${route.distance_type === 'maritime' ? 'rgba(0, 217, 255, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '10px',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {route.distance_type === 'maritime' ? '⚓ Maritime Corridor' : '🌐 Geodesic Distance'}
        </span>
      </div>

      {/* Corridor Summary Card */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-surface-alt)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Nautical Distance
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-accent)', marginTop: '2px' }}>
              {route.distance_nm.toLocaleString()} NM
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              ({route.distance_km.toLocaleString()} km)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Corridor Type
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
              {formatRouteType(route.route_type)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {route.legs.length} Maritime Leg{route.legs.length === 1 ? '' : 's'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Chokepoints
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
              {route.waypoints.length} Traversals
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Canal & Strait Nodes
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Calculation Status
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
              Feasible & Verified
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Route ID: {route.route_id}
            </div>
          </div>
        </div>

        {/* Vessel Allocation if present */}
        {route.vessel && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ship size={16} color="var(--color-brand-accent)" />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Allocated Vessel: </span>
                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{route.vessel.name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                  ({route.vessel.vessel_type || 'Commercial Carrier'})
                </span>
              </div>
            </div>
            {route.vessel.draft_m && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Draft: <strong>{route.vessel.draft_m}m</strong>
              </span>
            )}
          </div>
        )}

        {/* Restrictions & Canal Reroute Alerts */}
        {route.restrictions && route.restrictions.length > 0 && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
              <AlertTriangle size={14} />
              <span>Navigational Constraints & Rerouting Notice</span>
            </div>
            {route.restrictions.map((r, i) => (
              <div key={i} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', paddingLeft: '20px' }}>
                &bull; {r}
              </div>
            ))}
          </div>
        )}

        {/* Ports Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
            Maritime Corridor Endpoints
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
            {/* Origin */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Origin Port</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{route.origin_port.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {route.origin_port.country || 'International'} &middot; {route.origin_port.latitude.toFixed(2)}°, {route.origin_port.longitude.toFixed(2)}°
              </div>
            </div>

            <ArrowRight size={18} color="var(--color-text-muted)" />

            {/* Destination */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                backgroundColor: 'rgba(0, 217, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D9FF' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#00D9FF', textTransform: 'uppercase' }}>Destination Port</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{route.destination_port.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {route.destination_port.country || 'International'} &middot; {route.destination_port.latitude.toFixed(2)}°, {route.destination_port.longitude.toFixed(2)}°
              </div>
            </div>
          </div>
        </div>

        {/* Legs & Chokepoints Breakdown */}
        {route.legs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
              Transit Leg Breakdown ({route.legs.length} Segments)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {route.legs.map((leg) => (
                <div
                  key={leg.leg_index}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--color-brand-light)',
                        color: 'var(--color-brand-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {leg.leg_index}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {leg.from_name} &rarr; {leg.to_name}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-brand-accent)' }}>
                    {leg.distance_nm.toLocaleString()} NM
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '4px' }}>
                      ({leg.distance_km.toLocaleString()} km)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
