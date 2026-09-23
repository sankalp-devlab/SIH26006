"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 18: Maritime Recommendation Engine — Automated E2E Test Suite

Verifies:
1. Engine metadata & initialization (MULTI_CRITERIA_DECISION_ANALYSIS, v1.0.0).
2. Four configurable MCDA preference weighting profiles (balanced, lowest_cost, fastest_eta, lowest_risk).
3. Hard eligibility constraint: Capacity overload rejection (INSUFFICIENT_CAPACITY).
4. Hard eligibility constraint: Gross under-utilization rejection (GROSS_UNDERUTILIZATION).
5. Hard eligibility constraint: Cargo & vessel type incompatibility (CARGO_INCOMPATIBILITY).
6. Hard eligibility constraint: Canal draft limit violation (CANAL_DRAFT_EXCEEDED).
7. Transparent multi-criteria scoring & ranking across candidate fleet.
8. Explainability rationale & runner-up trade-offs synthesis.
9. Strict compliance with Rules 28 & 33 (Zero synthetic ML data, explicit DATA_UNAVAILABLE disclosures).
10. End-to-end integration with RouteEngine, CostEngine, EtaEngine, and RiskEngine on authentic database cargo.
11. FastAPI endpoints: GET /recommendations/preferences (200 OK).
12. FastAPI endpoints: POST /recommendations/generate (200 OK with cargo_id).
13. FastAPI endpoints: POST /recommendations/generate with ad-hoc shipment (200 OK).
14. FastAPI endpoints: Error handling (404 Cargo Not Found, 400 Invalid Port Corridor).
"""

import json
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from main import app
from recommendation_engine import RecommendationEngine


client = TestClient(app)


def test_engine_initialization_and_weights():
    """Verify engine metadata, version, and weighting profiles."""
    assert RecommendationEngine.ENGINE_TYPE == "MULTI_CRITERIA_DECISION_ANALYSIS"
    assert RecommendationEngine.ENGINE_VERSION == "1.0.0"

    profiles = RecommendationEngine.PREFERENCE_WEIGHTS
    assert "balanced" in profiles
    assert "lowest_cost" in profiles
    assert "fastest_eta" in profiles
    assert "lowest_risk" in profiles

    # Ensure weights sum to 1.0
    for name, weights in profiles.items():
        total_weight = sum(weights.values())
        assert abs(total_weight - 1.0) < 0.001, f"Profile {name} weights must sum to 1.0, got {total_weight}"
        assert "capacity_fit" in weights
        assert "cost_efficiency" in weights
        assert "transit_speed" in weights
        assert "safety_risk" in weights

    print("PASS: 1. Engine initialization, metadata, and preference profiles")


def test_capacity_overload_rejection():
    """Verify cargo weight exceeding vessel capacity is strictly rejected."""
    vessel = {
        "id": 1,
        "name": "REFERENCE-HANDYSIZE",
        "vessel_type": "Handysize",
        "capacity_tons": 38200.0,
        "draft_m": 10.5,
        "cargo_types": "coal,grain,minor bulk",
    }
    oversized_cargo = {
        "id": 101,
        "cargo_type": "Dry Bulk",
        "description": "Heavy Iron Ore Fines",
        "weight_tons": 75000.0,  # Exceeds 38,200
    }

    is_eligible, reasons = RecommendationEngine.validate_vessel_cargo_compatibility(vessel, oversized_cargo)
    assert is_eligible is False
    assert any("INSUFFICIENT_CAPACITY" in r for r in reasons)
    print("PASS: 2. Capacity overload rejection (INSUFFICIENT_CAPACITY)")


def test_gross_underutilization_rejection():
    """Verify severe under-utilization (< 10% DWT) is disqualified for stability."""
    vessel = {
        "id": 4,
        "name": "REFERENCE-CAPESIZE",
        "vessel_type": "Capesize",
        "capacity_tons": 182000.0,
        "draft_m": 18.2,
        "cargo_types": "coal,iron ore,bauxite",
    }
    tiny_cargo = {
        "id": 102,
        "cargo_type": "Dry Bulk",
        "description": "Small Grain Parcel",
        "weight_tons": 8000.0,  # 8000 / 182000 = 4.4% (< 10%)
    }

    is_eligible, reasons = RecommendationEngine.validate_vessel_cargo_compatibility(vessel, tiny_cargo)
    assert is_eligible is False
    assert any("GROSS_UNDERUTILIZATION" in r for r in reasons)
    print("PASS: 3. Gross under-utilization rejection (GROSS_UNDERUTILIZATION)")


def test_cargo_vessel_type_incompatibility():
    """Verify liquid bulk is rejected on dry bulk carriers."""
    dry_vessel = {
        "id": 1,
        "name": "REFERENCE-HANDYSIZE",
        "vessel_type": "Handysize",
        "capacity_tons": 38200.0,
        "draft_m": 10.5,
        "cargo_types": "coal,grain,minor bulk,steel,scrap",
    }
    liquid_cargo = {
        "id": 103,
        "cargo_type": "Liquid Bulk",
        "description": "Arabian Light Crude Oil",
        "weight_tons": 30000.0,
    }

    is_eligible, reasons = RecommendationEngine.validate_vessel_cargo_compatibility(dry_vessel, liquid_cargo)
    assert is_eligible is False
    assert any("CARGO_INCOMPATIBILITY" in r for r in reasons)
    print("PASS: 4. Cargo and vessel type incompatibility rejection (CARGO_INCOMPATIBILITY)")


def test_canal_draft_limit_rejection():
    """Verify deep-draft vessel is flagged/disqualified for shallow canal transit."""
    deep_vessel = {
        "id": 105,
        "name": "ULTRA-DEEP-CARRIER",
        "vessel_type": "Capesize",
        "capacity_tons": 200000.0,
        "draft_m": 21.5,  # Exceeds Suez max draft (20.1m)
        "cargo_types": "iron ore,bauxite",
    }
    cargo = {
        "id": 106,
        "cargo_type": "Dry Bulk",
        "description": "Iron Ore",
        "weight_tons": 180000.0,
    }
    suez_route = {
        "route_id": "rt-suez-test",
        "waypoints": [
            {"id": "wp-suez-north", "name": "Suez Canal Entry"},
            {"id": "wp-suez-south", "name": "Suez Canal Exit"},
        ],
    }

    is_eligible, reasons = RecommendationEngine.validate_vessel_cargo_compatibility(
        deep_vessel, cargo, route_data=suez_route
    )
    assert is_eligible is False
    assert any("CANAL_DRAFT_EXCEEDED" in r for r in reasons)
    print("PASS: 5. Canal draft restriction enforcement (CANAL_DRAFT_EXCEEDED)")


def test_mcda_scoring_and_ranking():
    """Verify multi-criteria scoring, relative normalization, and ranking order."""
    cargo = {
        "id": 4,
        "cargo_type": "Dry Bulk",
        "description": "Agricultural Grain & Wheat",
        "weight_tons": 35000.0,
    }

    # Construct mock candidate evaluations
    candidate_handysize = {
        "vessel": {
            "id": 1,
            "name": "REFERENCE-HANDYSIZE",
            "vessel_type": "Handysize",
            "capacity_tons": 38200.0,
        },
        "is_eligible": True,
        "cost": {"cost_per_tonne": 16.47, "total_cost": 576450.0},
        "eta": {"voyage_days": 34.1, "voyage_hours": 818.4},
        "risk": {"overall_risk": {"score": 23.5, "level": "LOW"}},
    }

    candidate_supramax = {
        "vessel": {
            "id": 2,
            "name": "REFERENCE-SUPRAMAX",
            "vessel_type": "Supramax",
            "capacity_tons": 58328.0,
        },
        "is_eligible": True,
        "cost": {"cost_per_tonne": 20.90, "total_cost": 731500.0},
        "eta": {"voyage_days": 35.8, "voyage_hours": 859.2},
        "risk": {"overall_risk": {"score": 28.0, "level": "MEDIUM"}},
    }

    # Balanced profile
    scored_balanced = RecommendationEngine.calculate_candidate_scores(
        [candidate_handysize, candidate_supramax],
        cargo,
        preference="balanced",
    )
    assert len(scored_balanced) == 2
    assert scored_balanced[0]["rank"] == 1
    assert scored_balanced[0]["vessel"]["name"] == "REFERENCE-HANDYSIZE"
    assert scored_balanced[0]["score"] > scored_balanced[1]["score"]
    assert "score_breakdown" in scored_balanced[0]

    # Lowest cost profile
    scored_cost = RecommendationEngine.calculate_candidate_scores(
        [candidate_handysize, candidate_supramax],
        cargo,
        preference="lowest_cost",
    )
    assert scored_cost[0]["rank"] == 1
    assert scored_cost[0]["vessel"]["name"] == "REFERENCE-HANDYSIZE"

    print("PASS: 6. Multi-criteria scoring, normalization, and ranking logic")


def test_explainability_and_tradeoffs():
    """Verify human-readable explainability rationale and trade-off comparisons."""
    primary = {
        "vessel": {"name": "REFERENCE-HANDYSIZE"},
        "score": 95.3,
        "score_tier": "EXCELLENT_FIT",
        "score_breakdown": {
            "capacity_fit": {"weight_pct": 30, "metric": "91.6% DWT utilization"},
            "cost_efficiency": {"weight_pct": 30, "metric": "$16.47/MT"},
            "transit_speed": {"weight_pct": 20, "metric": "34.1 days"},
            "safety_risk": {"weight_pct": 20, "metric": "23.5/100 Risk (LOW)"},
        },
        "cost": {"cost_per_tonne": 16.47},
        "eta": {"voyage_days": 34.1},
    }
    runner_up = {
        "rank": 2,
        "vessel": {"name": "REFERENCE-SUPRAMAX"},
        "cost": {"cost_per_tonne": 20.90},
        "eta": {"voyage_days": 35.8},
    }

    explanation = RecommendationEngine.generate_recommendation_explanation(
        primary_candidate=primary,
        alternatives=[runner_up],
        cargo={"weight_tons": 35000.0},
        preference="balanced",
    )

    assert "REFERENCE-HANDYSIZE" in explanation["primary_rationale"]
    assert "95.3/100" in explanation["primary_rationale"]
    assert len(explanation["trade_offs"]) >= 1
    assert "REFERENCE-SUPRAMAX" in explanation["trade_offs"][0]
    assert "costs" in explanation["trade_offs"][0]
    assert "Multi-Factor Scoring" in explanation["decision_rule"]
    print("PASS: 7. Explainability rationale and runner-up trade-off synthesis")


def test_data_integrity_disclosures():
    """Verify Non-negotiable Rules 28 & 33 data disclosures."""
    origin_port = {
        "id": 57461,
        "name": "Siam Seaport",
        "latitude": 13.116,
        "longitude": 100.883,
        "country": "Thailand",
    }
    dest_port = {
        "id": 7780,
        "name": "Jersey City",
        "latitude": 40.717,
        "longitude": -74.067,
        "country": "United States",
    }
    cargo = {
        "id": 4,
        "cargo_type": "Dry Bulk",
        "description": "Agricultural Grain & Wheat",
        "weight_tons": 35000.0,
    }
    vessel = {
        "id": 1,
        "name": "REFERENCE-HANDYSIZE",
        "vessel_type": "Handysize",
        "capacity_tons": 38200.0,
        "draft_m": 10.5,
        "cargo_types": "coal,grain,minor bulk",
        "speed_laden_knots": 14.0,
        "fuel_laden_mt_day": 25.0,
    }

    res = RecommendationEngine.generate_recommendations(
        cargo=cargo,
        vessels=[vessel],
        origin_port=origin_port,
        dest_port=dest_port,
        bunker_price_usd_per_mt=650.0,
    )

    assert res["status"] == "success"
    assert "disclosures" in res
    assert len(res["disclosures"]) == 4
    assert any("DATA_UNAVAILABLE" in d for d in res["disclosures"])
    assert any("XGBoost ML" in d for d in res["disclosures"])
    assert res["estimates"]["eta_source"] == "BASELINE_NAUTICAL_CALCULATION (Module 13)"
    assert res["estimates"]["cost_source"] == "BASELINE_VOYAGE_CALCULATION (Module 12)"
    assert res["estimates"]["risk_source"] == "RULE_BASED_MARITIME_RISK (Module 17)"
    print("PASS: 8. Zero-synthetic data and integrity disclosures (Rules 28 & 33)")


def test_fastapi_preferences_endpoint():
    """Verify GET /recommendations/preferences returns configured weighting profiles."""
    response = client.get("/recommendations/preferences")
    assert response.status_code == 200
    data = response.json()
    assert "available_preferences" in data
    assert len(data["available_preferences"]) == 4
    keys = [p["key"] for p in data["available_preferences"]]
    assert "balanced" in keys
    assert "lowest_cost" in keys
    assert "fastest_eta" in keys
    assert "lowest_risk" in keys
    print("PASS: 9. FastAPI GET /recommendations/preferences endpoint")


def test_fastapi_generate_with_cargo_id():
    """Verify POST /recommendations/generate with registered database cargo."""
    payload = {
        "cargo_id": 4,
        "preference": "balanced",
        "bunker_price_usd_per_mt": 650.0,
    }
    response = client.post("/recommendations/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["has_eligible_vessels"] is True
    assert data["recommended_vessel"] is not None
    assert data["recommended_vessel"]["name"] == "REFERENCE-HANDYSIZE"
    assert data["recommended_vessel"]["rank"] == 1
    assert data["recommended_vessel"]["recommendation_score"] >= 80.0
    assert data["recommended_route"]["origin_port"] == "Siam Seaport"
    assert data["recommended_route"]["destination_port"] == "Jersey City"
    assert len(data["alternative_options"]) > 0
    assert "primary_rationale" in data["explanation"]
    print(f"PASS: 10. FastAPI POST /recommendations/generate with cargo_id=4 -> Top Vessel: {data['recommended_vessel']['name']} (Score: {data['recommended_vessel']['recommendation_score']})")


def test_fastapi_generate_with_adhoc_shipment():
    """Verify POST /recommendations/generate with ad-hoc shipment parameters."""
    payload = {
        "cargo_type": "Dry Bulk",
        "cargo_description": "Spot Coking Coal Shipment",
        "weight_tons": 72000.0,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
        "preference": "lowest_cost",
        "bunker_price_usd_per_mt": 640.0,
    }
    response = client.post("/recommendations/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["has_eligible_vessels"] is True
    assert data["recommended_vessel"] is not None
    # 72,000 MT should best match Panamax (82,500 DWT)
    assert data["recommended_vessel"]["name"] == "REFERENCE-PANAMAX"
    assert data["shipment_details"]["weight_tons"] == 72000.0
    print(f"PASS: 11. FastAPI POST /recommendations/generate with ad-hoc shipment -> Top Vessel: {data['recommended_vessel']['name']}")


def test_fastapi_error_handling():
    """Verify 404 and 400 error conditions."""
    # 1. Non-existent cargo
    res_404 = client.post("/recommendations/generate", json={"cargo_id": 999999})
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()

    # 2. Identical ports
    res_400_same = client.post(
        "/recommendations/generate",
        json={
            "weight_tons": 40000.0,
            "origin_port_id": 57461,
            "destination_port_id": 57461,
        },
    )
    assert res_400_same.status_code == 400
    assert "cannot be identical" in res_400_same.json()["detail"].lower()

    # 3. Missing weight for ad-hoc
    res_400_weight = client.post(
        "/recommendations/generate",
        json={
            "origin_port_id": 57461,
            "destination_port_id": 7780,
        },
    )
    assert res_400_weight.status_code == 400
    assert "weight_tons" in res_400_weight.json()["detail"].lower()

    print("PASS: 12. FastAPI error handling (404 Not Found, 400 Bad Request)")


if __name__ == "__main__":
    print("=" * 65)
    print("RUNNING MODULE 18 RECOMMENDATION ENGINE E2E TEST SUITE")
    print("=" * 65)
    test_engine_initialization_and_weights()
    test_capacity_overload_rejection()
    test_gross_underutilization_rejection()
    test_cargo_vessel_type_incompatibility()
    test_canal_draft_limit_rejection()
    test_mcda_scoring_and_ranking()
    test_explainability_and_tradeoffs()
    test_data_integrity_disclosures()
    test_fastapi_preferences_endpoint()
    test_fastapi_generate_with_cargo_id()
    test_fastapi_generate_with_adhoc_shipment()
    test_fastapi_error_handling()
    print("=" * 65)
    print("ALL 12 MODULE 18 RECOMMENDATION ENGINE TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)
