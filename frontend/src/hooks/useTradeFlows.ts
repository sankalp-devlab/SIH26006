/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows React State Hook (TanStack Query)
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  FlowFiltersState,
  FlowMode,
  FlowsTab,
  TradeFlowRecord,
} from '../types/trade-flows';
import { TradeFlowsService } from '../services/flows/trade-flows.service';
import { BENCHMARK_TRADE_FLOWS } from '../services/flows/trade-flows.data';

const DEFAULT_FILTERS: FlowFiltersState = {
  searchQuery: '',
  mode: 'dry',
  commodity: 'all',
  originCountry: 'all',
  destinationCountry: 'all',
  originPortId: 'all',
  destinationPortId: 'all',
  vesselClass: 'all',
  region: 'all',
  timeHorizon: 'current',
  direction: 'all',
};

export function useTradeFlows() {
  const [filters, setFilters] = useState<FlowFiltersState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<FlowsTab>('map');
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [odMatrixGroupBy, setOdMatrixGroupBy] = useState<'port' | 'country'>('port');

  // Query flows with React Query
  const {
    data: flows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TradeFlowRecord[]>({
    queryKey: ['trade-flows', filters],
    queryFn: () => TradeFlowsService.getTradeFlows(filters),
    initialData: () => TradeFlowsService.getInitialFlows(DEFAULT_FILTERS),
    staleTime: 60 * 1000,
  });

  // Filter modifier with cascading resets for mode changes
  const setFilter = useCallback(
    <K extends keyof FlowFiltersState>(key: K, value: FlowFiltersState[K]) => {
      setFilters((prev) => {
        if (key === 'mode' && prev.mode !== value) {
          return {
            ...prev,
            mode: value as FlowMode,
            commodity: 'all',
            vesselClass: 'all',
          };
        }
        return {
          ...prev,
          [key]: value,
        };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedFlowId(null);
  }, []);

  // Cascading options derived from current mode & global catalog
  const availableCommodities = useMemo(() => {
    return TradeFlowsService.getAvailableCommodities(filters.mode);
  }, [filters.mode]);

  const availableVesselClasses = useMemo(() => {
    return TradeFlowsService.getAvailableVesselClasses(filters.mode);
  }, [filters.mode]);

  const availableCountries = useMemo(() => {
    return TradeFlowsService.getAvailableCountries(BENCHMARK_TRADE_FLOWS);
  }, []);

  const availableRegions = useMemo(() => {
    return TradeFlowsService.getAvailableRegions(BENCHMARK_TRADE_FLOWS);
  }, []);

  // Selected flow detail object
  const selectedFlow = useMemo(() => {
    if (!selectedFlowId) return null;
    return flows.find((f) => f.id === selectedFlowId) || null;
  }, [flows, selectedFlowId]);

  // Derived analytical models
  const summary = useMemo(() => TradeFlowsService.getSummary(flows), [flows]);
  const odMatrix = useMemo(
    () => TradeFlowsService.getODMatrix(flows, odMatrixGroupBy),
    [flows, odMatrixGroupBy]
  );
  const mapSegments = useMemo(() => TradeFlowsService.getMapFlowSegments(flows), [flows]);
  const volumeBreakdowns = useMemo(() => TradeFlowsService.getVolumeBreakdowns(flows), [flows]);
  const historicalTrend = useMemo(() => TradeFlowsService.getHistoricalTrend(flows), [flows]);

  return {
    flows,
    isLoading,
    isError,
    error,
    refetch,
    filters,
    setFilter,
    resetFilters,
    activeTab,
    setActiveTab,
    selectedFlowId,
    setSelectedFlowId,
    selectedFlow,
    odMatrixGroupBy,
    setOdMatrixGroupBy,
    summary,
    availableCommodities,
    availableVesselClasses,
    availableCountries,
    availableRegions,
    odMatrix,
    mapSegments,
    volumeBreakdowns,
    historicalTrend,
  };
}
