"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 14: Historical ML Dataset Discovery, Validation & Audit Pipeline — Automated E2E Test Suite

Verifies:
1. Dataset discovery across Data/ and Supabase tables.
2. Schema inspection of authentic project datasets (Pub 150 port database).
3. Strict enforcement of zero synthetic data guarantee.
4. Validation of 8 core historical voyage dimensions.
5. Deduplication and normalization logic.
6. Module 15 ETA target assessment (actual_voyage_duration_hours).
7. Module 16 Cost target assessment (actual_total_voyage_cost).
8. Downstream Module 15 XGBoost contract verification (halts training per Rule 28).
9. Downstream Module 16 XGBoost contract verification (halts training per Rule 33).
10. Live FastAPI endpoint GET /dataset/historical/audit (HTTP 200 OK).
"""

import json
import urllib.request
import urllib.error
import pandas as pd
import numpy as np

from ml.dataset_pipeline import HistoricalDatasetPipeline
from ml.dataset_schema import audit_historical_dataset, HistoricalVoyageSchema
from ml.cost_schema import audit_historical_cost_dataset, HistoricalCostSchema


def test_1_dataset_discovery():
    """Verify discovery of authentic project datasets in Data/ and Supabase."""
    discovered = HistoricalDatasetPipeline.discover_project_datasets()
    assert len(discovered) >= 1, "Must discover at least the authentic project files in Data/"
    
    file_names = [d["file_name"] for d in discovered]
    assert any("updatedpub150.csv" in f for f in file_names), "Must discover updatedpub150.csv"
    assert any("ports_final.csv" in f for f in file_names), "Must discover ports_final.csv"
    
    # Check Pub 150 provenance
    pub_entry = next(d for d in discovered if "updatedpub150.csv" in d["file_name"])
    assert "Pub 150" in pub_entry["provenance"]
    assert pub_entry["is_voyage_dataset"] is False, "Pub 150 is a port database, not voyage log"
    assert pub_entry["row_count"] > 3000, f"Expected >3000 port rows, got {pub_entry['row_count']}"
    
    print(f"PASS: Test 1 - Dataset discovery ({len(discovered)} sources discovered, Pub 150: {pub_entry['row_count']} ports)")


def test_2_schema_inspection():
    """Verify schema inspection correctly identifies hydrographic port columns."""
    discovered = HistoricalDatasetPipeline.discover_project_datasets()
    pub_entry = next(d for d in discovered if "updatedpub150.csv" in d["file_name"])
    
    cols = pub_entry["columns"]
    assert len(cols) > 50, "Pub 150 should contain >50 NGA port attribute columns"
    assert "World Port Index Number" in cols or "OID_" in cols
    assert "Main Port Name" in cols or "Alternate Port Name" in cols
    
    # Ensure voyage departure/arrival columns are NOT in Pub 150
    assert "actual_voyage_duration_hours" not in cols
    assert "actual_total_voyage_cost" not in cols
    print(f"PASS: Test 2 - Schema inspection ({len(cols)} columns in Pub 150, zero fake voyage fields)")


def test_3_zero_synthetic_data_guarantee():
    """Verify pipeline strictly enforces zero synthetic data and reports DATA_UNAVAILABLE."""
    report = HistoricalDatasetPipeline.run_pipeline()
    
    assert report["data_authenticity_guarantee"]["zero_synthetic_data_enforced"] is True
    assert report["data_authenticity_guarantee"]["fabricated_timestamps_count"] == 0
    assert report["data_authenticity_guarantee"]["fabricated_durations_count"] == 0
    assert report["data_authenticity_guarantee"]["fabricated_costs_count"] == 0
    
    # Historical records discovered in authentic project files
    assert report["historical_records_discovered"] >= 0
    assert report["valid_records_after_cleaning"] >= 0
    print(f"PASS: Test 3 - Zero synthetic data guarantee (Discovered: {report['historical_records_discovered']}, Cleaned: {report['valid_records_after_cleaning']})")


def test_4_historical_dimensions_audit():
    """Verify validation of the 8 core historical voyage dimensions."""
    # When evaluated against empty/unprovided candidate dataset
    dims = HistoricalDatasetPipeline.validate_historical_voyage_dimensions(None)
    
    expected_dims = [
        "voyage_identifiers",
        "vessel_identifiers",
        "origin_destination",
        "departure_timestamps",
        "arrival_timestamps",
        "actual_voyage_duration",
        "actual_settlement_cost",
        "currency_and_units",
    ]
    for ed in expected_dims:
        assert ed in dims, f"Dimension {ed} must be in audit results"
        assert dims[ed]["status"] == "DATA_UNAVAILABLE"
        assert dims[ed]["missing_count"] == 0
        assert dims[ed]["record_count"] == 0
    
    # When evaluated against a sample candidate dataframe
    sample_df = pd.DataFrame([
        {
            "voyage_id": "VY-101",
            "vessel_id": 1,
            "origin_port_id": 54620,
            "destination_port_id": 60140,
            "departure_timestamp": "2026-08-01T00:00:00Z",
            "arrival_timestamp": "2026-08-10T12:00:00Z",
            "actual_voyage_duration_hours": 228.0,
            "actual_total_voyage_cost": 485000.0,
            "currency": "USD",
        }
    ])
    sample_dims = HistoricalDatasetPipeline.validate_historical_voyage_dimensions(sample_df)
    for ed in expected_dims:
        assert sample_dims[ed]["status"] == "actual"
        assert sample_dims[ed]["missing_count"] == 0
        assert sample_dims[ed]["record_count"] == 1
    
    print("PASS: Test 4 - Validation of 8 core historical voyage dimensions")


def test_5_data_cleaning_and_deduplication():
    """Verify cleaning, whitespace stripping, and duplicate detection."""
    dirty_df = pd.DataFrame([
        {"voyage_id": " VY-001 ", "vessel_id": 1, "cargo_type": " Dry Bulk "},
        {"voyage_id": "VY-001", "vessel_id": 1, "cargo_type": "Dry Bulk"},  # Duplicate
        {"voyage_id": "VY-002", "vessel_id": 2, "cargo_type": "NULL"},
    ])
    
    cleaned, stats = HistoricalDatasetPipeline.clean_and_deduplicate(
        dirty_df, key_columns=["voyage_id"]
    )
    
    assert stats["initial_row_count"] == 3
    assert stats["duplicate_count"] == 1
    assert stats["final_row_count"] == 2
    assert cleaned.iloc[0]["voyage_id"] == "VY-001"
    assert cleaned.iloc[0]["cargo_type"] == "Dry Bulk"
    assert pd.isna(cleaned.iloc[1]["cargo_type"])  # "NULL" converted to NaN
    print("PASS: Test 5 - Data cleaning & duplicate detection (1 duplicate removed, whitespace stripped)")


def test_6_module_15_target_assessment():
    """Verify target availability assessment for Module 15 (actual_voyage_duration_hours)."""
    target_info = HistoricalDatasetPipeline.assess_target_availability(None)
    m15 = target_info["module_15_eta"]
    
    assert m15["target_name"] == "actual_voyage_duration_hours"
    assert m15["is_available"] is False
    assert m15["readiness"] == "PENDING_HISTORICAL_DATA"
    assert "Rule 28" in m15["reason"] or "empty" in m15["reason"].lower()
    print("PASS: Test 6 - Module 15 target assessment (actual_voyage_duration_hours marked unavailable)")


def test_7_module_16_target_assessment():
    """Verify target availability assessment for Module 16 (actual_total_voyage_cost)."""
    target_info = HistoricalDatasetPipeline.assess_target_availability(None)
    m16 = target_info["module_16_cost"]
    
    assert m16["target_name"] == "actual_total_voyage_cost"
    assert m16["is_available"] is False
    assert m16["readiness"] == "PENDING_HISTORICAL_DATA"
    assert "Rule 33" in m16["reason"] or "empty" in m16["reason"].lower()
    print("PASS: Test 7 - Module 16 target assessment (actual_total_voyage_cost marked unavailable)")


def test_8_downstream_module_15_contract():
    """Verify downstream contract compatibility with Module 15 XGBoost training audit."""
    audit = audit_historical_dataset(None)
    assert audit["status"] == "empty"
    assert audit["is_sufficient"] is False
    assert audit["target_available"] is False
    assert "Rule 28" in audit["reason"]
    print("PASS: Test 8 - Downstream Module 15 contract verification (halts training per Rule 28)")


def test_9_downstream_module_16_contract():
    """Verify downstream contract compatibility with Module 16 XGBoost training audit."""
    cost_audit = audit_historical_cost_dataset(None)
    assert cost_audit["status"] == "empty"
    assert cost_audit["is_sufficient"] is False
    assert cost_audit["target_available"] is False
    assert "Rule 33" in cost_audit["reason"]
    print("PASS: Test 9 - Downstream Module 16 contract verification (halts training per Rule 33)")


def test_10_live_fastapi_audit_endpoint():
    """Verify live HTTP GET /dataset/historical/audit returns HTTP 200 with structured audit report."""
    url = "http://127.0.0.1:8000/dataset/historical/audit"
    req = urllib.request.Request(url, method="GET")
    
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode("utf-8"))
    
    assert data["status"] in ["COMPLETE", "BLOCKED"]
    assert data["pipeline"]["name"] == "Module 14: Historical ML Dataset Pipeline"
    assert "datasets_discovered" in data
    assert "historical_dimensions" in data
    assert "targets_assessment" in data
    print(f"PASS: Test 10 - Live FastAPI GET /dataset/historical/audit returns 200 (Status: {data['status']}, Blockers: {len(data.get('remaining_blockers', []))})")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MODULE 14 HISTORICAL ML DATASET E2E TESTS")
    print("=" * 60)
    test_1_dataset_discovery()
    test_2_schema_inspection()
    test_3_zero_synthetic_data_guarantee()
    test_4_historical_dimensions_audit()
    test_5_data_cleaning_and_deduplication()
    test_6_module_15_target_assessment()
    test_7_module_16_target_assessment()
    test_8_downstream_module_15_contract()
    test_9_downstream_module_16_contract()
    test_10_live_fastapi_audit_endpoint()
    print("=" * 60)
    print("ALL 10 MODULE 14 HISTORICAL DATASET E2E TESTS PASSED!")
    print("=" * 60)
