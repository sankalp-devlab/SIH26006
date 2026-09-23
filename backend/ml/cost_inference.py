"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 16: XGBoost Cost Prediction Inference Engine

Loads trained XGBoost model and delivers low-latency predictions.
Integrates with Module 12 Deterministic Baseline Cost Engine for transparent comparison.
Adheres strictly to Rule 33: Transparently reports 'unavailable' if no legitimate
empirical model artifact is present on disk.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np

from cost_engine import CostEngine
from ml.cost_feature_pipeline import CostFeaturePipeline


MODEL_DIR = Path(__file__).resolve().parent / "model"
MODEL_PATH = MODEL_DIR / "xgboost_cost_model.joblib"
METADATA_PATH = MODEL_DIR / "cost_metadata.json"


class XGBoostCostPredictor:
    _instance: Optional["XGBoostCostPredictor"] = None

    def __init__(self):
        self.model = None
        self.metadata = None
        self._load_model()

    @classmethod
    def get_instance(cls) -> "XGBoostCostPredictor":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        """Loads trained XGBoost model and metadata if present on disk."""
        if MODEL_PATH.exists() and METADATA_PATH.exists():
            try:
                self.model = joblib.load(MODEL_PATH)
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[XGBoostCostPredictor] Warning: Error loading model artifact: {e}")
                self.model = None
                self.metadata = None
        else:
            self.model = None
            self.metadata = None

    def predict_cost(
        self,
        vessel: Dict[str, Any],
        route_data: Dict[str, Any],
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
        departure_time: Optional[Union[str, datetime]] = None,
        bunker_price_usd_per_mt: Optional[float] = None,
        daily_hire_usd: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes pre-voyage feature extraction, Module 12 baseline cost calculation,
        and ML cost prediction (or diagnostic unavailable response).

        Returns:
        Structured comparative response dictionary.
        """
        # 1. Extract 12 pre-voyage features
        features = CostFeaturePipeline.extract_features(
            vessel=vessel,
            route_data=route_data,
            cargo=cargo,
            departure_time=departure_time,
        )

        # 2. Calculate Module 12 Baseline Cost
        baseline_calc = CostEngine.calculate_voyage_cost(
            vessel=vessel,
            route_data=route_data,
            origin_port=origin_port,
            dest_port=dest_port,
            cargo=cargo,
            bunker_price_usd_per_mt=bunker_price_usd_per_mt,
            daily_hire_usd=daily_hire_usd,
        )

        baseline_total_cost = baseline_calc.get("total_cost")
        baseline_fuel_cost = baseline_calc.get("fuel_cost")
        baseline_operating_cost = baseline_calc.get("operating_cost")
        currency = baseline_calc.get("currency", "USD")

        # 3. Model Inference or Graceful 'Unavailable' Fallback
        if self.model is not None:
            try:
                X = CostFeaturePipeline.transform_to_vector(features)
                pred_val = float(self.model.predict(X)[0])
                pred_cost = round(max(0.0, pred_val), 2)

                cost_diff_usd = None
                cost_diff_pct = None
                if baseline_total_cost is not None and baseline_total_cost > 0:
                    cost_diff_usd = round(pred_cost - baseline_total_cost, 2)
                    cost_diff_pct = round((cost_diff_usd / baseline_total_cost) * 100.0, 2)

                return {
                    "prediction_status": "available",
                    "ml_predicted_cost": pred_cost,
                    "currency": currency,
                    "baseline_cost": baseline_total_cost,
                    "baseline_fuel_cost": baseline_fuel_cost,
                    "baseline_operating_cost": baseline_operating_cost,
                    "cost_difference_usd": cost_diff_usd,
                    "cost_difference_pct": cost_diff_pct,
                    "features_used": features,
                    "model_metadata": self.metadata or {
                        "model_name": "XGBoost Maritime Voyage Cost Predictor",
                        "model_version": "1.0.0",
                    },
                    "reason": None,
                    "predicted_at": datetime.now(timezone.utc).isoformat(),
                }
            except Exception as e:
                print(f"[XGBoostCostPredictor] Inference exception: {e}")

        # Model is unavailable on disk (Rule 33 zero fake data compliance)
        return {
            "prediction_status": "unavailable",
            "ml_predicted_cost": None,
            "currency": currency,
            "baseline_cost": baseline_total_cost,
            "baseline_fuel_cost": baseline_fuel_cost,
            "baseline_operating_cost": baseline_operating_cost,
            "cost_difference_usd": None,
            "cost_difference_pct": None,
            "features_used": features,
            "model_metadata": {
                "model_name": "XGBoost Maritime Voyage Cost Predictor",
                "model_type": "XGBoost Regressor (Scikit-Learn API)",
                "training_records": 0,
                "metrics": {
                    "mae_usd": None,
                    "rmse_usd": None,
                    "r2_score": None,
                },
            },
            "reason": (
                "Model training is currently pending: Module 14 historical voyage dataset "
                "contains 0 completed records with actual settlement costs. Non-negotiable "
                "Rule 33 strictly forbids training on fabricated or synthetic cost data."
            ),
            "predicted_at": datetime.now(timezone.utc).isoformat(),
        }
