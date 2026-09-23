/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator & Maritime Routing Domain Types
 */

export type RoutingMode = 'port_to_port' | 'point_to_port' | 'vessel_to_port';

export type RoutePreference = 'shortest' | 'avoid_piracy' | 'avoid_seca' | 'avoid_canals';

export type WaypointCategory =
  | 'origin'
  | 'waypoint'
  | 'chokepoint'
  | 'canal'
  | 'seca_entry'
  | 'seca_exit'
  | 'destination'
  | 'custom';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RoutingPoint {
  id: string;
  name: string;
  category: WaypointCategory;
  latitude: number;
  longitude: number;
  leg_distance_nm: number;
  cumulative_distance_nm: number;
  is_seca: boolean;
  is_manual?: boolean;
  notes?: string;
}

export interface RouteLegDetail {
  leg_number: number;
  from_name: string;
  to_name: string;
  from_coords: [number, number];
  to_coords: [number, number];
  distance_nm: number;
  is_distance_manual: boolean;
  auto_distance_nm: number;
  is_seca: boolean;
  fuel_type: 'VLSFO' | 'LSMGO' | 'MGO';
  sea_hours: number;
  sea_days: number;
  fuel_burn_mt: number;
  co2_emissions_mt: number;
}

export interface PiracyZoneAlert {
  zone_id: string;
  zone_name: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  affected_legs: string[];
  recommendation: string;
  avoidance_route_delta_nm: number;
}

export interface CanalRestrictionAlert {
  canal_name: 'Suez Canal' | 'Panama Canal' | 'Kiel Canal';
  is_available: boolean;
  reason?: string;
  max_draft_m: number;
  vessel_draft_m?: number;
  toll_usd: number;
}

export interface FuelImplication {
  vlsfo_sea_mt: number;
  lsmgo_sea_mt: number;
  total_fuel_mt: number;
  total_fuel_cost_usd: number;
}

export interface EmissionImplication {
  co2_total_mt: number;
  co2_seca_mt: number;
  co2_non_seca_mt: number;
  eu_ets_cost_eur: number;
}

export interface DistanceCalculationResult {
  total_distance_nm: number;
  seca_distance_nm: number;
  non_seca_distance_nm: number;
  canal_distance_nm: number;

  // Timing
  base_sea_days: number;
  weather_margin_pct: number;
  adjusted_sea_days: number;
  adjusted_sea_hours: number;
  departure_time: string;
  estimated_arrival_time: string;

  // Geometry & Route
  points: RoutingPoint[];
  legs: RouteLegDetail[];
  route_geometry: [number, number][]; // [lat, lng] array for Leaflet polyline
  is_manually_modified: boolean;

  // Commercial & Operations
  fuel_implications: FuelImplication;
  emission_implications: EmissionImplication;
  piracy_alerts: PiracyZoneAlert[];
  canal_alerts: CanalRestrictionAlert[];
  warnings: string[];
}

export interface RouteAlternativeOption {
  id: string;
  name: string;
  preference: RoutePreference;
  description: string;
  total_distance_nm: number;
  adjusted_sea_days: number;
  fuel_burn_mt: number;
  co2_emissions_mt: number;
  seca_distance_nm: number;
  canal_cost_usd: number;
  delta_distance_nm: number;
  delta_days: number;
  has_piracy_risk: boolean;
  has_canal_restriction: boolean;
}

export interface DistanceCalculationRecord {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  mode: RoutingMode;

  // Origin / Destination
  origin_port_id?: number;
  origin_point?: GeoCoordinate;
  vessel_id?: number;
  destination_port_id: number;
  destination_point?: GeoCoordinate;

  // Speed & Timing
  speed_knots: number;
  weather_margin_pct: number;
  departure_time: string;

  // Constraints
  route_preference: RoutePreference;
  avoid_piracy: boolean;
  allow_suez: boolean;
  allow_panama: boolean;
  allow_kiel: boolean;
  enforce_seca_routing: boolean;

  // Manual Overrides
  custom_waypoints: RoutingPoint[];
  manual_distance_override_nm?: number;
  is_distance_manual: boolean;

  // Cached Result
  result?: DistanceCalculationResult;
}

export interface DistanceCalculationWorkbook {
  active_id: string;
  calculations: DistanceCalculationRecord[];
}
