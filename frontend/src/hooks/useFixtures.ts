/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: useFixtures Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FixturesService } from '../services/fixtures/fixtures.service';
import { useVessels } from './useVessels';
import { usePorts } from './usePorts';
import type {
  FixtureRecord,
  FixtureFiltersState,
  CreateFixturePayload,
  FixtureStatus,
} from '../types/fixture';

export interface FixtureToast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function useFixtures(initialFilters?: Partial<FixtureFiltersState>) {
  const queryClient = useQueryClient();

  // Load supporting entities
  const { data: vesselsData } = useVessels(100);
  const { data: portsData } = usePorts(100);

  const vessels = useMemo(() => vesselsData?.vessels || [], [vesselsData]);
  const ports = useMemo(() => portsData?.ports || [], [portsData]);

  // Operational Tab Mode
  const [activeTab, setActiveTab] = useState<'active' | 'historical' | 'multi_port'>('active');

  // Filters State
  const [filters, setFilters] = useState<FixtureFiltersState>({
    searchQuery: '',
    status: 'all',
    vesselId: 'all',
    charterer: 'all',
    currency: 'all',
    rateType: 'all',
    portName: 'all',
    cargoCategory: 'all',
    laycanRange: 'all',
    ...initialFilters,
  });

  // Modals and Drawers
  const [selectedFixture, setSelectedFixture] = useState<FixtureRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<FixtureRecord | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<FixtureRecord | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<FixtureRecord | null>(null);

  // Toast Feedback
  const [toasts, setToasts] = useState<FixtureToast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Main Query
  const {
    data: allFixtures = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fixtures-workspace'],
    queryFn: () => FixturesService.getFixtures(),
    staleTime: 1000 * 60 * 2,
  });

  // Filtered Fixtures
  const filteredFixtures = useMemo(() => {
    return FixturesService.filterFixtures(allFixtures, filters, activeTab);
  }, [allFixtures, filters, activeTab]);

  // Analytics
  const analytics = useMemo(() => {
    return FixturesService.calculateAnalytics(allFixtures);
  }, [allFixtures]);

  // Distinct filter options
  const filterOptions = useMemo(() => {
    const charterers = Array.from(new Set(allFixtures.map((f) => f.charterer))).filter(Boolean);
    const cargoCategories = Array.from(new Set(allFixtures.map((f) => f.cargo_type))).filter(Boolean);
    return { charterers, cargoCategories };
  }, [allFixtures]);

  // Handlers
  const handleOpenDetail = useCallback((fixture: FixtureRecord) => {
    setSelectedFixture(fixture);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingFixture(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((fixture: FixtureRecord) => {
    setEditingFixture(fixture);
    setIsModalOpen(true);
  }, []);

  const handleOpenStatusModal = useCallback((fixture: FixtureRecord) => {
    setStatusTarget(fixture);
    setIsStatusModalOpen(true);
  }, []);

  const handleOpenShare = useCallback((fixture: FixtureRecord) => {
    setShareTarget(fixture);
    setIsShareModalOpen(true);
  }, []);

  const handleSaveFixture = useCallback(
    async (payload: CreateFixturePayload) => {
      try {
        if (editingFixture) {
          const updated = await FixturesService.updateFixture(editingFixture.id, payload);
          queryClient.invalidateQueries({ queryKey: ['fixtures-workspace'] });
          setIsModalOpen(false);
          showToast(`Fixture ${updated.fixture_reference} updated successfully.`);
          if (selectedFixture && selectedFixture.id === updated.id) {
            setSelectedFixture(updated);
          }
        } else {
          const created = await FixturesService.createFixture(payload);
          queryClient.invalidateQueries({ queryKey: ['fixtures-workspace'] });
          setIsModalOpen(false);
          showToast(`Fixture ${created.fixture_reference} registered in chartering desk.`);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to save fixture', 'error');
      }
    },
    [editingFixture, queryClient, selectedFixture, showToast]
  );

  const handleTransitionStatus = useCallback(
    async (id: string, newStatus: FixtureStatus, reason: string) => {
      try {
        const updated = await FixturesService.updateFixtureStatus(id, newStatus, reason);
        queryClient.invalidateQueries({ queryKey: ['fixtures-workspace'] });
        setIsStatusModalOpen(false);

        const statusLabel =
          newStatus === 'on_subjects'
            ? 'placed on subjects'
            : newStatus === 'fully_fixed'
            ? 'fully fixed'
            : newStatus === 'failed'
            ? 'marked as failed'
            : 'updated to draft';

        showToast(`Fixture ${updated.fixture_reference} is now ${statusLabel}.`, newStatus === 'fully_fixed' ? 'success' : 'info');

        if (selectedFixture && selectedFixture.id === id) {
          setSelectedFixture(updated);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to transition status', 'error');
      }
    },
    [queryClient, selectedFixture, showToast]
  );

  return {
    allFixtures,
    filteredFixtures,
    analytics,
    vessels,
    ports,
    isLoading,
    isError,
    error,
    refetch,
    filterOptions,

    // Tab state
    activeTab,
    setActiveTab,

    // Filter controls
    filters,
    setFilters,

    // Modals & Drawers
    selectedFixture,
    isDrawerOpen,
    handleOpenDetail,
    handleCloseDetail,

    isModalOpen,
    setIsModalOpen,
    editingFixture,
    handleOpenCreate,
    handleOpenEdit,
    handleSaveFixture,

    isStatusModalOpen,
    setIsStatusModalOpen,
    statusTarget,
    handleOpenStatusModal,
    handleTransitionStatus,

    isShareModalOpen,
    setIsShareModalOpen,
    shareTarget,
    handleOpenShare,

    // Notifications & Feedback
    toasts,
    showToast,
  };
}
