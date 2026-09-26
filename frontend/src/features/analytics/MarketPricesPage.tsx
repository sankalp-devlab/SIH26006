/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 23 — MARKET PRICES v2 Terminal
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 * Prop contracts aligned with actual component interfaces.
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Anchor,
  Activity,
  TrendingUp,
  History,
  GitCompare,
  Compass,
  FileText,
  Layers,
  Sparkles,
  DollarSign,
  Zap,
} from 'lucide-react';

import { useMarketPrices } from '../../hooks/useMarketPrices';
import type { MarketPricesTabType, PriceTimeHorizon } from '../../types/market-prices';
import { formatFreightRate } from '../../services/market-prices/market-prices-analytics-engine';

import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
} from '../../components/intelligence';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

import { RouteSelector } from './market-prices/components/RouteSelector';
import { SpotMarketSection } from './market-prices/components/SpotMarketSection';
import { FfaMarketSection } from './market-prices/components/FfaMarketSection';
import { SpotVsFfaSection } from './market-prices/components/SpotVsFfaSection';
import { HistoricalPriceChart } from './market-prices/components/HistoricalPriceChart';
import { RouteComparisonTable } from './market-prices/components/RouteComparisonTable';
import { VesselClassComparisonTable } from './market-prices/components/VesselClassComparisonTable';
import { PriceComparisonWorkspace } from './market-prices/components/PriceComparisonWorkspace';
import { MarketMovementPanel } from './market-prices/components/MarketMovementPanel';
import { MarketVolatilityPanel } from './market-prices/components/MarketVolatilityPanel';
import { MarketContextPanel } from './market-prices/components/MarketContextPanel';
import { MarketSignalsFeed } from './market-prices/components/MarketSignalsFeed';
import { PriceDetailDrawer } from './market-prices/components/PriceDetailDrawer';
import { HistoricalDataTable } from './market-prices/components/HistoricalDataTable';

export default function MarketPricesPage() {
  const {
    activeTab,
    setActiveTab,
    selectedRouteCode,
    selectRoute,
    selectedRouteSpec,
    selectedSpotPrice,
    selectedForwardCurve,
    selectedHistoricalSeries,
    selectedVolatility,
    selectedMarketContext,
    favoriteRouteCodes,
    toggleFavoriteRoute,
    comparisonRouteCodes,
    toggleComparisonRoute,
    clearComparison,
    comparisonMatrix,
    isDrawerOpen,
    drawerRouteCode,
    openDetailDrawer,
    closeDetailDrawer,
    filters,
    setTimeHorizon,
    setChartMetric,
    setChartAggregation,
    payload,
    isLoading,
    refetch,
    handleExportSpotCsv,
    handleExportFfaCsv,
    handleExportCurveCsv,
    handleExportHistoryCsv,
    handleExportReportJson,
  } = useMarketPrices();

  const [showRouteDirectory, setShowRouteDirectory] = useState<boolean>(false);

  // Inspected route data for the detail drawer
  const inspectedRouteSpec = useMemo(() => {
    const code = drawerRouteCode || selectedRouteCode;
    return payload.routes.find((r) => r.routeCode === code) ?? selectedRouteSpec;
  }, [drawerRouteCode, selectedRouteCode, payload.routes, selectedRouteSpec]);

  const inspectedSpot = useMemo(() => {
    const code = inspectedRouteSpec.routeCode;
    return payload.spotPrices.find((s) => s.routeCode === code) ?? selectedSpotPrice;
  }, [inspectedRouteSpec, payload.spotPrices, selectedSpotPrice]);

  const inspectedCurve = useMemo(() => {
    const code = inspectedRouteSpec.routeCode;
    return payload.forwardCurves[code] ?? selectedForwardCurve;
  }, [inspectedRouteSpec, payload.forwardCurves, selectedForwardCurve]);

  const availableRoutes = useMemo(() => {
    return payload.routes.map((r) => r.routeCode);
  }, [payload.routes]);

  const tabs: {
    id: MarketPricesTabType;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: string;
  }[] = [
    { id: 'overview', label: 'Terminal Overview', icon: LayoutDashboard },
    { id: 'spot', label: 'Physical Spot', icon: Anchor, badge: `${payload.spotPrices.length}` },
    { id: 'ffa', label: 'FFA Forward Curves', icon: Activity, badge: '10 Tenors' },
    { id: 'curve', label: 'Term Structure', icon: Layers },
    { id: 'history', label: 'Historical Terminal', icon: History },
    {
      id: 'compare',
      label: 'Multi-Series Compare',
      icon: GitCompare,
      badge: `${comparisonRouteCodes.length}/5`,
    },
    { id: 'movement', label: 'Market Movers', icon: TrendingUp },
    {
      id: 'ledger',
      label: 'Historical Ledger',
      icon: FileText,
      badge: `${selectedHistoricalSeries.length}`,
    },
  ];

  const commandBarFilters = useMemo(
    () => [
      {
        id: 'routeCode',
        label: 'Benchmark Corridor',
        value: selectedRouteCode,
        options: payload.routes.map((r) => ({
          value: r.routeCode,
          label: `${r.routeCode} — ${r.routeName} (${r.vesselClass})`,
        })),
        onChange: (val: string) => selectRoute(val),
      },
      {
        id: 'chartMetric',
        label: 'Metric Type',
        value: filters.chartMetric,
        options: [
          { value: 'spot', label: 'Spot Rate' },
          { value: 'ffa_prompt', label: 'FFA Prompt' },
          { value: 'spread', label: 'Spot / FFA Spread' },
          { value: 'pct_change', label: '% Change' },
        ],
        onChange: (val: string) =>
          setChartMetric(val as 'spot' | 'ffa_prompt' | 'spread' | 'pct_change'),
      },
      {
        id: 'aggregation',
        label: 'Aggregation',
        value: filters.chartAggregation,
        options: [
          { value: 'intraday', label: 'Intraday' },
          { value: 'daily', label: 'Daily Spot' },
          { value: 'weekly', label: 'Weekly Average' },
          { value: 'monthly', label: 'Monthly Average' },
        ],
        onChange: (val: string) =>
          setChartAggregation(val as 'intraday' | 'daily' | 'weekly' | 'monthly'),
      },
    ],
    [
      selectedRouteCode,
      payload.routes,
      filters.chartMetric,
      filters.chartAggregation,
      selectRoute,
      setChartMetric,
      setChartAggregation,
    ]
  );

  const isSpot1dUp = selectedSpotPrice.change1dPct >= 0;
  const isContango = selectedForwardCurve.curveStructure === 'Contango';

  return (
    <div className="mp-dashboard-container oceanlens-master-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="market" />
      {/* 0. Top Navigation & Telemetry Row */}
      <div className="mp-top-breadcrumb-row">
        <a href="/analytics" className="mp-back-btn">
          <ArrowLeft size={14} />
          <span>Back to Analytics Hub</span>
        </a>
        <div className="mp-telemetry-badge">
          <span className="mp-telemetry-pulse" />
          <span>Baltic Exchange Daily Assessment Live • UTC Real-Time</span>
        </div>
      </div>

      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M23"
        eyebrow="MARKET PRICES TERMINAL"
        title="Market Prices"
        subtitle={`Physical freight spot assessments, FFA curves, term structure analytics and corridor volatility for ${selectedRouteSpec.routeCode}.`}
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={handleExportSpotCsv}
        actions={[
          {
            label: `Compare (${comparisonRouteCodes.length}/5)`,
            icon: GitCompare,
            onClick: () => setActiveTab('compare'),
            variant: 'secondary',
          },
          {
            label: 'Export FFA CSV',
            onClick: handleExportFfaCsv,
            variant: 'secondary',
          },
          {
            label: 'Report JSON',
            onClick: handleExportReportJson,
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Corridor Benchmark Banner & Route Directory Toggle */}
      <div className="mp-corridor-banner">
        <div className="mp-corridor-left">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--ol-cyan, #22D3EE)',
              boxShadow: '0 0 8px var(--ol-cyan, #22D3EE)',
              display: 'inline-block',
            }}
          />
          <span className="mp-corridor-code-badge">
            {selectedRouteSpec.routeCode}
          </span>
          <span className="mp-corridor-title">
            {selectedRouteSpec.routeName}
          </span>
          <span className="mp-corridor-ports">
            ({selectedRouteSpec.originPort} → {selectedRouteSpec.destinationPort})
          </span>
          <span className="mp-corridor-class-badge">
            {selectedRouteSpec.vesselClass}
          </span>
        </div>

        <div className="mp-corridor-actions">
          <button
            type="button"
            onClick={() => openDetailDrawer(selectedRouteCode)}
            className="mp-btn mp-btn-secondary"
          >
            <Sparkles size={13} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
            <span>Corridor Specs</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRouteDirectory((p) => !p)}
            className={`mp-btn ${showRouteDirectory ? 'mp-btn-primary' : 'mp-btn-secondary'}`}
          >
            <Compass size={13} />
            <span>{showRouteDirectory ? 'Hide Directory' : 'All Benchmark Routes'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Route Directory Tray */}
      {showRouteDirectory && (
        <div style={{ marginBottom: '20px' }}>
          <RouteSelector
            routes={payload.routes}
            spotPrices={payload.spotPrices}
            selectedRouteCode={selectedRouteCode}
            onSelectRoute={(code) => {
              selectRoute(code);
              setShowRouteDirectory(false);
            }}
          />
        </div>
      )}

      {/* 3. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setTimeHorizon(r.toLowerCase() as PriceTimeHorizon)}
        timeRangeOptions={['1D', '5D', '1M', '3M', '6M', '1Y', '3Y', 'MAX']}
        resultsCount={payload.routes.length}
        resultsLabel="corridors quoted"
      />

      {/* 4. Standardized 5-Card Price KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Physical Spot Rate"
          metric={formatFreightRate(selectedSpotPrice.rateTceUsdPerDay, selectedSpotPrice.rateUnit)}
          icon={Zap}
          delta={`${isSpot1dUp ? '+' : ''}${selectedSpotPrice.change1dPct.toFixed(1)}%`}
          deltaDirection={isSpot1dUp ? 'up' : 'down'}
          deltaLabel="24h"
          subtext={
            selectedSpotPrice.rateWorldscaleOrPerMt !== undefined
              ? `WS ${selectedSpotPrice.rateWorldscaleOrPerMt.toFixed(1)}`
              : selectedSpotPrice.rateUnit
          }
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="30D Spot Velocity"
          metric={`${selectedSpotPrice.change30dPct >= 0 ? '+' : ''}${selectedSpotPrice.change30dPct.toFixed(1)}%`}
          icon={TrendingUp}
          delta={`${selectedSpotPrice.change7dPct >= 0 ? '+' : ''}${selectedSpotPrice.change7dPct.toFixed(1)}%`}
          deltaDirection={selectedSpotPrice.change7dPct >= 0 ? 'up' : 'down'}
          deltaLabel="7D"
          subtext="Monthly trend velocity"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Prompt FFA (M+1)"
          metric={formatFreightRate(selectedForwardCurve.frontMonthFfaUsdPerDay, '$/day')}
          icon={Activity}
          delta={`${selectedForwardCurve.curveSlopeAnnualizedPct >= 0 ? '+' : ''}${selectedForwardCurve.curveSlopeAnnualizedPct.toFixed(1)}%`}
          deltaDirection={selectedForwardCurve.curveSlopeAnnualizedPct >= 0 ? 'up' : 'down'}
          deltaLabel="slope"
          subtext="Next active contract"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Curve Term Structure"
          metric={selectedForwardCurve.curveStructure}
          icon={Layers}
          badge={selectedForwardCurve.curveStructure}
          badgeColor={isContango ? 'amber' : 'green'}
          subtext={isContango ? 'Forward price premium' : 'Prompt price premium'}
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="30D Rolling Volatility"
          metric={`${selectedVolatility.volatility30dPct.toFixed(1)}%`}
          icon={DollarSign}
          delta={`σ ${selectedVolatility.standardDeviation30d.toLocaleString()}`}
          deltaDirection="neutral"
          subtext="Annualized price risk"
          isLoading={isLoading}
        />
      </IntelligenceKpiGrid>

      {/* 5. Standardized Tabs */}
      <IntelligenceTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightElement={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--ol-text-muted)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--ol-green)',
              }}
            />
            <span>Baltic Exchange Daily Assessment Live</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>

        {/* Tab 1: Terminal Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. SpotVsFfaSection: Forward Curve & Spread Basis */}
            <SpotVsFfaSection
              spot={selectedSpotPrice}
              curve={selectedForwardCurve}
            />

            {/* 2. MarketMovementPanel: Gainers, Decliners, Basis Leaders */}
            <MarketMovementPanel
              spotPrices={payload.spotPrices}
              forwardCurves={payload.forwardCurves}
              onSelectRoute={selectRoute}
            />

            {/* 3. HistoricalPriceChart: Controls & Interactive Time-Series */}
            <HistoricalPriceChart
              historicalPoints={selectedHistoricalSeries}
              routeCode={selectedRouteSpec.routeCode}
              vesselClass={selectedRouteSpec.vesselClass}
              timeHorizon={filters.timeHorizon}
              onTimeHorizonChange={setTimeHorizon}
              chartMetric={filters.chartMetric}
              onChartMetricChange={setChartMetric}
              aggregation={filters.chartAggregation}
              onAggregationChange={setChartAggregation}
              showSpotLine={filters.showSpotLine}
              showFfaLine={filters.showFfaLine}
              showSpreadBand={filters.showSpreadBand}
            />

            {/* 4. Historical Volatility & Market Context 2-Column Grid */}
            <div className="mp-grid-2col">
              <MarketVolatilityPanel
                volatility={selectedVolatility}
                routeCode={selectedRouteCode}
              />
              <MarketContextPanel
                context={selectedMarketContext}
                spot={selectedSpotPrice}
                curve={selectedForwardCurve}
              />
            </div>

            {/* RouteComparisonTable:
                { spotPrices, forwardCurves, selectedRouteCode,
                  onSelectRoute, comparisonRouteCodes, onToggleComparisonRoute }
            */}
            <RouteComparisonTable
              spotPrices={payload.spotPrices}
              forwardCurves={payload.forwardCurves}
              selectedRouteCode={selectedRouteCode}
              onSelectRoute={selectRoute}
              comparisonRouteCodes={comparisonRouteCodes}
              onToggleComparisonRoute={toggleComparisonRoute}
            />
          </div>
        )}

        {/* Tab 2: Physical Spot
            SpotMarketSection: { spotPrices, selectedRouteCode, onSelectRoute, onInspectRoute? }
        */}
        {activeTab === 'spot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SpotMarketSection
              spotPrices={payload.spotPrices}
              selectedRouteCode={selectedRouteCode}
              onSelectRoute={selectRoute}
              onInspectRoute={openDetailDrawer}
            />
            <RouteComparisonTable
              spotPrices={payload.spotPrices}
              forwardCurves={payload.forwardCurves}
              selectedRouteCode={selectedRouteCode}
              onSelectRoute={selectRoute}
              comparisonRouteCodes={comparisonRouteCodes}
              onToggleComparisonRoute={toggleComparisonRoute}
            />
          </div>
        )}

        {/* Tab 3: FFA Forward Curves
            FfaMarketSection: { ffaContracts, selectedRouteCode, onSelectRoute, availableRoutes }
        */}
        {activeTab === 'ffa' && (
          <FfaMarketSection
            ffaContracts={payload.ffaContracts}
            selectedRouteCode={selectedRouteCode}
            onSelectRoute={selectRoute}
            availableRoutes={availableRoutes}
          />
        )}

        {/* Tab 4: Term Structure */}
        {activeTab === 'curve' && (
          <SpotVsFfaSection
            spot={selectedSpotPrice}
            curve={selectedForwardCurve}
          />
        )}

        {/* Tab 5: Historical Terminal */}
        {activeTab === 'history' && (
          <HistoricalPriceChart
            historicalPoints={selectedHistoricalSeries}
            routeCode={selectedRouteSpec.routeCode}
            vesselClass={selectedRouteSpec.vesselClass}
            timeHorizon={filters.timeHorizon}
            onTimeHorizonChange={setTimeHorizon}
            chartMetric={filters.chartMetric}
            onChartMetricChange={setChartMetric}
            aggregation={filters.chartAggregation}
            onAggregationChange={setChartAggregation}
            showSpotLine={filters.showSpotLine}
            showFfaLine={filters.showFfaLine}
            showSpreadBand={filters.showSpreadBand}
          />
        )}

        {/* Tab 6: Multi-Series Compare
            PriceComparisonWorkspace:
            { comparisonMatrix, allSpots, onAddRoute, onRemoveRoute, onClearAll, onSelectRoute }
        */}
        {activeTab === 'compare' && (
          <PriceComparisonWorkspace
            comparisonMatrix={comparisonMatrix}
            allSpots={payload.spotPrices}
            onAddRoute={toggleComparisonRoute}
            onRemoveRoute={toggleComparisonRoute}
            onClearAll={clearComparison}
            onSelectRoute={selectRoute}
          />
        )}

        {/* Tab 7: Market Movers */}
        {activeTab === 'movement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MarketMovementPanel
              spotPrices={payload.spotPrices}
              forwardCurves={payload.forwardCurves}
              onSelectRoute={selectRoute}
            />
            {/* VesselClassComparisonTable: { spotPrices, forwardCurves, onSelectVesselClass? } */}
            <VesselClassComparisonTable
              spotPrices={payload.spotPrices}
              forwardCurves={payload.forwardCurves}
            />
          </div>
        )}

        {/* Tab 8: Historical Ledger
            HistoricalDataTable: { data, route, onExportCsv, onExportJson }
        */}
        {activeTab === 'ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MarketSignalsFeed
              signals={payload.signals}
              onSelectRoute={selectRoute}
            />
            <HistoricalDataTable
              data={selectedHistoricalSeries}
              route={selectedRouteSpec}
              onExportCsv={handleExportHistoryCsv}
              onExportJson={handleExportCurveCsv}
            />
          </div>
        )}
      </div>

      {/* Slide-out Price Inspection Drawer
          PriceDetailDrawer:
          { isOpen, onClose, route, spot, forwardCurve, volatility, context,
            isFavorite?, onToggleFavorite?, onAddToCompare?, isInCompare?, onSelectRoute? }
      */}
      <PriceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={closeDetailDrawer}
        route={inspectedRouteSpec}
        spot={inspectedSpot}
        forwardCurve={inspectedCurve}
        volatility={selectedVolatility}
        context={selectedMarketContext}
        isFavorite={favoriteRouteCodes.includes(inspectedRouteSpec.routeCode)}
        onToggleFavorite={toggleFavoriteRoute}
        onAddToCompare={toggleComparisonRoute}
        isInCompare={comparisonRouteCodes.includes(inspectedRouteSpec.routeCode)}
        onSelectRoute={selectRoute}
      />
    </div>
  );
}
