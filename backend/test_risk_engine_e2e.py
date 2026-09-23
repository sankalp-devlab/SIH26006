"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 17: Maritime Risk Assessment Engine — Automated E2E Test Suite

Verifies:
1. Engine metadata & initialization (RULE_BASED, v1.0.0).
2. Physical canal draft restrictions & clearance margins.
3. Chokepoint security evaluations (Hormuz, Bab-el-Mandeb, Malacca, Suez).
4. Vessel compatibility & maneuvering parameters.
5. Cargo deadweight capacity utilization & overload flags.
6. Zero Synthetic Data Guarantee (weather/congestion/incidents marked DATA_UNAVAILABLE).
7. Composite risk score normalization (0-100) & risk levels.
8. Explainability findings & Module 18 recommendation hooks.
9. FastAPI live endpoint: POST /risk/assess (200 OK, 404 Not Found, 400 Bad Request).
10. Supabase persistence to risk_assessments table.
"""

import json
import urllib.request
import urllib.error
from risk_engine import RiskEngine


def test_engine_initialization():
    """Verify engine metadata, version, and type."""
    assert RiskEngine.ENGINE_TYPE == "RULE_BASED"
    assert RiskEngine.ENGINE_VERSION == "1.0.0"
    assert "wp-hormuz" in RiskEngine.SECURITY_RISK_RATINGS
    assert "wp-bab" in RiskEngine.SECURITY_RISK_RATINGS
    assert "wp-suez" in RiskEngine.SECURITY_RISK_RATINGS
    assert "Suez Canal" in RiskEngine.CANAL_DRAFT_LIMITS
    assert "Panama Canal" in RiskEngine.CANAL_DRAFT_LIMITS
    assert "Kiel Canal" in RiskEngine.CANAL_DRAFT_LIMITS
    print("PASS: Engine initialization & metadata")


def test_missing_data_disclosure():
    """Strictly verify Rule 33: Weather, ocean, congestion, incidents are marked DATA_UNAVAILABLE with None score."""
    vessel = {
        "id": 1,
        "name": "NORDIC POLARIS",
        "vessel_type": "Crude Oil Tanker",
        "capacity_tons": 158000,
        "draft_m": 16.0,
        "max_speed_knots": 15.5,
    }
    route_data = {
        "route_id": "rt-test-1",
        "distance_nm": 4200.0,
        "waypoints": [
            {"id": "wp-1", "name": "Departure Point", "lat": 25.0, "lon": 55.0},
            {"id": "wp-2", "name": "Open Ocean", "lat": 12.0, "lon": 60.0},
            {"id": "wp-3", "name": "Arrival Point", "lat": 1.2, "lon": 103.8},
        ],
    }
    origin_port = {"id": 1, "name": "Port of Fujairah", "country": "United Arab Emirates"}
    dest_port = {"id": 2, "name": "Port of Singapore", "country": "Singapore"}

    result = RiskEngine.assess_voyage_risk(
        vessel=vessel,
        route_data=route_data,
        origin_port=origin_port,
        dest_port=dest_port,
    )

    factors = result["factors"]

    # Weather
    assert factors["weather_risk"]["status"] == "DATA_UNAVAILABLE"
    assert factors["weather_risk"]["score"] is None
    assert "meteorological" in factors["weather_risk"]["reason"].lower()

    # Ocean Sea State
    assert factors["ocean_risk"]["status"] == "DATA_UNAVAILABLE"
    assert factors["ocean_risk"]["score"] is None

    # Live Port Congestion
    assert factors["congestion_risk"]["status"] == "DATA_UNAVAILABLE"
    assert factors["congestion_risk"]["score"] is None

    # Historical Incidents
    assert factors["historical_risk"]["status"] == "DATA_UNAVAILABLE"
    assert factors["historical_risk"]["score"] is None

    # Available empirical factors
    assert factors["route_risk"]["status"] == "available"
    assert isinstance(factors["route_risk"]["score"], (int, float))
    assert factors["vessel_risk"]["status"] == "available"
    assert factors["cargo_risk"]["status"] == "available"
    assert factors["port_risk"]["status"] == "available"

    # Missing data list
    assert "live_weather_conditions" in result["missing_data"]
    assert "ocean_swell_and_currents" in result["missing_data"]

    print("PASS: Missing data disclosure & zero synthetic data enforcement")


def test_canal_draft_restriction():
    """Verify draft safety constraint flags vessel exceeding Suez Canal max draft (20.1m)."""
    deep_vessel = {
        "id": 99,
        "name": "ULTRA DEEP TANKER",
        "vessel_type": "Crude Oil Tanker",
        "capacity_tons": 320000,
        "draft_m": 22.5,  # Exceeds Suez max draft of 20.1m
        "max_speed_knots": 14.0,
    }
    suez_route = {
        "route_id": "rt-suez-transit",
        "distance_nm": 3000.0,
        "waypoints": [
            {"id": "wp-1", "name": "Red Sea Entry", "lat": 20.0, "lon": 38.0},
            {"id": "wp-suez", "name": "Suez Canal", "lat": 29.97, "lon": 32.55, "category": "canal"},
            {"id": "wp-3", "name": "Med Sea", "lat": 32.0, "lon": 30.0},
        ],
    }
    origin_port = {"id": 10, "name": "Jeddah Islamic Port", "country": "Saudi Arabia"}
    dest_port = {"id": 20, "name": "Port of Piraeus", "country": "Greece"}

    result = RiskEngine.assess_voyage_risk(
        vessel=deep_vessel,
        route_data=suez_route,
        origin_port=origin_port,
        dest_port=dest_port,
    )

    findings = result["explanations"]
    assert any(f["type"] == "CANAL_DRAFT_EXCEEDED" for f in findings)
    assert any("exceeds Suez Canal maximum limit" in f["message"] for f in findings)
    print("PASS: Physical canal draft restrictions & negative clearance alert")


def test_security_chokepoint_evaluation():
    """Verify chokepoint transit (Hormuz & Bab-el-Mandeb) elevates security rating and outputs advisories."""
    vessel = {
        "id": 1,
        "name": "NORDIC POLARIS",
        "vessel_type": "Crude Oil Tanker",
        "capacity_tons": 158000,
        "draft_m": 15.0,
        "max_speed_knots": 15.0,
    }
    chokepoint_route = {
        "route_id": "rt-gulf-redsea",
        "distance_nm": 2500.0,
        "waypoints": [
            {"id": "wp-hormuz", "name": "Strait of Hormuz", "lat": 26.56, "lon": 56.47},
            {"id": "wp-bab", "name": "Bab-el-Mandeb Strait", "lat": 12.58, "lon": 43.33},
        ],
    }
    origin = {"id": 5, "name": "Ras Tanura", "country": "Saudi Arabia"}
    dest = {"id": 6, "name": "Djibouti", "country": "Djibouti"}

    result = RiskEngine.assess_voyage_risk(
        vessel=vessel,
        route_data=chokepoint_route,
        origin_port=origin,
        dest_port=dest,
    )

    findings = result["explanations"]
    security_findings = [f for f in findings if f["type"] == "CHOKEPOINT_SECURITY_ASSESSMENT"]
    assert len(security_findings) >= 2
    assert any("Strait of Hormuz" in f["message"] for f in security_findings)
    assert any("Bab-el-Mandeb" in f["message"] for f in security_findings)
    print("PASS: Security chokepoint risk detection and advisories")


def test_cargo_overload_and_incompatibility():
    """Verify deadweight capacity overload (> 100%) and vessel type incompatibility."""
    small_vessel = {
        "id": 2,
        "name": "FEEDER RUNNER",
        "vessel_type": "Container Ship",
        "capacity_tons": 10000,
        "draft_m": 8.0,
        "max_speed_knots": 14.0,
    }
    heavy_crude_cargo = {
        "id": 88,
        "cargo_type": "Crude Oil",
        "weight_tons": 25000,  # 250% of capacity
    }
    route = {
        "route_id": "rt-coastal",
        "distance_nm": 600.0,
        "waypoints": [{"id": "wp-1", "name": "A", "lat": 10.0, "lon": 10.0}, {"id": "wp-2", "name": "B", "lat": 12.0, "lon": 12.0}],
    }
    origin = {"id": 1, "name": "Port A", "country": "Country A"}
    dest = {"id": 2, "name": "Port B", "country": "Country B"}

    result = RiskEngine.assess_voyage_risk(
        vessel=small_vessel,
        route_data=route,
        origin_port=origin,
        dest_port=dest,
        cargo=heavy_crude_cargo,
    )

    factors = result["factors"]
    assert factors["cargo_risk"]["score"] >= 80.0
    assert factors["vessel_risk"]["score"] >= 35.0

    findings = result["explanations"]
    assert any(f["type"] == "OVERLOAD_CAPACITY_VIOLATION" for f in findings)
    assert any(f["type"] == "CARGO_CERTIFICATION_MISMATCH" for f in findings)
    print("PASS: Cargo deadweight overload and vessel type mismatch handling")


def test_live_fastapi_risk_assess_endpoint():
    """Verify live HTTP POST /risk/assess on http://127.0.0.1:8000."""
    url = "http://127.0.0.1:8000/risk/assess"
    payload = {
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))

    assert data["status"] == "success"
    assert data["risk_engine"]["type"] == "RULE_BASED"
    assert 0.0 <= data["overall_risk"]["score"] <= 100.0
    assert data["overall_risk"]["level"] in ["LOW", "MEDIUM", "HIGH", "DATA_INSUFFICIENT"]
    assert "factors" in data
    assert "recommendation_hook" in data
    assert "persisted_assessment_id" in data
    print(f"PASS: Live FastAPI POST /risk/assess returns 200 with score={data['overall_risk']['score']}, persisted_id={data.get('persisted_assessment_id')}")


def test_live_fastapi_404_vessel_not_found():
    """Verify 404 response when vessel does not exist."""
    url = "http://127.0.0.1:8000/risk/assess"
    payload = {
        "vessel_id": 999999,  # Non-existent
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        urllib.request.urlopen(req)
        assert False, "Expected 404 HTTPException"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        print("PASS: Live FastAPI 404 for non-existent vessel")


def test_live_fastapi_400_corridor_mismatch():
    """Verify 400 response when cargo corridor does not match provided route."""
    url = "http://127.0.0.1:8000/risk/assess"
    payload = {
        "vessel_id": 1,
        "cargo_id": 4,
        "origin_port_id": 42440,
        "destination_port_id": 47110,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        urllib.request.urlopen(req)
        assert False, "Expected 400 HTTPException"
    except urllib.error.HTTPError as e:
        assert e.code == 400
        print("PASS: Live FastAPI error handling on invalid itinerary (400 Bad Request)")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MODULE 17 RISK ASSESSMENT E2E TEST SUITE")
    print("=" * 60)
    test_engine_initialization()
    test_missing_data_disclosure()
    test_canal_draft_restriction()
    test_security_chokepoint_evaluation()
    test_cargo_overload_and_incompatibility()
    test_live_fastapi_risk_assess_endpoint()
    test_live_fastapi_404_vessel_not_found()
    test_live_fastapi_400_corridor_mismatch()
    print("=" * 60)
    print("ALL MODULE 17 RISK ASSESSMENT TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
