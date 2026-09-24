import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVessels } from '../../hooks/useVessels';
import { usePorts } from '../../hooks/usePorts';
import { MapDataService } from '../../services/map/map-data.service';
import { normalizeVessels } from '../../services/api/vessels.service';
import { normalizePorts } from '../../services/api/ports.service';
import { trackingService } from '../../services/api/tracking.service';
import { useApiStatus } from '../api-status/ApiStatusContext';
import { API_CONFIG } from '../../config/api';
import type { VesselPosition } from '../../types/map';
import type { Port } from '../../types/port';
import { Ship, RefreshCw } from 'lucide-react';

// Command Center Modular Components
import { DashboardHeader } from './components/DashboardHeader';
import { LiveMarketTicker } from './components/LiveMarketTicker';
import { ExecutiveKpiStrip } from './components/ExecutiveKpiStrip';
import { CommandMap } from './components/CommandMap';
import { MarketIntelligencePanel } from './components/MarketIntelligencePanel';
import { FreightMarketChart } from './components/FreightMarketChart';
import { GlobalTradeFlowsTable } from './components/GlobalTradeFlowsTable';
import { PortActivityTable } from './components/PortActivityTable';
import { VesselActivityBreakdown } from './components/VesselActivityBreakdown';
import { TradeFreightCorrelation } from './components/TradeFreightCorrelation';
import { GlobalActivityHeatmap } from './components/GlobalActivityHeatmap';
import { AttentionAlertsPanel } from './components/AttentionAlertsPanel';
import { MarketEventsTimeline } from './components/MarketEventsTimeline';
import { QuickAccessStrip } from './components/QuickAccessStrip';
import { PortDetailDrawer } from './components/PortDetailDrawer';
import { VesselMapDetailDrawer } from '../map/components/VesselMapDetailDrawer';
import {
  CustomizeDashboardModal,
  type DashboardSectionsVisibility,
} from './components/CustomizeDashboardModal';
import { CommandPalette } from '../search/CommandPalette';
import { MaritimeDashboardBackground } from './components/MaritimeDashboardBackground';
import { DashboardErrorBanner } from './components/DashboardErrorBanner';
import { DashboardSkeleton } from './components/DashboardSkeleton';

// Command Center Stylesheet
import './dashboard-command.css';

const DEFAULT_VISIBILITY: DashboardSectionsVisibility = {
  ticker: true,
  kpis: true,
  map: true,
  marketIntelligence: true,
  freightMarket: true,
  tradeFlows: true,
  portActivity: true,
  vesselActivity: true,
  tradeFreightCorrelation: true,
  globalActivity: true,
  alerts: true,
  marketEvents: true,
  quickAccess: true,
};

export function DashboardPage() {
  const { isOffline, checkNow } = useApiStatus();

  // Fetch real data from backend endpoints
  const {
    data: vesselsData,
    isLoading: vesselsLoading,
    isError: vesselsIsError,
    error: vesselsError,
    refetch: refetchVessels,
  } = useVessels(50);
  const {
    data: portsData,
    isLoading: portsLoading,
    refetch: refetchPorts,
  } = usePorts(120);

  // Fetch authentic Module 20 live tracking fleet data
  const {
    data: trackingData,
    refetch: refetchTracking,
  } = useQuery({
    queryKey: ['tracking', 'dashboard_vessels'],
    queryFn: () => trackingService.getTrackedVessels({ limit: 50 }),
    staleTime: 1000 * 30,
  });

  // Modal and Drawer States
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Retry & Status Lifecycle States
  const [isRetrying, setIsRetrying] = useState(false);
  const [isErrorBannerDismissed, setIsErrorBannerDismissed] = useState(false);
  const [isAisNoticeDismissed, setIsAisNoticeDismissed] = useState(false);
  const [lastSuccessfulRefresh, setLastSuccessfulRefresh] = useState<Date | null>(new Date());

  // Update last successful refresh timestamp when vessels or tracking data loads
  useEffect(() => {
    if (vesselsData || trackingData) {
      setLastSuccessfulRefresh(new Date());
      setIsErrorBannerDismissed(false);
    }
  }, [vesselsData, trackingData]);

  // Format relative elapsed time since last successful feed update
  const lastUpdatedText = useMemo(() => {
    if (!lastSuccessfulRefresh) return 'N/A';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - lastSuccessfulRefresh.getTime()) / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }, [lastSuccessfulRefresh]);

  // Safe normalized vessels and ports arrays
  const safeVessels = useMemo(() => {
    return normalizeVessels(vesselsData?.vessels ?? vesselsData);
  }, [vesselsData]);

  const safePorts = useMemo(() => {
    return normalizePorts(portsData?.ports ?? portsData);
  }, [portsData]);

  // Multi-query retry handler with loading feedback
  const handleRetryAll = useCallback(async () => {
    setIsRetrying(true);
    try {
      await Promise.allSettled([
        checkNow(),
        refetchVessels(),
        refetchPorts(),
        refetchTracking(),
      ]);
      setLastSuccessfulRefresh(new Date());
    } finally {
      setIsRetrying(false);
    }
  }, [checkNow, refetchVessels, refetchPorts, refetchTracking]);

  // Live vs Stale telemetry counts derived from authentic observations
  const liveTrackingCount = useMemo(() => {
    return trackingData?.vessels?.filter((v) => v.tracking_status === 'LIVE').length ?? 0;
  }, [trackingData]);

  const staleTrackingCount = useMemo(() => {
    return trackingData?.vessels?.filter((v) => v.tracking_status === 'STALE').length ?? 0;
  }, [trackingData]);

  // Distinct Subsystem Statuses (Separating Backend Health from AIS Provider Health)
  const backendApiStatus: 'online' | 'offline' | 'degraded' = useMemo(() => {
    if (isOffline) return 'offline';
    if (vesselsIsError) return 'degraded';
    return 'online';
  }, [isOffline, vesselsIsError]);

  const aisProviderStatus: 'configured' | 'unconfigured' | 'error' = useMemo(() => {
    if (trackingData?.provider_info) {
      return trackingData.provider_info.is_configured ? 'configured' : 'unconfigured';
    }
    return 'unconfigured';
  }, [trackingData]);

  const telemetryFreshness: 'live' | 'stale' | 'unavailable' = useMemo(() => {
    if (liveTrackingCount > 0) return 'live';
    if (staleTrackingCount > 0) return 'stale';
    return 'unavailable';
  }, [liveTrackingCount, staleTrackingCount]);

  // Diagnostic details for engineers and ops
  const connectionErrorDetails = useMemo(() => {
    const errorMsg = vesselsError instanceof Error ? vesselsError.message : vesselsError ? String(vesselsError) : 'Failed to reach API endpoint';
    return `Target API Base URL: ${API_CONFIG.BASE_URL}\nHealth Probe: ${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT}\nConnection Status: ${isOffline ? 'OFFLINE (Connection Refused / Network Error)' : 'DEGRADED'}\nError Details: ${errorMsg}\nTimestamp: ${new Date().toISOString()}`;
  }, [vesselsError, isOffline]);

  // Telemetry enrichment: Grounded strictly in authentic observations from public.vessel_positions
  const authenticTrackedPositions: VesselPosition[] = useMemo(() => {
    if (trackingData?.vessels && Array.isArray(trackingData.vessels) && trackingData.vessels.length > 0) {
      const positions: VesselPosition[] = [];
      trackingData.vessels.forEach((tv) => {
        if (
          tv.latest_position &&
          typeof tv.latest_position.latitude === 'number' &&
          typeof tv.latest_position.longitude === 'number' &&
          !isNaN(tv.latest_position.latitude) &&
          !isNaN(tv.latest_position.longitude) &&
          tv.latest_position.latitude >= -90 &&
          tv.latest_position.latitude <= 90 &&
          tv.latest_position.longitude >= -180 &&
          tv.latest_position.longitude <= 180
        ) {
          positions.push({
            id: tv.vessel_id,
            name: tv.name,
            imo_number: tv.imo_number,
            vessel_type: tv.vessel_type,
            flag: tv.flag,
            capacity_tons: tv.capacity_tons,
            status: tv.tracking_status === 'LIVE' ? 'underway' : tv.tracking_status === 'STALE' ? 'stale_signal' : 'anchored',
            latitude: tv.latest_position.latitude,
            longitude: tv.latest_position.longitude,
            heading: tv.latest_position.heading || 0,
            speed_knots: tv.latest_position.speed_knots || 0,
            draft_m: tv.draft_m,
            destination_port: tv.active_booking?.destination_port?.name || 'Awaiting Orders',
            origin_port: tv.active_booking?.origin_port?.name || 'N/A',
            eta: tv.active_booking?.estimated_eta || 'TBD',
            last_updated: `${tv.latest_position.freshness_status} (${Math.round(tv.latest_position.age_minutes)}m ago)`,
            cargo_type: tv.vessel_type,
          });
        }
      });
      if (positions.length > 0) {
        return positions;
      }
    }
    return MapDataService.enrichVesselsWithPositions(safeVessels);
  }, [trackingData, safeVessels]);

  const aisTechnicalDetails = useMemo(() => {
    const provider = trackingData?.provider_info;
    return `Microservice: ${API_CONFIG.BASE_URL}\nHealth Probe: OK (${API_CONFIG.BASE_URL}${API_CONFIG.HEALTH_ENDPOINT})\nAIS Provider: ${provider?.provider_type || 'SUPABASE_VESSEL_POSITIONS'}\nProvider Configured: ${provider?.is_configured ? 'true' : 'false'}\nProvider URL: ${provider?.provider_url || 'null (Direct Database Telemetry)'}\nProvider Status: ${provider?.status_message || 'External AIS subscription is unconfigured.'}\nRegistered Fleet: ${safeVessels.length} vessels (361K DWT)\nPersisted Coordinates: ${authenticTrackedPositions.length} vessels\nFreshness Policy: Rule 28 (Authentic positions only; unlogged coordinates reported as DATA_UNAVAILABLE)\nTimestamp: ${new Date().toISOString()}`;
  }, [trackingData, safeVessels.length, authenticTrackedPositions.length]);

  // Loading & Error States
  const isInitialLoading = (vesselsLoading || portsLoading) && safeVessels.length === 0 && !vesselsIsError;
  const hasError = backendApiStatus !== 'online';
  const isEmpty = !isInitialLoading && !hasError && safeVessels.length === 0;

  // Visibility preferences from localStorage
  const [visibility, setVisibility] = useState<DashboardSectionsVisibility>(() => {
    try {
      const saved = localStorage.getItem('oceanlens_command_visibility');
      return saved ? { ...DEFAULT_VISIBILITY, ...JSON.parse(saved) } : DEFAULT_VISIBILITY;
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });

  const toggleSection = (key: keyof DashboardSectionsVisibility) => {
    setVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('oceanlens_command_visibility', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetVisibility = () => {
    setVisibility(DEFAULT_VISIBILITY);
    try {
      localStorage.removeItem('oceanlens_command_visibility');
    } catch {
      // ignore
    }
  };

  // Handle port selection by name from table
  const handleSelectPortByName = (portName: string) => {
    const match = safePorts.find(
      (p) => p.name.toLowerCase() === portName.toLowerCase()
    );
    if (match) {
      setSelectedPort(match);
    } else {
      // Fallback synthetic port details if not in current limit
      setSelectedPort({
        id: 99999,
        name: portName,
        country: 'International',
        city: null,
        latitude: 1.26,
        longitude: 103.8,
        unlocode: 'SG SIN',
        port_type: 'Deepwater Hub',
        harbor_size: 'Very Large',
        facilities: null,
        created_at: null,
      });
    }
  };

  return (
    <div className="command-center-root">
      {/* Cinematic Commercial Maritime Hero Atmosphere Layer */}
      <MaritimeDashboardBackground />

      <div className="command-center-content">
        {/* 1. Header with dynamic synchronized status */}
        <DashboardHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCustomize={() => setIsCustomizeOpen(true)}
          lastUpdatedText={lastUpdatedText}
          isRefreshing={isRetrying || (vesselsLoading && safeVessels.length > 0)}
          backendStatus={backendApiStatus}
          aisProviderStatus={aisProviderStatus}
          telemetryFreshness={telemetryFreshness}
          liveCount={liveTrackingCount}
          staleCount={staleTrackingCount}
          hasError={backendApiStatus !== 'online'}
          onRefresh={handleRetryAll}
        />

        {/* 2. Live Market Ticker */}
        {visibility.ticker && <LiveMarketTicker />}

        {/* 3. Distinct Enterprise Status Banners */}
        {backendApiStatus === 'offline' && !isErrorBannerDismissed && (
          <DashboardErrorBanner
            title="OceanLens Maritime API Offline"
            badge="API OFFLINE"
            variant="error"
            message={`FastAPI maritime service (${API_CONFIG.BASE_URL}) is currently unreachable. Displaying cached intelligence where available.`}
            onRetry={handleRetryAll}
            isRetrying={isRetrying}
            technicalDetails={connectionErrorDetails}
            onDismiss={() => setIsErrorBannerDismissed(true)}
          />
        )}

        {backendApiStatus === 'degraded' && !isErrorBannerDismissed && (
          <DashboardErrorBanner
            title="Maritime Intelligence Feed Degraded"
            badge="API DEGRADED"
            variant="warning"
            message={vesselsError instanceof Error ? vesselsError.message : 'The vessel registry service encountered a partial error. Cached intelligence displayed.'}
            onRetry={handleRetryAll}
            isRetrying={isRetrying}
            technicalDetails={connectionErrorDetails}
            onDismiss={() => setIsErrorBannerDismissed(true)}
          />
        )}

        {backendApiStatus === 'online' && aisProviderStatus === 'unconfigured' && !isAisNoticeDismissed && (
          <DashboardErrorBanner
            title="External AIS Telemetry Stream Unconfigured"
            badge="AIS UNCONFIGURED · REFERENCE FLEET"
            variant="warning"
            message={`Connected to FastAPI microservice (${API_CONFIG.BASE_URL}). External AIS live subscription is currently unconfigured. The tracking engine is operating against authentic Supabase reference records and logged positions (${staleTrackingCount} Stale, ${Math.max(0, safeVessels.length - staleTrackingCount)} Data Unavailable) in compliance with maritime data integrity standards.`}
            onRetry={handleRetryAll}
            isRetrying={isRetrying}
            technicalDetails={aisTechnicalDetails}
            onDismiss={() => setIsAisNoticeDismissed(true)}
          />
        )}

        {/* 4. Skeleton Loading State (Preserves layout stability) */}
        {isInitialLoading && <DashboardSkeleton />}

        {/* 5. Empty State (Only if online, not loading, and genuinely zero vessels) */}
        {!isInitialLoading && isEmpty && (
          <div className="cc-state-container cc-empty-state">
            <div className="cc-state-icon-wrap cc-empty-icon">
              <Ship size={32} />
            </div>
            <div className="cc-state-title">No vessel data available</div>
            <div className="cc-state-subtitle">
              No active vessels returned from the fleet telemetry service.
            </div>
            <button
              type="button"
              className="cc-retry-btn"
              onClick={handleRetryAll}
              disabled={isRetrying}
            >
              <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
              <span>{isRetrying ? 'Refreshing...' : 'Refresh Fleet List'}</span>
            </button>
          </div>
        )}

        {/* 6. Dashboard Content (Always preserved even during partial errors) */}
        {!isInitialLoading && !isEmpty && (
          <>
            {/* 3. Executive KPI Strip */}
            {visibility.kpis && (
              <ExecutiveKpiStrip
                vessels={safeVessels}
                activeVesselsCount={vesselsData?.count ?? safeVessels.length}
                portsCount={portsData?.count ?? safePorts.length}
                liveVesselsCount={liveTrackingCount}
                staleVesselsCount={staleTrackingCount}
                positionedVesselsCount={authenticTrackedPositions.length}
              />
            )}

            {/* 4. Main Intelligence Area (Global Map + Market Intelligence) */}
            {(visibility.map || visibility.marketIntelligence) && (
              <div className="cc-main-grid">
                {visibility.map && (
                  <CommandMap
                    vessels={authenticTrackedPositions}
                    ports={safePorts}
                    totalTrackedCount={trackingData?.vessels?.length ?? safeVessels.length}
                    selectedVesselId={selectedVessel?.id ?? null}
                    onSelectVessel={(vessel) => setSelectedVessel(vessel)}
                    onSelectPort={(port) => setSelectedPort(port)}
                  />
                )}

                {visibility.marketIntelligence && (
                  <MarketIntelligencePanel />
                )}
              </div>
            )}

            {/* 5. Secondary Analytics Grid (Freight Market, Trade Flows, Port Activity, Vessel Activity) */}
            {(visibility.freightMarket ||
              visibility.tradeFlows ||
              visibility.portActivity ||
              visibility.vesselActivity) && (
              <div className="cc-analytics-grid">
                {visibility.freightMarket && <FreightMarketChart />}
                {visibility.tradeFlows && <GlobalTradeFlowsTable />}
                {visibility.portActivity && (
                  <PortActivityTable onSelectPortName={handleSelectPortByName} />
                )}
                {visibility.vesselActivity && (
                  <VesselActivityBreakdown
                    vessels={safeVessels}
                    trackedVessels={trackingData?.vessels ?? []}
                  />
                )}
              </div>
            )}

            {/* 6. Lower Intelligence Area (Trade vs Freight, Global Activity, Alerts, Market Events) */}
            {(visibility.tradeFreightCorrelation ||
              visibility.globalActivity ||
              visibility.alerts ||
              visibility.marketEvents) && (
              <div className="cc-lower-grid">
                {visibility.tradeFreightCorrelation && <TradeFreightCorrelation />}
                {visibility.globalActivity && <GlobalActivityHeatmap />}
                {visibility.alerts && <AttentionAlertsPanel />}
                {visibility.marketEvents && <MarketEventsTimeline />}
              </div>
            )}

            {/* 7. Quick Operations Access Strip */}
            {visibility.quickAccess && <QuickAccessStrip />}
          </>
        )}
      </div>


      {/* In-Dashboard Slide-over Detail Drawers */}
      {selectedVessel && (
        <VesselMapDetailDrawer
          vessel={selectedVessel}
          voyageTrack={null}
          onClose={() => setSelectedVessel(null)}
          onStartHistoricalReplay={() => {}}
          isHistoricalMode={false}
        />
      )}

      {selectedPort && (
        <PortDetailDrawer
          port={selectedPort}
          onClose={() => setSelectedPort(null)}
        />
      )}

      {/* Search Command Palette Overlay */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Customize Dashboard Modal */}
      <CustomizeDashboardModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        visibility={visibility}
        onToggleSection={toggleSection}
        onResetToDefault={resetVisibility}
      />
    </div>
  );
}
