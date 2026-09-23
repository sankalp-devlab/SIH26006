/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 12: Voyage Cost Calculation Types
 */

export interface CostCalculationRequest {
  cargo_id?: number;
  vessel_id: number;
  route_id?: number | string;
  origin_port_id?: number;
  destination_port_id?: number;
  bunker_price_usd_per_mt?: number;
  daily_hire_usd?: number;
}

export interface CostBreakdownItem {
  item: string;
  amount: number | null;
  currency: string;
  status: 'calculated' | 'unavailable';
  description: string;
}

export interface TransitMetrics {
  distance_nm: number;
  distance_km: number;
  speed_knots: number;
  speed_type: 'laden' | 'ballast';
  voyage_hours: number;
  voyage_days: number;
  fuel_consumed_mt: number | null;
  fuel_rate_mt_day: number | null;
  cargo_weight_tons: number | null;
  capacity_utilization_pct: number | null;
}

export interface CostCalculationResponse {
  cost_id: string;
  cargo_id: number | null;
  vessel_id: number;
  route_id: number | string | null;
  origin_port_id: number;
  destination_port_id: number;
  origin_port: {
    id: number;
    name: string;
    country: string;
    unlocode?: string;
  };
  destination_port: {
    id: number;
    name: string;
    country: string;
    unlocode?: string;
  };
  vessel: {
    id: number;
    name: string;
    vessel_type: string;
    capacity_tons: number;
    speed_laden_knots?: number;
    speed_ballast_knots?: number;
    fuel_laden_mt_day?: number;
    draft_m?: number;
  };
  cargo: {
    id: number;
    cargo_type: string;
    description: string | null;
    weight_tons: number;
    volume_m3: number | null;
  } | null;
  transit_metrics: TransitMetrics;
  fuel_cost: number | null;
  fuel_cost_status: 'calculated' | 'unavailable';
  fuel_cost_details: {
    fuel_consumed_mt?: number;
    fuel_price_usd_per_mt?: number | null;
    daily_burn_mt?: number;
    price_source?: string;
    formula?: string;
    reason?: string;
  };
  operating_cost: number | null;
  operating_cost_status: 'calculated' | 'unavailable';
  operating_cost_details: {
    voyage_days?: number;
    daily_rate_usd?: number | null;
    rate_source?: string;
    formula?: string;
    reason?: string;
  };
  origin_port_cost: number | null;
  destination_port_cost: number | null;
  port_cost: number | null;
  port_cost_status: 'calculated' | 'unavailable';
  port_cost_details: {
    origin_port?: string;
    destination_port?: string;
    reason?: string;
  };
  other_cost: number | null;
  other_cost_status: 'calculated' | 'unavailable';
  other_cost_details: {
    reason?: string;
  };
  total_cost: number | null;
  cost_per_tonne: number | null;
  currency: string;
  cost_status: 'complete' | 'partial' | 'unavailable';
  data_completeness: {
    route_distance: boolean;
    vessel_speed: boolean;
    voyage_duration: boolean;
    fuel_consumption_rate: boolean;
    fuel_price: boolean;
    operating_cost: boolean;
    port_charges: boolean;
    other_fees: boolean;
  };
  breakdown: CostBreakdownItem[];
  calculation_metadata: {
    engine_version: string;
    module: string;
    calculated_at: string;
    formula_summary: string;
  };
}
