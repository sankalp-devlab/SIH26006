/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Vessel Asset Valuations & S&P Intelligence
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  Scale,
  Clock,
  ShieldAlert,
  GitCompare,
  Table as TableIcon,
  Sparkles,
  LayoutDashboard,
  DollarSign,
  Shield,
  Layers,
  Award,
  Star,
} from 'lucide-react';

import { useValuations } from '../../hooks/useValuations';
import type { ValuationTabType, ValuationCurrency, ValuationTimeHorizon } from '../../types/valuations';
import { formatValuation } from '../../services/valuations/valuations-analytics-engine';

import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
  IntelligenceTabs,
} from '../../components/intelligence';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';

import { VesselIdentityCard } from './valuations/components/VesselIdentityCard';
import { ValuationCenterpiece } from './valuations/components/ValuationCenterpiece';
import { ValuationMovementAnalytics } from './valuations/components/ValuationMovementAnalytics';
import { ValuationHistoricalChart } from './valuations/components/ValuationHistoricalChart';
import { MarketContextPanel } from './valuations/components/MarketContextPanel';
import { VesselAgeCurveSection } from './valuations/components/VesselAgeCurveSection';
import { DemolitionEconomicsSection } from './valuations/components/DemolitionEconomicsSection';
import { ComparableVesselsTable } from './valuations/components/ComparableVesselsTable';
import { VesselComparisonMatrix } from './valuations/components/VesselComparisonMatrix';
import { ValuationHistoryTable } from './valuations/components/ValuationHistoryTable';
import { ValuationInsightsPanel } from './valuations/components/ValuationInsightsPanel';
import { MarketSignalsFeed } from './valuations/components/MarketSignalsFeed';

export default function ValuationsPage() {
  const {
    activeTab,
    setActiveTab,
    selectedVesselId,
    selectVessel,
    selectedVessel,
    favoriteVesselIds,
    toggleFavoriteVessel,
    comparisonVesselIds,
    toggleComparisonVessel,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    filters,
    setCurrency,
    setTimeHorizon,
    setChartMetric,
    toggleBenchmarkOverlay,
    toggleSimilarVesselsOverlay,
    payload,
    marketContext,
    comparisonResult,
    insights,
    depreciationCurve,
    isLoading,
    refetch,
    handleExportVesselCsv,
    handleExportHistoryCsv,
    handleExportComparablesCsv,
  } = useValuations();

  const currentCurrency = filters.currency;
  const rates = payload.currencyRates;
  const currentRate = rates[currentCurrency];
  const currentSymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'GBP' ? '£' : '$';

  const tabs: { id: ValuationTabType; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'Historical Chart', icon: TrendingUp },
    { id: 'market_context', label: 'Market Context', icon: Scale },
    { id: 'depreciation', label: 'Age & Depreciation', icon: Clock },
    { id: 'demolition', label: 'Demolition Floor', icon: ShieldAlert },
    { id: 'comparables', label: 'Comparable Peers', icon: Sparkles },
    { id: 'comparison', label: `Comparison (${comparisonVesselIds.length})`, icon: GitCompare },
    { id: 'registry', label: 'Ledger & Signals', icon: TableIcon },
  ];

  const commandBarFilters = useMemo(() => [
    {
      id: 'vesselSelector',
      label: 'Target Vessel',
      value: String(selectedVesselId),
      options: payload.vessels.map((v) => ({
        value: String(v.id),
        label: `${v.name} (${v.vesselClass} • ${v.dwt.toLocaleString()} DWT)`,
      })),
      onChange: (val: string) => selectVessel(Number(val)),
    },
    {
      id: 'currency',
      label: 'Currency',
      value: filters.currency,
      options: [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
      ],
      onChange: (val: string) => setCurrency(val as ValuationCurrency),
    },
  ], [selectedVesselId, payload.vessels, filters.currency, selectVessel, setCurrency]);

  const isFavorite = favoriteVesselIds.includes(selectedVesselId);

  return (
    <div className="oceanlens-master-container oceanlens-operational-page-wrapper" style={{ position: 'relative' }}>
      <MaritimePageBackground variant="commercial" />
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M22"
        eyebrow="VESSEL VALUATION INTELLIGENCE"
        title="Vessel Valuation"
        subtitle={`Automated AVM fair market appraisal, historical S&P valuation curves, demolition salvage economics and peer benchmarking for ${selectedVessel.name}.`}
        onRefresh={() => { void refetch(); }}
        isRefetching={isLoading}
        onExportCsv={handleExportVesselCsv}
        actions={[
          {
            label: isFavorite ? 'Favorited' : 'Favorite',
            icon: Star,
            onClick: () => toggleFavoriteVessel(selectedVesselId),
            variant: isFavorite ? 'primary' : 'secondary',
          },
          {
            label: `Compare (${comparisonVesselIds.length})`,
            icon: GitCompare,
            onClick: () => setIsCompareModalOpen(true),
            variant: 'secondary',
          },
          {
            label: 'Export Comparables',
            onClick: handleExportComparablesCsv,
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => setTimeHorizon(r.toUpperCase() as ValuationTimeHorizon)}
        timeRangeOptions={['3M', '6M', '1Y', '3Y', '5Y', 'MAX']}
        resultsCount={payload.vessels.length}
        resultsLabel="vessels in fleet"
      />

      {/* Architectural Flow Guide */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 'var(--ol-radius-md, 6px)',
          marginBottom: '16px',
          fontSize: '11px',
          color: 'var(--ol-text-secondary, #94A3B8)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>1. VESSEL OVERVIEW</span>
        <span>→</span>
        <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>2. KEY SPECIFICATIONS</span>
        <span>→</span>
        <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>3. AVM VALUATION</span>
        <span>→</span>
        <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>4. VALUATION FACTORS</span>
        <span>→</span>
        <span style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>5. HISTORICAL & COMPARATIVE DATA</span>
      </div>

      {/* 3. Vessel Identity Profile Strip */}
      <div style={{ marginBottom: '20px' }}>
        <VesselIdentityCard vessel={selectedVessel} />
      </div>

      {/* 4. Standardized 5-Card Valuation KPI Grid with Explicit Calculation Provenance */}
      <IntelligenceKpiGrid columns={5}>
        <IntelligenceKpiCard
          label="Current Market Value"
          metric={formatValuation(selectedVessel.currentMarketValueUsdM * 1e6, currentCurrency, rates)}
          icon={DollarSign}
          delta={selectedVessel.change1mPct !== undefined ? `${selectedVessel.change1mPct >= 0 ? '+' : ''}${selectedVessel.change1mPct.toFixed(1)}%` : undefined}
          deltaDirection={selectedVessel.change1mPct >= 0 ? 'up' : 'down'}
          deltaLabel="30D"
          badge={`${selectedVessel.valuationConfidence}`}
          badgeColor="cyan"
          subtext="AVM Algorithmic Estimate"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="1-Year Value Movement"
          metric={`${selectedVessel.change1yPct >= 0 ? '+' : ''}${selectedVessel.change1yPct.toFixed(1)}%`}
          icon={TrendingUp}
          delta={selectedVessel.change1yUsdM !== undefined ? `${selectedVessel.change1yUsdM >= 0 ? '+' : ''}$${selectedVessel.change1yUsdM.toFixed(1)}M` : undefined}
          deltaDirection={selectedVessel.change1yPct >= 0 ? 'up' : 'down'}
          deltaLabel="12M Delta"
          subtext="Historical S&P Ledger Delta"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Demolition Salvage Floor"
          metric={formatValuation(selectedVessel.demolitionScrapValueUsdM * 1e6, currentCurrency, rates)}
          icon={Shield}
          delta={`$${selectedVessel.scrapRatePerLdtUsd}/LDT`}
          deltaDirection="neutral"
          deltaLabel="Subcontinent rate"
          subtext="Calculated: LDT × Scrap Rate"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Peer Percentile Rank"
          metric={`${selectedVessel.segmentPercentile}th`}
          icon={Layers}
          delta={selectedVessel.vesselClass}
          deltaDirection="neutral"
          subtext="Class Sample Distribution Rank"
          isLoading={isLoading}
        />

        <IntelligenceKpiCard
          label="Newbuild Cost Parity"
          metric={`$${selectedVessel.newbuildingParityUsdM.toFixed(1)}M`}
          icon={Award}
          delta={`${selectedVessel.ageYears} yrs age`}
          deltaDirection="neutral"
          subtext="Yard Replacement Benchmark"
          isLoading={isLoading}
        />
      </IntelligenceKpiGrid>

      {/* 5. Navigation View Tabs */}
      <IntelligenceTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightElement={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ol-text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ol-green)' }} />
            <span>Valuation Engine Active</span>
          </div>
        }
      />

      {/* 6. Active Tab Content Views */}
      <div style={{ minHeight: '520px' }}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <ValuationCenterpiece
                vessel={selectedVessel}
                currency={filters.currency}
                rates={payload.currencyRates}
              />
              <ValuationMovementAnalytics drivers={selectedVessel.drivers} />
            </div>

            <ValuationHistoricalChart
              historicalPoints={selectedVessel.historicalPoints}
              timeHorizon={filters.timeHorizon}
              onTimeHorizonChange={setTimeHorizon}
              chartMetric={filters.chartMetric}
              onChartMetricChange={setChartMetric}
              showBenchmarkOverlay={filters.showBenchmarkOverlay}
              onToggleBenchmarkOverlay={toggleBenchmarkOverlay}
              showSimilarVesselsOverlay={filters.showSimilarVesselsOverlay}
              onToggleSimilarVesselsOverlay={toggleSimilarVesselsOverlay}
              currency={filters.currency}
              rates={payload.currencyRates}
              vesselName={selectedVessel.name}
              vesselClass={selectedVessel.vesselClass}
            />

            <MarketContextPanel
              selectedVessel={selectedVessel}
              marketContext={marketContext}
              currency={filters.currency}
              rates={payload.currencyRates}
              onSelectComparableVessel={selectVessel}
            />

            <ValuationInsightsPanel
              insights={insights}
              vesselName={selectedVessel.name}
            />
          </div>
        )}

        {/* Tab 2: Historical Chart */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ValuationHistoricalChart
              historicalPoints={selectedVessel.historicalPoints}
              timeHorizon={filters.timeHorizon}
              onTimeHorizonChange={setTimeHorizon}
              chartMetric={filters.chartMetric}
              onChartMetricChange={setChartMetric}
              showBenchmarkOverlay={filters.showBenchmarkOverlay}
              onToggleBenchmarkOverlay={toggleBenchmarkOverlay}
              showSimilarVesselsOverlay={filters.showSimilarVesselsOverlay}
              onToggleSimilarVesselsOverlay={toggleSimilarVesselsOverlay}
              currency={filters.currency}
              rates={payload.currencyRates}
              vesselName={selectedVessel.name}
              vesselClass={selectedVessel.vesselClass}
            />
            <ValuationHistoryTable
              vessel={selectedVessel}
              currency={filters.currency}
              currencyRate={currentRate}
              currencySymbol={currentSymbol}
              onExportCsv={handleExportHistoryCsv}
            />
          </div>
        )}

        {/* Tab 3: Market Context */}
        {activeTab === 'market_context' && (
          <MarketContextPanel
            selectedVessel={selectedVessel}
            marketContext={marketContext}
            currency={filters.currency}
            rates={payload.currencyRates}
            onSelectComparableVessel={selectVessel}
          />
        )}

        {/* Tab 4: Age & Depreciation */}
        {activeTab === 'depreciation' && (
          <VesselAgeCurveSection
            selectedVessel={selectedVessel}
            comparableVessels={marketContext.comparableVessels}
            depreciationCurve={depreciationCurve}
            currency={filters.currency}
            rates={payload.currencyRates}
            onSelectVessel={selectVessel}
          />
        )}

        {/* Tab 5: Demolition Floor */}
        {activeTab === 'demolition' && (
          <DemolitionEconomicsSection
            vessel={selectedVessel}
            currency={filters.currency}
            rates={payload.currencyRates}
          />
        )}

        {/* Tab 6: Comparable Peers */}
        {activeTab === 'comparables' && (
          <ComparableVesselsTable
            peers={marketContext.comparableVessels}
            selectedVesselId={selectedVessel.id}
            onSelectVessel={selectVessel}
            comparisonVesselIds={comparisonVesselIds}
            onToggleComparisonVessel={toggleComparisonVessel}
            currency={filters.currency}
            rates={rates}
          />
        )}

        {/* Tab 7: Multi-Vessel Comparison */}
        {activeTab === 'comparison' && (
          <VesselComparisonMatrix
            comparisonResult={comparisonResult}
            allVessels={payload.vessels}
            onRemoveVessel={toggleComparisonVessel}
            onAddVessel={toggleComparisonVessel}
            onClearAll={clearComparison}
            currency={filters.currency}
            rates={payload.currencyRates}
            onSelectVessel={selectVessel}
          />
        )}

        {/* Tab 8: Ledger & Signals */}
        {activeTab === 'registry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MarketSignalsFeed
              signals={selectedVessel.signals}
              vesselName={selectedVessel.name}
            />
            <ValuationHistoryTable
              vessel={selectedVessel}
              currency={filters.currency}
              currencyRate={currentRate}
              currencySymbol={currentSymbol}
              onExportCsv={handleExportHistoryCsv}
            />
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(6, 19, 33, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ol-surface-primary)',
              border: '1px solid var(--ol-border-strong)',
              borderRadius: 'var(--ol-radius-lg)',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: 'var(--ol-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--ol-text-primary)' }}>
                Multi-Vessel Comparative Appraisal Matrix
              </h3>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="ol-btn ol-btn-secondary ol-btn-sm"
              >
                Close
              </button>
            </div>
            <VesselComparisonMatrix
              comparisonResult={comparisonResult}
              allVessels={payload.vessels}
              onRemoveVessel={toggleComparisonVessel}
              onAddVessel={toggleComparisonVessel}
              onClearAll={clearComparison}
              currency={filters.currency}
              rates={payload.currencyRates}
              onSelectVessel={selectVessel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
