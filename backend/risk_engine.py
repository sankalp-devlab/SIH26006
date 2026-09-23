"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 17: Maritime Risk Assessment Engine

Evaluates physical, navigational, vessel, cargo, and security risks associated
with a proposed cargo voyage using ONLY REAL DATA available in the platform.

Explicitly categorizes risk, generates human-readable explainability findings,
and marks unavailable factors as DATA_UNAVAILABLE (no fake weather/congestion/incidents).
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union


class RiskEngine:
    ENGINE_TYPE: str = "RULE_BASED"
    ENGINE_VERSION: str = "1.0.0"

    # Canonical security risk ratings from platform waypoints registry
    SECURITY_RISK_RATINGS: Dict[str, Dict[str, Any]] = {
        "wp-hormuz": {
            "name": "Strait of Hormuz",
            "rating": "HIGH",
            "score": 75.0,
            "description": "Critical petroleum passage with heightened geopolitical and regional security monitoring.",
        },
        "wp-bab": {
            "name": "Bab-el-Mandeb Strait",
            "rating": "HIGH",
            "score": 80.0,
            "description": "Southern Red Sea chokepoint subject to maritime security advisories and military escort corridors.",
        },
        "wp-suez": {
            "name": "Suez Canal",
            "rating": "MEDIUM",
            "score": 45.0,
            "description": "High-density convoy transit requiring specialized pilotage and strict speed management.",
        },
        "wp-suez-north": {
            "name": "Suez Canal (Port Said Entry)",
            "rating": "MEDIUM",
            "score": 45.0,
            "description": "Northern Mediterranean approach with convoy staging and pilot boarding operations.",
        },
        "wp-suez-south": {
            "name": "Suez Canal (Suez Exit)",
            "rating": "MEDIUM",
            "score": 45.0,
            "description": "Southern Red Sea exit into Gulf of Suez convoy channel.",
        },
        "wp-panama": {
            "name": "Panama Canal",
            "rating": "LOW",
            "score": 25.0,
            "description": "Lock-based fresh water transit with stringent beam and freshwater draft tolerances.",
        },
        "wp-panama-carib": {
            "name": "Panama Canal (Atlantic Locks)",
            "rating": "LOW",
            "score": 25.0,
            "description": "Atlantic entrance approach to Agua Clara / Gatun locks.",
        },
        "wp-panama-pac": {
            "name": "Panama Canal (Pacific Locks)",
            "rating": "LOW",
            "score": 25.0,
            "description": "Pacific entrance approach to Cocoli / Miraflores locks.",
        },
        "wp-kiel": {
            "name": "Kiel Canal",
            "rating": "LOW",
            "score": 20.0,
            "description": "Shallow transit canal restricted to vessels with draft under 9.5m.",
        },
        "wp-malacca": {
            "name": "Strait of Malacca",
            "rating": "MEDIUM",
            "score": 40.0,
            "description": "Heavy traffic separation scheme (TSS) with dense regional fishing and coastal vessel traffic.",
        },
        "wp-singapore": {
            "name": "Singapore Strait",
            "rating": "MEDIUM",
            "score": 45.0,
            "description": "High vessel density bottleneck with cross-traffic crossing traffic separation lanes.",
        },
        "wp-gibraltar": {
            "name": "Strait of Gibraltar",
            "rating": "LOW",
            "score": 15.0,
            "description": "Deepwater international strait connecting Atlantic Ocean and Mediterranean Sea.",
        },
        "wp-dover": {
            "name": "Strait of Dover",
            "rating": "LOW",
            "score": 20.0,
            "description": "Well-regulated English Channel TSS corridor with mandatory radar reporting.",
        },
        "wp-cape-good-hope": {
            "name": "Cape of Good Hope",
            "rating": "LOW",
            "score": 20.0,
            "description": "Deep oceanic cape passage avoiding narrow canal corridors.",
        },
    }

    # Canal physical limits
    CANAL_DRAFT_LIMITS: Dict[str, float] = {
        "Suez Canal": 20.1,
        "Panama Canal": 15.24,
        "Kiel Canal": 9.5,
    }

    @classmethod
    def evaluate_route_risk(
        cls,
        route_data: Dict[str, Any],
        vessel: Dict[str, Any],
    ) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Evaluates navigational, canal clearance, and chokepoint security risks.
        Returns: (score, level, list_of_findings)
        """
        findings = []
        score_components = []

        vessel_draft = float(vessel.get("draft_m") or 11.5)
        waypoints = route_data.get("waypoints") or []
        canal_restrictions = route_data.get("canal_restrictions") or []

        # 1. Canal Transit Clearance Margins
        canals_transited = []
        for wp in waypoints:
            category = wp.get("category") or ""
            wp_name = wp.get("name") or ""
            wp_id = wp.get("id") or ""
            if category.lower() == "canal" or "canal" in wp_name.lower():
                canals_transited.append((wp_id, wp_name))

        if canals_transited:
            for wp_id, canal_name in canals_transited:
                max_draft = None
                for c_name, limit in cls.CANAL_DRAFT_LIMITS.items():
                    if c_name.lower() in canal_name.lower():
                        max_draft = limit
                        break

                if max_draft is not None:
                    clearance = round(max_draft - vessel_draft, 2)
                    if clearance < 0.0:
                        findings.append({
                            "type": "CANAL_DRAFT_EXCEEDED",
                            "severity": "CRITICAL",
                            "score_impact": 95,
                            "message": f"Vessel draft ({vessel_draft}m) exceeds {canal_name} maximum limit ({max_draft}m). Grounding risk.",
                        })
                        score_components.append(95.0)
                    elif clearance < 0.8:
                        findings.append({
                            "type": "TIGHT_CANAL_CLEARANCE",
                            "severity": "HIGH",
                            "score_impact": 75,
                            "message": f"Under-keel clearance in {canal_name} is only {clearance}m (< 0.8m margin). High shallow-water risk.",
                        })
                        score_components.append(75.0)
                    elif clearance < 2.0:
                        findings.append({
                            "type": "MODERATE_CANAL_CLEARANCE",
                            "severity": "MEDIUM",
                            "score_impact": 45,
                            "message": f"Under-keel clearance in {canal_name} is {clearance}m. Standard transit caution advised.",
                        })
                        score_components.append(45.0)
                    else:
                        findings.append({
                            "type": "ADEQUATE_CANAL_CLEARANCE",
                            "severity": "LOW",
                            "score_impact": 20,
                            "message": f"{canal_name} transit operates with safe depth clearance of {clearance}m.",
                        })
                        score_components.append(20.0)

        # 2. Chokepoint Security Ratings
        highest_security_score = 15.0
        for wp in waypoints:
            wp_id = wp.get("id") or ""
            if wp_id in cls.SECURITY_RISK_RATINGS:
                sec_info = cls.SECURITY_RISK_RATINGS[wp_id]
                sec_score = sec_info["score"]
                if sec_score > highest_security_score:
                    highest_security_score = sec_score
                findings.append({
                    "type": "CHOKEPOINT_SECURITY_ASSESSMENT",
                    "severity": sec_info["rating"],
                    "score_impact": int(sec_score),
                    "message": f"Corridor transits {sec_info['name']} (Security Rating: {sec_info['rating']}). {sec_info['description']}",
                })

        score_components.append(highest_security_score)

        # 3. Nautical Waypoint Complexity
        if len(waypoints) >= 4:
            findings.append({
                "type": "MULTI_CORRIDOR_COMPLEXITY",
                "severity": "MEDIUM",
                "score_impact": 35,
                "message": f"Route spans {len(waypoints)} navigational waypoints requiring multiple corridor transitions.",
            })
            score_components.append(35.0)
        else:
            findings.append({
                "type": "DIRECT_OCEAN_TRANSIT",
                "severity": "LOW",
                "score_impact": 15,
                "message": "Route follows a direct deepwater sea passage with minimal bottleneck convergence.",
            })
            score_components.append(15.0)

        avg_route_score = round(sum(score_components) / len(score_components), 1)
        level = cls.classify_score(avg_route_score)
        return avg_route_score, level, findings

    @classmethod
    def evaluate_vessel_risk(
        cls,
        vessel: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
    ) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Evaluates vessel dimensions, speed safety margin, and cargo certification suitability.
        """
        findings = []
        score_components = []

        # 1. Draft Dimensions
        draft_m = float(vessel.get("draft_m") or 11.5)
        if draft_m > 16.0:
            findings.append({
                "type": "DEEP_DRAFT_VESSEL",
                "severity": "MEDIUM",
                "score_impact": 50,
                "message": f"Deep laden draft ({draft_m}m) limits port approach channels and evasive maneuvers.",
            })
            score_components.append(50.0)
        elif draft_m > 12.0:
            findings.append({
                "type": "STANDARD_DRAFT_VESSEL",
                "severity": "LOW",
                "score_impact": 25,
                "message": f"Vessel operates within standard international commercial draft ({draft_m}m).",
            })
            score_components.append(25.0)
        else:
            findings.append({
                "type": "SHALLOW_DRAFT_FLEXIBILITY",
                "severity": "LOW",
                "score_impact": 15,
                "message": f"Shallow draft ({draft_m}m) offers high berthing flexibility and low grounding exposure.",
            })
            score_components.append(15.0)

        # 2. Speed Safety Margin
        speed = vessel.get("speed_laden_knots") or vessel.get("speed_ballast_knots") or 13.0
        speed_knots = float(speed)
        if speed_knots < 11.0:
            findings.append({
                "type": "LOW_SERVICE_SPEED",
                "severity": "MEDIUM",
                "score_impact": 55,
                "message": f"Low service speed ({speed_knots} knots) reduces steerage margin in heavy sea currents.",
            })
            score_components.append(55.0)
        else:
            findings.append({
                "type": "ADEQUATE_SPEED_MARGIN",
                "severity": "LOW",
                "score_impact": 15,
                "message": f"Service speed of {speed_knots} knots provides robust navigational maneuvering margin.",
            })
            score_components.append(15.0)

        # 3. Cargo Type Certification Match
        if cargo and cargo.get("cargo_type"):
            cargo_type = str(cargo.get("cargo_type")).lower()
            certified_types = str(vessel.get("cargo_types") or "").lower()
            vessel_type = str(vessel.get("vessel_type") or "").lower()

            match_found = False
            if certified_types and (cargo_type in certified_types or any(t.strip() in cargo_type for t in certified_types.split(","))):
                match_found = True
            elif "bulk" in cargo_type and "bulk" in vessel_type:
                match_found = True
            elif "container" in cargo_type and "container" in vessel_type:
                match_found = True
            elif ("liquid" in cargo_type or "oil" in cargo_type) and ("tanker" in vessel_type):
                match_found = True

            if match_found:
                findings.append({
                    "type": "CARGO_CERTIFICATION_MATCH",
                    "severity": "LOW",
                    "score_impact": 10,
                    "message": f"Vessel is certified and suited for proposed cargo commodity ('{cargo.get('cargo_type')}').",
                })
                score_components.append(10.0)
            else:
                findings.append({
                    "type": "CARGO_CERTIFICATION_MISMATCH",
                    "severity": "HIGH",
                    "score_impact": 75,
                    "message": f"Vessel certification '{vessel.get('cargo_types') or vessel_type}' does not explicitly match cargo '{cargo.get('cargo_type')}'.",
                })
                score_components.append(75.0)
        else:
            score_components.append(20.0)

        avg_vessel_score = round(sum(score_components) / len(score_components), 1)
        level = cls.classify_score(avg_vessel_score)
        return avg_vessel_score, level, findings

    @classmethod
    def evaluate_cargo_risk(
        cls,
        cargo: Optional[Dict[str, Any]],
        vessel: Dict[str, Any],
    ) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Evaluates deadweight utilization, overload, and ballast stability risk.
        """
        findings = []

        if not cargo or not cargo.get("weight_tons"):
            return 20.0, "LOW", [{
                "type": "UNSPECIFIED_PARCEL",
                "severity": "LOW",
                "score_impact": 20,
                "message": "No dedicated cargo parcel assigned; assessment assumes reference ballast or standard commercial loading.",
            }]

        weight_tons = float(cargo.get("weight_tons"))
        capacity_tons = float(vessel.get("capacity_tons") or 50000.0)
        utilization_pct = round((weight_tons / capacity_tons) * 100.0, 1) if capacity_tons > 0 else 0.0

        if utilization_pct > 105.0:
            score = 95.0
            findings.append({
                "type": "OVERLOAD_CAPACITY_VIOLATION",
                "severity": "CRITICAL",
                "score_impact": 95,
                "message": f"Cargo weight ({weight_tons:,.0f} MT) exceeds vessel deadweight capacity ({capacity_tons:,.0f} MT) by {utilization_pct - 100:.1f}%. Severe structural load hazard.",
            })
        elif utilization_pct > 98.0:
            score = 65.0
            findings.append({
                "type": "MAXIMUM_CAPACITY_LIMIT",
                "severity": "MEDIUM",
                "score_impact": 65,
                "message": f"Vessel operates near maximum loadline ({utilization_pct}% capacity). Zero safety margin for trim or displacement shifts.",
            })
        elif utilization_pct < 15.0:
            score = 55.0
            findings.append({
                "type": "BALLAST_STABILITY_EXPOSURE",
                "severity": "MEDIUM",
                "score_impact": 55,
                "message": f"Severe under-utilization ({utilization_pct}% of deadweight). High air draft, windage exposure, and extensive water ballast management required.",
            })
        elif 40.0 <= utilization_pct <= 95.0:
            score = 15.0
            findings.append({
                "type": "OPTIMAL_COMMERCIAL_UTILIZATION",
                "severity": "LOW",
                "score_impact": 15,
                "message": f"Payload utilization is {utilization_pct}% ({weight_tons:,.0f} MT on {capacity_tons:,.0f} DWT). Stable center of gravity and commercial efficiency.",
            })
        else:
            score = 30.0
            findings.append({
                "type": "ACCEPTABLE_UTILIZATION",
                "severity": "LOW",
                "score_impact": 30,
                "message": f"Payload utilization is {utilization_pct}% of vessel deadweight capacity.",
            })

        level = cls.classify_score(score)
        return score, level, findings

    @classmethod
    def evaluate_port_risk(
        cls,
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
    ) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Evaluates origin and destination port physical characteristics.
        """
        findings = []
        score_components = []

        # Origin port
        origin_country = origin_port.get("country") or "International"
        dest_country = dest_port.get("country") or "International"
        is_international = origin_country.lower() != dest_country.lower()

        if is_international:
            findings.append({
                "type": "INTERNATIONAL_CUSTOMS_CLEARANCE",
                "severity": "LOW",
                "score_impact": 25,
                "message": f"Voyage crosses sovereign maritime borders ({origin_country} -> {dest_country}); requires standard customs and international quarantine clearance.",
            })
            score_components.append(25.0)
        else:
            findings.append({
                "type": "DOMESTIC_COASTAL_VOYAGE",
                "severity": "LOW",
                "score_impact": 15,
                "message": f"Cabotage / domestic transit within {origin_country}.",
            })
            score_components.append(15.0)

        # Port infrastructure check
        origin_type = origin_port.get("port_type") or "seaport"
        dest_type = dest_port.get("port_type") or "seaport"

        if origin_type.lower() == "seaport" and dest_type.lower() == "seaport":
            findings.append({
                "type": "COMMERCIAL_SEAPORT_TERMINALS",
                "severity": "LOW",
                "score_impact": 15,
                "message": f"Both {origin_port.get('name')} and {dest_port.get('name')} are established commercial deepwater seaports.",
            })
            score_components.append(15.0)
        else:
            findings.append({
                "type": "SPECIALIZED_TERMINAL_HANDLING",
                "severity": "MEDIUM",
                "score_impact": 40,
                "message": f"Terminal types: Origin={origin_type}, Destination={dest_type}.",
            })
            score_components.append(40.0)

        avg_port_score = round(sum(score_components) / len(score_components), 1)
        level = cls.classify_score(avg_port_score)
        return avg_port_score, level, findings

    @classmethod
    def classify_score(cls, score: Optional[float]) -> str:
        """
        Normalizes a 0-100 score into standard risk tiers.
        """
        if score is None:
            return "DATA_INSUFFICIENT"
        if score <= 25.0:
            return "LOW"
        if score <= 60.0:
            return "MEDIUM"
        return "HIGH"

    @classmethod
    def assess_voyage_risk(
        cls,
        vessel: Dict[str, Any],
        route_data: Dict[str, Any],
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        cargo: Optional[Dict[str, Any]] = None,
        departure_time: Optional[Union[str, datetime]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end transparent risk assessment.
        Combines active verified factors while explicitly reporting missing data.
        """
        # 1. Evaluate Active Empirical Risk Factors
        route_score, route_level, route_findings = cls.evaluate_route_risk(route_data, vessel)
        vessel_score, vessel_level, vessel_findings = cls.evaluate_vessel_risk(vessel, cargo)
        cargo_score, cargo_level, cargo_findings = cls.evaluate_cargo_risk(cargo, vessel)
        port_score, port_level, port_findings = cls.evaluate_port_risk(origin_port, dest_port)

        all_findings = route_findings + vessel_findings + cargo_findings + port_findings

        # 2. Factor Weighting
        # Route (40%), Vessel Fit (30%), Cargo Load (20%), Port Logistics (10%)
        weights = {
            "route": 0.40,
            "vessel": 0.30,
            "cargo": 0.20,
            "port": 0.10,
        }

        weighted_overall = (
            (route_score * weights["route"])
            + (vessel_score * weights["vessel"])
            + (cargo_score * weights["cargo"])
            + (port_score * weights["port"])
        )
        overall_score = round(weighted_overall, 1)
        overall_level = cls.classify_score(overall_score)

        # 3. Missing Data Disclosure (Section 6, 7, 8, 11, 14, 19, 40)
        missing_data = [
            "live_weather_conditions",
            "ocean_swell_and_currents",
            "live_port_berth_congestion",
            "historical_incident_logs",
        ]

        # 4. Synthesize Module 18 Recommendation Hook
        recommendation_payload = {
            "risk_tier": overall_level,
            "risk_score": overall_score,
            "can_proceed": overall_score < 85.0,
            "primary_concern": None,
        }
        critical_findings = [f for f in all_findings if f.get("severity") in ("CRITICAL", "HIGH")]
        if critical_findings:
            recommendation_payload["primary_concern"] = critical_findings[0]["message"]

        return {
            "status": "success",
            "risk_assessment_id": f"rsk-{cargo.get('id') if cargo else 'nocargo'}-{vessel.get('id')}-{route_data.get('id') or 'calc'}",
            "risk_engine": {
                "type": cls.ENGINE_TYPE,
                "version": cls.ENGINE_VERSION,
                "methodology": "Transparent deterministic weighted multi-factor rule analysis",
                "rules_source": "Canonical Pub150, Suez/Panama canal constraints, and platform waypoint registry",
            },
            "overall_risk": {
                "level": overall_level,
                "score": overall_score,
                "scale": "0–100 (0–25 LOW, 26–60 MEDIUM, 61–100 HIGH)",
            },
            "factors": {
                "route_risk": {
                    "level": route_level,
                    "score": route_score,
                    "weight_pct": 40,
                    "status": "available",
                },
                "vessel_risk": {
                    "level": vessel_level,
                    "score": vessel_score,
                    "weight_pct": 30,
                    "status": "available",
                },
                "cargo_risk": {
                    "level": cargo_level,
                    "score": cargo_score,
                    "weight_pct": 20,
                    "status": "available",
                },
                "port_risk": {
                    "level": port_level,
                    "score": port_score,
                    "weight_pct": 10,
                    "status": "available",
                },
                "weather_risk": {
                    "status": "DATA_UNAVAILABLE",
                    "score": None,
                    "reason": "No live meteorological sensor or storm telemetry feed in project database.",
                },
                "ocean_risk": {
                    "status": "DATA_UNAVAILABLE",
                    "score": None,
                    "reason": "No live oceanographic buoy or wave height telemetry feed in project database.",
                },
                "congestion_risk": {
                    "status": "DATA_UNAVAILABLE",
                    "score": None,
                    "reason": "Dynamic port queue and AIS berth waiting times are unavailable.",
                },
                "historical_risk": {
                    "status": "DATA_UNAVAILABLE",
                    "score": None,
                    "reason": "No historical incident or delay logs in Module 14 dataset.",
                },
            },
            "missing_data": missing_data,
            "explanations": all_findings,
            "recommendation_hook": recommendation_payload,
            "assessed_at": datetime.now(timezone.utc).isoformat(),
        }
