export interface Vessel {
  id: number;
  name: string;
  imo_number: string | null;
  vessel_type: string | null;
  flag: string | null;
  capacity_tons: number | null;
  length_m: number | null;
  width_m: number | null;
  draft_m: number | null;
  year_built: number | null;
  status: string | null;
  speed_laden_knots: number | null;
  speed_ballast_knots: number | null;
  fuel_laden_mt_day: number | null;
  fuel_ballast_mt_day: number | null;
  cargo_types: string | null;
  created_at: string | null;
}

export interface VesselSearchParams {
  name?: string;
  limit?: number;
}
