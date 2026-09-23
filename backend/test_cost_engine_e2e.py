"""
Automated E2E Test Suite for Module 12 Cost Calculation Engine
SIH PS 26006 — Maritime Cargo Intelligence Platform
"""
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"


def post_json(path, data):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 500, {"error": str(e)}


def get_json(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


def run_tests():
    print("==================================================")
    print("RUNNING MODULE 12 COST CALCULATION E2E TESTS")
    print("==================================================")
    passed = 0
    total = 0

    # --------------------------------------------------
    # Test 1: Valid Authoritative Calculation (Cargo #4 + Vessel #1 Handysize + Route Siam Seaport -> Jersey City)
    # --------------------------------------------------
    total += 1
    status, res = post_json("/costs/calculate", {
        "cargo_id": 4,
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["vessel_id"] == 1
    assert res["cargo_id"] == 4
    assert res["currency"] == "USD"
    assert res["origin_port"]["name"] == "Siam Seaport"
    assert res["destination_port"]["name"] == "Jersey City"
    assert res["transit_metrics"]["distance_nm"] > 10000
    assert res["transit_metrics"]["speed_knots"] == 14.0
    assert res["transit_metrics"]["voyage_hours"] > 700
    assert res["transit_metrics"]["voyage_days"] > 30
    assert res["transit_metrics"]["fuel_consumed_mt"] > 750
    assert res["transit_metrics"]["cargo_weight_tons"] == 35000.0
    assert res["transit_metrics"]["capacity_utilization_pct"] is not None
    print(f"PASS: Test 1 - Valid Calculation (Distance: {res['transit_metrics']['distance_nm']} NM, Duration: {res['transit_metrics']['voyage_days']} days, Fuel: {res['transit_metrics']['fuel_consumed_mt']} MT)")
    passed += 1

    # --------------------------------------------------
    # Test 2: Missing Fuel Price Handling (Step 4 & 22)
    # Database has no fuel price, so fuel_cost must be None and status 'unavailable'
    # --------------------------------------------------
    total += 1
    assert res["fuel_cost"] is None, f"Expected fuel_cost None, got {res['fuel_cost']}"
    assert res["fuel_cost_status"] == "unavailable"
    assert "available" in res["fuel_cost_details"]["reason"].lower()
    assert res["fuel_cost_details"]["fuel_consumed_mt"] > 750
    print("PASS: Test 2 - Missing Fuel Price Handled Authoritatively (fuel_cost_status == 'unavailable')")
    passed += 1

    # --------------------------------------------------
    # Test 3: Missing Operating Cost Handling (Step 5 & 22)
    # Database has no daily OPEX, so operating_cost must be None and status 'unavailable'
    # --------------------------------------------------
    total += 1
    assert res["operating_cost"] is None, f"Expected operating_cost None, got {res['operating_cost']}"
    assert res["operating_cost_status"] == "unavailable"
    assert "available" in res["operating_cost_details"]["reason"].lower()
    print("PASS: Test 3 - Missing Operating Cost Handled Authoritatively (operating_cost_status == 'unavailable')")
    passed += 1

    # --------------------------------------------------
    # Test 4: Missing Port Charges Handling (Step 6 & 22)
    # Pub150 has no port charges, so port_cost must be None and status 'unavailable'
    # --------------------------------------------------
    total += 1
    assert res["port_cost"] is None
    assert res["port_cost_status"] == "unavailable"
    print("PASS: Test 4 - Missing Port Charges Handled Authoritatively (port_cost_status == 'unavailable')")
    passed += 1

    # --------------------------------------------------
    # Test 5: Scenario Quote Override & Cost per Tonne Calculation
    # Supply explicit bunker quote ($620/MT) and daily hire ($9,500/day)
    # --------------------------------------------------
    total += 1
    status, res_scenario = post_json("/costs/calculate", {
        "cargo_id": 4,
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
        "bunker_price_usd_per_mt": 620.0,
        "daily_hire_usd": 9500.0
    })
    assert status == 200, f"Expected 200, got {status}: {res_scenario}"
    assert res_scenario["fuel_cost"] is not None
    assert res_scenario["fuel_cost"] > 450000.0
    assert res_scenario["fuel_cost_status"] == "calculated"
    assert res_scenario["operating_cost"] is not None
    assert res_scenario["operating_cost"] > 250000.0
    assert res_scenario["operating_cost_status"] == "calculated"
    assert res_scenario["total_cost"] is not None
    assert res_scenario["total_cost"] == round(res_scenario["fuel_cost"] + res_scenario["operating_cost"], 2)
    assert res_scenario["cost_per_tonne"] is not None
    expected_cpt = round(res_scenario["total_cost"] / 35000.0, 2)
    assert abs(res_scenario["cost_per_tonne"] - expected_cpt) < 0.05
    assert res_scenario["cost_status"] == "partial"  # Port fees still unavailable
    print(f"PASS: Test 5 - Scenario Quote Evaluation (Fuel: ${res_scenario['fuel_cost']:,.2f}, Opex: ${res_scenario['operating_cost']:,.2f}, Total: ${res_scenario['total_cost']:,.2f}, Cost/Tonne: ${res_scenario['cost_per_tonne']}/MT)")
    passed += 1

    # --------------------------------------------------
    # Test 6: Non-Existent Vessel Validation (HTTP 404)
    # --------------------------------------------------
    total += 1
    status, res_err = post_json("/costs/calculate", {
        "vessel_id": 999999,
        "origin_port_id": 57461,
        "destination_port_id": 7780
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "vessel" in res_err["detail"].lower()
    print("PASS: Test 6 - Non-Existent Vessel Validation (HTTP 404)")
    passed += 1

    # --------------------------------------------------
    # Test 7: Non-Existent Cargo Validation (HTTP 404)
    # --------------------------------------------------
    total += 1
    status, res_err = post_json("/costs/calculate", {
        "cargo_id": 999999,
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "cargo" in res_err["detail"].lower()
    print("PASS: Test 7 - Non-Existent Cargo Validation (HTTP 404)")
    passed += 1

    # --------------------------------------------------
    # Test 8: Mismatched Corridor vs Cargo Validation (HTTP 400)
    # Cargo #4 is Siam Seaport -> Jersey City. Passing Hedland -> Mumbai must be rejected.
    # --------------------------------------------------
    total += 1
    status, res_err = post_json("/costs/calculate", {
        "cargo_id": 4,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 48840
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "does not match" in res_err["detail"].lower()
    print("PASS: Test 8 - Mismatched Cargo Corridor Rejection (HTTP 400)")
    passed += 1

    # --------------------------------------------------
    # Test 9: Missing Route Information Validation (HTTP 400)
    # --------------------------------------------------
    total += 1
    status, res_err = post_json("/costs/calculate", {
        "vessel_id": 1
    })
    assert status == 400, f"Expected 400, got {status}"
    print("PASS: Test 9 - Missing Route Corridor Rejection (HTTP 400)")
    passed += 1

    # --------------------------------------------------
    # Test 10: Automatic Corridor Derivation from Cargo
    # When origin_port_id and dest_port_id omitted, but cargo_id=3 is passed,
    # backend automatically retrieves Stilis -> Lamu from cargo record.
    # --------------------------------------------------
    total += 1
    status, res_auto = post_json("/costs/calculate", {
        "cargo_id": 3,
        "vessel_id": 2
    })
    assert status == 200, f"Expected 200, got {status}: {res_auto}"
    assert res_auto["origin_port"]["id"] == 42440
    assert res_auto["destination_port"]["id"] == 47110
    assert res_auto["transit_metrics"]["distance_nm"] > 2000
    print("PASS: Test 10 - Automatic Corridor Derivation from Cargo Itinerary")
    passed += 1

    print("==================================================")
    print(f"MODULE 12 TESTS COMPLETED: {passed}/{total} PASSED")
    print("==================================================")
    return passed == total


if __name__ == "__main__":
    if not run_tests():
        sys.exit(1)
