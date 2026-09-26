/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Maritime Waypoints & Geographic Chokepoints Intelligence Workspace
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo, useState } from 'react';
import {
  Map,
  Activity,
  TrendingUp,
  Clock,
  GitCompare,
  Compass,
  Ship,
  Anchor,
  ShieldAlert,
} from 'lucide-react';

import { useWaypoints } from '../../hooks/useWaypoints';
import { WaypointsService } from '../../services/waypoints/waypoints.service';
import type { WaypointsTab } from '../../types/waypoints';

import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  ErrorState,
} from '../../components/intelligence';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

import { WaypointMapCanvas } from './waypoints/components/WaypointMapCanvas';
import { WaypointActivityTab } from './waypoints/components/WaypointActivityTab';
import { WaypointTrendsTab } from './waypoints/components/WaypointTrendsTab';
import { WaypointCongestionTab } from './waypoints/components/WaypointCongestionTab';
import { WaypointTable } from './waypoints/components/WaypointTable';
import { WaypointDetailDrawer } from './waypoints/components/WaypointDetailDrawer';
import { WaypointComparisonModal } from './waypoints/components/WaypointComparisonModal';

const TABS: { id: WaypointsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'overview', label: 'Geographic Workspace', icon: Map },
  { id: 'activity', label: 'Transit Activity', icon: Activity },
  { id: 'trends', label: 'Historical Trends', icon: TrendingUp },
  { id: 'congestion', label: 'Congestion Analytics', icon: Clock },
  { id: 'comparison', label: 'Waypoints Registry & Compare', icon: GitCompare },
];

export default function WaypointsPage() {
  const {
    activeTab,
    setActiveTab,
    filters,
    setModeFilter,
    setVesselClassFilter,
    setRegionFilter,
    setTimeHorizonFilter,
    setCongestionLevelFilter,
    setSearchQuery,
    resetFilters,
    selectedWaypointId,
    selectWaypoint,
    selectedWaypoint,
    selectedActivity,
    selectedHistory,
    comparisonWaypointIds,
    toggleComparisonWaypoint,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    waypoints,
    activities,
    filteredWaypoints,
    summary,
    topTransits,
    topCongestion,
    topWaiting,
    vesselClassBreakdown,
    modeBreakdown,
    comparisonResult,
    handleExportCsv,
    isLoading,
    isError,
    refetch,
  } = useWaypoints();

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const availableRegions = useMemo(() => WaypointsService.getAvailableRegions(), []);
  const availableVesselClasses = useMemo(() => WaypointsService.getAvailableVesselClasses(), []);

  const handleSelectWaypoint = (id: string) => {
    selectWaypoint(id);
    setIsDetailDrawerOpen(true);
  };

  const commandBarFilters = useMemo(() => [
    {
      id: 'mode',
      label: 'Passage Mode',
      value: filters.mode,
      options: [
        { value: 'all', label: 'All Passage Modes' },
        { value: 'tanker', label: 'Tanker Fleet' },
        { value: 'dry', label: 'Dry Bulk' },
        { value: 'lng', label: 'LNG Carriers' },
        { value: 'lpg', label: 'LPG Tankers' },
      ],
      onChange: (val: string) => setModeFilter(val as any),
    },
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        ...availableVesselClasses.map((vc) => ({ value: vc, label: vc })),
      ],
      onChange: (val: string) => setVesselClassFilter(val),
    },
    {
      id: 'region',
      label: 'Region',
      value: filters.region,
      options: [
        { value: 'all', label: 'All Regions' },
        ...availableRegions.map((r) => ({ value: r, label: r })),
      ],
      onChange: (val: string) => setRegionFilter(val),
    },
    {
      id: 'congestion',
      label: 'Congestion',
      value: filters.congestionLevel,
      options: [
        { value: 'all', label: 'All Congestion Levels' },
        { value: 'CRITICAL', label: 'Critical (75+)' },
        { value: 'HIGH', label: 'High Queue (60-74)' },
        { value: 'MODERATE', label: 'Moderate Flow (35-59)' },
        { value: 'LOW', label: 'Nominal Flow (<35)' },
      ],
      onChange: (val: string) => setCongestionLevelFilter(val as any),
    },
  ], [filters.mode, filters.vesselClass, filters.region, filters.congestionLevel, availableVesselClasses, availableRegions, setModeFilter, setVesselClassFilter, setRegionFilter, setCongestionLevelFilter]);

  const hasActiveFilters =
    filters.mode !== 'all' ||
    filters.vesselClass !== 'all' ||
    filters.region !== 'all' ||
    filters.country !== 'all' ||
    filters.waypointType !== 'all' ||
    filters.congestionLevel !== 'all' ||
    Boolean(filters.search);

  return (
    <div className="oceanlens-master-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="voyage" />
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M18"
        eyebrow="WAYPOINT & CHOKEPOINT INTELLIGENCE"
        title="Waypoint"
        subtitle="Global maritime chokepoints, strategic canal transits, waiting anchorage queues, congestion indices and nearby vessel movements."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={handleExportCsv}
        actions={[
          {
            label: `Compare (${comparisonWaypointIds.length})`,
            icon: GitCompare,
            onClick: () => setIsCompareModalOpen(true),
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.search}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search chokepoint by name, waterway, region..."
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setTimeHorizonFilter(r.toLowerCase() as any)}
        timeRangeOptions={['7D', '30D', '90D', '1Y']}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={filteredWaypoints.length}
        resultsLabel={`of ${waypoints.length} chokepoints`}
      />

      {/* Error state if any */}
      {isError && (
        <ErrorState
          title="Chokepoint Telemetry Warning"
          message="Unable to refresh live AIS transits. Showing normalized baseline chokepoint data."
          onRetry={() => { void refetch(); }}
          isRetrying={isLoading}
        />
      )}

      {/* 3. Standardized 5-Pillar Waypoint KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Strategic Chokepoints"
          metric={`${filteredWaypoints.length} Passages`}
          icon={Compass}
          delta={`${summary?.activeChokepointsCount || 0} monitored`}
          deltaDirection="neutral"
          subtext="Canals, straits & cape routes"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="24h Transit Volume"
          metric={summary?.totalTransits24h ? `${summary.totalTransits24h.toLocaleString()} ships` : 'Unavailable'}
          icon={Ship}
          delta={`${summary?.totalVesselsInChokepoints || 0} in zone`}
          deltaDirection="neutral"
          subtext="Active fleet throughput"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Waiting Anchored Fleet"
          metric={summary?.totalWaitingVessels !== undefined ? `${summary.totalWaitingVessels} vessels` : 'Unavailable'}
          icon={Clock}
          delta="Queued at approaches"
          deltaDirection="neutral"
          subtext="Fleet queue waiting count"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Primary Bottleneck"
          metric={summary?.topBottleneckName || 'Unavailable'}
          icon={Anchor}
          delta={summary ? `Index ${summary.globalCongestionIndex}/100` : undefined}
          deltaDirection={summary && summary.globalCongestionIndex >= 50 ? 'down' : 'neutral'}
          badge={summary && summary.globalCongestionIndex >= 70 ? 'Severe' : 'Active'}
          badgeColor="amber"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Cape Detour Diversion"
          metric={summary?.capeDetourVolumePct !== undefined ? `${summary.capeDetourVolumePct.toFixed(1)}%` : '0.0%'}
          icon={ShieldAlert}
          delta="Cape of Good Hope detour"
          deltaDirection="neutral"
          subtext="Red Sea bypass traffic"
          isLoading={isLoading}
        />
      </IntelligenceKpiGrid>

      {/* 4. Standardized Tabs */}
      <IntelligenceTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightElement={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ol-green)' }} />
            <span>Canal Authority AIS Feeds Active</span>
          </div>
        }
      />

      {/* 5. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {/* Tab 1: Geographic Workspace Map */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WaypointMapCanvas
              waypoints={filteredWaypoints}
              activities={activities}
              selectedWaypointId={selectedWaypointId}
              onSelectWaypoint={handleSelectWaypoint}
            />
            <WaypointTable
              waypoints={filteredWaypoints}
              activities={activities}
              selectedWaypointId={selectedWaypointId}
              onSelectWaypoint={handleSelectWaypoint}
              comparisonIds={comparisonWaypointIds}
              onToggleCompare={toggleComparisonWaypoint}
            />
          </div>
        )}

        {/* Tab 2: Transit Activity */}
        {activeTab === 'activity' && (
          <WaypointActivityTab
            topTransits={topTransits}
            topCongestion={topCongestion}
            vesselClassBreakdown={vesselClassBreakdown}
            modeBreakdown={modeBreakdown}
            onSelectWaypoint={handleSelectWaypoint}
            selectedWaypointId={selectedWaypointId}
          />
        )}

        {/* Tab 3: Historical Trends */}
        {activeTab === 'trends' && (
          <WaypointTrendsTab
            selectedWaypoint={selectedWaypoint}
            history={selectedHistory}
            timeHorizon={filters.timeHorizon}
            onTimeHorizonChange={setTimeHorizonFilter}
          />
        )}

        {/* Tab 4: Congestion Analytics */}
        {activeTab === 'congestion' && (
          <WaypointCongestionTab
            topCongestion={topCongestion}
            topWaiting={topWaiting}
            onSelectWaypoint={handleSelectWaypoint}
            selectedWaypointId={selectedWaypointId}
          />
        )}

        {/* Tab 5: Waypoints Registry & Comparison */}
        {activeTab === 'comparison' && (
          <WaypointTable
            waypoints={filteredWaypoints}
            activities={activities}
            selectedWaypointId={selectedWaypointId}
            onSelectWaypoint={handleSelectWaypoint}
            comparisonIds={comparisonWaypointIds}
            onToggleCompare={toggleComparisonWaypoint}
          />
        )}
      </div>

      {/* Slide-out Waypoint Detail Drawer */}
      <WaypointDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        waypoint={selectedWaypoint}
        activity={selectedActivity}
      />

      {/* Comparison Modal */}
      <WaypointComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparisonResult={comparisonResult}
        allWaypoints={waypoints}
        selectedIds={comparisonWaypointIds}
        onToggleWaypoint={toggleComparisonWaypoint}
        onClear={clearComparison}
      />
    </div>
  );
}
