/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Custom Hook
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistanceEngine } from '../services/distance-calculator/distance-engine';
import { DistanceCalculatorService } from '../services/distance-calculator/distance-calculator.service';
import { usePorts } from './usePorts';
import { useVessels } from './useVessels';
import { MapDataService } from '../services/map/map-data.service';
import type {
  RoutingMode,
  RoutePreference,
  DistanceCalculationRecord,
  DistanceCalculationResult,
  RouteAlternativeOption,
  RoutingPoint,
  GeoCoordinate,
} from '../types/distance-calculator';
import type { Port } from '../types/port';
import type { Vessel } from '../types/vessel';

export function useDistanceCalculator() {
  const navigate = useNavigate();

  // Load backend data
  const { data: portsData, isLoading: isLoadingPorts } = usePorts(200);
  const { data: vesselsData, isLoading: isLoadingVessels } = useVessels(50);

  const ports: Port[] = useMemo(() => portsData?.ports || [], [portsData]);
  const vessels: Vessel[] = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  // Enrich vessels with live/seed AIS positions
  const enrichedVessels = useMemo(() => {
    return MapDataService.enrichVesselsWithPositions(vessels);
  }, [vessels]);

  // Workbook state
  const [workbook, setWorkbook] = useState(() => DistanceCalculatorService.getWorkbook());
  const [activeRecordId, setActiveRecordId] = useState(() => workbook.active_id);

  // Active record
  const currentRecord = useMemo(() => {
    const found = workbook.calculations.find((c) => c.id === activeRecordId);
    return found || workbook.calculations[0];
  }, [workbook, activeRecordId]);

  // Map of ports by ID for O(1) lookups
  const portMap = useMemo(() => {
    const map = new Map<number, Port>();
    for (const p of ports) {
      map.set(p.id, p);
    }
    return map;
  }, [ports]);

  // Helper to persist changes
  const updateCurrentRecord = useCallback(
    (updater: (prev: DistanceCalculationRecord) => DistanceCalculationRecord) => {
      setWorkbook((prevWb) => {
        const targetIndex = prevWb.calculations.findIndex((c) => c.id === activeRecordId);
        if (targetIndex < 0) return prevWb;

        const current = prevWb.calculations[targetIndex];
        const updated = updater(current);
        updated.updated_at = new Date().toISOString();

        const updatedCalculations = [...prevWb.calculations];
        updatedCalculations[targetIndex] = updated;

        const nextWb = {
          ...prevWb,
          calculations: updatedCalculations,
        };
        DistanceCalculatorService.saveWorkbook(nextWb);
        return nextWb;
      });
    },
    [activeRecordId]
  );

  // Selected Vessel (if mode === 'vessel_to_port')
  const selectedVessel = useMemo(() => {
    if (!currentRecord.vessel_id) return null;
    return vessels.find((v) => v.id === currentRecord.vessel_id) || null;
  }, [vessels, currentRecord.vessel_id]);

  const selectedVesselPosition = useMemo(() => {
    if (!currentRecord.vessel_id) return null;
    return enrichedVessels.find((ev) => ev.id === currentRecord.vessel_id) || null;
  }, [enrichedVessels, currentRecord.vessel_id]);

  // Origin coordinates resolution
  const resolvedOrigin = useMemo((): { name: string; lat: number; lng: number } => {
    if (currentRecord.mode === 'vessel_to_port' && selectedVesselPosition) {
      return {
        name: `${selectedVesselPosition.name} (AIS Pos)`,
        lat: selectedVesselPosition.latitude,
        lng: selectedVesselPosition.longitude,
      };
    }

    if (currentRecord.mode === 'point_to_port' && currentRecord.origin_point) {
      return {
        name: currentRecord.origin_point.name || 'Custom Offshore Point',
        lat: currentRecord.origin_point.latitude,
        lng: currentRecord.origin_point.longitude,
      };
    }

    // Default: port_to_port
    const originPort = currentRecord.origin_port_id ? portMap.get(currentRecord.origin_port_id) : null;
    if (originPort && originPort.latitude != null && originPort.longitude != null) {
      return {
        name: originPort.name,
        lat: originPort.latitude,
        lng: originPort.longitude,
      };
    }

    // Fallback: Ras Tanura
    return { name: 'Ras Tanura (Default)', lat: 26.65, lng: 50.16 };
  }, [currentRecord.mode, currentRecord.origin_port_id, currentRecord.origin_point, selectedVesselPosition, portMap]);

  // Destination coordinates resolution
  const resolvedDestination = useMemo((): { name: string; lat: number; lng: number } => {
    const destPort = currentRecord.destination_port_id ? portMap.get(currentRecord.destination_port_id) : null;
    if (destPort && destPort.latitude != null && destPort.longitude != null) {
      return {
        name: destPort.name,
        lat: destPort.latitude,
        lng: destPort.longitude,
      };
    }

    // Fallback: Rotterdam
    return { name: 'Rotterdam (Default)', lat: 51.96, lng: 4.02 };
  }, [currentRecord.destination_port_id, portMap]);

  // Core calculation result (Memoized & Reactive)
  const calculationResult: DistanceCalculationResult = useMemo(() => {
    return DistanceEngine.calculateRoute(
      currentRecord,
      resolvedOrigin,
      resolvedDestination,
      selectedVessel
    );
  }, [currentRecord, resolvedOrigin, resolvedDestination, selectedVessel]);

  // Route Alternatives (Shortest vs Piracy Avoidance vs SECA Avoidance)
  const routeAlternatives: RouteAlternativeOption[] = useMemo(() => {
    return DistanceEngine.generateRouteAlternatives(
      currentRecord,
      resolvedOrigin,
      resolvedDestination,
      selectedVessel
    );
  }, [currentRecord, resolvedOrigin, resolvedDestination, selectedVessel]);

  // Auto-fill vessel speed and draft when in vessel mode
  useEffect(() => {
    if (currentRecord.mode === 'vessel_to_port' && selectedVessel && !currentRecord.speed_knots) {
      updateCurrentRecord((prev) => ({
        ...prev,
        speed_knots: selectedVessel.speed_laden_knots || 13.5,
      }));
    }
  }, [currentRecord.mode, selectedVessel, currentRecord.speed_knots, updateCurrentRecord]);

  // --- ACTIONS ---

  const setMode = (mode: RoutingMode) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      mode,
      // If switching to vessel mode, default to first available vessel
      vessel_id: mode === 'vessel_to_port' ? prev.vessel_id || vessels[0]?.id || 1 : prev.vessel_id,
      // Reset manual overrides
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setOriginPortId = (portId: number) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      origin_port_id: portId,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setDestinationPortId = (portId: number) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      destination_port_id: portId,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setOriginPoint = (point: GeoCoordinate) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      origin_point: point,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setVesselId = (vesselId: number) => {
    const vessel = vessels.find((v) => v.id === vesselId);
    updateCurrentRecord((prev) => ({
      ...prev,
      vessel_id: vesselId,
      speed_knots: vessel?.speed_laden_knots || prev.speed_knots,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setSpeedKnots = (speed: number) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      speed_knots: Math.max(1, Math.min(30, Number(speed) || 13.5)),
    }));
  };

  const setWeatherMarginPct = (margin: number) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      weather_margin_pct: Math.max(0, Math.min(30, Number(margin) || 0)),
    }));
  };

  const setDepartureTime = (isoString: string) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      departure_time: isoString,
    }));
  };

  const setRoutePreference = (preference: RoutePreference) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      route_preference: preference,
      avoid_piracy: preference === 'avoid_piracy',
      allow_suez: preference !== 'avoid_piracy',
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const toggleAvoidPiracy = () => {
    updateCurrentRecord((prev) => ({
      ...prev,
      avoid_piracy: !prev.avoid_piracy,
      allow_suez: prev.avoid_piracy ? true : false,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const toggleAllowSuez = () => {
    updateCurrentRecord((prev) => ({
      ...prev,
      allow_suez: !prev.allow_suez,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const toggleAllowPanama = () => {
    updateCurrentRecord((prev) => ({
      ...prev,
      allow_panama: !prev.allow_panama,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const toggleAllowKiel = () => {
    updateCurrentRecord((prev) => ({
      ...prev,
      allow_kiel: !prev.allow_kiel,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
    }));
  };

  const setManualDistance = (distanceNm: number) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      is_distance_manual: true,
      manual_distance_override_nm: Math.max(10, Math.round(distanceNm)),
    }));
  };

  const resetManualDistance = () => {
    updateCurrentRecord((prev) => ({
      ...prev,
      is_distance_manual: false,
      manual_distance_override_nm: undefined,
      custom_waypoints: [],
    }));
  };

  const addCustomWaypoint = (wp: RoutingPoint) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      custom_waypoints: [...(prev.custom_waypoints || []), wp],
    }));
  };

  const removeCustomWaypoint = (id: string) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      custom_waypoints: (prev.custom_waypoints || []).filter((w) => w.id !== id),
    }));
  };

  const renameCalculation = (title: string) => {
    updateCurrentRecord((prev) => ({
      ...prev,
      title,
    }));
  };

  const duplicateCalculation = () => {
    const duplicated = DistanceCalculatorService.duplicateCalculation(activeRecordId);
    setWorkbook(DistanceCalculatorService.getWorkbook());
    setActiveRecordId(duplicated.id);
  };

  const switchCalculation = (id: string) => {
    setActiveRecordId(id);
    const wb = DistanceCalculatorService.getWorkbook();
    wb.active_id = id;
    DistanceCalculatorService.saveWorkbook(wb);
    setWorkbook(wb);
  };

  const deleteCalculation = (id: string) => {
    DistanceCalculatorService.deleteCalculation(id);
    const updated = DistanceCalculatorService.getWorkbook();
    setWorkbook(updated);
    setActiveRecordId(updated.active_id);
  };

  const exportCsv = () => {
    DistanceCalculatorService.exportToCsv(calculationResult, currentRecord);
  };

  const exportToVoyageCalculator = () => {
    const newVoyageId = DistanceCalculatorService.exportToVoyageCalculation(
      calculationResult,
      currentRecord,
      selectedVessel
    );
    navigate(`/voyage-calculator?record=${newVoyageId}`);
  };

  return {
    // Data
    ports,
    vessels,
    enrichedVessels,
    isLoading: isLoadingPorts || isLoadingVessels,

    // State
    workbook,
    currentRecord,
    calculationResult,
    routeAlternatives,
    selectedVessel,
    selectedVesselPosition,
    resolvedOrigin,
    resolvedDestination,

    // Actions
    setMode,
    setOriginPortId,
    setDestinationPortId,
    setOriginPoint,
    setVesselId,
    setSpeedKnots,
    setWeatherMarginPct,
    setDepartureTime,
    setRoutePreference,
    toggleAvoidPiracy,
    toggleAllowSuez,
    toggleAllowPanama,
    toggleAllowKiel,
    setManualDistance,
    resetManualDistance,
    addCustomWaypoint,
    removeCustomWaypoint,
    renameCalculation,
    duplicateCalculation,
    switchCalculation,
    deleteCalculation,
    exportCsv,
    exportToVoyageCalculator,
  };
}
