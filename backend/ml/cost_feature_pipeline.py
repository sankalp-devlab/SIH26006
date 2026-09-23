"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 16: Cost Feature Engineering & Pipeline

Extracts, validates, and transforms authoritative pre-voyage features for
XGBoost Cost Regression. Strictly avoids post-voyage information leakage.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd


class CostFeaturePipeline:
    # Deterministic ordered list of features required by the XGBoost Cost model
    FEATURE_NAMES: List[str] = [
        "distance_nm",
        "effective_speed_knots",
        "voyage_duration_days",
        "vessel_capacity_tons",
        "vessel_draft_m",
        "vessel_type_encoded",
        "cargo_weight_tons",
        "cargo_volume_m3",
        "capacity_utilization_pct",
        "fuel_consumption_laden_mt_day",
        "departure_month",
        "departure_dayofweek",
    ]

    # Standardized categorical mapping for vessel types
    VESSEL_TYPE_MAP: Dict[str, int] = {
        "bulk carrier": 1,
        "container": 2,
        "general cargo": 3,
        "tanker": 4,
        "chemical tanker": 5,
        "gas carrier": 6,
        "ro-ro": 7,
        "other": 8,
    }

    @classmethod
    def encode_vessel_type(cls, vessel_type: Optional[str]) -> int:
        if not vessel_type:
            return cls.VESSEL_TYPE_MAP["other"]
        clean_vt = str(vessel_type).lower().strip()
        for key, code in cls.VESSEL_TYPE_MAP.items():
            if key in clean_vt:
                return code
        return cls.VESSEL_TYPE_MAP["other"]

    @classmethod
    def extract_features(
        cls,
        vessel: Dict[str, Any],
        route_data: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
        departure_time: Optional[Union[str, datetime]] = None,
    ) -> Dict[str, float]:
        """
        Extracts the 12 pre-voyage features from validated raw inputs.

        Parameters:
        - vessel: Authoritative vessel record.
        - route_data: Authoritative route dict with distance_nm or distance_km.
        - cargo: Optional cargo record.
        - departure_time: Optional ISO timestamp or datetime object.

        Returns:
        Dictionary mapping feature name to numeric value.
        """
        # 1. Distance
        distance_nm = 0.0
        if "distance_nm" in route_data and route_data["distance_nm"] is not None:
            distance_nm = float(route_data["distance_nm"])
        elif "distance_km" in route_data and route_data["distance_km"] is not None:
            distance_nm = float(route_data["distance_km"]) / 1.852

        if distance_nm <= 0:
            raise ValueError("Route distance must be positive for cost feature extraction.")

        # 2. Vessel Speed
        speed = vessel.get("speed_laden_knots")
        if speed is None or float(speed) <= 0:
            speed = vessel.get("speed_ballast_knots")
        if speed is None or float(speed) <= 0:
            speed = 13.0  # Industry standard merchant vessel fallback
        speed_knots = float(speed)

        # 3. Voyage Duration Days
        voyage_hours = distance_nm / speed_knots
        voyage_days = round(voyage_hours / 24.0, 3)

        # 4. Vessel Capacity
        capacity_tons = float(vessel.get("capacity_tons") or 50000.0)

        # 5. Vessel Draft
        draft_m = float(vessel.get("draft_m") or 11.5)

        # 6. Vessel Type Encoded
        vessel_type_encoded = float(cls.encode_vessel_type(vessel.get("vessel_type")))

        # 7 & 8. Cargo Weight & Volume
        cargo_weight_tons = 0.0
        cargo_volume_m3 = 0.0
        if cargo:
            cargo_weight_tons = float(cargo.get("weight_tons") or 0.0)
            cargo_volume_m3 = float(cargo.get("volume_m3") or 0.0)

        # 9. Capacity Utilization %
        capacity_utilization_pct = 0.0
        if capacity_tons > 0 and cargo_weight_tons > 0:
            capacity_utilization_pct = round(min((cargo_weight_tons / capacity_tons) * 100.0, 150.0), 2)

        # 10. Fuel Consumption Rate MT/day
        fuel_mt_day = vessel.get("fuel_laden_mt_day")
        if fuel_mt_day is None or float(fuel_mt_day) <= 0:
            fuel_mt_day = vessel.get("fuel_ballast_mt_day")
        if fuel_mt_day is None or float(fuel_mt_day) <= 0:
            fuel_mt_day = 28.0  # Standard handymax/supramax fuel burn
        fuel_consumption_laden_mt_day = float(fuel_mt_day)

        # 11 & 12. Temporal Features
        dt: datetime
        if isinstance(departure_time, datetime):
            dt = departure_time
        elif isinstance(departure_time, str):
            try:
                dt = datetime.fromisoformat(departure_time.replace("Z", "+00:00"))
            except Exception:
                dt = datetime.now()
        else:
            dt = datetime.now()

        departure_month = float(dt.month)
        departure_dayofweek = float(dt.weekday())

        return {
            "distance_nm": round(distance_nm, 2),
            "effective_speed_knots": round(speed_knots, 2),
            "voyage_duration_days": round(voyage_days, 3),
            "vessel_capacity_tons": round(capacity_tons, 1),
            "vessel_draft_m": round(draft_m, 2),
            "vessel_type_encoded": vessel_type_encoded,
            "cargo_weight_tons": round(cargo_weight_tons, 1),
            "cargo_volume_m3": round(cargo_volume_m3, 1),
            "capacity_utilization_pct": round(capacity_utilization_pct, 2),
            "fuel_consumption_laden_mt_day": round(fuel_consumption_laden_mt_day, 2),
            "departure_month": departure_month,
            "departure_dayofweek": departure_dayofweek,
        }

    @classmethod
    def transform_to_vector(cls, features: Dict[str, float]) -> np.ndarray:
        """
        Converts the feature dictionary into an ordered 2D numpy array for XGBoost.
        """
        row = [features[col] for col in cls.FEATURE_NAMES]
        return np.array([row], dtype=np.float32)
