/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 15: XGBoost ETA Machine Learning Prediction Types
 */

export type MLPredictionStatus = 'available' | 'unavailable' | 'error' | 'pending';

export interface MLEtaPredictionRequest {
  cargo_id?: number;
  vessel_id: number;
  route_id?: string | number;
  origin_port_id?: number;
  destination_port_id?: number;
  departure_time?: string; // ISO 8601 string
}

export interface MLEtaModelMetrics {
  xgboost_mae_hours: number;
  xgboost_rmse_hours: number;
  xgboost_r2: number;
  baseline_mae_hours: number;
  baseline_rmse_hours: number;
  test_sample_count: number;
  train_sample_count: number;
  val_sample_count: number;
}

export interface MLEtaPredictionResponse {
  prediction_id: string;
  cargo_id: number | null;
  vessel_id: number;
  vessel_name?: string;
  route_id: string | null;
  departure_time: string; // ISO 8601
  predicted_duration_hours: number | null;
  predicted_duration_days: number | null;
  predicted_arrival: string | null; // ISO 8601
  baseline_duration_hours: number;
  baseline_arrival: string; // ISO 8601
  baseline_eta_id?: string;
  duration_delta_hours: number | null; // Predicted - Baseline
  model_name: string;
  model_version: string;
  prediction_status: MLPredictionStatus;
  status_reason: string;
  features_used: Record<string, number | string>;
  model_metrics: MLEtaModelMetrics | null;
  created_at: string;
}
