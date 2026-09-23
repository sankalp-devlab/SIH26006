/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Pure Calculation Waypoints & Chokepoints Analytics Engine
 */

import {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
  WaypointHistoricalObservation,
  WaypointFiltersState,
  WaypointSummaryMetrics,
  WaypointCongestionLevel,
  WaypointMode,
  WaypointTimeHorizon,
  WaypointComparisonResult,
  WaypointComparisonMetric,
} from '../../types/waypoints';

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
 * Calculates standardized congestion level badge based on congestion score
 */
export function calculateCongestionLevel(score: number): WaypointCongestionLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MODERATE';
  return 'LOW';
}

/**
 * Safe percentage calculation guarded against zero or negative denominator and NaN
 */
export function calculateSafePercent(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  const pct = (numerator / denominator) * 100;
  return parseFloat(pct.toFixed(1));
}

/**
 * Filters the canonical waypoint records according to active user filters
 */
export function filterWaypoints(
  waypoints: MaritimeWaypointRecord[],
  activities: Record<string, WaypointLiveActivity>,
  filters: WaypointFiltersState
): MaritimeWaypointRecord[] {
  if (!Array.isArray(waypoints)) return [];

  const searchNormalized = filters.search.trim().toLowerCase();

  return waypoints.filter((wp) => {
    // 1. Text search
    if (searchNormalized) {
      const matchName = wp.name.toLowerCase().includes(searchNormalized);
      const matchRegion = wp.region.toLowerCase().includes(searchNormalized);
      const matchCountry = wp.country.toLowerCase().includes(searchNormalized);
      const matchType = wp.type.toLowerCase().includes(searchNormalized);
      const matchContext = wp.strategicContext.toLowerCase().includes(searchNormalized);
      if (!matchName && !matchRegion && !matchCountry && !matchType && !matchContext) {
        return false;
      }
    }

    // 2. Mode filter
    if (filters.mode !== 'all') {
      if (!wp.supportedModes.includes(filters.mode)) {
        return false;
      }
    }

    // 3. Vessel class filter
    if (filters.vesselClass !== 'all') {
      const hasClass = wp.primaryVesselClasses.some(
        (cls) => cls.toLowerCase() === filters.vesselClass.toLowerCase()
      );
      if (!hasClass) return false;
    }

    // 4. Region filter
    if (filters.region !== 'all' && wp.region !== filters.region) {
      return false;
    }

    // 5. Country filter
    if (filters.country !== 'all' && wp.country !== filters.country) {
      return false;
    }

    // 6. Waypoint type filter
    if (filters.waypointType !== 'all' && wp.type !== filters.waypointType) {
      return false;
    }

    // 7. Congestion level filter
    if (filters.congestionLevel !== 'all') {
      const act = activities[wp.id];
      if (!act || act.congestionLevel !== filters.congestionLevel) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Synthesizes platform-level executive KPI metrics across filtered waypoints
 */
export function synthesizeGlobalSummary(
  waypoints: MaritimeWaypointRecord[],
  activities: Record<string, WaypointLiveActivity>,
  filters: WaypointFiltersState
): WaypointSummaryMetrics {
  const filtered = filterWaypoints(waypoints, activities, filters);

  let totalVessels = 0;
  let totalWaiting = 0;
  let totalScoreSum = 0;
  let totalTransits = 0;
  let maxScore = -1;
  let topBottleneckName = 'None';
  let topBottleneckId = '';

  filtered.forEach((wp) => {
    const act = activities[wp.id];
    if (act) {
      totalVessels += act.activeVesselsInZone;
      totalWaiting += act.waitingVessels;
      totalScoreSum += act.congestionScore;
      totalTransits += act.transits24h;

      if (act.congestionScore > maxScore) {
        maxScore = act.congestionScore;
        topBottleneckName = wp.name;
        topBottleneckId = wp.id;
      }
    }
  });

  const avgCongestion = filtered.length > 0 ? Math.round(totalScoreSum / filtered.length) : 0;

  // Calculate Cape Detour Volume share (Cape of Good Hope vs Suez transits)
  const capeAct = activities['wp-cape-good-hope'];
  const suezAct = activities['wp-suez'];
  const capeTransits = capeAct ? capeAct.transits24h : 0;
  const suezTransits = suezAct ? suezAct.transits24h : 0;
  const capeDetourPct = calculateSafePercent(capeTransits, capeTransits + suezTransits);

  return {
    activeChokepointsCount: filtered.length,
    totalVesselsInChokepoints: totalVessels,
    totalWaitingVessels: totalWaiting,
    globalCongestionIndex: avgCongestion,
    topBottleneckName: topBottleneckName || 'Global Nominal',
    topBottleneckId,
    capeDetourVolumePct: capeDetourPct,
    totalTransits24h: totalTransits,
    lastUpdated: '2026-09-12 12:00 UTC',
  };
}

/**
 * Ranks waypoints by key operational metrics
 */
export function rankWaypoints(
  waypoints: MaritimeWaypointRecord[],
  activities: Record<string, WaypointLiveActivity>,
  metric: 'transits24h' | 'activeVessels' | 'waitingVessels' | 'congestionScore' = 'transits24h',
  limit: number = 5
): Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }> {
  const list: Array<{ waypoint: MaritimeWaypointRecord; activity: WaypointLiveActivity; value: number }> = [];

  waypoints.forEach((wp) => {
    const act = activities[wp.id];
    if (act) {
      let val = 0;
      if (metric === 'transits24h') val = act.transits24h;
      else if (metric === 'activeVessels') val = act.activeVesselsInZone;
      else if (metric === 'waitingVessels') val = act.waitingVessels;
      else if (metric === 'congestionScore') val = act.congestionScore;

      list.push({ waypoint: wp, activity: act, value: val });
    }
  });

  list.sort((a, b) => b.value - a.value);
  return list.slice(0, limit);
}

/**
 * Aggregates active vessels and transits across all vessel classes for filtered waypoints
 */
export function aggregateByVesselClass(
  activities: Record<string, WaypointLiveActivity>,
  targetWaypointIds?: string[]
): Array<{ vesselClass: string; totalActive: number; totalTransits: number; waitingCount: number; sharePct: number }> {
  const classMap = new Map<string, { totalActive: number; totalTransits: number; waitingCount: number }>();
  let overallActive = 0;

  Object.entries(activities).forEach(([wpId, act]) => {
    if (targetWaypointIds && !targetWaypointIds.includes(wpId)) return;

    act.vesselClassDistribution.forEach((vcd) => {
      overallActive += vcd.activeVessels;
      const existing = classMap.get(vcd.vesselClass) || { totalActive: 0, totalTransits: 0, waitingCount: 0 };
      existing.totalActive += vcd.activeVessels;
      existing.totalTransits += vcd.transits24h;
      existing.waitingCount += vcd.waitingCount;
      classMap.set(vcd.vesselClass, existing);
    });
  });

  const result: Array<{ vesselClass: string; totalActive: number; totalTransits: number; waitingCount: number; sharePct: number }> = [];

  classMap.forEach((val, key) => {
    result.push({
      vesselClass: key,
      totalActive: val.totalActive,
      totalTransits: val.totalTransits,
      waitingCount: val.waitingCount,
      sharePct: calculateSafePercent(val.totalActive, overallActive),
    });
  });

  return result.sort((a, b) => b.totalActive - a.totalActive);
}

/**
 * Aggregates vessel counts by maritime mode across filtered waypoints
 */
export function aggregateByMode(
  activities: Record<string, WaypointLiveActivity>,
  targetWaypointIds?: string[]
): Array<{ mode: WaypointMode; vesselCount: number; percentage: number }> {
  const modeCounts: Record<WaypointMode, number> = {
    tanker: 0,
    dry: 0,
    lng: 0,
    lpg: 0,
  };
  let total = 0;

  Object.entries(activities).forEach(([wpId, act]) => {
    if (targetWaypointIds && !targetWaypointIds.includes(wpId)) return;

    act.modeBreakdown.forEach((mb) => {
      if (modeCounts[mb.mode] !== undefined) {
        modeCounts[mb.mode] += mb.vesselCount;
        total += mb.vesselCount;
      }
    });
  });

  const modes: WaypointMode[] = ['tanker', 'dry', 'lng', 'lpg'];
  return modes.map((mode) => ({
    mode,
    vesselCount: modeCounts[mode],
    percentage: calculateSafePercent(modeCounts[mode], total),
  }));
}

/**
 * Slices historical observations to match the requested time horizon
 */
export function filterHistoricalTrends(
  observations: WaypointHistoricalObservation[],
  horizon: WaypointTimeHorizon
): WaypointHistoricalObservation[] {
  if (!Array.isArray(observations) || observations.length === 0) return [];

  if (horizon === '7d') {
    return observations.slice(-5);
  }
  if (horizon === '30d') {
    return observations.slice(-8);
  }
  if (horizon === '90d') {
    return observations.slice(-12);
  }
  return observations; // '1y' or default
}

/**
 * Compares 2 to 4 selected waypoints side-by-side
 */
export function compareWaypoints(
  waypointIds: string[],
  waypoints: MaritimeWaypointRecord[],
  activities: Record<string, WaypointLiveActivity>
): WaypointComparisonResult {
  const selectedWps = waypoints.filter((w) => waypointIds.includes(w.id));
  const metrics: WaypointComparisonMetric[] = [];

  selectedWps.forEach((wp) => {
    const act = activities[wp.id];
    if (act) {
      const topClass = act.vesselClassDistribution[0]?.vesselClass || 'General Fleet';
      metrics.push({
        waypointId: wp.id,
        name: wp.name,
        type: wp.type,
        region: wp.region,
        transits24h: act.transits24h,
        waitingVessels: act.waitingVessels,
        avgWaitHours: act.medianWaitingHours,
        congestionScore: act.congestionScore,
        topVesselClass: topClass,
        maxDraft: wp.physicalConstraints.maxDraftMeters,
        transitHours: wp.physicalConstraints.transitDurationHours,
      });
    }
  });

  return {
    waypoints: selectedWps,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}
