/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — State Management Hook
 *
 * Provides reactive query configuration, URL synchronization, TanStack Query execution,
 * mode switches (Time Series, Raw Data, Pivot), filter operations, and export handlers.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  DataQueryConfig,
  QueryMode,
  MaritimeDatasetEntity,
  TimeGranularity,
  AnalyticalTransform,
  TimeRangeConfig,
  QueryFilterCondition,
  PivotConfig,
  QueryTemplatePreset,
  MetricSelection,
} from '../types/data-query';
import { DataQueryService } from '../services/data-query/data-query.service';
import { parseCustomSql } from '../services/data-query/data-query-engine';

export function useDataQuery() {
  // Query Configuration State (initialized with URL params if available)
  const [config, setConfig] = useState<DataQueryConfig>(() => {
    const defaultConfig = DataQueryService.getDefaultConfig();
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const restored = DataQueryService.deserializeQueryFromUrl(searchParams);
      return { ...defaultConfig, ...restored };
    }
    return defaultConfig;
  });

  // Pagination for Raw Data mode
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modals & Panels UI State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCustomSqlOpen, setIsCustomSqlOpen] = useState<boolean>(false);
  const [customSqlText, setCustomSqlText] = useState<string>(
    'SELECT rateTceUsdPerDay, corridorOrRoute, vesselClass FROM freight_rates ORDER BY date DESC LIMIT 50'
  );
  const [customSqlError, setCustomSqlError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // TanStack Query with Synchronous Initial Data Guarantee
  const {
    data: response = DataQueryService.getInitialExecution(),
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dataQueryExecution', config, page, pageSize],
    queryFn: () => DataQueryService.executeQuery(config, page, pageSize),
    initialData: DataQueryService.getInitialExecution(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Sync state changes to browser URL without full page reload
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      const shareUrl = DataQueryService.serializeQueryToUrl(config);
      const urlObj = new URL(shareUrl);
      window.history.replaceState({}, '', `${urlObj.pathname}${urlObj.search}`);
    }
  }, [config]);

  // Config Mutators
  const updateConfig = useCallback((patch: Partial<DataQueryConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const setMode = useCallback((mode: QueryMode) => {
    setConfig((prev) => ({ ...prev, mode }));
    setPage(1);
  }, []);

  const setEntity = useCallback((entity: MaritimeDatasetEntity) => {
    const schemas = DataQueryService.getEntitySchemas();
    const schema = schemas[entity];
    const defaultMetric = schema?.fields.find((f) => f.isMetric)?.name || 'rateTceUsdPerDay';
    const defaultDim = schema?.fields.find((f) => f.isDimension && f.name !== 'date')?.name || 'vesselClass';

    setConfig((prev) => ({
      ...prev,
      entity,
      dimensions: [defaultDim],
      metrics: [
        { field: defaultMetric, aggregation: 'AVG', alias: `Average ${defaultMetric}` },
      ],
      pivot: {
        rowDimension: defaultDim,
        colDimension: 'year',
        valueMetric: defaultMetric,
        aggregation: 'AVG',
      },
      filters: [],
    }));
    setPage(1);
  }, []);

  const setGranularity = useCallback((granularity: TimeGranularity) => {
    setConfig((prev) => ({ ...prev, granularity }));
  }, []);

  const setTransform = useCallback((transform: AnalyticalTransform) => {
    setConfig((prev) => ({ ...prev, transform }));
  }, []);

  const setTimeRange = useCallback((timeRange: TimeRangeConfig) => {
    setConfig((prev) => ({ ...prev, timeRange }));
    setPage(1);
  }, []);

  const setMetrics = useCallback((metrics: MetricSelection[]) => {
    setConfig((prev) => ({ ...prev, metrics }));
  }, []);

  const setPivot = useCallback((pivot: PivotConfig) => {
    setConfig((prev) => ({ ...prev, pivot }));
  }, []);

  const addFilter = useCallback((filter: QueryFilterCondition) => {
    setConfig((prev) => ({
      ...prev,
      filters: [...prev.filters.filter((f) => f.id !== filter.id), filter],
    }));
    setPage(1);
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.id !== filterId),
    }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setConfig((prev) => ({ ...prev, filters: [] }));
    setPage(1);
  }, []);

  const loadPreset = useCallback((preset: QueryTemplatePreset) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
    setPage(1);
    showToast(`Loaded Template: ${preset.name}`);
  }, [showToast]);

  const resetToDefault = useCallback(() => {
    setConfig(DataQueryService.getDefaultConfig());
    setPage(1);
    showToast('Reset query workbench to standard default');
  }, [showToast]);

  // Execute Custom SQL Query
  const executeCustomSql = useCallback((sql: string) => {
    setCustomSqlError(null);
    try {
      const parsed = parseCustomSql(sql);
      if (!parsed.entity) {
        setCustomSqlError('Could not identify valid FROM entity (expected: freight_rates, trade_flows, fleet_movements, port_congestion, fleet_emissions)');
        return;
      }
      setConfig((prev) => ({
        ...prev,
        mode: 'raw_data',
        ...parsed,
      }));
      setPage(1);
      showToast('Custom query executed successfully');
    } catch (err) {
      setCustomSqlError(err instanceof Error ? err.message : 'Invalid SQL query syntax');
    }
  }, [showToast]);

  // Export Handlers
  const handleExportCsv = useCallback(() => {
    DataQueryService.exportToCsv(response);
    showToast('CSV dataset download started');
  }, [response, showToast]);

  const handleExportJson = useCallback(() => {
    DataQueryService.exportToJson(response);
    showToast('JSON payload download started');
  }, [response, showToast]);

  const handleCopyTsv = useCallback(async () => {
    const success = await DataQueryService.copyTsvToClipboard(response);
    if (success) {
      showToast('Copied to clipboard (Excel / Sheets TSV format)');
    } else {
      showToast('Clipboard access unavailable, use CSV export');
    }
  }, [response, showToast]);

  // Current Schema
  const currentSchema = useMemo(() => {
    const schemas = DataQueryService.getEntitySchemas();
    return schemas[config.entity] || schemas.freight_rates;
  }, [config.entity]);

  // All Available Presets
  const presets = useMemo(() => {
    return DataQueryService.getQueryPresets();
  }, []);

  return {
    config,
    updateConfig,
    setMode,
    setEntity,
    setGranularity,
    setTransform,
    setTimeRange,
    setMetrics,
    setPivot,
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
    isError,
    error,
    refetch,
    currentSchema,
    presets,
    isShareModalOpen,
    openShareModal: () => setIsShareModalOpen(true),
    closeShareModal: () => setIsShareModalOpen(false),
    isCustomSqlOpen,
    toggleCustomSql: () => setIsCustomSqlOpen((p) => !p),
    customSqlText,
    setCustomSqlText,
    customSqlError,
    executeCustomSql,
    handleExportCsv,
    handleExportJson,
    handleCopyTsv,
    toastMessage,
    showToast,
  };
}
