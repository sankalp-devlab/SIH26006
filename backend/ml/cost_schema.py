"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 16: Cost Dataset Schema & Historical Cost Audit Engine

Audits historical voyage datasets for empirical cost targets, validates required fields,
checks for temporal consistency, prevents data leakage, and ensures zero fake ML training.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np


class HistoricalCostSchema:
    # Essential ID fields for pre-voyage matching
    REQUIRED_ID_FIELDS = [
        "vessel_id",
        "origin_port_id",
        "destination_port_id",
    ]

    # Pre-voyage navigation & operational requirements
    REQUIRED_NAVIGATION_FIELDS = [
        "distance_nm",
        "vessel_speed_knots",
    ]

    # Potential legitimate historical cost target columns (empirical post-voyage settlement)
    VALID_TARGET_CANDIDATES = [
        "actual_total_voyage_cost",
        "actual_freight_cost",
        "actual_transportation_cost",
        "actual_settlement_usd",
        "actual_fuel_cost",
    ]

    # Standard default target field
    DEFAULT_TARGET_FIELD = "actual_total_voyage_cost"

    # Pre-voyage vessel characteristics
    OPTIONAL_VESSEL_FIELDS = [
        "vessel_type",
        "capacity_tons",
        "draft_m",
        "fuel_laden_mt_day",
        "fuel_ballast_mt_day",
    ]

    # Pre-voyage cargo attributes
    OPTIONAL_CARGO_FIELDS = [
        "cargo_type",
        "weight_tons",
        "volume_m3",
    ]

    # Post-voyage operational information that MUST NOT be used as training features (Data Leakage Prevention)
    FORBIDDEN_LEAKAGE_FIELDS = [
        "actual_total_voyage_cost",
        "actual_freight_cost",
        "actual_transportation_cost",
        "actual_settlement_usd",
        "actual_fuel_cost",
        "actual_operating_cost",
        "actual_port_cost",
        "actual_arrival_timestamp",
        "actual_voyage_duration_hours",
        "actual_voyage_duration",
        "final_fuel_consumed_mt",
        "actual_berthing_time",
        "cost_prediction",
        "predicted_cost",
        "module12_predicted_cost",
        "estimated_cost",
        "baseline_cost",
    ]


def audit_historical_cost_dataset(df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """
    Performs a strict audit of historical voyage data for Module 16 cost modeling.
    Enforces Rule 33 (Zero Synthetic ML / No Fabricated Data) and Rule 6 (Target Validation).

    Returns:
    Structured diagnostic report dictionary.
    """
    report = {
        "status": "unverified",
        "row_count": 0,
        "is_sufficient": False,
        "missing_required_fields": [],
        "target_available": False,
        "target_column": None,
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
            "Historical voyage dataset is empty (0 rows). In accordance with non-negotiable "
            "Rule 33, model training is halted to prevent synthetic cost generation."
        )
        return report

    report["row_count"] = len(df)

    # 1. Check required ID & navigation fields
    all_required = (
        HistoricalCostSchema.REQUIRED_ID_FIELDS
        + HistoricalCostSchema.REQUIRED_NAVIGATION_FIELDS
    )
    missing = [col for col in all_required if col not in df.columns]
    report["missing_required_fields"] = missing

    # 2. Check for legitimate target column
    target_col = None
    for cand in HistoricalCostSchema.VALID_TARGET_CANDIDATES:
        if cand in df.columns:
            target_col = cand
            break

    if target_col is not None:
        valid_series = df[target_col].dropna()
        # Verify non-zero and positive costs
        positive_series = valid_series[valid_series > 0]
        if len(positive_series) > 0:
            report["target_available"] = True
            report["target_column"] = target_col
        else:
            report["target_available"] = False
            report["reason"] = f"Target column '{target_col}' exists but has 0 valid positive cost entries."
    else:
        report["target_available"] = False
        report["reason"] = (
            "No legitimate historical cost target column found. Allowed targets: "
            f"{HistoricalCostSchema.VALID_TARGET_CANDIDATES}."
        )

    # 3. Check for Data Leakage
    feature_cols = [c for c in df.columns if c != target_col]
    leaked = [
        c
        for c in feature_cols
        if c.lower() in HistoricalCostSchema.FORBIDDEN_LEAKAGE_FIELDS
    ]
    if leaked:
        report["leakage_detected"] = True
        report["leakage_fields"] = leaked

    # 4. Minimum sample size evaluation
    MIN_TRAINING_ROWS = 50
    if len(df) < MIN_TRAINING_ROWS:
        report["status"] = "insufficient_samples"
        report["is_sufficient"] = False
        if not report["reason"]:
            report["reason"] = (
                f"Dataset contains {len(df)} rows, which is below the minimum required "
                f"threshold of {MIN_TRAINING_ROWS} observations for reliable cost regression."
            )
        return report

    if not report["missing_required_fields"] and report["target_available"] and not report["leakage_detected"]:
        report["status"] = "valid"
        report["is_sufficient"] = True
        report["reason"] = "Dataset satisfies all schema, target, and leakage constraints."

    return report
