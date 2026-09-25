/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights & Corridor Intelligence Workspace
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import { useMarketInsights } from '../../hooks/useMarketInsights';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Ship,
  Package,
  DollarSign,
  Anchor,
  Navigation,
  Scale,
  Star,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  ErrorState,
} from '../../components/intelligence';
import { MarketSignalsCard } from './market/components/MarketSignalsCard';
import { MarketOverviewTab } from './market/components/MarketOverviewTab';
import { MarketSupplyTab } from './market/components/MarketSupplyTab';
import { MarketDemandTab } from './market/components/MarketDemandTab';
import { MarketFreightTab } from './market/components/MarketFreightTab';
import { MarketCongestionTab } from './market/components/MarketCongestionTab';
import { MarketRoutesTab } from './market/components/MarketRoutesTab';
import { MarketComparisonModal } from './market/components/MarketComparisonModal';
import { MarketWatchlistDrawer } from './market/components/MarketWatchlistDrawer';
import type {
  MarketInsightsTab,
  MarketSector,
  MarketVesselClass,
  MarketTimeHorizon,
} from '../../types/market-insights';

export default function MarketInsightsPage() {
  const {
    filters,
    activeTab,
    availableRoutes,
    hasActiveFilters,
    comparisonOpen,
    comparisonType,
    comparisonTargetA,
    comparisonTargetB,
    watchlistOpen,
    watchlist,

    setFilter,
    resetFilters,
    setActiveTab,
    handleSelectSector,
    handleSelectVesselClass,
    handleSelectRoute,
    openComparison,
    closeComparison,
    setComparisonType,
    setComparisonTargetA,
    setComparisonTargetB,
    setWatchlistOpen,
    handleToggleWatch,
    refetchAll,
    handleExportCsv,

    workspace,
    comparison,
    isLoading,
    isError,
    error,
    isRefetching,
  } = useMarketInsights();

  const tabs: { id: MarketInsightsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'overview', label: 'Market Overview', icon: TrendingUp },
    { id: 'supply', label: 'Supply Analytics', icon: Ship },
    { id: 'demand', label: 'Demand Analytics', icon: Package },
    { id: 'freight', label: 'Freight Analytics', icon: DollarSign },
    { id: 'congestion', label: 'Congestion Signals', icon: Anchor },
    { id: 'routes', label: 'Corridors Matrix', icon: Navigation },
  ];

  // Prepare CommandBar Dropdown Configs
  const commandBarFilters = useMemo(() => [
    {
      id: 'sector',
      label: 'Market Sector',
      value: filters.sector,
      options: [
        { value: 'all', label: 'All Market Sectors' },
        { value: 'dry_bulk', label: 'Dry Bulk' },
        { value: 'crude_tanker', label: 'Crude Tankers' },
        { value: 'product_tanker', label: 'Product Tankers' },
        { value: 'lng', label: 'LNG' },
        { value: 'lpg', label: 'LPG' },
      ],
      onChange: (val: string) => handleSelectSector(val as MarketSector | 'all'),
    },
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        { value: 'Capesize', label: 'Capesize' },
        { value: 'Panamax', label: 'Panamax' },
        { value: 'Supramax', label: 'Supramax' },
        { value: 'VLCC', label: 'VLCC' },
        { value: 'Suezmax', label: 'Suezmax' },
        { value: 'Aframax', label: 'Aframax' },
        { value: 'MR Tanker', label: 'MR Tanker' },
        { value: 'LNG 174k', label: 'LNG 174k' },
      ],
      onChange: (val: string) => handleSelectVesselClass(val as MarketVesselClass),
    },
    {
      id: 'routeCode',
      label: 'Corridor',
      value: filters.routeCode,
      options: availableRoutes.map((r) => ({
        value: r.route_code,
        label: `${r.route_code} — ${r.route_name}`,
      })),
      onChange: (val: string) => handleSelectRoute(val),
    },
  ], [filters.sector, filters.vesselClass, filters.routeCode, availableRoutes, handleSelectSector, handleSelectVesselClass, handleSelectRoute]);

  const freightDetail = workspace?.selectedRoute?.freight || workspace?.routes[0]?.freight;

  return (
    <div className="mi-dashboard-container oceanlens-master-container">
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M5"
        eyebrow="MARKET INTELLIGENCE"
        title="Market Insights"
        subtitle="Global market movements, corridor benchmarks and commercial signals across dry bulk, liquid energy, and gas sectors."
        onRefresh={refetchAll}
        isRefetching={isRefetching}
        onExportCsv={handleExportCsv}
        actions={[
          {
            label: 'Compare',
            icon: Scale,
            onClick: () => openComparison('route', filters.routeCode, 'C3'),
            variant: 'secondary',
          },
          {
            label: `Watchlist (${watchlist.length})`,
            icon: Star,
            onClick: () => setWatchlistOpen(true),
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setFilter('timeHorizon', r.toLowerCase() as MarketTimeHorizon)}
        timeRangeOptions={['TODAY', '7D', '30D', '90D', '1Y']}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={availableRoutes.length}
        resultsLabel="corridors tracked"
      />

      {/* Section 1: Market Snapshot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ol-cyan, #00D4FF)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          1. Market Snapshot • Macro Supply, Demand & Congestion Status
        </span>
      </div>

      {/* 3. Standardized 5-Pillar Commercial KPI Grid */}
      <div className="mi-kpi-grid">
        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Fleet Supply</span>
            <div className="mi-kpi-icon-wrap"><Ship size={16} /></div>
          </div>
          <div className="mi-kpi-metric">
            {isLoading ? '...' : workspace?.supply?.total_fleet_vessels ? `${workspace.supply.total_fleet_vessels.toLocaleString()} ships` : 'Unavailable'}
          </div>
          <div className="mi-kpi-bottom">
            {workspace?.supply?.fleet_utilization_pct !== undefined ? (
              <span className={`mi-kpi-delta ${workspace.supply.fleet_utilization_pct > 85 ? 'up' : 'neutral'}`}>
                <TrendingUp size={12} />
                <span>{workspace.supply.fleet_utilization_pct}%</span>
                <span style={{ color: 'var(--ol-text-muted, #7189A3)', fontWeight: 500, fontSize: '10px' }}>util</span>
              </span>
            ) : null}
            <span className="mi-kpi-subtext">Active fleet operational</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Cargo Demand</span>
            <div className="mi-kpi-icon-wrap"><Package size={16} /></div>
          </div>
          <div className="mi-kpi-metric">
            {isLoading ? '...' : workspace?.demand?.total_cargo_demand_mt ? `${workspace.demand.total_cargo_demand_mt.toFixed(1)} Mt` : 'Unavailable'}
          </div>
          <div className="mi-kpi-bottom">
            {workspace?.demand?.demand_change_pct !== undefined ? (
              <span className={`mi-kpi-delta ${workspace.demand.demand_change_pct >= 0 ? 'up' : 'down'}`}>
                {workspace.demand.demand_change_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{workspace.demand.demand_change_pct > 0 ? '+' : ''}{workspace.demand.demand_change_pct}%</span>
                <span style={{ color: 'var(--ol-text-muted, #7189A3)', fontWeight: 500, fontSize: '10px' }}>YoY</span>
              </span>
            ) : null}
            <span className="mi-kpi-subtext">Monthly volume throughput</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Corridor Freight</span>
            <div className="mi-kpi-icon-wrap"><DollarSign size={16} /></div>
          </div>
          <div className="mi-kpi-metric">
            {isLoading ? '...' : freightDetail?.current_rate ? `$${freightDetail.current_rate.toLocaleString()}/d` : 'Unavailable'}
          </div>
          <div className="mi-kpi-bottom">
            {freightDetail?.change_1d_pct !== undefined ? (
              <span className={`mi-kpi-delta ${freightDetail.change_1d_pct >= 0 ? 'up' : 'down'}`}>
                {freightDetail.change_1d_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{freightDetail.change_1d_pct > 0 ? '+' : ''}{freightDetail.change_1d_pct}%</span>
                <span style={{ color: 'var(--ol-text-muted, #7189A3)', fontWeight: 500, fontSize: '10px' }}>24h</span>
              </span>
            ) : null}
            <span className="mi-kpi-subtext">{freightDetail ? `${freightDetail.route_code} benchmark` : 'Selected route'}</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Port Congestion</span>
            <div className="mi-kpi-icon-wrap"><Anchor size={16} /></div>
          </div>
          <div className="mi-kpi-metric">
            {isLoading ? '...' : workspace?.congestion?.avg_waiting_time_hours ? `${(workspace.congestion.avg_waiting_time_hours / 24).toFixed(1)} days` : 'Unavailable'}
          </div>
          <div className="mi-kpi-bottom">
            {workspace?.congestion?.global_congestion_index_pct !== undefined ? (
              <span className={`mi-kpi-delta ${workspace.congestion.global_congestion_index_pct > 60 ? 'down' : 'up'}`}>
                <span>Index {workspace.congestion.global_congestion_index_pct}%</span>
              </span>
            ) : null}
            <span className="mi-kpi-subtext">Hub waiting duration</span>
          </div>
        </div>

        <div className="mi-kpi-card">
          <div className="mi-kpi-top">
            <span className="mi-kpi-label">Fleet Availability</span>
            <div className="mi-kpi-icon-wrap"><Navigation size={16} /></div>
          </div>
          <div className="mi-kpi-metric">
            {isLoading ? '...' : workspace?.availability?.open_prompt !== undefined ? `${workspace.availability.open_prompt} prompt` : 'Unavailable'}
          </div>
          <div className="mi-kpi-bottom">
            {workspace?.availability?.ballast_en_route !== undefined ? (
              <span className="mi-kpi-delta neutral">
                <span>{workspace.availability.ballast_en_route} ballast</span>
              </span>
            ) : null}
            <span className="mi-kpi-subtext">Open position ratio</span>
          </div>
        </div>
      </div>

      {/* Section 2: Market Drivers & Catalysts */}
      {workspace?.signals && (
        <div style={{ marginBottom: '24px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ol-cyan, #00D4FF)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              2. Market Drivers & Catalysts (Why Rates & Supply Move)
            </span>
          </div>
          <MarketSignalsCard
            signals={workspace.signals}
            onNavigateTab={setActiveTab}
          />
        </div>
      )}

      {/* Section 3: Key Movements & Corridor Intelligence */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--ol-cyan, #00D4FF)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          3. Key Movements & Corridor Workspaces (What To Watch)
        </span>
      </div>

      {/* 5. Market Analytics Navigation Tabs */}
      <div className="mi-tabs-container">
        <div className="mi-tabs-nav">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mi-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Notification */}
      {isError && (
        <ErrorState
          title="Market Telemetry Notice"
          message={error instanceof Error ? error.message : 'Unable to reach live market telemetry stream. Showing normalized baseline assessments.'}
          onRetry={refetchAll}
          isRetrying={isRefetching}
        />
      )}

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <MarketOverviewTab
            routes={workspace?.routes || []}
            supply={workspace?.supply}
            demand={workspace?.demand}
            congestion={workspace?.congestion}
            selectedRouteCode={filters.routeCode}
            onSelectRoute={handleSelectRoute}
            onOpenComparison={openComparison}
          />
        )}

        {activeTab === 'supply' && (
          <MarketSupplyTab
            supply={workspace?.supply}
            availability={workspace?.availability}
            onOpenComparison={(type, a, b) => openComparison(type, a, b)}
          />
        )}

        {activeTab === 'demand' && (
          <MarketDemandTab
            demand={workspace?.demand}
          />
        )}

        {activeTab === 'freight' && (
          <MarketFreightTab
            routes={workspace?.routes || []}
            selectedRoute={workspace?.selectedRoute || null}
            onSelectRoute={handleSelectRoute}
            onOpenComparison={(type, a, b) => openComparison(type, a, b)}
          />
        )}

        {activeTab === 'congestion' && (
          <MarketCongestionTab
            congestion={workspace?.congestion}
          />
        )}

        {activeTab === 'routes' && (
          <MarketRoutesTab
            routes={workspace?.routes || []}
            selectedRouteCode={filters.routeCode}
            onSelectRoute={handleSelectRoute}
            onOpenComparison={(type, a, b) => openComparison(type, a, b)}
          />
        )}
      </div>

      {/* Multi-Entity Comparison Modal */}
      <MarketComparisonModal
        isOpen={comparisonOpen}
        onClose={closeComparison}
        comparison={comparison}
        comparisonType={comparisonType}
        targetA={comparisonTargetA}
        targetB={comparisonTargetB}
        routes={workspace?.routes || []}
        onTypeChange={setComparisonType}
        onTargetAChange={setComparisonTargetA}
        onTargetBChange={setComparisonTargetB}
      />

      {/* Watchlist Drawer */}
      <MarketWatchlistDrawer
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectRoute={handleSelectRoute}
        onRemoveItem={(code) => handleToggleWatch(code)}
      />
    </div>
  );
}
