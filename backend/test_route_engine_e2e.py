"""
Automated E2E Test Suite for Module 11 Route Calculation Engine
"""
import urllib.request
import urllib.error
import json

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

def get_json(path):
    with urllib.request.urlopen(f"{BASE_URL}{path}") as resp:
        return resp.status, json.loads(resp.read().decode())

def run_tests():
    print("=== RUNNING MODULE 11 E2E TESTS ===")
    passed = 0
    total = 0

    # 1. Valid Calculation (Siam Seaport -> Jersey City with Handysize vessel)
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 57461,
        "destination_port_id": 7780,
        "vessel_id": 1
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["status"] == "calculated"
    assert res["distance_nm"] > 10000
    assert res["distance_km"] > 18000
    assert res["distance_type"] == "maritime"
    assert len(res["geometry"]) >= 4
    assert len(res["waypoints"]) >= 2
    assert res["origin_port"]["name"] == "Siam Seaport"
    assert res["destination_port"]["name"] == "Jersey City"
    assert res["vessel"]["id"] == 1
    print("PASS: Test 1 - Valid Intercontinental Route Calculation")
    passed += 1

    # 2. Valid Coastal / Direct Calculation
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 42440,
        "destination_port_id": 47110
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["distance_type"] == "geodesic"
    assert res["route_type"] == "direct_sea_passage"
    assert len(res["geometry"]) == 2
    print("PASS: Test 2 - Valid Direct Sea Passage Calculation")
    passed += 1

    # 3. Same Origin & Destination Validation (HTTP 400)
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 57461,
        "destination_port_id": 57461
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "same" in res["detail"].lower()
    print("PASS: Test 3 - Origin == Destination Rejection")
    passed += 1

    # 4. Non-Existent Origin Port Validation (HTTP 404)
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 999999,
        "destination_port_id": 57461
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res["detail"].lower()
    print("PASS: Test 4 - Non-existent Origin Port Rejection (404)")
    passed += 1

    # 5. Non-Existent Destination Port Validation (HTTP 404)
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 57461,
        "destination_port_id": 999999
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res["detail"].lower()
    print("PASS: Test 5 - Non-existent Destination Port Rejection (404)")
    passed += 1

    # 6. Non-Existent Vessel Validation (HTTP 404)
    total += 1
    status, res = post_json("/routes/calculate", {
        "origin_port_id": 57461,
        "destination_port_id": 7780,
        "vessel_id": 999999
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "vessel" in res["detail"].lower()
    print("PASS: Test 6 - Non-existent Vessel Rejection (404)")
    passed += 1

    # 7. Canal Draft Restriction Check (Route via RouteEngine)
    total += 1
    from route_engine import RouteEngine
    suez_res = RouteEngine.calculate_route(
        {"id": 1, "name": "Singapore", "latitude": 1.29, "longitude": 103.85},
        {"id": 2, "name": "Rotterdam", "latitude": 51.92, "longitude": 4.47},
        vessel={"id": 10, "name": "Ultra Deep Draught", "draft_m": 22.0}
    )
    assert any("cape of good hope" in wp["name"].lower() for wp in suez_res["waypoints"])
    assert len(suez_res["restrictions"]) > 0
    print("PASS: Test 7 - Canal Draft Constraint Rerouting (Cape of Good Hope)")
    passed += 1

    # 8. Persistence Verification via GET /routes
    total += 1
    status, routes_res = get_json("/routes?limit=10")
    assert status == 200
    assert any(r["origin_port_id"] == 57461 and r["destination_port_id"] == 7780 for r in routes_res["routes"])
    print("PASS: Test 8 - Supabase routes Table Persistence Verified")
    passed += 1

    print(f"\nALL {passed}/{total} TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
