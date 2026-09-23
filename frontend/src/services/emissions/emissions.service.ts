/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Emissions Service & Normalization Layer
 * 
 * Provides guaranteed synchronous initial data, TanStack Query contracts,
 * payload normalization, and client-side CSV / JSON export utilities.
 */

import type {
  EmissionsPayload,
  EmissionsVesselRecord,
  EmissionsVoyageRecord,
  EmissionsLegRecord,
  EmissionsOperationRecord,
  EmissionsAnomaly,
  EmissionsFiltersState,
} from '../../types/emissions';

import {
  CANONICAL_EMISSIONS_VESSELS,
  CANONICAL_VOYAGES,
  CANONICAL_LEGS,
  CANONICAL_OPERATIONS,
  CANONICAL_ANOMALIES,
  CANONICAL_FLEET_BENCHMARKS,
  CANONICAL_CLASS_BENCHMARKS,
  CANONICAL_HISTORICAL_TRENDS,
} from './emissions.data';

import { EmissionsApiClient } from './emissions-api-client';
import { validateCoordinate } from './emissions-analytics-engine';

export class EmissionsService {
  /**
   * Safely normalizes raw API payloads into typed EmissionsPayload with validated arrays
   */
  public static normalizeEmissionsPayload(raw: unknown): EmissionsPayload {
    if (!raw || typeof raw !== 'object') {
      return this.getInitialEmissions();
    }

    const payload = raw as Partial<EmissionsPayload>;

    // 1. Vessels validation
    const rawVessels = Array.isArray(payload.vessels) ? payload.vessels : CANONICAL_EMISSIONS_VESSELS;
    const validatedVessels: EmissionsVesselRecord[] = rawVessels.filter((v) => {
      if (!v || typeof v !== 'object') return false;
      const rec = v as EmissionsVesselRecord;
      return (
        typeof rec.id === 'number' &&
        typeof rec.name === 'string' &&
        typeof rec.imoNumber === 'string' &&
        rec.currentLocation &&
        validateCoordinate(rec.currentLocation.latitude, rec.currentLocation.longitude)
      );
    });

    // 2. Voyages validation
    const rawVoyages = Array.isArray(payload.voyages) ? payload.voyages : CANONICAL_VOYAGES;
    const validatedVoyages: EmissionsVoyageRecord[] = rawVoyages.filter((vy) => {
      if (!vy || typeof vy !== 'object') return false;
      const rec = vy as EmissionsVoyageRecord;
      return typeof rec.voyageId === 'string' && typeof rec.vesselName === 'string';
    });

    // 3. Legs validation
    const rawLegs = Array.isArray(payload.legs) ? payload.legs : CANONICAL_LEGS;
    const validatedLegs: EmissionsLegRecord[] = rawLegs.filter((leg) => {
      if (!leg || typeof leg !== 'object') return false;
      return typeof leg.legId === 'string' && typeof leg.voyageId === 'string';
    });

    // 4. Operations validation
    const rawOps = Array.isArray(payload.operations) ? payload.operations : CANONICAL_OPERATIONS;
    const validatedOps: EmissionsOperationRecord[] = rawOps.filter((op) => {
      if (!op || typeof op !== 'object') return false;
      return typeof op.operationId === 'string' && typeof op.state === 'string';
    });

    // 5. Anomalies validation
    const rawAnomalies = Array.isArray(payload.anomalies) ? payload.anomalies : CANONICAL_ANOMALIES;
    const validatedAnomalies: EmissionsAnomaly[] = rawAnomalies.filter((a) => {
      if (!a || typeof a !== 'object') return false;
      return typeof a.id === 'string' && typeof a.severity === 'string';
    });

    return {
      vessels: validatedVessels.length > 0 ? validatedVessels : CANONICAL_EMISSIONS_VESSELS,
      voyages: validatedVoyages.length > 0 ? validatedVoyages : CANONICAL_VOYAGES,
      legs: validatedLegs.length > 0 ? validatedLegs : CANONICAL_LEGS,
      operations: validatedOps.length > 0 ? validatedOps : CANONICAL_OPERATIONS,
      anomalies: validatedAnomalies.length > 0 ? validatedAnomalies : CANONICAL_ANOMALIES,
      fleetBenchmarks: Array.isArray(payload.fleetBenchmarks) ? payload.fleetBenchmarks : CANONICAL_FLEET_BENCHMARKS,
      classBenchmarks: Array.isArray(payload.classBenchmarks) ? payload.classBenchmarks : CANONICAL_CLASS_BENCHMARKS,
      historicalTrends: (payload.historicalTrends && typeof payload.historicalTrends === 'object')
        ? payload.historicalTrends
        : CANONICAL_HISTORICAL_TRENDS,
      freshnessStatus: payload.freshnessStatus || 'SIMULATED_BENCHMARK',
      lastUpdated: payload.lastUpdated || '2026-09-13 12:00 UTC',
      timestamp: payload.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Synchronous initial data contract for TanStack Query
   * NEVER returns undefined or a raw Promise
   */
  public static getInitialEmissions(): EmissionsPayload {
    return {
      vessels: [...CANONICAL_EMISSIONS_VESSELS],
      voyages: [...CANONICAL_VOYAGES],
      legs: [...CANONICAL_LEGS],
      operations: [...CANONICAL_OPERATIONS],
      anomalies: [...CANONICAL_ANOMALIES],
      fleetBenchmarks: [...CANONICAL_FLEET_BENCHMARKS],
      classBenchmarks: [...CANONICAL_CLASS_BENCHMARKS],
      historicalTrends: { ...CANONICAL_HISTORICAL_TRENDS },
      freshnessStatus: 'SIMULATED_BENCHMARK',
      lastUpdated: '2026-09-13 12:00 UTC',
      timestamp: '2026-09-13T12:00:00Z',
    };
  }

  /**
   * Async data provider for live fetching with Signal API adapter
   */
  public static async getEmissions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filters?: Partial<EmissionsFiltersState>
  ): Promise<EmissionsPayload> {
    try {
      const [liveVessels, liveVoyages] = await Promise.all([
        EmissionsApiClient.getVesselEmissions(),
        EmissionsApiClient.getVoyageEmissions(),
      ]);

      if (liveVessels || liveVoyages) {
        return this.normalizeEmissionsPayload({
          vessels: liveVessels,
          voyages: liveVoyages,
          freshnessStatus: 'LIVE_SIGNAL_API',
          lastUpdated: 'Just now',
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Fallback silently
    }

    return this.getInitialEmissions();
  }

  /**
   * Metadata Extractors
   */
  public static getAvailableFleets(): { id: string; name: string }[] {
    return [
      { id: 'all', name: 'All Fleets' },
      { id: 'flt-euronav-crude', name: 'Euronav Global Crude Fleet' },
      { id: 'flt-frontline-tankers', name: 'Frontline Tanker Pool' },
      { id: 'flt-starbulk-capes', name: 'Star Bulk Cape Fleet' },
    ];
  }

  public static getAvailableVesselClasses(): string[] {
    return ['all', 'VLCC', 'Suezmax', 'Aframax', 'Capesize', 'Panamax', 'Kamsarmax', 'Handysize', 'LNG Carrier', 'MR Product Tanker'];
  }

  public static getAvailableRegions(): string[] {
    return [
      'all',
      'Middle East Gulf & Red Sea',
      'Indian Ocean & Malacca',
      'Atlantic & West Africa',
      'Mediterranean & Black Sea',
      'Red Sea & Suez Corridor',
      'Australia & Southern Oceans',
      'East Asia & China Sea',
      'Americas & Caribbean',
      'SECA - Baltic & North Sea',
      'SECA - North America',
    ];
  }

  /**
   * Client-side CSV export of vessels registry
   */
  public static exportVesselsToCsv(vessels: EmissionsVesselRecord[]): void {
    const headers = [
      'Vessel Name',
      'IMO',
      'Vessel Class',
      'DWT',
      'Fleet',
      'Fuel Type',
      'Total Distance (nm)',
      'Total Fuel (mt)',
      'Total CO2 (mt)',
      'CO2 Intensity (kg/nm)',
      'Total NOx (mt)',
      'Total SOx (mt)',
      'Attained EEOI (g/t-nm)',
      'Attained AER (g/dwt-nm)',
      'CII Score',
      'CII Target',
      'CII Rating',
      'Trend (%)',
      'Status',
    ];

    const rows = vessels.map((v) => [
      `"${v.name}"`,
      `"${v.imoNumber}"`,
      `"${v.vesselClass}"`,
      v.dwt,
      `"${v.fleetName}"`,
      `"${v.fuelType}"`,
      v.totalDistanceNm,
      v.totalFuelConsumedMt,
      v.totalCo2Mt,
      v.co2IntensityKgPerNm,
      v.totalNoxMt,
      v.totalSoxMt,
      v.attainedEeoi,
      v.attainedAer,
      v.ciiScore,
      v.ciiTarget,
      v.ciiRating,
      `${v.co2TrendPct}%`,
      `"${v.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIH26006-emissions-vessels-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Client-side CSV export of voyages
   */
  public static exportVoyagesToCsv(voyages: EmissionsVoyageRecord[]): void {
    const headers = [
      'Voyage ID',
      'Vessel Name',
      'IMO',
      'Origin',
      'Destination',
      'Departure',
      'Arrival',
      'Distance (nm)',
      'Duration (days)',
      'Speed (knots)',
      'Cargo',
      'Cargo (mt)',
      'Fuel (mt)',
      'CO2 (mt)',
      'NOx (mt)',
      'SOx (mt)',
      'EEOI',
      'AER',
      'Status',
    ];

    const rows = voyages.map((vy) => [
      `"${vy.voyageId}"`,
      `"${vy.vesselName}"`,
      `"${vy.imoNumber}"`,
      `"${vy.originPort}"`,
      `"${vy.destinationPort}"`,
      `"${vy.departureDate}"`,
      `"${vy.arrivalDate}"`,
      vy.distanceNm,
      vy.durationDays,
      vy.avgSpeedKnots,
      `"${vy.cargoCommodity}"`,
      vy.cargoQuantityMt,
      vy.fuelConsumedMt,
      vy.co2Mt,
      vy.noxMt,
      vy.soxMt,
      vy.eeoi,
      vy.aer,
      `"${vy.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIH26006-emissions-voyages-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Client-side JSON export of full emissions dossier
   */
  public static exportFullReportJson(payload: EmissionsPayload): void {
    const jsonContent = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIH26006-emissions-dossier-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
