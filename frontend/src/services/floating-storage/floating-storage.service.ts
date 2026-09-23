/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Floating Storage Service Layer & Normalization
 */

import type {
  FloatingStorageObservationRecord,
  FloatingStorageFiltersState,
  FloatingStoragePayload,
  HistoricalStorageSnapshot,
} from '../../types/floating-storage';
import {
  MOCK_FLOATING_STORAGE_VESSELS,
  HISTORICAL_STORAGE_SNAPSHOTS,
} from './floating-storage.data';
import {
  filterFloatingStorage,
  validateCoordinate,
} from './floating-storage-analytics-engine';

/**
 * Validates and normalizes any unknown raw payload from API/network into a safe FloatingStoragePayload envelope.
 * Guaranteed to return safe arrays and never throw or crash callers.
 */
export function normalizeFloatingStoragePayload(raw: unknown): FloatingStoragePayload {
  const fallbackDate = new Date().toISOString();

  if (!raw || typeof raw !== 'object') {
    return {
      vessels: [...MOCK_FLOATING_STORAGE_VESSELS],
      historicalSnapshots: [...HISTORICAL_STORAGE_SNAPSHOTS],
      timestamp: fallbackDate,
      dataState: 'live',
    };
  }

  const candidate = raw as Record<string, unknown>;

  // Normalize vessels array
  const rawVessels = candidate.vessels;
  let vessels: FloatingStorageObservationRecord[] = [];

  if (Array.isArray(rawVessels)) {
    vessels = rawVessels.filter((item): item is FloatingStorageObservationRecord => {
      if (!item || typeof item !== 'object') return false;
      const v = item as Partial<FloatingStorageObservationRecord>;
      return (
        typeof v.id === 'string' &&
        typeof v.vesselName === 'string' &&
        validateCoordinate(v.latitude, v.longitude) &&
        typeof v.volumeBbl === 'number' &&
        v.volumeBbl >= 0
      );
    });
  }

  // If candidate had no valid vessels, fall back to base mock dataset
  if (vessels.length === 0) {
    vessels = [...MOCK_FLOATING_STORAGE_VESSELS];
  }

  // Normalize historical snapshots
  const rawSnapshots = candidate.historicalSnapshots;
  let historicalSnapshots: HistoricalStorageSnapshot[] = [];

  if (Array.isArray(rawSnapshots)) {
    historicalSnapshots = rawSnapshots.filter((snap): snap is HistoricalStorageSnapshot => {
      if (!snap || typeof snap !== 'object') return false;
      const s = snap as Partial<HistoricalStorageSnapshot>;
      return (
        typeof s.periodLabel === 'string' &&
        typeof s.volumeBbl === 'number' &&
        typeof s.vesselCount === 'number'
      );
    });
  }

  if (historicalSnapshots.length === 0) {
    historicalSnapshots = [...HISTORICAL_STORAGE_SNAPSHOTS];
  }

  const timestamp = typeof candidate.timestamp === 'string' ? candidate.timestamp : fallbackDate;
  const dataState = candidate.dataState === 'historical' ? 'historical' : 'live';

  return {
    vessels,
    historicalSnapshots,
    timestamp,
    dataState,
  };
}

/**
 * Synchronous initial data provider. Guaranteed to return verified commercial records
 * so TanStack Query initialData never triggers undefined or empty array crashes.
 */
export function getInitialFloatingStorage(): FloatingStoragePayload {
  return {
    vessels: [...MOCK_FLOATING_STORAGE_VESSELS],
    historicalSnapshots: [...HISTORICAL_STORAGE_SNAPSHOTS],
    timestamp: new Date().toISOString(),
    dataState: 'live',
  };
}

/**
 * Async fetcher with simulated realistic latency and filter processing
 */
export async function getFloatingStorage(
  filters?: FloatingStorageFiltersState
): Promise<FloatingStoragePayload> {
  // Simulate lightweight network roundtrip (20-60ms)
  await new Promise((resolve) => setTimeout(resolve, 35));

  let records = [...MOCK_FLOATING_STORAGE_VESSELS];

  if (filters) {
    records = filterFloatingStorage(records, filters);
  }

  return {
    vessels: records,
    historicalSnapshots: [...HISTORICAL_STORAGE_SNAPSHOTS],
    timestamp: new Date().toISOString(),
    dataState: filters?.dataState ?? 'live',
  };
}

/**
 * Lookup single vessel record by ID
 */
export async function getFloatingStorageById(
  id: string
): Promise<FloatingStorageObservationRecord | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const vessel = MOCK_FLOATING_STORAGE_VESSELS.find((v) => v.id === id);
  return vessel ? { ...vessel } : null;
}

/**
 * Synchronous access to historical macro snapshots
 */
export function getHistoricalSnapshots(): HistoricalStorageSnapshot[] {
  return [...HISTORICAL_STORAGE_SNAPSHOTS];
}

/**
 * Export current filtered observation records to RFC 4180 compliant CSV string
 */
export function exportToCsv(records: FloatingStorageObservationRecord[]): string {
  const headers = [
    'Vessel Name',
    'IMO',
    'Class',
    'Flag',
    'DWT',
    'Built',
    'Owner',
    'Operator',
    'Cargo Type',
    'Crude Grade',
    'Volume (BBL)',
    'Volume (MT)',
    'Est. Value (USD)',
    'Region',
    'Anchorage Hub',
    'Country',
    'Latitude',
    'Longitude',
    'Speed (kts)',
    'Draft (m)',
    'Stationary Since (UTC)',
    'Stationary Days',
    'Status',
  ];

  const escapeField = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((r) => [
    escapeField(r.vesselName),
    escapeField(r.imoNumber),
    escapeField(r.vesselClass),
    escapeField(r.flag),
    escapeField(r.dwt),
    escapeField(r.yearBuilt),
    escapeField(r.ownerName),
    escapeField(r.operatorName),
    escapeField(r.cargoType),
    escapeField(r.crudeGrade ?? 'N/A'),
    escapeField(r.volumeBbl),
    escapeField(r.volumeMt),
    escapeField(r.estimatedCargoValueUsd),
    escapeField(r.region),
    escapeField(r.anchorageName),
    escapeField(r.country),
    escapeField(r.latitude),
    escapeField(r.longitude),
    escapeField(r.speedKnots),
    escapeField(r.draftMeters),
    escapeField(r.stationarySince),
    escapeField(r.stationaryDays),
    escapeField(r.storageStatus),
  ]);

  return [headers.map(escapeField).join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export const FloatingStorageService = {
  normalizeFloatingStoragePayload,
  getInitialFloatingStorage,
  getFloatingStorage,
  getFloatingStorageById,
  getHistoricalSnapshots,
  exportToCsv,
};
