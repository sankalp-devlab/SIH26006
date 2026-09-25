/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics & Market Intelligence Workspace
 */

import React from 'react';
import { useFreightAnalytics, FreightAnalyticsTab } from '../../hooks/useFreightAnalytics';
import { FreightAnalyticsHeader } from './freight/components/FreightAnalyticsHeader';
import { FreightCommandBar } from './freight/components/FreightCommandBar';
import { FreightKpiGrid } from './freight/components/FreightKpiGrid';
import { FreightRateChart } from './freight/components/FreightRateChart';
import { MarketSnapshot } from './freight/components/MarketSnapshot';
import { CorridorAnalysisTable } from './freight/components/CorridorAnalysisTable';
import { VesselSupplyTab } from './freight/components/VesselSupplyTab';
import { FreightRatesTab } from './freight/components/FreightRatesTab';
import { FFASpotSpreadTab } from './freight/components/FFASpotSpreadTab';
import { MarketDriversForecastTab } from './freight/components/MarketDriversForecastTab';
import { FreightComparisonModal } from './freight/components/FreightComparisonModal';
import {
  TrendingUp,
  Ship,
  DollarSign,
  Activity,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import './freight/styles/freight-analytics.css';

export default function FreightAnalyticsPage() {
  const {
    filters,
    activeTab,
    selectedRouteCode,
    comparisonOpen,
    comparisonType,
    comparisonTargetA,
    comparisonTargetB,
    hasActiveFilters,
    setFilter,
    resetFilters,
    setActiveTab,
    setSelectedRouteCode,
    openComparison,
    closeComparison,
    setComparisonType,
    setComparisonTargetA,
    setComparisonTargetB,
    handleExportCsv,
    refetchAll,
    summary,
    supply,
    rates,
    ffaCurves,
    spotFFASpreads,
    drivers,
    forecast,
    comparison,
    isLoading,
    isError,
    error,
    isRefetching,
  } = useFreightAnalytics();

  const tabs: {
    id: FreightAnalyticsTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: 'overview', label: 'Market Overview', icon: TrendingUp },
    { id: 'supply', label: 'Vessel Supply', icon: Ship },
    { id: 'rates', label: 'Freight Rates', icon: DollarSign },
    { id: 'ffa-spot', label: 'FFA & Spot Spread', icon: Activity },
    { id: 'drivers-forecast', label: 'Drivers & 90D Forecast', icon: Sparkles },
  ];

  const activeBenchmark = React.useMemo(() => {
    return rates.find((r) => r.route_code === selectedRouteCode) || rates[0];
  }, [rates, selectedRouteCode]);

  return (
    <div className="freight-master-container">
      {/* 1. Page Header with Breadcrumb, Back Button, Title Hierarchy & Actions */}
      <FreightAnalyticsHeader
        onOpenComparison={() => openComparison('route', selectedRouteCode, 'C3')}
        onExportCsv={handleExportCsv}
        onRefresh={refetchAll}
        isRefetching={isRefetching}
      />

      {/* 2. Professional Analytics Command Bar (Search, Segments, Geography, Units, Horizontal Time Range) */}
      <FreightCommandBar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
        lastUpdated={summary?.last_updated}
      />

      {/* 3. 4-Card KPI Intelligence Grid with Section Header */}
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
          1. Freight Market Overview & Key Benchmark Metrics
        </span>
      </div>
      <FreightKpiGrid
        summary={summary}
        supply={supply}
        isLoading={isLoading}
      />

      {/* Error Notification Banner if data sync fails */}
      {isError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 77, 85, 0.12)',
            border: '1px solid var(--freight-red)',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#FFB0B3',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: 'var(--freight-red)' }} />
            <span>
              Failed to sync live market feed: {error instanceof Error ? error.message : 'Network error'}. Showing cached baseline assessment.
            </span>
          </div>
          <button
            type="button"
            onClick={refetchAll}
            className="freight-action-btn"
            style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Segmented Workspace Navigation Bar */}
      <nav className="freight-workspace-tabs" aria-label="Freight Analytics Workspaces">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`freight-tab-btn ${isActive ? 'active' : ''}`}
              role="tab"
              aria-selected={isActive}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 5. Main Workspace Views */}
      {activeTab === 'overview' && (
        <div>
          {/* Empty state check */}
          {rates.length === 0 && !isLoading ? (
            <div
              className="freight-panel-card"
              style={{ textAlign: 'center', padding: '60px 20px', margin: '20px 0' }}
            >
              <Search size={36} style={{ color: 'var(--freight-text-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--freight-text)', marginBottom: '6px' }}>
                No freight corridors match your current filters
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--freight-text-secondary)', marginBottom: '16px' }}>
                Try adjusting your search query, segment, or geographic region.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="freight-action-btn primary"
                style={{ margin: '0 auto' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Section 2: Major Route Movements & Freight Rate Trends */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--ol-border, #183A52)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--ol-cyan, #00D4FF)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    2. Major Route Movements & Freight Trends
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #7189A3)' }}>
                    • Spot Rate Velocity & Benchmark Trajectory
                  </span>
                </div>
              </div>

              {/* Dual-Column Primary Market Terminal Workspace (~65% Chart + ~35% Snapshot) */}
              <div className="freight-workspace-grid">
                <FreightRateChart
                  rates={rates}
                  selectedRouteCode={selectedRouteCode}
                  onSelectRoute={setSelectedRouteCode}
                  dateRange={filters.dateRange}
                  onDateRangeChange={(range) => setFilter('dateRange', range)}
                  onOpenComparison={() => openComparison('route', selectedRouteCode, 'C3')}
                />
                <MarketSnapshot
                  summary={summary}
                  supply={supply}
                  activeBenchmark={activeBenchmark}
                  onOpenComparison={() => openComparison('route', selectedRouteCode, 'C3')}
                />
              </div>

              {/* Section 3: Corridor Benchmark Matrix & Detailed Data */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--ol-border, #183A52)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--ol-cyan, #00D4FF)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    3. Corridor Benchmark Matrix & Segment Analysis
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ol-text-muted, #7189A3)' }}>
                    • Granular Route Economics & Rate Spreads
                  </span>
                </div>
              </div>

              {/* Full-Width Corridor Intelligence & Benchmark Matrix Table */}
              <CorridorAnalysisTable
                rates={rates}
                selectedRouteCode={selectedRouteCode}
                onSelectRoute={setSelectedRouteCode}
                onOpenComparison={openComparison}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'supply' && (
        <VesselSupplyTab
          supply={supply}
          onOpenComparison={openComparison}
        />
      )}

      {activeTab === 'rates' && (
        <FreightRatesTab
          rates={rates}
          selectedRouteCode={selectedRouteCode}
          onSelectRoute={setSelectedRouteCode}
          onOpenComparison={openComparison}
        />
      )}

      {activeTab === 'ffa-spot' && (
        <FFASpotSpreadTab
          ffaCurves={ffaCurves}
          spotSpreads={spotFFASpreads}
          rates={rates}
          selectedRouteCode={selectedRouteCode}
          onSelectRoute={setSelectedRouteCode}
          onOpenComparison={openComparison}
        />
      )}

      {activeTab === 'drivers-forecast' && (
        <MarketDriversForecastTab
          drivers={drivers}
          forecast={forecast}
          rates={rates}
          selectedRouteCode={selectedRouteCode}
          onSelectRoute={setSelectedRouteCode}
        />
      )}

      {/* 6. Side-by-Side Multi-Entity Comparison Modal */}
      <FreightComparisonModal
        isOpen={comparisonOpen}
        onClose={closeComparison}
        comparison={comparison}
        comparisonType={comparisonType}
        comparisonTargetA={comparisonTargetA}
        comparisonTargetB={comparisonTargetB}
        onTypeChange={setComparisonType}
        onTargetAChange={setComparisonTargetA}
        onTargetBChange={setComparisonTargetB}
        rates={rates}
        regions={supply?.regional_distribution || []}
      />
    </div>
  );
}
