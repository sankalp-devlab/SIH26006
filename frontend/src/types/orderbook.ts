/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook & Fleet Growth Intelligence Types
 * Canonical domain definitions for newbuilding contracts, deliveries, demolitions, and fleet dynamics.
 */

export type OrderbookSector = 'all' | 'dry' | 'tanker' | 'gas' | 'container';

export type OrderbookStatus =
  | 'ordered'
  | 'under_construction'
  | 'launched'
  | 'delivered'
  | 'cancelled';

export type PropulsionType =
  | 'Conventional HFO/VLSFO'
  | 'Dual-Fuel LNG'
  | 'Methanol-Ready'
  | 'Ammonia-Ready'
  | 'Battery-Hybrid';

export type DeliveryType = 'actual' | 'expected';

export type DemolitionType = 'actual' | 'projected';

export type OrderbookTab =
  | 'growth'
  | 'orders'
  | 'deliveries'
  | 'demolitions'
  | 'shipyards'
  | 'comparison';

/**
 * Canonical Orderbook Record
 */
export interface OrderbookRecord {
  id: string;
  hull_number: string;
  vessel_name: string;
  vessel_class: string;
  sector: 'dry' | 'tanker' | 'gas' | 'container';
  shipyard_id: string;
  shipyard_name: string;
  shipyard_country: string;
  shipyard_group: string;
  owner_name: string;
  owner_country: string;
  order_date: string; // YYYY-MM-DD
  expected_delivery_date: string; // YYYY-MM-DD
  expected_delivery_year: number;
  expected_delivery_quarter: string; // e.g. "2026-Q3"
  actual_delivery_date?: string;
  status: OrderbookStatus;
  capacity_dwt: number;
  capacity_cbm?: number;
  capacity_teu?: number;
  propulsion_type: PropulsionType;
  scrubber_fitted: boolean;
  contract_price_usd_m: number;
  imo_number?: string;
  classification_society?: string;
  notes?: string;
  updated_at: string;
  data_source: string;
}

/**
 * Scheduled Delivery Record
 */
export interface DeliveryRecord {
  id: string;
  order_id: string;
  hull_number?: string;
  vessel_name: string;
  vessel_class: string;
  sector: 'dry' | 'tanker' | 'gas' | 'container';
  shipyard_name: string;
  shipyard_country: string;
  owner_name?: string;
  delivery_date?: string;
  delivery_year: number;
  delivery_month: string; // YYYY-MM
  delivery_quarter: string; // e.g. "2026-Q2"
  capacity_dwt: number;
  propulsion_type: PropulsionType;
  delivery_type: DeliveryType;
  status: 'completed' | 'on_schedule' | 'delayed';
  slippage_risk?: 'low' | 'medium' | 'high';
}

/**
 * Vessel Demolition / Scrapping Record
 */
export interface DemolitionRecord {
  id: string;
  vessel_name: string;
  vessel_class: string;
  sector: 'dry' | 'tanker' | 'gas' | 'container';
  year_built: number;
  demolition_year: number;
  demolition_month: string; // YYYY-MM
  scrapping_age_years: number;
  capacity_dwt: number;
  ldt?: number;
  scrapping_location: string;
  scrapping_country?: string;
  scrap_price_per_ldt_usd: number;
  demolition_type: DemolitionType;
  green_recycling_certified?: boolean;
}

/**
 * Global Shipyard Facility & Performance
 */
export interface ShipyardRecord {
  id: string;
  name: string;
  country: string;
  region: string;
  group: string; // CSSC, HD Hyundai, Hanwha Ocean, etc.
  total_active_orders: number;
  orderbook_dwt: number;
  market_share_pct: number;
  earliest_available_slot_year: number;
  primary_vessel_classes: string[];
  green_propulsion_share_pct: number;
  dock_slots_count: number;
  backlog_years?: number;
}

/**
 * Current Active Fleet Baseline Snapshot
 */
export interface FleetSnapshot {
  sector: 'dry' | 'tanker' | 'gas' | 'container';
  vessel_class: string;
  active_vessels_count: number;
  active_dwt: number;
  avg_fleet_age_years: number;
  orderbook_vessels_count: number;
  orderbook_dwt: number;
  orderbook_to_fleet_pct: number;
}

/**
 * Annual / Monthly Fleet Growth Observation Point
 */
export interface FleetGrowthPoint {
  year: number;
  beginning_fleet_dwt: number;
  beginning_vessels_count: number;
  deliveries_dwt: number;
  deliveries_vessels_count: number;
  demolitions_dwt: number;
  demolitions_vessels_count: number;
  net_additions_dwt: number;
  net_additions_vessels: number;
  ending_fleet_dwt: number;
  ending_vessels_count: number;
  growth_rate_pct: number;
  period_type: 'historical' | 'current' | 'projected';
}

/**
 * Executive 6-Pillar Summary Metrics Strip
 */
export interface OrderbookSummaryMetrics {
  active_fleet_vessels: number;
  active_fleet_dwt: number;
  active_fleet_dwt_formatted: string;
  orderbook_vessels: number;
  orderbook_dwt: number;
  orderbook_dwt_formatted: string;
  orderbook_to_fleet_pct: number;
  scheduled_deliveries_next_12m_count: number;
  scheduled_deliveries_next_12m_dwt: number;
  demolitions_past_12m_count: number;
  demolitions_past_12m_dwt: number;
  projected_net_growth_pct: number;
  green_propulsion_share_pct: number;
  top_shipyard_group: string;
  top_shipyard_market_share: number;
}

/**
 * Centralized Filter State
 */
export interface OrderbookFiltersState {
  searchQuery: string;
  sector: OrderbookSector;
  vesselClass: string; // 'all' or specific class
  shipyardCountry: string; // 'all' or specific country
  shipyardGroup: string; // 'all' or specific group
  status: string; // 'all' or OrderbookStatus
  propulsionType: string; // 'all' or PropulsionType
  deliveryYear: number | 'all';
}

/**
 * Historical Comparison Benchmark Horizon
 */
export interface HistoricalComparisonItem {
  period_label: string; // 'Current (2026)', '1Y Ago (2025)', '3Y Ago (2023)', '5Y Ago (2021)', '10Y Ago (2016)'
  year: number;
  active_fleet_dwt: number;
  orderbook_dwt: number;
  orderbook_to_fleet_pct: number;
  annual_deliveries_dwt: number;
  annual_demolitions_dwt: number;
  avg_newbuilding_price_usd_m: number;
}

/**
 * Consolidate Unified Orderbook Payload
 */
export interface OrderbookDataPayload {
  orders: OrderbookRecord[];
  deliveries: DeliveryRecord[];
  demolitions: DemolitionRecord[];
  shipyards: ShipyardRecord[];
  fleetSnapshots: FleetSnapshot[];
  historicalComparison: HistoricalComparisonItem[];
}
