/**
 * Geospatial Intelligence & Vessel Map Type Definitions
 * SIH 26006 Maritime Intelligence Platform
 */

export type MapTheme = 'dark' | 'voyager' | 'light';
export type MapMode = 'live' | 'historical';

export interface VesselPosition {
  id: number;
  name: string;
  imo_number: string | null;
  vessel_type: string;
  flag: string | null;
  capacity_tons: number | null;
  status: string;
  latitude: number;
  longitude: number;
  heading: number; // 0 - 359 degrees
  speed_knots: number;
  draft_m: number | null;
  destination_port: string;
  origin_port: string;
  eta: string;
  last_updated: string;
  cargo_type?: string | null;
  fuel_consumption_mt_day?: number;
}

export interface HistoricalAisPoint {
  id: string;
  vessel_id: number;
  timestamp: string; // ISO 8601
  latitude: number;
  longitude: number;
  speed_knots: number;
  heading: number;
  draft_m: number;
  status: string;
}

export interface VesselVoyageTrack {
  vessel_id: number;
  voyage_id: string;
  origin_port: { name: string; unlocode: string; lat: number; lng: number };
  destination_port: { name: string; unlocode: string; lat: number; lng: number };
  departure_time: string;
  estimated_arrival: string;
  distance_nm: number;
  points: HistoricalAisPoint[];
}

export interface MapLayerVisibility {
  vessels: boolean;
  ports: boolean;
  terminals: boolean;
  routes: boolean;
  waypoints: boolean;
  secaZones: boolean;
  labels: boolean;
}

export interface MaritimeTerminal {
  id: number;
  name: string;
  port_name: string;
  country: string;
  latitude: number;
  longitude: number;
  terminal_type: 'Container' | 'Dry Bulk' | 'Crude Oil' | 'LNG' | 'General Cargo';
  max_draft_m: number;
  berths: number;
}

export interface MaritimeWaypoint {
  id: string;
  name: string;
  category: 'Choke Point' | 'Canal' | 'Strait' | 'Passage';
  latitude: number;
  longitude: number;
  description: string;
}

export interface SecaZone {
  id: string;
  name: string;
  type: 'ECA-SOx' | 'ECA-NOx' | 'SECA';
  sulfur_limit: string;
  color: string;
  coordinates: [number, number][]; // [lat, lng] polygon ring
}
