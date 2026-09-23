/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Floating Storage Intelligence Domain Types
 */

import type { FleetVesselClass } from './fleets';

export type FloatingStorageCargoType =
  | 'Crude Oil'
  | 'Clean Petroleum Products'
  | 'Dirty Petroleum Products / Fuel Oil'
  | 'LNG Gas'
  | 'LPG Gas'
  | 'Chemicals';

export type CrudeGradeName =
  | 'Arab Light'
  | 'Arab Heavy'
  | 'Basrah Medium'
  | 'Bonny Light'
  | 'Brent Blend'
  | 'CPC Blend'
  | 'Escravos'
  | 'Maya Heavy'
  | 'Murban'
  | 'Urals'
  | 'WTI Midland';

export type FloatingStorageRegion =
  | 'Singapore & Malacca Straits'
  | 'Arabian Gulf & Fujairah'
  | 'West Africa & Gulf of Guinea'
  | 'Northwest Europe & Skaw'
  | 'US Gulf Coast & Caribbean'
  | 'Mediterranean & Black Sea'
  | 'East Asia & Zhoushan';

export type FloatingStorageTab =
  | 'overview'
  | 'map'
  | 'volume'
  | 'regional'
  | 'historical';

export type StorageStatus =
  | 'confirmed_storage'
  | 'drifting_laden'
  | 'long_term_holding';

export interface FloatingStorageObservationRecord {
  id: string;
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  vesselClass: FleetVesselClass;
  flag: string;
  dwt: number;
  yearBuilt: number;
  ownerName: string;
  operatorName: string;

  // Cargo & Volume Details
  cargoType: FloatingStorageCargoType;
  crudeGrade: CrudeGradeName | null;
  volumeMt: number;
  volumeBbl: number;
  estimatedCargoValueUsd: number;
  capacityUtilizationPct: number;

  // Stationary & Geographic Telemetry
  stationarySince: string; // ISO 8601 UTC string
  observedAt: string; // ISO 8601 UTC string
  stationaryDays: number;
  storageStatus: StorageStatus;

  // Location Details
  region: FloatingStorageRegion;
  country: string;
  anchorageName: string;
  latitude: number;
  longitude: number;
  speedKnots: number;
  draftMeters: number;

  dataState: 'live' | 'historical';
}

export interface FloatingStorageFiltersState {
  search: string;
  cargoType: FloatingStorageCargoType | 'all';
  crudeGrade: CrudeGradeName | 'all';
  region: FloatingStorageRegion | 'all';
  minStationaryDays: number; // e.g. 1, 3, 5, 7, 14, 30
  dataState: 'live' | 'historical';
  vesselClass: FleetVesselClass | 'all';
}

export interface FloatingStorageSummaryKPIs {
  totalVessels: number;
  totalVolumeMt: number;
  totalVolumeBbl: number;
  totalImmobilizedValueUsd: number;
  averageStationaryDays: number;
  topStorageRegion: string;
  dominantCargoType: string;
  dominantCrudeGrade: string;
  activeAnchorageHubsCount: number;
}

export interface RegionalStorageAggregation {
  region: FloatingStorageRegion;
  vesselCount: number;
  totalVolumeMt: number;
  totalVolumeBbl: number;
  totalValueUsd: number;
  sharePct: number;
  avgStationaryDays: number;
  topCrudeGrade: string;
  topCargoType: string;
  anchorages: Array<{ name: string; count: number; volumeBbl: number }>;
}

export interface CargoStorageAggregation {
  cargoType: FloatingStorageCargoType;
  vesselCount: number;
  totalVolumeMt: number;
  totalVolumeBbl: number;
  totalValueUsd: number;
  sharePct: number;
  avgStationaryDays: number;
}

export interface CrudeGradeStorageAggregation {
  crudeGrade: CrudeGradeName;
  vesselCount: number;
  totalVolumeMt: number;
  totalVolumeBbl: number;
  totalValueUsd: number;
  sharePct: number;
  primaryOriginRegion: string;
}

export interface HistoricalStorageSnapshot {
  periodLabel: string; // e.g. "2024-Q1", "2025-Q2", "Current 2026"
  timestamp: string;
  vesselCount: number;
  volumeBbl: number;
  volumeMt: number;
  avgStationaryDays: number;
  topRegion: string;
  marketContext: string; // e.g. "Super-contango build", "Red Sea disruption reroute", "Spring refinery maintenance"
}

export interface HistoricalComparisonResult {
  currentVessels: number;
  currentVolumeBbl: number;
  benchmarkVessels: number;
  benchmarkVolumeBbl: number;
  vesselDelta: number;
  volumeDeltaBbl: number;
  volumeDeltaPct: number;
  benchmarkName: string;
  analysisNote: string;
}

export interface FloatingStoragePayload {
  vessels: FloatingStorageObservationRecord[];
  historicalSnapshots: HistoricalStorageSnapshot[];
  timestamp: string;
  dataState: 'live' | 'historical';
}
