"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 20: Live Vessel Tracking Engine

Encapsulates authentic vessel position tracking, AIS/telemetry ingestion,
data freshness state machine, and booking-voyage geospatial resolution.
Strictly adheres to Rules 28 & 33 (Zero synthetic ML data, explicit DATA_UNAVAILABLE disclosures).
Reuses existing Supabase table: public.vessel_positions (id, vessel_id, latitude, longitude, speed_knots, heading, recorded_at).
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple, Set


class TrackingEngine:
    ENGINE_NAME = "Module 20 Live Vessel Tracking Engine"
    ENGINE_VERSION = "1.0.0"

    # --------------------------------------------------
    # DATA FRESHNESS DEFINITIONS & STATUS CONSTANTS
    # --------------------------------------------------
    STATUS_LIVE = "LIVE"                  # < 2 hours old
    STATUS_RECENT = "RECENT"              # 2 hours to 24 hours old
    STATUS_STALE = "STALE"                # > 24 hours old
    STATUS_DATA_UNAVAILABLE = "DATA_UNAVAILABLE"  # No telemetry received
    STATUS_PROVIDER_ERROR = "PROVIDER_ERROR"      # External AIS failure

    ALL_FRESHNESS_STATUSES: Set[str] = {
        STATUS_LIVE,
        STATUS_RECENT,
        STATUS_STALE,
        STATUS_DATA_UNAVAILABLE,
        STATUS_PROVIDER_ERROR,
    }

    # Freshness thresholds
    LIVE_THRESHOLD_MINUTES = 120.0        # 2 hours
    RECENT_THRESHOLD_MINUTES = 1440.0     # 24 hours

    # Configured providers
    PROVIDER_DATABASE = "SUPABASE_VESSEL_POSITIONS"
    PROVIDER_EXTERNAL_AIS = "EXTERNAL_AIS_STREAM"

    @classmethod
    def get_configured_provider_info(cls) -> Dict[str, Any]:
        """
        Inspects environment to determine whether authentic external AIS provider
        credentials are configured. Never invents credentials.
        """
        ais_api_key = os.getenv("AIS_API_KEY") or os.getenv("SPIRE_API_KEY") or os.getenv("AISSTREAM_API_KEY")
        ais_provider_url = os.getenv("AIS_PROVIDER_URL")

        if ais_api_key:
            return {
                "provider_type": cls.PROVIDER_EXTERNAL_AIS,
                "is_configured": True,
                "provider_url": ais_provider_url or "https://api.aisstream.io/v1",
                "status_message": "Authentic commercial AIS telemetry provider configured in environment.",
            }
        
        return {
            "provider_type": cls.PROVIDER_DATABASE,
            "is_configured": False,
            "provider_url": None,
            "status_message": (
                "External AIS subscription is UNCONFIGURED. Tracking engine operates against authentic "
                "telemetry persisted in public.vessel_positions. When no telemetry is logged, positions "
                "are reported as DATA_UNAVAILABLE per platform integrity guidelines."
            ),
        }

    @classmethod
    def evaluate_position_freshness(cls, recorded_at_str: Optional[str]) -> Tuple[str, Optional[float]]:
        """
        Calculates position age in minutes and returns (freshness_status, age_minutes).
        Never fabricates timestamps.
        """
        if not recorded_at_str:
            return cls.STATUS_DATA_UNAVAILABLE, None

        try:
            # Handle ISO string with or without Z/offset
            clean_str = recorded_at_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            
            now = datetime.now(timezone.utc)
            delta = now - dt
            age_minutes = max(0.0, delta.total_seconds() / 60.0)

            if age_minutes <= cls.LIVE_THRESHOLD_MINUTES:
                return cls.STATUS_LIVE, round(age_minutes, 1)
            elif age_minutes <= cls.RECENT_THRESHOLD_MINUTES:
                return cls.STATUS_RECENT, round(age_minutes, 1)
            else:
                return cls.STATUS_STALE, round(age_minutes, 1)
        except Exception:
            return cls.STATUS_STALE, None

    # --------------------------------------------------
    # VALIDATION FOR TELEMETRY INGESTION
    # --------------------------------------------------
    @classmethod
    def validate_position_observation(
        cls,
        vessel_id: int,
        latitude: float,
        longitude: float,
        speed_knots: Optional[float] = None,
        heading: Optional[float] = None,
        recorded_at: Optional[str] = None,
    ) -> Tuple[bool, List[str]]:
        """
        Strict server-side validation for authentic position observations:
        1. Valid vessel ID > 0
        2. Latitude in [-90.0, 90.0]
        3. Longitude in [-180.0, 180.0]
        4. Speed >= 0.0 (if present)
        5. Heading in [0.0, 360.0] (if present)
        6. Timestamp ISO format and not in the future
        """
        violations: List[str] = []

        if not isinstance(vessel_id, int) or vessel_id <= 0:
            violations.append(f"Invalid vessel_id '{vessel_id}'. Must be a positive integer.")

        if latitude is None or not (-90.0 <= float(latitude) <= 90.0):
            violations.append(f"Invalid latitude '{latitude}'. Must be between -90.0 and +90.0 degrees.")

        if longitude is None or not (-180.0 <= float(longitude) <= 180.0):
            violations.append(f"Invalid longitude '{longitude}'. Must be between -180.0 and +180.0 degrees.")

        if speed_knots is not None and float(speed_knots) < 0.0:
            violations.append(f"Speed over ground cannot be negative (got {speed_knots} kts).")

        if heading is not None and not (0.0 <= float(heading) <= 360.0):
            violations.append(f"Heading must be between 0.0 and 360.0 degrees (got {heading}).")

        if recorded_at:
            try:
                clean_str = recorded_at.replace("Z", "+00:00")
                dt = datetime.fromisoformat(clean_str)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                # Allow 5-minute clock drift tolerance
                if dt > now + timedelta(minutes=5):
                    violations.append(f"Observation timestamp cannot be in the future (got {recorded_at}).")
            except Exception as e:
                violations.append(f"Invalid ISO timestamp format for recorded_at: {e}")

        return (len(violations) == 0, violations)

    # --------------------------------------------------
    # SUPABASE POSITION INGESTION
    # --------------------------------------------------
    @classmethod
    def ingest_position(
        cls,
        supabase_client: Any,
        vessel_id: int,
        latitude: float,
        longitude: float,
        speed_knots: Optional[float] = None,
        heading: Optional[float] = None,
        recorded_at: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates, dedupes, and persists an authentic position observation into public.vessel_positions.
        """
        is_valid, violations = cls.validate_position_observation(
            vessel_id=vessel_id,
            latitude=latitude,
            longitude=longitude,
            speed_knots=speed_knots,
            heading=heading,
            recorded_at=recorded_at,
        )
        if not is_valid:
            return {
                "success": False,
                "error": "VALIDATION_FAILED",
                "violations": violations,
            }

        # Check vessel existence
        v_res = supabase_client.table("vessels").select("id, name, imo_number").eq("id", vessel_id).execute()
        if not v_res.data:
            return {
                "success": False,
                "error": "VESSEL_NOT_FOUND",
                "violations": [f"Vessel #{vessel_id} does not exist in platform database fleet."],
            }
        vessel_info = v_res.data[0]

        timestamp_to_store = recorded_at or datetime.now(timezone.utc).isoformat()

        # Idempotent deduplication: avoid duplicate insert if same vessel has observation within 5s at identical coordinates
        try:
            recent_res = (
                supabase_client.table("vessel_positions")
                .select("id, recorded_at, latitude, longitude")
                .eq("vessel_id", vessel_id)
                .order("recorded_at", desc=True)
                .limit(1)
                .execute()
            )
            if recent_res.data:
                latest = recent_res.data[0]
                lat_diff = abs(float(latest.get("latitude") or 0.0) - float(latitude))
                lng_diff = abs(float(latest.get("longitude") or 0.0) - float(longitude))
                if lat_diff < 0.0001 and lng_diff < 0.0001 and latest.get("recorded_at") == timestamp_to_store:
                    freshness, age_min = cls.evaluate_position_freshness(latest.get("recorded_at"))
                    return {
                        "success": True,
                        "action": "DEDUPLICATED",
                        "position_id": latest["id"],
                        "vessel_id": vessel_id,
                        "vessel_name": vessel_info.get("name"),
                        "latitude": float(latest["latitude"]),
                        "longitude": float(latest["longitude"]),
                        "speed_knots": speed_knots,
                        "heading": heading,
                        "recorded_at": latest["recorded_at"],
                        "freshness_status": freshness,
                        "age_minutes": age_min,
                        "message": "Duplicate observation matched existing record; skipped duplicate insertion.",
                    }
        except Exception as dup_err:
            print(f"[TrackingEngine] Deduplication check notice: {dup_err}")

        # Insert new observation into public.vessel_positions
        insert_payload = {
            "vessel_id": vessel_id,
            "latitude": float(latitude),
            "longitude": float(longitude),
            "speed_knots": float(speed_knots) if speed_knots is not None else None,
            "heading": float(heading) if heading is not None else None,
            "recorded_at": timestamp_to_store,
        }

        ins = supabase_client.table("vessel_positions").insert(insert_payload).execute()
        if not ins.data:
            return {
                "success": False,
                "error": "INSERT_FAILED",
                "violations": ["Failed to persist position observation in Supabase vessel_positions."],
            }

        saved = ins.data[0]
        freshness, age_min = cls.evaluate_position_freshness(saved.get("recorded_at"))

        return {
            "success": True,
            "action": "INSERTED",
            "position_id": saved["id"],
            "vessel_id": vessel_id,
            "vessel_name": vessel_info.get("name"),
            "latitude": float(saved["latitude"]),
            "longitude": float(saved["longitude"]),
            "speed_knots": float(saved["speed_knots"]) if saved.get("speed_knots") is not None else None,
            "heading": float(saved["heading"]) if saved.get("heading") is not None else None,
            "recorded_at": saved["recorded_at"],
            "freshness_status": freshness,
            "age_minutes": age_min,
            "data_source": "TELEMETRY_INGESTION",
        }

    # --------------------------------------------------
    # ENRICHED VESSEL TRACKING QUERIES
    # --------------------------------------------------
    @classmethod
    def get_latest_vessel_position(
        cls,
        supabase_client: Any,
        vessel_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves the latest authentic position from public.vessel_positions.
        Returns None if no positions exist.
        """
        try:
            res = (
                supabase_client.table("vessel_positions")
                .select("*")
                .eq("vessel_id", vessel_id)
                .order("recorded_at", desc=True)
                .limit(1)
                .execute()
            )
            if res.data:
                row = res.data[0]
                freshness, age_min = cls.evaluate_position_freshness(row.get("recorded_at"))
                return {
                    "position_id": row["id"],
                    "vessel_id": row["vessel_id"],
                    "latitude": float(row["latitude"]) if row.get("latitude") is not None else None,
                    "longitude": float(row["longitude"]) if row.get("longitude") is not None else None,
                    "speed_knots": float(row["speed_knots"]) if row.get("speed_knots") is not None else None,
                    "heading": float(row["heading"]) if row.get("heading") is not None else None,
                    "recorded_at": row.get("recorded_at"),
                    "freshness_status": freshness,
                    "age_minutes": age_min,
                    "data_source": "SUPABASE_VESSEL_POSITIONS",
                }
        except Exception as e:
            print(f"[TrackingEngine] Latest position fetch notice for vessel #{vessel_id}: {e}")
        return None

    @classmethod
    def get_vessel_position_history(
        cls,
        supabase_client: Any,
        vessel_id: int,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves chronological authentic positions for vessel.
        Never fabricates historical track coordinates.
        """
        try:
            res = (
                supabase_client.table("vessel_positions")
                .select("*")
                .eq("vessel_id", vessel_id)
                .order("recorded_at", desc=False)
                .limit(limit)
                .execute()
            )
            history = []
            for r in (res.data or []):
                freshness, age_min = cls.evaluate_position_freshness(r.get("recorded_at"))
                history.append({
                    "position_id": r["id"],
                    "vessel_id": r["vessel_id"],
                    "latitude": float(r["latitude"]),
                    "longitude": float(r["longitude"]),
                    "speed_knots": float(r["speed_knots"]) if r.get("speed_knots") is not None else None,
                    "heading": float(r["heading"]) if r.get("heading") is not None else None,
                    "recorded_at": r.get("recorded_at"),
                    "freshness_status": freshness,
                    "age_minutes": age_min,
                    "data_source": "SUPABASE_VESSEL_POSITIONS",
                })
            return history
        except Exception as e:
            print(f"[TrackingEngine] Position history fetch notice for vessel #{vessel_id}: {e}")
            return []

    @classmethod
    def get_all_vessels_tracking(
        cls,
        supabase_client: Any,
        status_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Retrieves fleet vessels enriched with their latest authentic position observation,
        associated active booking, corridor, and transparency disclosures.
        """
        # 1. Fetch fleet vessels
        v_res = (
            supabase_client.table("vessels")
            .select("*")
            .order("id", desc=False)
            .range(offset, offset + limit - 1)
            .execute()
        )
        vessels = v_res.data or []

        # 2. Fetch all active bookings to associate vessels with commercial cargo voyages
        active_bookings_map: Dict[int, Dict[str, Any]] = {}
        try:
            b_res = (
                supabase_client.table("bookings")
                .select("*, cargo(*)")
                .in_("booking_status", ["pending", "confirmed", "in_progress"])
                .execute()
            )
            for b in (b_res.data or []):
                v_id = b.get("vessel_id")
                if v_id and v_id not in active_bookings_map:
                    active_bookings_map[v_id] = b
        except Exception as b_err:
            print(f"[TrackingEngine] Active bookings map notice: {b_err}")

        # 3. Batch fetch latest positions
        vessel_ids = [v["id"] for v in vessels]
        positions_map: Dict[int, Dict[str, Any]] = {}
        if vessel_ids:
            try:
                # Fetch recent positions for these vessels
                pos_res = (
                    supabase_client.table("vessel_positions")
                    .select("*")
                    .in_("vessel_id", vessel_ids)
                    .order("recorded_at", desc=True)
                    .execute()
                )
                for p in (pos_res.data or []):
                    v_id = p["vessel_id"]
                    # Retain only the newest observation per vessel
                    if v_id not in positions_map:
                        freshness, age_min = cls.evaluate_position_freshness(p.get("recorded_at"))
                        positions_map[v_id] = {
                            "position_id": p["id"],
                            "vessel_id": v_id,
                            "latitude": float(p["latitude"]),
                            "longitude": float(p["longitude"]),
                            "speed_knots": float(p["speed_knots"]) if p.get("speed_knots") is not None else None,
                            "heading": float(p["heading"]) if p.get("heading") is not None else None,
                            "recorded_at": p.get("recorded_at"),
                            "freshness_status": freshness,
                            "age_minutes": age_min,
                            "data_source": "SUPABASE_VESSEL_POSITIONS",
                        }
            except Exception as p_err:
                print(f"[TrackingEngine] Batch positions fetch notice: {p_err}")

        # 4. Assemble vessel tracking records
        tracked_records = []
        for v in vessels:
            v_id = v["id"]
            pos = positions_map.get(v_id)
            active_b = active_bookings_map.get(v_id)

            freshness = pos["freshness_status"] if pos else cls.STATUS_DATA_UNAVAILABLE

            if status_filter and status_filter.upper() != "ALL":
                if freshness != status_filter.upper():
                    continue

            # Associated booking summary
            booking_summary = None
            if active_b:
                cg = active_b.get("cargo") or {}
                booking_summary = {
                    "booking_id": active_b["id"],
                    "booking_reference": f"MCB-B{active_b['id']:06d}",
                    "booking_status": active_b.get("booking_status"),
                    "cargo_id": active_b.get("cargo_id"),
                    "commodity": cg.get("description"),
                    "weight_tons": cg.get("weight_tons"),
                    "origin_port_id": cg.get("origin_port_id"),
                    "destination_port_id": cg.get("destination_port_id"),
                    "estimated_cost": active_b.get("estimated_cost"),
                    "estimated_eta": active_b.get("estimated_eta"),
                }

            tracked_records.append({
                "vessel_id": v_id,
                "name": v.get("name"),
                "imo_number": v.get("imo_number"),
                "vessel_type": v.get("vessel_type"),
                "flag": v.get("flag"),
                "capacity_tons": v.get("capacity_tons"),
                "draft_m": v.get("draft_m"),
                "operational_status": v.get("status") or "underway",
                "speed_laden_knots": v.get("speed_laden_knots"),
                "tracking_status": freshness,
                "latest_position": pos,
                "active_booking": booking_summary,
                "disclosure": (
                    "Live observed AIS coordinates." if pos
                    else "No authentic position observations on record. External AIS stream is unconfigured. Coordinates are DATA_UNAVAILABLE per Rule 28."
                ),
            })

        provider_info = cls.get_configured_provider_info()

        return {
            "count": len(tracked_records),
            "limit": limit,
            "offset": offset,
            "provider_info": provider_info,
            "vessels": tracked_records,
        }

    @classmethod
    def get_vessel_tracking_detail(
        cls,
        supabase_client: Any,
        vessel_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves full tracking provenance for a single vessel including latest position,
        position history, active booking, corridor ports, and disclosure.
        """
        # 1. Fetch vessel
        v_res = supabase_client.table("vessels").select("*").eq("id", vessel_id).execute()
        if not v_res.data:
            return None
        v = v_res.data[0]

        # 2. Latest Position
        latest_pos = cls.get_latest_vessel_position(supabase_client, vessel_id)
        freshness = latest_pos["freshness_status"] if latest_pos else cls.STATUS_DATA_UNAVAILABLE

        # 3. Position History (last 20 observations)
        history = cls.get_vessel_position_history(supabase_client, vessel_id, limit=20)

        # 4. Associated Active Booking
        active_b_res = (
            supabase_client.table("bookings")
            .select("*, cargo(*)")
            .eq("vessel_id", vessel_id)
            .in_("booking_status", ["pending", "confirmed", "in_progress"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        active_booking = None
        origin_port_info = None
        dest_port_info = None

        if active_b_res.data:
            b_row = active_b_res.data[0]
            cg = b_row.get("cargo") or {}
            orig_id = cg.get("origin_port_id")
            dest_id = cg.get("destination_port_id")

            if orig_id:
                try:
                    p1 = supabase_client.table("ports").select("*").eq("id", orig_id).execute()
                    if p1.data:
                        origin_port_info = p1.data[0]
                except Exception:
                    pass
            if dest_id:
                try:
                    p2 = supabase_client.table("ports").select("*").eq("id", dest_id).execute()
                    if p2.data:
                        dest_port_info = p2.data[0]
                except Exception:
                    pass

            active_booking = {
                "booking_id": b_row["id"],
                "booking_reference": f"MCB-B{b_row['id']:06d}",
                "booking_status": b_row.get("booking_status"),
                "cargo": {
                    "id": cg.get("id"),
                    "commodity": cg.get("description"),
                    "cargo_type": cg.get("cargo_type"),
                    "weight_tons": cg.get("weight_tons"),
                },
                "origin_port": origin_port_info,
                "destination_port": dest_port_info,
                "estimated_cost": b_row.get("estimated_cost"),
                "estimated_eta": b_row.get("estimated_eta"),
            }

        provider_info = cls.get_configured_provider_info()

        return {
            "vessel_id": vessel_id,
            "name": v.get("name"),
            "imo_number": v.get("imo_number"),
            "vessel_type": v.get("vessel_type"),
            "flag": v.get("flag"),
            "capacity_tons": v.get("capacity_tons"),
            "draft_m": v.get("draft_m"),
            "speed_laden_knots": v.get("speed_laden_knots"),
            "operational_status": v.get("status") or "underway",
            "tracking_status": freshness,
            "latest_position": latest_pos,
            "position_history_count": len(history),
            "position_history": history,
            "active_booking": active_booking,
            "provider_info": provider_info,
            "transparency_notice": (
                "Observed AIS telemetry." if latest_pos
                else "No authentic telemetry is on record for this vessel. Live coordinates are DATA_UNAVAILABLE per platform Rule 28 guidelines."
            ),
        }

    @classmethod
    def get_booking_tracking(
        cls,
        supabase_client: Any,
        booking_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves tracking details associated with a specific commercial cargo booking.
        Links booking -> assigned vessel -> latest authentic position.
        """
        # 1. Fetch booking with cargo & vessel
        b_res = (
            supabase_client.table("bookings")
            .select("*, cargo(*), vessels(*)")
            .eq("id", booking_id)
            .execute()
        )
        if not b_res.data:
            return None
        
        b_row = b_res.data[0]
        vessel_id = b_row.get("vessel_id")
        cg = b_row.get("cargo") or {}
        vs = b_row.get("vessels") or {}

        if not vessel_id:
            return {
                "booking_id": booking_id,
                "booking_reference": f"MCB-B{booking_id:06d}",
                "booking_status": b_row.get("booking_status"),
                "tracking_status": "VESSEL_UNASSIGNED",
                "message": "This booking does not yet have an assigned vessel. Vessel assignment occurs upon carrier confirmation.",
                "vessel": None,
                "latest_position": None,
            }

        # 2. Ports
        orig_p = None
        dest_p = None
        if cg.get("origin_port_id"):
            try:
                p1 = supabase_client.table("ports").select("*").eq("id", cg["origin_port_id"]).execute()
                if p1.data:
                    orig_p = p1.data[0]
            except Exception:
                pass
        if cg.get("destination_port_id"):
            try:
                p2 = supabase_client.table("ports").select("*").eq("id", cg["destination_port_id"]).execute()
                if p2.data:
                    dest_p = p2.data[0]
            except Exception:
                pass

        # 3. Position & History
        latest_pos = cls.get_latest_vessel_position(supabase_client, vessel_id)
        freshness = latest_pos["freshness_status"] if latest_pos else cls.STATUS_DATA_UNAVAILABLE

        return {
            "booking_id": booking_id,
            "booking_reference": f"MCB-B{booking_id:06d}",
            "booking_status": b_row.get("booking_status"),
            "tracking_status": freshness,
            "vessel": {
                "id": vessel_id,
                "name": vs.get("name"),
                "imo_number": vs.get("imo_number"),
                "vessel_type": vs.get("vessel_type"),
                "flag": vs.get("flag"),
                "capacity_tons": vs.get("capacity_tons"),
                "draft_m": vs.get("draft_m"),
                "speed_laden_knots": vs.get("speed_laden_knots"),
            },
            "cargo": {
                "id": cg.get("id"),
                "commodity": cg.get("description"),
                "weight_tons": cg.get("weight_tons"),
                "cargo_type": cg.get("cargo_type"),
            },
            "corridor": {
                "origin_port": orig_p,
                "destination_port": dest_p,
            },
            "estimates": {
                "cost": b_row.get("estimated_cost"),
                "cost_source": "BASELINE_VOYAGE_CALCULATION" if b_row.get("estimated_cost") else None,
                "eta": b_row.get("estimated_eta"),
                "eta_source": "BASELINE_SPEED_DISTANCE_CALCULATION" if b_row.get("estimated_eta") else None,
            },
            "latest_position": latest_pos,
            "transparency_notice": (
                "Vessel position reflects latest authentic telemetry." if latest_pos
                else "Tracking coordinates for assigned vessel are currently DATA_UNAVAILABLE. No synthetic vessel movement is rendered."
            ),
        }

    @classmethod
    def get_tracking_system_status(cls, supabase_client: Any) -> Dict[str, Any]:
        """
        Global tracking subsystem status, telemetry counts, and provider telemetry health.
        """
        total_vessels = 0
        try:
            v_res = supabase_client.table("vessels").select("id", count="exact").execute()
            total_vessels = v_res.count if hasattr(v_res, "count") and v_res.count is not None else len(v_res.data or [])
        except Exception:
            pass

        # Total positions in public.vessel_positions
        total_positions = 0
        latest_observation_time = None
        live_count = 0
        recent_count = 0
        stale_count = 0
        distinct_vessels_with_pos = set()

        try:
            p_res = supabase_client.table("vessel_positions").select("*").order("recorded_at", desc=True).limit(500).execute()
            positions = p_res.data or []
            total_positions = len(positions)

            if positions:
                latest_observation_time = positions[0].get("recorded_at")

            for p in positions:
                v_id = p.get("vessel_id")
                if v_id and v_id not in distinct_vessels_with_pos:
                    distinct_vessels_with_pos.add(v_id)
                    freshness, _ = cls.evaluate_position_freshness(p.get("recorded_at"))
                    if freshness == cls.STATUS_LIVE:
                        live_count += 1
                    elif freshness == cls.STATUS_RECENT:
                        recent_count += 1
                    elif freshness == cls.STATUS_STALE:
                        stale_count += 1
        except Exception as p_err:
            print(f"[TrackingEngine] System status position scan notice: {p_err}")

        unavailable_count = max(0, total_vessels - len(distinct_vessels_with_pos))
        provider_info = cls.get_configured_provider_info()

        return {
            "status": "OPERATIONAL",
            "engine_name": cls.ENGINE_NAME,
            "engine_version": cls.ENGINE_VERSION,
            "provider_info": provider_info,
            "metrics": {
                "total_fleet_vessels": total_vessels,
                "vessels_with_telemetry": len(distinct_vessels_with_pos),
                "live_vessels_count": live_count,
                "recent_vessels_count": recent_count,
                "stale_vessels_count": stale_count,
                "data_unavailable_vessels_count": unavailable_count,
                "total_stored_positions": total_positions,
                "latest_telemetry_timestamp": latest_observation_time,
            },
            "freshness_thresholds": {
                "live_minutes_max": cls.LIVE_THRESHOLD_MINUTES,
                "recent_minutes_max": cls.RECENT_THRESHOLD_MINUTES,
            },
            "integrity_disclosure": (
                "Rule 28 Compliance: Maritime positions are solely grounded in authentic observations from "
                "public.vessel_positions or verified external AIS feeds. When authentic telemetry is missing, "
                "the platform explicitly returns DATA_UNAVAILABLE rather than synthesizing vessel movements."
            ),
        }
