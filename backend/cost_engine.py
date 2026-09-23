"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 12 — Voyage Cost Calculation Engine

Computes the estimated cost of transporting selected cargo using an
eligible vessel over a calculated maritime route corridor, based strictly
on authoritative data from the database and verified operational inputs.

NO fake fuel prices, NO fake vessel operating costs, NO fake port charges,
NO fake distances, and NO invented currencies.
"""

from datetime import datetime, timezone
import math
from typing import Any, Dict, List, Optional, Union


class CostEngine:
    KM_PER_NM = 1.852
    CURRENCY = "USD"

    @classmethod
    def calculate_voyage_cost(
        cls,
        vessel: Dict[str, Any],
        route_data: Dict[str, Any],
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
        bunker_price_usd_per_mt: Optional[float] = None,
        daily_hire_usd: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes transparent, authoritative voyage cost calculation.

        Parameters:
        - vessel: Authoritative vessel record from Supabase 'vessels' table.
        - route_data: Route dict from Module 11 RouteEngine or 'routes' table record.
        - origin_port: Origin port record from 'ports' table.
        - dest_port: Destination port record from 'ports' table.
        - cargo: Optional cargo record from 'cargo' table.
        - bunker_price_usd_per_mt: Optional explicit empirical bunker quote for scenario modeling.
        - daily_hire_usd: Optional explicit empirical vessel daily hire rate for scenario modeling.

        Returns:
        Structured CostCalculationResponse dictionary.
        """
        now_iso = datetime.now(timezone.utc).isoformat()

        # --------------------------------------------------
        # 1. ROUTE DISTANCE EXTRACTION & VALIDATION
        # --------------------------------------------------
        distance_nm: Optional[float] = None
        distance_km: Optional[float] = None

        if "distance_nm" in route_data and route_data["distance_nm"] is not None:
            distance_nm = float(route_data["distance_nm"])
            distance_km = float(route_data.get("distance_km") or (distance_nm * cls.KM_PER_NM))
        elif "distance_km" in route_data and route_data["distance_km"] is not None:
            distance_km = float(route_data["distance_km"])
            distance_nm = distance_km / cls.KM_PER_NM
        else:
            raise ValueError("Route distance is missing or invalid in route data.")

        if distance_nm <= 0:
            raise ValueError("Route distance must be a positive non-zero value.")

        distance_nm = round(distance_nm, 1)
        distance_km = round(distance_km, 1)

        # --------------------------------------------------
        # 2. VESSEL SPEED & TRANSIT DURATION
        # --------------------------------------------------
        # Vessel speed from database: speed_laden_knots, fallback to speed_ballast_knots
        speed_knots = vessel.get("speed_laden_knots")
        speed_laden_used = True
        if speed_knots is None or speed_knots <= 0:
            speed_knots = vessel.get("speed_ballast_knots")
            speed_laden_used = False

        if speed_knots is None or speed_knots <= 0:
            raise ValueError(f"Vessel '{vessel.get('name')}' (ID #{vessel.get('id')}) has no operational speed data.")

        speed_knots = float(speed_knots)

        # voyage_hours = distance_nm / vessel_speed
        voyage_hours = round(distance_nm / speed_knots, 2)
        voyage_days = round(voyage_hours / 24.0, 2)

        # --------------------------------------------------
        # 3. FUEL CONSUMPTION CALCULATION
        # --------------------------------------------------
        fuel_rate_mt_day = vessel.get("fuel_laden_mt_day")
        fuel_rate_laden_used = True
        if fuel_rate_mt_day is None or fuel_rate_mt_day <= 0:
            fuel_rate_mt_day = vessel.get("fuel_ballast_mt_day")
            fuel_rate_laden_used = False

        fuel_consumed_mt: Optional[float] = None
        if fuel_rate_mt_day is not None and fuel_rate_mt_day > 0:
            fuel_rate_mt_day = float(fuel_rate_mt_day)
            fuel_consumed_mt = round(voyage_days * fuel_rate_mt_day, 2)

        # --------------------------------------------------
        # 4. CARGO WEIGHT & CAPACITY UTILIZATION
        # --------------------------------------------------
        cargo_weight_tons: Optional[float] = None
        cargo_volume_m3: Optional[float] = None
        cargo_type: Optional[str] = None
        capacity_utilization_pct: Optional[float] = None

        if cargo:
            cargo_weight_tons = cargo.get("weight_tons")
            cargo_volume_m3 = cargo.get("volume_m3")
            cargo_type = cargo.get("cargo_type")

            vessel_capacity = vessel.get("capacity_tons")
            if cargo_weight_tons is not None and vessel_capacity is not None and vessel_capacity > 0:
                capacity_utilization_pct = round((float(cargo_weight_tons) / float(vessel_capacity)) * 100.0, 1)

        # --------------------------------------------------
        # 5. COST COMPONENT EVALUATION (STRICT NO-FAKE RULE)
        # --------------------------------------------------
        # Component A: Fuel Cost
        fuel_cost: Optional[float] = None
        fuel_cost_status: str = "unavailable"
        fuel_cost_details: Dict[str, Any] = {}

        if fuel_consumed_mt is not None:
            # Check for authoritative price or explicit scenario input
            price_per_mt = bunker_price_usd_per_mt
            price_source = "user_scenario_input" if bunker_price_usd_per_mt is not None else None

            if price_per_mt is None:
                # Check if vessel or database has a fuel_price field
                if "fuel_price_usd_per_mt" in vessel and vessel["fuel_price_usd_per_mt"]:
                    price_per_mt = float(vessel["fuel_price_usd_per_mt"])
                    price_source = "vessel_record"

            if price_per_mt is not None and price_per_mt > 0:
                fuel_cost = round(fuel_consumed_mt * price_per_mt, 2)
                fuel_cost_status = "calculated"
                fuel_cost_details = {
                    "fuel_consumed_mt": fuel_consumed_mt,
                    "fuel_price_usd_per_mt": price_per_mt,
                    "price_source": price_source,
                    "daily_burn_mt": fuel_rate_mt_day,
                    "formula": f"{fuel_consumed_mt} MT × ${price_per_mt}/MT = ${fuel_cost:,.2f}",
                }
            else:
                fuel_cost_status = "unavailable"
                fuel_cost_details = {
                    "fuel_consumed_mt": fuel_consumed_mt,
                    "fuel_price_usd_per_mt": None,
                    "daily_burn_mt": fuel_rate_mt_day,
                    "reason": "Bunker fuel pricing is not available in the database. Physical fuel consumption calculated.",
                }
        else:
            fuel_cost_status = "unavailable"
            fuel_cost_details = {
                "reason": "Vessel fuel consumption rate is not specified in the database record.",
            }

        # Component B: Vessel Operating Cost
        operating_cost: Optional[float] = None
        operating_cost_status: str = "unavailable"
        operating_cost_details: Dict[str, Any] = {}

        daily_rate = daily_hire_usd
        rate_source = "user_scenario_input" if daily_hire_usd is not None else None

        if daily_rate is None:
            if "daily_operating_cost" in vessel and vessel["daily_operating_cost"]:
                daily_rate = float(vessel["daily_operating_cost"])
                rate_source = "vessel_record"
            elif "charter_rate_usd_day" in vessel and vessel["charter_rate_usd_day"]:
                daily_rate = float(vessel["charter_rate_usd_day"])
                rate_source = "vessel_record"

        if daily_rate is not None and daily_rate > 0:
            operating_cost = round(voyage_days * daily_rate, 2)
            operating_cost_status = "calculated"
            operating_cost_details = {
                "daily_rate_usd": daily_rate,
                "voyage_days": voyage_days,
                "rate_source": rate_source,
                "formula": f"{voyage_days} days × ${daily_rate}/day = ${operating_cost:,.2f}",
            }
        else:
            operating_cost_status = "unavailable"
            operating_cost_details = {
                "voyage_days": voyage_days,
                "daily_rate_usd": None,
                "reason": "Vessel daily operating cost (OPEX/daily charter hire) is not available in the database.",
            }

        # Component C: Port Costs
        # Check if origin_port or dest_port have port fees in DB
        origin_port_cost: Optional[float] = None
        dest_port_cost: Optional[float] = None
        port_cost: Optional[float] = None
        port_cost_status: str = "unavailable"
        port_cost_details: Dict[str, Any] = {
            "origin_port": origin_port.get("name"),
            "destination_port": dest_port.get("name"),
            "reason": "Port tariffs, berthing dues, and terminal handling charges are not available in the port dataset.",
        }

        # Component D: Other Verified Costs (Canals, Insurance, Agency)
        other_cost: Optional[float] = None
        other_cost_status: str = "unavailable"
        other_cost_details: Dict[str, Any] = {
            "reason": "Additional voyage fees (canal transit tolls, maritime insurance, brokerage) are not recorded in project data.",
        }

        # --------------------------------------------------
        # 6. TOTAL COST & COST PER TONNE
        # --------------------------------------------------
        calculated_components = []
        if fuel_cost is not None:
            calculated_components.append(fuel_cost)
        if operating_cost is not None:
            calculated_components.append(operating_cost)
        if port_cost is not None:
            calculated_components.append(port_cost)
        if other_cost is not None:
            calculated_components.append(other_cost)

        total_cost: Optional[float] = round(sum(calculated_components), 2) if calculated_components else None

        cost_per_tonne: Optional[float] = None
        if total_cost is not None and cargo_weight_tons is not None and float(cargo_weight_tons) > 0:
            cost_per_tonne = round(total_cost / float(cargo_weight_tons), 2)

        # --------------------------------------------------
        # 7. COST CONFIDENCE / DATA COMPLETENESS
        # --------------------------------------------------
        # If all components are calculated -> complete
        # If at least one calculated, but others missing -> partial
        # If no monetary component could be calculated -> partial (physical metrics available)
        if (
            fuel_cost_status == "calculated"
            and operating_cost_status == "calculated"
            and port_cost_status == "calculated"
        ):
            cost_status = "complete"
        elif calculated_components:
            cost_status = "partial"
        else:
            cost_status = "partial"  # Physical metrics calculated, monetary inputs unavailable

        # --------------------------------------------------
        # 8. RESPONSE CONSTRUCTION
        # --------------------------------------------------
        vessel_id = vessel.get("id")
        cargo_id = cargo.get("id") if cargo else None
        route_id = route_data.get("id") or route_data.get("db_route_id") or route_data.get("route_id")
        cost_id = f"cst-{cargo_id or 'nocargo'}-{vessel_id}-{route_id or 'custom'}"

        return {
            "cost_id": str(cost_id),
            "cargo_id": cargo_id,
            "vessel_id": vessel_id,
            "route_id": route_id,
            "origin_port_id": origin_port.get("id"),
            "destination_port_id": dest_port.get("id"),
            "origin_port": {
                "id": origin_port.get("id"),
                "name": origin_port.get("name"),
                "country": origin_port.get("country"),
                "unlocode": origin_port.get("unlocode"),
            },
            "destination_port": {
                "id": dest_port.get("id"),
                "name": dest_port.get("name"),
                "country": dest_port.get("country"),
                "unlocode": dest_port.get("unlocode"),
            },
            "vessel": {
                "id": vessel.get("id"),
                "name": vessel.get("name"),
                "vessel_type": vessel.get("vessel_type"),
                "capacity_tons": vessel.get("capacity_tons"),
                "speed_laden_knots": vessel.get("speed_laden_knots"),
                "speed_ballast_knots": vessel.get("speed_ballast_knots"),
                "fuel_laden_mt_day": vessel.get("fuel_laden_mt_day"),
                "draft_m": vessel.get("draft_m"),
            },
            "cargo": {
                "id": cargo.get("id"),
                "cargo_type": cargo.get("cargo_type"),
                "description": cargo.get("description"),
                "weight_tons": cargo_weight_tons,
                "volume_m3": cargo_volume_m3,
            } if cargo else None,
            "transit_metrics": {
                "distance_nm": distance_nm,
                "distance_km": distance_km,
                "speed_knots": speed_knots,
                "speed_type": "laden" if speed_laden_used else "ballast",
                "voyage_hours": voyage_hours,
                "voyage_days": voyage_days,
                "fuel_consumed_mt": fuel_consumed_mt,
                "fuel_rate_mt_day": fuel_rate_mt_day,
                "cargo_weight_tons": cargo_weight_tons,
                "capacity_utilization_pct": capacity_utilization_pct,
            },
            "fuel_cost": fuel_cost,
            "fuel_cost_status": fuel_cost_status,
            "fuel_cost_details": fuel_cost_details,
            "operating_cost": operating_cost,
            "operating_cost_status": operating_cost_status,
            "operating_cost_details": operating_cost_details,
            "origin_port_cost": origin_port_cost,
            "destination_port_cost": dest_port_cost,
            "port_cost": port_cost,
            "port_cost_status": port_cost_status,
            "port_cost_details": port_cost_details,
            "other_cost": other_cost,
            "other_cost_status": other_cost_status,
            "other_cost_details": other_cost_details,
            "total_cost": total_cost,
            "cost_per_tonne": cost_per_tonne,
            "currency": cls.CURRENCY,
            "cost_status": cost_status,
            "data_completeness": {
                "route_distance": True,
                "vessel_speed": True,
                "voyage_duration": True,
                "fuel_consumption_rate": fuel_rate_mt_day is not None,
                "fuel_price": fuel_cost_status == "calculated",
                "operating_cost": operating_cost_status == "calculated",
                "port_charges": port_cost_status == "calculated",
                "other_fees": other_cost_status == "calculated",
            },
            "breakdown": [
                {
                    "item": "Bunker Fuel Cost",
                    "amount": fuel_cost,
                    "currency": cls.CURRENCY,
                    "status": fuel_cost_status,
                    "description": (
                        f"{fuel_consumed_mt} MT fuel burn"
                        if fuel_cost_status == "unavailable"
                        else fuel_cost_details.get("formula", "")
                    ),
                },
                {
                    "item": "Vessel Operating Cost",
                    "amount": operating_cost,
                    "currency": cls.CURRENCY,
                    "status": operating_cost_status,
                    "description": (
                        f"{voyage_days} voyage days"
                        if operating_cost_status == "unavailable"
                        else operating_cost_details.get("formula", "")
                    ),
                },
                {
                    "item": "Port & Cargo Handling Tariffs",
                    "amount": port_cost,
                    "currency": cls.CURRENCY,
                    "status": port_cost_status,
                    "description": "Port dues & stevedoring tariffs (unavailable in Pub150)",
                },
                {
                    "item": "Canal Tolls & Miscellaneous Voyage Costs",
                    "amount": other_cost,
                    "currency": cls.CURRENCY,
                    "status": other_cost_status,
                    "description": "Canal passage tolls and voyage insurance",
                },
            ],
            "calculation_metadata": {
                "engine_version": "1.0.0",
                "module": "MODULE_12_COST_CALCULATION",
                "calculated_at": now_iso,
                "formula_summary": "TOTAL = Fuel Cost + Operating Cost + Port Cost + Other Verified Costs",
            },
        }
