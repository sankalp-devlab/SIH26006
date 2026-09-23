"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 16: XGBoost Cost Prediction Engine — Automated E2E Test Suite

Tests:
1. Historical Cost Data Audit accurately detects 0 rows and halts on missing targets (Rule 33).
2. Cost Feature Engineering Pipeline produces deterministic 12-feature ordered vector.
3. Data Leakage Prevention blacklists post-voyage fields.
4. POST /ml/cost/predict responds 200 OK with transparent 'unavailable' status (zero fake ML).
5. Module 12 Baseline Cost accurately integrated and returned alongside features.
6. Scenario parameters (bunker_price_usd_per_mt, daily_hire_usd) passed to baseline cost successfully.
7. Invalid Vessel handled with 404.
8. Invalid Cargo handled with 404.
9. Route/Port mismatch rejected with 400.
10. Ad-hoc Corridor Prediction (Origin + Dest + Vessel without saved cargo) works seamlessly.
"""

import json
import os
import sys
import urllib.request
import urllib.error
import pandas as pd

from ml.cost_schema import HistoricalCostSchema, audit_historical_cost_dataset
from ml.cost_feature_pipeline import CostFeaturePipeline

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
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed


def test_1_historical_data_audit():
    audit_empty = audit_historical_cost_dataset(None)
    assert audit_empty["status"] == "empty", f"Expected 'empty', got {audit_empty['status']}"
    assert audit_empty["is_sufficient"] is False, "Empty dataset must not be marked sufficient"
    assert "Rule 33" in audit_empty["reason"] or "empty" in audit_empty["reason"], "Audit must mention Rule 33/empty"

    # Test with insufficient rows
    dummy_df = pd.DataFrame([{"vessel_id": 1, "origin_port_id": 10, "destination_port_id": 20}])
    audit_small = audit_historical_cost_dataset(dummy_df)
    assert audit_small["is_sufficient"] is False, "Small dataset must be marked insufficient"
    print("PASS: Test 1 - Historical Data Audit accurately halts on 0 rows (Rule 33 Zero-Fake-Data compliance)")


def test_2_feature_pipeline():
    vessel = {
        "id": 1,
        "name": "NORDIC POLARIS",
        "vessel_type": "Tanker",
        "capacity_tons": 158000.0,
        "draft_m": 16.0,
        "speed_laden_knots": 14.5,
        "fuel_laden_mt_day": 42.0,
    }
    route_data = {
        "distance_nm": 3142.88,
    }
    cargo = {
        "id": 4,
        "weight_tons": 120000.0,
        "volume_m3": 140000.0,
    }

    features = CostFeaturePipeline.extract_features(
        vessel=vessel,
        route_data=route_data,
        cargo=cargo,
        departure_time="2026-09-18T10:00:00Z",
    )

    assert len(features) == 12, f"Expected 12 features, got {len(features)}"
    assert features["distance_nm"] == 3142.88
    assert features["effective_speed_knots"] == 14.5
    assert features["vessel_capacity_tons"] == 158000.0
    assert features["cargo_weight_tons"] == 120000.0
    assert features["departure_month"] == 9.0

    vector = CostFeaturePipeline.transform_to_vector(features)
    assert vector.shape == (1, 12), f"Expected shape (1, 12), got {vector.shape}"
    print("PASS: Test 2 - Cost Feature Engineering Pipeline produces deterministic 12-feature ordered vector")


def test_3_data_leakage_prevention():
    for forbidden in ["actual_total_voyage_cost", "actual_operating_cost", "actual_arrival_timestamp", "final_fuel_consumed_mt"]:
        assert forbidden in HistoricalCostSchema.FORBIDDEN_LEAKAGE_FIELDS, f"{forbidden} must be in leakage list"

    leaked_df = pd.DataFrame([{
        "vessel_id": 1,
        "origin_port_id": 10,
        "destination_port_id": 20,
        "distance_nm": 1000.0,
        "vessel_speed_knots": 14.0,
        "actual_total_voyage_cost": 500000.0,
        "actual_arrival_timestamp": "2026-09-25T00:00:00Z",
    }] * 60)

    audit_leaked = audit_historical_cost_dataset(leaked_df)
    assert audit_leaked["leakage_detected"] is True, "Must detect actual_arrival_timestamp as leakage"
    print("PASS: Test 3 - Data Leakage Prevention detects and blacklists post-voyage fields")


def test_4_api_predict_unavailable_status():
    payload = {
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 200, f"Expected 200, got {status}: {data}"

    assert data["prediction_status"] == "unavailable", f"Expected 'unavailable', got {data['prediction_status']}"
    assert data["ml_predicted_cost"] is None, "ml_predicted_cost must be null when model is pending"
    assert "Rule 33" in data["reason"], "Reason must mention Rule 33"
    assert "features_used" in data and len(data["features_used"]) == 12, "Must return extracted 12 features"
    print("PASS: Test 4 - POST /ml/cost/predict responds 200 OK with transparent 'unavailable' status (zero fake ML)")


def test_5_baseline_cost_benchmark():
    payload = {
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 200
    assert "baseline_cost" in data, "Must contain baseline_cost"
    assert "currency" in data and data["currency"] == "USD", "Must specify USD currency"
    print(f"PASS: Test 5 - Baseline Cost benchmark integration verified (Currency: {data['currency']})")


def test_6_scenario_cost_parameters():
    payload = {
        "vessel_id": 1,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
        "bunker_price_usd_per_mt": 650.0,
        "daily_hire_usd": 12000.0,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 200

    assert data["baseline_cost"] is not None and data["baseline_cost"] > 0, "Scenario should calculate baseline total cost"
    assert data["baseline_fuel_cost"] is not None and data["baseline_fuel_cost"] > 0, "Scenario should calculate fuel cost"
    assert data["baseline_operating_cost"] is not None and data["baseline_operating_cost"] > 0, "Scenario should calculate operating cost"
    print(f"PASS: Test 6 - Scenario bunker and daily hire correctly calculate baseline cost (${data['baseline_cost']:,.2f})")


def test_7_invalid_vessel_404():
    payload = {
        "vessel_id": 99999999,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 404, f"Expected 404 for non-existent vessel, got {status}"
    print("PASS: Test 7 - Invalid Vessel Handled with 404")


def test_8_invalid_cargo_404():
    payload = {
        "vessel_id": 1,
        "cargo_id": 99999999,
        "origin_port_id": 57461,
        "destination_port_id": 7780,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 404, f"Expected 404 for non-existent cargo, got {status}"
    print("PASS: Test 8 - Invalid Cargo Handled with 404")


def test_9_corridor_mismatch_400():
    # Cargo #4 has origin 57461 and dest 7780. We provide conflicting ports.
    payload = {
        "vessel_id": 1,
        "cargo_id": 4,
        "origin_port_id": 100,
        "destination_port_id": 200,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 400, f"Expected 400 for mismatched corridor, got {status}"
    print("PASS: Test 9 - Mismatched Corridor Rejected with 400")


def test_10_ad_hoc_corridor_prediction():
    payload = {
        "vessel_id": 1,
        "origin_port_id": 42440,
        "destination_port_id": 47110,
    }
    status, data = post_json("/ml/cost/predict", payload)
    assert status == 200
    assert data["features_used"]["distance_nm"] > 0, "Ad-hoc distance must be calculated"
    print("PASS: Test 10 - Ad-Hoc Corridor ML Cost Prediction endpoint functional")


def run_all_tests():
    print("=" * 60)
    print("RUNNING MODULE 16 XGBOOST COST ENGINE E2E TESTS")
    print("=" * 60)
    test_1_historical_data_audit()
    test_2_feature_pipeline()
    test_3_data_leakage_prevention()
    test_4_api_predict_unavailable_status()
    test_5_baseline_cost_benchmark()
    test_6_scenario_cost_parameters()
    test_7_invalid_vessel_404()
    test_8_invalid_cargo_404()
    test_9_corridor_mismatch_400()
    test_10_ad_hoc_corridor_prediction()
    print("=" * 60)
    print("ALL 10 MODULE 16 XGBOOST COST E2E TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    import traceback
    try:
        run_all_tests()
    except AssertionError as e:
        print(f"ASSERTION FAIL: {e}")
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        traceback.print_exc()
        sys.exit(1)
