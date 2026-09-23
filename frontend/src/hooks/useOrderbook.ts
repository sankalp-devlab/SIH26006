/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook React State Hook (TanStack Query)
 * Manages synchronized orderbook state, filter cascade, analytical calculations, and order selection.
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  OrderbookDataPayload,
  OrderbookFiltersState,
  OrderbookSector,
  OrderbookTab,
  OrderbookRecord,
} from '../types/orderbook';
import { OrderbookService } from '../services/orderbook/orderbook.service';
import { OrderbookAnalyticsEngine } from '../services/orderbook/orderbook-analytics-engine';

const DEFAULT_FILTERS: OrderbookFiltersState = {
  searchQuery: '',
  sector: 'all',
  vesselClass: 'all',
  shipyardCountry: 'all',
  shipyardGroup: 'all',
  status: 'all',
  propulsionType: 'all',
  deliveryYear: 'all',
};

export function useOrderbook() {
  const [filters, setFilters] = useState<OrderbookFiltersState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<OrderbookTab>('growth');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // TanStack Query with synchronous initial data fallback to prevent any runtime iterability bugs
  const {
    data: payload,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrderbookDataPayload>({
    queryKey: ['orderbook', filters],
    queryFn: () => OrderbookService.getOrderbook(filters),
    initialData: () => OrderbookService.getInitialOrderbook(DEFAULT_FILTERS),
    staleTime: 60 * 1000,
  });

  // Filter modifier with cascading resets for sector change
  const setFilter = useCallback(
    <K extends keyof OrderbookFiltersState>(key: K, value: OrderbookFiltersState[K]) => {
      setFilters((prev) => {
        if (key === 'sector' && prev.sector !== value) {
          return {
            ...prev,
            sector: value as OrderbookSector,
            vesselClass: 'all', // cascade reset vessel class
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
    setSelectedOrderId(null);
  }, []);

  // Cascading options derived from active sector and benchmarks
  const availableVesselClasses = useMemo(() => {
    return OrderbookService.getAvailableVesselClasses(filters.sector);
  }, [filters.sector]);

  const availableShipyardCountries = useMemo(() => {
    return OrderbookService.getAvailableShipyardCountries();
  }, []);

  const availablePropulsionTypes = useMemo(() => {
    return OrderbookService.getAvailablePropulsionTypes();
  }, []);

  // Selected Order Detail
  const selectedOrder = useMemo<OrderbookRecord | null>(() => {
    if (!selectedOrderId || !payload?.orders) return null;
    return payload.orders.find((o) => o.id === selectedOrderId) || null;
  }, [selectedOrderId, payload?.orders]);

  // Derived pure analytics calculations
  const summary = useMemo(() => {
    return OrderbookAnalyticsEngine.synthesizeSummaryMetrics(
      payload.orders,
      payload.deliveries,
      payload.demolitions,
      payload.fleetSnapshots,
      payload.shipyards
    );
  }, [payload]);

  const fleetGrowthSeries = useMemo(() => {
    return OrderbookAnalyticsEngine.calculateFleetGrowthSeries(
      payload.fleetSnapshots,
      payload.deliveries,
      payload.demolitions
    );
  }, [payload]);

  const vesselClassBreakdown = useMemo(() => {
    return OrderbookAnalyticsEngine.aggregateByVesselClass(
      payload.orders,
      payload.fleetSnapshots
    );
  }, [payload]);

  const shipyardStats = useMemo(() => {
    return OrderbookAnalyticsEngine.aggregateByShipyard(
      payload.orders,
      payload.shipyards
    );
  }, [payload]);

  const deliveryTimeline = useMemo(() => {
    return OrderbookAnalyticsEngine.buildDeliveryTimeline(payload.deliveries);
  }, [payload]);

  const propulsionMix = useMemo(() => {
    return OrderbookAnalyticsEngine.aggregatePropulsionMix(payload.orders);
  }, [payload]);

  // Export CSV handler
  const exportCsv = useCallback(() => {
    if (!payload?.orders) return;
    const csvData = OrderbookService.exportToCsv(payload.orders);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `maritime_orderbook_${filters.sector}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [payload?.orders, filters.sector]);

  return {
    // Data & Async
    payload,
    orders: payload.orders,
    deliveries: payload.deliveries,
    demolitions: payload.demolitions,
    shipyards: payload.shipyards,
    fleetSnapshots: payload.fleetSnapshots,
    historicalComparison: payload.historicalComparison,
    isLoading,
    isError,
    error,
    refetch,

    // Navigation & View
    activeTab,
    setActiveTab,

    // Selection
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,

    // Filters
    filters,
    setFilter,
    resetFilters,
    availableVesselClasses,
    availableShipyardCountries,
    availablePropulsionTypes,

    // Analytical outputs
    summary,
    fleetGrowthSeries,
    vesselClassBreakdown,
    shipyardStats,
    deliveryTimeline,
    propulsionMix,

    // Utilities
    exportCsv,
  };
}
