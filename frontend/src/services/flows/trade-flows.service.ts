/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Data Service & API Abstraction
 * Supports both development benchmark data and real backend API endpoints
 */

import type {
  TradeFlowRecord,
  FlowPortRef,
  FlowUnit,
  FlowHistoricalObservation,
  FlowFiltersState,
  FlowMode,
  FlowSummaryMetrics,
  FlowVolumeBreakdownItem,
  ODMatrixData,
  FlowSegment,
  CommodityMovementNode,
} from '../../types/trade-flows';
import {
  BENCHMARK_TRADE_FLOWS,
  COMMODITY_CATALOG_BY_MODE,
  VESSEL_CLASSES_BY_MODE,
} from './trade-flows.data';
import { FlowsAnalyticsEngine } from './flows-analytics-engine';

export class TradeFlowsService {
  private static mockFlows: TradeFlowRecord[] = [...BENCHMARK_TRADE_FLOWS];

  /**
   * Strict Response Normalization Layer (Phases 4, 7, 8, 9)
   * Safely unwraps direct arrays, { flows: [...] }, { data: [...] }, and { data: { flows: [...] } }.
   * Normalizes snake_case/camelCase field names and validates data integrity.
   * Throws a descriptive Error on completely malformed responses (to enable UI Error states).
   */
  public static normalizeFlows(rawResponse: unknown): TradeFlowRecord[] {
    if (rawResponse === null || rawResponse === undefined) {
      throw new Error('Flow API Error: Response is null or undefined');
    }

    let candidateArray: unknown[] | null = null;

    if (Array.isArray(rawResponse)) {
      candidateArray = rawResponse;
    } else if (typeof rawResponse === 'object') {
      const obj = rawResponse as Record<string, unknown>;

      if (Array.isArray(obj.flows)) {
        candidateArray = obj.flows;
      } else if (Array.isArray(obj.data)) {
        candidateArray = obj.data;
      } else if (obj.data && typeof obj.data === 'object') {
        const nestedData = obj.data as Record<string, unknown>;
        if (Array.isArray(nestedData.flows)) {
          candidateArray = nestedData.flows;
        }
      }
    }

    if (!candidateArray) {
      throw new Error(
        `Invalid Flows API response structure: Expected array or object with flows/data property, received ${typeof rawResponse}`
      );
    }

    // Empty array represents valid empty state ("valid response, no flows")
    if (candidateArray.length === 0) {
      return [];
    }

    const normalizedList: TradeFlowRecord[] = [];

    for (let i = 0; i < candidateArray.length; i++) {
      const item = candidateArray[i];
      if (!item || typeof item !== 'object') continue;

      const raw = item as Record<string, unknown>;

      // 1. Identification
      const id = String(raw.id || raw._id || `flow-${i + 1}`);
      const tradeLaneCode = String(
        raw.trade_lane_code || raw.route_code || raw.routeCode || raw.tradeLaneCode || raw.lane_code || id
      );

      // 2. Mode
      const rawMode = String(raw.mode || 'dry').toLowerCase();
      const mode: FlowMode =
        rawMode === 'tanker' || rawMode === 'lng' || rawMode === 'lpg' ? (rawMode as FlowMode) : 'dry';

      // 3. Commodity
      const commodity = String(raw.commodity || raw.commodity_name || raw.commodityName || 'General Cargo');
      const commodityGroup = String(raw.commodity_group || raw.commodityGroup || 'Commodities');

      // 4. Origin Port Reference
      let origin: FlowPortRef;
      if (raw.origin && typeof raw.origin === 'object') {
        const o = raw.origin as Record<string, unknown>;
        origin = {
          id: Number(o.id) || 1000 + i,
          name: String(o.name || raw.origin_port || raw.originPort || 'Origin Port'),
          unlocode: o.unlocode ? String(o.unlocode) : undefined,
          country: String(o.country || raw.origin_country || raw.originCountry || 'Global'),
          region: String(o.region || raw.origin_region || raw.originRegion || 'International'),
          latitude: Number(o.latitude ?? o.lat ?? raw.origin_latitude ?? raw.originLat ?? 0),
          longitude: Number(o.longitude ?? o.lng ?? o.lon ?? raw.origin_longitude ?? raw.originLng ?? 0),
        };
      } else {
        origin = {
          id: 1000 + i,
          name: String(raw.origin_port || raw.originPort || raw.origin || 'Origin Port'),
          country: String(raw.origin_country || raw.originCountry || 'Global'),
          region: String(raw.origin_region || raw.originRegion || 'International'),
          latitude: Number(raw.origin_latitude ?? raw.originLat ?? 0),
          longitude: Number(raw.origin_longitude ?? raw.originLng ?? 0),
        };
      }

      // 5. Destination Port Reference
      let destination: FlowPortRef;
      if (raw.destination && typeof raw.destination === 'object') {
        const d = raw.destination as Record<string, unknown>;
        destination = {
          id: Number(d.id) || 2000 + i,
          name: String(d.name || raw.destination_port || raw.destinationPort || 'Destination Port'),
          unlocode: d.unlocode ? String(d.unlocode) : undefined,
          country: String(d.country || raw.destination_country || raw.destinationCountry || 'Global'),
          region: String(d.region || raw.destination_region || raw.destinationRegion || 'International'),
          latitude: Number(d.latitude ?? d.lat ?? raw.destination_latitude ?? raw.destinationLat ?? 0),
          longitude: Number(d.longitude ?? d.lng ?? d.lon ?? raw.destination_longitude ?? raw.destinationLng ?? 0),
        };
      } else {
        destination = {
          id: 2000 + i,
          name: String(raw.destination_port || raw.destinationPort || raw.destination || 'Destination Port'),
          country: String(raw.destination_country || raw.destinationCountry || 'Global'),
          region: String(raw.destination_region || raw.destinationRegion || 'International'),
          latitude: Number(raw.destination_latitude ?? raw.destinationLat ?? 0),
          longitude: Number(raw.destination_longitude ?? raw.destinationLng ?? 0),
        };
      }

      // 6. Volume Normalization (MT and Native)
      const rawVol = raw.current_volume_mt ?? raw.flow_volume ?? raw.volume_mt ?? raw.volumeMt ?? raw.volume;
      const currentVolumeMt = Number(rawVol);
      if (!Number.isFinite(currentVolumeMt) || currentVolumeMt < 0) {
        continue; // Discard invalid volume records intentionally
      }

      const rawNativeVol = raw.volume_native ?? raw.volumeNative ?? currentVolumeMt;
      const volumeNative = Number.isFinite(Number(rawNativeVol)) ? Number(rawNativeVol) : currentVolumeMt;
      const nativeUnit = (String(raw.native_unit || raw.nativeUnit || 'MT')) as FlowUnit;

      // 7. Direction
      const rawDir = String(raw.direction || 'export').toLowerCase();
      const direction: 'export' | 'import' = rawDir === 'import' ? 'import' : 'export';

      // 8. Vessel Classes
      const primaryVesselClass = String(
        raw.primary_vessel_class || raw.vessel_class || raw.vesselClass || 'Standard'
      );
      const vesselClasses = Array.isArray(raw.vessel_classes)
        ? (raw.vessel_classes as string[])
        : Array.isArray(raw.vesselClasses)
          ? (raw.vesselClasses as string[])
          : [primaryVesselClass];

      // 9. Operational Telemetry
      const typicalTransitDays = Math.max(1, Number(raw.typical_transit_days ?? raw.transit_days ?? 14));
      const distanceNm = Math.max(100, Number(raw.distance_nm ?? raw.distance ?? 4000));
      const activeVesselCount = Math.max(0, Number(raw.active_vessel_count ?? raw.active_vessels ?? 1));
      const changeVsPriorPeriodPct = Number(raw.change_vs_prior_period_pct ?? raw.pct_change ?? 0);

      // 10. Historical Series
      const historicalSeries: FlowHistoricalObservation[] = Array.isArray(raw.historical_series)
        ? (raw.historical_series as FlowHistoricalObservation[])
        : [];

      normalizedList.push({
        id,
        trade_lane_code: tradeLaneCode,
        mode,
        commodity,
        commodity_group: commodityGroup,
        origin,
        destination,
        vessel_classes: vesselClasses,
        primary_vessel_class: primaryVesselClass,
        current_volume_mt: currentVolumeMt,
        volume_native: volumeNative,
        native_unit: nativeUnit,
        direction,
        typical_transit_days: typicalTransitDays,
        distance_nm: distanceNm,
        active_vessel_count: activeVesselCount,
        change_vs_prior_period_pct: Number.isFinite(changeVsPriorPeriodPct) ? changeVsPriorPeriodPct : 0,
        historical_series: historicalSeries,
        updated_at: String(raw.updated_at || new Date().toISOString()),
        data_source: String(raw.data_source || 'SIH Telemetry Engine'),
      });
    }

    return normalizedList;
  }

  /**
   * Synchronous Initial Flow Data Provider (Phase 6)
   * Guaranteed to synchronously return a valid, normalized TradeFlowRecord[]
   * Prevents unfulfilled Promise from entering React Query cache
   */
  public static getInitialFlows(filters?: Partial<FlowFiltersState>): TradeFlowRecord[] {
    const validatedFlows = this.normalizeFlows(this.mockFlows);

    if (!filters) {
      return validatedFlows;
    }

    const defaultFilters: FlowFiltersState = {
      searchQuery: '',
      mode: filters.mode || 'dry',
      commodity: filters.commodity || 'all',
      originCountry: filters.originCountry || 'all',
      destinationCountry: filters.destinationCountry || 'all',
      originPortId: filters.originPortId || 'all',
      destinationPortId: filters.destinationPortId || 'all',
      vesselClass: filters.vesselClass || 'all',
      region: filters.region || 'all',
      timeHorizon: filters.timeHorizon || 'current',
      direction: filters.direction || 'all',
      ...filters,
    };

    return FlowsAnalyticsEngine.filterFlows(validatedFlows, defaultFilters);
  }

  /**
   * Fetch all trade flows, optionally filtered (Phase 4)
   */
  public static async getTradeFlows(filters?: Partial<FlowFiltersState>): Promise<TradeFlowRecord[]> {
    return this.getInitialFlows(filters);
  }

  /**
   * Get a single trade flow by ID
   */
  public static async getTradeFlowById(id: string): Promise<TradeFlowRecord | null> {
    const flow = this.mockFlows.find((f) => f.id === id);
    return flow || null;
  }

  /**
   * Get available commodities for the selected mode
   */
  public static getAvailableCommodities(mode?: FlowMode): string[] {
    if (!mode) {
      return Object.values(COMMODITY_CATALOG_BY_MODE).flat();
    }
    return COMMODITY_CATALOG_BY_MODE[mode] || [];
  }

  /**
   * Get available vessel classes for the selected mode
   */
  public static getAvailableVesselClasses(mode?: FlowMode): string[] {
    if (!mode) {
      return Object.values(VESSEL_CLASSES_BY_MODE).flat();
    }
    return VESSEL_CLASSES_BY_MODE[mode] || [];
  }

  /**
   * Get unique origin and destination countries from flow records
   */
  public static getAvailableCountries(flows: TradeFlowRecord[]): { origins: string[]; destinations: string[] } {
    const origins = new Set<string>();
    const destinations = new Set<string>();

    for (const f of flows) {
      if (f.origin?.country) origins.add(f.origin.country);
      if (f.destination?.country) destinations.add(f.destination.country);
    }

    return {
      origins: Array.from(origins).sort((a, b) => a.localeCompare(b)),
      destinations: Array.from(destinations).sort((a, b) => a.localeCompare(b)),
    };
  }

  /**
   * Get unique global regions from flow records
   */
  public static getAvailableRegions(flows: TradeFlowRecord[]): string[] {
    const regions = new Set<string>();

    for (const f of flows) {
      if (f.origin?.region) regions.add(f.origin.region);
      if (f.destination?.region) regions.add(f.destination.region);
    }

    return Array.from(regions).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get full summary metrics
   */
  public static getSummary(flows: TradeFlowRecord[]): FlowSummaryMetrics {
    return FlowsAnalyticsEngine.synthesizeFlowSummary(flows);
  }

  /**
   * Get OD Matrix data
   */
  public static getODMatrix(flows: TradeFlowRecord[], groupBy: 'port' | 'country' = 'port'): ODMatrixData {
    return FlowsAnalyticsEngine.buildODMatrix(flows, groupBy);
  }

  /**
   * Get Map Flow Segments
   */
  public static getMapFlowSegments(flows: TradeFlowRecord[]): FlowSegment[] {
    return FlowsAnalyticsEngine.buildMapFlowSegments(flows);
  }

  /**
   * Get Volume breakdowns
   */
  public static getVolumeBreakdowns(flows: TradeFlowRecord[]): {
    byCommodity: FlowVolumeBreakdownItem[];
    byOrigin: FlowVolumeBreakdownItem[];
    byDestination: FlowVolumeBreakdownItem[];
    byRegion: FlowVolumeBreakdownItem[];
    byVesselClass: FlowVolumeBreakdownItem[];
  } {
    return {
      byCommodity: FlowsAnalyticsEngine.aggregateByCommodity(flows),
      byOrigin: FlowsAnalyticsEngine.aggregateByOrigin(flows, 'port'),
      byDestination: FlowsAnalyticsEngine.aggregateByDestination(flows, 'port'),
      byRegion: FlowsAnalyticsEngine.aggregateByRegion(flows),
      byVesselClass: FlowsAnalyticsEngine.aggregateByVesselClass(flows),
    };
  }

  /**
   * Get Historical Trend
   */
  public static getHistoricalTrend(flows: TradeFlowRecord[]) {
    return FlowsAnalyticsEngine.buildHistoricalTrend(flows);
  }

  /**
   * Get single commodity movement profile
   */
  public static getCommodityMovement(
    flows: TradeFlowRecord[],
    commodityName: string
  ): CommodityMovementNode | null {
    return FlowsAnalyticsEngine.buildCommodityMovement(flows, commodityName);
  }
}
