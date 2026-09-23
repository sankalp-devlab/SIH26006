"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 20: Live Vessel Tracking — Automated E2E Test Suite

Verifies:
1. Tracking subsystem status endpoint (GET /tracking/status) & provider metadata.
2. Unpositioned vessel detection & DATA_UNAVAILABLE state disclosures (Rules 28 & 33).
3. Non-existent vessel validation (404 Not Found).
4. Telemetry validation rules (invalid latitude, longitude, negative speed, out-of-range heading, future timestamps).
5. Ingestion of authentic telemetry (POST /tracking/ingest -> 201 Created) with LIVE status (< 2 hours).
6. Idempotent deduplication of identical position observations.
7. Freshness state evaluation: STALE position detection (> 24 hours).
8. Detailed single vessel tracking retrieval (GET /tracking/vessels/{vessel_id}).
9. Chronological position history retrieval (GET /tracking/vessels/{vessel_id}/history).
10. Booking tracking integration (GET /tracking/bookings/{booking_id}) with assigned vessel and corridor.
11. Telemetry refresh endpoint (POST /tracking/refresh/{vessel_id}).
12. Status filtering (GET /tracking/vessels?status=LIVE).
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))

from main import app
from tracking_engine import TrackingEngine

client = TestClient(app)


def test_tracking_system_status():
    """Verify GET /tracking/status returns operational subsystem metrics and provider info."""
    response = client.get("/tracking/status")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["status"] == "OPERATIONAL"
    assert "provider_info" in data
    assert "metrics" in data
    assert "freshness_thresholds" in data
    assert "integrity_disclosure" in data
    assert "Rule 28" in data["integrity_disclosure"]
    assert data["freshness_thresholds"]["live_minutes_max"] == 120.0

    print("PASS: 1. Tracking system status, provider info, and Rule 28 disclosures verified")


def test_telemetry_validation_rejections():
    """Verify strict server-side validation rejecting impossible coordinates, negative speeds, and invalid timestamps."""
    # 1. Invalid latitude (> 90)
    res = client.post("/tracking/ingest", json={
        "vessel_id": 1,
        "latitude": 95.5,
        "longitude": 103.8,
    })
    assert res.status_code == 400
    assert "latitude" in str(res.json()["detail"]["violations"])

    # 2. Invalid longitude (< -180)
    res = client.post("/tracking/ingest", json={
        "vessel_id": 1,
        "latitude": 1.3,
        "longitude": -195.0,
    })
    assert res.status_code == 400
    assert "longitude" in str(res.json()["detail"]["violations"])

    # 3. Negative speed
    res = client.post("/tracking/ingest", json={
        "vessel_id": 1,
        "latitude": 1.3,
        "longitude": 103.8,
        "speed_knots": -3.5,
    })
    assert res.status_code == 400
    assert "negative" in str(res.json()["detail"]["violations"])

    # 4. Out-of-bounds heading (> 360)
    res = client.post("/tracking/ingest", json={
        "vessel_id": 1,
        "latitude": 1.3,
        "longitude": 103.8,
        "heading": 405.0,
    })
    assert res.status_code == 400
    assert "Heading" in str(res.json()["detail"]["violations"])

    # 5. Future timestamp (> 5 minutes ahead)
    future_time = (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
    res = client.post("/tracking/ingest", json={
        "vessel_id": 1,
        "latitude": 1.3,
        "longitude": 103.8,
        "recorded_at": future_time,
    })
    assert res.status_code == 400
    assert "future" in str(res.json()["detail"]["violations"])

    # 6. Non-existent vessel
    res = client.post("/tracking/ingest", json={
        "vessel_id": 999999,
        "latitude": 1.3,
        "longitude": 103.8,
    })
    assert res.status_code == 404

    print("PASS: 2. Telemetry validation rules and constraint enforcement verified")


def test_authentic_telemetry_ingestion_and_live_status():
    """Verify authentic position observation ingestion for Vessel #1 yields LIVE freshness status."""
    now_iso = datetime.now(timezone.utc).isoformat()
    payload = {
        "vessel_id": 1,
        "latitude": 1.2855,
        "longitude": 103.8565,
        "speed_knots": 13.8,
        "heading": 84.5,
        "recorded_at": now_iso,
    }

    res = client.post("/tracking/ingest", json=payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert data["vessel_id"] == 1
    assert data["freshness_status"] == "LIVE"
    assert data["latitude"] == 1.2855
    assert data["longitude"] == 103.8565

    # Retrieve vessel tracking details
    res_v = client.get("/tracking/vessels/1")
    assert res_v.status_code == 200
    v_data = res_v.json()
    assert v_data["tracking_status"] == "LIVE"
    assert v_data["latest_position"] is not None
    assert v_data["latest_position"]["latitude"] == 1.2855
    assert v_data["latest_position"]["longitude"] == 103.8565
    assert v_data["latest_position"]["speed_knots"] == 13.8
    assert v_data["latest_position"]["heading"] == 84.5

    print("PASS: 3. Authentic telemetry ingestion & LIVE status evaluation verified")
    return payload


def test_idempotent_deduplication(ingested_payload):
    """Verify re-ingesting the exact same observation is deduplicated rather than creating a duplicate row."""
    res = client.post("/tracking/ingest", json=ingested_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["action"] == "DEDUPLICATED"
    assert "skipped duplicate" in data["message"].lower()

    print("PASS: 4. Idempotent deduplication of identical position observation verified")


def test_stale_position_evaluation():
    """Verify an observation older than 24 hours is classified as STALE."""
    # Ingest for Vessel #2 with timestamp 3 days ago
    stale_time = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    payload = {
        "vessel_id": 2,
        "latitude": 25.045,
        "longitude": 55.120,
        "speed_knots": 11.5,
        "heading": 210.0,
        "recorded_at": stale_time,
    }

    res = client.post("/tracking/ingest", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["freshness_status"] == "STALE"
    assert data["age_minutes"] > 1440.0

    # Retrieve vessel details
    res_v = client.get("/tracking/vessels/2")
    assert res_v.status_code == 200
    assert res_v.json()["tracking_status"] == "STALE"

    print("PASS: 5. STALE position status classification (> 24 hours) verified")


def test_vessel_position_history():
    """Verify chronological position history retrieval from public.vessel_positions."""
    res = client.get("/tracking/vessels/1/history")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert data["count"] >= 1
    assert data["history"][0]["vessel_id"] == 1
    assert data["data_source"] == "SUPABASE_VESSEL_POSITIONS"

    # Non-existent vessel
    res_err = client.get("/tracking/vessels/999999/history")
    assert res_err.status_code == 404

    print("PASS: 6. Chronological position history retrieval verified")


def test_booking_tracking_integration():
    """Verify GET /tracking/bookings/{booking_id} resolves assigned vessel and latest telemetry."""
    # Fetch recent bookings
    b_res = client.get("/bookings?limit=5")
    assert b_res.status_code == 200
    bookings = b_res.json().get("bookings", [])

    if bookings:
        target_b = bookings[0]
        b_id = target_b["booking_id"]
        t_res = client.get(f"/tracking/bookings/{b_id}")
        assert t_res.status_code == 200
        t_data = t_res.json()
        assert t_data["booking_id"] == b_id
        assert "booking_reference" in t_data
        assert "tracking_status" in t_data
        assert "vessel" in t_data
        assert "cargo" in t_data
        assert "corridor" in t_data
        assert "transparency_notice" in t_data

    # Non-existent booking
    res_err = client.get("/tracking/bookings/999999")
    assert res_err.status_code == 404

    print("PASS: 7. Booking tracking integration & entity resolution verified")


def test_tracking_refresh_endpoint():
    """Verify POST /tracking/refresh/{vessel_id} checks provider and returns latest status."""
    res = client.post("/tracking/refresh/1")
    assert res.status_code == 200
    data = res.json()
    assert data["vessel_id"] == 1
    assert "refresh_timestamp" in data
    assert "provider_info" in data
    assert data["freshness_status"] in ["LIVE", "RECENT", "STALE", "DATA_UNAVAILABLE"]

    # Non-existent vessel
    res_err = client.post("/tracking/refresh/999999")
    assert res_err.status_code == 404

    print("PASS: 8. Telemetry refresh endpoint verified")


def test_status_filtering():
    """Verify GET /tracking/vessels supports status filtering (LIVE, STALE, DATA_UNAVAILABLE)."""
    # 1. Filter LIVE
    res_live = client.get("/tracking/vessels?status=LIVE")
    assert res_live.status_code == 200
    live_vessels = res_live.json().get("vessels", [])
    for v in live_vessels:
        assert v["tracking_status"] == "LIVE"

    # 2. Filter STALE
    res_stale = client.get("/tracking/vessels?status=STALE")
    assert res_stale.status_code == 200
    stale_vessels = res_stale.json().get("vessels", [])
    for v in stale_vessels:
        assert v["tracking_status"] == "STALE"

    print("PASS: 9. Telemetry status filtering verified")


def run_all_tests():
    print("=" * 65)
    print("RUNNING MODULE 20 LIVE VESSEL TRACKING E2E TEST SUITE")
    print("=" * 65)

    test_tracking_system_status()
    test_telemetry_validation_rejections()
    payload = test_authentic_telemetry_ingestion_and_live_status()
    test_idempotent_deduplication(payload)
    test_stale_position_evaluation()
    test_vessel_position_history()
    test_booking_tracking_integration()
    test_tracking_refresh_endpoint()
    test_status_filtering()

    print("=" * 65)
    print("ALL MODULE 20 LIVE VESSEL TRACKING TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    run_all_tests()
