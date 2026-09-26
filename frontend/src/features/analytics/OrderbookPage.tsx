/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook & Fleet Growth Intelligence Workspace Page
 * Dedicated analytical workspace covering Newbuildings, Deliveries, Demolitions, Shipyards, and Historical Comparisons.
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import { useOrderbook } from '../../hooks/useOrderbook';
import {
  TrendingUp,
  ClipboardList,
  CalendarClock,
  Trash2,
  Building2,
  History,
  Ship,
  Hammer,
  Percent,
  Calendar,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  ErrorState,
} from '../../components/intelligence';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import { FleetGrowthTab } from './orderbook/components/FleetGrowthTab';
import { OrdersRegistryTab } from './orderbook/components/OrdersRegistryTab';
import { DeliveriesScheduleTab } from './orderbook/components/DeliveriesScheduleTab';
import { DemolitionsTab } from './orderbook/components/DemolitionsTab';
import { ShipyardsTab } from './orderbook/components/ShipyardsTab';
import { HistoricalComparisonTab } from './orderbook/components/HistoricalComparisonTab';
import { OrderDetailDrawer } from './orderbook/components/OrderDetailDrawer';
import type { OrderbookTab } from '../../types/orderbook';

const TABS: { id: OrderbookTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'growth', label: 'Fleet Growth Trajectory', icon: TrendingUp },
  { id: 'orders', label: 'Orders Registry', icon: ClipboardList },
  { id: 'deliveries', label: 'Delivery Schedule', icon: CalendarClock },
  { id: 'demolitions', label: 'Demolitions & Scrapping', icon: Trash2 },
  { id: 'shipyards', label: 'Shipyard Intelligence', icon: Building2 },
  { id: 'comparison', label: 'Historical Comparison', icon: History },
];

export default function OrderbookPage() {
  const {
    orders,
    deliveries,
    demolitions,
    shipyards,
    historicalComparison,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    setFilter,
    resetFilters,
    activeTab,
    setActiveTab,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,
    availableVesselClasses,
    availableShipyardCountries,
    availablePropulsionTypes,
    summary,
    fleetGrowthSeries,
    vesselClassBreakdown,
    deliveryTimeline,
    exportCsv,
  } = useOrderbook();

  const commandBarFilters = useMemo(() => [
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        ...availableVesselClasses.map((vc) => ({ value: vc, label: vc })),
      ],
      onChange: (val: string) => setFilter('vesselClass', val),
    },
    {
      id: 'shipyardCountry',
      label: 'Shipyard Country',
      value: filters.shipyardCountry,
      options: [
        { value: 'all', label: 'All Shipyard Nations' },
        ...availableShipyardCountries.map((sc) => ({ value: sc, label: sc })),
      ],
      onChange: (val: string) => setFilter('shipyardCountry', val),
    },
    {
      id: 'propulsionType',
      label: 'Propulsion Type',
      value: filters.propulsionType,
      options: [
        { value: 'all', label: 'All Propulsion Types' },
        ...availablePropulsionTypes.map((pt) => ({ value: pt, label: pt })),
      ],
      onChange: (val: string) => setFilter('propulsionType', val),
    },
  ], [filters.vesselClass, filters.shipyardCountry, filters.propulsionType, availableVesselClasses, availableShipyardCountries, availablePropulsionTypes, setFilter]);

  const hasActiveFilters =
    filters.vesselClass !== 'all' ||
    filters.shipyardCountry !== 'all' ||
    filters.propulsionType !== 'all' ||
    Boolean(filters.searchQuery);

  return (
    <div className="oceanlens-master-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="commercial" />
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M17"
        eyebrow="ORDER BOOK & NEWBUILD INTELLIGENCE"
        title="Order Book"
        subtitle="Global shipyard orderbook contracts, forward fleet growth trajectories, delivery timelines and demolition scrapping forecasts."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={exportCsv}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilter('searchQuery', q)}
        searchPlaceholder="Filter by vessel name, shipyard, owner, hull..."
        filters={commandBarFilters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={orders.length}
        resultsLabel="orders on orderbook"
      />

      {/* 3. Error Notification Banner */}
      {isError && (
        <ErrorState
          title="Shipbuilding Telemetry Interrupted"
          message={error instanceof Error ? error.message : 'Failed to retrieve shipbuilding orderbook pipeline.'}
          onRetry={() => { void refetch(); }}
          isRetrying={isLoading}
        />
      )}

      {/* 4. Standardized 5-Pillar Orderbook KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Total Orderbook DWT"
          metric={summary?.orderbook_dwt_formatted || 'Unavailable'}
          icon={Ship}
          delta={summary?.orderbook_vessels ? `${summary.orderbook_vessels} ships` : undefined}
          deltaDirection="neutral"
          deltaLabel="active contracts"
          subtext="Confirmed Yard Contracts"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Orderbook % Fleet"
          metric={summary?.orderbook_to_fleet_pct !== undefined ? `${summary.orderbook_to_fleet_pct.toFixed(1)}%` : 'Unavailable'}
          icon={Percent}
          delta={summary && summary.orderbook_to_fleet_pct > 12 ? 'Elevated' : 'Moderate'}
          deltaDirection={summary && summary.orderbook_to_fleet_pct > 12 ? 'up' : 'neutral'}
          subtext="Orderbook to Active Fleet Ratio"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Scheduled 12M Deliveries"
          metric={summary?.scheduled_deliveries_next_12m_count !== undefined ? `${summary.scheduled_deliveries_next_12m_count} ships` : 'Unavailable'}
          icon={Calendar}
          delta={summary?.scheduled_deliveries_next_12m_dwt ? `${(summary.scheduled_deliveries_next_12m_dwt / 1e6).toFixed(1)}M DWT` : undefined}
          deltaDirection="neutral"
          subtext="Forward Projected Deliveries"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Demolitions (Past 12M)"
          metric={summary?.demolitions_past_12m_count !== undefined ? `${summary.demolitions_past_12m_count} ships` : 'Unavailable'}
          icon={Trash2}
          delta={summary?.demolitions_past_12m_dwt ? `${(summary.demolitions_past_12m_dwt / 1e6).toFixed(1)}M DWT` : undefined}
          deltaDirection="down"
          subtext="Reported Yard Scrapping Volume"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Top Shipyard Group"
          metric={summary?.top_shipyard_group || 'Unavailable'}
          icon={Hammer}
          delta={summary?.top_shipyard_market_share ? `${summary.top_shipyard_market_share.toFixed(1)}% share` : undefined}
          deltaDirection="neutral"
          subtext="Contract Market Share Leader"
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
            <span>Global Shipyard Feeds Live</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {activeTab === 'growth' && (
          <FleetGrowthTab
            growthSeries={fleetGrowthSeries}
            vesselClassBreakdown={vesselClassBreakdown}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersRegistryTab
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
          />
        )}

        {activeTab === 'deliveries' && (
          <DeliveriesScheduleTab
            deliveries={deliveries}
            deliveryTimeline={deliveryTimeline}
          />
        )}

        {activeTab === 'demolitions' && (
          <DemolitionsTab
            demolitions={demolitions}
          />
        )}

        {activeTab === 'shipyards' && (
          <ShipyardsTab
            shipyards={shipyards}
          />
        )}

        {activeTab === 'comparison' && (
          <HistoricalComparisonTab
            comparisonData={historicalComparison}
          />
        )}
      </div>

      {/* Order Specification Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
