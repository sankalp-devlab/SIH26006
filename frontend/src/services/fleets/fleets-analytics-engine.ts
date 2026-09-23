/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Pure Calculation Fleet Intelligence Analytics Engine
 */

import type {
  FleetVesselRecord,
  FleetFiltersState,
  FleetSummaryKPIs,
  FleetVesselClass,
  FleetCargoCategory,
  RegionalDeploymentRecord,
  FleetBenchmarkResult,
  FleetBenchmarkMetrics,
  FleetOwnerEntity,
  FleetOperatorEntity,
} from '../../types/fleets';
import {
  OWNERS_REGISTRY,
  OPERATORS_REGISTRY,
} from './fleets.data';

/**
 * Validates whether latitude and longitude are valid finite numbers within WGS84 bounds
 */
export function validateCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Safe percentage calculation guarded against zero or negative denominator and NaN
 */
export function calculateSafePercent(numerator: number, denominator: number, decimals: number = 1): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  const pct = (numerator / denominator) * 100;
  return parseFloat(pct.toFixed(decimals));
}

/**
 * Filters the fleet vessels according to active user filters
 */
export function filterFleetVessels(
  vessels: FleetVesselRecord[],
  filters: FleetFiltersState
): FleetVesselRecord[] {
  if (!Array.isArray(vessels)) return [];

  const searchNormalized = filters.search.trim().toLowerCase();

  return vessels.filter((v) => {
    // 1. Text Search
    if (searchNormalized) {
      const matchName = v.name.toLowerCase().includes(searchNormalized);
      const matchImo = v.imoNumber.toLowerCase().includes(searchNormalized);
      const matchOwner = v.ownerName.toLowerCase().includes(searchNormalized);
      const matchOperator = v.operatorName.toLowerCase().includes(searchNormalized);
      const matchFleet = v.fleetName.toLowerCase().includes(searchNormalized);
      const matchRegion = v.deployment.region.toLowerCase().includes(searchNormalized);
      const matchCountry = v.deployment.country.toLowerCase().includes(searchNormalized);
      const matchComm = v.primaryCommodity.toLowerCase().includes(searchNormalized);

      if (
        !matchName &&
        !matchImo &&
        !matchOwner &&
        !matchOperator &&
        !matchFleet &&
        !matchRegion &&
        !matchCountry &&
        !matchComm
      ) {
        return false;
      }
    }

    // 2. Owner filter
    if (filters.ownerId !== 'all' && v.ownerId !== filters.ownerId) {
      return false;
    }

    // 3. Commercial Operator filter
    if (filters.operatorId !== 'all' && v.operatorId !== filters.operatorId) {
      return false;
    }

    // 4. Vessel Class filter
    if (filters.vesselClass !== 'all' && v.vesselClass !== filters.vesselClass) {
      return false;
    }

    // 5. Cargo Category filter
    if (filters.cargoCategory !== 'all' && v.cargoCategory !== filters.cargoCategory) {
      return false;
    }

    // 6. Region filter
    if (filters.region !== 'all' && v.deployment.region !== filters.region) {
      return false;
    }

    // 7. Country filter
    if (filters.country !== 'all' && v.deployment.country !== filters.country) {
      return false;
    }

    // 8. Deployment Status filter
    if (filters.deploymentStatus !== 'all' && v.deployment.status !== filters.deploymentStatus) {
      return false;
    }

    return true;
  });
}

/**
 * Synthesizes platform-level executive summary KPIs across filtered vessels
 */
export function synthesizeFleetSummary(vessels: FleetVesselRecord[]): FleetSummaryKPIs {
  if (!Array.isArray(vessels) || vessels.length === 0) {
    return {
      totalVessels: 0,
      totalDwt: 0,
      activeOwnersCount: 0,
      activeOperatorsCount: 0,
      monitoredRegionsCount: 0,
      underwayPct: 0,
      avgFleetAgeYears: 0,
      dominantVesselClass: 'None',
    };
  }

  let totalDwt = 0;
  let totalAge = 0;
  let underwayCount = 0;
  const owners = new Set<string>();
  const operators = new Set<string>();
  const regions = new Set<string>();
  const classCounts = new Map<string, number>();

  vessels.forEach((v) => {
    totalDwt += v.dwt;
    totalAge += Math.max(0, 2026 - v.yearBuilt);
    if (v.deployment.status === 'underway') {
      underwayCount++;
    }
    owners.add(v.ownerId);
    operators.add(v.operatorId);
    regions.add(v.deployment.region);

    const count = classCounts.get(v.vesselClass) || 0;
    classCounts.set(v.vesselClass, count + 1);
  });

  let dominantClass = 'None';
  let maxCount = -1;
  classCounts.forEach((cnt, cls) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      dominantClass = cls;
    }
  });

  return {
    totalVessels: vessels.length,
    totalDwt,
    activeOwnersCount: owners.size,
    activeOperatorsCount: operators.size,
    monitoredRegionsCount: regions.size,
    underwayPct: calculateSafePercent(underwayCount, vessels.length),
    avgFleetAgeYears: parseFloat((totalAge / vessels.length).toFixed(1)),
    dominantVesselClass: dominantClass,
  };
}

/**
 * Aggregates vessels by vessel class with deadweight and market share
 */
export function aggregateByVesselClass(
  vessels: FleetVesselRecord[]
): Array<{ vesselClass: FleetVesselClass; vesselCount: number; totalDwt: number; sharePct: number }> {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<FleetVesselClass, { count: number; dwt: number }>();
  let totalCount = 0;

  vessels.forEach((v) => {
    totalCount++;
    const existing = map.get(v.vesselClass) || { count: 0, dwt: 0 };
    existing.count++;
    existing.dwt += v.dwt;
    map.set(v.vesselClass, existing);
  });

  const result: Array<{ vesselClass: FleetVesselClass; vesselCount: number; totalDwt: number; sharePct: number }> = [];

  map.forEach((val, cls) => {
    result.push({
      vesselClass: cls,
      vesselCount: val.count,
      totalDwt: val.dwt,
      sharePct: calculateSafePercent(val.count, totalCount),
    });
  });

  return result.sort((a, b) => b.vesselCount - a.vesselCount);
}

/**
 * Aggregates vessels by cargo capability category
 */
export function aggregateByCargoCategory(
  vessels: FleetVesselRecord[]
): Array<{ cargoCategory: FleetCargoCategory; vesselCount: number; totalDwt: number; sharePct: number }> {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<FleetCargoCategory, { count: number; dwt: number }>();
  let totalCount = 0;

  vessels.forEach((v) => {
    totalCount++;
    const existing = map.get(v.cargoCategory) || { count: 0, dwt: 0 };
    existing.count++;
    existing.dwt += v.dwt;
    map.set(v.cargoCategory, existing);
  });

  const result: Array<{ cargoCategory: FleetCargoCategory; vesselCount: number; totalDwt: number; sharePct: number }> = [];

  map.forEach((val, cat) => {
    result.push({
      cargoCategory: cat,
      vesselCount: val.count,
      totalDwt: val.dwt,
      sharePct: calculateSafePercent(val.count, totalCount),
    });
  });

  return result.sort((a, b) => b.vesselCount - a.vesselCount);
}

/**
 * Aggregates vessels by asset owner
 */
export function aggregateByOwner(
  vessels: FleetVesselRecord[]
): Array<{ ownerId: string; ownerName: string; ownerCountry: string; vesselCount: number; totalDwt: number; sharePct: number }> {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<string, { name: string; country: string; count: number; dwt: number }>();
  let totalCount = 0;

  vessels.forEach((v) => {
    totalCount++;
    const existing = map.get(v.ownerId) || { name: v.ownerName, country: v.ownerCountry, count: 0, dwt: 0 };
    existing.count++;
    existing.dwt += v.dwt;
    map.set(v.ownerId, existing);
  });

  const result: Array<{ ownerId: string; ownerName: string; ownerCountry: string; vesselCount: number; totalDwt: number; sharePct: number }> = [];

  map.forEach((val, id) => {
    result.push({
      ownerId: id,
      ownerName: val.name,
      ownerCountry: val.country,
      vesselCount: val.count,
      totalDwt: val.dwt,
      sharePct: calculateSafePercent(val.count, totalCount),
    });
  });

  return result.sort((a, b) => b.totalDwt - a.totalDwt);
}

/**
 * Aggregates vessels by commercial operator
 */
export function aggregateByOperator(
  vessels: FleetVesselRecord[]
): Array<{ operatorId: string; operatorName: string; operatorCountry: string; vesselCount: number; totalDwt: number; sharePct: number }> {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<string, { name: string; country: string; count: number; dwt: number }>();
  let totalCount = 0;

  vessels.forEach((v) => {
    totalCount++;
    const existing = map.get(v.operatorId) || { name: v.operatorName, country: v.operatorCountry, count: 0, dwt: 0 };
    existing.count++;
    existing.dwt += v.dwt;
    map.set(v.operatorId, existing);
  });

  const result: Array<{ operatorId: string; operatorName: string; operatorCountry: string; vesselCount: number; totalDwt: number; sharePct: number }> = [];

  map.forEach((val, id) => {
    result.push({
      operatorId: id,
      operatorName: val.name,
      operatorCountry: val.country,
      vesselCount: val.count,
      totalDwt: val.dwt,
      sharePct: calculateSafePercent(val.count, totalCount),
    });
  });

  return result.sort((a, b) => b.totalDwt - a.totalDwt);
}

/**
 * Hierarchically groups vessels by oceanic region and country
 */
export function aggregateByRegion(vessels: FleetVesselRecord[]): RegionalDeploymentRecord[] {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const regionMap = new Map<
    string,
    {
      vessels: FleetVesselRecord[];
      dwt: number;
      classCounts: Map<string, number>;
      operatorCounts: Map<string, number>;
      countryCounts: Map<string, number>;
    }
  >();

  let overallCount = 0;

  vessels.forEach((v) => {
    overallCount++;
    const reg = v.deployment.region;
    let entry = regionMap.get(reg);
    if (!entry) {
      entry = {
        vessels: [],
        dwt: 0,
        classCounts: new Map(),
        operatorCounts: new Map(),
        countryCounts: new Map(),
      };
      regionMap.set(reg, entry);
    }

    entry.vessels.push(v);
    entry.dwt += v.dwt;

    entry.classCounts.set(v.vesselClass, (entry.classCounts.get(v.vesselClass) || 0) + 1);
    entry.operatorCounts.set(v.operatorName, (entry.operatorCounts.get(v.operatorName) || 0) + 1);
    entry.countryCounts.set(v.deployment.country, (entry.countryCounts.get(v.deployment.country) || 0) + 1);
  });

  const result: RegionalDeploymentRecord[] = [];

  regionMap.forEach((entry, reg) => {
    let topClass = 'None';
    let maxClassCount = -1;
    entry.classCounts.forEach((cnt, cls) => {
      if (cnt > maxClassCount) {
        maxClassCount = cnt;
        topClass = cls;
      }
    });

    let topOp = 'None';
    let maxOpCount = -1;
    entry.operatorCounts.forEach((cnt, op) => {
      if (cnt > maxOpCount) {
        maxOpCount = cnt;
        topOp = op;
      }
    });

    const countries: Array<{ country: string; count: number }> = [];
    entry.countryCounts.forEach((cnt, c) => countries.push({ country: c, count: cnt }));
    countries.sort((a, b) => b.count - a.count);

    result.push({
      region: reg,
      vesselCount: entry.vessels.length,
      totalDwt: entry.dwt,
      sharePct: calculateSafePercent(entry.vessels.length, overallCount),
      topVesselClass: topClass,
      topOperator: topOp,
      countries,
    });
  });

  return result.sort((a, b) => b.vesselCount - a.vesselCount);
}

/**
 * Regional comparison matrix builder alias
 */
export const buildRegionalComparison = aggregateByRegion;

/**
 * Builds side-by-side benchmarking profile for an entity (owner, operator, or region)
 */
function buildEntityBenchmarkMetrics(
  entityId: string,
  entityType: 'owner' | 'operator' | 'region',
  vessels: FleetVesselRecord[],
  owners: FleetOwnerEntity[],
  operators: FleetOperatorEntity[]
): FleetBenchmarkMetrics {
  let matchedVessels: FleetVesselRecord[] = [];
  let name = entityId;

  if (entityType === 'owner') {
    matchedVessels = vessels.filter((v) => v.ownerId === entityId);
    const own = owners.find((o) => o.id === entityId);
    if (own) name = own.name;
  } else if (entityType === 'operator') {
    matchedVessels = vessels.filter((v) => v.operatorId === entityId);
    const op = operators.find((o) => o.id === entityId);
    if (op) name = op.name;
  } else {
    matchedVessels = vessels.filter((v) => v.deployment.region === entityId);
  }

  const count = matchedVessels.length;
  let totalDwt = 0;
  let totalAge = 0;
  let underwayCount = 0;
  const classMap = new Map<string, number>();
  const cargoMap = new Map<string, number>();

  matchedVessels.forEach((v) => {
    totalDwt += v.dwt;
    totalAge += Math.max(0, 2026 - v.yearBuilt);
    if (v.deployment.status === 'underway') underwayCount++;

    classMap.set(v.vesselClass, (classMap.get(v.vesselClass) || 0) + 1);
    cargoMap.set(v.cargoCategory, (cargoMap.get(v.cargoCategory) || 0) + 1);
  });

  let dominantClass = 'None';
  let maxClass = -1;
  classMap.forEach((cnt, cls) => {
    if (cnt > maxClass) {
      maxClass = cnt;
      dominantClass = cls;
    }
  });

  let dominantCargo = 'None';
  let maxCargo = -1;
  cargoMap.forEach((cnt, cat) => {
    if (cnt > maxCargo) {
      maxCargo = cnt;
      dominantCargo = cat;
    }
  });

  const classBreakdown: Array<{ vesselClass: string; count: number; pct: number }> = [];
  classMap.forEach((cnt, cls) => {
    classBreakdown.push({
      vesselClass: cls,
      count: cnt,
      pct: calculateSafePercent(cnt, count),
    });
  });
  classBreakdown.sort((a, b) => b.count - a.count);

  return {
    entityId,
    entityName: name,
    entityType,
    vesselCount: count,
    totalDwt,
    avgDwt: count > 0 ? Math.round(totalDwt / count) : 0,
    avgAgeYears: count > 0 ? parseFloat((totalAge / count).toFixed(1)) : 0,
    underwayPct: calculateSafePercent(underwayCount, count),
    dominantVesselClass: dominantClass,
    dominantCargoCategory: dominantCargo,
    classBreakdown,
  };
}

/**
 * Builds comparative benchmarking outcome between two entities
 */
export function buildFleetBenchmark(
  entityAIdOrVessels: string | FleetVesselRecord[],
  entityBIdOrType: string,
  entityTypeOrAId: 'owner' | 'operator' | 'region' | string,
  allVesselsOrBId: FleetVesselRecord[] | string,
  owners: FleetOwnerEntity[] = OWNERS_REGISTRY,
  operators: FleetOperatorEntity[] = OPERATORS_REGISTRY
): FleetBenchmarkResult {
  let entityAId: string;
  let entityBId: string;
  let entityType: 'owner' | 'operator' | 'region';
  let vessels: FleetVesselRecord[];

  if (Array.isArray(entityAIdOrVessels)) {
    // Signature: (vessels, entityType, entityAId, entityBId, owners?, operators?)
    vessels = entityAIdOrVessels;
    entityType = entityBIdOrType as 'owner' | 'operator' | 'region';
    entityAId = entityTypeOrAId as string;
    entityBId = allVesselsOrBId as string;
  } else {
    // Signature: (entityAId, entityBId, entityType, vessels, owners?, operators?)
    entityAId = entityAIdOrVessels;
    entityBId = entityBIdOrType;
    entityType = entityTypeOrAId as 'owner' | 'operator' | 'region';
    vessels = allVesselsOrBId as FleetVesselRecord[];
  }

  const metricsA = buildEntityBenchmarkMetrics(entityAId, entityType, vessels, owners, operators);
  const metricsB = buildEntityBenchmarkMetrics(entityBId, entityType, vessels, owners, operators);

  return {
    entityA: metricsA,
    entityB: metricsB,
    dwtDelta: metricsA.totalDwt - metricsB.totalDwt,
    vesselDelta: metricsA.vesselCount - metricsB.vesselCount,
    ageDelta: parseFloat((metricsA.avgAgeYears - metricsB.avgAgeYears).toFixed(1)),
    generatedAt: new Date().toISOString(),
  };
}
