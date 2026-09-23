/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH
 * Enterprise Maritime Intelligence Terminal & Analytical Workstation
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataQuery } from '../../hooks/useDataQuery';
import {
  FileSpreadsheet,
  Share2,
  Copy,
  Download,
  Code2,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Zap,
  Database,
  LineChart,
  Table as TableIcon,
  Layers,
  FileDown,
  Sparkles,
} from 'lucide-react';

import { QueryBuilderPanel } from './components/QueryBuilderPanel';
import { CustomQueryEditor } from './components/CustomQueryEditor';
import { QueryFiltersPanel } from './components/QueryFiltersPanel';
import { TimeSeriesView } from './components/TimeSeriesView';
import { RawDataTableView } from './components/RawDataTableView';
import { PivotTableView } from './components/PivotTableView';
import { QueryShareModal } from './components/QueryShareModal';
import { DataQueryService } from '../../services/data-query/data-query.service';
import { ExportModal } from '../../components/export';
import { ExcelAnalyticsModal } from '../../components/excel';
import { ProvenanceBadge } from '../../components/provenance';
import type { ExportColumnDefinition } from '../../types/export-sharing';
import type { QueryMode, MaritimeDatasetEntity } from '../../types/data-query';

export default function DataQueryPage() {
  const navigate = useNavigate();
  const {
    config,
    updateConfig,
    setMode,
    setEntity,
    addFilter,
    removeFilter,
    clearFilters,
    loadPreset,
    resetToDefault,
    page,
    setPage,
    pageSize,
    setPageSize,
    response,
    isLoading,
    isFetching,
    refetch,
    currentSchema,
    presets,
    isShareModalOpen,
    openShareModal,
    closeShareModal,
    isCustomSqlOpen,
    toggleCustomSql,
    customSqlText,
    setCustomSqlText,
    customSqlError,
    executeCustomSql,
    handleExportCsv,
    handleCopyTsv,
    toastMessage,
  } = useDataQuery();

  const allSchemasMap = useMemo(() => DataQueryService.getEntitySchemas(), []);
  const allSchemasList = useMemo(() => Object.values(allSchemasMap), [allSchemasMap]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Real-time UTC clock string
  const [utcTime, setUtcTime] = useState(() => new Date().toISOString().slice(11, 16));
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toISOString().slice(11, 16));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const exportColumns = useMemo<ExportColumnDefinition[]>(() => {
    if (currentSchema?.fields && currentSchema.fields.length > 0) {
      return currentSchema.fields.map((f) => ({
        key: f.name,
        header: f.label,
        type: f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text',
        defaultVisible: true,
      }));
    }
    const records = response.rawDataResult?.records || [];
    if (records.length > 0) {
      return Object.keys(records[0]).map((key) => ({
        key,
        header: key.replace(/_/g, ' ').toUpperCase(),
        defaultVisible: true,
      }));
    }
    return [];
  }, [currentSchema, response.rawDataResult]);

  const recordCount =
    config.mode === 'raw_data'
      ? response.rawDataResult?.totalMatchingRecords || 0
      : config.mode === 'time_series'
      ? response.timeSeriesResult?.points?.length || 0
      : response.pivotResult?.rowKeys?.length || 0;

  return (
    <div className="oceanlens-master-container">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--ol-cyan, #00D4FF)',
            color: '#030B14',
            fontWeight: 700,
            padding: '10px 18px',
            borderRadius: 'var(--ol-radius-md, 6px)',
            boxShadow: '0 8px 24px rgba(0, 212, 255, 0.35)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          1. MAIN PAGE HEADER (SECTION 2 AUDIT & UPGRADE)
         ============================================================ */}
      <div style={{ marginBottom: '20px' }}>
        {/* Navigation Breadcrumb & Live Telemetry UTC Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          {/* Top-Left: Back to Analytics Hub Button */}
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ol-text-secondary, #94A3B8)',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              padding: '6px 12px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ol-cyan, #00D4FF)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ol-text-secondary, #94A3B8)';
              e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
              e.currentTarget.style.backgroundColor = 'var(--ol-surface-secondary, #0D2238)';
            }}
          >
            <ArrowLeft size={13} />
            <span>← Back to Analytics Hub</span>
          </button>

          {/* Top-Right: Telemetry Live Status & UTC Clock */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              padding: '5px 12px',
              borderRadius: 'var(--ol-radius-md, 6px)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ol-green, #10B981)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ol-green, #10B981)',
                  boxShadow: '0 0 8px var(--ol-green, #10B981)',
                  display: 'inline-block',
                }}
              />
              Telemetry Live
            </span>
            <span style={{ color: 'var(--ol-border, #183A52)' }}>|</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-secondary, #94A3B8)',
              }}
            >
              UTC {utcTime}
            </span>
          </div>
        </div>

        {/* Executive Header Card */}
        <div
          style={{
            backgroundColor: 'var(--ol-surface-primary, #091B2E)',
            border: '1px solid var(--ol-border, #183A52)',
            borderRadius: 'var(--ol-radius-lg, 12px)',
            padding: '22px 24px',
            boxShadow: 'var(--ol-shadow-md, 0 4px 16px rgba(0,0,0,0.35))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {/* Main Heading & Description on Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 480px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(0, 212, 255, 0.12)',
                  color: 'var(--ol-cyan, #00D4FF)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                M24
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ol-cyan, #00D4FF)',
                }}
              >
                SQL & ANALYTICAL WORKSTATION
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(26px, 2.5vw, 36px)',
                fontWeight: 700,
                color: 'var(--ol-text-primary, #F1F5F9)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Data Query Workbench
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--ol-text-secondary, #94A3B8)',
                lineHeight: 1.5,
                maxWidth: '720px',
              }}
            >
              Institutional query workstation supporting multi-year raw ledger pagination, time-series projections, pivot cross-tabulations, and live SQL console.
            </p>
          </div>

          {/* Header Actions on Right (Unified Heights, Lucide Icons, Responsive Wrapping) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}
          >
            {/* 1. Custom SQL Console (Primary Cyan Action) */}
            <button
              type="button"
              onClick={toggleCustomSql}
              className="ol-btn ol-btn-primary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Open or close declarative SQL console"
            >
              <Code2 size={14} />
              <span>{isCustomSqlOpen ? 'Close SQL Editor' : 'Custom SQL Console'}</span>
            </button>

            {/* 2. Share Query (Secondary Dark Outlined) */}
            <button
              type="button"
              onClick={openShareModal}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Generate shareable parameterized query link"
            >
              <Share2 size={14} />
              <span>Share Query</span>
            </button>

            {/* 3. Excel Refresh (Secondary Dark Outlined) */}
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Generate Excel .iqy web query or Power Query M connector"
            >
              <FileSpreadsheet size={14} />
              <span>Excel Refresh</span>
            </button>

            {/* 4. Copy TSV (Secondary Dark Outlined) */}
            <button
              type="button"
              onClick={handleCopyTsv}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Copy active records to clipboard as tab-separated values"
            >
              <Copy size={14} />
              <span>Copy TSV</span>
            </button>

            {/* 5. Full Export (Secondary Dark Outlined) */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Export query with customizable columns, headers, and metadata"
            >
              <Download size={14} />
              <span>Full Export</span>
            </button>

            {/* 6. Export CSV (Secondary Dark Outlined) */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Instantly download active records as CSV"
            >
              <FileDown size={14} />
              <span>Export CSV</span>
            </button>

            {/* 7. Refresh (Secondary Dark Outlined with loading spinner) */}
            <button
              type="button"
              onClick={() => { void refetch(); }}
              disabled={isFetching}
              className="ol-btn ol-btn-secondary"
              style={{ height: '38px', padding: '0 14px' }}
              title="Re-execute query against canonical dataset"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. REDESIGNED QUERY CONFIGURATION PANEL (SECTION 3 AUDIT & UPGRADE)
          Organized into ROW 1 (Query Mode, Dataset, Presets) and ROW 2 (Status, Count, Reset)
         ============================================================ */}
      <div
        style={{
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-lg, 12px)',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: 'var(--ol-shadow-sm, 0 2px 8px rgba(0,0,0,0.2))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* ROW 1 — Query Mode & Data Selectors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Query Mode Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              borderRadius: 'var(--ol-radius-md, 8px)',
              padding: '3px',
              gap: '2px',
            }}
          >
            {[
              { id: 'time_series', label: 'Time Series', icon: LineChart },
              { id: 'raw_data', label: 'Raw Data Ledger', icon: TableIcon },
              { id: 'pivot', label: 'Pivot Aggregation', icon: Layers },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = config.mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as QueryMode)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '34px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--ol-surface-elevated, #102B45)' : 'transparent',
                    color: isActive ? 'var(--ol-cyan, #00D4FF)' : 'var(--ol-text-secondary, #94A3B8)',
                    border: isActive ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid transparent',
                    borderRadius: 'var(--ol-radius-sm, 6px)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 1px 4px rgba(0, 0, 0, 0.3)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? 'var(--ol-cyan, #00D4FF)' : 'inherit' }} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dataset & Preset Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Target Dataset Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-muted, #94A3B8)' }}>
                Dataset:
              </span>
              <select
                value={config.entity}
                onChange={(e) => setEntity(e.target.value as MaritimeDatasetEntity)}
                style={{
                  height: '36px',
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  border: '1px solid var(--ol-border, #183A52)',
                  borderRadius: 'var(--ol-radius-md, 6px)',
                  padding: '0 28px 0 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ol-text-primary, #F1F5F9)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {allSchemasList.map((s) => (
                  <option key={s.entity} value={s.entity}>
                    {s.label} ({s.fields.length} columns)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets Dropdown */}
            {presets.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ol-text-muted, #94A3B8)' }}>
                  Preset:
                </span>
                <select
                  onChange={(e) => {
                    const p = presets.find((item) => item.id === e.target.value);
                    if (p) loadPreset(p);
                  }}
                  defaultValue=""
                  style={{
                    height: '36px',
                    backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                    border: '1px solid var(--ol-border, #183A52)',
                    borderRadius: 'var(--ol-radius-md, 6px)',
                    padding: '0 28px 0 10px',
                    fontSize: '12px',
                    color: 'var(--ol-text-secondary, #94A3B8)',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                  }}
                >
                  <option value="" disabled>Load Analytical Preset...</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 — Query Status & Telemetry Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderTop: '1px solid var(--ol-border, #183A52)',
            paddingTop: '12px',
          }}
        >
          {/* Status Indicators: Runtime, Record Count, Coverage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Runtime Telemetry Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-secondary, #94A3B8)',
                backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                padding: '5px 10px',
                borderRadius: 'var(--ol-radius-sm, 6px)',
                border: '1px solid var(--ol-border, #183A52)',
              }}
            >
              <Zap size={12} style={{ color: 'var(--ol-cyan, #00D4FF)' }} />
              Runtime: <strong style={{ color: 'var(--ol-cyan, #00D4FF)' }}>{response.executionTimeMs || 0}ms</strong>
            </span>

            {/* Record Count Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-secondary, #94A3B8)',
                backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                padding: '5px 10px',
                borderRadius: 'var(--ol-radius-sm, 6px)',
                border: '1px solid var(--ol-border, #183A52)',
              }}
            >
              <Database size={12} style={{ color: 'var(--ol-blue, #3B82F6)' }} />
              <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{recordCount.toLocaleString()}</strong> records matching
            </span>

            {/* Historical Depth Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-muted, #94A3B8)',
                backgroundColor: 'rgba(9, 27, 46, 0.5)',
                padding: '5px 10px',
                borderRadius: 'var(--ol-radius-sm, 6px)',
                border: '1px solid var(--ol-border, #183A52)',
              }}
            >
              <Calendar size={12} style={{ color: 'var(--ol-green, #10B981)' }} />
              Coverage: 2014 – 2026 (12+ Years)
            </span>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={resetToDefault}
            className="ol-btn ol-btn-ghost ol-btn-sm"
            title="Reset workbench to default state"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              border: '1px solid var(--ol-border, #183A52)',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Workbench</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          3. DECLARATIVE SQL QUERY CONSOLE (COLLAPSIBLE)
         ============================================================ */}
      <CustomQueryEditor
        isOpen={isCustomSqlOpen}
        onClose={toggleCustomSql}
        sqlText={customSqlText}
        onSqlChange={setCustomSqlText}
        onExecute={executeCustomSql}
        error={customSqlError}
        schemas={allSchemasMap}
      />

      {/* ============================================================
          4. VISUAL QUERY BUILDER & PARAMETERS (DATASET, METRIC, DATE)
         ============================================================ */}
      <div style={{ marginBottom: '20px' }}>
        <QueryBuilderPanel
          config={config}
          schema={currentSchema}
          allSchemas={allSchemasMap}
          onSetEntity={setEntity}
          onUpdateConfig={updateConfig}
        />
      </div>

      {/* ============================================================
          5. DYNAMIC CONDITION FILTER BUILDER (COLLAPSIBLE)
         ============================================================ */}
      <div style={{ marginBottom: '20px' }}>
        <QueryFiltersPanel
          filters={config.filters}
          schema={currentSchema}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* ============================================================
          6. DATASET PROVENANCE & OBSERVED DATA WINDOW
         ============================================================ */}
      {response.queryProvenance && (
        <div
          style={{
            backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
            border: '1px solid var(--ol-border, #183A52)',
            borderRadius: 'var(--ol-radius-md, 8px)',
            padding: '10px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ol-text-muted, #94A3B8)' }}>Dataset Provenance:</span>
            <ProvenanceBadge provenance={response.queryProvenance} size="sm" />
          </div>
          <span style={{ color: 'var(--ol-text-muted, #94A3B8)', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
            Observed historical coverage: {response.coverageInfo.historicalStart} to {response.coverageInfo.historicalEnd}
          </span>
        </div>
      )}

      {/* ============================================================
          7. ACTIVE OUTPUT VIEWPORT (CHART, RAW DATA TABLE, PIVOT)
         ============================================================ */}
      <div style={{ minHeight: '480px', marginBottom: '24px' }}>
        {/* Time-Series View */}
        {config.mode === 'time_series' && (
          <TimeSeriesView
            data={response.timeSeriesResult}
            isLoading={isLoading || isFetching}
          />
        )}

        {/* Raw Data Ledger View */}
        {config.mode === 'raw_data' && (
          <RawDataTableView
            data={response.rawDataResult}
            isLoading={isLoading || isFetching}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortField={config.sortField}
            sortOrder={config.sortOrder}
            onSort={(field) => {
              const isSame = config.sortField === field;
              const newOrder = isSame && config.sortOrder === 'asc' ? 'desc' : 'asc';
              updateConfig({ sortField: field, sortOrder: newOrder });
            }}
          />
        )}

        {/* Pivot Matrix View */}
        {config.mode === 'pivot' && (
          <PivotTableView
            data={response.pivotResult}
            isLoading={isLoading || isFetching}
          />
        )}
      </div>

      {/* ============================================================
          8. WORKBENCH MODALS (SHARE, EXPORT, EXCEL)
         ============================================================ */}
      <QueryShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        shareableUrl={response.shareableUrl}
        config={config}
      />

      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title={`Export ${currentSchema?.label || 'Data Query Workbench'}`}
          dataset={`Data Query - ${currentSchema?.label || 'Workbench'}`}
          data={response.rawDataResult?.records || []}
          columns={exportColumns}
          metadata={{
            entity: config.entity,
            mode: config.mode,
            generatedAt: new Date().toISOString(),
          }}
        />
      )}

      {isExcelModalOpen && (
        <ExcelAnalyticsModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          queryResponse={response}
          data={response.rawDataResult?.records || []}
          columns={exportColumns}
          title={`Excel Analytics - ${currentSchema?.label || 'Workbench'}`}
        />
      )}
    </div>
  );
}
