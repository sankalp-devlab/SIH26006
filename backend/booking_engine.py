"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 19: Booking System Engine

Provides core business logic, lifecycle management, server-side validation,
idempotency protection, and deterministic reference generation for maritime cargo bookings.
Strictly adheres to Rules 28 & 33 (Zero synthetic ML data, explicit DATA_UNAVAILABLE disclosures).
"""

import time
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple, Set

from recommendation_engine import RecommendationEngine
from route_engine import RouteEngine
from cost_engine import CostEngine
from eta_engine import EtaEngine


class BookingEngine:
    ENGINE_NAME = "Module 19 Maritime Booking Engine"
    ENGINE_VERSION = "1.0.0"

    # --------------------------------------------------
    # BOOKING LIFECYCLE STATE MACHINE
    # --------------------------------------------------
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    
    # Pre-booking estimation statuses from Modules 12/13
    STATUS_COST_ESTIMATED = "cost_estimated"
    STATUS_ETA_CALCULATED = "eta_calculated"

    ALL_STATUSES: Set[str] = {
        STATUS_PENDING,
        STATUS_CONFIRMED,
        STATUS_IN_PROGRESS,
        STATUS_COMPLETED,
        STATUS_CANCELLED,
        STATUS_COST_ESTIMATED,
        STATUS_ETA_CALCULATED,
    }

    # Strict status transition graph
    VALID_TRANSITIONS: Dict[str, List[str]] = {
        STATUS_COST_ESTIMATED: [STATUS_PENDING, STATUS_CANCELLED],
        STATUS_ETA_CALCULATED: [STATUS_PENDING, STATUS_CANCELLED],
        STATUS_PENDING: [STATUS_CONFIRMED, STATUS_CANCELLED],
        STATUS_CONFIRMED: [STATUS_IN_PROGRESS, STATUS_CANCELLED],
        STATUS_IN_PROGRESS: [STATUS_COMPLETED],
        STATUS_COMPLETED: [],  # Terminal state
        STATUS_CANCELLED: [],  # Terminal state
    }

    # In-memory duplicate & idempotency cache: {idempotency_key: (booking_dict, timestamp)}
    _idempotency_cache: Dict[str, Tuple[Dict[str, Any], float]] = {}
    IDEMPOTENCY_TTL_SECONDS = 600.0  # 10 minutes

    # --------------------------------------------------
    # REFERENCE NUMBER GENERATION
    # --------------------------------------------------
    @classmethod
    def generate_booking_reference(cls, booking_id: int) -> str:
        """
        Generates a collision-resistant, deterministic booking reference string.
        Format: MCB-B{booking_id:06d} (e.g., MCB-B000004).
        """
        if not isinstance(booking_id, int) or booking_id <= 0:
            raise ValueError(f"Invalid booking_id for reference generation: {booking_id}")
        return f"MCB-B{booking_id:06d}"

    @classmethod
    def parse_booking_reference(cls, reference: str) -> Optional[int]:
        """
        Safely extracts the booking primary key ID from a reference string.
        Supports MCB-B000004, MCB-000004, or plain numeric strings.
        """
        if not reference or not isinstance(reference, str):
            return None
        
        ref_clean = reference.strip().upper()
        match = re.match(r"^MCB-(?:B)?(\d+)$", ref_clean)
        if match:
            try:
                return int(match.group(1))
            except (ValueError, TypeError):
                return None

        # Fallback if raw numeric ID was passed
        if ref_clean.isdigit():
            return int(ref_clean)

        return None

    # --------------------------------------------------
    # IDEMPOTENCY & DUPLICATE PROTECTION
    # --------------------------------------------------
    @classmethod
    def check_idempotency(cls, idempotency_key: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Returns cached booking response if idempotency key is valid and unexpired.
        Purges expired keys lazily.
        """
        if not idempotency_key:
            return None

        now = time.time()
        # Clean expired
        expired = [k for k, (_, exp) in cls._idempotency_cache.items() if now > exp]
        for k in expired:
            cls._idempotency_cache.pop(k, None)

        cached = cls._idempotency_cache.get(idempotency_key)
        if cached:
            return cached[0]
        return None

    @classmethod
    def store_idempotency(cls, idempotency_key: Optional[str], booking_record: Dict[str, Any]) -> None:
        """Stores booking record against idempotency key with TTL."""
        if not idempotency_key:
            return
        cls._idempotency_cache[idempotency_key] = (
            booking_record,
            time.time() + cls.IDEMPOTENCY_TTL_SECONDS
        )

    # --------------------------------------------------
    # STATUS TRANSITION VALIDATION
    # --------------------------------------------------
    @classmethod
    def validate_status_transition(cls, current_status: str, target_status: str) -> Tuple[bool, str]:
        """
        Validates whether current_status -> target_status is permitted.
        Returns: (is_valid, error_message_if_invalid)
        """
        curr = (current_status or "").strip().lower()
        target = (target_status or "").strip().lower()

        if target not in cls.ALL_STATUSES:
            return False, f"Invalid target status '{target}'. Allowed statuses: {sorted(list(cls.ALL_STATUSES))}"

        if curr == target:
            return True, ""

        allowed = cls.VALID_TRANSITIONS.get(curr, [])
        if target not in allowed:
            return False, (
                f"Invalid status transition from '{curr}' to '{target}'. "
                f"Allowed transitions from '{curr}': {allowed or 'None (terminal state)'}."
            )

        return True, ""

    @classmethod
    def get_allowed_next_statuses(cls, current_status: str) -> List[str]:
        """Returns the list of valid next statuses from the current status."""
        curr = (current_status or "").strip().lower()
        return cls.VALID_TRANSITIONS.get(curr, [])

    # --------------------------------------------------
    # SERVER-SIDE BOOKING VALIDATION
    # --------------------------------------------------
    @classmethod
    def validate_booking_request(
        cls,
        cargo: Dict[str, Any],
        vessel: Dict[str, Any],
        route_data: Optional[Dict[str, Any]] = None,
        origin_port: Optional[Dict[str, Any]] = None,
        dest_port: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, List[str]]:
        """
        Comprehensive server-side booking pre-validation:
        1. Cargo existence & weight validity
        2. Vessel existence & status validity
        3. Port corridor validity
        4. Vessel-cargo containment compatibility
        5. Vessel deadweight capacity constraints
        6. Canal draft limits
        """
        violations: List[str] = []

        # 1. Cargo Checks
        if not cargo or not cargo.get("id"):
            violations.append("Cargo entity does not exist or is missing an authoritative ID.")
        cargo_weight = float(cargo.get("weight_tons") or 0.0)
        if cargo_weight <= 0:
            violations.append(f"Cargo payload must be strictly positive (got {cargo_weight} MT).")

        # 2. Vessel Checks
        if not vessel or not vessel.get("id"):
            violations.append("Vessel entity does not exist or is missing an authoritative ID.")
        vessel_capacity = float(vessel.get("capacity_tons") or 0.0)
        if vessel_capacity <= 0:
            violations.append(f"Vessel capacity must be strictly positive (got {vessel_capacity} MT).")

        # 3. Port Corridor Checks
        if origin_port and dest_port:
            if origin_port.get("id") == dest_port.get("id"):
                violations.append(
                    f"Origin port #{origin_port.get('id')} and destination port #{dest_port.get('id')} "
                    "cannot be identical for commercial voyage booking."
                )

        # 4. Recommendation Engine Compatibility & Capacity Validation
        is_compat, compat_reasons = RecommendationEngine.validate_vessel_cargo_compatibility(
            vessel=vessel,
            cargo=cargo,
            route_data=route_data,
        )
        if not is_compat:
            violations.extend(compat_reasons)

        return (len(violations) == 0, violations)

    # --------------------------------------------------
    # RICH BOOKING OBJECT ENRICHMENT
    # --------------------------------------------------
    @classmethod
    def enrich_booking_response(
        cls,
        booking_row: Dict[str, Any],
        cargo_row: Optional[Dict[str, Any]] = None,
        vessel_row: Optional[Dict[str, Any]] = None,
        route_row: Optional[Dict[str, Any]] = None,
        origin_port_row: Optional[Dict[str, Any]] = None,
        dest_port_row: Optional[Dict[str, Any]] = None,
        recommendation_meta: Optional[Dict[str, Any]] = None,
        risk_meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Combines raw Supabase booking row with authentic joined entity details,
        estimate sources, and strict disclosures.
        """
        b_id = booking_row["id"]
        reference = cls.generate_booking_reference(b_id)
        current_status = booking_row.get("booking_status") or cls.STATUS_PENDING

        # Cargo summary
        cargo_info = None
        if cargo_row:
            cargo_info = {
                "id": cargo_row.get("id"),
                "description": cargo_row.get("description"),
                "cargo_type": cargo_row.get("cargo_type"),
                "weight_tons": cargo_row.get("weight_tons"),
                "volume_m3": cargo_row.get("volume_m3"),
                "origin_port_id": cargo_row.get("origin_port_id"),
                "destination_port_id": cargo_row.get("destination_port_id"),
            }

        # Vessel summary
        vessel_info = None
        if vessel_row:
            vessel_info = {
                "id": vessel_row.get("id"),
                "name": vessel_row.get("name"),
                "imo_number": vessel_row.get("imo_number"),
                "vessel_type": vessel_row.get("vessel_type"),
                "flag": vessel_row.get("flag"),
                "capacity_tons": vessel_row.get("capacity_tons"),
                "length_m": vessel_row.get("length_m"),
                "width_m": vessel_row.get("width_m"),
                "draft_m": vessel_row.get("draft_m"),
                "speed_laden_knots": vessel_row.get("speed_laden_knots"),
            }

        # Route corridor
        route_info = None
        if route_row:
            route_info = {
                "id": route_row.get("id"),
                "distance_km": route_row.get("distance_km"),
                "estimated_duration_hours": route_row.get("estimated_duration_hours"),
                "route_status": route_row.get("route_status"),
            }

        # Origin / Destination ports
        origin_port_info = None
        if origin_port_row:
            origin_port_info = {
                "id": origin_port_row.get("id"),
                "name": origin_port_row.get("name"),
                "unlocode": origin_port_row.get("unlocode"),
                "country": origin_port_row.get("country"),
                "city": origin_port_row.get("city"),
            }

        dest_port_info = None
        if dest_port_row:
            dest_port_info = {
                "id": dest_port_row.get("id"),
                "name": dest_port_row.get("name"),
                "unlocode": dest_port_row.get("unlocode"),
                "country": dest_port_row.get("country"),
                "city": dest_port_row.get("city"),
            }

        # Estimate provenance & disclosures
        est_cost = booking_row.get("estimated_cost")
        est_eta = booking_row.get("estimated_eta")

        cost_source = (recommendation_meta or {}).get("cost_source") or "BASELINE_VOYAGE_CALCULATION"
        eta_source = (recommendation_meta or {}).get("eta_source") or "BASELINE_SPEED_DISTANCE_CALCULATION"

        risk_disclosure = {
            "status": "DATA_UNAVAILABLE",
            "disclosure": (
                "Real-time dynamic weather, live naval security alerts, and port berth congestion data are "
                "currently DATA_UNAVAILABLE per platform Rule 28 integrity guidelines. No synthetic risk scores used."
            ),
        }
        if risk_meta and risk_meta.get("overall_risk") is not None:
            risk_disclosure = {
                "status": "ASSESSED",
                "overall_risk_score": risk_meta.get("overall_risk"),
                "risk_level": risk_meta.get("risk_level"),
                "route_risk_score": risk_meta.get("route_risk"),
                "disclosure": "Assessed via Module 17 Maritime Risk Engine based on physical corridor and vessel geometry.",
            }

        booking_notice = (
            "Booking Request Recorded. This submission is an operational cargo reservation request. "
            "Vessel fixture is subject to carrier confirmation, formal charter party execution, and berth clearance."
        )

        return {
            "booking_id": b_id,
            "booking_reference": reference,
            "cargo_id": booking_row.get("cargo_id"),
            "vessel_id": booking_row.get("vessel_id"),
            "route_id": booking_row.get("route_id"),
            "booking_status": current_status,
            "estimated_cost": est_cost,
            "cost_source": cost_source if est_cost is not None else None,
            "currency": "USD",
            "estimated_eta": est_eta,
            "eta_source": eta_source if est_eta is not None else None,
            "created_at": booking_row.get("created_at"),
            "cargo": cargo_info,
            "vessel": vessel_info,
            "route": route_info,
            "origin_port": origin_port_info,
            "destination_port": dest_port_info,
            "recommendation_metadata": recommendation_meta,
            "risk_disclosure": risk_disclosure,
            "operational_notice": booking_notice,
            "allowed_next_statuses": cls.get_allowed_next_statuses(current_status),
        }
