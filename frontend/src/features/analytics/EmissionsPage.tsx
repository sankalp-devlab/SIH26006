/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 21 — EMISSIONS INTELLIGENCE & CARBON ANALYTICS PLATFORM
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import {
  Activity,
  Compass,
  GitCompare,
  Layers,
  Route,
  ShieldCheck,
  TrendingUp,
  Flame,
  Wind,
  Award,
  DollarSign,
  Gauge,
} from 'lucide-react';

import { useEmissions, type EmissionsTabType } from '../../hooks/useEmissions';
import { EmissionsService } from '../../services/emissions/emissions.service';

import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  ErrorState,
} from '../../components/intelligence';

import { EmissionsInsightsPanel } from './emissions/components/EmissionsInsightsPanel';
import { EmissionsTrendChart } from './emissions/components/EmissionsTrendChart';
import { EmissionsVesselTable } from './emissions/components/EmissionsVesselTable';
import { EmissionsVesselDrawer } from './emissions/components/EmissionsVesselDrawer';
import { VoyageEmissionsSection } from './emissions/components/VoyageEmissionsSection';
import { LegEmissionsSection } from './emissions/components/LegEmissionsSection';
import { OperationalStateChart } from './emissions/components/OperationalStateChart';
import { FleetComparisonMatrix } from './emissions/components/FleetComparisonMatrix';
import { VesselComparisonModal } from './emissions/components/VesselComparisonModal';
import { IndustryBenchmarkCard } from './emissions/components/IndustryBenchmarkCard';
import { CiiTrajectorySection } from './emissions/components/CiiTrajectorySection';
import { EmissionsAnomalyFeed } from './emissions/components/EmissionsAnomalyFeed';
import { EmissionsMapCanvas } from './emissions/components/EmissionsMapCanvas';

export default function EmissionsPage() {
  const {
    activeTab,
    setActiveTab,
    filters,
    setSearchQuery,
    setTimeHorizon,
    setTimeAggregation,
    setMetric,
    setFleetFilter,
    setVesselClassFilter,
    setRegionFilter,
    setScopeFilter,
    resetFilters,
    selectedVesselId,
    selectVessel,
    selectedVessel,
    isVesselDrawerOpen,
    setIsVesselDrawerOpen,
    selectedVoyageId,
    selectVoyage,
    comparisonVesselIds,
    toggleComparisonVessel,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    payload,
    filteredVessels,
    filteredVoyages,
    filteredLegs,
    filteredAnomalies,
    summary,
    comparisonResult,
    operationsSummary,
    insights,
    historicalTrend,
    isLoading,
    isError,
    refetch,
    handleExportVesselsCsv,
    handleExportVoyagesCsv,
    handleExportReportJson,
  } = useEmissions();

  const availableFleets = useMemo(() => EmissionsService.getAvailableFleets(), []);
  const availableVesselClasses = useMemo(() => EmissionsService.getAvailableVesselClasses(), []);
  const availableRegions = useMemo(() => EmissionsService.getAvailableRegions(), []);

  const tabs: { id: EmissionsTabType; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'overview', label: 'Overview & Trends', icon: TrendingUp },
    { id: 'vessels', label: 'Vessels Registry', icon: Layers },
    { id: 'voyages', label: 'Voyages & Legs', icon: Route },
    { id: 'operations', label: 'Operations & States', icon: Activity },
    { id: 'cii', label: 'CII & Regulatory', icon: ShieldCheck },
    { id: 'comparison', label: 'Fleet & Benchmark', icon: GitCompare },
    { id: 'map', label: 'Geospatial Map', icon: Compass },
  ];

  const commandBarFilters = useMemo(() => [
    {
      id: 'scope',
      label: 'Scope',
      value: filters.scope,
      options: [
        { value: 'tank_to_wake', label: 'Tank-to-Wake' },
        { value: 'well_to_wake', label: 'Well-to-Wake' },
        { value: 'eu_ets', label: 'EU ETS Scope' },
      ],
      onChange: (val: string) => setScopeFilter(val as any),
    },
    {
      id: 'fleet',
      label: 'Fleet',
      value: filters.fleet,
      options: availableFleets.map((f) => ({ value: f.id, label: f.name })),
      onChange: (val: string) => setFleetFilter(val),
    },
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: availableVesselClasses.map((vc) => ({ value: vc, label: vc === 'all' ? 'All Classes' : vc })),
      onChange: (val: string) => setVesselClassFilter(val),
    },
    {
      id: 'region',
      label: 'Region',
      value: filters.region,
      options: availableRegions.map((r) => ({ value: r, label: r === 'all' ? 'All Regions' : r })),
      onChange: (val: string) => setRegionFilter(val),
    },
  ], [filters.scope, filters.fleet, filters.vesselClass, filters.region, availableFleets, availableVesselClasses, availableRegions, setScopeFilter, setFleetFilter, setVesselClassFilter, setRegionFilter]);

  const hasActiveFilters =
    filters.fleet !== 'all' ||
    filters.vesselClass !== 'all' ||
    filters.vesselId !== 'all' ||
    filters.region !== 'all' ||
    filters.operationalState !== 'all' ||
    Boolean(filters.search);

  return (
    <div className="oceanlens-master-container">
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M21"
        eyebrow="EMISSION & CII INTELLIGENCE"
        title="Emission Intelligence"
        subtitle="Fleet environmental telemetry, IMO carbon intensity indicator (CII) trajectory, EU ETS carbon financial liability and voyage emissions."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={handleExportVesselsCsv}
        actions={[
          {
            label: `Compare Vessels (${comparisonVesselIds.length})`,
            icon: GitCompare,
            onClick: () => setIsCompareModalOpen(true),
            variant: 'secondary',
          },
          {
            label: 'Export Voyages',
            onClick: handleExportVoyagesCsv,
            variant: 'secondary',
          },
          {
            label: 'Report JSON',
            onClick: handleExportReportJson,
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.search}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vessels by name, IMO, flag..."
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setTimeHorizon(r.toLowerCase() as any)}
        timeRangeOptions={['7D', '30D', '90D', '1Y', 'ALL']}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={filteredVessels.length}
        resultsLabel="vessels evaluated"
      />

      {/* Notice/Error */}
      {isError && (
        <ErrorState
          title="Environmental Telemetry Notice"
          message="Live Signal Ocean API synchronization timed out. Actively running on canonical baseline environmental model."
          onRetry={() => { void refetch(); }}
          isRetrying={isLoading}
        />
      )}

      {/* 3. Standardized 5-Pillar Environmental KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Gross Fleet CO₂"
          metric={summary?.totalCo2Mt ? `${Math.round(summary.totalCo2Mt).toLocaleString()} t` : 'Unavailable'}
          icon={Flame}
          delta={summary?.co2DeltaPct !== undefined ? `${summary.co2DeltaPct > 0 ? '+' : ''}${summary.co2DeltaPct.toFixed(1)}%` : undefined}
          deltaDirection={summary && summary.co2DeltaPct <= 0 ? 'up' : 'down'}
          deltaLabel="vs baseline"
          subtext="Total exhaust carbon"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Average CII Rating"
          metric={summary?.fleetCiiRating ? `Grade ${summary.fleetCiiRating}` : 'Unavailable'}
          icon={Award}
          badge={summary?.fleetCiiRating}
          badgeColor={summary?.fleetCiiRating === 'A' || summary?.fleetCiiRating === 'B' ? 'green' : summary?.fleetCiiRating === 'C' ? 'cyan' : 'amber'}
          subtext="Fleet operational band"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Fuel Consumed"
          metric={summary?.totalFuelConsumedMt ? `${Math.round(summary.totalFuelConsumedMt).toLocaleString()} t` : 'Unavailable'}
          icon={Wind}
          delta={summary?.aerDeltaPct !== undefined ? `${summary.aerDeltaPct > 0 ? '+' : ''}${summary.aerDeltaPct.toFixed(1)}%` : undefined}
          deltaDirection={summary && summary.aerDeltaPct <= 0 ? 'up' : 'down'}
          deltaLabel="vs prior"
          subtext="HFO / VLSFO / MGO total"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="EU ETS Liability"
          metric={summary?.totalCo2Mt ? `$${((summary.totalCo2Mt * 0.5 * 85) / 1e6).toFixed(2)}M` : 'Unavailable'}
          icon={DollarSign}
          delta={summary?.totalCo2Mt ? `${Math.round(summary.totalCo2Mt * 0.5).toLocaleString()} t EUA` : undefined}
          deltaDirection="neutral"
          subtext="Surrender obligation"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Average AER Intensity"
          metric={summary?.avgAer ? `${summary.avgAer.toFixed(2)}` : 'Unavailable'}
          icon={Gauge}
          delta="gCO₂/dwt-nm"
          deltaDirection="neutral"
          subtext="Annual Efficiency Ratio"
          isLoading={isLoading}
        />
      </IntelligenceKpiGrid>

      {/* 4. Strategic Analytical Insights Panel */}
      <div style={{ marginBottom: '24px' }}>
        <EmissionsInsightsPanel insights={insights} />
      </div>

      {/* 5. Navigation View Tabs */}
      <IntelligenceTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightElement={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ol-green)' }} />
            <span>IMO DCS & EU MRV Rules Active</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {/* Tab 1: Overview & Trends */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <EmissionsTrendChart
              trendPoints={historicalTrend}
              selectedMetric={filters.metric}
              onMetricChange={setMetric}
              aggregation={filters.timeAggregation}
              onAggregationChange={setTimeAggregation}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              <OperationalStateChart operationsSummary={operationsSummary} />
              <IndustryBenchmarkCard
                selectedVessel={selectedVessel}
                classBenchmarks={payload.classBenchmarks}
              />
            </div>

            <EmissionsAnomalyFeed
              anomalies={filteredAnomalies}
              onSelectVessel={(vesselId) => {
                selectVessel(vesselId);
                setIsVesselDrawerOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 2: Vessels Registry Table */}
        {activeTab === 'vessels' && (
          <EmissionsVesselTable
            vessels={filteredVessels}
            selectedVesselId={selectedVesselId}
            onSelectVessel={(id) => {
              selectVessel(id);
              setIsVesselDrawerOpen(true);
            }}
            comparisonVesselIds={comparisonVesselIds}
            onToggleComparison={toggleComparisonVessel}
            onOpenCompareModal={() => setIsCompareModalOpen(true)}
          />
        )}

        {/* Tab 3: Voyages & Legs */}
        {activeTab === 'voyages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <VoyageEmissionsSection
              voyages={filteredVoyages}
              selectedVoyageId={selectedVoyageId}
              onSelectVoyage={selectVoyage}
            />
            <LegEmissionsSection legs={filteredLegs} />
          </div>
        )}

        {/* Tab 4: Operations & States */}
        {activeTab === 'operations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <OperationalStateChart operationsSummary={operationsSummary} />
            <EmissionsAnomalyFeed
              anomalies={filteredAnomalies}
              onSelectVessel={(id) => {
                selectVessel(id);
                setIsVesselDrawerOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 5: CII & Regulatory */}
        {activeTab === 'cii' && (
          <CiiTrajectorySection
            vessels={filteredVessels}
            onSelectVessel={(id) => {
              selectVessel(id);
              setIsVesselDrawerOpen(true);
            }}
          />
        )}

        {/* Tab 6: Fleet Comparison & Benchmark */}
        {activeTab === 'comparison' && (
          <FleetComparisonMatrix
            fleetBenchmarks={payload.fleetBenchmarks}
          />
        )}

        {/* Tab 7: Geospatial Map */}
        {activeTab === 'map' && (
          <EmissionsMapCanvas
            vessels={filteredVessels}
            voyages={filteredVoyages}
            selectedVesselId={selectedVesselId}
            onSelectVessel={(id) => {
              selectVessel(id);
              setIsVesselDrawerOpen(true);
            }}
            onSelectVoyage={selectVoyage}
          />
        )}
      </div>

      {/* Slide-out Vessel Detail Drawer */}
      <EmissionsVesselDrawer
        isOpen={isVesselDrawerOpen}
        onClose={() => setIsVesselDrawerOpen(false)}
        vessel={selectedVessel}
        voyages={filteredVoyages}
        legs={filteredLegs}
      />

      {/* 5-Vessel Comparison Modal */}
      <VesselComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparisonResult={comparisonResult}
        onRemoveVessel={toggleComparisonVessel}
        onClearAll={clearComparison}
      />
    </div>
  );
}
