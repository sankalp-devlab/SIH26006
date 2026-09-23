/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices v2 State Management Hook
 *
 * Provides reactive orchestration of route selection, spot & FFA contracts,
 * forward curve dynamics, multi-series comparisons, and TanStack Query integration.
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  MarketPricesTabType,
  MarketPricesFilterState,
  PriceTimeHorizon,
  PriceChartMetric,
  PriceAggregation,
  MarketSegmentType,
} from '../types/market-prices';
import { MarketPricesService } from '../services/market-prices/market-prices.service';
import {
  buildRouteForwardCurve,
  calculateRouteVolatility,
  synthesizeMarketContext,
  buildPriceComparisonMatrix,
  filterMarketPrices,
} from '../services/market-prices/market-prices-analytics-engine';

const RECENT_ROUTES_KEY = 'sih_recent_market_routes';
const FAVORITE_ROUTES_KEY = 'sih_favorite_market_routes';

export function useMarketPrices() {
  const [activeTab, setActiveTab] = useState<MarketPricesTabType>('overview');

  // Active Selected Route (Defaults to premier benchmark TD3C - VLCC)
  const [selectedRouteCode, setSelectedRouteCode] = useState<string>('TD3C');

  // Inspection Drawer
  const [drawerRouteCode, setDrawerRouteCode] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Recents & Favorites backed by localStorage
  const [recentRouteCodes, setRecentRouteCodes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_ROUTES_KEY);
      return stored ? JSON.parse(stored) : ['TD3C', 'C5', 'TD20', 'TC2'];
    } catch {
      return ['TD3C', 'C5', 'TD20', 'TC2'];
    }
  });

  const [favoriteRouteCodes, setFavoriteRouteCodes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITE_ROUTES_KEY);
      return stored ? JSON.parse(stored) : ['TD3C', 'C5'];
    } catch {
      return ['TD3C', 'C5'];
    }
  });

  // Comparison Workspace Selection (up to 5 routes)
  const [comparisonRouteCodes, setComparisonRouteCodes] = useState<string[]>([
    'TD3C',
    'TD20',
    'C5',
  ]);

  // Global Filter State
  const [filters, setFilters] = useState<MarketPricesFilterState>({
    searchQuery: '',
    selectedRouteCode: 'ALL',
    selectedVesselClass: 'ALL',
    selectedSegment: 'ALL',
    selectedPricingMode: 'ALL',
    timeHorizon: '1Y',
    chartMetric: 'spot',
    chartAggregation: 'monthly',
    isLive: false,
    showSpotLine: true,
    showFfaLine: true,
    showSpreadBand: true,
  });

  // TanStack Query with Synchronous Initial Data Guarantee
  const {
    data: payload = MarketPricesService.getInitialData(),
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['marketPricesPayload', filters.isLive],
    queryFn: () => MarketPricesService.fetchPayload(filters.isLive),
    initialData: MarketPricesService.getInitialData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Selected Route Specification
  const selectedRouteSpec = useMemo(() => {
    return (
      payload.routes.find((r) => r.routeCode === selectedRouteCode) ||
      payload.routes[0]
    );
  }, [payload.routes, selectedRouteCode]);

  // Selected Spot Price Record
  const selectedSpotPrice = useMemo(() => {
    return (
      payload.spotPrices.find((s) => s.routeCode === selectedRouteCode) ||
      payload.spotPrices[0]
    );
  }, [payload.spotPrices, selectedRouteCode]);

  // Selected Route Forward Curve
  const selectedForwardCurve = useMemo(() => {
    if (payload.forwardCurves[selectedRouteCode]) {
      return payload.forwardCurves[selectedRouteCode];
    }
    return buildRouteForwardCurve(
      selectedRouteCode,
      selectedSpotPrice,
      payload.ffaContracts
    );
  }, [payload.forwardCurves, payload.ffaContracts, selectedRouteCode, selectedSpotPrice]);

  // Selected Route Historical Series
  const selectedHistoricalSeries = useMemo(() => {
    return payload.historicalSeries[selectedRouteCode] || [];
  }, [payload.historicalSeries, selectedRouteCode]);

  // Selected Route Volatility Metrics
  const selectedVolatility = useMemo(() => {
    return calculateRouteVolatility(selectedHistoricalSeries, selectedRouteCode);
  }, [selectedHistoricalSeries, selectedRouteCode]);

  // Selected Route Market Context & Bias
  const selectedMarketContext = useMemo(() => {
    return synthesizeMarketContext(
      selectedRouteCode,
      selectedSpotPrice,
      selectedForwardCurve,
      selectedHistoricalSeries
    );
  }, [selectedRouteCode, selectedSpotPrice, selectedForwardCurve, selectedHistoricalSeries]);

  // Multi-Route Comparison Matrix
  const comparisonMatrix = useMemo(() => {
    return buildPriceComparisonMatrix(
      comparisonRouteCodes,
      payload.spotPrices,
      payload.ffaContracts,
      payload.historicalSeries
    );
  }, [comparisonRouteCodes, payload.spotPrices, payload.ffaContracts, payload.historicalSeries]);

  // Filtered Spot Prices
  const filteredSpotPrices = useMemo(() => {
    return filterMarketPrices(payload.spotPrices, filters);
  }, [payload.spotPrices, filters]);

  // Filtered FFA Contracts
  const filteredFfaContracts = useMemo(() => {
    let list = payload.ffaContracts;
    if (filters.selectedRouteCode !== 'ALL') {
      list = list.filter((c) => c.routeCode === filters.selectedRouteCode);
    }
    if (filters.selectedVesselClass !== 'ALL') {
      list = list.filter((c) => c.vesselClass === filters.selectedVesselClass);
    }
    return list;
  }, [payload.ffaContracts, filters.selectedRouteCode, filters.selectedVesselClass]);

  // Route Selection Action
  const selectRoute = useCallback((code: string) => {
    setSelectedRouteCode(code);
    setRecentRouteCodes((prev) => {
      const updated = [code, ...prev.filter((c) => c !== code)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  // Favorite Toggle Action
  const toggleFavoriteRoute = useCallback((code: string) => {
    setFavoriteRouteCodes((prev) => {
      const updated = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  // Comparison Management
  const toggleComparisonRoute = useCallback((code: string) => {
    setComparisonRouteCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), code]; // max 5
      }
      return [...prev, code];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonRouteCodes([]);
  }, []);

  // Drawer Inspection Action
  const openDetailDrawer = useCallback((code: string) => {
    setDrawerRouteCode(code);
    setIsDrawerOpen(true);
  }, []);

  const closeDetailDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Filter Updaters
  const setSearchQuery = useCallback((q: string) => setFilters((p) => ({ ...p, searchQuery: q })), []);
  const setSelectedVesselClass = useCallback((cls: string) => setFilters((p) => ({ ...p, selectedVesselClass: cls })), []);
  const setSelectedSegment = useCallback((seg: MarketSegmentType | 'ALL') => setFilters((p) => ({ ...p, selectedSegment: seg })), []);
  const setTimeHorizon = useCallback((th: PriceTimeHorizon) => setFilters((p) => ({ ...p, timeHorizon: th })), []);
  const setChartMetric = useCallback((m: PriceChartMetric) => setFilters((p) => ({ ...p, chartMetric: m })), []);
  const setChartAggregation = useCallback((agg: PriceAggregation) => setFilters((p) => ({ ...p, chartAggregation: agg })), []);
  const setIsLive = useCallback((live: boolean) => setFilters((p) => ({ ...p, isLive: live })), []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedRouteCode: 'ALL',
      selectedVesselClass: 'ALL',
      selectedSegment: 'ALL',
      selectedPricingMode: 'ALL',
      timeHorizon: '1Y',
      chartMetric: 'spot',
      chartAggregation: 'monthly',
      isLive: false,
      showSpotLine: true,
      showFfaLine: true,
      showSpreadBand: true,
    });
  }, []);

  // Export Handlers
  const handleExportSpotCsv = useCallback(() => {
    MarketPricesService.exportSpotPricesCsv(payload.spotPrices);
  }, [payload.spotPrices]);

  const handleExportFfaCsv = useCallback(() => {
    MarketPricesService.exportFfaContractsCsv(payload.ffaContracts, selectedRouteCode);
  }, [payload.ffaContracts, selectedRouteCode]);

  const handleExportCurveCsv = useCallback(() => {
    MarketPricesService.exportForwardCurveCsv(selectedForwardCurve);
  }, [selectedForwardCurve]);

  const handleExportHistoryCsv = useCallback(() => {
    MarketPricesService.exportHistoricalPricesCsv(selectedHistoricalSeries, selectedRouteCode);
  }, [selectedHistoricalSeries, selectedRouteCode]);

  const handleExportReportJson = useCallback(() => {
    MarketPricesService.exportMarketReportJson(payload);
  }, [payload]);

  return {
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
    recentRouteCodes,
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
    setSearchQuery,
    setSelectedVesselClass,
    setSelectedSegment,
    setTimeHorizon,
    setChartMetric,
    setChartAggregation,
    setIsLive,
    resetFilters,
    payload,
    filteredSpotPrices,
    filteredFfaContracts,
    isLoading,
    isError,
    refetch,
    handleExportSpotCsv,
    handleExportFfaCsv,
    handleExportCurveCsv,
    handleExportHistoryCsv,
    handleExportReportJson,
  };
}
