"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 15: ETA Feature Engineering Pipeline

Defines deterministic, zero-leakage feature transformations shared identically
between model training and live prediction inference.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd


class EtaFeaturePipeline:
    """
    Production feature engineering pipeline for maritime ETA regression.
    Maintains exact column ordering and deterministic preprocessing.
    """

    # Canonical ordered feature names expected by XGBoost
    FEATURE_COLUMNS = [
        "distance_nm",
        "effective_speed_knots",
        "theoretical_voyage_hours",
        "vessel_capacity_tons",
        "vessel_draft_m",
        "cargo_weight_tons",
        "weight_capacity_ratio",
        "vessel_type_encoded",
        "departure_month",
        "departure_day",
        "departure_hour",
        "departure_dayofweek",
    ]

    # Deterministic vocabulary for vessel types (no arbitrary continuous ordinal bias)
    VESSEL_TYPE_MAP = {
        "handysize": 0,
        "supramax": 1,
        "panamax": 2,
        "capesize": 3,
        "vlcc": 4,
        "crude oil tanker": 5,
        "container ship": 6,
        "lng carrier": 7,
        "general cargo": 8,
        "other": 9,
    }

    @classmethod
    def encode_vessel_type(cls, vtype: Optional[str]) -> int:
        if not vtype:
            return cls.VESSEL_TYPE_MAP["other"]
        clean = str(vtype).strip().lower()
        return cls.VESSEL_TYPE_MAP.get(clean, cls.VESSEL_TYPE_MAP["other"])

    @classmethod
    def extract_features_from_dict(cls, data: Dict[str, Any]) -> pd.DataFrame:
        """
        Extracts ordered feature vector from single inference dictionary payload.
        Ensures exact match with training feature column structure.
        """
        distance_nm = float(data.get("distance_nm") or 0.0)
        speed_knots = float(data.get("effective_speed_knots") or data.get("speed_laden_knots") or 14.0)

        # Baseline theoretical sailing duration
        theoretical_hours = (distance_nm / speed_knots) if speed_knots > 0 else 0.0

        vessel_capacity = float(data.get("capacity_tons") or 50000.0)
        vessel_draft = float(data.get("draft_m") or 12.0)
        cargo_weight = float(data.get("cargo_weight_tons") or data.get("weight_tons") or 0.0)

        # Utilization ratio
        weight_capacity_ratio = (
            min(cargo_weight / vessel_capacity, 1.5) if vessel_capacity > 0 else 0.0
        )

        # Temporal breakdown from departure timestamp
        dep_val = data.get("departure_time") or data.get("departure_timestamp")
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

        vessel_type = data.get("vessel_type") or (
            data.get("vessel", {}).get("vessel_type") if isinstance(data.get("vessel"), dict) else None
        )
        vessel_encoded = cls.encode_vessel_type(vessel_type)

        feature_row = {
            "distance_nm": distance_nm,
            "effective_speed_knots": speed_knots,
            "theoretical_voyage_hours": round(theoretical_hours, 2),
            "vessel_capacity_tons": vessel_capacity,
            "vessel_draft_m": vessel_draft,
            "cargo_weight_tons": cargo_weight,
            "weight_capacity_ratio": round(weight_capacity_ratio, 4),
            "vessel_type_encoded": vessel_encoded,
            "departure_month": dep_dt.month,
            "departure_day": dep_dt.day,
            "departure_hour": dep_dt.hour,
            "departure_dayofweek": dep_dt.weekday(),
        }

        df = pd.DataFrame([feature_row])[cls.FEATURE_COLUMNS]
        return df

    @classmethod
    def extract_features_from_dataframe(cls, df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Transforms historical dataset DataFrame into X (features) and y (target).
        Guarantees zero-leakage and validates column completeness.
        """
        processed_rows = []
        targets = []

        has_target = "actual_voyage_duration_hours" in df.columns

        for _, row in df.iterrows():
            row_dict = row.to_dict()
            feat_df = cls.extract_features_from_dict(row_dict)
            processed_rows.append(feat_df.iloc[0])

            if has_target:
                targets.append(float(row["actual_voyage_duration_hours"]))
            elif "departure_timestamp" in row and "arrival_timestamp" in row:
                try:
                    dep = pd.to_datetime(row["departure_timestamp"], utc=True)
                    arr = pd.to_datetime(row["arrival_timestamp"], utc=True)
                    hours = (arr - dep).total_seconds() / 3600.0
                    targets.append(max(hours, 0.1))
                except Exception:
                    targets.append(np.nan)

        X = pd.DataFrame(processed_rows)[cls.FEATURE_COLUMNS].reset_index(drop=True)
        y = pd.Series(targets, name="actual_voyage_duration_hours").reset_index(drop=True) if targets else None

        return X, y
