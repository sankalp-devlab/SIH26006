/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleet Intelligence, Geographic Deployment & Benchmarking Workspace
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useState, useMemo } from 'react';
import { useFleets } from '../../hooks/useFleets';
import {
  ArrowLeft,
  Ship,
  Compass,
  PieChart,
  Globe,
  GitCompare,
  Anchor,
  Navigation,
  Layers,
  Percent,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
  ErrorState,
} from '../../components/intelligence';
import { FleetDeploymentMap } from './fleets/components/FleetDeploymentMap';
import { FleetCompositionTab } from './fleets/components/FleetCompositionTab';
import { FleetRegionalTab } from './fleets/components/FleetRegionalTab';
import { FleetBenchmarkingTab } from './fleets/components/FleetBenchmarkingTab';
import { FleetTable } from './fleets/components/FleetTable';
import { FleetVesselDetailDrawer } from './fleets/components/FleetVesselDetailDrawer';
import type {
  FleetVesselRecord,
  FleetsTab,
  FleetVesselClass,
  FleetCargoCategory,
  FleetDeploymentStatus,
} from '../../types/fleets';

const TABS: { id: FleetsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'overview', label: 'Overview & Registry', icon: Ship },
  { id: 'deployment', label: 'Geographic Deployment', icon: Compass },
  { id: 'composition', label: 'Fleet Composition', icon: PieChart },
  { id: 'regional', label: 'Regional Matrix', icon: Globe },
  { id: 'benchmarking', label: 'Owner Benchmarking', icon: GitCompare },
];

export default function FleetsPage() {
  const {
    activeTab,
    filters,
    selectedVessel,
    benchmarkType,
    benchmarkEntityA,
    benchmarkEntityB,
    isLoading,
    isError,
    error,
    vessels,
    filteredVessels,
    summary,
    classBreakdown,
    cargoBreakdown,
    ownerBreakdown,
    operatorBreakdown,
    regionalBreakdown,
    benchmarkResult,
    availableRegions,
    ownersList,
    operatorsList,
    setActiveTab,
    setSelectedVesselId,
    setSearch,
    setOwnerFilter,
    setVesselClassFilter,
    setCargoCategoryFilter,
    setRegionFilter,
    setDeploymentStatusFilter,
    resetFilters,
    setBenchmarkType,
    setBenchmarkEntityA,
    setBenchmarkEntityB,
    exportCsv,
    refetch,
  } = useFleets();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectVessel = (vessel: FleetVesselRecord) => {
    setSelectedVesselId(vessel.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const commandBarFilters = useMemo(() => [
    {
      id: 'vesselClass',
      label: 'Vessel Class',
      value: filters.vesselClass,
      options: [
        { value: 'all', label: 'All Vessel Classes' },
        { value: 'Capesize', label: 'Capesize' },
        { value: 'Panamax', label: 'Panamax' },
        { value: 'Supramax', label: 'Supramax' },
        { value: 'Handysize', label: 'Handysize' },
        { value: 'VLCC', label: 'VLCC' },
        { value: 'Suezmax', label: 'Suezmax' },
        { value: 'Aframax', label: 'Aframax' },
        { value: 'MR Product Tanker', label: 'MR Tanker' },
        { value: 'LNG Carrier', label: 'LNG Carrier' },
        { value: 'VLGC LPG Carrier', label: 'VLGC LPG' },
      ],
      onChange: (val: string) => setVesselClassFilter(val as FleetVesselClass | 'all'),
    },
    {
      id: 'cargoCategory',
      label: 'Sector',
      value: filters.cargoCategory,
      options: [
        { value: 'all', label: 'All Cargo Sectors' },
        { value: 'Dry Bulk', label: 'Dry Bulk' },
        { value: 'Crude Oil', label: 'Crude Oil' },
        { value: 'Clean Petroleum Products', label: 'Clean Products' },
        { value: 'LNG Gas', label: 'LNG' },
        { value: 'LPG Gas', label: 'LPG' },
        { value: 'Chemicals', label: 'Chemicals' },
      ],
      onChange: (val: string) => setCargoCategoryFilter(val as FleetCargoCategory | 'all'),
    },
    {
      id: 'owner',
      label: 'Owner',
      value: filters.ownerId,
      options: [
        { value: 'all', label: 'All Fleet Owners' },
        ...ownersList.map((o) => ({ value: o.id, label: o.name })),
      ],
      onChange: (val: string) => setOwnerFilter(val),
    },
    {
      id: 'region',
      label: 'Region',
      value: filters.region,
      options: [
        { value: 'all', label: 'All Basins / Regions' },
        ...availableRegions.map((r) => ({ value: r, label: r })),
      ],
      onChange: (val: string) => setRegionFilter(val),
    },
    {
      id: 'status',
      label: 'Status',
      value: filters.deploymentStatus,
      options: [
        { value: 'all', label: 'All Deployment States' },
        { value: 'underway', label: 'Underway in Transit' },
        { value: 'anchored', label: 'At Anchorage' },
        { value: 'loading', label: 'Loading Cargo' },
        { value: 'discharging', label: 'Discharging' },
        { value: 'in_repair', label: 'In Repair / Yard' },
      ],
      onChange: (val: string) => setDeploymentStatusFilter(val as FleetDeploymentStatus | 'all'),
    },
  ], [filters.vesselClass, filters.cargoCategory, filters.ownerId, filters.region, filters.deploymentStatus, ownersList, availableRegions, setVesselClassFilter, setCargoCategoryFilter, setOwnerFilter, setRegionFilter, setDeploymentStatusFilter]);

  const hasActiveFilters =
    filters.vesselClass !== 'all' ||
    filters.cargoCategory !== 'all' ||
    filters.ownerId !== 'all' ||
    filters.operatorId !== 'all' ||
    filters.region !== 'all' ||
    filters.country !== 'all' ||
    filters.deploymentStatus !== 'all' ||
    Boolean(filters.search);

  return (
    <div className="fi-dashboard-container oceanlens-master-container">
      {/* 0. Top Navigation & Telemetry Row */}
      <div className="fi-top-breadcrumb-row">
        <a href="/analytics" className="fi-back-btn">
          <ArrowLeft size={14} />
          <span>Back to Analytics Hub</span>
        </a>
        <div className="fi-telemetry-badge">
          <span className="fi-telemetry-pulse" />
          <span>Live AIS Telemetry Stream • Class A/B Active</span>
        </div>
      </div>

      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M19"
        eyebrow="GLOBAL FLEET INTELLIGENCE"
        title="Fleet Intelligence"
        subtitle="Global commercial fleet deployment, fleet composition, vessel operational status, age profiles and owner benchmarking."
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={exportCsv}
      />

      {/* Fleet vs Vessel Intelligence Directive Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 'var(--ol-radius-md, 6px)',
          marginBottom: '14px',
          fontSize: '11px',
          color: 'var(--ol-text-secondary, #94A3B8)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: 'var(--ol-cyan, #00D4FF)',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            FLEET-LEVEL ANALYSIS
          </span>
          <span>Aggregated deadweight capacity, geographic basin deployment & corporate fleet comparisons.</span>
        </div>
        <span style={{ color: 'var(--ol-text-muted, #7189A3)' }}>
          For single-ship certificates, engine telemetry & tracking, see <a href="/vessels" style={{ color: 'var(--ol-cyan, #00D4FF)', textDecoration: 'none' }}>Vessels</a>.
        </span>
      </div>

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        searchQuery={filters.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search fleet by vessel name, IMO, callsign, owner..."
        filters={commandBarFilters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        resultsCount={filteredVessels.length}
        resultsLabel={`of ${vessels.length} vessels`}
      />

      {/* 3. Error State Banner if any */}
      {isError && (
        <ErrorState
          title="Fleet Telemetry Notice"
          message={error instanceof Error ? error.message : 'Global fleet telemetry stream synchronization degraded.'}
          onRetry={() => { void refetch(); }}
          isRetrying={isLoading}
        />
      )}

      {/* 4. Standardized 5-Pillar Fleet KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Active Commercial Fleet"
          metric={`${filteredVessels.length.toLocaleString()} ships`}
          icon={Ship}
          delta={vessels.length !== filteredVessels.length ? `${vessels.length} total` : '100%'}
          deltaDirection="neutral"
          subtext="Live tracked vessels"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Total Deadweight"
          metric={summary?.totalDwt ? `${(summary.totalDwt / 1e6).toFixed(1)}M DWT` : 'Unavailable'}
          icon={Layers}
          delta={summary?.totalVessels ? `${Math.round(summary.totalDwt / summary.totalVessels).toLocaleString()} avg` : undefined}
          deltaDirection="neutral"
          deltaLabel="dwt/ship"
          subtext="Total carrying capacity"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Underway in Transit"
          metric={summary?.underwayPct !== undefined ? `${Math.round((filteredVessels.length * summary.underwayPct) / 100).toLocaleString()} ships` : '0'}
          icon={Navigation}
          delta={summary?.underwayPct !== undefined ? `${summary.underwayPct.toFixed(1)}%` : undefined}
          deltaDirection="up"
          deltaLabel="active steaming"
          subtext="Sailing laden or ballast"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Moored & Anchored"
          metric={summary?.underwayPct !== undefined ? `${Math.max(0, filteredVessels.length - Math.round((filteredVessels.length * summary.underwayPct) / 100)).toLocaleString()} ships` : '0'}
          icon={Anchor}
          delta={summary?.underwayPct !== undefined ? `${(100 - summary.underwayPct).toFixed(1)}% stationary` : undefined}
          deltaDirection="neutral"
          subtext="In port or roadstead"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Fleet Age & Scale"
          metric={summary?.avgFleetAgeYears !== undefined ? `${summary.avgFleetAgeYears.toFixed(1)} yrs` : 'Unavailable'}
          icon={Percent}
          delta={summary?.dominantVesselClass || 'Normal'}
          deltaDirection="neutral"
          deltaLabel="top class"
          subtext="Average fleet profile"
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
            <span>Satellite AIS Fleet Telemetry Live</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px', marginTop: '20px' }}>
        {/* Tab 1: Overview & Registry Table */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FleetDeploymentMap
              vessels={filteredVessels}
              selectedVesselId={selectedVessel?.id ?? null}
              onSelectVessel={handleSelectVessel}
              activeStatusFilter={filters.deploymentStatus}
              onStatusChange={setDeploymentStatusFilter}
            />
            <FleetTable
              vessels={filteredVessels}
              selectedVesselId={selectedVessel?.id ?? null}
              onSelectVessel={handleSelectVessel}
            />
          </div>
        )}

        {/* Tab 2: Geographic Deployment */}
        {activeTab === 'deployment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FleetDeploymentMap
              vessels={filteredVessels}
              selectedVesselId={selectedVessel?.id ?? null}
              onSelectVessel={handleSelectVessel}
              activeStatusFilter={filters.deploymentStatus}
              onStatusChange={setDeploymentStatusFilter}
            />
            <FleetRegionalTab
              regionalBreakdown={regionalBreakdown}
              vessels={filteredVessels}
              onSelectVessel={handleSelectVessel}
            />
          </div>
        )}

        {/* Tab 3: Fleet Composition */}
        {activeTab === 'composition' && (
          <FleetCompositionTab
            vessels={filteredVessels}
            classBreakdown={classBreakdown}
            cargoBreakdown={cargoBreakdown}
            ownerBreakdown={ownerBreakdown}
            operatorBreakdown={operatorBreakdown}
          />
        )}

        {/* Tab 4: Regional Matrix */}
        {activeTab === 'regional' && (
          <FleetRegionalTab
            regionalBreakdown={regionalBreakdown}
            vessels={filteredVessels}
            onSelectVessel={handleSelectVessel}
          />
        )}

        {/* Tab 5: Owner Benchmarking */}
        {activeTab === 'benchmarking' && (
          <FleetBenchmarkingTab
            benchmarkResult={benchmarkResult}
            benchmarkType={benchmarkType}
            benchmarkEntityA={benchmarkEntityA}
            benchmarkEntityB={benchmarkEntityB}
            onBenchmarkTypeChange={setBenchmarkType}
            onBenchmarkEntityAChange={setBenchmarkEntityA}
            onBenchmarkEntityBChange={setBenchmarkEntityB}
            ownersList={ownersList}
            operatorsList={operatorsList}
            availableRegions={availableRegions}
          />
        )}
      </div>

      {/* Vessel Profile Slide-out Drawer */}
      {isDrawerOpen && (
        <FleetVesselDetailDrawer
          onClose={handleCloseDrawer}
          vessel={selectedVessel}
        />
      )}
    </div>
  );
}
