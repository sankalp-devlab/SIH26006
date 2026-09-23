"""
Automated E2E Test Suite for Module 15 XGBoost ETA Prediction Engine
SIH PS 26006 — Maritime Cargo Intelligence Platform

Tests:
1. Module 14 Data Audit: Verifies 0 historical records accurately detected and halts training per Rule 28.
2. Feature Pipeline: Deterministic 12-feature vector extraction and vessel type encoding.
3. Zero-Synthetic-Data Compliance: Validates no fake voyages or synthetic labels are generated.
4. POST /ml/eta/predict Endpoint: Responds with 200 OK and transparent 'unavailable' status with full explanation.
5. Baseline ETA Benchmark: Verifies Module 13 baseline ETA is returned alongside ML prediction for comparison.
6. Validation Error Handling: 404 on invalid vessel, 404 on invalid cargo, 400 on missing route, 400 on corridor mismatch.
7. Ad-hoc prediction support: Works for arbitrary corridors without cargo_id.
"""

import json
import urllib.request
import urllib.error
import sys
import os

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
    print("RUNNING MODULE 15 XGBOOST ETA ENGINE E2E TESTS")
    print("=" * 60)

    # ----------------------------------------------------
    # Test 1: Authoritative Data Audit & Rule 28 Compliance
    # ----------------------------------------------------
    backend_dir = os.path.dirname(__file__)
    sys.path.insert(0, backend_dir)
    from ml.dataset_schema import audit_historical_dataset
    from ml.feature_pipeline import EtaFeaturePipeline

    audit = audit_historical_dataset(None)
    assert audit["status"] == "empty", f"Expected 'empty', got {audit['status']}"
    assert audit["is_sufficient"] is False
    assert "Rule 28" in audit["reason"] or "empty" in audit["reason"].lower()
    print("PASS: Test 1 - Historical Data Audit accurately halts on 0 rows (Rule 28 Zero-Fake-Data compliance)")

    # ----------------------------------------------------
    # Test 2: Feature Pipeline Determinism & Column Ordering
    # ----------------------------------------------------
    sample_payload = {
        "cargo_id": 1,
        "vessel_id": 1,
        "vessel_type": "Handysize",
        "distance_nm": 3384.6,
        "effective_speed_knots": 14.0,
        "capacity_tons": 38200,
        "draft_m": 10.5,
        "cargo_weight_tons": 35000,
        "departure_time": "2026-10-01T08:00:00Z",
    }
    feat_df = EtaFeaturePipeline.extract_features_from_dict(sample_payload)
    assert list(feat_df.columns) == EtaFeaturePipeline.FEATURE_COLUMNS, "Feature column ordering mismatch"
    assert feat_df["distance_nm"].iloc[0] == 3384.6
    assert feat_df["effective_speed_knots"].iloc[0] == 14.0
    assert feat_df["vessel_type_encoded"].iloc[0] == 0  # handysize = 0
    assert feat_df["departure_month"].iloc[0] == 10
    print("PASS: Test 2 - Feature Engineering Pipeline produces deterministic 12-feature ordered vector")

    # ----------------------------------------------------
    # Test 3: POST /ml/eta/predict Endpoint Execution
    # ----------------------------------------------------
    status, res = post_json("/ml/eta/predict", {
        "cargo_id": 1,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140,
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["model_name"] == "xgboost_eta"
    assert res["prediction_status"] == "unavailable", f"Expected unavailable, got {res['prediction_status']}"
    assert "Module 14" in res["status_reason"] or "synthetic" in res["status_reason"].lower()
    assert res["features_used"] is not None
    assert len(res["features_used"]) == 12
    print("PASS: Test 3 - POST /ml/eta/predict responds 200 OK with transparent 'unavailable' status (zero fake ML)")

    # ----------------------------------------------------
    # Test 4: Module 13 Baseline ETA Benchmark Integration
    # ----------------------------------------------------
    assert res["baseline_duration_hours"] is not None, "Expected baseline_duration_hours"
    assert res["baseline_duration_hours"] > 200.0, f"Expected >200 hrs, got {res['baseline_duration_hours']}"
    assert res["baseline_arrival"] is not None, "Expected baseline_arrival timestamp"
    print(f"PASS: Test 4 - Baseline ETA benchmark integration verified ({res['baseline_duration_hours']} sailing hours)")

    # ----------------------------------------------------
    # Test 5: Invalid Vessel ID (404)
    # ----------------------------------------------------
    status, res_err = post_json("/ml/eta/predict", {
        "cargo_id": 1,
        "vessel_id": 999999,
        "origin_port_id": 54620,
        "destination_port_id": 60140,
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res_err["detail"].lower()
    print("PASS: Test 5 - Invalid Vessel Handled with 404")

    # ----------------------------------------------------
    # Test 6: Invalid Cargo ID (404)
    # ----------------------------------------------------
    status, res_err = post_json("/ml/eta/predict", {
        "cargo_id": 999999,
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140,
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "not found" in res_err["detail"].lower()
    print("PASS: Test 6 - Invalid Cargo Handled with 404")

    # ----------------------------------------------------
    # Test 7: Missing Route Information (400)
    # ----------------------------------------------------
    status, res_err = post_json("/ml/eta/predict", {
        "vessel_id": 1,
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "route information is required" in res_err["detail"].lower()
    print("PASS: Test 7 - Missing Route Handled with 400")

    # ----------------------------------------------------
    # Test 8: Mismatched Route Corridor & Cargo Itinerary (400)
    # ----------------------------------------------------
    status, res_err = post_json("/ml/eta/predict", {
        "cargo_id": 1,
        "vessel_id": 1,
        "origin_port_id": 48840,  # Mismatched origin
        "destination_port_id": 60140,
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "does not match cargo itinerary" in res_err["detail"].lower()
    print("PASS: Test 8 - Mismatched Corridor Rejected with 400")

    # ----------------------------------------------------
    # Test 9: Ad-Hoc Corridor Prediction (no cargo_id)
    # ----------------------------------------------------
    status, res_adhoc = post_json("/ml/eta/predict", {
        "vessel_id": 1,
        "origin_port_id": 54620,
        "destination_port_id": 60140,
    })
    assert status == 200
    assert res_adhoc["cargo_id"] is None
    assert res_adhoc["baseline_duration_hours"] > 0
    print("PASS: Test 9 - Ad-Hoc Corridor ML Prediction endpoint functional")

    # ----------------------------------------------------
    # Test 10: Zero-Synthetic-Data Verification
    # ----------------------------------------------------
    # Ensure no fake training rows or synthetic models were written to disk
    models_dir = os.path.join(backend_dir, "ml", "models")
    model_file = os.path.join(models_dir, "eta_xgboost_v1.json")
    assert not os.path.exists(model_file), "CRITICAL: A fake model file was found on disk! Rule 28 strictly forbids fake models."
    print("PASS: Test 10 - Zero Fake Models Verified on Disk (Rule 28 Integrity Preserved)")

    print("=" * 60)
    print("ALL 10 MODULE 15 XGBOOST ETA E2E TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
