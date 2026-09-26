/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows & Commodity Movements Workspace Page
 * Dedicated analytical workspace for Tanker, Dry Bulk, LNG, and LPG trade flows.
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import { useTradeFlows } from '../../hooks/useTradeFlows';
import {
  Map,
  BarChart2,
  TrendingUp,
  Grid,
  Layers,
  List,
  Weight,
  GitCommit,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  EmptyState,
  ErrorState,
} from '../../components/intelligence';
import { FlowMapCanvas } from './flows/components/FlowMapCanvas';
import { FlowVolumeTab } from './flows/components/FlowVolumeTab';
import { FlowHistoricalTrendTab } from './flows/components/FlowHistoricalTrendTab';
import { FlowODMatrixTab } from './flows/components/FlowODMatrixTab';
import { FlowCommodityMovementTab } from './flows/components/FlowCommodityMovementTab';
import { FlowCorridorsTab } from './flows/components/FlowCorridorsTab';
import { FlowDetailDrawer } from './flows/components/FlowDetailDrawer';
import type { FlowsTab } from '../../types/trade-flows';

const TABS: { id: FlowsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'map', label: 'Flow Map & Routes', icon: Map },
  { id: 'volume', label: 'Volume Analytics', icon: BarChart2 },
  { id: 'trends', label: 'Historical Trends', icon: TrendingUp },
  { id: 'od_matrix', label: 'OD Matrix Heatmap', icon: Grid },
  { id: 'commodity', label: 'Commodity Dynamics', icon: Layers },
  { id: 'corridors', label: 'Corridors Catalog', icon: List },
];

export default function FlowsPage() {
  const {
    flows,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    setFilter,
    resetFilters,
    activeTab,
    setActiveTab,
    selectedFlowId,
    selectedFlow,
    setSelectedFlowId,
    odMatrixGroupBy,
    setOdMatrixGroupBy,
    summary,
    availableCommodities,
    availableVesselClasses,
    availableCountries,
    availableRegions,
    odMatrix,
    mapSegments,
    volumeBreakdowns,
    historicalTrend,
  } = useTradeFlows();

  // Command Bar filter dropdowns
  const commandBarFilters = useMemo(() => [
    {
      id: 'commodity',
      label: 'Commodity',
      value: filters.commodity,
      options: [
        { value: 'all', label: 'All Commodities' },
        ...availableCommodities.map((c) => ({ value: c, label: c })),
      ],
      onChange: (val: string) => setFilter('commodity', val),
    },
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        ...availableVesselClasses.map((v) => ({ value: v, label: v })),
      ],
      onChange: (val: string) => setFilter('vesselClass', val),
    },
    {
      id: 'region',
      label: 'Region',
      value: filters.region,
      options: [
        { value: 'all', label: 'All Regions' },
        ...availableRegions.map((r) => ({ value: r, label: r })),
      ],
      onChange: (val: string) => setFilter('region', val),
    },
    {
      id: 'originCountry',
      label: 'Origin',
      value: filters.originCountry,
      options: [
        { value: 'all', label: 'All Origins' },
        ...availableCountries.origins.map((c) => ({ value: c, label: c })),
      ],
      onChange: (val: string) => setFilter('originCountry', val),
    },
    {
      id: 'destinationCountry',
      label: 'Destination',
      value: filters.destinationCountry,
      options: [
        { value: 'all', label: 'All Destinations' },
        ...availableCountries.destinations.map((c) => ({ value: c, label: c })),
      ],
      onChange: (val: string) => setFilter('destinationCountry', val),
    },
  ], [filters.commodity, filters.vesselClass, filters.region, filters.originCountry, filters.destinationCountry, availableCommodities, availableVesselClasses, availableRegions, availableCountries, setFilter]);

  const hasActiveFilters =
    filters.commodity !== 'all' ||
    filters.vesselClass !== 'all' ||
    filters.region !== 'all' ||
    filters.originCountry !== 'all' ||
    filters.destinationCountry !== 'all' ||
    Boolean(filters.searchQuery);

  return (
    <div className="oceanlens-master-container">
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M16"
        eyebrow="GLOBAL TRADE FLOW INTELLIGENCE"
        title="Trade Flows"
        subtitle="Global commodity movements, bilateral trade corridors, ton-mile intensity and commercial vessel deployment."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilter('searchQuery', q)}
        searchPlaceholder="Filter corridors, origins, destinations..."
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setFilter('timeHorizon', r.toLowerCase() as any)}
        timeRangeOptions={['CURRENT', '7D', '30D', '90D', '1Y']}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={flows.length}
        resultsLabel="active corridors"
      />

      {/* 3. Error Notification Banner */}
      {isError && (
        <ErrorState
          title="Trade-Flow Telemetry Notice"
          message={error instanceof Error ? error.message : 'The trade flow service encountered an unexpected network interruption.'}
          onRetry={() => { void refetch(); }}
          isRetrying={isLoading}
        />
      )}

      {/* 4. Standardized 5-Pillar KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Total Flow Volume"
          metric={summary?.total_volume_formatted || 'Unavailable'}
          icon={Weight}
          delta="+3.4%"
          deltaDirection="up"
          deltaLabel="vs prior"
          subtext={`${summary?.active_vessels_sum || 0} active voyages`}
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Active Corridors"
          metric={summary?.active_flows_count?.toString() || '0'}
          icon={GitCommit}
          delta={`${(summary?.origin_ports_count || 0) + (summary?.destination_ports_count || 0)}`}
          deltaDirection="neutral"
          deltaLabel="global hub ports"
          subtext="Bilateral routes"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Average Transit"
          metric={summary?.avg_transit_days ? `${summary.avg_transit_days.toFixed(1)} Days` : 'Unavailable'}
          icon={Clock}
          subtext="Voyage transit duration"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Dominant Route"
          metric={summary?.top_route || 'Unavailable'}
          icon={DollarSign}
          delta={summary?.top_route_volume_mt ? `${(summary.top_route_volume_mt / 1e3).toFixed(1)}k MT` : undefined}
          deltaDirection="neutral"
          deltaLabel="volume"
          subtext="Top volume trade lane"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Dominant Commodity"
          metric={summary?.top_commodity || 'Unavailable'}
          icon={Package}
          delta={summary?.top_commodity_volume_mt ? `${(summary.top_commodity_volume_mt / 1e3).toFixed(1)}k MT` : undefined}
          deltaDirection="neutral"
          deltaLabel="volume"
          subtext="Leading trade cargo"
          isLoading={isLoading}
        />
      </IntelligenceKpiGrid>

      {/* 5. Standardized Tabs */}
      <IntelligenceTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightElement={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ol-green)' }} />
            <span>Corridor Telemetry Live</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {/* Empty state */}
        {!isLoading && !isError && flows.length === 0 && (
          <EmptyState
            title="No Trade-Flow Data Available"
            description="No trade routes or vessel shipments matched the active combination of commodity, country, or route filters."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}

        {/* Tab 1: Flow Map & Routes (Hero Visualization with 5-Domain Corridor Digest) */}
        {activeTab === 'map' && flows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 5-Domain Intelligence Digest: WHERE -> WHAT -> HOW MUCH -> WHICH ROUTE -> WHICH VESSELS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(5, 18, 35, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
              role="region"
              aria-label="Trade Corridor Five-Point Digest"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>1. WHERE (CORRIDOR)</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedFlow ? `${selectedFlow.origin_country} → ${selectedFlow.destination_country}` : 'Global Bilateral Corridors'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {selectedFlow ? `${selectedFlow.origin_port} to ${selectedFlow.destination_port}` : `${summary?.origin_ports_count || 0} origins · ${summary?.destination_ports_count || 0} destinations`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>2. WHAT (CARGO)</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedFlow ? selectedFlow.commodity : (summary?.top_commodity || 'Multi-Commodity')}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {selectedFlow ? selectedFlow.cargo_type : 'Tanker & Dry Bulk Segments'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>3. HOW MUCH (VOLUME)</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                  {selectedFlow ? `${(selectedFlow.current_volume_mt / 1e3).toFixed(1)}k MT` : (summary?.total_volume_formatted || '0 MT')}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {selectedFlow ? `Share: ${selectedFlow.market_share_pct}% of trade lane` : 'Global monthly throughput'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>4. WHICH ROUTE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace' }}>
                  {selectedFlow ? selectedFlow.trade_lane_code : (summary?.top_route || 'Major Corridors')}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {selectedFlow ? `Transit: ~${selectedFlow.transit_days_avg} days` : `Avg: ${summary?.avg_transit_days?.toFixed(1) || 0} days`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>5. WHICH VESSELS</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedFlow ? `${selectedFlow.active_vessels_count} Active Ships` : `${summary?.active_vessels_sum || 0} Ships Active`}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {selectedFlow ? selectedFlow.vessel_classes.join(', ') : 'Capesize, VLCC, Suezmax, LNG'}
                </span>
              </div>
            </div>

            <FlowMapCanvas
              segments={mapSegments}
              selectedFlowId={selectedFlowId}
              onSelectFlow={setSelectedFlowId}
            />
          </div>
        )}

        {/* Tab 2: Volume Analytics */}
        {activeTab === 'volume' && flows.length > 0 && (
          <FlowVolumeTab
            volumeBreakdowns={volumeBreakdowns}
            summary={summary}
          />
        )}

        {/* Tab 3: Historical Trends */}
        {activeTab === 'trends' && flows.length > 0 && (
          <FlowHistoricalTrendTab
            historicalTrend={historicalTrend}
          />
        )}

        {/* Tab 4: OD Matrix Heatmap */}
        {activeTab === 'od_matrix' && flows.length > 0 && (
          <FlowODMatrixTab
            odMatrix={odMatrix}
            groupBy={odMatrixGroupBy}
            onGroupByChange={setOdMatrixGroupBy}
            onSelectFlow={setSelectedFlowId}
          />
        )}

        {/* Tab 5: Commodity Dynamics */}
        {activeTab === 'commodity' && flows.length > 0 && (
          <FlowCommodityMovementTab
            flows={flows}
            activeCommodity={filters.commodity}
            availableCommodities={availableCommodities}
          />
        )}

        {/* Tab 6: Corridors Catalog */}
        {activeTab === 'corridors' && flows.length > 0 && (
          <FlowCorridorsTab
            flows={flows}
            onSelectFlow={setSelectedFlowId}
          />
        )}
      </div>

      {/* Side-panel / Drawer for flow details */}
      <FlowDetailDrawer
        flow={selectedFlow}
        onClose={() => setSelectedFlowId(null)}
      />
    </div>
  );
}
