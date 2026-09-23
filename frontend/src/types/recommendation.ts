/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 18: Maritime Recommendation Engine Types
 */

export type OptimizationPreference = 'balanced' | 'lowest_cost' | 'fastest_eta' | 'lowest_risk';

export type RecommendationScoreTier =
  | 'EXCELLENT_FIT'
  | 'STRONG_FIT'
  | 'MODERATE_FIT'
  | 'SUBOPTIMAL_FIT';

export interface PreferenceProfile {
  key: OptimizationPreference;
  label: string;
  description: string;
  weights: {
    capacity_fit: number;
    cost_efficiency: number;
    transit_speed: number;
    safety_risk: number;
  };
}

export interface RecommendationPreferencesResponse {
  engine: string;
  methodology: string;
  available_preferences: PreferenceProfile[];
}

export interface ScorePillarDetail {
  score: number;
  weight_pct: number;
  metric: string;
}

export interface RecommendationScoreBreakdown {
  capacity_fit: ScorePillarDetail;
  cost_efficiency: ScorePillarDetail;
  transit_speed: ScorePillarDetail;
  safety_risk: ScorePillarDetail;
}

export interface RecommendedVessel {
  vessel_id: number;
  name: string;
  vessel_type: string;
  capacity_tons: number;
  draft_m: number;
  speed_knots: number;
  flag: string;
  utilization_pct: number;
  recommendation_score: number;
  score_tier: RecommendationScoreTier;
  rank: number;
}

export interface RecommendedRoute {
  route_id: string;
  distance_nm: number;
  distance_km: number;
  route_type: string;
  origin_port: string;
  destination_port: string;
  waypoints_count: number;
  restrictions: string[];
}

export interface AlternativeCandidate {
  rank: number;
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  capacity_tons: number;
  draft_m: number;
  utilization_pct: number;
  recommendation_score: number;
  score_tier: RecommendationScoreTier;
  distance_nm?: number;
  sailing_days?: number;
  cost_usd?: number;
  cost_per_ton_usd?: number;
  risk_score?: number;
  risk_level?: string;
  score_breakdown: RecommendationScoreBreakdown;
}

export interface RejectedCandidate {
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  capacity_tons: number;
  draft_m: number;
  rejection_reasons: string[];
}

export interface RecommendationExplanation {
  primary_rationale: string;
  trade_offs: string[];
  decision_rule: string;
}

export interface RecommendationShipmentDetails {
  cargo_id?: number | null;
  cargo_description: string;
  cargo_type: string;
  weight_tons: number;
  origin_port: {
    id?: number;
    name: string;
    country: string;
    unlocode?: string;
  };
  destination_port: {
    id?: number;
    name: string;
    country: string;
    unlocode?: string;
  };
  ready_date: string;
}

export interface RecommendationResponse {
  status: 'success' | 'no_eligible_vessels';
  recommendation_id: string;
  engine: {
    name: string;
    type: string;
    version: string;
    optimization_preference: OptimizationPreference;
  };
  shipment_details: RecommendationShipmentDetails;
  has_eligible_vessels: boolean;
  total_candidates_screened: number;
  eligible_candidates_count: number;
  rejected_candidates_count: number;
  recommended_vessel: RecommendedVessel | null;
  recommended_route: RecommendedRoute | null;
  estimates: {
    eta: any;
    cost: any;
    risk: any;
    eta_source: string;
    cost_source: string;
    risk_source: string;
  };
  score_breakdown: RecommendationScoreBreakdown | null;
  explanation: RecommendationExplanation;
  alternative_options: AlternativeCandidate[];
  rejected_candidates: RejectedCandidate[];
  disclosures: string[];
  generated_at: string;
  execution_ms: number;
}

export interface RecommendationRequest {
  cargo_id?: number;
  cargo_type?: string;
  weight_tons?: number;
  cargo_description?: string;
  origin_port_id?: number;
  destination_port_id?: number;
  departure_time?: string;
  preference?: OptimizationPreference;
  bunker_price_usd_per_mt?: number;
  daily_hire_usd?: number;
}
