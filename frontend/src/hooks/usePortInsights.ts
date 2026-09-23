/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Custom Hook
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePorts } from './usePorts';
import { useVessels } from './useVessels';
import { PortInsightsService } from '../services/port-insights/port-insights.service';
import { PortAnalyticsEngine } from '../services/port-insights/port-analytics-engine';
import type {
  PortInsightPayload,
  PortDateRange,
  PortComparisonResult,
  PortVesselActivity,
  PortHistoricalVisit,
} from '../types/port-insights';
import type { Port } from '../types/port';

export type PortWorkspaceTab = 'overview' | 'activity' | 'terminals' | 'commercial' | 'historical';

export function usePortInsights() {
  const {
    data: portsData,
    isLoading: isLoadingPorts,
    isError: isPortsError,
    error: portsError,
    refetch: refetchPorts,
  } = usePorts(200);

  const { data: vesselsData, isLoading: isLoadingVessels } = useVessels(50);

  const ports: Port[] = useMemo(() => portsData?.ports || [], [portsData]);
  const fleetVessels = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  // Track if user explicitly cleared port selection
  const [hasUserClearedPort, setHasUserClearedPort] = useState(false);

  // Active port selection (null until ports load or user clears)
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<PortWorkspaceTab>('overview');

  // Date range filter
  const [dateRange, setDateRange] = useState<PortDateRange>('30d');

  // Activity filters
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'arriving' | 'waiting' | 'operating'>('all');
  const [terminalFilter, setTerminalFilter] = useState<string>('all');

  // Comparison state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparePortId, setComparePortId] = useState<number | null>(null);

  // Global directory modal
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  // Auto-select initial port once ports catalog has loaded (unless cleared)
  useEffect(() => {
    if (selectedPortId === null && !hasUserClearedPort && ports.length > 0) {
      const rotterdam = ports.find((p) => p.name.toLowerCase().includes('rotterdam'));
      setSelectedPortId(rotterdam ? rotterdam.id : ports[0].id);
    }
  }, [ports, selectedPortId, hasUserClearedPort]);

  // Resolved active port (strictly null if no valid port selected)
  const activePort: Port | null = useMemo(() => {
    if (selectedPortId === null || ports.length === 0) return null;
    const found = ports.find((p) => p.id === selectedPortId);
    return found || null;
  }, [ports, selectedPortId]);

  // Resolved comparison port
  const comparePort: Port | null = useMemo(() => {
    if (!activePort || ports.length < 2) return null;

    if (comparePortId !== null) {
      const found = ports.find((p) => p.id === comparePortId);
      if (found && found.id !== activePort.id) return found;
    }

    // Default comparison hub: Singapore if available and not active, otherwise first alternative
    const alt =
      ports.find((p) => p.name.toLowerCase().includes('singapore') && p.id !== activePort.id) ||
      ports.find((p) => p.id !== activePort.id) ||
      null;

    return alt;
  }, [ports, comparePortId, activePort]);

  // Core active port intelligence payload (only computed when activePort is valid)
  const payload: PortInsightPayload | null = useMemo(() => {
    if (!activePort) return null;
    return PortInsightsService.getPortInsight(activePort, fleetVessels);
  }, [activePort, fleetVessels]);

  // Comparison payload (only computed when comparePort is valid)
  const comparePayload: PortInsightPayload | null = useMemo(() => {
    if (!comparePort) return null;
    return PortInsightsService.getPortInsight(comparePort, fleetVessels);
  }, [comparePort, fleetVessels]);

  // Comparison analysis (requires both payloads)
  const comparisonResult: PortComparisonResult | null = useMemo(() => {
    if (!payload || !comparePayload) return null;
    return PortAnalyticsEngine.comparePorts(payload, comparePayload);
  }, [payload, comparePayload]);

  // Filtered vessel activities
  const filteredActivities: PortVesselActivity[] = useMemo(() => {
    if (!payload) return [];
    return payload.activities.filter((act) => {
      if (activityStatusFilter !== 'all' && act.status !== activityStatusFilter) return false;
      if (terminalFilter !== 'all' && act.terminal_name !== terminalFilter) return false;
      return true;
    });
  }, [payload, activityStatusFilter, terminalFilter]);

  // Filtered historical visits
  const filteredHistoricalVisits: PortHistoricalVisit[] = useMemo(() => {
    if (!payload) return [];
    return PortAnalyticsEngine.filterHistoricalVisits(payload.historicalVisits, dateRange);
  }, [payload, dateRange]);

  // Actions
  const handleSelectPort = useCallback((portId: number) => {
    setSelectedPortId(portId);
    setHasUserClearedPort(false);
  }, []);

  const handleClearPort = useCallback(() => {
    setSelectedPortId(null);
    setHasUserClearedPort(true);
  }, []);

  const handleExportCsv = useCallback(() => {
    if (payload) {
      PortInsightsService.exportPortToCsv(payload);
    }
  }, [payload]);

  const handleRefresh = useCallback(() => {
    refetchPorts();
  }, [refetchPorts]);

  return {
    ports,
    activePort,
    comparePort,
    payload,
    comparePayload,
    comparisonResult,
    filteredActivities,
    filteredHistoricalVisits,
    isLoading: isLoadingPorts || (isLoadingVessels && ports.length === 0),
    isError: isPortsError,
    error: portsError,

    // State
    activeTab,
    dateRange,
    activityStatusFilter,
    terminalFilter,
    isCompareModalOpen,
    isDirectoryOpen,

    // Setters & Actions
    setActiveTab,
    setDateRange,
    setActivityStatusFilter,
    setTerminalFilter,
    setIsCompareModalOpen,
    setIsDirectoryOpen,
    setComparePortId,
    handleSelectPort,
    handleClearPort,
    handleExportCsv,
    handleRefresh,
  };
}
