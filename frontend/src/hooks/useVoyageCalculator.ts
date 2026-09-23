/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: useVoyageCalculator Hook
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VoyageCalculatorService } from '../services/voyage-calculator/voyage-calculator.service';
import { VoyageEngine } from '../services/voyage-calculator/voyage-engine';
import { useVessels } from './useVessels';
import { usePorts } from './usePorts';
import type {
  VoyageCalculationRecord,
  VoyageWorkbook,
  VoyageCargoItem,
  VoyageLegItem,
  VoyageMode,
  VoyageEconomicsResult,
} from '../types/voyage-calculator';

export interface VoyageToast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function useVoyageCalculator() {
  const queryClient = useQueryClient();

  // Load supporting entities from fleet and ports databases
  const { data: vesselsData } = useVessels(100);
  const { data: portsData } = usePorts(100);

  const vessels = useMemo(() => vesselsData?.vessels || [], [vesselsData]);
  const ports = useMemo(() => portsData?.ports || [], [portsData]);

  // Toast feedback
  const [toasts, setToasts] = useState<VoyageToast[]>([]);
  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // Load Workbooks
  const {
    data: workbooks = [],
    isLoading,
    refetch: refetchWorkbooks,
  } = useQuery({
    queryKey: ['voyage-workbooks'],
    queryFn: () => VoyageCalculatorService.getWorkbooks(),
    staleTime: 1000 * 60 * 5,
  });

  // State: Active Workbook & Active Voyage
  const [activeWorkbookId, setActiveWorkbookId] = useState<string>('wb-01');
  const [activeVoyage, setActiveVoyage] = useState<VoyageCalculationRecord | null>(null);

  // Active Workspace Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'commercial' | 'cargo' | 'legs' | 'bunkers' | 'scenarios' | 'notes'
  >('overview');

  // Active Scenario Tab
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-base');

  // Workbooks Management Modal State
  const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState(false);

  // Synchronize active workbook and active voyage when workbooks data loads
  useEffect(() => {
    if (workbooks.length > 0 && !activeVoyage) {
      const currentWb = workbooks.find((w) => w.id === activeWorkbookId) || workbooks[0];
      if (currentWb && currentWb.voyages.length > 0) {
        setActiveWorkbookId(currentWb.id);
        const targetVoyage =
          currentWb.voyages.find((v) => v.id === currentWb.active_voyage_id) || currentWb.voyages[0];
        setActiveVoyage(JSON.parse(JSON.stringify(targetVoyage)));
      }
    }
  }, [workbooks, activeWorkbookId, activeVoyage]);

  // Pure Calculation Engine: Compute Economics Result whenever activeVoyage changes
  const baseResult: VoyageEconomicsResult = useMemo(() => {
    if (!activeVoyage) {
      return {
        total_sea_days: 0,
        total_port_days: 0,
        total_voyage_days: 0,
        total_distance_nm: 0,
        total_fuel_consumed_mt: 0,
        sea_fuel_cost_usd: 0,
        port_fuel_cost_usd: 0,
        total_fuel_cost_usd: 0,
        gross_freight_revenue: 0,
        total_commissions_usd: 0,
        net_freight_revenue: 0,
        ballast_bonus_usd: 0,
        total_revenue_usd: 0,
        canal_costs_usd: 0,
        port_costs_usd: 0,
        vessel_hire_cost_usd: 0,
        extra_costs_usd: 0,
        co2_emissions_mt: 0,
        ets_taxable_emissions_mt: 0,
        eu_ets_cost_usd: 0,
        total_voyage_costs_usd: 0,
        voyage_costs_ex_hire_usd: 0,
        net_pnl_usd: 0,
        daily_pnl_usd: 0,
        tce_usd_day: 0,
        cargo_results: [],
        leg_results: [],
        total_allocated_cargo_mt: 0,
        capacity_utilization_pct: 0,
        is_overloaded: false,
      };
    }
    return VoyageEngine.calculateVoyage(activeVoyage);
  }, [activeVoyage]);

  // Precompute Scenario Comparison Matrix
  const scenarioResults: Record<string, VoyageEconomicsResult> = useMemo(() => {
    if (!activeVoyage) return {};

    const results: Record<string, VoyageEconomicsResult> = {
      'sc-base': baseResult,
    };

    activeVoyage.scenarios.forEach((sc) => {
      if (sc.type !== 'base') {
        results[sc.id] = VoyageEngine.calculateScenario(activeVoyage, sc.overrides);
      }
    });

    return results;
  }, [activeVoyage, baseResult]);

  // Current Active Result (either Base or Selected Scenario)
  const currentResult = useMemo(() => {
    return scenarioResults[activeScenarioId] || baseResult;
  }, [scenarioResults, activeScenarioId, baseResult]);

  // Action: Update Voyage Fields
  const updateVoyage = useCallback((partial: Partial<VoyageCalculationRecord>) => {
    setActiveVoyage((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  // Action: Switch Voyage Mode (Dry vs Tanker)
  const setVoyageMode = useCallback((mode: VoyageMode) => {
    setActiveVoyage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        mode,
        cargoes: prev.cargoes.map((c) => ({
          ...c,
          freight_rate_type: mode === 'tanker' ? 'worldscale' : 'per_mt',
          worldscale_flat_rate: mode === 'tanker' ? 24.5 : undefined,
          worldscale_pct: mode === 'tanker' ? 65 : undefined,
        })),
      };
    });
  }, []);

  // Action: Select Vessel from Fleet
  const selectVessel = useCallback(
    (vesselId: number) => {
      const found = vessels.find((v) => v.id === vesselId);
      if (!found || !activeVoyage) return;

      const dwt = found.capacity_tons || 120000;
      const ladenSpeed = found.speed_laden_knots || 13.0;
      const ballastSpeed = found.speed_ballast_knots || 14.0;
      const ladenFuel = found.fuel_laden_mt_day || 38.0;
      const ballastFuel = found.fuel_ballast_mt_day || 32.0;

      updateVoyage({
        vessel_id: found.id,
        vessel_name: found.name,
        vessel_type: found.vessel_type || activeVoyage.vessel_type,
        vessel_dwt: dwt,
        speed_laden_knots: ladenSpeed,
        speed_ballast_knots: ballastSpeed,
        fuel_laden_mt_day: ladenFuel,
        fuel_ballast_mt_day: ballastFuel,
      });

      showToast(`Vessel ${found.name} loaded with fleet consumption curves.`);
    },
    [vessels, activeVoyage, updateVoyage, showToast]
  );

  // Multi-Cargo Actions
  const addCargo = useCallback(() => {
    if (!activeVoyage) return;
    const newId = `cg-${Date.now().toString().slice(-4)}`;
    const newCargo: VoyageCargoItem = {
      id: newId,
      name: `Cargo Parcel ${activeVoyage.cargoes.length + 1}`,
      commodity: activeVoyage.mode === 'tanker' ? 'Arabian Light Crude' : 'Steam Coal',
      quantity_mt: Math.round(activeVoyage.vessel_dwt * 0.45),
      freight_rate: activeVoyage.mode === 'tanker' ? 65 : 22.5,
      freight_rate_type: activeVoyage.mode === 'tanker' ? 'worldscale' : 'per_mt',
      worldscale_flat_rate: activeVoyage.mode === 'tanker' ? 22.5 : undefined,
      worldscale_pct: activeVoyage.mode === 'tanker' ? 65 : undefined,
      currency: 'USD',
      commission_pct: 2.5,
      load_port_id: ports[0]?.id || 101,
      load_port_name: ports[0]?.name || 'Load Port',
      load_rate_mt_day: activeVoyage.mode === 'tanker' ? 45000 : 18000,
      discharge_port_id: ports[1]?.id || 102,
      discharge_port_name: ports[1]?.name || 'Discharge Port',
      discharge_rate_mt_day: activeVoyage.mode === 'tanker' ? 40000 : 15000,
    };

    updateVoyage({
      cargoes: [...activeVoyage.cargoes, newCargo],
    });
    showToast(`Added ${newCargo.name} parcel.`);
  }, [activeVoyage, ports, updateVoyage, showToast]);

  const updateCargo = useCallback(
    (index: number, partial: Partial<VoyageCargoItem>) => {
      if (!activeVoyage) return;
      const updated = activeVoyage.cargoes.map((c, i) => (i === index ? { ...c, ...partial } : c));
      updateVoyage({ cargoes: updated });
    },
    [activeVoyage, updateVoyage]
  );

  const removeCargo = useCallback(
    (index: number) => {
      if (!activeVoyage || activeVoyage.cargoes.length <= 1) {
        showToast('Voyage must contain at least 1 cargo parcel.', 'warning');
        return;
      }
      const removed = activeVoyage.cargoes[index];
      const updated = activeVoyage.cargoes.filter((_, i) => i !== index);
      updateVoyage({ cargoes: updated });
      showToast(`Removed parcel ${removed.name}.`, 'info');
    },
    [activeVoyage, updateVoyage, showToast]
  );

  // Multi-Port & Leg Actions
  const addLeg = useCallback(() => {
    if (!activeVoyage) return;
    const lastLeg = activeVoyage.legs[activeVoyage.legs.length - 1];
    const newSeq = activeVoyage.legs.length + 1;

    // Default origin is last leg's destination
    const originId = lastLeg ? lastLeg.destination_port_id : ports[0]?.id || 101;
    const originPort = ports.find((p) => p.id === originId) || ports[0];
    const destPort = ports.find((p) => p.id !== originId) || ports[1] || ports[0];

    const dist = VoyageEngine.estimateNauticalDistance(
      originPort?.latitude || 0,
      originPort?.longitude || 0,
      destPort?.latitude || 0,
      destPort?.longitude || 0
    );

    const newLeg: VoyageLegItem = {
      id: `leg-${Date.now().toString().slice(-4)}`,
      sequence: newSeq,
      leg_type: 'laden',
      origin_port_id: originPort?.id || 101,
      origin_port_name: originPort?.name || 'Origin',
      origin_country: originPort?.country || '',
      origin_lat: originPort?.latitude || 0,
      origin_lng: originPort?.longitude || 0,
      destination_port_id: destPort?.id || 102,
      destination_port_name: destPort?.name || 'Destination',
      destination_country: destPort?.country || '',
      destination_lat: destPort?.latitude || 0,
      destination_lng: destPort?.longitude || 0,
      distance_nm: dist || 1500,
      is_distance_manual: false,
      auto_distance_nm: dist || 1500,
      speed_knots: activeVoyage.speed_laden_knots || 13.0,
      is_seca: false,
      fuel_type: 'VLSFO',
      canal: 'none',
      canal_cost: 0,
      weather_margin_pct: activeVoyage.weather_margin_pct || 5.0,
    };

    updateVoyage({
      legs: [...activeVoyage.legs, newLeg],
    });
    showToast(`Added Leg #${newSeq}: ${newLeg.origin_port_name} → ${newLeg.destination_port_name}.`);
  }, [activeVoyage, ports, updateVoyage, showToast]);

  const updateLeg = useCallback(
    (index: number, partial: Partial<VoyageLegItem>) => {
      if (!activeVoyage) return;
      const updated = activeVoyage.legs.map((l, i) => {
        if (i !== index) return l;

        const merged = { ...l, ...partial };

        // If origin or destination changed and distance is not manual, re-estimate nautical distance
        if (
          (partial.origin_port_id !== undefined || partial.destination_port_id !== undefined) &&
          !merged.is_distance_manual
        ) {
          const orig = ports.find((p) => p.id === merged.origin_port_id);
          const dest = ports.find((p) => p.id === merged.destination_port_id);
          if (orig && dest) {
            const autoDist = VoyageEngine.estimateNauticalDistance(
              orig.latitude || 0,
              orig.longitude || 0,
              dest.latitude || 0,
              dest.longitude || 0
            );
            merged.auto_distance_nm = autoDist;
            merged.distance_nm = autoDist;
          }
        }

        return merged;
      });

      updateVoyage({ legs: updated });
    },
    [activeVoyage, ports, updateVoyage]
  );

  const toggleManualDistance = useCallback(
    (index: number) => {
      if (!activeVoyage) return;
      const leg = activeVoyage.legs[index];
      if (!leg) return;

      if (leg.is_distance_manual) {
        // Reset to auto distance
        updateLeg(index, {
          is_distance_manual: false,
          distance_nm: leg.auto_distance_nm,
        });
        showToast(`Reset Leg #${leg.sequence} to auto nautical distance (${leg.auto_distance_nm} NM).`);
      } else {
        // Enable manual override
        updateLeg(index, {
          is_distance_manual: true,
        });
        showToast(`Manual distance override enabled for Leg #${leg.sequence}.`);
      }
    },
    [activeVoyage, updateLeg, showToast]
  );

  const removeLeg = useCallback(
    (index: number) => {
      if (!activeVoyage || activeVoyage.legs.length <= 1) {
        showToast('Voyage rotation must contain at least 1 leg.', 'warning');
        return;
      }
      const updated = activeVoyage.legs
        .filter((_, i) => i !== index)
        .map((l, i) => ({ ...l, sequence: i + 1 }));
      updateVoyage({ legs: updated });
      showToast(`Removed Leg #${index + 1}.`, 'info');
    },
    [activeVoyage, updateVoyage, showToast]
  );

  // Action: Save Current Voyage into Workbook
  const saveCurrentVoyage = useCallback(async () => {
    if (!activeVoyage) return;

    const currentWb = workbooks.find((w) => w.id === activeWorkbookId);
    if (!currentWb) return;

    const existingIdx = currentWb.voyages.findIndex((v) => v.id === activeVoyage.id);
    const updatedVoyages = [...currentWb.voyages];

    const updatedVoyage = {
      ...activeVoyage,
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      updatedVoyages[existingIdx] = updatedVoyage;
    } else {
      updatedVoyages.unshift(updatedVoyage);
    }

    const updatedWb: VoyageWorkbook = {
      ...currentWb,
      voyages: updatedVoyages,
      active_voyage_id: updatedVoyage.id,
      updated_at: new Date().toISOString(),
    };

    await VoyageCalculatorService.saveWorkbook(updatedWb);
    queryClient.invalidateQueries({ queryKey: ['voyage-workbooks'] });
    setActiveVoyage(updatedVoyage);
    showToast(`Voyage "${updatedVoyage.name}" saved to workbook.`);
  }, [activeVoyage, activeWorkbookId, workbooks, queryClient, showToast]);

  // Action: Duplicate Current Voyage
  const duplicateCurrentVoyage = useCallback(async () => {
    if (!activeVoyage) return;
    const duplicated = VoyageCalculatorService.duplicateVoyage(activeVoyage);

    const currentWb = workbooks.find((w) => w.id === activeWorkbookId);
    if (!currentWb) return;

    const updatedWb: VoyageWorkbook = {
      ...currentWb,
      voyages: [duplicated, ...currentWb.voyages],
      active_voyage_id: duplicated.id,
      updated_at: new Date().toISOString(),
    };

    await VoyageCalculatorService.saveWorkbook(updatedWb);
    queryClient.invalidateQueries({ queryKey: ['voyage-workbooks'] });
    setActiveVoyage(duplicated);
    showToast(`Duplicated as "${duplicated.name}".`);
  }, [activeVoyage, activeWorkbookId, workbooks, queryClient, showToast]);

  // Action: Switch Workbook
  const switchWorkbook = useCallback(
    (workbookId: string) => {
      const found = workbooks.find((w) => w.id === workbookId);
      if (!found) return;
      setActiveWorkbookId(found.id);
      const activeV = found.voyages.find((v) => v.id === found.active_voyage_id) || found.voyages[0];
      if (activeV) {
        setActiveVoyage(JSON.parse(JSON.stringify(activeV)));
      }
      showToast(`Switched to workbook: ${found.name}.`);
    },
    [workbooks, showToast]
  );

  // Action: Export CSV Recap
  const exportCSV = useCallback(() => {
    if (!activeVoyage) return;
    try {
      VoyageCalculatorService.exportToCSV(activeVoyage, currentResult);
      showToast(`Exported voyage recap to CSV.`);
    } catch {
      showToast('Failed to export CSV.', 'error');
    }
  }, [activeVoyage, currentResult, showToast]);

  return {
    // State
    workbooks,
    activeWorkbookId,
    activeVoyage,
    activeTab,
    setActiveTab,
    activeScenarioId,
    setActiveScenarioId,
    isLoading,
    refetchWorkbooks,
    vessels,
    ports,
    toasts,

    // Modals
    isWorkbookModalOpen,
    setIsWorkbookModalOpen,

    // Economics Results
    baseResult,
    scenarioResults,
    currentResult,

    // Handlers
    updateVoyage,
    setVoyageMode,
    selectVessel,
    addCargo,
    updateCargo,
    removeCargo,
    addLeg,
    updateLeg,
    toggleManualDistance,
    removeLeg,
    saveCurrentVoyage,
    duplicateCurrentVoyage,
    switchWorkbook,
    exportCSV,
    showToast,
  };
}
