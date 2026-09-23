/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 19: Maritime Booking System Type Definitions
 */

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'cost_estimated'
  | 'eta_calculated';

export interface BookingPortSummary {
  id: number;
  name: string;
  unlocode?: string;
  country?: string;
  city?: string | null;
}

export interface BookingCargoSummary {
  id: number;
  description: string;
  cargo_type: string;
  weight_tons: number;
  volume_m3?: number | null;
  origin_port_id?: number | null;
  destination_port_id?: number | null;
}

export interface BookingVesselSummary {
  id: number;
  name: string;
  imo_number?: string | null;
  vessel_type: string;
  flag?: string | null;
  capacity_tons: number;
  length_m?: number | null;
  width_m?: number | null;
  draft_m?: number | null;
  speed_laden_knots?: number | null;
}

export interface BookingRouteSummary {
  id?: number | null;
  distance_km?: number | null;
  estimated_duration_hours?: number | null;
  route_status?: string | null;
}

export interface BookingRiskDisclosure {
  status: 'DATA_UNAVAILABLE' | 'ASSESSED';
  disclosure: string;
  overall_risk_score?: number | null;
  risk_level?: string | null;
  route_risk_score?: number | null;
}

export interface BookingRecord {
  booking_id: number;
  booking_reference: string;
  cargo_id: number;
  vessel_id: number;
  route_id?: number | null;
  booking_status: BookingStatus;
  estimated_cost: number | null;
  cost_source: string | null;
  currency: string;
  estimated_eta: string | null;
  eta_source: string | null;
  created_at: string;
  cargo: BookingCargoSummary | null;
  vessel: BookingVesselSummary | null;
  route: BookingRouteSummary | null;
  origin_port: BookingPortSummary | null;
  destination_port: BookingPortSummary | null;
  recommendation_metadata?: Record<string, any> | null;
  risk_disclosure?: BookingRiskDisclosure | null;
  operational_notice?: string;
  allowed_next_statuses: BookingStatus[];
}

export interface CreateBookingRequest {
  cargo_id: number;
  vessel_id: number;
  route_id?: number | string | null;
  origin_port_id?: number | null;
  destination_port_id?: number | null;
  estimated_cost?: number | null;
  cost_source?: string | null;
  estimated_eta?: string | null;
  eta_source?: string | null;
  preference?: string | null;
  notes?: string | null;
  idempotency_key?: string | null;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  notes?: string | null;
}

export interface BookingListResponse {
  count: number;
  limit: number;
  offset: number;
  bookings: BookingRecord[];
}

export interface BookingFilters {
  status?: string;
  cargo_id?: number;
  vessel_id?: number;
  limit?: number;
  offset?: number;
}
