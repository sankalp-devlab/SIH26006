export interface Route {
  id: number;
  origin_port_id: number;
  destination_port_id: number;
  distance_km: number | null;
  estimated_duration_hours: number | null;
  route_status: string;
  created_at: string | null;
}

export interface CreateRoutePayload {
  origin_port_id: number;
  destination_port_id: number;
  distance_km?: number | null;
  estimated_duration_hours?: number | null;
  route_status?: string;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'chokepoint' | 'canal' | 'waypoint';
  max_draft_m?: number;
  description?: string;
}

export interface RouteLeg {
  leg_index: number;
  from_name: string;
  to_name: string;
  distance_nm: number;
  distance_km: number;
  from_coords: [number, number];
  to_coords: [number, number];
}

export interface RouteCalculationRequest {
  origin_port_id: number;
  destination_port_id: number;
  vessel_id?: number | null;
  cargo_id?: number | null;
  cargo_type?: string;
  cargo_weight?: number;
  cargo_volume?: number;
}

export interface RoutePortDetail {
  id: number;
  name: string;
  country: string | null;
  unlocode: string | null;
  latitude: number;
  longitude: number;
}

export interface RouteVesselDetail {
  id: number;
  name: string;
  vessel_type: string | null;
  draft_m?: number | null;
  capacity_tons?: number | null;
}

export interface RouteCalculationResponse {
  route_id: string;
  db_route_id?: number;
  origin_port_id: number;
  destination_port_id: number;
  origin_port: RoutePortDetail;
  destination_port: RoutePortDetail;
  vessel_id?: number | null;
  vessel?: RouteVesselDetail | null;
  cargo_id?: number | null;
  distance_nm: number;
  distance_km: number;
  distance_type: 'maritime' | 'geodesic';
  route_type: string;
  geometry: [number, number][];
  waypoints: RouteWaypoint[];
  legs: RouteLeg[];
  restrictions: string[];
  status: 'calculated' | 'no_route';
  created_at: string;
}

export type RouteCalculationStatus =
  | 'idle'
  | 'calculating'
  | 'success'
  | 'no_route'
  | 'invalid_input'
  | 'missing_data'
  | 'api_error';
