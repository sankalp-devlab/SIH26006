/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 20: Pure Calculation Floating Storage Analytics Engine
 */

import type {
  FloatingStorageObservationRecord,
  FloatingStorageFiltersState,
  FloatingStorageSummaryKPIs,
  RegionalStorageAggregation,
  CargoStorageAggregation,
  CrudeGradeStorageAggregation,
  HistoricalStorageSnapshot,
  HistoricalComparisonResult,
  FloatingStorageCargoType,
  CrudeGradeName,
  FloatingStorageRegion,
} from '../../types/floating-storage';

/**
 * Validates whether coordinates are valid finite numbers within WGS84 bounds
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
export function calculateSafePercent(
  numerator: number,
  denominator: number,
  decimals: number = 1
): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  const pct = (numerator / denominator) * 100;
  return parseFloat(pct.toFixed(decimals));
}

/**
 * Calculates stationary duration in days between stationarySince and observedAt timestamps
 */
export function calculateStationaryDays(stationarySince: string, observedAt: string): number {
  if (!stationarySince || !observedAt) return 0;
  const start = new Date(stationarySince).getTime();
  const end = new Date(observedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  if (start > end) return 0; // Future stationary date is invalid

  const diffMs = end - start;
  const days = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(days));
}

/**
 * Filters floating storage observations by multi-attribute constraints
 */
export function filterFloatingStorage(
  vessels: FloatingStorageObservationRecord[],
  filters: FloatingStorageFiltersState
): FloatingStorageObservationRecord[] {
  if (!Array.isArray(vessels) || vessels.length === 0) {
    return [];
  }

  const query = (filters.search || '').trim().toLowerCase();

  return vessels.filter((v) => {
    // 1. Data state filter (live vs historical)
    if (filters.dataState && v.dataState !== filters.dataState) {
      return false;
    }

    // 2. Minimum stationary duration filter
    if (typeof filters.minStationaryDays === 'number' && filters.minStationaryDays > 0) {
      if (v.stationaryDays < filters.minStationaryDays) {
        return false;
      }
    }

    // 3. Cargo Type filter
    if (filters.cargoType && filters.cargoType !== 'all' && v.cargoType !== filters.cargoType) {
      return false;
    }

    // 4. Crude Grade filter
    if (filters.crudeGrade && filters.crudeGrade !== 'all') {
      if (v.crudeGrade !== filters.crudeGrade) {
        return false;
      }
    }

    // 5. Region filter
    if (filters.region && filters.region !== 'all' && v.region !== filters.region) {
      return false;
    }

    // 6. Vessel Class filter
    if (filters.vesselClass && filters.vesselClass !== 'all' && v.vesselClass !== filters.vesselClass) {
      return false;
    }

    // 7. Search query filter
    if (query) {
      const matchName = v.vesselName.toLowerCase().includes(query);
      const matchImo = v.imoNumber.includes(query);
      const matchAnchorage = v.anchorageName.toLowerCase().includes(query);
      const matchGrade = v.crudeGrade ? v.crudeGrade.toLowerCase().includes(query) : false;
      const matchOwner = v.ownerName.toLowerCase().includes(query);
      const matchOperator = v.operatorName.toLowerCase().includes(query);

      if (!matchName && !matchImo && !matchAnchorage && !matchGrade && !matchOwner && !matchOperator) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Synthesizes executive summary KPIs from the filtered floating storage dataset
 */
export function synthesizeFloatingStorageSummary(
  vessels: FloatingStorageObservationRecord[]
): FloatingStorageSummaryKPIs {
  if (!Array.isArray(vessels) || vessels.length === 0) {
    return {
      totalVessels: 0,
      totalVolumeMt: 0,
      totalVolumeBbl: 0,
      totalImmobilizedValueUsd: 0,
      averageStationaryDays: 0,
      topStorageRegion: 'None',
      dominantCargoType: 'None',
      dominantCrudeGrade: 'None',
      activeAnchorageHubsCount: 0,
    };
  }

  let totalMt = 0;
  let totalBbl = 0;
  let totalValue = 0;
  let totalDays = 0;

  const regionCounts = new Map<string, number>();
  const cargoCounts = new Map<string, number>();
  const gradeCounts = new Map<string, number>();
  const anchorages = new Set<string>();

  vessels.forEach((v) => {
    totalMt += v.volumeMt;
    totalBbl += v.volumeBbl;
    totalValue += v.estimatedCargoValueUsd;
    totalDays += v.stationaryDays;

    regionCounts.set(v.region, (regionCounts.get(v.region) || 0) + 1);
    cargoCounts.set(v.cargoType, (cargoCounts.get(v.cargoType) || 0) + 1);
    if (v.crudeGrade) {
      gradeCounts.set(v.crudeGrade, (gradeCounts.get(v.crudeGrade) || 0) + 1);
    }
    anchorages.add(v.anchorageName);
  });

  // Top region
  let topReg = 'None';
  let maxReg = -1;
  regionCounts.forEach((cnt, reg) => {
    if (cnt > maxReg) {
      maxReg = cnt;
      topReg = reg;
    }
  });

  // Dominant cargo
  let topCargo = 'None';
  let maxCargo = -1;
  cargoCounts.forEach((cnt, c) => {
    if (cnt > maxCargo) {
      maxCargo = cnt;
      topCargo = c;
    }
  });

  // Dominant crude grade
  let topGrade = 'N/A';
  let maxGrade = -1;
  gradeCounts.forEach((cnt, g) => {
    if (cnt > maxGrade) {
      maxGrade = cnt;
      topGrade = g;
    }
  });

  return {
    totalVessels: vessels.length,
    totalVolumeMt: totalMt,
    totalVolumeBbl: totalBbl,
    totalImmobilizedValueUsd: totalValue,
    averageStationaryDays: parseFloat((totalDays / vessels.length).toFixed(1)),
    topStorageRegion: topReg,
    dominantCargoType: topCargo,
    dominantCrudeGrade: topGrade,
    activeAnchorageHubsCount: anchorages.size,
  };
}

/**
 * Aggregates floating storage by offshore geographic basin
 */
export function aggregateByRegion(
  vessels: FloatingStorageObservationRecord[]
): RegionalStorageAggregation[] {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<
    FloatingStorageRegion,
    {
      count: number;
      mt: number;
      bbl: number;
      value: number;
      totalDays: number;
      crudeCounts: Map<string, number>;
      cargoCounts: Map<string, number>;
      anchorageMap: Map<string, { count: number; volumeBbl: number }>;
    }
  >();

  let overallBbl = 0;

  vessels.forEach((v) => {
    overallBbl += v.volumeBbl;
    let entry = map.get(v.region);
    if (!entry) {
      entry = {
        count: 0,
        mt: 0,
        bbl: 0,
        value: 0,
        totalDays: 0,
        crudeCounts: new Map(),
        cargoCounts: new Map(),
        anchorageMap: new Map(),
      };
      map.set(v.region, entry);
    }

    entry.count++;
    entry.mt += v.volumeMt;
    entry.bbl += v.volumeBbl;
    entry.value += v.estimatedCargoValueUsd;
    entry.totalDays += v.stationaryDays;

    if (v.crudeGrade) {
      entry.crudeCounts.set(v.crudeGrade, (entry.crudeCounts.get(v.crudeGrade) || 0) + 1);
    }
    entry.cargoCounts.set(v.cargoType, (entry.cargoCounts.get(v.cargoType) || 0) + 1);

    const anch = entry.anchorageMap.get(v.anchorageName) || { count: 0, volumeBbl: 0 };
    anch.count++;
    anch.volumeBbl += v.volumeBbl;
    entry.anchorageMap.set(v.anchorageName, anch);
  });

  const result: RegionalStorageAggregation[] = [];

  map.forEach((val, reg) => {
    let topCrude = 'N/A';
    let maxCrude = -1;
    val.crudeCounts.forEach((c, g) => {
      if (c > maxCrude) {
        maxCrude = c;
        topCrude = g;
      }
    });

    let topCargo = 'None';
    let maxCargo = -1;
    val.cargoCounts.forEach((c, cg) => {
      if (c > maxCargo) {
        maxCargo = c;
        topCargo = cg;
      }
    });

    const anchoragesList: Array<{ name: string; count: number; volumeBbl: number }> = [];
    val.anchorageMap.forEach((aData, aName) => {
      anchoragesList.push({ name: aName, count: aData.count, volumeBbl: aData.volumeBbl });
    });
    anchoragesList.sort((a, b) => b.volumeBbl - a.volumeBbl);

    result.push({
      region: reg,
      vesselCount: val.count,
      totalVolumeMt: val.mt,
      totalVolumeBbl: val.bbl,
      totalValueUsd: val.value,
      sharePct: calculateSafePercent(val.bbl, overallBbl),
      avgStationaryDays: parseFloat((val.totalDays / val.count).toFixed(1)),
      topCrudeGrade: topCrude,
      topCargoType: topCargo,
      anchorages: anchoragesList,
    });
  });

  return result.sort((a, b) => b.totalVolumeBbl - a.totalVolumeBbl);
}

/**
 * Aggregates floating storage by cargo category
 */
export function aggregateByCargoType(
  vessels: FloatingStorageObservationRecord[]
): CargoStorageAggregation[] {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  const map = new Map<
    FloatingStorageCargoType,
    { count: number; mt: number; bbl: number; value: number; totalDays: number }
  >();
  let overallBbl = 0;

  vessels.forEach((v) => {
    overallBbl += v.volumeBbl;
    const entry = map.get(v.cargoType) || { count: 0, mt: 0, bbl: 0, value: 0, totalDays: 0 };
    entry.count++;
    entry.mt += v.volumeMt;
    entry.bbl += v.volumeBbl;
    entry.value += v.estimatedCargoValueUsd;
    entry.totalDays += v.stationaryDays;
    map.set(v.cargoType, entry);
  });

  const result: CargoStorageAggregation[] = [];
  map.forEach((val, cat) => {
    result.push({
      cargoType: cat,
      vesselCount: val.count,
      totalVolumeMt: val.mt,
      totalVolumeBbl: val.bbl,
      totalValueUsd: val.value,
      sharePct: calculateSafePercent(val.bbl, overallBbl),
      avgStationaryDays: parseFloat((val.totalDays / val.count).toFixed(1)),
    });
  });

  return result.sort((a, b) => b.totalVolumeBbl - a.totalVolumeBbl);
}

/**
 * Aggregates floating storage by specific crude grade
 */
export function aggregateByCrudeGrade(
  vessels: FloatingStorageObservationRecord[]
): CrudeGradeStorageAggregation[] {
  const crudeVessels = vessels.filter((v) => v.cargoType === 'Crude Oil' && v.crudeGrade !== null);
  if (crudeVessels.length === 0) return [];

  let overallCrudeBbl = 0;
  const map = new Map<
    CrudeGradeName,
    { count: number; mt: number; bbl: number; value: number; regionCounts: Map<string, number> }
  >();

  crudeVessels.forEach((v) => {
    if (!v.crudeGrade) return;
    overallCrudeBbl += v.volumeBbl;
    let entry = map.get(v.crudeGrade);
    if (!entry) {
      entry = { count: 0, mt: 0, bbl: 0, value: 0, regionCounts: new Map() };
      map.set(v.crudeGrade, entry);
    }
    entry.count++;
    entry.mt += v.volumeMt;
    entry.bbl += v.volumeBbl;
    entry.value += v.estimatedCargoValueUsd;
    entry.regionCounts.set(v.region, (entry.regionCounts.get(v.region) || 0) + 1);
  });

  const result: CrudeGradeStorageAggregation[] = [];
  map.forEach((val, grade) => {
    let topReg = 'Global';
    let maxReg = -1;
    val.regionCounts.forEach((c, r) => {
      if (c > maxReg) {
        maxReg = c;
        topReg = r;
      }
    });

    result.push({
      crudeGrade: grade,
      vesselCount: val.count,
      totalVolumeMt: val.mt,
      totalVolumeBbl: val.bbl,
      totalValueUsd: val.value,
      sharePct: calculateSafePercent(val.bbl, overallCrudeBbl),
      primaryOriginRegion: topReg,
    });
  });

  return result.sort((a, b) => b.totalVolumeBbl - a.totalVolumeBbl);
}

/**
 * Aggregates floating storage by vessel class (VLCC, Suezmax, Aframax, MR, etc.)
 */
export function aggregateByVesselClass(
  vessels: FloatingStorageObservationRecord[]
): Array<{ vesselClass: string; vesselCount: number; totalVolumeBbl: number; totalVolumeMt: number; sharePct: number }> {
  if (!Array.isArray(vessels) || vessels.length === 0) return [];

  let overallBbl = 0;
  const map = new Map<string, { count: number; bbl: number; mt: number }>();

  vessels.forEach((v) => {
    overallBbl += v.volumeBbl;
    const entry = map.get(v.vesselClass) || { count: 0, bbl: 0, mt: 0 };
    entry.count++;
    entry.bbl += v.volumeBbl;
    entry.mt += v.volumeMt;
    map.set(v.vesselClass, entry);
  });

  const result: Array<{ vesselClass: string; vesselCount: number; totalVolumeBbl: number; totalVolumeMt: number; sharePct: number }> = [];
  map.forEach((val, cls) => {
    result.push({
      vesselClass: cls,
      vesselCount: val.count,
      totalVolumeBbl: val.bbl,
      totalVolumeMt: val.mt,
      sharePct: calculateSafePercent(val.bbl, overallBbl),
    });
  });

  return result.sort((a, b) => b.totalVolumeBbl - a.totalVolumeBbl);
}

/**
 * Sorts and prepares historical snapshot series
 */
export function buildVolumeTrendSeries(
  snapshots: HistoricalStorageSnapshot[]
): HistoricalStorageSnapshot[] {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return [];
  return [...snapshots].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Builds comparative benchmarking metrics between current filtered storage and a historical benchmark snapshot
 */
export function buildHistoricalComparison(
  currentVessels: FloatingStorageObservationRecord[],
  benchmarkSnapshot: HistoricalStorageSnapshot
): HistoricalComparisonResult {
  const currentCount = currentVessels.length;
  const currentVolumeBbl = currentVessels.reduce((sum, v) => sum + v.volumeBbl, 0);

  const vesselDelta = currentCount - benchmarkSnapshot.vesselCount;
  const volumeDeltaBbl = currentVolumeBbl - benchmarkSnapshot.volumeBbl;
  const volumeDeltaPct = calculateSafePercent(volumeDeltaBbl, benchmarkSnapshot.volumeBbl);

  let note = '';
  if (volumeDeltaBbl > 0) {
    note = `Current floating storage volume is +${(volumeDeltaBbl / 1_000_000).toFixed(1)}M bbl (+${volumeDeltaPct}%) higher than ${benchmarkSnapshot.periodLabel} levels.`;
  } else if (volumeDeltaBbl < 0) {
    note = `Current floating storage volume is ${(Math.abs(volumeDeltaBbl) / 1_000_000).toFixed(1)}M bbl lower (${volumeDeltaPct}%) than ${benchmarkSnapshot.periodLabel} levels.`;
  } else {
    note = `Current floating storage volume matches ${benchmarkSnapshot.periodLabel} levels exactly.`;
  }

  return {
    currentVessels: currentCount,
    currentVolumeBbl,
    benchmarkVessels: benchmarkSnapshot.vesselCount,
    benchmarkVolumeBbl: benchmarkSnapshot.volumeBbl,
    vesselDelta,
    volumeDeltaBbl,
    volumeDeltaPct,
    benchmarkName: benchmarkSnapshot.periodLabel,
    analysisNote: note,
  };
}
