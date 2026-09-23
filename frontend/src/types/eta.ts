/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Voyage ETA Calculation Engine Types
 */

export type ETAStatus = 'full' | 'partial' | 'unavailable' | 'error';

export interface ETACalculationRequest {
  cargo_id?: number;
  vessel_id: number;
  route_id?: string | number;
  origin_port_id?: number;
  destination_port_id?: number;
  departure_time?: string; // ISO 8601 string
}

export interface ETACalculationDetails {
  formula: string;
  distance_nm: number;
  effective_speed_knots: number;
  speed_source: string;
  departure_time_source: string;
  weather_adjustment: string;
  port_waiting: string;
  notice: string;
}

export interface ETACalculationResponse {
  eta_id: string;
  cargo_id: number | null;
  vessel_id: number;
  vessel_name?: string;
  vessel_type?: string;
  route_id: string | null;
  departure_time: string; // ISO 8601
  estimated_arrival: string; // ISO 8601
  distance_nm: number;
  distance_km: number;
  distance_type: string;
  effective_speed_knots: number;
  speed_source: string;
  departure_time_source: string;
  voyage_hours: number;
  voyage_days: number;
  base_voyage_duration_hours: number;
  condition_adjustment: number | null;
  condition_status: string;
  port_waiting_duration: number | null;
  port_waiting_status: string;
  eta_status: ETAStatus;
  calculation_method: string;
  calculation_details: ETACalculationDetails;
  persisted?: boolean;
  created_at: string;
}
