/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: useFleets React Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import type {
  FleetFiltersState,
  FleetsTab,
  FleetVesselClass,
  FleetCargoCategory,
  FleetDeploymentStatus,
} from '../types/fleets';

import { FleetsService } from '../services/fleets/fleets.service';
import {
  filterFleetVessels,
  synthesizeFleetSummary,
  aggregateByVesselClass,
  aggregateByCargoCategory,
  aggregateByOwner,
  aggregateByOperator,
  aggregateByRegion,
  buildFleetBenchmark,
} from '../services/fleets/fleets-analytics-engine';

const INITIAL_FILTERS: FleetFiltersState = {
  search: '',
  ownerId: 'all',
  operatorId: 'all',
  vesselClass: 'all',
  cargoCategory: 'all',
  region: 'all',
  country: 'all',
  deploymentStatus: 'all',
};

export function useFleets() {
  const [activeTab, setActiveTab] = useState<FleetsTab>('overview');
  const [filters, setFilters] = useState<FleetFiltersState>(INITIAL_FILTERS);
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(101); // Default to OCEANIA STAR

  // Benchmarking State
  const [benchmarkType, setBenchmarkType] = useState<'owner' | 'operator' | 'region'>('owner');
  const [benchmarkEntityA, setBenchmarkEntityA] = useState<string>('own-euronav');
  const [benchmarkEntityB, setBenchmarkEntityB] = useState<string>('own-frontline');

  // TanStack Query with guaranteed synchronous initial data
  const {
    data: payload,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fleets-intelligence-dataset'],
    queryFn: () => FleetsService.getFleets(),
    initialData: () => FleetsService.getInitialFleets(),
    staleTime: 60 * 1000,
  });

  const vessels = payload?.vessels ?? [];
  const owners = payload?.owners ?? [];
  const operators = payload?.operators ?? [];

  // Filter handlers
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setOwnerFilter = useCallback((ownerId: string | 'all') => {
    setFilters((prev) => ({ ...prev, ownerId }));
  }, []);

  const setOperatorFilter = useCallback((operatorId: string | 'all') => {
    setFilters((prev) => ({ ...prev, operatorId }));
  }, []);

  const setVesselClassFilter = useCallback((vesselClass: FleetVesselClass | 'all') => {
    setFilters((prev) => ({ ...prev, vesselClass }));
  }, []);

  const setCargoCategoryFilter = useCallback((cargoCategory: FleetCargoCategory | 'all') => {
    setFilters((prev) => ({ ...prev, cargoCategory }));
  }, []);

  const setRegionFilter = useCallback((region: string | 'all') => {
    setFilters((prev) => ({ ...prev, region, country: 'all' }));
  }, []);

  const setCountryFilter = useCallback((country: string | 'all') => {
    setFilters((prev) => ({ ...prev, country }));
  }, []);

  const setDeploymentStatusFilter = useCallback((deploymentStatus: FleetDeploymentStatus | 'all') => {
    setFilters((prev) => ({ ...prev, deploymentStatus }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Filtered vessel dataset
  const filteredVessels = useMemo(() => {
    return filterFleetVessels(vessels, filters);
  }, [vessels, filters]);

  // Selected Vessel details
  const selectedVessel = useMemo(() => {
    if (selectedVesselId === null) return null;
    return vessels.find((v) => v.id === selectedVesselId) ?? null;
  }, [vessels, selectedVesselId]);

  // Dynamic Lookup Lists
  const availableRegions = useMemo(() => {
    return FleetsService.getAvailableRegions(vessels);
  }, [vessels]);

  const availableCountries = useMemo(() => {
    return FleetsService.getAvailableCountries(vessels, filters.region);
  }, [vessels, filters.region]);

  const ownersList = useMemo(() => {
    return FleetsService.getOwnersList(vessels);
  }, [vessels]);

  const operatorsList = useMemo(() => {
    return FleetsService.getOperatorsList(vessels);
  }, [vessels]);

  // Derived Analytics Aggregations
  const summary = useMemo(() => {
    return synthesizeFleetSummary(filteredVessels);
  }, [filteredVessels]);

  const classBreakdown = useMemo(() => {
    return aggregateByVesselClass(filteredVessels);
  }, [filteredVessels]);

  const cargoBreakdown = useMemo(() => {
    return aggregateByCargoCategory(filteredVessels);
  }, [filteredVessels]);

  const ownerBreakdown = useMemo(() => {
    return aggregateByOwner(filteredVessels);
  }, [filteredVessels]);

  const operatorBreakdown = useMemo(() => {
    return aggregateByOperator(filteredVessels);
  }, [filteredVessels]);

  const regionalBreakdown = useMemo(() => {
    return aggregateByRegion(filteredVessels);
  }, [filteredVessels]);

  // Benchmark Result
  const benchmarkResult = useMemo(() => {
    return buildFleetBenchmark(
      vessels,
      benchmarkType,
      benchmarkEntityA,
      benchmarkEntityB,
      owners,
      operators
    );
  }, [vessels, benchmarkType, benchmarkEntityA, benchmarkEntityB, owners, operators]);

  // CSV Export Trigger
  const exportCsv = useCallback(() => {
    const csvContent = FleetsService.exportToCsv(filteredVessels);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `fleet_intelligence_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredVessels]);

  return {
    // State
    activeTab,
    filters,
    selectedVesselId,
    selectedVessel,
    benchmarkType,
    benchmarkEntityA,
    benchmarkEntityB,
    isLoading,
    isError,
    error,

    // Data & Derived Metrics
    vessels,
    filteredVessels,
    summary,
    classBreakdown,
    cargoBreakdown,
    ownerBreakdown,
    operatorBreakdown,
    regionalBreakdown,
    benchmarkResult,

    // Lookups
    availableRegions,
    availableCountries,
    ownersList,
    operatorsList,

    // Setters & Actions
    setActiveTab,
    setSelectedVesselId,
    setSearch,
    setOwnerFilter,
    setOperatorFilter,
    setVesselClassFilter,
    setCargoCategoryFilter,
    setRegionFilter,
    setCountryFilter,
    setDeploymentStatusFilter,
    resetFilters,
    setBenchmarkType,
    setBenchmarkEntityA,
    setBenchmarkEntityB,
    exportCsv,
    refetch,
  };
}
