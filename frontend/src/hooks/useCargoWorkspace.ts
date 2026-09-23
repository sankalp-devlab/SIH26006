/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 9: useCargoWorkspace Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CargoWorkspaceService } from '../services/cargo/cargo-workspace.service';
import { usePorts } from './usePorts';
import { useVessels } from './useVessels';
import type {
  CargoRecord,
  CargoFiltersState,
  VesselMatchInfo,
} from '../types/cargo';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export function useCargoWorkspace(initialFilters?: Partial<CargoFiltersState>) {
  const queryClient = useQueryClient();

  // Load supporting maritime registries
  const { data: portsData } = usePorts(100);
  const { data: vesselsData } = useVessels(100);

  const ports = useMemo(() => portsData?.ports || [], [portsData]);
  const vessels = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  // Operational View Mode
  const [viewMode, setViewMode] = useState<'table' | 'zones' | 'duplicates'>('table');

  // Multi-select Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Toast feedback
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Filter State
  const [filters, setFilters] = useState<CargoFiltersState>({
    searchQuery: '',
    source: 'all',
    status: 'all',
    priority: 'all',
    zone: 'all',
    cargoType: 'all',
    validationStatus: 'all',
    vesselMatchStatus: 'all',
    scope: 'all',
    showArchived: false,
    ...initialFilters,
  });

  // Modal / Drawer states
  const [selectedCargo, setSelectedCargo] = useState<CargoRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [mergeTarget, setMergeTarget] = useState<{ primary: CargoRecord; duplicate: CargoRecord } | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const [vesselMatchTarget, setVesselMatchTarget] = useState<CargoRecord | null>(null);
  const [isVesselMatchModalOpen, setIsVesselMatchModalOpen] = useState(false);

  const [compareTargets, setCompareTargets] = useState<CargoRecord[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [shareTarget, setShareTarget] = useState<CargoRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  // Main Cargo Query
  const {
    data: allCargos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cargo-workspace'],
    queryFn: () => CargoWorkspaceService.getCargoRecords(ports, vessels),
    staleTime: 1000 * 60 * 2,
  });

  // Filtered Cargos
  const filteredCargos = useMemo(() => {
    return CargoWorkspaceService.filterCargos(allCargos, filters);
  }, [allCargos, filters]);

  // Metrics summary
  const analytics = useMemo(() => {
    return CargoWorkspaceService.calculateAnalytics(allCargos);
  }, [allCargos]);

  // Distinct values for filter dropdowns
  const filterOptions = useMemo(() => {
    const sources = Array.from(new Set(allCargos.map((c) => c.source)));
    const categories = Array.from(new Set(allCargos.map((c) => c.cargo_type)));
    const zones = Array.from(new Set(allCargos.map((c) => c.zone)));
    return { sources, categories, zones };
  }, [allCargos]);

  // Multi-select handlers
  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((items: CargoRecord[]) => {
    setSelectedIds((prev) => {
      if (prev.size === items.length && items.length > 0) {
        return new Set();
      }
      return new Set(items.map((c) => c.id));
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Action handlers
  const handleOpenDetail = useCallback((cargo: CargoRecord) => {
    setSelectedCargo(cargo);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleValidateSingle = useCallback((cargoId: number) => {
    CargoWorkspaceService.markAsValidated(cargoId);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Consignment validated successfully.`);
    if (selectedCargo && selectedCargo.id === cargoId) {
      setSelectedCargo((prev) => (prev ? { ...prev, validation_status: 'valid', validation_issues: [] } : null));
    }
  }, [queryClient, selectedCargo, showToast]);

  const handleValidateSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      CargoWorkspaceService.markAsValidated(id);
    });
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Validated ${selectedIds.size} selected consignments.`);
    handleClearSelection();
  }, [selectedIds, queryClient, showToast, handleClearSelection]);

  const handleOpenVesselMatch = useCallback((cargo: CargoRecord) => {
    setVesselMatchTarget(cargo);
    setIsVesselMatchModalOpen(true);
  }, []);

  const handleAssignVessel = useCallback((cargoId: number, match: VesselMatchInfo) => {
    CargoWorkspaceService.assignVesselMatch(cargoId, match);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    setIsVesselMatchModalOpen(false);
    showToast(`Assigned vessel ${match.vessel_name} to consignment.`);
    if (selectedCargo && selectedCargo.id === cargoId) {
      setSelectedCargo((prev) => (prev ? { ...prev, matched_vessel: match, status: 'matched' } : null));
    }
  }, [queryClient, selectedCargo, showToast]);

  const handleUnmatchVessel = useCallback((cargoId: number) => {
    CargoWorkspaceService.unmatchVessel(cargoId);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Vessel allocation removed.`);
    if (selectedCargo && selectedCargo.id === cargoId) {
      setSelectedCargo((prev) => (prev ? { ...prev, matched_vessel: null, status: 'validated' } : null));
    }
  }, [queryClient, selectedCargo, showToast]);

  const handleArchiveSingle = useCallback((cargoId: number) => {
    CargoWorkspaceService.archiveCargo(cargoId);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Consignment moved to archive.`, 'info');
    if (selectedCargo && selectedCargo.id === cargoId) {
      setIsDrawerOpen(false);
    }
  }, [queryClient, selectedCargo, showToast]);

  const handleArchiveSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      CargoWorkspaceService.archiveCargo(id);
    });
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Archived ${selectedIds.size} consignments.`, 'info');
    handleClearSelection();
  }, [selectedIds, queryClient, showToast, handleClearSelection]);

  const handleRestoreSingle = useCallback((cargoId: number) => {
    CargoWorkspaceService.restoreCargo(cargoId);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    showToast(`Consignment restored from archive.`);
  }, [queryClient, showToast]);

  const handleOpenMerge = useCallback((primary: CargoRecord, duplicate: CargoRecord) => {
    setMergeTarget({ primary, duplicate });
    setIsMergeModalOpen(true);
  }, []);

  const handleConfirmMerge = useCallback((primaryId: number, duplicateId: number, fields: Partial<CargoRecord>) => {
    CargoWorkspaceService.mergeCargoes(primaryId, duplicateId, fields);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    setIsMergeModalOpen(false);
    showToast(`Consignments successfully merged.`);
  }, [queryClient, showToast]);

  const handleOpenCompare = useCallback((cargos: CargoRecord[]) => {
    setCompareTargets(cargos);
    setIsCompareModalOpen(true);
  }, []);

  const handleOpenShare = useCallback((cargo: CargoRecord) => {
    setShareTarget(cargo);
    setIsShareModalOpen(true);
  }, []);

  const handleIngestNewCargo = useCallback((payload: Partial<CargoRecord>) => {
    const created = CargoWorkspaceService.ingestCargo(payload);
    queryClient.invalidateQueries({ queryKey: ['cargo-workspace'] });
    setIsIngestModalOpen(false);
    showToast(`Ingested ${created.reference_number} from channel ${created.source.toUpperCase()}.`);
  }, [queryClient, showToast]);

  return {
    allCargos,
    filteredCargos,
    analytics,
    ports,
    vessels,
    isLoading,
    isError,
    error,
    refetch,
    filterOptions,

    // View mode
    viewMode,
    setViewMode,

    // Filter controls
    filters,
    setFilters,

    // Selection
    selectedIds,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,

    // Modals & Drawers
    selectedCargo,
    isDrawerOpen,
    handleOpenDetail,
    handleCloseDetail,

    mergeTarget,
    isMergeModalOpen,
    setIsMergeModalOpen,
    handleOpenMerge,
    handleConfirmMerge,

    vesselMatchTarget,
    isVesselMatchModalOpen,
    setIsVesselMatchModalOpen,
    handleOpenVesselMatch,
    handleAssignVessel,
    handleUnmatchVessel,

    compareTargets,
    isCompareModalOpen,
    setIsCompareModalOpen,
    handleOpenCompare,

    shareTarget,
    isShareModalOpen,
    setIsShareModalOpen,
    handleOpenShare,

    isCreateModalOpen,
    setIsCreateModalOpen,

    isIngestModalOpen,
    setIsIngestModalOpen,
    handleIngestNewCargo,

    // Operational Actions
    handleValidateSingle,
    handleValidateSelected,
    handleArchiveSingle,
    handleArchiveSelected,
    handleRestoreSingle,

    // Feedback
    toasts,
    showToast,
  };
}
