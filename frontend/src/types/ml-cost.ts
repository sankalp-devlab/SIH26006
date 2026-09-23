/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: XGBoost Cost Machine Learning Prediction Types
 */

export type MLPredictionStatus = 'available' | 'unavailable' | 'error' | 'pending';

export interface MLCostPredictionRequest {
  cargo_id?: number;
  vessel_id: number;
  route_id?: string | number;
  origin_port_id?: number;
  destination_port_id?: number;
  departure_time?: string; // ISO 8601 string
  bunker_price_usd_per_mt?: number;
  daily_hire_usd?: number;
}

export interface MLCostModelMetrics {
  mae_usd: number | null;
  rmse_usd: number | null;
  r2_score: number | null;
}

export interface MLCostModelMetadata {
  model_name: string;
  model_version?: string;
  model_type?: string;
  training_records?: number;
  metrics?: MLCostModelMetrics;
  features?: string[];
  feature_importances?: Record<string, number>;
}

export interface MLCostPredictionResponse {
  prediction_status: MLPredictionStatus;
  ml_predicted_cost: number | null;
  currency: string;
  baseline_cost: number | null;
  baseline_fuel_cost: number | null;
  baseline_operating_cost: number | null;
  cost_difference_usd: number | null;
  cost_difference_pct: number | null;
  features_used: Record<string, number>;
  model_metadata: MLCostModelMetadata;
  reason: string | null;
  predicted_at: string;
}
