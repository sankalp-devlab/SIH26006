/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Visualization & Intelligence Domain Types
 */

export type FlowMode = 'tanker' | 'dry' | 'lng' | 'lpg';

export type FlowDirection = 'all' | 'import' | 'export';

export type FlowTimeHorizon = 'current' | '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export type FlowUnit = 'MT' | 'kMT' | 'MMT' | 'bbl' | 'kbpd' | 'MMbbl' | 'm3' | 'k_m3';

export type FlowsTab = 'map' | 'volume' | 'trends' | 'od_matrix' | 'commodity' | 'corridors';

export interface FlowPortRef {
  id: number;
  name: string;
  unlocode?: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface FlowHistoricalObservation {
  date: string; // YYYY-MM
  volume_mt: number;
  native_volume: number;
  native_unit: FlowUnit;
  voyages_count: number;
}

export interface TradeFlowRecord {
  id: string;
  trade_lane_code: string; // e.g. "AU-CN-IO-01"
  mode: FlowMode;
  commodity: string;
  commodity_group: string; // e.g. "Ferrous Metals", "Crude Petroleum", "Clean Products", "Gas"
  origin: FlowPortRef;
  destination: FlowPortRef;
  vessel_classes: string[];
  primary_vessel_class: string;
  current_volume_mt: number;
  volume_native: number;
  native_unit: FlowUnit;
  direction: 'export' | 'import';
  typical_transit_days: number;
  distance_nm: number;
  active_vessel_count: number;
  change_vs_prior_period_pct: number;
  historical_series: FlowHistoricalObservation[];
  updated_at: string;
  data_source: string;
}

export interface FlowSegment {
  flow_id: string;
  trade_lane_code: string;
  mode: FlowMode;
  commodity: string;
  origin_name: string;
  destination_name: string;
  origin_coords: [number, number]; // [lat, lng]
  destination_coords: [number, number]; // [lat, lng]
  mid_curve_coords: [number, number]; // [lat, lng]
  curve_points: [number, number][]; // [lat, lng] array
  volume_mt: number;
  stroke_width: number;
  stroke_color: string;
  active_vessels: number;
}

export interface FlowFiltersState {
  searchQuery: string;
  mode: FlowMode;
  commodity: string; // 'all' or specific commodity
  originCountry: string; // 'all' or country
  destinationCountry: string; // 'all' or country
  originPortId: number | 'all';
  destinationPortId: number | 'all';
  vesselClass: string; // 'all' or specific vessel class
  region: string; // 'all' or global region
  timeHorizon: FlowTimeHorizon;
  direction: FlowDirection;
}

export interface FlowSummaryMetrics {
  total_volume_mt: number;
  total_volume_formatted: string;
  active_flows_count: number;
  origin_ports_count: number;
  destination_ports_count: number;
  top_commodity: string;
  top_commodity_volume_mt: number;
  top_route: string;
  top_route_volume_mt: number;
  import_volume_mt: number;
  export_volume_mt: number;
  avg_transit_days: number;
  active_vessels_sum: number;
}

export interface ODMatrixCell {
  origin_key: string;
  destination_key: string;
  volume_mt: number;
  volume_formatted: string;
  active_flows_count: number;
  voyages_count: number;
  dominant_commodity: string;
  primary_vessel_class: string;
  flow_ids: string[];
  heat_intensity: number; // 0.0 to 1.0
}

export interface ODMatrixData {
  origins: string[];
  destinations: string[];
  cells: Record<string, ODMatrixCell>; // key: `${origin}:::${destination}`
  max_volume_mt: number;
  total_matrix_volume_mt: number;
}

export interface CommodityMovementNode {
  commodity: string;
  mode: FlowMode;
  total_volume_mt: number;
  export_share_pct: number;
  import_share_pct: number;
  top_origins: { name: string; volume_mt: number; pct: number }[];
  top_destinations: { name: string; volume_mt: number; pct: number }[];
  vessel_distribution: { vessel_class: string; volume_mt: number; pct: number }[];
  historical_trend: { date: string; volume_mt: number }[];
}

export interface FlowVolumeBreakdownItem {
  key: string;
  label: string;
  volume_mt: number;
  percentage: number;
  unit: string;
  count: number;
}
