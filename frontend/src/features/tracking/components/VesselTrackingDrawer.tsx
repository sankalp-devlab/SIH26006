import React, { useState } from 'react';
import {
  X,
  Ship,
  Compass,
  Navigation,
  Clock,
  Radio,
  Package,
  ArrowRight,
  Shield,
  RefreshCw,
  Info,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { trackingService } from '../../../services/api/tracking.service';
import type { VesselTrackingDetail, TrackingFreshnessStatus } from '../../../types/tracking';

interface VesselTrackingDrawerProps {
  vesselDetail: VesselTrackingDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onRefreshVessel: (vesselId: number) => void;
}

export const VesselTrackingDrawer: React.FC<VesselTrackingDrawerProps> = ({
  vesselDetail,
  isLoading,
  onClose,
  onRefreshVessel,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!vesselDetail && !isLoading) return null;

  const handleRefresh = async () => {
    if (!vesselDetail) return;
    setIsRefreshing(true);
    try {
      await trackingService.refreshVesselTracking(vesselDetail.vessel_id);
      onRefreshVessel(vesselDetail.vessel_id);
    } catch (err) {
      console.error('[VesselTrackingDrawer] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getFreshnessBadge = (status: TrackingFreshnessStatus) => {
    switch (status) {
      case 'LIVE':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', label: 'LIVE TELEMETRY' };
      case 'RECENT':
        return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', label: 'RECENT OBSERVATION' };
      case 'STALE':
        return { bg: '#fffbeb', text: '#92400e', border: '#fde68a', label: 'STALE POSITION' };
      case 'DATA_UNAVAILABLE':
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'DATA UNAVAILABLE' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border-subtle)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 1051,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface-alt)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {vesselDetail ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {vesselDetail.name}
                </h3>
                {(() => {
                  const b = getFreshnessBadge(vesselDetail.tracking_status);
                  return (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        backgroundColor: b.bg,
                        color: b.text,
                        border: `1px solid ${b.border}`,
                      }}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                IMO: {vesselDetail.imo_number || 'Registered Fleet'} &middot; {vesselDetail.vessel_type} &middot; {vesselDetail.flag || 'Global Flag'}
              </div>
            </div>
          ) : (
            <div>Loading vessel tracking...</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {vesselDetail && (
              <Button
                size="sm"
                variant="secondary"
                icon={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Refresh
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        {vesselDetail && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            {/* 1. Latest Telemetry Block */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-alt)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} color="#0284c7" /> Latest Position Observation
                </span>
                {vesselDetail.latest_position?.age_minutes != null && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {vesselDetail.latest_position.age_minutes}m ago
                  </span>
                )}
              </div>

              {vesselDetail.latest_position ? (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Coordinates</div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0284c7', marginTop: '2px' }}>
                        {vesselDetail.latest_position.latitude.toFixed(4)}&deg; N, {vesselDetail.latest_position.longitude.toFixed(4)}&deg; E
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Speed & Heading</div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {vesselDetail.latest_position.speed_knots != null ? `${vesselDetail.latest_position.speed_knots.toFixed(1)} kts` : 'N/A'} &middot;{' '}
                        {vesselDetail.latest_position.heading != null ? `${vesselDetail.latest_position.heading.toFixed(0)}°` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    Timestamp: {new Date(vesselDetail.latest_position.recorded_at).toUTCString()} &middot; Source: {vesselDetail.latest_position.data_source}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <strong>DATA_UNAVAILABLE:</strong> No position observations are logged in Supabase for this vessel. Coordinates are never fabricated per Rule 28.
                </div>
              )}
            </div>

            {/* 2. Associated Commercial Cargo Booking */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-alt)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} color="#0284c7" /> Active Commercial Booking
              </div>

              {vesselDetail.active_booking ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Booking Reference:</span>{' '}
                      <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{vesselDetail.active_booking.booking_reference}</strong>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        textTransform: 'uppercase',
                      }}
                    >
                      {vesselDetail.active_booking.booking_status}
                    </span>
                  </div>

                  {vesselDetail.active_booking.cargo && (
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {vesselDetail.active_booking.cargo.commodity} ({vesselDetail.active_booking.cargo.weight_tons.toLocaleString()} MT &middot; {vesselDetail.active_booking.cargo.cargo_type})
                    </div>
                  )}

                  {/* Corridor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span>{vesselDetail.active_booking.origin_port?.name || 'Origin Port'}</span>
                    <ArrowRight size={13} color="#0284c7" />
                    <span>{vesselDetail.active_booking.destination_port?.name || 'Destination Port'}</span>
                  </div>

                  {/* Estimates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <div style={{ padding: '6px 8px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Est. Voyage Cost</div>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        {vesselDetail.active_booking.estimated_cost ? `$${vesselDetail.active_booking.estimated_cost.toLocaleString()} USD` : 'Spot Rate'}
                      </div>
                    </div>
                    <div style={{ padding: '6px 8px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Estimated ETA</div>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        {vesselDetail.active_booking.estimated_eta ? new Date(vesselDetail.active_booking.estimated_eta).toLocaleDateString() : 'Pending Dispatch'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  No active commercial cargo bookings currently assigned to this vessel.
                </div>
              )}
            </div>

            {/* 3. Vessel Particulars */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-alt)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ship size={14} color="#0284c7" /> Fleet Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Deadweight</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{vesselDetail.capacity_tons.toLocaleString()} MT</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Design Draft</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{vesselDetail.draft_m || 10.5} m</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>Laden Speed</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{vesselDetail.speed_laden_knots || 14.0} kts</div>
                </div>
              </div>
            </div>

            {/* 4. Chronological Position History */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-alt)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="#0284c7" /> Authentic Stored Track ({vesselDetail.position_history_count})
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Chronological AIS</span>
              </div>

              {vesselDetail.position_history.length > 0 ? (
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-subtle)', fontSize: '0.6875rem' }}>
                        <th style={{ padding: '4px' }}>Time (UTC)</th>
                        <th style={{ padding: '4px' }}>Lat, Lng</th>
                        <th style={{ padding: '4px' }}>Speed</th>
                        <th style={{ padding: '4px' }}>Heading</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vesselDetail.position_history.map((h) => (
                        <tr key={h.position_id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                            {new Date(h.recorded_at).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '6px 4px', fontFamily: 'monospace' }}>
                            {h.latitude.toFixed(3)}°, {h.longitude.toFixed(3)}°
                          </td>
                          <td style={{ padding: '6px 4px' }}>{h.speed_knots != null ? `${h.speed_knots.toFixed(1)} kts` : '—'}</td>
                          <td style={{ padding: '6px 4px' }}>{h.heading != null ? `${h.heading.toFixed(0)}°` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  No historical AIS position records logged for this vessel.
                </div>
              )}
            </div>

            {/* 5. Rule 28 Transparency Notice */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(2, 132, 199, 0.04)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.45,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>
                <Info size={14} /> Telemetry Integrity Notice
              </div>
              <p style={{ margin: 0 }}>{vesselDetail.transparency_notice}</p>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Provider Status: {vesselDetail.provider_info.status_message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
