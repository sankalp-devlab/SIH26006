/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights React Hook
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MarketInsightsService } from '../services/market-insights/market-insights.service';
import { MarketWatchlistService } from '../services/market-insights/market-watchlist.service';
import { STRUCTURED_MARKET_ROUTES } from '../services/market-insights/market-routes.data';
import type {
  MarketFilterState,
  MarketInsightsTab,
  MarketSector,
  MarketVesselClass,
  MarketComparisonResult
} from '../types/market-insights';

const DEFAULT_FILTERS: MarketFilterState = {
  sector: 'dry',
  vesselClass: 'Capesize',
  routeCode: 'C5',
  timeHorizon: '30d',
  region: 'all',
  searchQuery: ''
};

export function useMarketInsights() {
  const queryClient = useQueryClient();

  // 1. Unified Filters
  const [filters, setFilters] = useState<MarketFilterState>(DEFAULT_FILTERS);

  // 2. Active Workspace Tab
  const [activeTab, setActiveTab] = useState<MarketInsightsTab>('overview');

  // 3. Multi-Entity Comparison Modal State
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonType, setComparisonType] = useState<'route' | 'market' | 'vessel_class'>('route');
  const [comparisonTargetA, setComparisonTargetA] = useState<string>('C5');
  const [comparisonTargetB, setComparisonTargetB] = useState<string>('C3');

  // 4. Watchlist Drawer State
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(() => MarketWatchlistService.getWatchlist());

  // 5. Main Workspace TanStack Query
  const workspaceQuery = useQuery({
    queryKey: ['market-insights', 'workspace', filters],
    queryFn: () => MarketInsightsService.getMarketWorkspace(filters),
    staleTime: 1000 * 60 * 3
  });

  // 6. Comparison Query
  const comparisonQuery = useQuery({
    queryKey: ['market-insights', 'comparison', comparisonType, comparisonTargetA, comparisonTargetB],
    queryFn: () => MarketInsightsService.compare(comparisonType, comparisonTargetA, comparisonTargetB),
    enabled: comparisonOpen,
    staleTime: 1000 * 60 * 5
  });

  // Available routes based on active sector & vessel class
  const availableRoutes = useMemo(() => {
    return MarketInsightsService.getStructuredRoutes({
      sector: filters.sector !== 'all' ? filters.sector : undefined,
      vesselClass: filters.vesselClass !== 'all' ? filters.vesselClass : undefined
    });
  }, [filters.sector, filters.vesselClass]);

  // Cascading Selector Handlers
  const handleSelectSector = useCallback((sector: MarketSector | 'all') => {
    setFilters(prev => {
      let nextVClass: MarketVesselClass = prev.vesselClass;
      let nextRouteCode = prev.routeCode;

      if (sector === 'dry') {
        if (!['Capesize', 'Panamax', 'Supramax', 'Handysize'].includes(prev.vesselClass)) {
          nextVClass = 'Capesize';
          nextRouteCode = 'C5';
        }
      } else if (sector === 'tanker') {
        if (!['VLCC', 'Aframax', 'MR'].includes(prev.vesselClass)) {
          nextVClass = 'VLCC';
          nextRouteCode = 'TD3';
        }
      }

      return {
        ...prev,
        sector,
        vesselClass: nextVClass,
        routeCode: nextRouteCode
      };
    });
  }, []);

  const handleSelectVesselClass = useCallback((vesselClass: MarketVesselClass) => {
    setFilters(prev => {
      // Find compatible routes
      const matchingRoutes = STRUCTURED_MARKET_ROUTES.filter(r =>
        vesselClass === 'all' ? true : r.vessel_class === vesselClass
      );
      const nextRoute = matchingRoutes[0]?.route_code || 'all';

      let nextSector = prev.sector;
      if (['Capesize', 'Panamax', 'Supramax', 'Handysize'].includes(vesselClass)) {
        nextSector = 'dry';
      } else if (['VLCC', 'Aframax', 'MR'].includes(vesselClass)) {
        nextSector = 'tanker';
      }

      return {
        ...prev,
        sector: nextSector,
        vesselClass,
        routeCode: nextRoute
      };
    });
  }, []);

  const handleSelectRoute = useCallback((routeCode: string) => {
    const route = STRUCTURED_MARKET_ROUTES.find(r => r.route_code === routeCode);
    if (route) {
      setFilters(prev => ({
        ...prev,
        sector: route.sector,
        vesselClass: route.vessel_class,
        routeCode: route.route_code
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        routeCode
      }));
    }
  }, []);

  const setFilter = useCallback(<K extends keyof MarketFilterState>(key: K, value: MarketFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.sector !== DEFAULT_FILTERS.sector ||
      filters.vesselClass !== DEFAULT_FILTERS.vesselClass ||
      filters.routeCode !== DEFAULT_FILTERS.routeCode ||
      filters.timeHorizon !== DEFAULT_FILTERS.timeHorizon ||
      filters.region !== DEFAULT_FILTERS.region ||
      filters.searchQuery !== ''
    );
  }, [filters]);

  // Comparison Handlers
  const openComparison = useCallback((
    type: 'route' | 'market' | 'vessel_class' = 'route',
    targetA: string = 'C5',
    targetB: string = 'C3'
  ) => {
    setComparisonType(type);
    setComparisonTargetA(targetA);
    setComparisonTargetB(targetB);
    setComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setComparisonOpen(false);
  }, []);

  // Watchlist Handlers
  const handleToggleWatch = useCallback((code: string, title?: string, sector?: MarketSector, vessel_class?: string) => {
    const route = STRUCTURED_MARKET_ROUTES.find(r => r.route_code === code);
    MarketWatchlistService.toggleWatch({
      id: `fav-${code.toLowerCase()}`,
      type: 'route',
      code,
      title: title || route?.route_name || code,
      sector: sector || route?.sector || 'dry',
      vessel_class: vessel_class || route?.vessel_class || undefined,
      benchmark_rate: route ? 24.8 : undefined,
      rate_unit: route?.benchmark_unit || 'USD',
      change_1d_pct: 1.2
    });
    setWatchlist(MarketWatchlistService.getWatchlist());
  }, []);

  const isWatched = useCallback((code: string) => {
    return MarketWatchlistService.isWatched(code);
  }, [watchlist]);

  // Refresh
  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['market-insights'] });
  }, [queryClient]);

  // CSV Export
  const handleExportCsv = useCallback(() => {
    const data = workspaceQuery.data;
    if (!data) return;

    const routeHeaders = ['Route Code', 'Route Name', 'Sector', 'Vessel Class', 'Commodity', 'Origin Port', 'Destination Port', 'Distance NM', 'Current Rate', 'Unit', '1D Change %', '30D Change %'];
    const routeRows = data.routes.map(r => [
      `"${r.route_code}"`,
      `"${r.route_name}"`,
      `"${r.sector}"`,
      `"${r.vessel_class}"`,
      `"${r.commodity}"`,
      `"${r.origin_port}"`,
      `"${r.destination_port}"`,
      r.distance_nm,
      r.freight.current_rate,
      `"${r.freight.benchmark_unit}"`,
      `${r.freight.change_1d_pct}%`,
      `${r.freight.change_30d_pct}%`
    ].join(','));

    const csvContent = [
      routeHeaders.join(','),
      ...routeRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `market_insights_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [workspaceQuery.data]);

  return {
    // State
    filters,
    activeTab,
    availableRoutes,
    hasActiveFilters,
    comparisonOpen,
    comparisonType,
    comparisonTargetA,
    comparisonTargetB,
    watchlistOpen,
    watchlist,

    // Actions
    setFilters,
    setFilter,
    resetFilters,
    setActiveTab,
    handleSelectSector,
    handleSelectVesselClass,
    handleSelectRoute,
    openComparison,
    closeComparison,
    setComparisonType,
    setComparisonTargetA,
    setComparisonTargetB,
    setWatchlistOpen,
    handleToggleWatch,
    isWatched,
    refetchAll,
    handleExportCsv,

    // Data
    workspace: workspaceQuery.data,
    comparison: comparisonQuery.data as MarketComparisonResult | undefined,
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
    error: workspaceQuery.error,
    isRefetching: workspaceQuery.isRefetching
  };
}
