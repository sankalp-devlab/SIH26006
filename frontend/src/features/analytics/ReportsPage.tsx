/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 25: Reporting Analytics & Executive Dossier Center
 * Fully reconstructed adhering to OceanLens Enterprise Design System
 */

import { useMemo } from 'react';
import { useReporting } from '../../hooks/useReporting';
import {
  FileText,
  Copy,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  IntelligencePageHeader,
  IntelligenceCommandBar,
  IntelligenceKpiGrid,
  IntelligenceKpiCard,
} from '../../components/intelligence';
import { InteractiveReportingCharts } from './reporting/components/InteractiveReportingCharts';
import { DrillDownWorkspace } from './reporting/components/DrillDownWorkspace';
import { DecisionGuidancePanel } from './reporting/components/DecisionGuidancePanel';
import { ExecutiveDossierModal } from './reporting/components/ExecutiveDossierModal';
import type { ReportingDashboardView, ReportMarketSegment, ReportVesselClass, ReportGeographicalBasin } from '../../types/reporting';

export default function ReportsPage() {
  const {
    filters,
    updateFilter,
    resetFilters,
    drillDownContext,
    triggerDrillDown,
    clearDrillDown,
    drillDownFilters,
    updateDrillDownFilter,
    resetDrillDownFilters,
    selectedRecord,
    setSelectedRecord,
    isDossierOpen,
    setIsDossierOpen,
    isLoading,
    copyFeedback,
    handleExportCsv,
    handleExportJson,
    handleCopyClipboard,
    reportingData,
  } = useReporting();

  const isFiltered =
    filters.timeHorizon !== '3Y' ||
    filters.segment !== 'all' ||
    filters.vesselClass !== 'all' ||
    filters.basin !== 'all' ||
    filters.metricFocus !== 'tce_rate';

  const commandBarFilters = useMemo(() => [
    {
      id: 'viewMode',
      label: 'View Mode',
      value: filters.view,
      options: [
        { value: 'commercial', label: 'Commercial Ledger' },
        { value: 'trade_flows', label: 'Trade Flows' },
        { value: 'emissions', label: 'Emissions & CII' },
        { value: 'valuations', label: 'Vessel Valuations' },
      ],
      onChange: (val: string) => updateFilter('view', val as ReportingDashboardView),
    },
    {
      id: 'segment',
      label: 'Segment',
      value: filters.segment,
      options: [
        { value: 'all', label: 'All Shipping Segments' },
        { value: 'Crude Tanker', label: 'Crude Tanker' },
        { value: 'Product Tanker', label: 'Product Tanker' },
        { value: 'Dry Bulk', label: 'Dry Bulk' },
        { value: 'LNG', label: 'LNG' },
      ],
      onChange: (val: string) => updateFilter('segment', val as ReportMarketSegment),
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
        { value: 'Capesize', label: 'Capesize' },
        { value: 'Panamax', label: 'Panamax' },
        { value: 'MR', label: 'MR' },
        { value: 'LNG Carrier', label: 'LNG Carrier' },
      ],
      onChange: (val: string) => updateFilter('vesselClass', val as ReportVesselClass),
    },
    {
      id: 'basin',
      label: 'Ocean Basin',
      value: filters.basin,
      options: [
        { value: 'all', label: 'All Ocean Basins' },
        { value: 'Middle East', label: 'Middle East' },
        { value: 'Atlantic', label: 'Atlantic Basin' },
        { value: 'Pacific', label: 'Pacific Basin' },
        { value: 'Europe', label: 'Europe' },
        { value: 'US Gulf', label: 'US Gulf' },
      ],
      onChange: (val: string) => updateFilter('basin', val as ReportGeographicalBasin),
    },
  ], [filters.view, filters.segment, filters.vesselClass, filters.basin, updateFilter]);

  return (
    <div className="oceanlens-master-container">
      {/* 1. Standardized Intelligence Page Header */}
      <IntelligencePageHeader
        moduleBadge="M25"
        eyebrow="REPORTING & ANALYTICS CENTER"
        title="Reporting Analytics"
        subtitle="Executive intelligence dossiers, multi-dimensional shipping transaction analytics, drill-down workspaces and commercial guidance directives."
        onExportCsv={handleExportCsv}
        actions={[
          {
            label: 'Executive Dossier',
            icon: FileText,
            onClick: () => setIsDossierOpen(true),
            variant: 'primary',
          },
          {
            label: copyFeedback ? 'Copied!' : 'Copy TSV',
            icon: Copy,
            onClick: handleCopyClipboard,
            variant: 'secondary',
          },
          {
            label: 'Export JSON',
            icon: Download,
            onClick: handleExportJson,
            variant: 'secondary',
          },
        ]}
      />

      {/* 4-Step Analytical Workflow Directive */}
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
        <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>1. SELECT DATA</span>
        <span style={{ color: 'var(--ol-text-muted, #7189A3)' }}>Filters & Time Horizon</span>
        <span>→</span>
        <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>2. ANALYZE</span>
        <span style={{ color: 'var(--ol-text-muted, #7189A3)' }}>Corridors & Macro Trends</span>
        <span>→</span>
        <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>3. VIEW REPORT</span>
        <span style={{ color: 'var(--ol-text-muted, #7189A3)' }}>Drill-Down & Guidance</span>
        <span>→</span>
        <span style={{ fontWeight: 700, color: 'var(--ol-cyan, #00D4FF)' }}>4. EXPORT / USE</span>
        <span style={{ color: 'var(--ol-text-muted, #7189A3)' }}>Dossier, TSV & JSON</span>
      </div>

      {/* 2. Standardized Intelligence Command Bar */}
      <IntelligenceCommandBar
        filters={commandBarFilters}
        timeRange={filters.timeHorizon.toUpperCase()}
        onTimeRangeChange={(r) => updateFilter('timeHorizon', r as any)}
        timeRangeOptions={['1Y', '3Y', '5Y', 'ALL']}
        hasActiveFilters={isFiltered}
        onResetFilters={resetFilters}
        resultsCount={reportingData.filteredRecords.length}
        resultsLabel={`of ${reportingData.allRecords.length} records`}
      />

      {/* 3. Standardized 5-Card KPI Grid */}
      <IntelligenceKpiGrid columns={5}>
        {reportingData.kpis.map((kpi) => (
          <IntelligenceKpiCard
            key={kpi.id}
            label={kpi.label}
            metric={kpi.value}
            icon={FileSpreadsheet}
            delta={kpi.changeYoY !== 0 ? `${kpi.changeYoY > 0 ? '+' : ''}${kpi.changeYoY}%` : undefined}
            deltaDirection={kpi.status === 'positive' ? 'up' : kpi.status === 'negative' ? 'down' : 'neutral'}
            deltaLabel="YoY"
            subtext={kpi.benchmark}
            isLoading={isLoading}
          />
        ))}
      </IntelligenceKpiGrid>

      {/* 4. Active Main Content Area */}
      {isLoading ? (
        <div
          style={{
            backgroundColor: 'var(--ol-surface-primary)',
            border: '1px solid var(--ol-border)',
            borderRadius: 'var(--ol-radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid var(--ol-cyan)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--ol-cyan)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            Isolating drill-down transaction records...
          </p>
        </div>
      ) : drillDownContext ? (
        /* 4b. Drill-Down Workspace */
        <div style={{ marginBottom: '24px' }}>
          <DrillDownWorkspace
            context={drillDownContext}
            onBackToDashboard={clearDrillDown}
            records={reportingData.drillDownFiltered || []}
            filters={drillDownFilters}
            onFilterChange={updateDrillDownFilter}
            onResetFilters={resetDrillDownFilters}
            selectedRecord={selectedRecord}
            onSelectRecord={setSelectedRecord}
          />
        </div>
      ) : (
        /* 4a. Interactive Charts */
        <div style={{ marginBottom: '24px' }}>
          <InteractiveReportingCharts
            timeSeries={reportingData.timeSeries}
            corridors={reportingData.corridors}
            segmentShare={reportingData.segmentShare}
            metricFocus={filters.metricFocus}
            onDrillDown={triggerDrillDown}
          />
        </div>
      )}

      {/* 5. Strategic Decision Guidance Matrix */}
      <DecisionGuidancePanel
        recommendations={reportingData.recommendations}
        hasDrillDown={Boolean(drillDownContext)}
      />

      {/* 6. Consolidated Executive Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        dossier={reportingData.dossier}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />
    </div>
  );
}
