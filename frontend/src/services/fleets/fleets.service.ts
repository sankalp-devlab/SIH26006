/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Fleets Service Layer
 * 
 * Provides guaranteed synchronous initial data and normalized asynchronous contracts
 * for Fleet Intelligence, Ownership, Commercial Operators, and Geographic Deployment.
 */

import type {
  FleetPayload,
  FleetVesselRecord,
  FleetOwnerEntity,
  FleetOperatorEntity,
} from '../../types/fleets';
import {
  FLEET_VESSELS_REGISTRY,
  OWNERS_REGISTRY,
  OPERATORS_REGISTRY,
} from './fleets.data';

/**
 * Type guard for FleetVesselRecord validation during API normalization
 */
function isValidVesselRecord(item: unknown): item is FleetVesselRecord {
  if (!item || typeof item !== 'object') return false;
  const v = item as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.name === 'string' &&
    typeof v.imoNumber === 'string' &&
    typeof v.vesselClass === 'string' &&
    typeof v.dwt === 'number' &&
    typeof v.ownerName === 'string' &&
    typeof v.operatorName === 'string' &&
    typeof v.cargoCategory === 'string' &&
    v.deployment !== null &&
    typeof v.deployment === 'object' &&
    typeof (v.deployment as Record<string, unknown>).latitude === 'number' &&
    typeof (v.deployment as Record<string, unknown>).longitude === 'number'
  );
}

/**
 * Normalizes raw/unknown API payloads into a strictly typed FleetPayload.
 * Guarantees zero "is not iterable" or "Cannot read properties of undefined" crashes.
 */
export function normalizeFleetPayload(raw: unknown): FleetPayload {
  if (!raw || typeof raw !== 'object') {
    return {
      vessels: [...FLEET_VESSELS_REGISTRY],
      owners: [...OWNERS_REGISTRY],
      operators: [...OPERATORS_REGISTRY],
      timestamp: new Date().toISOString(),
    };
  }

  const candidate = raw as Record<string, unknown>;

  const vessels: FleetVesselRecord[] = Array.isArray(candidate.vessels)
    ? (candidate.vessels.filter(isValidVesselRecord) as FleetVesselRecord[])
    : [...FLEET_VESSELS_REGISTRY];

  const owners: FleetOwnerEntity[] = Array.isArray(candidate.owners)
    ? (candidate.owners as FleetOwnerEntity[])
    : [...OWNERS_REGISTRY];

  const operators: FleetOperatorEntity[] = Array.isArray(candidate.operators)
    ? (candidate.operators as FleetOperatorEntity[])
    : [...OPERATORS_REGISTRY];

  const timestamp =
    typeof candidate.timestamp === 'string'
      ? candidate.timestamp
      : new Date().toISOString();

  return {
    vessels: vessels.length > 0 ? vessels : [...FLEET_VESSELS_REGISTRY],
    owners: owners.length > 0 ? owners : [...OWNERS_REGISTRY],
    operators: operators.length > 0 ? operators : [...OPERATORS_REGISTRY],
    timestamp,
  };
}

export const FleetsService = {
  /**
   * Synchronous accessor returning non-empty initial fleet payload.
   * TanStack Query initialData uses this to guarantee immediate synchronous render.
   */
  getInitialFleets(): FleetPayload {
    return {
      vessels: [...FLEET_VESSELS_REGISTRY],
      owners: [...OWNERS_REGISTRY],
      operators: [...OPERATORS_REGISTRY],
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Asynchronous query returning normalized FleetPayload.
   * Ready for future live backend endpoint wire-up.
   */
  async getFleets(): Promise<FleetPayload> {
    // Simulated fast async fetch to mimic API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          vessels: [...FLEET_VESSELS_REGISTRY],
          owners: [...OWNERS_REGISTRY],
          operators: [...OPERATORS_REGISTRY],
          timestamp: new Date().toISOString(),
        });
      }, 50);
    });
  },

  /**
   * Retrieves registered owner entities
   */
  getOwnersList(vessels?: FleetVesselRecord[]): FleetOwnerEntity[] {
    if (!vessels || vessels.length === 0) {
      return [...OWNERS_REGISTRY];
    }
    const activeOwnerIds = new Set(vessels.map((v) => v.ownerId));
    return OWNERS_REGISTRY.filter((o) => activeOwnerIds.has(o.id));
  },

  /**
   * Retrieves commercial operator entities
   */
  getOperatorsList(vessels?: FleetVesselRecord[]): FleetOperatorEntity[] {
    if (!vessels || vessels.length === 0) {
      return [...OPERATORS_REGISTRY];
    }
    const activeOperatorIds = new Set(vessels.map((v) => v.operatorId));
    return OPERATORS_REGISTRY.filter((op) => activeOperatorIds.has(op.id));
  },

  /**
   * Returns distinct sorted list of deployment regions
   */
  getAvailableRegions(vessels: FleetVesselRecord[] = FLEET_VESSELS_REGISTRY): string[] {
    const set = new Set<string>();
    for (const v of vessels) {
      if (v.deployment && v.deployment.region) {
        set.add(v.deployment.region);
      }
    }
    return Array.from(set).sort();
  },

  /**
   * Returns distinct sorted list of deployment countries, optionally filtered by region
   */
  getAvailableCountries(
    vessels: FleetVesselRecord[] = FLEET_VESSELS_REGISTRY,
    region?: string
  ): string[] {
    const set = new Set<string>();
    for (const v of vessels) {
      if (v.deployment && v.deployment.country) {
        if (!region || region === 'all' || v.deployment.region === region) {
          set.add(v.deployment.country);
        }
      }
    }
    return Array.from(set).sort();
  },

  /**
   * Generates sanitized CSV string of fleet vessels
   */
  exportToCsv(vessels: FleetVesselRecord[]): string {
    const headers = [
      'Vessel Name',
      'IMO Number',
      'Vessel Class',
      'DWT',
      'Year Built',
      'Flag',
      'Owner',
      'Commercial Operator',
      'Cargo Category',
      'Primary Commodity',
      'Region',
      'Country',
      'Sub Area',
      'Status',
      'Destination Port',
      'ETA',
      'Speed (kts)',
      'CII Rating',
    ];

    const rows = vessels.map((v) => [
      `"${v.name.replace(/"/g, '""')}"`,
      `"${v.imoNumber}"`,
      `"${v.vesselClass}"`,
      v.dwt,
      v.yearBuilt,
      `"${v.flag}"`,
      `"${v.ownerName.replace(/"/g, '""')}"`,
      `"${v.operatorName.replace(/"/g, '""')}"`,
      `"${v.cargoCategory}"`,
      `"${v.primaryCommodity}"`,
      `"${v.deployment.region}"`,
      `"${v.deployment.country}"`,
      `"${v.deployment.subArea}"`,
      `"${v.deployment.status}"`,
      `"${v.deployment.destinationPort}"`,
      `"${v.deployment.eta}"`,
      v.deployment.speedKnots,
      `"${v.ciiRating}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
