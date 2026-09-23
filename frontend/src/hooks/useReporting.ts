import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  ReportFilterState,
  DrillDownContext,
  DrillDownFilterState,
  DetailedTransactionRecord,
} from '../types/reporting';
import { ReportingService, type ReportingStatePayload } from '../services/reporting/reporting.service';

export const INITIAL_FILTERS: ReportFilterState = {
  view: 'commercial',
  timeHorizon: '3Y',
  segment: 'all',
  vesselClass: 'all',
  basin: 'all',
  metricFocus: 'tce_rate',
};

export const INITIAL_DRILL_FILTERS: DrillDownFilterState = {
  status: 'all',
  cargoSubType: 'all',
  minTce: 0,
  searchTerm: '',
};

export function useReporting() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params or defaults
  const parsedFromUrl = useMemo(() => {
    return ReportingService.deserializeUrlParams(searchParams);
  }, [searchParams]);

  const [filters, setFilters] = useState<ReportFilterState>(parsedFromUrl.filters);
  const [drillDownContext, setDrillDownContext] = useState<DrillDownContext | null>(parsedFromUrl.drillDown);
  const [drillDownFilters, setDrillDownFilters] = useState<DrillDownFilterState>(parsedFromUrl.drillDownFilters);

  // Inspector & Dossier Modals
  const [selectedRecord, setSelectedRecord] = useState<DetailedTransactionRecord | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Sync state to URL whenever filters or drill-down change
  useEffect(() => {
    const newParams = ReportingService.serializeToUrlParams(filters, drillDownContext, drillDownFilters);
    // Only update if URL actually changed to prevent loops
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [filters, drillDownContext, drillDownFilters, searchParams, setSearchParams]);

  // Compute reactive data payload via ReportingService
  const reportingData: ReportingStatePayload = useMemo(() => {
    return ReportingService.getReportingState(filters, drillDownContext, drillDownFilters);
  }, [filters, drillDownContext, drillDownFilters]);

  // Filter setters
  const updateFilter = useCallback(<K extends keyof ReportFilterState>(key: K, value: ReportFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setDrillDownContext(null);
    setDrillDownFilters(INITIAL_DRILL_FILTERS);
  }, []);

  // Drill-down triggers
  const triggerDrillDown = useCallback((context: DrillDownContext) => {
    setIsLoading(true);
    setDrillDownContext(context);
    setDrillDownFilters(INITIAL_DRILL_FILTERS); // reset secondary filters on new drill-down
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  }, []);

  const clearDrillDown = useCallback(() => {
    setDrillDownContext(null);
    setDrillDownFilters(INITIAL_DRILL_FILTERS);
  }, []);

  const updateDrillDownFilter = useCallback(
    <K extends keyof DrillDownFilterState>(key: K, value: DrillDownFilterState[K]) => {
      setDrillDownFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetDrillDownFilters = useCallback(() => {
    setDrillDownFilters(INITIAL_DRILL_FILTERS);
  }, []);

  // Export handlers
  const handleExportCsv = useCallback(() => {
    const recsToExport = reportingData.drillDownFiltered || reportingData.filteredRecords;
    const filename = drillDownContext
      ? `sih-drilldown-${drillDownContext.datePeriod}.csv`
      : `sih-reporting-${filters.view}.csv`;
    ReportingService.exportToCsv(recsToExport, filename);
  }, [reportingData, drillDownContext, filters.view]);

  const handleExportJson = useCallback(() => {
    const dataToExport = drillDownContext
      ? { context: drillDownContext, records: reportingData.drillDownFiltered }
      : reportingData.dossier;
    ReportingService.exportToJson(dataToExport, `sih-reporting-${filters.view}.json`);
  }, [reportingData, drillDownContext, filters.view]);

  const handleCopyClipboard = useCallback(async () => {
    const recsToExport = reportingData.drillDownFiltered || reportingData.filteredRecords.slice(0, 100);
    const success = await ReportingService.copyToClipboardTsv(recsToExport);
    if (success) {
      setCopyFeedback(`Copied ${recsToExport.length} rows to clipboard!`);
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  }, [reportingData]);

  return {
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
  };
}
