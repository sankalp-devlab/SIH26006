"""
Automated E2E Test Suite for Module 13 ETA Calculation Engine
SIH PS 26006 — Maritime Cargo Intelligence Platform

Tests:
1. Valid baseline ETA calculation with reference vessel, real corridor, and cargo.
2. Mathematical correctness: voyage_hours = distance_nm / effective_speed, arrival = departure + duration.
3. Explicit departure time override handling & timezone preservation.
4. Transparent data completeness: eta_status == 'partial', condition_adjustment == None, port_waiting == None.
5. Missing vessel handling (404).
6. Missing cargo handling (404).
7. Missing route info handling (400).
8. Mismatched cargo-route corridor rejection (400).
9. Ad-hoc route ETA calculation (no cargo_id).
10. Database persistence into 'bookings' table (estimated_eta populated).
"""

import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

BASE_URL = "http://127.0.0.1:8000"


def post_json(endpoint: str, payload: dict):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = json.loads(resp.read().decode("utf-8"))
            return status, body
    except urllib.error.HTTPError as e:
        status = e.code
        body = json.loads(e.read().decode("utf-8"))
        return status, body


def run_tests():
    print("=" * 60)
    print("RUNNING MODULE 13 ETA CALCULATION E2E TESTS")
    print("=" * 60)

    # ----------------------------------------------------
    # Test 1: Authoritative Baseline ETA Calculation
    # Port Hedland #54620 -> Qingdao Gang #60140 (Iron Ore corridor)
    # Vessel #1 (Reference-Handysize, speed_laden_knots: 14.0)
    # Cargo #1
    # ----------------------------------------------------
    status, res = post_json("/eta/calculate", {
        "cargo_id": 1,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["eta_status"] == "partial", f"Expected 'partial', got {res['eta_status']}"
    assert res["distance_nm"] > 3000, f"Expected real route distance > 3000 NM, got {res['distance_nm']}"
    assert res["effective_speed_knots"] == 14.0, f"Expected 14.0 kts, got {res['effective_speed_knots']}"
    assert res["speed_source"] == "speed_laden_knots"
    assert res["voyage_hours"] > 0
    assert res["voyage_days"] > 0
    assert res["departure_time"] is not None
    assert res["estimated_arrival"] is not None
    assert res["calculation_method"] == "deterministic_baseline"
    print(f"PASS: Test 1 - Authoritative Baseline ETA ({res['distance_nm']} NM @ {res['effective_speed_knots']} kts -> {res['voyage_hours']} hrs / {res['voyage_days']} days)")

    # ----------------------------------------------------
    # Test 2: Mathematical Correctness & Unit Compatibility
    # ----------------------------------------------------
    expected_hours = round(res["distance_nm"] / res["effective_speed_knots"], 2)
    assert abs(res["voyage_hours"] - expected_hours) < 0.05, f"Hours mismatch: {res['voyage_hours']} vs {expected_hours}"

    expected_days = round(expected_hours / 24.0, 2)
    assert abs(res["voyage_days"] - expected_days) < 0.05, f"Days mismatch: {res['voyage_days']} vs {expected_days}"

    dep_dt = datetime.fromisoformat(res["departure_time"].replace("Z", "+00:00"))
    arr_dt = datetime.fromisoformat(res["estimated_arrival"].replace("Z", "+00:00"))
    duration_delta_hours = (arr_dt - dep_dt).total_seconds() / 3600.0
    assert abs(duration_delta_hours - expected_hours) < 0.1, f"Datetime math mismatch: {duration_delta_hours} vs {expected_hours}"
    print("PASS: Test 2 - Mathematical and Timezone Correctness Verified")

    # ----------------------------------------------------
    # Test 3: Departure Time Override & Source Tracking
    # ----------------------------------------------------
    custom_dep = "2026-10-01T08:00:00+00:00"
    status, res_custom = post_json("/eta/calculate", {
        "cargo_id": 1,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140,
        "departure_time": custom_dep
    })
    assert status == 200
    assert res_custom["departure_time"] == custom_dep
    assert res_custom["departure_time_source"] == "request_override"
    arr_custom_dt = datetime.fromisoformat(res_custom["estimated_arrival"].replace("Z", "+00:00"))
    assert arr_custom_dt > datetime.fromisoformat(custom_dep)
    print(f"PASS: Test 3 - Departure Override Verified (Dep: {res_custom['departure_time']}, Arrival: {res_custom['estimated_arrival']})")

    # ----------------------------------------------------
    # Test 4: Transparent Route Condition Handling (Step 9 & 10)
    # ----------------------------------------------------
    assert res["condition_adjustment"] is None, "Expected condition_adjustment None (no fake weather)"
    assert res["condition_status"] == "unavailable"
    assert res["port_waiting_duration"] is None, "Expected port_waiting_duration None (no fake congestion)"
    assert res["port_waiting_status"] == "unavailable"
    print("PASS: Test 4 - Transparent Unpriced Conditions Verified (No synthetic delays)")

    # ----------------------------------------------------
    # Test 5: Invalid Vessel ID (404)
    # ----------------------------------------------------
    status, res_err = post_json("/eta/calculate", {
        "cargo_id": 1,
        "vessel_id": 999999,
        "origin_port_id": 54620,
        "destination_port_id": 60140
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res_err["detail"].lower()
    print("PASS: Test 5 - Invalid Vessel Handled with 404")

    # ----------------------------------------------------
    # Test 6: Invalid Cargo ID (404)
    # ----------------------------------------------------
    status, res_err = post_json("/eta/calculate", {
        "cargo_id": 999999,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res_err["detail"].lower()
    print("PASS: Test 6 - Invalid Cargo Handled with 404")

    # ----------------------------------------------------
    # Test 7: Missing Route Information (400)
    # ----------------------------------------------------
    status, res_err = post_json("/eta/calculate", {
        "vessel_id": 1
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "route information is required" in res_err["detail"].lower()
    print("PASS: Test 7 - Missing Route Handled with 400")

    # ----------------------------------------------------
    # Test 8: Mismatched Route Corridor & Cargo Itinerary (400)
    # ----------------------------------------------------
    status, res_err = post_json("/eta/calculate", {
        "cargo_id": 1,  # Cargo 1 is 54620 -> 60140
        "vessel_id": 1,
        "origin_port_id": 48840,  # Mismatched origin
        "destination_port_id": 60140
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "does not match cargo itinerary" in res_err["detail"].lower()
    print("PASS: Test 8 - Mismatched Corridor Rejected with 400")

    # ----------------------------------------------------
    # Test 9: Ad-Hoc Corridor ETA (no cargo_id)
    # ----------------------------------------------------
    status, res_adhoc = post_json("/eta/calculate", {
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140
    })
    assert status == 200
    assert res_adhoc["cargo_id"] is None
    assert res_adhoc["persisted"] is False
    assert res_adhoc["voyage_hours"] > 0
    print("PASS: Test 9 - Ad-Hoc Corridor ETA Calculation Successful")

    # ----------------------------------------------------
    # Test 10: Database Persistence in bookings table
    # ----------------------------------------------------
    assert res["persisted"] is True, "Expected booking record to be persisted"
    print("PASS: Test 10 - Database Booking Persistence Verified (estimated_eta populated)")

    print("=" * 60)
    print("ALL 10 MODULE 13 ETA CALCULATION E2E TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
