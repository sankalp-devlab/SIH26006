/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 17: Maritime Risk Assessment Engine Types
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'DATA_INSUFFICIENT';

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskEngineInfo {
  type: string;
  version: string;
  methodology: string;
  rules_source: string;
}

export interface OverallRisk {
  level: RiskLevel;
  score: number;
  scale: string;
}

export interface RiskFactorDetail {
  level?: RiskLevel;
  score: number | null;
  weight_pct?: number;
  status: 'available' | 'DATA_UNAVAILABLE';
  reason?: string;
}

export interface RiskFactors {
  route_risk: RiskFactorDetail;
  vessel_risk: RiskFactorDetail;
  cargo_risk: RiskFactorDetail;
  port_risk: RiskFactorDetail;
  weather_risk: RiskFactorDetail;
  ocean_risk: RiskFactorDetail;
  congestion_risk: RiskFactorDetail;
  historical_risk: RiskFactorDetail;
}

export interface ExplainabilityFinding {
  type: string;
  severity: FindingSeverity;
  score_impact: number;
  message: string;
}

export interface RecommendationHook {
  risk_tier: RiskLevel;
  risk_score: number;
  can_proceed: boolean;
  primary_concern: string | null;
}

export interface RiskAssessmentResponse {
  status: string;
  risk_assessment_id: string;
  risk_engine: RiskEngineInfo;
  overall_risk: OverallRisk;
  factors: RiskFactors;
  missing_data: string[];
  explanations: ExplainabilityFinding[];
  recommendation_hook: RecommendationHook;
  assessed_at: string;
  persisted_assessment_id?: number;
  overall_risk_score?: number;
  risk_level?: RiskLevel;
}

export interface RiskAssessmentRequest {
  vessel_id: number;
  cargo_id?: number;
  route_id?: number | string;
  origin_port_id?: number;
  destination_port_id?: number;
  departure_time?: string;
}
