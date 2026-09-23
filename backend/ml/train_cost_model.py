"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 16: XGBoost Cost Regression Training Pipeline

Reproducible training script with chronological train/validation/test split,
hyperparameter configuration, MAE/RMSE/R² metrics, and artifact saving.
Adheres strictly to Rule 33: Halts without generating fake data if empirical
historical records are missing.
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

from cost_schema import HistoricalCostSchema, audit_historical_cost_dataset
from cost_feature_pipeline import CostFeaturePipeline


MODEL_DIR = Path(__file__).resolve().parent / "model"
MODEL_PATH = MODEL_DIR / "xgboost_cost_model.joblib"
METADATA_PATH = MODEL_DIR / "cost_metadata.json"


def train_cost_model(df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """
    Trains an XGBoost regression model to predict maritime voyage cost.
    If historical dataset is missing or insufficient, halts execution cleanly
    and produces an auditable diagnostic report.
    """
    print("=" * 60)
    print("MODULE 16: STARTING XGBOOST COST MODEL TRAINING PIPELINE")
    print("=" * 60)

    # 1. Audit historical dataset
    audit = audit_historical_cost_dataset(df)
    print(f"Historical Data Audit Status: {audit['status']}")
    print(f"Observations Available: {audit['row_count']}")

    if not audit["is_sufficient"]:
        print(f"TRAINING HALTED: {audit['reason']}")
        return {
            "status": "halted",
            "reason": audit["reason"],
            "audit_report": audit,
        }

    target_col = audit["target_column"] or HistoricalCostSchema.DEFAULT_TARGET_FIELD
    print(f"Empirical Target Column: {target_col}")

    # 2. Extract feature matrix X and target y
    feature_cols = CostFeaturePipeline.FEATURE_NAMES
    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # 3. Chronological Train / Validation / Test Split (70% / 15% / 15%)
    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    print(f"Chronological Split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # 4. Initialize & Train XGBoost Regressor
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        objective="reg:squarederror",
    )

    model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    # 5. Evaluate on Held-Out Test Set
    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    print(f"Test Set Evaluation: MAE=${mae:,.2f}, RMSE=${rmse:,.2f}, R²={r2:.4f}")

    # 6. Save Model Artifact & Versioned Metadata
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    feature_importances = {
        name: float(imp)
        for name, imp in zip(feature_cols, model.feature_importances_)
    }

    metadata = {
        "model_name": "XGBoost Maritime Voyage Cost Predictor",
        "model_version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "algorithm": "XGBoost Regressor (Scikit-Learn API)",
        "target_field": target_col,
        "target_unit": "USD",
        "features": feature_cols,
        "train_rows": len(X_train),
        "val_rows": len(X_val),
        "test_rows": len(X_test),
        "metrics": {
            "mae_usd": mae,
            "rmse_usd": rmse,
            "r2_score": r2,
        },
        "feature_importances": feature_importances,
        "xgboost_version": xgb.__version__,
    }

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model and metadata successfully saved to {MODEL_DIR}")
    return {
        "status": "success",
        "metrics": metadata["metrics"],
        "metadata": metadata,
    }


if __name__ == "__main__":
    result = train_cost_model()
    print("Training result:", result["status"], "-", result.get("reason", "Trained successfully"))
