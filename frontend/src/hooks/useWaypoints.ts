/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: useWaypoints React Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  WaypointFiltersState,
  WaypointsTab,
  WaypointMode,
  WaypointType,
  WaypointCongestionLevel,
  WaypointTimeHorizon,
  MaritimeWaypointRecord,
  WaypointLiveActivity,
  WaypointHistoricalObservation,
  WaypointSummaryMetrics,
  WaypointComparisonResult,
} from '../types/waypoints';

import { WaypointsService } from '../services/waypoints/waypoints.service';
import {
  filterWaypoints,
  synthesizeGlobalSummary,
  rankWaypoints,
  aggregateByVesselClass,
  aggregateByMode,
  compareWaypoints,
  filterHistoricalTrends,
} from '../services/waypoints/waypoints-analytics-engine';

const INITIAL_FILTERS: WaypointFiltersState = {
  search: '',
  mode: 'all',
  vesselClass: 'all',
  region: 'all',
  country: 'all',
  waypointType: 'all',
  timeHorizon: '30d',
  congestionLevel: 'all',
};

export function useWaypoints() {
  const [activeTab, setActiveTab] = useState<WaypointsTab>('overview');
  const [filters, setFilters] = useState<WaypointFiltersState>(INITIAL_FILTERS);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>('wp-suez');
  const [comparisonWaypointIds, setComparisonWaypointIds] = useState<string[]>([
    'wp-suez',
    'wp-cape-good-hope',
    'wp-panama',
  ]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // TanStack Query with synchronous initial data contract
  const {
    data: payload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['waypoints-dataset'],
    queryFn: () => WaypointsService.getWaypoints(filters),
    initialData: WaypointsService.getInitialWaypoints(),
    staleTime: 60 * 1000,
  });

  // Filter setters
  const setModeFilter = useCallback((mode: WaypointMode | 'all') => {
    setFilters((prev) => ({ ...prev, mode }));
  }, []);

  const setVesselClassFilter = useCallback((vesselClass: string | 'all') => {
    setFilters((prev) => ({ ...prev, vesselClass }));
  }, []);

  const setRegionFilter = useCallback((region: string | 'all') => {
    setFilters((prev) => ({ ...prev, region }));
  }, []);

  const setCountryFilter = useCallback((country: string | 'all') => {
    setFilters((prev) => ({ ...prev, country }));
  }, []);

  const setTypeFilter = useCallback((waypointType: WaypointType | 'all') => {
    setFilters((prev) => ({ ...prev, waypointType }));
  }, []);

  const setTimeHorizonFilter = useCallback((timeHorizon: WaypointTimeHorizon) => {
    setFilters((prev) => ({ ...prev, timeHorizon }));
  }, []);

  const setCongestionLevelFilter = useCallback((congestionLevel: WaypointCongestionLevel | 'all') => {
    setFilters((prev) => ({ ...prev, congestionLevel }));
  }, []);

  const setSearchQuery = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Selection handlers
  const selectWaypoint = useCallback((id: string | null) => {
    setSelectedWaypointId(id);
  }, []);

  const toggleComparisonWaypoint = useCallback((id: string) => {
    setComparisonWaypointIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id]; // keep max 4
      }
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonWaypointIds([]);
  }, []);

  // Memoized computations
  const filteredWaypoints = useMemo(() => {
    return filterWaypoints(payload.waypoints, payload.activities, filters);
  }, [payload.waypoints, payload.activities, filters]);

  const summary: WaypointSummaryMetrics = useMemo(() => {
    return synthesizeGlobalSummary(payload.waypoints, payload.activities, filters);
  }, [payload.waypoints, payload.activities, filters]);

  const selectedWaypoint: MaritimeWaypointRecord | null = useMemo(() => {
    if (!selectedWaypointId) return null;
    return payload.waypoints.find((w) => w.id === selectedWaypointId) || null;
  }, [selectedWaypointId, payload.waypoints]);

  const selectedActivity: WaypointLiveActivity | null = useMemo(() => {
    if (!selectedWaypointId) return null;
    return payload.activities[selectedWaypointId] || null;
  }, [selectedWaypointId, payload.activities]);

  const selectedHistory: WaypointHistoricalObservation[] = useMemo(() => {
    if (!selectedWaypointId) return [];
    const full = payload.historicalTrends[selectedWaypointId] || [];
    return filterHistoricalTrends(full, filters.timeHorizon);
  }, [selectedWaypointId, payload.historicalTrends, filters.timeHorizon]);

  const topTransits = useMemo(() => {
    return rankWaypoints(filteredWaypoints, payload.activities, 'transits24h', 5);
  }, [filteredWaypoints, payload.activities]);

  const topCongestion = useMemo(() => {
    return rankWaypoints(filteredWaypoints, payload.activities, 'congestionScore', 5);
  }, [filteredWaypoints, payload.activities]);

  const topWaiting = useMemo(() => {
    return rankWaypoints(filteredWaypoints, payload.activities, 'waitingVessels', 5);
  }, [filteredWaypoints, payload.activities]);

  const vesselClassBreakdown = useMemo(() => {
    const targetIds = filteredWaypoints.map((w) => w.id);
    return aggregateByVesselClass(payload.activities, targetIds);
  }, [filteredWaypoints, payload.activities]);

  const modeBreakdown = useMemo(() => {
    const targetIds = filteredWaypoints.map((w) => w.id);
    return aggregateByMode(payload.activities, targetIds);
  }, [filteredWaypoints, payload.activities]);

  const comparisonResult: WaypointComparisonResult = useMemo(() => {
    return compareWaypoints(comparisonWaypointIds, payload.waypoints, payload.activities);
  }, [comparisonWaypointIds, payload.waypoints, payload.activities]);

  // CSV Export action
  const handleExportCsv = useCallback(() => {
    const csvContent = WaypointsService.exportToCsv(filteredWaypoints, payload.activities);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maritime_waypoints_34_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredWaypoints, payload.activities]);

  return {
    activeTab,
    setActiveTab,
    filters,
    setModeFilter,
    setVesselClassFilter,
    setRegionFilter,
    setCountryFilter,
    setTypeFilter,
    setTimeHorizonFilter,
    setCongestionLevelFilter,
    setSearchQuery,
    resetFilters,
    selectedWaypointId,
    selectWaypoint,
    selectedWaypoint,
    selectedActivity,
    selectedHistory,
    comparisonWaypointIds,
    toggleComparisonWaypoint,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    waypoints: payload.waypoints,
    activities: payload.activities,
    filteredWaypoints,
    summary,
    topTransits,
    topCongestion,
    topWaiting,
    vesselClassBreakdown,
    modeBreakdown,
    comparisonResult,
    handleExportCsv,
    isLoading,
    isError,
    refetch,
  };
}
