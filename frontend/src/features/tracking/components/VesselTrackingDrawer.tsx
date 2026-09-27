/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Vessel Tracking Slideout Inspection Drawer
 */

import React, { useState } from 'react';
import {
  X,
  Ship,
  Clock,
  Radio,
  Package,
  ArrowRight,
  RefreshCw,
  Info,
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
        return { bg: 'rgba(32, 201, 138, 0.15)', text: '#20C98A', border: 'rgba(32, 201, 138, 0.35)', label: 'LIVE TELEMETRY' };
      case 'RECENT':
        return { bg: 'rgba(0, 217, 255, 0.12)', text: '#00D9FF', border: 'rgba(0, 217, 255, 0.35)', label: 'RECENT OBSERVATION' };
      case 'STALE':
        return { bg: 'rgba(255, 176, 32, 0.15)', text: '#FFB020', border: 'rgba(255, 176, 32, 0.35)', label: 'STALE POSITION' };
      case 'DATA_UNAVAILABLE':
      default:
        return { bg: 'rgba(113, 137, 163, 0.15)', text: '#8DA2B7', border: 'rgba(113, 137, 163, 0.25)', label: 'DATA UNAVAILABLE' };
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
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(6px)',
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
          backgroundColor: '#061321',
          borderLeft: '1px solid rgba(100, 190, 240, 0.22)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 1051,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#F5F8FC',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(100, 190, 240, 0.18)',
            backgroundColor: '#091A2A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {vesselDetail ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                  {vesselDetail.name}
                </h3>
                {(() => {
                  const b = getFreshnessBadge(vesselDetail.tracking_status);
                  return (
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: b.bg,
                        color: b.text,
                        border: `1px solid ${b.border}`,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#7189A3', marginTop: '3px' }}>
                IMO: {vesselDetail.imo_number || 'Registered Fleet'} &middot; {vesselDetail.vessel_type} &middot; {vesselDetail.flag || 'Global Flag'}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#7189A3' }}>Loading vessel tracking...</div>
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
              style={{
                background: 'none',
                border: 'none',
                color: '#7189A3',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        {vesselDetail && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* 1. Latest Telemetry Block */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#091A2A',
                border: '1px solid rgba(100, 190, 240, 0.16)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                  <Radio size={13} /> Latest Position Observation
                </span>
                {vesselDetail.latest_position?.age_minutes != null && (
                  <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#7189A3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {vesselDetail.latest_position.age_minutes}m ago
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
                    <div style={{ padding: '8px 10px', backgroundColor: '#061321', borderRadius: '6px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>Coordinates</div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
                        {vesselDetail.latest_position.latitude.toFixed(4)}&deg; N, {vesselDetail.latest_position.longitude.toFixed(4)}&deg; E
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', backgroundColor: '#061321', borderRadius: '6px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>Speed &amp; Heading</div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#F5F8FC', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
                        {vesselDetail.latest_position.speed_knots != null ? `${vesselDetail.latest_position.speed_knots.toFixed(1)} kts` : 'N/A'} &middot;{' '}
                        {vesselDetail.latest_position.heading != null ? `${vesselDetail.latest_position.heading.toFixed(0)}°` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#7189A3', marginTop: '8px' }}>
                    Timestamp: {new Date(vesselDetail.latest_position.recorded_at).toUTCString()} &middot; Source: {vesselDetail.latest_position.data_source}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(255, 176, 32, 0.08)', border: '1px solid rgba(255, 176, 32, 0.25)', fontSize: '11px', color: '#FFD479', fontFamily: "'JetBrains Mono', monospace" }}>
                  <strong>DATA_UNAVAILABLE:</strong> No position observations are logged in database for this vessel. Coordinates are never fabricated per Rule 28.
                </div>
              )}
            </div>

            {/* 2. Associated Commercial Cargo Booking */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#091A2A',
                border: '1px solid rgba(100, 190, 240, 0.16)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                <Package size={13} /> Active Commercial Booking
              </div>

              {vesselDetail.active_booking ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: '#7189A3' }}>Booking Reference:</span>{' '}
                      <strong style={{ color: '#00D9FF' }}>{vesselDetail.active_booking.booking_reference}</strong>
                    </div>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: 'rgba(255, 176, 32, 0.12)',
                        color: '#FFB020',
                        border: '1px solid rgba(255, 176, 32, 0.3)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {vesselDetail.active_booking.booking_status}
                    </span>
                  </div>

                  {vesselDetail.active_booking.cargo && (
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#D3E0EA' }}>
                      {vesselDetail.active_booking.cargo.commodity} ({vesselDetail.active_booking.cargo.weight_tons.toLocaleString()} MT &middot; {vesselDetail.active_booking.cargo.cargo_type})
                    </div>
                  )}

                  {/* Corridor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#A5B8CC' }}>
                    <span>{vesselDetail.active_booking.origin_port?.name || 'Origin Port'}</span>
                    <ArrowRight size={12} color="#00D9FF" />
                    <span>{vesselDetail.active_booking.destination_port?.name || 'Destination Port'}</span>
                  </div>

                  {/* Estimates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <div style={{ padding: '6px 8px', backgroundColor: '#061321', borderRadius: '5px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
                      <div style={{ fontSize: '10px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>Est. Voyage Cost</div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#20C98A', fontFamily: "'JetBrains Mono', monospace" }}>
                        {vesselDetail.active_booking.estimated_cost ? `$${vesselDetail.active_booking.estimated_cost.toLocaleString()} USD` : 'Spot Rate'}
                      </div>
                    </div>
                    <div style={{ padding: '6px 8px', backgroundColor: '#061321', borderRadius: '5px', border: '1px solid rgba(100, 190, 240, 0.12)' }}>
                      <div style={{ fontSize: '10px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>Estimated ETA</div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>
                        {vesselDetail.active_booking.estimated_eta ? new Date(vesselDetail.active_booking.estimated_eta).toLocaleDateString() : 'Pending Dispatch'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>
                  No active commercial cargo bookings currently assigned to this vessel.
                </div>
              )}
            </div>

            {/* 3. Vessel Particulars */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#091A2A',
                border: '1px solid rgba(100, 190, 240, 0.16)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                <Ship size={13} /> Fleet Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ padding: '6px 8px', backgroundColor: '#061321', borderRadius: '5px', border: '1px solid rgba(100, 190, 240, 0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#7189A3' }}>Deadweight</div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{vesselDetail.capacity_tons.toLocaleString()} MT</div>
                </div>
                <div style={{ padding: '6px 8px', backgroundColor: '#061321', borderRadius: '5px', border: '1px solid rgba(100, 190, 240, 0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#7189A3' }}>Design Draft</div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{vesselDetail.draft_m || 10.5} m</div>
                </div>
                <div style={{ padding: '6px 8px', backgroundColor: '#061321', borderRadius: '5px', border: '1px solid rgba(100, 190, 240, 0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#7189A3' }}>Laden Speed</div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{vesselDetail.speed_laden_knots || 14.0} kts</div>
                </div>
              </div>
            </div>

            {/* 4. Chronological Position History */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#091A2A',
                border: '1px solid rgba(100, 190, 240, 0.16)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
                  <Layers size={13} /> Authentic Stored Track ({vesselDetail.position_history_count})
                </span>
                <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#7189A3' }}>Chronological AIS</span>
              </div>

              {vesselDetail.position_history.length > 0 ? (
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace" }}>
                    <thead>
                      <tr style={{ color: '#7189A3', borderBottom: '1px solid rgba(100, 190, 240, 0.14)', fontSize: '10px' }}>
                        <th style={{ padding: '6px 4px' }}>Time (UTC)</th>
                        <th style={{ padding: '6px 4px' }}>Lat, Lng</th>
                        <th style={{ padding: '6px 4px' }}>Speed</th>
                        <th style={{ padding: '6px 4px' }}>Heading</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vesselDetail.position_history.map((h) => (
                        <tr key={h.position_id} style={{ borderBottom: '1px solid rgba(100, 190, 240, 0.08)' }}>
                          <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', color: '#A5B8CC' }}>
                            {new Date(h.recorded_at).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '6px 4px', color: '#00D9FF' }}>
                            {h.latitude.toFixed(3)}°, {h.longitude.toFixed(3)}°
                          </td>
                          <td style={{ padding: '6px 4px', color: '#D3E0EA' }}>{h.speed_knots != null ? `${h.speed_knots.toFixed(1)} kts` : '—'}</td>
                          <td style={{ padding: '6px 4px', color: '#D3E0EA' }}>{h.heading != null ? `${h.heading.toFixed(0)}°` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace" }}>
                  No historical AIS position records logged for this vessel.
                </div>
              )}
            </div>

            {/* 5. Rule 28 Transparency Notice */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 217, 255, 0.06)',
                border: '1px solid rgba(0, 217, 255, 0.22)',
                fontSize: '11px',
                color: '#A5B8CC',
                lineHeight: 1.45,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#00D9FF', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                <Info size={13} /> Telemetry Integrity Notice
              </div>
              <p style={{ margin: 0 }}>{vesselDetail.transparency_notice}</p>
              <div style={{ fontSize: '10px', color: '#7189A3', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                Provider Status: {vesselDetail.provider_info.status_message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselTrackingDrawer;
