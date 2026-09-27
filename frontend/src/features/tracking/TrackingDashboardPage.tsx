/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Live Vessel Tracking Dashboard Page (/tracking)
 * Authentic Geospatial Telemetry & Booking Fleet Monitoring
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Radio,
  Search,
  RefreshCw,
  Plus,
  Shield,
  ChevronRight,
  X,
  Compass,
  Ship,
  Navigation,
} from 'lucide-react';
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
import './tracking.css';

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

  const getFreshnessBadgeClass = (status: TrackingFreshnessStatus) => {
    switch (status) {
      case 'LIVE':
        return 'live';
      case 'RECENT':
        return 'recent';
      case 'STALE':
        return 'stale';
      case 'DATA_UNAVAILABLE':
      default:
        return 'unavailable';
    }
  };

  const getFreshnessLabel = (status: TrackingFreshnessStatus) => {
    switch (status) {
      case 'LIVE':
        return 'LIVE';
      case 'RECENT':
        return 'RECENT';
      case 'STALE':
        return 'STALE';
      case 'DATA_UNAVAILABLE':
      default:
        return 'UNAVAILABLE';
    }
  };

  // Selected corridor ports if active booking exists
  const selectedOriginPort: TrackedPortInfo | null = vesselDetail?.active_booking?.origin_port || null;
  const selectedDestPort: TrackedPortInfo | null = vesselDetail?.active_booking?.destination_port || null;
  const selectedHistory: PositionObservation[] = vesselDetail?.position_history || [];

  // Determine system status label and class
  const liveCount = systemStatus?.metrics.live_vessels_count || 0;
  const isProviderConfigured = systemStatus?.provider_info?.is_configured || false;
  const statusPillClass = liveCount > 0 ? 'live' : isProviderConfigured ? 'standby' : 'offline';
  const statusPillLabel = liveCount > 0 ? 'LIVE TELEMETRY' : isProviderConfigured ? 'TELEMETRY ONLINE' : 'TELEMETRY STANDBY';

  const formatKpiNumber = (num?: number) => {
    if (num === undefined || num === null) return '00';
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div className="oceanlens-master-container tracking-page-root">
      {/* ============================================================== */}
      {/* 1. OPERATIONS CONTROL CENTER HEADER                            */}
      {/* ============================================================== */}
      <header className="tracking-header">
        <div className="tracking-header-left">
          <div className="tracking-icon-box">
            <Radio size={22} />
          </div>
          <div className="tracking-header-text">
            <div className="tracking-tag-row">
              <span className="tracking-module-tag">Module 20 &middot; Fleet Operations</span>
              <span className={`tracking-live-status-pill ${statusPillClass}`}>
                <span className="tracking-status-dot">
                  <span className="tracking-status-dot-ring" />
                  <span className="tracking-status-dot-core" />
                </span>
                <span>{statusPillLabel}</span>
              </span>
            </div>
            <h1 className="tracking-title">
              LIVE VESSEL TRACKING
            </h1>
            <p className="tracking-subtitle">
              Authentic geospatial telemetry &amp; booking fleet monitoring
            </p>
          </div>
        </div>

        <div className="tracking-header-actions">
          <button
            type="button"
            className="tracking-btn tracking-btn-primary"
            onClick={() => setIsIngestModalOpen(true)}
            title="Ingest Telemetry Observation"
          >
            <Plus size={14} />
            <span>+ Ingest Telemetry</span>
          </button>
          <button
            type="button"
            className="tracking-btn tracking-btn-secondary"
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh Telemetry Fleet"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. COMPACT OPERATIONAL KPI ROW                                 */}
      {/* ============================================================== */}
      {systemStatus && (
        <div className="tracking-kpi-grid">
          {/* Total Fleet Vessels */}
          <div className="tracking-kpi-card cyan">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">Fleet</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.total_fleet_vessels)}
            </div>
            <div className="tracking-kpi-desc">Total fleet vessels</div>
          </div>

          {/* With Telemetry */}
          <div className="tracking-kpi-card blue">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">With Telemetry</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.vessels_with_telemetry)}
            </div>
            <div className="tracking-kpi-desc">Active telemetry</div>
          </div>

          {/* Live Signals (< 2h) */}
          <div className="tracking-kpi-card emerald">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">Live Signals</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.live_vessels_count)}
            </div>
            <div className="tracking-kpi-desc">&lt; 2h observed</div>
          </div>

          {/* Recent Signals (2h–24h) */}
          <div className="tracking-kpi-card cyan">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">Recent Signals</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.recent_vessels_count || 0)}
            </div>
            <div className="tracking-kpi-desc">2h–24h window</div>
          </div>

          {/* Stale Signals (> 24h) */}
          <div className="tracking-kpi-card amber">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">Stale Signals</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.stale_vessels_count)}
            </div>
            <div className="tracking-kpi-desc">&gt; 24h latency</div>
          </div>

          {/* Data Unavailable */}
          <div className="tracking-kpi-card gray">
            <div className="tracking-kpi-accent-bar" />
            <div className="tracking-kpi-label">Unavailable</div>
            <div className="tracking-kpi-value">
              {formatKpiNumber(systemStatus.metrics.data_unavailable_vessels_count)}
            </div>
            <div className="tracking-kpi-desc">No coordinates</div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DATA AUTHENTICITY GUARANTEE BANNER (RULE 28)                */}
      {/* ============================================================== */}
      {systemStatus && (
        <div className="tracking-authenticity-banner">
          <div className="tracking-authenticity-left">
            <div className="tracking-authenticity-icon">
              <Shield size={16} />
            </div>
            <div className="tracking-authenticity-text">
              <div className="tracking-authenticity-heading">
                <span>&loz; DATA AUTHENTICITY GUARANTEE (RULE 28)</span>
              </div>
              <div className="tracking-authenticity-desc">
                {systemStatus.provider_info.status_message} Operating on verified telemetry per platform integrity guidelines.
              </div>
            </div>
          </div>

          <div className="tracking-authenticity-right">
            <span>TELEMETRY STORE:</span>
            <span className="tracking-store-tag">public.vessel_positions</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MAIN TRACKING WORKSPACE (FLEET PANEL + LIVE MAP)            */}
      {/* ============================================================== */}
      <div className="tracking-workspace-grid">
        {/* Left: Fleet Intelligence Panel */}
        <div className="tracking-fleet-panel">
          {/* Header & Controls */}
          <div className="tracking-fleet-header">
            <div className="tracking-fleet-title-row">
              <span className="tracking-fleet-title">
                <Ship size={14} style={{ color: '#00D9FF' }} />
                <span>Fleet Vessels</span>
              </span>
              <span className="tracking-fleet-count">
                {filteredVessels.length} / {vessels.length} monitored
              </span>
            </div>

            {/* Search Box */}
            <div className="tracking-search-box">
              <Search size={13} className="tracking-search-icon" />
              <input
                type="text"
                placeholder="Search vessel, IMO, booking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tracking-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#7189A3',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Segmented Filter Tabs */}
            <div className="tracking-filter-tabs">
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
                  className={`tracking-filter-tab ${selectedStatusTab === tab.key ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Vessel Intelligence Cards */}
          <div className="tracking-vessel-list">
            {isLoading ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#7189A3', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                <RefreshCw size={18} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#00D9FF' }} />
                Scanning fleet telemetry...
              </div>
            ) : filteredVessels.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#7189A3', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                No vessels matching filter.
              </div>
            ) : (
              filteredVessels.map((v) => {
                const isSelected = v.vessel_id === selectedVesselId;
                const badgeClass = getFreshnessBadgeClass(v.tracking_status);
                const badgeLabel = getFreshnessLabel(v.tracking_status);

                return (
                  <div
                    key={v.vessel_id}
                    onClick={() => handleSelectVessel(v.vessel_id)}
                    className={`tracking-vessel-card ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Row 1: Vessel Name & Freshness Badge */}
                    <div className="tracking-vessel-card-row1">
                      <div>
                        <div className="tracking-vessel-name">
                          {v.name}
                        </div>
                        <div className="tracking-vessel-meta">
                          {v.vessel_type} &middot; {v.capacity_tons.toLocaleString()} DWT
                        </div>
                      </div>
                      <span className={`tracking-status-badge ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Row 2: Position coordinates or unavailable note */}
                    {v.latest_position ? (
                      <div className="tracking-vessel-telemetry-row">
                        <span className="tracking-coord-text">
                          &bull; {v.latest_position.latitude.toFixed(3)}&deg;, {v.latest_position.longitude.toFixed(3)}&deg;
                        </span>
                        <span className="tracking-speed-heading">
                          {v.latest_position.speed_knots != null ? `${v.latest_position.speed_knots.toFixed(1)} kts` : ''}
                          {v.latest_position.heading != null ? ` · HDG ${v.latest_position.heading.toFixed(0)}°` : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="tracking-telemetry-unavailable">
                        Position: DATA_UNAVAILABLE
                      </div>
                    )}

                    {/* Row 3: Active Booking Ref Chip (if assigned) */}
                    {v.active_booking && (
                      <div className="tracking-booking-chip">
                        <span>BOOKING: {v.active_booking.booking_reference}</span>
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
        <div className="tracking-map-panel">
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

      {/* ============================================================== */}
      {/* 5. SLIDE-OUT INSPECTION DRAWER & MODAL                         */}
      {/* ============================================================== */}
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

export default TrackingDashboardPage;
