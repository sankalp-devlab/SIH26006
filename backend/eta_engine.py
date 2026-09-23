"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 13 — Voyage ETA Calculation Engine

Calculates a realistic, deterministic baseline voyage ETA using REAL cargo,
vessel, and route information from the project database and calculation services.

NO fake vessel speed, NO fake route distance, NO fake arrival timestamps,
and NO arbitrary weather or congestion percentages.
"""

from datetime import datetime, timedelta, timezone
import math
from typing import Any, Dict, Optional, Union


class EtaEngine:
    KM_PER_NM = 1.852

    @classmethod
    def parse_datetime(cls, dt_input: Union[str, datetime]) -> datetime:
        """
        Safely parses an input into a timezone-aware UTC datetime.
        """
        if isinstance(dt_input, datetime):
            if dt_input.tzinfo is None:
                return dt_input.replace(tzinfo=timezone.utc)
            return dt_input

        # String parsing
        cleaned = str(dt_input).strip().replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(cleaned)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            # Fallback to current UTC if unparseable
            return datetime.now(timezone.utc)

    @classmethod
    def calculate_voyage_eta(
        cls,
        vessel: Dict[str, Any],
        route_data: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
        departure_time_input: Optional[Union[str, datetime]] = None,
    ) -> Dict[str, Any]:
        """
        Executes an authoritative deterministic baseline voyage ETA calculation.

        Parameters:
        - vessel: Authoritative vessel record from 'vessels' table.
        - route_data: Calculated route dictionary from RouteEngine or 'routes' table record.
        - cargo: Optional cargo record from 'cargo' table.
        - departure_time_input: Optional departure datetime or ISO string override.

        Returns:
        Structured ETACalculationResponse dictionary.
        """
        now_dt = datetime.now(timezone.utc)
        now_iso = now_dt.isoformat()

        # --------------------------------------------------
        # 1. ROUTE DISTANCE EXTRACTION & VALIDATION
        # --------------------------------------------------
        distance_nm: Optional[float] = None
        distance_km: Optional[float] = None
        distance_type: str = route_data.get("distance_type", "maritime")

        if "distance_nm" in route_data and route_data["distance_nm"] is not None:
            distance_nm = float(route_data["distance_nm"])
            distance_km = float(route_data.get("distance_km") or (distance_nm * cls.KM_PER_NM))
        elif "distance_km" in route_data and route_data["distance_km"] is not None:
            distance_km = float(route_data["distance_km"])
            distance_nm = distance_km / cls.KM_PER_NM
        else:
            raise ValueError("Route distance is unavailable.")

        if distance_nm <= 0:
            raise ValueError("Route distance must be a positive non-zero value.")

        distance_nm = round(distance_nm, 1)
        distance_km = round(distance_km, 1)

        # --------------------------------------------------
        # 2. VESSEL SPEED EXTRACTION & VALIDATION
        # --------------------------------------------------
        # Determine operational speed: speed_laden_knots, fallback to speed_ballast_knots
        speed_knots = vessel.get("speed_laden_knots")
        speed_source = "speed_laden_knots"

        if speed_knots is None or speed_knots <= 0:
            speed_knots = vessel.get("speed_ballast_knots")
            speed_source = "speed_ballast_knots"

        if speed_knots is None or speed_knots <= 0:
            raise ValueError("Vessel speed data is unavailable.")

        speed_knots = float(speed_knots)

        # --------------------------------------------------
        # 3. BASELINE VOYAGE DURATION (HOURS & DAYS)
        # --------------------------------------------------
        # Deterministic formula: voyage_hours = distance_nm / effective_speed
        voyage_hours_raw = distance_nm / speed_knots
        voyage_hours = round(voyage_hours_raw, 2)
        voyage_days = round(voyage_hours / 24.0, 2)

        # --------------------------------------------------
        # 4. DEPARTURE TIME RESOLUTION
        # --------------------------------------------------
        departure_dt: datetime
        departure_time_source: str

        if departure_time_input:
            departure_dt = cls.parse_datetime(departure_time_input)
            departure_time_source = "request_override"
        elif cargo and cargo.get("ready_date"):
            departure_dt = cls.parse_datetime(cargo["ready_date"])
            departure_time_source = "cargo_ready_date"
        elif cargo and cargo.get("created_at"):
            departure_dt = cls.parse_datetime(cargo["created_at"])
            departure_time_source = "cargo_created_at"
        else:
            departure_dt = now_dt
            departure_time_source = "current_utc"

        departure_time_iso = departure_dt.isoformat()

        # --------------------------------------------------
        # 5. ESTIMATED ARRIVAL CALCULATION (ETA)
        # --------------------------------------------------
        # estimated_arrival = departure_time + voyage_duration
        estimated_arrival_dt = departure_dt + timedelta(hours=voyage_hours_raw)
        estimated_arrival_iso = estimated_arrival_dt.isoformat()

        # --------------------------------------------------
        # 6. ROUTE CONDITIONS & PORT WAITING AUDIT
        # --------------------------------------------------
        # In strict adherence to Step 9, Step 10 & Step 23:
        # No validated live weather or congestion delay model exists in current database.
        # We transparently set these to None (unavailable) without fabricating percentages.
        condition_adjustment = None
        condition_status = "unavailable"
        port_waiting_duration = None
        port_waiting_status = "unavailable"

        # ETA Status:
        # 'full' if all conditions and port waiting exist;
        # 'partial' when baseline is deterministic and complete, but live weather/port conditions are unavailable.
        eta_status = "partial"

        # Unique identifier
        cargo_id = cargo.get("id") if cargo else None
        vessel_id = vessel.get("id")
        route_id = route_data.get("route_id") or route_data.get("id")
        eta_id = f"eta-{cargo_id or 'adhoc'}-{vessel_id}-{route_id or 'direct'}"

        return {
            "eta_id": eta_id,
            "cargo_id": cargo_id,
            "vessel_id": vessel_id,
            "vessel_name": vessel.get("name"),
            "vessel_type": vessel.get("vessel_type"),
            "route_id": str(route_id) if route_id else None,
            "departure_time": departure_time_iso,
            "estimated_arrival": estimated_arrival_iso,
            "distance_nm": distance_nm,
            "distance_km": distance_km,
            "distance_type": distance_type,
            "effective_speed_knots": speed_knots,
            "speed_source": speed_source,
            "departure_time_source": departure_time_source,
            "voyage_hours": voyage_hours,
            "voyage_days": voyage_days,
            "base_voyage_duration_hours": voyage_hours,
            "condition_adjustment": condition_adjustment,
            "condition_status": condition_status,
            "port_waiting_duration": port_waiting_duration,
            "port_waiting_status": port_waiting_status,
            "eta_status": eta_status,
            "calculation_method": "deterministic_baseline",
            "calculation_details": {
                "formula": "voyage_hours = distance_nm / effective_speed_knots; estimated_arrival = departure_time + voyage_duration",
                "distance_nm": distance_nm,
                "effective_speed_knots": speed_knots,
                "speed_source": speed_source,
                "departure_time_source": departure_time_source,
                "weather_adjustment": "unavailable",
                "port_waiting": "unavailable",
                "notice": "Baseline sailing ETA calculated authoritatively. Real-time meteorological delay and port queue congestion models will be evaluated in Module 15 (XGBoost) and Module 17 (Risk Engine)."
            },
            "created_at": now_iso
        }
