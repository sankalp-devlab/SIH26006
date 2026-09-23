"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 18: Maritime Recommendation Engine

Intelligent, explainable Multi-Criteria Decision Analysis (MCDA) engine
that evaluates candidate vessel-route pairs for a proposed cargo shipment.

Integrates:
- Module 11 / 13: Authoritative Route Calculation & Canal Restrictions
- Module 12 / 14: Authoritative Baseline Voyage Cost Engine
- Module 13 / 15: Authoritative Baseline Sailing ETA Engine
- Module 17: Multi-factor Maritime Risk Assessment Engine
- Non-negotiable Rules 28 & 33: Explicit disclosure of DATA_UNAVAILABLE
  factors (zero synthetic ML, zero fabricated weather/congestion/costs).
"""

from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional, Tuple, Union

from route_engine import RouteEngine
from eta_engine import EtaEngine
from cost_engine import CostEngine
from risk_engine import RiskEngine


class RecommendationEngine:
    ENGINE_TYPE: str = "MULTI_CRITERIA_DECISION_ANALYSIS"
    ENGINE_VERSION: str = "1.0.0"

    # Canonical vessel classifications
    DRY_BULK_CLASSES = {
        "handysize", "supramax", "panamax", "capesize", "ultramax", "kamsarmax",
        "newcastlemax", "bulk carrier", "bulk", "dry bulk", "reference-handysize",
        "reference-supramax", "reference-panamax", "reference-capesize"
    }

    LIQUID_TANKER_CLASSES = {
        "vlcc", "suezmax", "aframax", "panamax tanker", "mr tanker", "lr1", "lr2",
        "product tanker", "crude oil tanker", "tanker", "chemical tanker", "oil tanker",
        "lng carrier", "lpg carrier", "liquid bulk", "crude tanker"
    }

    CONTAINER_CLASSES = {
        "container", "container ship", "feeder", "panamax container", "post-panamax", "ulcv", "boxship"
    }

    # Configurable weighting profiles
    PREFERENCE_WEIGHTS: Dict[str, Dict[str, float]] = {
        "balanced": {
            "capacity_fit": 0.30,
            "cost_efficiency": 0.30,
            "transit_speed": 0.20,
            "safety_risk": 0.20,
        },
        "lowest_cost": {
            "capacity_fit": 0.20,
            "cost_efficiency": 0.50,
            "transit_speed": 0.15,
            "safety_risk": 0.15,
        },
        "fastest_eta": {
            "capacity_fit": 0.20,
            "cost_efficiency": 0.20,
            "transit_speed": 0.45,
            "safety_risk": 0.15,
        },
        "lowest_risk": {
            "capacity_fit": 0.20,
            "cost_efficiency": 0.20,
            "transit_speed": 0.15,
            "safety_risk": 0.45,
        },
    }

    @classmethod
    def validate_vessel_cargo_compatibility(
        cls,
        vessel: Dict[str, Any],
        cargo: Dict[str, Any],
        route_data: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, List[str]]:
        """
        Evaluates strict hard eligibility constraints.
        Returns: (is_eligible, list_of_rejection_reasons)
        """
        rejection_reasons = []

        cargo_weight = float(cargo.get("weight_tons") or 0.0)
        vessel_capacity = float(vessel.get("capacity_tons") or 0.0)

        # 1. Capacity Overload Check
        if cargo_weight > vessel_capacity:
            overload_pct = round(((cargo_weight - vessel_capacity) / vessel_capacity) * 100.0, 1) if vessel_capacity > 0 else 100.0
            rejection_reasons.append(
                f"INSUFFICIENT_CAPACITY: Cargo payload ({cargo_weight:,.0f} MT) exceeds vessel deadweight capacity ({vessel_capacity:,.0f} MT) by {overload_pct}%. Structural loadline violation."
            )

        # 2. Severe Under-utilization Check (< 10% DWT)
        if vessel_capacity > 0 and (cargo_weight / vessel_capacity) < 0.10:
            rejection_reasons.append(
                f"GROSS_UNDERUTILIZATION: Payload ({cargo_weight:,.0f} MT) utilizes less than 10% of vessel capacity ({vessel_capacity:,.0f} MT). Ballast and stability constraints disqualify this pairing."
            )

        # 3. Cargo Type & Vessel Type Compatibility Check
        cargo_type = str(cargo.get("cargo_type") or "").strip().lower()
        cargo_desc = str(cargo.get("description") or "").strip().lower()
        vessel_type = str(vessel.get("vessel_type") or "").strip().lower()
        vessel_name = str(vessel.get("name") or "").strip().lower()
        certified_types = [ct.strip().lower() for ct in str(vessel.get("cargo_types") or "").split(",") if ct.strip()]

        is_dry_cargo = any(k in cargo_type or k in cargo_desc for k in [
            "dry", "bulk", "grain", "wheat", "coal", "ore", "iron ore", "bauxite", "petcoke", "steel", "scrap", "fertilizer", "cement"
        ])
        is_liquid_cargo = any(k in cargo_type or k in cargo_desc for k in [
            "liquid", "oil", "crude", "petroleum", "chemical", "tanker", "lng", "lpg"
        ])
        is_container_cargo = any(k in cargo_type or k in cargo_desc for k in [
            "container", "teu", "feu", "box"
        ])

        is_dry_vessel = any(vt in vessel_type or vt in vessel_name for vt in cls.DRY_BULK_CLASSES) or any("bulk" in ct or "grain" in ct or "coal" in ct or "ore" in ct for ct in certified_types)
        is_liquid_vessel = any(vt in vessel_type or vt in vessel_name for vt in cls.LIQUID_TANKER_CLASSES) or any("oil" in ct or "tanker" in ct or "chemical" in ct for ct in certified_types)
        is_container_vessel = any(vt in vessel_type or vt in vessel_name for vt in cls.CONTAINER_CLASSES)

        is_type_compatible = False

        # Specific certified commodities check against cargo description or type
        if certified_types:
            for ct in certified_types:
                if ct in cargo_type or ct in cargo_desc or any(w in cargo_desc for w in ct.split()):
                    is_type_compatible = True
                    break

        if not is_type_compatible:
            if is_dry_cargo and is_dry_vessel and not is_liquid_cargo:
                is_type_compatible = True
            elif is_liquid_cargo and is_liquid_vessel and not is_dry_cargo:
                is_type_compatible = True
            elif is_container_cargo and is_container_vessel:
                is_type_compatible = True
            elif not cargo_type and not cargo_desc:
                is_type_compatible = True

        if not is_type_compatible:
            rejection_reasons.append(
                f"CARGO_INCOMPATIBILITY: Vessel type '{vessel.get('vessel_type')}' (certified for: '{vessel.get('cargo_types') or 'N/A'}') cannot carry '{cargo.get('cargo_type') or cargo.get('description')}'. Specialized containment required."
            )

        # 4. Route Canal Draft Limitation Check
        vessel_draft = float(vessel.get("draft_m") or 11.5)
        if route_data:
            waypoints = route_data.get("waypoints") or []
            wp_ids = {wp.get("id") for wp in waypoints if isinstance(wp, dict)}
            
            # Suez Canal limit (20.1m)
            if any(k in wp_ids for k in ["wp-suez", "wp-suez-north", "wp-suez-south"]) and vessel_draft > 20.1:
                rejection_reasons.append(
                    f"CANAL_DRAFT_EXCEEDED: Vessel draft ({vessel_draft}m) exceeds Suez Canal maximum permissible limit (20.1m). Transit physically blocked without deepwater rerouting."
                )
            # Panama Canal limit (15.2m)
            if any(k in wp_ids for k in ["wp-panama", "wp-panama-carib", "wp-panama-pac"]) and vessel_draft > 15.2:
                rejection_reasons.append(
                    f"CANAL_DRAFT_EXCEEDED: Vessel draft ({vessel_draft}m) exceeds Panama Canal maximum permissible limit (15.2m). Transit physically blocked."
                )
            # Kiel Canal limit (9.5m)
            if "wp-kiel" in wp_ids and vessel_draft > 9.5:
                rejection_reasons.append(
                    f"CANAL_DRAFT_EXCEEDED: Vessel draft ({vessel_draft}m) exceeds Kiel Canal maximum permissible limit (9.5m). Transit physically blocked."
                )

        is_eligible = len(rejection_reasons) == 0
        return is_eligible, rejection_reasons

    @classmethod
    def evaluate_candidate_option(
        cls,
        vessel: Dict[str, Any],
        cargo: Dict[str, Any],
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        departure_time: Optional[Union[str, datetime]] = None,
        bunker_price_usd_per_mt: Optional[float] = None,
        daily_hire_usd: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates an individual vessel-route candidate against routing, ETA, cost, and risk.
        """
        # 1. Authoritative Route Calculation
        try:
            route_data = RouteEngine.calculate_route(
                origin_port=origin_port,
                dest_port=dest_port,
                vessel=vessel,
                cargo=cargo,
            )
        except Exception as route_err:
            return {
                "vessel": vessel,
                "is_eligible": False,
                "rejection_reasons": [f"ROUTE_CALCULATION_FAILED: {str(route_err)}"],
                "route": None,
                "eta": None,
                "cost": None,
                "risk": None,
            }

        # 2. Validate Hard Eligibility Constraints
        is_eligible, rejection_reasons = cls.validate_vessel_cargo_compatibility(
            vessel=vessel,
            cargo=cargo,
            route_data=route_data,
        )

        if not is_eligible:
            return {
                "vessel": vessel,
                "is_eligible": False,
                "rejection_reasons": rejection_reasons,
                "route": route_data,
                "eta": None,
                "cost": None,
                "risk": None,
            }

        # 3. Baseline Sailing ETA Calculation (Module 13 / 15)
        eta_result = EtaEngine.calculate_voyage_eta(
            vessel=vessel,
            route_data=route_data,
            cargo=cargo,
            departure_time_input=departure_time,
        )

        # 4. Baseline Voyage Cost Calculation (Module 12 / 14 / 16)
        effective_bunker_price = bunker_price_usd_per_mt if bunker_price_usd_per_mt is not None else 650.0
        cost_result = CostEngine.calculate_voyage_cost(
            vessel=vessel,
            route_data=route_data,
            origin_port=origin_port,
            dest_port=dest_port,
            cargo=cargo,
            bunker_price_usd_per_mt=effective_bunker_price,
            daily_hire_usd=daily_hire_usd,
        )

        # 5. Authoritative Maritime Risk Assessment (Module 17)
        risk_result = RiskEngine.assess_voyage_risk(
            vessel=vessel,
            route_data=route_data,
            origin_port=origin_port,
            dest_port=dest_port,
            cargo=cargo,
            departure_time=departure_time,
        )

        return {
            "vessel": vessel,
            "is_eligible": True,
            "rejection_reasons": [],
            "route": route_data,
            "eta": eta_result,
            "cost": cost_result,
            "risk": risk_result,
        }

    @classmethod
    def calculate_candidate_scores(
        cls,
        eligible_candidates: List[Dict[str, Any]],
        cargo: Dict[str, Any],
        preference: str = "balanced",
    ) -> List[Dict[str, Any]]:
        """
        Scores and ranks eligible candidate options across 4 transparent pillars.
        """
        if not eligible_candidates:
            return []

        weights = cls.PREFERENCE_WEIGHTS.get(preference, cls.PREFERENCE_WEIGHTS["balanced"])

        # Extract metric ranges across eligible candidates for relative normalization
        costs_per_ton = []
        for c in eligible_candidates:
            cost_obj = c.get("cost")
            if cost_obj:
                cpt = cost_obj.get("cost_per_tonne") or cost_obj.get("cost_per_ton_usd")
                if cpt is not None:
                    costs_per_ton.append(float(cpt))
        min_cost_per_ton = min(costs_per_ton) if costs_per_ton else 1.0

        durations_hrs = []
        for c in eligible_candidates:
            eta_obj = c.get("eta")
            if eta_obj:
                d_hrs = eta_obj.get("voyage_hours") or eta_obj.get("sailing_duration_hours")
                if d_hrs is not None:
                    durations_hrs.append(float(d_hrs))
        min_duration_hrs = min(durations_hrs) if durations_hrs else 1.0

        cargo_weight = float(cargo.get("weight_tons") or 0.0)

        scored_candidates = []
        for candidate in eligible_candidates:
            vessel = candidate["vessel"]
            vessel_dwt = float(vessel.get("capacity_tons") or 50000.0)
            utilization_pct = (cargo_weight / vessel_dwt) * 100.0 if vessel_dwt > 0 else 0.0

            # Pillar 1: Capacity Suitability Score (0-100)
            # Optimal sweet-spot: 75% to 95% DWT
            if 75.0 <= utilization_pct <= 95.0:
                capacity_score = 100.0
            elif 60.0 <= utilization_pct < 75.0:
                capacity_score = 85.0
            elif 95.0 < utilization_pct <= 100.0:
                capacity_score = 90.0  # Tight margin but fully legal
            elif 40.0 <= utilization_pct < 60.0:
                capacity_score = 70.0
            elif 20.0 <= utilization_pct < 40.0:
                capacity_score = 50.0
            else:
                capacity_score = 30.0

            # Pillar 2: Cost Efficiency Score (0-100)
            cost_obj = candidate.get("cost")
            cost_per_ton = (cost_obj.get("cost_per_tonne") or cost_obj.get("cost_per_ton_usd")) if cost_obj else None
            if cost_per_ton is not None and min_cost_per_ton > 0:
                cost_per_ton = float(cost_per_ton)
                cost_ratio = (cost_per_ton - min_cost_per_ton) / min_cost_per_ton
                cost_score = max(35.0, round(100.0 - (cost_ratio * 70.0), 1))
            else:
                cost_score = 60.0

            # Pillar 3: Transit Speed & ETA Timeliness Score (0-100)
            eta_obj = candidate.get("eta")
            duration_hrs = (eta_obj.get("voyage_hours") or eta_obj.get("sailing_duration_hours")) if eta_obj else None
            duration_days = (eta_obj.get("voyage_days") or eta_obj.get("sailing_duration_days")) if eta_obj else None
            if duration_hrs is not None and min_duration_hrs > 0:
                duration_hrs = float(duration_hrs)
                time_ratio = (duration_hrs - min_duration_hrs) / min_duration_hrs
                speed_score = max(40.0, round(100.0 - (time_ratio * 60.0), 1))
            else:
                speed_score = 65.0

            # Pillar 4: Safety & Risk Posture Score (0-100)
            overall_risk_score = candidate["risk"]["overall_risk"]["score"] if candidate.get("risk") else 25.0
            safety_score = max(0.0, round(100.0 - overall_risk_score, 1))

            # Composite Weighted Recommendation Score
            composite_score = round(
                (capacity_score * weights["capacity_fit"])
                + (cost_score * weights["cost_efficiency"])
                + (speed_score * weights["transit_speed"])
                + (safety_score * weights["safety_risk"]),
                1,
            )

            # Rating Tier
            if composite_score >= 88.0:
                score_tier = "EXCELLENT_FIT"
            elif composite_score >= 75.0:
                score_tier = "STRONG_FIT"
            elif composite_score >= 60.0:
                score_tier = "MODERATE_FIT"
            else:
                score_tier = "SUBOPTIMAL_FIT"

            candidate["score"] = composite_score
            candidate["score_tier"] = score_tier
            candidate["utilization_pct"] = round(utilization_pct, 1)
            candidate["score_breakdown"] = {
                "capacity_fit": {
                    "score": capacity_score,
                    "weight_pct": int(weights["capacity_fit"] * 100),
                    "metric": f"{utilization_pct:.1f}% DWT utilization",
                },
                "cost_efficiency": {
                    "score": cost_score,
                    "weight_pct": int(weights["cost_efficiency"] * 100),
                    "metric": f"${cost_per_ton:.2f}/MT" if cost_per_ton is not None else "Unpriced",
                },
                "transit_speed": {
                    "score": speed_score,
                    "weight_pct": int(weights["transit_speed"] * 100),
                    "metric": f"{duration_days} days" if duration_days is not None else "N/A",
                },
                "safety_risk": {
                    "score": safety_score,
                    "weight_pct": int(weights["safety_risk"] * 100),
                    "metric": f"{overall_risk_score}/100 Risk ({candidate['risk']['overall_risk']['level']})" if candidate.get("risk") else "N/A",
                },
            }
            scored_candidates.append(candidate)

        # Sort descending by composite score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)

        # Assign rankings
        for rank_idx, cand in enumerate(scored_candidates):
            cand["rank"] = rank_idx + 1

        return scored_candidates

    @classmethod
    def generate_recommendation_explanation(
        cls,
        primary_candidate: Dict[str, Any],
        alternatives: List[Dict[str, Any]],
        cargo: Dict[str, Any],
        preference: str = "balanced",
    ) -> Dict[str, Any]:
        """
        Produces clear, human-readable explainability text detailing why the top
        candidate was selected and noting key trade-offs with alternative options.
        """
        vessel = primary_candidate["vessel"]
        breakdown = primary_candidate["score_breakdown"]
        score = primary_candidate["score"]
        tier = primary_candidate["score_tier"].replace("_", " ")

        capacity_metric = breakdown["capacity_fit"]["metric"]
        cost_metric = breakdown["cost_efficiency"]["metric"]
        speed_metric = breakdown["transit_speed"]["metric"]
        safety_metric = breakdown["safety_risk"]["metric"]

        primary_rationale = (
            f"{vessel.get('name')} is recommended as the top match ({score}/100, {tier}) "
            f"under the {preference.replace('_', ' ').title()} optimization profile. "
            f"Key drivers: {capacity_metric}, competitive freight cost of {cost_metric}, "
            f"estimated baseline sailing duration of {speed_metric}, and a favorable safety posture ({safety_metric})."
        )

        trade_offs = []
        if alternatives:
            alt1 = alternatives[0]
            alt_vessel = alt1["vessel"]
            p_cost_obj = primary_candidate.get("cost") or {}
            a_cost_obj = alt1.get("cost") or {}
            p_cpt = p_cost_obj.get("cost_per_tonne") or p_cost_obj.get("cost_per_ton_usd") or 0.0
            a_cpt = a_cost_obj.get("cost_per_tonne") or a_cost_obj.get("cost_per_ton_usd") or 0.0
            cost_diff = float(a_cpt) - float(p_cpt)

            p_eta_obj = primary_candidate.get("eta") or {}
            a_eta_obj = alt1.get("eta") or {}
            p_days = p_eta_obj.get("voyage_days") or p_eta_obj.get("sailing_duration_days") or 0.0
            a_days = a_eta_obj.get("voyage_days") or a_eta_obj.get("sailing_duration_days") or 0.0
            time_diff = float(a_days) - float(p_days)

            if cost_diff > 0:
                pct = round((cost_diff / float(p_cpt)) * 100.0, 1) if float(p_cpt) > 0 else 0.0
                trade_offs.append(
                    f"Runner-up {alt_vessel.get('name')} (#{alt1['rank']}) costs ${abs(cost_diff):.2f}/MT more (+{pct}%)."
                )
            elif cost_diff < 0:
                trade_offs.append(
                    f"Runner-up {alt_vessel.get('name')} is ${abs(cost_diff):.2f}/MT cheaper but has lower overall composite score due to utilization or safety trade-offs."
                )

            if time_diff < 0:
                trade_offs.append(
                    f"{alt_vessel.get('name')} delivers {abs(time_diff):.1f} days faster but has higher freight dues."
                )
            elif time_diff > 0:
                trade_offs.append(
                    f"{alt_vessel.get('name')} requires {abs(time_diff):.1f} additional days transit."
                )

        return {
            "primary_rationale": primary_rationale,
            "trade_offs": trade_offs,
            "decision_rule": f"Multi-Factor Scoring (Capacity {breakdown['capacity_fit']['weight_pct']}%, Cost {breakdown['cost_efficiency']['weight_pct']}%, Speed {breakdown['transit_speed']['weight_pct']}%, Safety {breakdown['safety_risk']['weight_pct']}%)",
        }

    @classmethod
    def generate_recommendations(
        cls,
        cargo: Dict[str, Any],
        vessels: List[Dict[str, Any]],
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        departure_time: Optional[Union[str, datetime]] = None,
        bunker_price_usd_per_mt: Optional[float] = None,
        daily_hire_usd: Optional[float] = None,
        preference: str = "balanced",
    ) -> Dict[str, Any]:
        """
        Orchestrates end-to-end recommendation workflow:
        1. Evaluates all candidate vessels.
        2. Filters eligible options vs rejected options.
        3. Ranks and scores eligible options across multi-criteria pillars.
        4. Synthesizes explainability rationale.
        5. Discloses authentic data limitations.
        """
        start_time = time.time()
        candidate_evaluations = []

        for vessel in vessels:
            evaluation = cls.evaluate_candidate_option(
                vessel=vessel,
                cargo=cargo,
                origin_port=origin_port,
                dest_port=dest_port,
                departure_time=departure_time,
                bunker_price_usd_per_mt=bunker_price_usd_per_mt,
                daily_hire_usd=daily_hire_usd,
            )
            candidate_evaluations.append(evaluation)

        eligible_raw = [c for c in candidate_evaluations if c["is_eligible"]]
        rejected_raw = [c for c in candidate_evaluations if not c["is_eligible"]]

        # Clean rejected candidates summary
        rejected_candidates = []
        for r in rejected_raw:
            rejected_candidates.append({
                "vessel_id": r["vessel"].get("id"),
                "vessel_name": r["vessel"].get("name"),
                "vessel_type": r["vessel"].get("vessel_type"),
                "capacity_tons": r["vessel"].get("capacity_tons"),
                "draft_m": r["vessel"].get("draft_m"),
                "rejection_reasons": r["rejection_reasons"],
            })

        # Score & rank eligible candidates
        ranked_candidates = cls.calculate_candidate_scores(
            eligible_candidates=eligible_raw,
            cargo=cargo,
            preference=preference,
        )

        has_eligible = len(ranked_candidates) > 0
        primary_match = ranked_candidates[0] if has_eligible else None
        alternatives = ranked_candidates[1:] if has_eligible and len(ranked_candidates) > 1 else []

        # Explainability
        explanation = (
            cls.generate_recommendation_explanation(
                primary_candidate=primary_match,
                alternatives=alternatives,
                cargo=cargo,
                preference=preference,
            )
            if primary_match
            else {
                "primary_rationale": "No candidate vessels in the registered fleet meet the hard compatibility requirements for this consignment.",
                "trade_offs": [],
                "decision_rule": "Strict Hard Eligibility Constraints (Deadweight Capacity, Vessel Type Certification, Canal Draft)",
            }
        )

        # Unique recommendation identifier
        cargo_id_tag = cargo.get("id") or "adhoc"
        origin_tag = origin_port.get("id") or origin_port.get("unlocode") or "orig"
        dest_tag = dest_port.get("id") or dest_port.get("unlocode") or "dest"
        rec_id = f"rec-{cargo_id_tag}-{origin_tag}-{dest_tag}-{int(time.time())}"

        # Standardized Data Integrity Disclosures (Rules 28 & 33)
        disclosures = [
            "ETA and voyage duration estimates are authoritative deterministic nautical baselines. Downstream XGBoost ML ETA models remain PENDING historical voyage dataset upload.",
            "Voyage costs and bunker consumption are authoritative engineering baseline calculations. Downstream XGBoost ML Cost models remain PENDING historical settlement dataset upload.",
            "Weather routing, ocean swells, and dynamic port queue congestion are explicitly reported as DATA_UNAVAILABLE in strict accordance with platform authenticity standards.",
            "Real-time chartering commercial availability is currently DATA_UNAVAILABLE in the platform; all registered fleet vessels are screened for engineering and nautical compatibility.",
        ]

        # Format primary recommendation payload
        recommended_vessel_payload = None
        recommended_route_payload = None
        if primary_match:
            v_obj = primary_match["vessel"]
            r_obj = primary_match["route"]

            recommended_vessel_payload = {
                "vessel_id": v_obj.get("id"),
                "name": v_obj.get("name"),
                "vessel_type": v_obj.get("vessel_type"),
                "capacity_tons": v_obj.get("capacity_tons"),
                "draft_m": v_obj.get("draft_m"),
                "speed_knots": v_obj.get("speed_laden_knots") or v_obj.get("speed_ballast_knots") or 14.0,
                "flag": v_obj.get("flag") or "International",
                "utilization_pct": primary_match["utilization_pct"],
                "recommendation_score": primary_match["score"],
                "score_tier": primary_match["score_tier"],
                "rank": 1,
            }

            recommended_route_payload = {
                "route_id": r_obj.get("id") or r_obj.get("route_id"),
                "distance_nm": r_obj.get("distance_nm"),
                "distance_km": r_obj.get("distance_km"),
                "route_type": r_obj.get("route_type"),
                "origin_port": origin_port.get("name"),
                "destination_port": dest_port.get("name"),
                "waypoints_count": len(r_obj.get("waypoints") or []),
                "restrictions": r_obj.get("restrictions") or [],
            }

        # Format alternative candidates
        formatted_alternatives = []
        for alt in alternatives:
            v_obj = alt["vessel"]
            r_obj = alt["route"]
            alt_eta = alt.get("eta") or {}
            alt_cost = alt.get("cost") or {}
            alt_risk = alt.get("risk") or {}

            formatted_alternatives.append({
                "rank": alt["rank"],
                "vessel_id": v_obj.get("id"),
                "vessel_name": v_obj.get("name"),
                "vessel_type": v_obj.get("vessel_type"),
                "capacity_tons": v_obj.get("capacity_tons"),
                "draft_m": v_obj.get("draft_m"),
                "utilization_pct": alt["utilization_pct"],
                "recommendation_score": alt["score"],
                "score_tier": alt["score_tier"],
                "distance_nm": r_obj.get("distance_nm") if r_obj else None,
                "sailing_days": alt_eta.get("voyage_days") or alt_eta.get("sailing_duration_days"),
                "cost_usd": alt_cost.get("total_cost") or alt_cost.get("total_cost_usd"),
                "cost_per_ton_usd": alt_cost.get("cost_per_tonne") or alt_cost.get("cost_per_ton_usd"),
                "risk_score": alt_risk.get("overall_risk", {}).get("score") if alt_risk else None,
                "risk_level": alt_risk.get("overall_risk", {}).get("level") if alt_risk else None,
                "score_breakdown": alt["score_breakdown"],
            })

        return {
            "status": "success" if has_eligible else "no_eligible_vessels",
            "recommendation_id": rec_id,
            "engine": {
                "name": "Module 18 Maritime Recommendation Engine",
                "type": cls.ENGINE_TYPE,
                "version": cls.ENGINE_VERSION,
                "optimization_preference": preference,
            },
            "shipment_details": {
                "cargo_id": cargo.get("id"),
                "cargo_description": cargo.get("description") or "Bulk Consignment",
                "cargo_type": cargo.get("cargo_type") or "General Dry Bulk",
                "weight_tons": cargo.get("weight_tons"),
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
                "ready_date": cargo.get("ready_date") or departure_time or datetime.now(timezone.utc).isoformat(),
            },
            "has_eligible_vessels": has_eligible,
            "total_candidates_screened": len(vessels),
            "eligible_candidates_count": len(ranked_candidates),
            "rejected_candidates_count": len(rejected_candidates),
            "recommended_vessel": recommended_vessel_payload,
            "recommended_route": recommended_route_payload,
            "estimates": {
                "eta": primary_match["eta"] if primary_match else None,
                "cost": primary_match["cost"] if primary_match else None,
                "risk": primary_match["risk"] if primary_match else None,
                "eta_source": "BASELINE_NAUTICAL_CALCULATION (Module 13)",
                "cost_source": "BASELINE_VOYAGE_CALCULATION (Module 12)",
                "risk_source": "RULE_BASED_MARITIME_RISK (Module 17)",
            },
            "score_breakdown": primary_match["score_breakdown"] if primary_match else None,
            "explanation": explanation,
            "alternative_options": formatted_alternatives,
            "rejected_candidates": rejected_candidates,
            "disclosures": disclosures,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "execution_ms": round((time.time() - start_time) * 1000.0, 2),
        }
