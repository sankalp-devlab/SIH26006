/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: useEmissions Custom Hook
 * 
 * Central state orchestration hook managing TanStack Query data synchronization,
 * multi-tier filters, selection state, comparison engine, and calculation caching.
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  EmissionsFiltersState,
  EmissionsTimeHorizon,
  EmissionsTimeAggregation,
  EmissionsMetric,
  EmissionsScope,
  EmissionsVesselRecord,
  EmissionsVoyageRecord,
} from '../types/emissions';
import { EmissionsService } from '../services/emissions/emissions.service';
import {
  filterVessels,
  filterVoyages,
  filterLegs,
  filterOperations,
  filterAnomalies,
  synthesizeEmissionsSummary,
  buildVesselComparisonResult,
  aggregateOperationsByState,
  generateAnalyticalInsights,
} from '../services/emissions/emissions-analytics-engine';

export type EmissionsTabType =
  | 'overview'
  | 'vessels'
  | 'voyages'
  | 'operations'
  | 'cii'
  | 'comparison'
  | 'map';

const INITIAL_FILTERS: EmissionsFiltersState = {
  search: '',
  timeHorizon: '30d',
  timeAggregation: 'day',
  metric: 'co2',
  fleet: 'all',
  vesselClass: 'all',
  vesselId: 'all',
  region: 'all',
  voyageId: 'all',
  operationalState: 'all',
  scope: 'tank_to_wake',
  isLive: true,
};

export function useEmissions() {
  const [activeTab, setActiveTab] = useState<EmissionsTabType>('overview');
  const [filters, setFilters] = useState<EmissionsFiltersState>(INITIAL_FILTERS);

  // Selection states
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [selectedVoyageId, setSelectedVoyageId] = useState<string | null>(null);
  const [comparisonVesselIds, setComparisonVesselIds] = useState<number[]>([101, 102, 106]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isVesselDrawerOpen, setIsVesselDrawerOpen] = useState(false);

  // TanStack Query with synchronous initialData to guarantee immediate, zero-flash render
  const { data: payload, isLoading, isError, refetch } = useQuery({
    queryKey: ['emissions-intelligence', filters.isLive],
    queryFn: () => EmissionsService.getEmissions(filters),
    initialData: () => EmissionsService.getInitialEmissions(),
    staleTime: 60_000,
  });

  // Filter setters
  const setSearchQuery = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setTimeHorizon = useCallback((timeHorizon: EmissionsTimeHorizon) => {
    setFilters((prev) => ({ ...prev, timeHorizon }));
  }, []);

  const setTimeAggregation = useCallback((timeAggregation: EmissionsTimeAggregation) => {
    setFilters((prev) => ({ ...prev, timeAggregation }));
  }, []);

  const setMetric = useCallback((metric: EmissionsMetric) => {
    setFilters((prev) => ({ ...prev, metric }));
  }, []);

  const setFleetFilter = useCallback((fleet: string) => {
    setFilters((prev) => ({ ...prev, fleet }));
  }, []);

  const setVesselClassFilter = useCallback((vesselClass: string) => {
    setFilters((prev) => ({ ...prev, vesselClass }));
  }, []);

  const setVesselFilter = useCallback((vesselId: string) => {
    setFilters((prev) => ({ ...prev, vesselId }));
  }, []);

  const setRegionFilter = useCallback((region: string) => {
    setFilters((prev) => ({ ...prev, region }));
  }, []);

  const setVoyageFilter = useCallback((voyageId: string) => {
    setFilters((prev) => ({ ...prev, voyageId }));
  }, []);

  const setOperationalStateFilter = useCallback((operationalState: string) => {
    setFilters((prev) => ({ ...prev, operationalState }));
  }, []);

  const setScopeFilter = useCallback((scope: EmissionsScope) => {
    setFilters((prev) => ({ ...prev, scope }));
  }, []);

  const setIsLive = useCallback((isLive: boolean) => {
    setFilters((prev) => ({ ...prev, isLive }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Filtered collections
  const filteredVessels = useMemo(() => {
    return filterVessels(payload.vessels, filters);
  }, [payload.vessels, filters]);

  const filteredVoyages = useMemo(() => {
    return filterVoyages(payload.voyages, filters);
  }, [payload.voyages, filters]);

  const filteredLegs = useMemo(() => {
    return filterLegs(payload.legs, filteredVoyages, filters);
  }, [payload.legs, filteredVoyages, filters]);

  const filteredOperations = useMemo(() => {
    return filterOperations(payload.operations, filters);
  }, [payload.operations, filters]);

  const filteredAnomalies = useMemo(() => {
    return filterAnomalies(payload.anomalies, filters);
  }, [payload.anomalies, filters]);

  // Selected Entities
  const selectedVessel = useMemo<EmissionsVesselRecord | null>(() => {
    if (!selectedVesselId) return null;
    return payload.vessels.find((v) => v.id === selectedVesselId) || null;
  }, [payload.vessels, selectedVesselId]);

  const selectedVoyage = useMemo<EmissionsVoyageRecord | null>(() => {
    if (!selectedVoyageId) return null;
    return payload.voyages.find((v) => v.voyageId === selectedVoyageId) || null;
  }, [payload.voyages, selectedVoyageId]);

  // Drill-down selection handler
  const selectVessel = useCallback((id: number | null) => {
    setSelectedVesselId(id);
    if (id) setIsVesselDrawerOpen(true);
  }, []);

  const selectVoyage = useCallback((id: string | null) => {
    setSelectedVoyageId(id);
  }, []);

  // Multi-Vessel Comparison Handlers
  const toggleComparisonVessel = useCallback((id: number) => {
    setComparisonVesselIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((vId) => vId !== id);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), id]; // keep max 5
      }
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonVesselIds([]);
  }, []);

  // Summary Metrics Synthesis
  const summary = useMemo(() => {
    return synthesizeEmissionsSummary(filteredVessels, filteredVoyages);
  }, [filteredVessels, filteredVoyages]);

  // Comparison Matrix Engine
  const comparisonResult = useMemo(() => {
    const vesselsToCompare = payload.vessels.filter((v) => comparisonVesselIds.includes(v.id));
    const defaultBenchmark = payload.classBenchmarks[0];
    return buildVesselComparisonResult(vesselsToCompare, defaultBenchmark);
  }, [payload.vessels, payload.classBenchmarks, comparisonVesselIds]);

  // Operational State Aggregations
  const operationsSummary = useMemo(() => {
    return aggregateOperationsByState(filteredOperations);
  }, [filteredOperations]);

  // Dynamic Narrative Insights
  const insights = useMemo(() => {
    return generateAnalyticalInsights(filteredVessels, filteredVoyages, filteredOperations, filteredAnomalies);
  }, [filteredVessels, filteredVoyages, filteredOperations, filteredAnomalies]);

  // Historical time-series slice for active time horizon
  const historicalTrend = useMemo(() => {
    return payload.historicalTrends[filters.timeHorizon] || payload.historicalTrends['30d'];
  }, [payload.historicalTrends, filters.timeHorizon]);

  // Client-Side CSV / JSON Exports
  const handleExportVesselsCsv = useCallback(() => {
    EmissionsService.exportVesselsToCsv(filteredVessels);
  }, [filteredVessels]);

  const handleExportVoyagesCsv = useCallback(() => {
    EmissionsService.exportVoyagesToCsv(filteredVoyages);
  }, [filteredVoyages]);

  const handleExportReportJson = useCallback(() => {
    EmissionsService.exportFullReportJson(payload);
  }, [payload]);

  return {
    activeTab,
    setActiveTab,
    filters,
    setSearchQuery,
    setTimeHorizon,
    setTimeAggregation,
    setMetric,
    setFleetFilter,
    setVesselClassFilter,
    setVesselFilter,
    setRegionFilter,
    setVoyageFilter,
    setOperationalStateFilter,
    setScopeFilter,
    setIsLive,
    resetFilters,
    selectedVesselId,
    selectVessel,
    selectedVessel,
    isVesselDrawerOpen,
    setIsVesselDrawerOpen,
    selectedVoyageId,
    selectVoyage,
    selectedVoyage,
    comparisonVesselIds,
    toggleComparisonVessel,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    payload,
    filteredVessels,
    filteredVoyages,
    filteredLegs,
    filteredOperations,
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
  };
}
