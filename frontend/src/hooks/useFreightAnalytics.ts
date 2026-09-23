/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics & Market Intelligence React Hook
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FreightAnalyticsService } from '../services/freight-analytics/freight-analytics.service';
import { FreightAnalyticsEngine } from '../services/freight-analytics/freight-analytics-engine';
import type {
  FreightFilterState,
} from '../types/freight-analytics';

export type FreightAnalyticsTab = 'overview' | 'supply' | 'rates' | 'ffa-spot' | 'drivers-forecast';

const DEFAULT_FILTERS: FreightFilterState = {
  dateRange: '30d',
  segment: 'all',
  vesselClass: 'all',
  region: 'all',
  rateBasis: 'all',
  searchQuery: '',
  showOnlyCongested: false
};

export function useFreightAnalytics() {
  const queryClient = useQueryClient();

  // 1. Filter State
  const [filters, setFilters] = useState<FreightFilterState>(DEFAULT_FILTERS);

  // 2. Active Tab & Selection State
  const [activeTab, setActiveTab] = useState<FreightAnalyticsTab>('overview');
  const [selectedRouteCode, setSelectedRouteCode] = useState<string>('C5');

  // 3. Comparison Modal State
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonType, setComparisonType] = useState<'route' | 'region' | 'vessel_class' | 'spot_vs_ffa'>('route');
  const [comparisonTargetA, setComparisonTargetA] = useState<string>('C5');
  const [comparisonTargetB, setComparisonTargetB] = useState<string>('C3');

  // --- Queries ---

  // Market Summary
  const summaryQuery = useQuery({
    queryKey: ['freight-analytics', 'summary', filters],
    queryFn: () => FreightAnalyticsService.getMarketSummary(filters),
    staleTime: 1000 * 60 * 3
  });

  // Vessel Supply Breakdown
  const supplyQuery = useQuery({
    queryKey: ['freight-analytics', 'supply', filters],
    queryFn: () => FreightAnalyticsService.getVesselSupply(filters),
    staleTime: 1000 * 60 * 3
  });

  // Freight Rates Benchmarks
  const ratesQuery = useQuery({
    queryKey: ['freight-analytics', 'rates', filters],
    queryFn: () => FreightAnalyticsService.getFreightRates(filters),
    staleTime: 1000 * 60 * 3
  });

  // FFA Forward Curves
  const ffaQuery = useQuery({
    queryKey: ['freight-analytics', 'ffa', selectedRouteCode],
    queryFn: () => FreightAnalyticsService.getFFACurves(selectedRouteCode),
    staleTime: 1000 * 60 * 5
  });

  // Spot vs FFA Spreads
  const spreadsQuery = useQuery({
    queryKey: ['freight-analytics', 'spreads'],
    queryFn: () => FreightAnalyticsService.getSpotFFASpreads(),
    staleTime: 1000 * 60 * 5
  });

  // Market Drivers
  const driversQuery = useQuery({
    queryKey: ['freight-analytics', 'drivers'],
    queryFn: () => FreightAnalyticsService.getMarketDrivers(),
    staleTime: 1000 * 60 * 10
  });

  // Forecast Projections
  const forecastQuery = useQuery({
    queryKey: ['freight-analytics', 'forecast', selectedRouteCode],
    queryFn: () => FreightAnalyticsService.getForecast(selectedRouteCode),
    staleTime: 1000 * 60 * 5
  });

  // Comparison Query
  const comparisonQuery = useQuery({
    queryKey: ['freight-analytics', 'comparison', comparisonType, comparisonTargetA, comparisonTargetB],
    queryFn: () => FreightAnalyticsService.getComparison(comparisonType, comparisonTargetA, comparisonTargetB),
    enabled: comparisonOpen,
    staleTime: 1000 * 60 * 5
  });

  // --- Filter Handlers ---

  const setFilter = useCallback(<K extends keyof FreightFilterState>(key: K, value: FreightFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== DEFAULT_FILTERS.dateRange ||
      filters.segment !== DEFAULT_FILTERS.segment ||
      filters.vesselClass !== DEFAULT_FILTERS.vesselClass ||
      filters.region !== DEFAULT_FILTERS.region ||
      filters.rateBasis !== DEFAULT_FILTERS.rateBasis ||
      filters.searchQuery !== '' ||
      filters.showOnlyCongested !== false
    );
  }, [filters]);

  // --- Comparison Modal Handlers ---

  const openComparison = useCallback((
    type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa' = 'route',
    idA: string = 'C5',
    idB: string = 'C3'
  ) => {
    setComparisonType(type);
    setComparisonTargetA(idA);
    setComparisonTargetB(idB);
    setComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setComparisonOpen(false);
  }, []);

  // --- Export Handler ---

  const handleExportCsv = useCallback(() => {
    const rates = ratesQuery.data || [];
    const supply = supplyQuery.data?.regional_distribution || [];
    const csvContent = FreightAnalyticsEngine.exportToCsv(rates, supply);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `freight_market_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [ratesQuery.data, supplyQuery.data]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['freight-analytics'] });
  }, [queryClient]);

  const isLoading = summaryQuery.isLoading || supplyQuery.isLoading || ratesQuery.isLoading;
  const isError = summaryQuery.isError || supplyQuery.isError || ratesQuery.isError;
  const error = summaryQuery.error || supplyQuery.error || ratesQuery.error;

  return {
    // State
    filters,
    activeTab,
    selectedRouteCode,
    comparisonOpen,
    comparisonType,
    comparisonTargetA,
    comparisonTargetB,
    hasActiveFilters,

    // Actions
    setFilters,
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

    // Data
    summary: summaryQuery.data,
    supply: supplyQuery.data,
    rates: ratesQuery.data || [],
    ffaCurves: ffaQuery.data || [],
    spotFFASpreads: spreadsQuery.data || [],
    drivers: driversQuery.data || [],
    forecast: forecastQuery.data || [],
    comparison: comparisonQuery.data,

    // Query states
    isLoading,
    isError,
    error,
    isRefetching: summaryQuery.isRefetching || supplyQuery.isRefetching || ratesQuery.isRefetching
  };
}
