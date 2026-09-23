/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 20: Live Vessel Tracking Type Definitions
 */

export type TrackingFreshnessStatus =
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'DATA_UNAVAILABLE'
  | 'PROVIDER_ERROR';

export interface PositionObservation {
  position_id: number;
  vessel_id: number;
  latitude: number;
  longitude: number;
  speed_knots: number | null;
  heading: number | null;
  recorded_at: string;
  freshness_status: TrackingFreshnessStatus;
  age_minutes: number | null;
  data_source: string;
}

export interface TrackedVesselBookingSummary {
  booking_id: number;
  booking_reference: string;
  booking_status: string;
  cargo_id: number;
  commodity?: string | null;
  weight_tons?: number | null;
  origin_port_id?: number | null;
  destination_port_id?: number | null;
  estimated_cost?: number | null;
  estimated_eta?: string | null;
}

export interface TrackedVesselSummary {
  vessel_id: number;
  name: string;
  imo_number: string | null;
  vessel_type: string;
  flag: string | null;
  capacity_tons: number;
  draft_m: number | null;
  operational_status: string;
  speed_laden_knots: number | null;
  tracking_status: TrackingFreshnessStatus;
  latest_position: PositionObservation | null;
  active_booking: TrackedVesselBookingSummary | null;
  disclosure: string;
}

export interface TrackedPortInfo {
  id: number;
  name: string;
  unlocode?: string | null;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VesselTrackingDetail {
  vessel_id: number;
  name: string;
  imo_number: string | null;
  vessel_type: string;
  flag: string | null;
  capacity_tons: number;
  draft_m: number | null;
  speed_laden_knots: number | null;
  operational_status: string;
  tracking_status: TrackingFreshnessStatus;
  latest_position: PositionObservation | null;
  position_history_count: number;
  position_history: PositionObservation[];
  active_booking: {
    booking_id: number;
    booking_reference: string;
    booking_status: string;
    cargo?: {
      id: number;
      commodity: string;
      cargo_type: string;
      weight_tons: number;
    } | null;
    origin_port?: TrackedPortInfo | null;
    destination_port?: TrackedPortInfo | null;
    estimated_cost?: number | null;
    estimated_eta?: string | null;
  } | null;
  provider_info: {
    provider_type: string;
    is_configured: boolean;
    provider_url?: string | null;
    status_message: string;
  };
  transparency_notice: string;
}

export interface BookingTrackingDetail {
  booking_id: number;
  booking_reference: string;
  booking_status: string;
  tracking_status: TrackingFreshnessStatus | 'VESSEL_UNASSIGNED';
  message?: string;
  vessel: {
    id: number;
    name: string;
    imo_number: string | null;
    vessel_type: string;
    flag: string | null;
    capacity_tons: number;
    draft_m: number | null;
    speed_laden_knots: number | null;
  } | null;
  cargo: {
    id: number;
    commodity: string;
    weight_tons: number;
    cargo_type: string;
  } | null;
  corridor: {
    origin_port?: TrackedPortInfo | null;
    destination_port?: TrackedPortInfo | null;
  };
  estimates: {
    cost: number | null;
    cost_source: string | null;
    eta: string | null;
    eta_source: string | null;
  };
  latest_position: PositionObservation | null;
  transparency_notice: string;
}

export interface TrackingSystemStatus {
  status: string;
  engine_name: string;
  engine_version: string;
  provider_info: {
    provider_type: string;
    is_configured: boolean;
    provider_url?: string | null;
    status_message: string;
  };
  metrics: {
    total_fleet_vessels: number;
    vessels_with_telemetry: number;
    live_vessels_count: number;
    recent_vessels_count: number;
    stale_vessels_count: number;
    data_unavailable_vessels_count: number;
    total_stored_positions: number;
    latest_telemetry_timestamp: string | null;
  };
  freshness_thresholds: {
    live_minutes_max: number;
    recent_minutes_max: number;
  };
  integrity_disclosure: string;
}

export interface PositionIngestPayload {
  vessel_id: number;
  latitude: number;
  longitude: number;
  speed_knots?: number | null;
  heading?: number | null;
  recorded_at?: string | null;
}

export interface PositionIngestResponse {
  success: boolean;
  action: 'INSERTED' | 'DEDUPLICATED';
  position_id: number;
  vessel_id: number;
  vessel_name?: string;
  latitude: number;
  longitude: number;
  speed_knots?: number | null;
  heading?: number | null;
  recorded_at: string;
  freshness_status: TrackingFreshnessStatus;
  age_minutes?: number | null;
  message?: string;
}
