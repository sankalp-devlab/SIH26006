/**
 * Voyages Intelligence Types & Interfaces
 * SIH 26006 Maritime Intelligence Platform
 */

export type VoyageStatus = 'active' | 'predicted' | 'completed' | 'in_port';
export type VoyageLegType = 'ballast' | 'laden';

export interface PortRef {
  id: number;
  name: string;
  country: string;
  unlocode?: string | null;
  latitude: number;
  longitude: number;
}

export interface VoyageLeg {
  id: string;
  voyage_id: string;
  leg_type: VoyageLegType;
  sequence: number;
  origin_port: PortRef;
  destination_port: PortRef;
  departure_time: string;
  arrival_time: string;
  distance_nm: number;
  avg_speed_knots: number;
  fuel_consumed_mt: number;
  status: 'completed' | 'active' | 'scheduled';
  coordinates: [number, number][];
}

export interface PortCall {
  id: string;
  voyage_id: string;
  vessel_id: number;
  vessel_name: string;
  port: PortRef;
  arrival_date: string;
  departure_date: string;
  berth_duration_hours: number;
  waiting_time_hours: number;
  operation_type: 'Loading' | 'Discharging' | 'Bunkering' | 'Anchorage' | 'Transit';
  status: 'Completed' | 'At Berth' | 'Anchored' | 'Expected';
}

export interface STSEvent {
  id: string;
  voyage_id: string;
  mother_vessel_id: number;
  mother_vessel_name: string;
  daughter_vessel_id?: number | null;
  daughter_vessel_name: string;
  daughter_vessel_imo?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  cargo_commodity: string;
  quantity_mt: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: 'In Progress' | 'Completed';
}

export interface VoyageRecord {
  id: string;
  voyage_number: string;
  vessel_id: number;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  capacity_tons: number;
  operator: string;
  charterer: string;
  origin_port: PortRef;
  destination_port: PortRef;
  status: VoyageStatus;
  current_leg_type: VoyageLegType;
  current_leg_index?: number;
  departure_date: string;
  eta_date: string;
  completed_date?: string;
  distance_total_nm: number;
  distance_to_go_nm: number;
  current_latitude: number;
  current_longitude: number;
  current_speed_knots: number;
  current_draft_m: number;
  current_heading: number;
  cargo_manifest: {
    commodity: string;
    quantity_mt: number;
    stowage_factor: number;
    hazard_class?: string;
  };
  legs: VoyageLeg[];
  port_calls: PortCall[];
  sts_events: STSEvent[];
  confidence_pct?: number; // for predicted voyages
  predicted_reason?: string;
}

export interface VoyageFiltersState {
  searchQuery: string;
  vesselId: string;
  status: 'all' | VoyageStatus;
  legType: 'all' | VoyageLegType;
  originPort: string;
  destinationPort: string;
  operator: string;
  dateRange: 'all' | 'last_7d' | 'last_30d' | 'last_90d' | 'active_now';
}

export interface CountryTradeMetric {
  country: string;
  voyage_count: number;
  total_volume_mt: number;
  active_vessels: number;
  primary_commodity: string;
}

export interface PortAggregationMetric {
  port_id: number;
  port_name: string;
  country: string;
  calls_count: number;
  avg_waiting_hours: number;
  avg_berth_hours: number;
  total_cargo_handled_mt: number;
}

export interface TradeCorridorMetric {
  corridor: string;
  origin: string;
  destination: string;
  voyage_count: number;
  avg_transit_days: number;
  dominant_cargo: string;
}

export interface OperatorAnalysisMetric {
  operator: string;
  fleet_size: number;
  active_voyages: number;
  laden_ratio_pct: number;
  primary_trades: string[];
}

export interface VoyageAnalyticsSummary {
  total_voyages: number;
  active_voyages: number;
  predicted_voyages: number;
  completed_voyages: number;
  laden_ratio_pct: number;
  avg_turnaround_hours: number;
  total_ton_miles_m: number;
  country_metrics: CountryTradeMetric[];
  port_metrics: PortAggregationMetric[];
  trade_corridors: TradeCorridorMetric[];
  operator_metrics: OperatorAnalysisMetric[];
}
