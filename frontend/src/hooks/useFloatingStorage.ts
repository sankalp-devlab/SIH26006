/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: useFloatingStorage React Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import type {
  FloatingStorageFiltersState,
  FloatingStorageTab,
} from '../types/floating-storage';

import { FloatingStorageService } from '../services/floating-storage/floating-storage.service';
import {
  filterFloatingStorage,
  synthesizeFloatingStorageSummary,
  aggregateByRegion,
  aggregateByCargoType,
  aggregateByCrudeGrade,
  aggregateByVesselClass,
  buildVolumeTrendSeries,
  buildHistoricalComparison,
} from '../services/floating-storage/floating-storage-analytics-engine';

export const INITIAL_FLOATING_STORAGE_FILTERS: FloatingStorageFiltersState = {
  search: '',
  cargoType: 'all',
  crudeGrade: 'all',
  region: 'all',
  minStationaryDays: 0,
  dataState: 'live',
  vesselClass: 'all',
};

export function useFloatingStorage() {
  const [activeTab, setActiveTab] = useState<FloatingStorageTab>('overview');
  const [filters, setFilters] = useState<FloatingStorageFiltersState>(INITIAL_FLOATING_STORAGE_FILTERS);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>('fs-101');
  const [selectedBenchmarkPeriod, setSelectedBenchmarkPeriod] = useState<string>('2024-Q1');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // TanStack Query with synchronous initial data contract
  const {
    data: payload,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['floating-storage', filters.dataState],
    queryFn: () => FloatingStorageService.getFloatingStorage(filters),
    initialData: () => FloatingStorageService.getInitialFloatingStorage(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Type-safe individual filter setter
  const setFilter = useCallback(
    <K extends keyof FloatingStorageFiltersState>(key: K, value: FloatingStorageFiltersState[K]) => {
      setFilters((prev) => {
        // If cargoType changes away from 'Crude Oil', reset crudeGrade to 'all'
        if (key === 'cargoType' && value !== 'Crude Oil' && value !== 'all') {
          return { ...prev, [key]: value, crudeGrade: 'all' };
        }
        return { ...prev, [key]: value };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FLOATING_STORAGE_FILTERS);
  }, []);

  // Filtered vessel observation records
  const filteredVessels = useMemo(() => {
    const all = payload?.vessels ?? [];
    return filterFloatingStorage(all, filters);
  }, [payload?.vessels, filters]);

  // Executive KPI summary
  const summary = useMemo(() => {
    return synthesizeFloatingStorageSummary(filteredVessels);
  }, [filteredVessels]);

  // Aggregations
  const regionalAggregations = useMemo(() => {
    return aggregateByRegion(filteredVessels);
  }, [filteredVessels]);

  const cargoAggregations = useMemo(() => {
    return aggregateByCargoType(filteredVessels);
  }, [filteredVessels]);

  const crudeGradeAggregations = useMemo(() => {
    return aggregateByCrudeGrade(filteredVessels);
  }, [filteredVessels]);

  const vesselClassAggregations = useMemo(() => {
    return aggregateByVesselClass(filteredVessels);
  }, [filteredVessels]);

  // Historical trend series
  const trendSeries = useMemo(() => {
    return buildVolumeTrendSeries(payload?.historicalSnapshots ?? []);
  }, [payload?.historicalSnapshots]);

  // Selected benchmark comparison
  const comparison = useMemo(() => {
    const snapshots = payload?.historicalSnapshots ?? [];
    const benchmark = snapshots.find((s) => s.periodLabel === selectedBenchmarkPeriod) ?? snapshots[0];
    if (!benchmark) return null;
    return buildHistoricalComparison(filteredVessels, benchmark);
  }, [filteredVessels, payload?.historicalSnapshots, selectedBenchmarkPeriod]);

  // Selected vessel inspection
  const selectedVessel = useMemo(() => {
    if (!selectedVesselId) return null;
    return (payload?.vessels ?? []).find((v) => v.id === selectedVesselId) ?? null;
  }, [payload?.vessels, selectedVesselId]);

  const handleSelectVessel = useCallback((vesselId: string) => {
    setSelectedVesselId(vesselId);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // CSV Export Trigger
  const handleExportCsv = useCallback(() => {
    const csvContent = FloatingStorageService.exportToCsv(filteredVessels);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floating_storage_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredVessels]);

  return {
    activeTab,
    setActiveTab,
    filters,
    setFilter,
    resetFilters,
    filteredVessels,
    summary,
    regionalAggregations,
    cargoAggregations,
    crudeGradeAggregations,
    vesselClassAggregations,
    trendSeries,
    comparison,
    selectedBenchmarkPeriod,
    setSelectedBenchmarkPeriod,
    selectedVesselId,
    selectedVessel,
    handleSelectVessel,
    isDrawerOpen,
    handleCloseDrawer,
    handleExportCsv,
    isLoading,
    isError,
    error,
    refetch,
  };
}
