import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Radio,
  Ship,
  Search,
  RefreshCw,
  Plus,
  Shield,
  Clock,
  Compass,
  Package,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { trackingService } from '../../services/api/tracking.service';
import type {
  TrackingSystemStatus,
  TrackedVesselSummary,
  VesselTrackingDetail,
  TrackingFreshnessStatus,
  PositionObservation,
  TrackedPortInfo,
} from '../../types/tracking';
import { TrackingMap } from './components/TrackingMap';
import { VesselTrackingDrawer } from './components/VesselTrackingDrawer';
import { TrackingTelemetryIngestModal } from './components/TrackingTelemetryIngestModal';

export const TrackingDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlVesselId = searchParams.get('vesselId') ? Number(searchParams.get('vesselId')) : null;
  const urlBookingId = searchParams.get('bookingId') ? Number(searchParams.get('bookingId')) : null;

  const [systemStatus, setSystemStatus] = useState<TrackingSystemStatus | null>(null);
  const [vessels, setVessels] = useState<TrackedVesselSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');

  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(urlVesselId);
  const [vesselDetail, setVesselDetail] = useState<VesselTrackingDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // 1. Fetch Fleet Tracking Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statusRes, vesselsRes] = await Promise.all([
        trackingService.getTrackingStatus(),
        trackingService.getTrackedVessels('all', 100),
      ]);
      setSystemStatus(statusRes);
      setVessels(vesselsRes.vessels || []);
    } catch (err: any) {
      console.error('[TrackingDashboardPage] Fetch error:', err);
      setError(err?.message || 'Failed to connect to tracking subsystem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Fetch Single Vessel Details when selected
  const fetchVesselDetails = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const detail = await trackingService.getVesselTrackingDetail(id);
      setVesselDetail(detail);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error('[TrackingDashboardPage] Detail fetch error:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSelectVessel = (id: number) => {
    setSelectedVesselId(id);
    fetchVesselDetails(id);
    setSearchParams({ vesselId: id.toString() });
  };

  // 3. Handle initial URL parameters (bookingId / vesselId)
  useEffect(() => {
    if (urlBookingId) {
      trackingService
        .getBookingTracking(urlBookingId)
        .then((bTracking) => {
          if (bTracking?.vessel?.id) {
            handleSelectVessel(bTracking.vessel.id);
          }
        })
        .catch((e) => console.error('[TrackingDashboardPage] Booking tracking param error:', e));
    } else if (urlVesselId && !vesselDetail) {
      handleSelectVessel(urlVesselId);
    }
  }, [urlBookingId, urlVesselId]);

  // 4. Filter vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      // Status filter
      if (selectedStatusTab !== 'all') {
        if (v.tracking_status !== selectedStatusTab) return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchImo = v.imo_number?.toLowerCase().includes(q) || false;
      const matchId = v.vessel_id.toString().includes(q);
      const matchBooking = v.active_booking?.booking_reference.toLowerCase().includes(q) || false;
      const matchCargo = v.active_booking?.commodity?.toLowerCase().includes(q) || false;
      return matchName || matchImo || matchId || matchBooking || matchCargo;
    });
  }, [vessels, selectedStatusTab, searchQuery]);

  const getFreshnessBadge = (status: TrackingFreshnessStatus) => {
    switch (status) {
      case 'LIVE':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', label: 'LIVE' };
      case 'RECENT':
        return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', label: 'RECENT' };
      case 'STALE':
        return { bg: '#fffbeb', text: '#92400e', border: '#fde68a', label: 'STALE' };
      case 'DATA_UNAVAILABLE':
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', label: 'UNAVAILABLE' };
    }
  };

  // Selected corridor ports if active booking exists
  const selectedOriginPort: TrackedPortInfo | null = vesselDetail?.active_booking?.origin_port || null;
  const selectedDestPort: TrackedPortInfo | null = vesselDetail?.active_booking?.destination_port || null;
  const selectedHistory: PositionObservation[] = vesselDetail?.position_history || [];

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Live Vessel Tracking
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Module 20 &middot; Authentic Geospatial Telemetry & Booking Fleet Monitoring
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setIsIngestModalOpen(true)}
          >
            Ingest Telemetry
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchData}
            disabled={isLoading}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {systemStatus && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Fleet Vessels</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {systemStatus.metrics.total_fleet_vessels}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>With Telemetry</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
              {systemStatus.metrics.vessels_with_telemetry}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>Live Signals (&lt; 2h)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {systemStatus.metrics.live_vessels_count}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: '#f59e0b', fontWeight: 600 }}>Stale Signals (&gt; 24h)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              {systemStatus.metrics.stale_vessels_count}
            </div>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Data Unavailable</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {systemStatus.metrics.data_unavailable_vessels_count}
            </div>
          </div>
        </div>
      )}

      {/* Provider Status / Rule 28 Disclosure Banner */}
      {systemStatus && (
        <div
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={15} color="#0284c7" style={{ flexShrink: 0 }} />
            <div>
              <strong>Data Authenticity Guarantee (Rule 28):</strong> {systemStatus.provider_info.status_message}
            </div>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            Telemetry Store: <strong>public.vessel_positions</strong>
          </div>
        </div>
      )}

      {/* Main Split-View: Vessel List on Left, Interactive Map on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: '14px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left: Vessel Telemetry List */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '10px',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* List Search & Filter Header */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface-alt)' }}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search vessel, IMO, booking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'LIVE', label: 'Live' },
                { key: 'RECENT', label: 'Recent' },
                { key: 'STALE', label: 'Stale' },
                { key: 'DATA_UNAVAILABLE', label: 'Unavailable' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab.key)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: selectedStatusTab === tab.key ? 700 : 500,
                    backgroundColor: selectedStatusTab === tab.key ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                    border: selectedStatusTab === tab.key ? '1px solid #0284c7' : '1px solid transparent',
                    color: selectedStatusTab === tab.key ? '#0284c7' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Vessel Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                Scanning fleet positions...
              </div>
            ) : filteredVessels.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                No vessels matching filter.
              </div>
            ) : (
              filteredVessels.map((v) => {
                const isSelected = v.vessel_id === selectedVesselId;
                const badge = getFreshnessBadge(v.tracking_status);
                return (
                  <div
                    key={v.vessel_id}
                    onClick={() => handleSelectVessel(v.vessel_id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-bg-surface-alt)',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      transition: 'border 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {v.vessel_type} &middot; {v.capacity_tons.toLocaleString()} DWT
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '999px',
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {v.latest_position ? (
                      <div style={{ marginTop: '6px', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          {v.latest_position.latitude.toFixed(3)}&deg;, {v.latest_position.longitude.toFixed(3)}&deg;
                        </span>
                        <span>
                          {v.latest_position.speed_knots != null ? `${v.latest_position.speed_knots.toFixed(1)} kts` : ''}{' '}
                          {v.latest_position.heading != null ? `&middot; ${v.latest_position.heading.toFixed(0)}°` : ''}
                        </span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '6px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                        Position: DATA_UNAVAILABLE
                      </div>
                    )}

                    {v.active_booking && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          fontSize: '0.675rem',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Booking: {v.active_booking.booking_reference}</span>
                        <ChevronRight size={12} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Interactive Tracking Map Canvas */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '10px',
            border: '1px solid var(--color-border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TrackingMap
            vessels={vessels}
            selectedVesselId={selectedVesselId}
            onSelectVessel={handleSelectVessel}
            historicalPoints={selectedHistory}
            originPort={selectedOriginPort}
            destinationPort={selectedDestPort}
            onOpenIngestModal={() => setIsIngestModalOpen(true)}
          />
        </div>
      </div>

      {/* Slide-out Inspection Drawer */}
      {isDrawerOpen && (
        <VesselTrackingDrawer
          vesselDetail={vesselDetail}
          isLoading={isDetailLoading}
          onClose={() => setIsDrawerOpen(false)}
          onRefreshVessel={(id) => {
            fetchVesselDetails(id);
            fetchData();
          }}
        />
      )}

      {/* Telemetry Ingestion Modal */}
      {isIngestModalOpen && (
        <TrackingTelemetryIngestModal
          isOpen={isIngestModalOpen}
          onClose={() => setIsIngestModalOpen(false)}
          vessels={vessels}
          selectedVesselId={selectedVesselId}
          onIngestSuccess={() => {
            fetchData();
            if (selectedVesselId) fetchVesselDetails(selectedVesselId);
          }}
        />
      )}
    </div>
  );
};
