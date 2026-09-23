/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Intelligence Hook & State Management
 * 
 * Provides reactive orchestration of vessel selection, cascading filters,
 * comparison matrix, currency conversion, and analytical engine computations.
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  ValuationTabType,
  ValuationFiltersState,
  ValuationCurrency,
  ValuationTimeHorizon,
  ValuationChartMetric,
} from '../types/valuations';

import { ValuationsService } from '../services/valuations/valuations.service';
import {
  generateMarketContext,
  generateValuationComparison,
  generateValuationInsights,
  generateDepreciationCurvePoints,
  filterValuationVessels,
} from '../services/valuations/valuations-analytics-engine';

const RECENT_VESSELS_KEY = 'sih_recent_valuation_vessels';
const FAVORITES_VESSELS_KEY = 'sih_favorite_valuation_vessels';

export function useValuations() {
  const [activeTab, setActiveTab] = useState<ValuationTabType>('overview');

  // Active Selected Vessel ID (Defaults to STAR POLARIS - ID 101)
  const [selectedVesselId, setSelectedVesselId] = useState<number>(101);

  // Recent & Favorite Vessels
  const [recentVesselIds, setRecentVesselIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_VESSELS_KEY);
      return stored ? JSON.parse(stored) : [101, 104, 102];
    } catch {
      return [101, 104, 102];
    }
  });

  const [favoriteVesselIds, setFavoriteVesselIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_VESSELS_KEY);
      return stored ? JSON.parse(stored) : [101];
    } catch {
      return [101];
    }
  });

  // Comparison Vessels (up to 5)
  const [comparisonVesselIds, setComparisonVesselIds] = useState<number[]>([101, 102, 103]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Global Filter State
  const [filters, setFilters] = useState<ValuationFiltersState>({
    vesselId: null,
    searchQuery: '',
    vesselClass: 'ALL',
    marketSegment: 'ALL',
    vesselType: 'ALL',
    ageBracket: 'ALL',
    owner: 'ALL',
    currency: 'USD',
    timeHorizon: '1Y',
    chartMetric: 'market_value',
    showBenchmarkOverlay: true,
    showSimilarVesselsOverlay: true,
    isLive: false,
  });

  // TanStack Query with Synchronous Initial Data Guarantee
  const {
    data: payload = ValuationsService.getInitialData(),
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['valuationsPayload', filters.isLive],
    queryFn: () => ValuationsService.fetchValuationsPayload(),
    initialData: ValuationsService.getInitialData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Selected Vessel Resolution
  const selectedVessel = useMemo(() => {
    return payload.vessels.find((v) => v.id === selectedVesselId) || payload.vessels[0];
  }, [payload.vessels, selectedVesselId]);

  // Update Recent Vessels on selection
  const selectVessel = useCallback((id: number) => {
    setSelectedVesselId(id);
    setRecentVesselIds((prev) => {
      const updated = [id, ...prev.filter((i) => i !== id)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_VESSELS_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  const toggleFavoriteVessel = useCallback((id: number) => {
    setFavoriteVesselIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_VESSELS_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  // Filtered Vessels List
  const filteredVessels = useMemo(() => {
    return filterValuationVessels(payload.vessels, filters);
  }, [payload.vessels, filters]);

  // First-Class Market Context Resolution
  const marketContext = useMemo(() => {
    return generateMarketContext(selectedVessel, payload.vessels, payload.benchmarks);
  }, [selectedVessel, payload.vessels, payload.benchmarks]);

  // Multi-Vessel Comparison Resolution
  const comparisonResult = useMemo(() => {
    const vesselsToCompare = payload.vessels.filter((v) => comparisonVesselIds.includes(v.id));
    const segmentBenchmark = payload.benchmarks.find((b) => b.vesselClass === selectedVessel.vesselClass);
    return generateValuationComparison(vesselsToCompare, segmentBenchmark);
  }, [payload.vessels, comparisonVesselIds, payload.benchmarks, selectedVessel.vesselClass]);

  // Dynamic Narrative Insights
  const insights = useMemo(() => {
    return generateValuationInsights(selectedVessel, marketContext);
  }, [selectedVessel, marketContext]);

  // Theoretical Age Depreciation Curve Points
  const depreciationCurve = useMemo(() => {
    return generateDepreciationCurvePoints(
      selectedVessel.newbuildingParityUsdM,
      selectedVessel.demolitionScrapValueUsdM
    );
  }, [selectedVessel.newbuildingParityUsdM, selectedVessel.demolitionScrapValueUsdM]);

  // Comparison Management
  const toggleComparisonVessel = useCallback((id: number) => {
    setComparisonVesselIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
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

  // Filter Updaters
  const setSearchQuery = useCallback((q: string) => setFilters((p) => ({ ...p, searchQuery: q })), []);
  const setVesselClassFilter = useCallback((cls: string) => setFilters((p) => ({ ...p, vesselClass: cls })), []);
  const setMarketSegmentFilter = useCallback((seg: string) => setFilters((p) => ({ ...p, marketSegment: seg })), []);
  const setAgeBracketFilter = useCallback((age: ValuationFiltersState['ageBracket']) => setFilters((p) => ({ ...p, ageBracket: age })), []);
  const setOwnerFilter = useCallback((o: string) => setFilters((p) => ({ ...p, owner: o })), []);
  const setCurrency = useCallback((c: ValuationCurrency) => setFilters((p) => ({ ...p, currency: c })), []);
  const setTimeHorizon = useCallback((h: ValuationTimeHorizon) => setFilters((p) => ({ ...p, timeHorizon: h })), []);
  const setChartMetric = useCallback((m: ValuationChartMetric) => setFilters((p) => ({ ...p, chartMetric: m })), []);
  const toggleBenchmarkOverlay = useCallback(() => setFilters((p) => ({ ...p, showBenchmarkOverlay: !p.showBenchmarkOverlay })), []);
  const toggleSimilarVesselsOverlay = useCallback(() => setFilters((p) => ({ ...p, showSimilarVesselsOverlay: !p.showSimilarVesselsOverlay })), []);
  const setIsLive = useCallback((live: boolean) => setFilters((p) => ({ ...p, isLive: live })), []);

  const resetFilters = useCallback(() => {
    setFilters({
      vesselId: null,
      searchQuery: '',
      vesselClass: 'ALL',
      marketSegment: 'ALL',
      vesselType: 'ALL',
      ageBracket: 'ALL',
      owner: 'ALL',
      currency: 'USD',
      timeHorizon: '1Y',
      chartMetric: 'market_value',
      showBenchmarkOverlay: true,
      showSimilarVesselsOverlay: true,
      isLive: false,
    });
  }, []);

  // Export Handlers
  const handleExportVesselCsv = useCallback(() => {
    ValuationsService.exportVesselValuationCsv(selectedVessel);
  }, [selectedVessel]);

  const handleExportHistoryCsv = useCallback(() => {
    ValuationsService.exportHistoricalValuationsCsv(selectedVessel.historicalPoints, selectedVessel.name);
  }, [selectedVessel]);

  const handleExportComparablesCsv = useCallback(() => {
    ValuationsService.exportComparableVesselsCsv(marketContext.comparableVessels);
  }, [marketContext.comparableVessels]);

  const handleExportReportJson = useCallback(() => {
    ValuationsService.exportFullValuationJson(selectedVessel, marketContext);
  }, [selectedVessel, marketContext]);

  return {
    activeTab,
    setActiveTab,
    selectedVesselId,
    selectVessel,
    selectedVessel,
    recentVesselIds,
    favoriteVesselIds,
    toggleFavoriteVessel,
    comparisonVesselIds,
    toggleComparisonVessel,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    filters,
    setSearchQuery,
    setVesselClassFilter,
    setMarketSegmentFilter,
    setAgeBracketFilter,
    setOwnerFilter,
    setCurrency,
    setTimeHorizon,
    setChartMetric,
    toggleBenchmarkOverlay,
    toggleSimilarVesselsOverlay,
    setIsLive,
    resetFilters,
    payload,
    filteredVessels,
    marketContext,
    comparisonResult,
    insights,
    depreciationCurve,
    isLoading,
    isError,
    refetch,
    handleExportVesselCsv,
    handleExportHistoryCsv,
    handleExportComparablesCsv,
    handleExportReportJson,
  };
}
