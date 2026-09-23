"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 15: Dataset Schema & Historical Data Audit Engine

Audits historical voyage datasets created in Module 14, validates required fields,
checks for temporal consistency, calculates empirical target labels, and verifies
zero data leakage.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np


class HistoricalVoyageSchema:
    # Essential columns required for real historical voyage training
    REQUIRED_ID_FIELDS = [
        "vessel_id",
        "origin_port_id",
        "destination_port_id",
    ]

    REQUIRED_TEMPORAL_FIELDS = [
        "departure_timestamp",
        "arrival_timestamp",
    ]

    REQUIRED_NAVIGATION_FIELDS = [
        "distance_nm",
        "vessel_speed_knots",
    ]

    TARGET_FIELD = "actual_voyage_duration_hours"

    OPTIONAL_VESSEL_FIELDS = [
        "vessel_type",
        "capacity_tons",
        "draft_m",
    ]

    OPTIONAL_CARGO_FIELDS = [
        "cargo_type",
        "weight_tons",
    ]

    OPTIONAL_CONDITION_FIELDS = [
        "avg_wave_height_m",
        "avg_wind_speed_knots",
        "port_waiting_hours",
    ]

    # Fields that represent post-voyage knowledge and MUST NOT be used as features (Data Leakage Prevention)
    FORBIDDEN_LEAKAGE_FIELDS = [
        "actual_arrival_timestamp",
        "actual_voyage_duration_hours",
        "actual_voyage_duration",
        "final_fuel_consumed_mt",
        "actual_berthing_time",
        "eta_prediction",
        "predicted_eta",
    ]


def audit_historical_dataset(df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """
    Performs a thorough audit of the Module 14 historical dataset according to
    Step 1, Step 2, and Step 28 rules.

    Returns:
    Structured diagnostic report dictionary.
    """
    report = {
        "status": "unverified",
        "row_count": 0,
        "is_sufficient": False,
        "missing_required_fields": [],
        "target_available": False,
        "temporal_validity": False,
        "leakage_detected": False,
        "leakage_fields": [],
        "date_range": {"start": None, "end": None},
        "reason": "",
        "audited_at": datetime.now(timezone.utc).isoformat(),
    }

    if df is None or df.empty:
        report["status"] = "empty"
        report["row_count"] = 0
        report["is_sufficient"] = False
        report["reason"] = (
            "Historical dataset is empty (0 rows). In accordance with non-negotiable "
            "Rule 28, model training is halted to prevent synthetic data generation."
        )
        return report

    report["row_count"] = len(df)

    # 1. Check required fields
    all_required = (
        HistoricalVoyageSchema.REQUIRED_ID_FIELDS
        + HistoricalVoyageSchema.REQUIRED_TEMPORAL_FIELDS
        + HistoricalVoyageSchema.REQUIRED_NAVIGATION_FIELDS
    )
    missing = [col for col in all_required if col not in df.columns]
    report["missing_required_fields"] = missing

    # 2. Check target availability
    has_explicit_target = HistoricalVoyageSchema.TARGET_FIELD in df.columns
    has_timestamps = (
        "departure_timestamp" in df.columns and "arrival_timestamp" in df.columns
    )

    if has_explicit_target:
        report["target_available"] = True
    elif has_timestamps:
        # Check if duration can be reliably computed
        try:
            dep = pd.to_datetime(df["departure_timestamp"], errors="coerce", utc=True)
            arr = pd.to_datetime(df["arrival_timestamp"], errors="coerce", utc=True)
            valid_times = (arr > dep).all()
            if valid_times:
                report["target_available"] = True
                report["temporal_validity"] = True
                report["date_range"] = {
                    "start": dep.min().isoformat() if not dep.empty else None,
                    "end": arr.max().isoformat() if not arr.empty else None,
                }
        except Exception:
            report["temporal_validity"] = False

    # 3. Check for Data Leakage (Step 3)
    feature_cols = [c for c in df.columns if c != HistoricalVoyageSchema.TARGET_FIELD]
    leaked = [
        c
        for c in feature_cols
        if c.lower() in HistoricalVoyageSchema.FORBIDDEN_LEAKAGE_FIELDS
    ]
    if leaked:
        report["leakage_detected"] = True
        report["leakage_fields"] = leaked

    # 4. Minimum sample size evaluation
    MIN_TRAINING_ROWS = 50
    if len(df) < MIN_TRAINING_ROWS:
        report["status"] = "insufficient_samples"
        report["is_sufficient"] = False
        report["reason"] = (
            f"Dataset contains {len(df)} rows, which is below the minimum required "
            f"threshold of {MIN_TRAINING_ROWS} observations for reliable time-based validation."
        )
    elif missing:
        report["status"] = "missing_columns"
        report["is_sufficient"] = False
        report["reason"] = f"Missing required fields: {', '.join(missing)}"
    elif not report["target_available"]:
        report["status"] = "missing_target"
        report["is_sufficient"] = False
        report["reason"] = "Cannot determine empirical target (actual_voyage_duration_hours)."
    elif report["leakage_detected"]:
        report["status"] = "leakage_error"
        report["is_sufficient"] = False
        report["reason"] = f"Data leakage detected in features: {leaked}"
    else:
        report["status"] = "valid"
        report["is_sufficient"] = True
        report["reason"] = "Dataset satisfies all schema and validation criteria for XGBoost training."

    return report
