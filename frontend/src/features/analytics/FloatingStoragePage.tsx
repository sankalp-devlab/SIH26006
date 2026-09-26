/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Floating Storage Intelligence & Analytics Workspace
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFloatingStorage } from '../../hooks/useFloatingStorage';
import {
  Ship,
  Map,
  BarChart2,
  Globe,
  TrendingUp,
  Droplets,
  DollarSign,
  Clock,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  EmptyState,
} from '../../components/intelligence';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import { FloatingStorageMapCanvas } from './floating-storage/components/FloatingStorageMapCanvas';
import { FloatingStorageTable } from './floating-storage/components/FloatingStorageTable';
import { FloatingStorageVolumeTab } from './floating-storage/components/FloatingStorageVolumeTab';
import { FloatingStorageRegionalTab } from './floating-storage/components/FloatingStorageRegionalTab';
import { FloatingStorageHistoricalTab } from './floating-storage/components/FloatingStorageHistoricalTab';
import { FloatingStorageDetailDrawer } from './floating-storage/components/FloatingStorageDetailDrawer';
import type { FloatingStorageTab } from '../../types/floating-storage';

const TABS: { id: FloatingStorageTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'overview', label: 'Overview & Registry', icon: Ship },
  { id: 'map', label: 'Geospatial Map', icon: Map },
  { id: 'volume', label: 'Volume Breakdown', icon: BarChart2 },
  { id: 'regional', label: 'Regional Analysis', icon: Globe },
  { id: 'historical', label: 'Historical Trends', icon: TrendingUp },
];

export default function FloatingStoragePage() {
  const {
    activeTab,
    setActiveTab,
    filters,
    setFilter,
    resetFilters,
    filteredVessels,
    summary,
    regionalAggregations,
    cargoAggregations,
    crudeGradeAggregations,
    vesselClassAggregations,
    trendSeries,
    comparison,
    selectedBenchmarkPeriod,
    setSelectedBenchmarkPeriod,
    selectedVessel,
    selectedVesselId,
    handleSelectVessel,
    isDrawerOpen,
    handleCloseDrawer,
    handleExportCsv,
    isLoading,
    refetch,
  } = useFloatingStorage();

  const vlccCount = useMemo(
    () => filteredVessels.filter((v) => v.vesselClass === 'VLCC').length,
    [filteredVessels]
  );
  const maxDurationDays = useMemo(
    () => (filteredVessels.length ? Math.max(...filteredVessels.map((v) => v.stationaryDays)) : 0),
    [filteredVessels]
  );
  const dominantRegionShare = useMemo(() => {
    if (!summary?.topStorageRegion) return undefined;
    return regionalAggregations.find((r) => r.region === summary.topStorageRegion)?.sharePct;
  }, [summary?.topStorageRegion, regionalAggregations]);

  const commandBarFilters = useMemo(() => [
    {
      id: 'region',
      label: 'Region',
      value: filters.region,
      options: [
        { value: 'all', label: 'All Storage Basins' },
        { value: 'Middle East Gulf', label: 'Middle East Gulf' },
        { value: 'Singapore / Malaysia', label: 'Singapore / Malacca' },
        { value: 'West Africa', label: 'West Africa' },
        { value: 'US Gulf Coast', label: 'US Gulf Coast' },
        { value: 'North Sea & Europe', label: 'North Sea & Europe' },
        { value: 'East Asia', label: 'East Asia' },
      ],
      onChange: (val: string) => setFilter('region', val as any),
    },
    {
      id: 'cargoType',
      label: 'Cargo',
      value: filters.cargoType,
      options: [
        { value: 'all', label: 'All Cargo Types' },
        { value: 'Crude Oil', label: 'Crude Oil' },
        { value: 'Clean Petroleum Products', label: 'Clean Petroleum' },
        { value: 'Dirty Petroleum Products / Fuel Oil', label: 'Dirty Petroleum' },
        { value: 'LNG Gas', label: 'LNG Gas' },
        { value: 'LPG Gas', label: 'LPG Gas' },
        { value: 'Chemicals', label: 'Chemicals' },
      ],
      onChange: (val: string) => setFilter('cargoType', val as any),
    },
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        { value: 'VLCC', label: 'VLCC' },
        { value: 'Suezmax', label: 'Suezmax' },
        { value: 'Aframax', label: 'Aframax' },
        { value: 'MR Product Tanker', label: 'MR Tanker' },
        { value: 'Panamax', label: 'Panamax' },
      ],
      onChange: (val: string) => setFilter('vesselClass', val as any),
    },
  ], [filters.region, filters.cargoType, filters.vesselClass, setFilter]);

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.cargoType !== 'all' ||
    filters.vesselClass !== 'all' ||
    Boolean(filters.search);

  const formatBbl = (val: number): string => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M bbl`;
    return `${(val / 1_000).toFixed(0)}k bbl`;
  };

  const formatUsd = (val: number): string => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${val?.toLocaleString()}`;
  };

  return (
    <div className="fs-dashboard-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="cargo" />
      {/* 0. Top Breadcrumb & Live AIS Telemetry Row */}
      <div className="fs-top-breadcrumb-row">
        <Link to="/analytics" className="fs-back-btn">
          <ArrowLeft size={14} />
          <span>Back to Analytics Hub</span>
        </Link>
        <div className="fs-telemetry-badge">
          <span className="fs-telemetry-pulse" />
          <span>Offshore Satellite AIS Live • Stationary Tanker Telemetry</span>
        </div>
      </div>

      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M20"
        eyebrow="FLOATING STORAGE INTELLIGENCE"
        title="Floating Storage"
        subtitle="Global stationary offshore cargo volumes, immobilized tanker fleet tracking, storage duration analysis and regional crude aggregations."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={handleExportCsv}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.search}
        onSearchChange={(q) => setFilter('search', q)}
        searchPlaceholder="Filter by vessel name, IMO, crude grade, anchorage..."
        filters={commandBarFilters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={filteredVessels.length}
        resultsLabel="immobilized vessels"
      />

      {/* 3. Standardized 5-Pillar Storage KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Storage Vessels"
          metric={summary?.totalVessels ? `${summary.totalVessels} ships` : 'Unavailable'}
          icon={Ship}
          delta={vlccCount ? `${vlccCount} VLCCs` : undefined}
          deltaDirection="neutral"
          deltaLabel="dominant class"
          subtext="Immobilized tanker fleet"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Stored Cargo Volume"
          metric={summary?.totalVolumeBbl ? formatBbl(summary.totalVolumeBbl) : 'Unavailable'}
          icon={Droplets}
          delta={summary?.totalVolumeMt ? `${(summary.totalVolumeMt / 1e6).toFixed(2)}M MT` : undefined}
          deltaDirection="neutral"
          subtext="Liquid crude & products"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Cargo Asset Value"
          metric={summary?.totalImmobilizedValueUsd ? formatUsd(summary.totalImmobilizedValueUsd) : 'Unavailable'}
          icon={DollarSign}
          delta="Brent Benchmark"
          deltaDirection="neutral"
          subtext="Floating inventory value"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Average Duration"
          metric={summary?.averageStationaryDays !== undefined ? `${summary.averageStationaryDays.toFixed(1)} Days` : 'Unavailable'}
          icon={Clock}
          delta={maxDurationDays ? `Max ${maxDurationDays}d` : undefined}
          deltaDirection="neutral"
          subtext="Stationary anchorage time"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Dominant Region"
          metric={
            <span className="fs-kpi-dominant-text">
              {summary?.topStorageRegion || 'Unavailable'}
            </span>
          }
          icon={Compass}
          delta={dominantRegionShare ? `${dominantRegionShare.toFixed(1)}% share` : undefined}
          deltaDirection="neutral"
          subtext="Primary storage hub"
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
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ol-amber, #F59E0B)' }} />
            <span>Offshore Satellite AIS Live</span>
          </div>
        }
      />

      {/* 5. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {filteredVessels.length === 0 && !isLoading && (
          <EmptyState
            title="No Floating Storage Vessels Matched"
            description="No stationary or immobilized tankers met the selected combination of basin, cargo grade, or class filters."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        )}

        {/* Tab 1: Overview & Registry */}
        {activeTab === 'overview' && filteredVessels.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FloatingStorageMapCanvas
              vessels={filteredVessels}
              selectedVesselId={selectedVesselId}
              onSelectVessel={handleSelectVessel}
            />
            <FloatingStorageTable
              vessels={filteredVessels}
              selectedVesselId={selectedVesselId}
              onSelectVessel={handleSelectVessel}
              onResetFilters={resetFilters}
            />
          </div>
        )}

        {/* Tab 2: Map */}
        {activeTab === 'map' && filteredVessels.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FloatingStorageMapCanvas
              vessels={filteredVessels}
              selectedVesselId={selectedVesselId}
              onSelectVessel={handleSelectVessel}
            />
            <FloatingStorageTable
              vessels={filteredVessels}
              selectedVesselId={selectedVesselId}
              onSelectVessel={handleSelectVessel}
              onResetFilters={resetFilters}
            />
          </div>
        )}

        {/* Tab 3: Volume */}
        {activeTab === 'volume' && (
          <FloatingStorageVolumeTab
            trendSeries={trendSeries}
            regionalAggregations={regionalAggregations}
            cargoAggregations={cargoAggregations}
            crudeGradeAggregations={crudeGradeAggregations}
            vesselClassAggregations={vesselClassAggregations}
          />
        )}

        {/* Tab 4: Regional */}
        {activeTab === 'regional' && (
          <FloatingStorageRegionalTab
            regionalAggregations={regionalAggregations}
            onSelectRegionFilter={(reg) => {
              setFilter('region', reg);
              setActiveTab('overview');
            }}
          />
        )}

        {/* Tab 5: Historical Trends */}
        {activeTab === 'historical' && (
          <FloatingStorageHistoricalTab
            comparison={comparison}
            snapshots={trendSeries}
            selectedPeriod={selectedBenchmarkPeriod}
            onSelectPeriod={setSelectedBenchmarkPeriod}
          />
        )}
      </div>

      {/* Slide-out Vessel Detail Drawer */}
      <FloatingStorageDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        vessel={selectedVessel}
      />
    </div>
  );
}
