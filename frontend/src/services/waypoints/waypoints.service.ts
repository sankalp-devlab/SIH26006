/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Maritime Waypoints Service & Normalization Layer
 */

import {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
  WaypointHistoricalObservation,
  WaypointPayload,
  WaypointFiltersState,
  WaypointType,
} from '../../types/waypoints';

import {
  CHOKEPOINTS_REGISTRY,
  BENCHMARK_ACTIVITIES,
  GENERATED_HISTORICAL_TRENDS,
} from './waypoints.data';

import { validateCoordinate } from './waypoints-analytics-engine';

export class WaypointsService {
  /**
   * Safely normalizes raw API payloads into typed WaypointPayload with validated arrays
   */
  public static normalizeWaypointsData(raw: unknown): WaypointPayload {
    if (!raw || typeof raw !== 'object') {
      return this.getInitialWaypoints();
    }

    const payload = raw as Partial<WaypointPayload>;
    const rawWaypoints = Array.isArray(payload.waypoints) ? payload.waypoints : CHOKEPOINTS_REGISTRY;

    const validatedWaypoints: MaritimeWaypointRecord[] = rawWaypoints.filter((wp) => {
      if (!wp || typeof wp !== 'object') return false;
      return typeof wp.id === 'string' && validateCoordinate(wp.latitude, wp.longitude);
    });

    const validatedActivities: Record<string, WaypointLiveActivity> = {};
    const rawActivities = (payload.activities && typeof payload.activities === 'object')
      ? payload.activities
      : BENCHMARK_ACTIVITIES;

    validatedWaypoints.forEach((wp) => {
      const act = rawActivities[wp.id];
      if (act && typeof act === 'object') {
        validatedActivities[wp.id] = {
          waypointId: wp.id,
          timestamp: act.timestamp || new Date().toISOString(),
          activeVesselsInZone: Number.isFinite(act.activeVesselsInZone) ? act.activeVesselsInZone : 0,
          transits24h: Number.isFinite(act.transits24h) ? act.transits24h : 0,
          transits7dAvg: Number.isFinite(act.transits7dAvg) ? act.transits7dAvg : 0,
          waitingVessels: Number.isFinite(act.waitingVessels) ? act.waitingVessels : 0,
          medianWaitingHours: Number.isFinite(act.medianWaitingHours) ? act.medianWaitingHours : 0,
          congestionScore: Number.isFinite(act.congestionScore) ? act.congestionScore : 0,
          congestionLevel: act.congestionLevel || 'LOW',
          vesselClassDistribution: Array.isArray(act.vesselClassDistribution) ? act.vesselClassDistribution : [],
          modeBreakdown: Array.isArray(act.modeBreakdown) ? act.modeBreakdown : [],
          dataFreshnessStatus: act.dataFreshnessStatus || 'AIS_BENCHMARK',
          lastUpdated: act.lastUpdated || '2026-09-12 12:00 UTC',
        };
      } else {
        validatedActivities[wp.id] = BENCHMARK_ACTIVITIES[wp.id];
      }
    });

    const rawTrends = (payload.historicalTrends && typeof payload.historicalTrends === 'object')
      ? payload.historicalTrends
      : GENERATED_HISTORICAL_TRENDS;

    return {
      waypoints: validatedWaypoints.length > 0 ? validatedWaypoints : CHOKEPOINTS_REGISTRY,
      activities: validatedActivities,
      historicalTrends: rawTrends as Record<string, WaypointHistoricalObservation[]>,
      timestamp: payload.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Synchronous initial data contract for TanStack Query
   * NEVER returns undefined or raw Promise
   */
  public static getInitialWaypoints(): WaypointPayload {
    return {
      waypoints: [...CHOKEPOINTS_REGISTRY],
      activities: { ...BENCHMARK_ACTIVITIES },
      historicalTrends: { ...GENERATED_HISTORICAL_TRENDS },
      timestamp: '2026-09-12T12:00:00Z',
    };
  }

  /**
   * Async data provider for live fetching with optional filter payload
   */
  public static async getWaypoints(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filters?: Partial<WaypointFiltersState>
  ): Promise<WaypointPayload> {
    // In production, this can perform fetch('/api/v1/waypoints', ...)
    // For now, return normalized benchmark dataset with simulated low latency
    await new Promise((resolve) => setTimeout(resolve, 80));
    return this.getInitialWaypoints();
  }

  /**
   * Lookup single waypoint by ID
   */
  public static async getWaypointById(id: string): Promise<MaritimeWaypointRecord | null> {
    const wp = CHOKEPOINTS_REGISTRY.find((item) => item.id === id);
    return wp || null;
  }

  /**
   * Distinct list of available regions across configured waypoints
   */
  public static getAvailableRegions(): string[] {
    const regions = new Set<string>();
    CHOKEPOINTS_REGISTRY.forEach((w) => regions.add(w.region));
    return Array.from(regions).sort();
  }

  /**
   * Distinct list of available countries across configured waypoints
   */
  public static getAvailableCountries(): string[] {
    const countries = new Set<string>();
    CHOKEPOINTS_REGISTRY.forEach((w) => countries.add(w.country));
    return Array.from(countries).sort();
  }

  /**
   * Distinct list of waypoint types
   */
  public static getAvailableTypes(): WaypointType[] {
    return ['CANAL', 'STRAIT', 'CAPE', 'CHOKEPOINT', 'PASSAGE'];
  }

  /**
   * Distinct list of vessel classes
   */
  public static getAvailableVesselClasses(): string[] {
    const classes = new Set<string>();
    CHOKEPOINTS_REGISTRY.forEach((w) => {
      w.primaryVesselClasses.forEach((cls) => classes.add(cls));
    });
    return Array.from(classes).sort();
  }

  /**
   * Exports waypoint records and current live activity into standardized CSV format
   */
  public static exportToCsv(
    waypoints: MaritimeWaypointRecord[],
    activities: Record<string, WaypointLiveActivity>
  ): string {
    const headers = [
      'Waypoint ID',
      'Name',
      'Type',
      'Region',
      'Country',
      'Latitude',
      'Longitude',
      'Supported Modes',
      'Transits 24h',
      'Active Vessels',
      'Waiting Vessels',
      'Avg Wait (hrs)',
      'Congestion Score',
      'Congestion Level',
      'Security Rating',
      'Max Draft (m)',
      'Transit Duration (hrs)',
      'Daily Capacity',
    ];

    const rows = waypoints.map((wp) => {
      const act = activities[wp.id];
      return [
        `"${wp.id}"`,
        `"${wp.name}"`,
        `"${wp.type}"`,
        `"${wp.region}"`,
        `"${wp.country}"`,
        wp.latitude,
        wp.longitude,
        `"${wp.supportedModes.join(', ')}"`,
        act ? act.transits24h : 0,
        act ? act.activeVesselsInZone : 0,
        act ? act.waitingVessels : 0,
        act ? act.medianWaitingHours : 0,
        act ? act.congestionScore : 0,
        `"${act ? act.congestionLevel : 'N/A'}"`,
        `"${wp.securityRiskRating}"`,
        wp.physicalConstraints.maxDraftMeters !== null ? wp.physicalConstraints.maxDraftMeters : 'Unrestricted',
        wp.physicalConstraints.transitDurationHours,
        wp.physicalConstraints.nominalDailyCapacity,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
