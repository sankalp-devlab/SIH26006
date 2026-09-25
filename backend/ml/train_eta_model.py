"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 15: XGBoost ETA Model Training & Evaluation Engine

Trains, validates, and evaluates an XGBoost regression model on empirical historical
voyage datasets. Strictly complies with zero-synthetic-data rules: if training data
is missing or insufficient (<50 rows), training is halted with a clear diagnostic
report rather than generating fake or fabricated observations.
"""

import json
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from dataset_schema import audit_historical_dataset
from feature_pipeline import EtaFeaturePipeline

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_eta_model(
    historical_df: Optional[pd.DataFrame] = None,
    csv_path: Optional[str] = None,
    save_artifacts: bool = True
) -> Dict[str, Any]:
    """
    Executes reproducible XGBoost training pipeline.

    Returns:
    Diagnostic training report dictionary.
    """
    report = {
        "status": "halted",
        "reason": "",
        "data_audit": {},
        "metrics": {},
        "feature_importances": {},
        "model_artifact_path": None,
        "metadata_artifact_path": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # 1. Load data if path provided or discover default
    if historical_df is None:
        if csv_path is None:
            default_csv = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Data", "historical_voyages.csv"))
            if os.path.exists(default_csv):
                csv_path = default_csv
        if csv_path and os.path.exists(csv_path):
            try:
                historical_df = pd.read_csv(csv_path)
            except Exception as e:
                report["reason"] = f"Failed to read CSV at {csv_path}: {e}"
                return report

    # 2. Audit historical dataset
    audit = audit_historical_dataset(historical_df)
    report["data_audit"] = audit

    if not audit["is_sufficient"]:
        report["status"] = "halted_insufficient_data"
        report["reason"] = (
            f"Model training halted per Rule 28 (NO FAKE ML). "
            f"Audit reason: {audit['reason']}"
        )
        print(f"[XGBoost ETA Training] {report['reason']}")
        return report

    assert historical_df is not None

    # 3. Sort chronologically for time-based train/val/test split (Step 8)
    if "departure_timestamp" in historical_df.columns:
        historical_df = historical_df.sort_values(by="departure_timestamp").reset_index(drop=True)

    # 4. Feature Extraction
    X, y = EtaFeaturePipeline.extract_features_from_dataframe(historical_df)

    # Remove any NaN targets
    X = X.reset_index(drop=True)
    y = y.reset_index(drop=True)
    valid_idx = y.dropna().index
    X = X.iloc[valid_idx].reset_index(drop=True)
    y = y.iloc[valid_idx].reset_index(drop=True)

    n_samples = len(X)
    train_end = int(n_samples * 0.70)
    val_end = int(n_samples * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    # 5. XGBoost Regression Model Setup (Step 9)
    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        early_stopping_rounds=25,
    )

    model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )

    # 6. Evaluation on held-out test set (Step 10 & 11)
    y_pred_test = model.predict(X_test)
    y_baseline_test = X_test["theoretical_voyage_hours"].values

    mae = float(mean_absolute_error(y_test, y_pred_test))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
    r2 = float(r2_score(y_test, y_pred_test))

    baseline_mae = float(mean_absolute_error(y_test, y_baseline_test))
    baseline_rmse = float(np.sqrt(mean_squared_error(y_test, y_baseline_test)))

    metrics = {
        "xgboost_mae_hours": round(mae, 2),
        "xgboost_rmse_hours": round(rmse, 2),
        "xgboost_r2": round(r2, 4),
        "baseline_mae_hours": round(baseline_mae, 2),
        "baseline_rmse_hours": round(baseline_rmse, 2),
        "test_sample_count": len(X_test),
        "train_sample_count": len(X_train),
        "val_sample_count": len(X_val),
    }
    report["metrics"] = metrics

    # 7. Feature Importance (Step 13)
    feature_importances = {}
    for feat, imp in zip(EtaFeaturePipeline.FEATURE_COLUMNS, model.feature_importances_):
        feature_importances[feat] = round(float(imp), 4)
    report["feature_importances"] = dict(
        sorted(feature_importances.items(), key=lambda item: item[1], reverse=True)
    )

    # 8. Save Model Artifact & Metadata (Step 14 & 15)
    if save_artifacts:
        model_path = os.path.join(MODELS_DIR, "eta_xgboost_v1.json")
        meta_path = os.path.join(MODELS_DIR, "eta_xgboost_v1_meta.json")

        model.save_model(model_path)

        meta = {
            "model_name": "xgboost_eta",
            "model_version": "1.0",
            "target": "actual_voyage_duration_hours",
            "features": EtaFeaturePipeline.FEATURE_COLUMNS,
            "metrics": metrics,
            "feature_importances": report["feature_importances"],
            "trained_at": datetime.now(timezone.utc).isoformat(),
        }

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        report["model_artifact_path"] = model_path
        report["metadata_artifact_path"] = meta_path
        report["status"] = "completed"

    return report


if __name__ == "__main__":
    print("Executing Module 15 XGBoost ETA Training Diagnostic Check...")
    res = train_eta_model()
    print(json.dumps(res, indent=2))
