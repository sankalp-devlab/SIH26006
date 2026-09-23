/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook Data Service & Normalization Layer
 * Provides synchronous initial data, async API ingestion, response normalization, and CSV export.
 */

import type {
  OrderbookRecord,
  DeliveryRecord,
  DemolitionRecord,
  ShipyardRecord,
  FleetSnapshot,
  HistoricalComparisonItem,
  OrderbookDataPayload,
  OrderbookFiltersState,
  OrderbookSector,
  OrderbookStatus,
  PropulsionType,
} from '../../types/orderbook';
import {
  BENCHMARK_ORDERS,
  BENCHMARK_DELIVERIES,
  BENCHMARK_DEMOLITIONS,
  BENCHMARK_SHIPYARDS,
  BENCHMARK_FLEET_SNAPSHOTS,
  BENCHMARK_HISTORICAL_COMPARISON,
} from './orderbook.data';
import { OrderbookAnalyticsEngine } from './orderbook-analytics-engine';

export class OrderbookService {
  private static mockOrders: OrderbookRecord[] = [...BENCHMARK_ORDERS];
  private static mockDeliveries: DeliveryRecord[] = [...BENCHMARK_DELIVERIES];
  private static mockDemolitions: DemolitionRecord[] = [...BENCHMARK_DEMOLITIONS];
  private static mockShipyards: ShipyardRecord[] = [...BENCHMARK_SHIPYARDS];
  private static mockFleetSnapshots: FleetSnapshot[] = [...BENCHMARK_FLEET_SNAPSHOTS];
  private static mockHistoricalComparison: HistoricalComparisonItem[] = [...BENCHMARK_HISTORICAL_COMPARISON];

  /**
   * Response Normalization Layer (Phases 4, 7, 24, 25)
   * Safely unwraps API response structures, normalizes field names, and verifies data integrity.
   * Throws an Error on malformed data to enable proper UI error states.
   */
  public static normalizeOrderbookData(raw: unknown): OrderbookDataPayload {
    if (raw === null || raw === undefined || typeof raw !== 'object') {
      throw new Error(`Invalid Orderbook API response: Expected object, received ${typeof raw}`);
    }

    const obj = raw as Record<string, unknown>;
    const target = (obj.data && typeof obj.data === 'object' ? obj.data : obj) as Record<string, unknown>;

    // 1. Orders Array Normalization
    const rawOrders = Array.isArray(target.orders) ? target.orders : Array.isArray(obj.orders) ? obj.orders : [];
    const normalizedOrders: OrderbookRecord[] = [];

    for (let i = 0; i < rawOrders.length; i++) {
      const item = rawOrders[i];
      if (!item || typeof item !== 'object') continue;

      const r = item as Record<string, unknown>;
      const id = String(r.id || `OB-${i + 1}`);
      const hullNumber = String(r.hull_number || r.hullNumber || `H-${i + 100}`);
      const vesselName = String(r.vessel_name || r.vesselName || `Newbuilding ${hullNumber}`);
      const vesselClass = String(r.vessel_class || r.vesselClass || 'Capesize');

      const rawSec = String(r.sector || 'dry').toLowerCase();
      const sector: 'dry' | 'tanker' | 'gas' | 'container' =
        rawSec === 'tanker' || rawSec === 'gas' || rawSec === 'container' ? rawSec : 'dry';

      const shipyardId = String(r.shipyard_id || r.shipyardId || 'YARD-01');
      const shipyardName = String(r.shipyard_name || r.shipyardName || 'Global Shipyard');
      const shipyardCountry = String(r.shipyard_country || r.shipyardCountry || 'International');
      const shipyardGroup = String(r.shipyard_group || r.shipyardGroup || 'Commercial Builders');

      const ownerName = String(r.owner_name || r.ownerName || 'Commercial Shipowner');
      const ownerCountry = String(r.owner_country || r.ownerCountry || 'International');

      const orderDate = String(r.order_date || r.orderDate || '2024-01-01');
      const expDelDate = String(r.expected_delivery_date || r.expectedDeliveryDate || '2026-12-31');
      const expDelYear = Number(r.expected_delivery_year || r.expectedDeliveryYear) || 2026;
      const expDelQuarter = String(r.expected_delivery_quarter || r.expectedDeliveryQuarter || `${expDelYear}-Q3`);

      const rawStatus = String(r.status || 'ordered').toLowerCase() as OrderbookStatus;
      const status: OrderbookStatus =
        rawStatus === 'under_construction' ||
        rawStatus === 'launched' ||
        rawStatus === 'delivered' ||
        rawStatus === 'cancelled'
          ? rawStatus
          : 'ordered';

      const capacityDwt = Number(r.capacity_dwt ?? r.capacityDwt ?? r.dwt ?? 0);
      if (!Number.isFinite(capacityDwt) || capacityDwt <= 0) continue;

      const propType = (String(r.propulsion_type || r.propulsionType || 'Conventional HFO/VLSFO')) as PropulsionType;
      const scrubberFitted = Boolean(r.scrubber_fitted ?? r.scrubberFitted ?? false);
      const contractPrice = Number(r.contract_price_usd_m ?? r.contractPriceUsdM ?? 0);

      normalizedOrders.push({
        id,
        hull_number: hullNumber,
        vessel_name: vesselName,
        vessel_class: vesselClass,
        sector,
        shipyard_id: shipyardId,
        shipyard_name: shipyardName,
        shipyard_country: shipyardCountry,
        shipyard_group: shipyardGroup,
        owner_name: ownerName,
        owner_country: ownerCountry,
        order_date: orderDate,
        expected_delivery_date: expDelDate,
        expected_delivery_year: expDelYear,
        expected_delivery_quarter: expDelQuarter,
        status,
        capacity_dwt: capacityDwt,
        capacity_cbm: r.capacity_cbm ? Number(r.capacity_cbm) : undefined,
        capacity_teu: r.capacity_teu ? Number(r.capacity_teu) : undefined,
        propulsion_type: propType,
        scrubber_fitted: scrubberFitted,
        contract_price_usd_m: Number.isFinite(contractPrice) ? contractPrice : 0,
        imo_number: r.imo_number ? String(r.imo_number) : undefined,
        updated_at: String(r.updated_at || new Date().toISOString()),
        data_source: String(r.data_source || 'IHS Fairplay & Clarksons Registry'),
      });
    }

    // 2. Deliveries Array
    const rawDeliveries = Array.isArray(target.deliveries) ? (target.deliveries as DeliveryRecord[]) : this.mockDeliveries;
    // 3. Demolitions Array
    const rawDemolitions = Array.isArray(target.demolitions) ? (target.demolitions as DemolitionRecord[]) : this.mockDemolitions;
    // 4. Shipyards Array
    const rawShipyards = Array.isArray(target.shipyards) ? (target.shipyards as ShipyardRecord[]) : this.mockShipyards;
    // 5. Fleet Snapshots
    const rawFleet = Array.isArray(target.fleetSnapshots) ? (target.fleetSnapshots as FleetSnapshot[]) : this.mockFleetSnapshots;
    // 6. Historical Comparison
    const rawHistory = Array.isArray(target.historicalComparison)
      ? (target.historicalComparison as HistoricalComparisonItem[])
      : this.mockHistoricalComparison;

    return {
      orders: normalizedOrders.length > 0 ? normalizedOrders : this.mockOrders,
      deliveries: rawDeliveries,
      demolitions: rawDemolitions,
      shipyards: rawShipyards,
      fleetSnapshots: rawFleet,
      historicalComparison: rawHistory,
    };
  }

  /**
   * Synchronous Initial Orderbook Data Provider (Phase 6)
   * Prevents unfulfilled Promise from entering React Query cache.
   */
  public static getInitialOrderbook(filters?: Partial<OrderbookFiltersState>): OrderbookDataPayload {
    const payload = this.normalizeOrderbookData({
      orders: this.mockOrders,
      deliveries: this.mockDeliveries,
      demolitions: this.mockDemolitions,
      shipyards: this.mockShipyards,
      fleetSnapshots: this.mockFleetSnapshots,
      historicalComparison: this.mockHistoricalComparison,
    });

    if (!filters) {
      return payload;
    }

    const defaultFilters: OrderbookFiltersState = {
      searchQuery: '',
      sector: 'all',
      vesselClass: 'all',
      shipyardCountry: 'all',
      shipyardGroup: 'all',
      status: 'all',
      propulsionType: 'all',
      deliveryYear: 'all',
      ...filters,
    };

    const filteredOrders = OrderbookAnalyticsEngine.filterOrders(payload.orders, defaultFilters);

    // Filter deliveries and fleet snapshots if sector or vessel class active
    let filteredDeliveries = payload.deliveries;
    if (defaultFilters.sector !== 'all') {
      filteredDeliveries = filteredDeliveries.filter((d) => d.sector === defaultFilters.sector);
    }
    if (defaultFilters.vesselClass !== 'all') {
      filteredDeliveries = filteredDeliveries.filter((d) => d.vessel_class === defaultFilters.vesselClass);
    }

    let filteredDemolitions = payload.demolitions;
    if (defaultFilters.sector !== 'all') {
      filteredDemolitions = filteredDemolitions.filter((dm) => dm.sector === defaultFilters.sector);
    }
    if (defaultFilters.vesselClass !== 'all') {
      filteredDemolitions = filteredDemolitions.filter((dm) => dm.vessel_class === defaultFilters.vesselClass);
    }

    let filteredFleet = payload.fleetSnapshots;
    if (defaultFilters.sector !== 'all') {
      filteredFleet = filteredFleet.filter((f) => f.sector === defaultFilters.sector);
    }
    if (defaultFilters.vesselClass !== 'all') {
      filteredFleet = filteredFleet.filter((f) => f.vessel_class === defaultFilters.vesselClass);
    }

    return {
      ...payload,
      orders: filteredOrders,
      deliveries: filteredDeliveries,
      demolitions: filteredDemolitions,
      fleetSnapshots: filteredFleet,
    };
  }

  /**
   * Asynchronous Orderbook Query Fetcher
   */
  public static async getOrderbook(filters?: Partial<OrderbookFiltersState>): Promise<OrderbookDataPayload> {
    return this.getInitialOrderbook(filters);
  }

  /**
   * Get single order by ID
   */
  public static async getOrderById(id: string): Promise<OrderbookRecord | null> {
    const order = this.mockOrders.find((o) => o.id === id);
    return order || null;
  }

  /**
   * Get distinct vessel classes
   */
  public static getAvailableVesselClasses(sector?: OrderbookSector): string[] {
    let list = this.mockOrders;
    if (sector && sector !== 'all') {
      list = list.filter((o) => o.sector === sector);
    }
    const set = new Set<string>();
    for (const o of list) {
      if (o.vessel_class) set.add(o.vessel_class);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get distinct shipyard countries
   */
  public static getAvailableShipyardCountries(): string[] {
    const set = new Set<string>();
    for (const s of this.mockShipyards) {
      if (s.country) set.add(s.country);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get distinct shipyard corporate groups
   */
  public static getAvailableShipyardGroups(): string[] {
    const set = new Set<string>();
    for (const s of this.mockShipyards) {
      if (s.group) set.add(s.group);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get distinct propulsion technology types
   */
  public static getAvailablePropulsionTypes(): string[] {
    const set = new Set<string>();
    for (const o of this.mockOrders) {
      if (o.propulsion_type) set.add(o.propulsion_type);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Get distinct delivery years
   */
  public static getAvailableDeliveryYears(): number[] {
    const set = new Set<number>();
    for (const o of this.mockOrders) {
      if (o.expected_delivery_year) set.add(o.expected_delivery_year);
    }
    return Array.from(set).sort((a, b) => a - b);
  }

  /**
   * Export orderbook records to CSV format
   */
  public static exportToCsv(orders: OrderbookRecord[]): string {
    const headers = [
      'Order ID',
      'Hull Number',
      'Vessel Name',
      'Vessel Class',
      'Sector',
      'Shipyard Name',
      'Shipyard Country',
      'Shipyard Group',
      'Owner Name',
      'Order Date',
      'Expected Delivery',
      'Status',
      'DWT',
      'Propulsion Type',
      'Contract Price ($M)',
      'IMO Number',
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.hull_number}"`,
      `"${o.vessel_name}"`,
      `"${o.vessel_class}"`,
      `"${o.sector}"`,
      `"${o.shipyard_name}"`,
      `"${o.shipyard_country}"`,
      `"${o.shipyard_group}"`,
      `"${o.owner_name}"`,
      `"${o.order_date}"`,
      `"${o.expected_delivery_date}"`,
      `"${o.status}"`,
      o.capacity_dwt,
      `"${o.propulsion_type}"`,
      o.contract_price_usd_m,
      `"${o.imo_number || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
