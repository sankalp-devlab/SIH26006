"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 15: XGBoost ETA Inference Engine

Loads trained XGBoost model artifacts and executes authoritative prediction.
If no model artifact has been trained due to lack of historical data, it returns
a transparent 'unavailable' status with detailed explanation, avoiding synthetic predictions.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

import pandas as pd
import xgboost as xgb

from .feature_pipeline import EtaFeaturePipeline

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "eta_xgboost_v1.json")
META_PATH = os.path.join(MODELS_DIR, "eta_xgboost_v1_meta.json")


class XGBoostEtaPredictor:
    _model: Optional[xgb.XGBRegressor] = None
    _metadata: Optional[Dict[str, Any]] = None
    _loaded: bool = False

    @classmethod
    def load_model(cls) -> Tuple[Optional[xgb.XGBRegressor], Optional[Dict[str, Any]]]:
        if cls._loaded and cls._model is not None:
            return cls._model, cls._metadata

        cls._loaded = True
        if os.path.exists(MODEL_PATH) and os.path.exists(META_PATH):
            try:
                model = xgb.XGBRegressor()
                model.load_model(MODEL_PATH)
                with open(META_PATH, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                cls._model = model
                cls._metadata = meta
                print("[XGBoostEtaPredictor] Loaded trained XGBoost model v1.0 successfully.")
            except Exception as e:
                print(f"[XGBoostEtaPredictor] Failed to load model artifact: {e}")
                cls._model = None
                cls._metadata = None
        else:
            cls._model = None
            cls._metadata = None

        return cls._model, cls._metadata

    @classmethod
    def predict(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes inference using the trained XGBoost model.
        If model artifact does not exist (due to lack of historical data),
        it outputs prediction_status = 'unavailable' with full transparency.
        """
        model, metadata = cls.load_model()

        # 1. Feature Extraction via unified pipeline
        X = EtaFeaturePipeline.extract_features_from_dict(payload)
        features_dict = X.iloc[0].to_dict()

        distance_nm = float(payload.get("distance_nm") or 0.0)
        speed_knots = float(payload.get("effective_speed_knots") or payload.get("speed_laden_knots") or 14.0)
        baseline_duration_hours = round(distance_nm / speed_knots, 2) if speed_knots > 0 else 0.0

        # Departure timestamp resolution
        dep_val = payload.get("departure_time") or payload.get("departure_timestamp")
        if dep_val:
            try:
                if isinstance(dep_val, str):
                    dep_dt = datetime.fromisoformat(dep_val.replace("Z", "+00:00"))
                else:
                    dep_dt = dep_val
            except Exception:
                dep_dt = datetime.now(timezone.utc)
        else:
            dep_dt = datetime.now(timezone.utc)

        departure_time_iso = dep_dt.isoformat()
        baseline_arrival_iso = (dep_dt + timedelta(hours=baseline_duration_hours)).isoformat()

        prediction_id = f"pred-eta-{payload.get('cargo_id') or 'adhoc'}-{payload.get('vessel_id')}-{payload.get('route_id') or 'direct'}"

        # 2. Check model availability
        if model is None:
            return {
                "prediction_id": prediction_id,
                "cargo_id": payload.get("cargo_id"),
                "vessel_id": payload.get("vessel_id"),
                "vessel_name": payload.get("vessel_name"),
                "route_id": str(payload.get("route_id")) if payload.get("route_id") else None,
                "departure_time": departure_time_iso,
                "predicted_duration_hours": None,
                "predicted_duration_days": None,
                "predicted_arrival": None,
                "baseline_duration_hours": baseline_duration_hours,
                "baseline_arrival": baseline_arrival_iso,
                "duration_delta_hours": None,
                "model_name": "xgboost_eta",
                "model_version": "1.0",
                "prediction_status": "unavailable",
                "status_reason": (
                    "Model training is currently pending: Module 14 historical voyage dataset "
                    "contains 0 completed records. Non-negotiable Rule 28 strictly forbids training "
                    "on fabricated or synthetic data. The ML pipeline structure is deployed and will "
                    "automatically train and infer once empirical historical voyage data is uploaded."
                ),
                "features_used": features_dict,
                "model_metrics": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

        # 3. Predict duration using real trained model
        try:
            pred_hours_raw = float(model.predict(X)[0])
            pred_hours = max(round(pred_hours_raw, 2), 1.0)
            pred_days = round(pred_hours / 24.0, 2)
            predicted_arrival_iso = (dep_dt + timedelta(hours=pred_hours)).isoformat()
            duration_delta_hours = round(pred_hours - baseline_duration_hours, 2)

            return {
                "prediction_id": prediction_id,
                "cargo_id": payload.get("cargo_id"),
                "vessel_id": payload.get("vessel_id"),
                "vessel_name": payload.get("vessel_name"),
                "route_id": str(payload.get("route_id")) if payload.get("route_id") else None,
                "departure_time": departure_time_iso,
                "predicted_duration_hours": pred_hours,
                "predicted_duration_days": pred_days,
                "predicted_arrival": predicted_arrival_iso,
                "baseline_duration_hours": baseline_duration_hours,
                "baseline_arrival": baseline_arrival_iso,
                "duration_delta_hours": duration_delta_hours,
                "model_name": "xgboost_eta",
                "model_version": metadata.get("model_version", "1.0") if metadata else "1.0",
                "prediction_status": "available",
                "status_reason": "Authoritative XGBoost ETA regression prediction successfully computed.",
                "features_used": features_dict,
                "model_metrics": metadata.get("metrics") if metadata else None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as pred_err:
            return {
                "prediction_id": prediction_id,
                "cargo_id": payload.get("cargo_id"),
                "vessel_id": payload.get("vessel_id"),
                "vessel_name": payload.get("vessel_name"),
                "route_id": str(payload.get("route_id")) if payload.get("route_id") else None,
                "departure_time": departure_time_iso,
                "predicted_duration_hours": None,
                "predicted_duration_days": None,
                "predicted_arrival": None,
                "baseline_duration_hours": baseline_duration_hours,
                "baseline_arrival": baseline_arrival_iso,
                "duration_delta_hours": None,
                "model_name": "xgboost_eta",
                "model_version": "1.0",
                "prediction_status": "error",
                "status_reason": f"Prediction computation failed: {pred_err}",
                "features_used": features_dict,
                "model_metrics": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
