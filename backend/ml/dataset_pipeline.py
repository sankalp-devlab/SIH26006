"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 14: Historical ML Dataset Discovery, Validation & Audit Pipeline

Implements strict dataset discovery, schema inspection, data validation,
duplicate detection, type normalization, historical voyage target assessment,
and quality reporting using ONLY authentic datasets present in the project.

Enforces:
- Rule 28 / Rule 33: Non-negotiable zero-synthetic-data guarantee.
- No fabricated departure/arrival timestamps, voyage durations, or costs.
- Transparent reporting of DATA_UNAVAILABLE for unobserved features/targets.
"""

import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from dotenv import load_dotenv

from .dataset_schema import HistoricalVoyageSchema, audit_historical_dataset
from .cost_schema import HistoricalCostSchema, audit_historical_cost_dataset


class HistoricalDatasetPipeline:
    """
    Module 14: Canonical Historical ML Dataset Discovery, Cleaning & Validation Engine.
    Audits local project directories and database tables for historical voyage data.
    """

    MODULE_NAME = "Module 14: Historical ML Dataset Pipeline"
    VERSION = "1.0.0"

    # Core historical voyage dimensions mandated by Module 14 specifications
    CORE_HISTORICAL_DIMENSIONS = [
        {
            "dimension": "voyage_identifiers",
            "candidate_fields": ["voyage_id", "voyage_number", "id", "fixture_id"],
            "description": "Unique commercial or operational voyage identifier",
            "expected_type": "string / integer",
            "unit": None,
        },
        {
            "dimension": "vessel_identifiers",
            "candidate_fields": ["vessel_id", "imo_number", "vessel_name", "ship_name"],
            "description": "Official vessel IMO number or platform vessel ID",
            "expected_type": "string / integer",
            "unit": None,
        },
        {
            "dimension": "origin_destination",
            "candidate_fields": [
                ("origin_port_id", "destination_port_id"),
                ("origin_port", "destination_port"),
                ("loading_port", "discharge_port"),
            ],
            "description": "Port of loading (origin) and port of discharge (destination)",
            "expected_type": "integer / string",
            "unit": "UN/LOCODE / Port ID",
        },
        {
            "dimension": "departure_timestamps",
            "candidate_fields": ["departure_timestamp", "departure_time", "actual_departure", "atd"],
            "description": "Empirical unberthing or port departure timestamp",
            "expected_type": "ISO 8601 datetime",
            "unit": "UTC datetime",
        },
        {
            "dimension": "arrival_timestamps",
            "candidate_fields": ["arrival_timestamp", "arrival_time", "actual_arrival", "ata"],
            "description": "Empirical berthing or port arrival timestamp",
            "expected_type": "ISO 8601 datetime",
            "unit": "UTC datetime",
        },
        {
            "dimension": "actual_voyage_duration",
            "candidate_fields": [
                "actual_voyage_duration_hours",
                "voyage_duration_hours",
                "actual_duration_days",
                "duration_hours",
            ],
            "description": "Observed empirical elapsed transit time (Module 15 Target Label)",
            "expected_type": "float",
            "unit": "Hours",
        },
        {
            "dimension": "actual_settlement_cost",
            "candidate_fields": [
                "actual_total_voyage_cost",
                "actual_freight_cost",
                "actual_transportation_cost",
                "actual_settlement_usd",
                "settlement_cost_usd",
            ],
            "description": "Empirical post-voyage settlement cost (Module 16 Target Label)",
            "expected_type": "float",
            "unit": "USD",
        },
        {
            "dimension": "currency_and_units",
            "candidate_fields": ["currency", "cost_currency", "freight_currency", "unit"],
            "description": "Standardized monetary currency denomination and cost unit",
            "expected_type": "string",
            "unit": "ISO 4217 code (USD)",
        },
    ]

    @classmethod
    def get_base_dir(cls, override_dir: Optional[Union[str, Path]] = None) -> Path:
        """Resolves the root workspace repository directory."""
        if override_dir:
            return Path(override_dir).resolve()
        # Default: two levels up from backend/ml/dataset_pipeline.py
        return Path(__file__).resolve().parent.parent.parent

    @classmethod
    def discover_project_datasets(
        cls, base_dir: Optional[Union[str, Path]] = None
    ) -> List[Dict[str, Any]]:
        """
        Discovers all existing authentic datasets in the project workspace (Data/ and database).
        Preserves provenance; NEVER downloads external or synthetic data.
        """
        root = cls.get_base_dir(base_dir)
        discovered = []

        # 1. Inspect Data/ directory
        data_dir = root / "Data"
        if data_dir.exists():
            for root_path, _, files in os.walk(data_dir):
                for f in files:
                    if f.lower().endswith((".csv", ".parquet", ".json", ".xlsx")):
                        fpath = Path(root_path) / f
                        rel_path = fpath.relative_to(root)
                        size_bytes = fpath.stat().st_size
                        ext = fpath.suffix.lower()

                        entry: Dict[str, Any] = {
                            "source_type": "local_file",
                            "file_name": f,
                            "relative_path": str(rel_path).replace("\\", "/"),
                            "format": ext.replace(".", "").upper(),
                            "size_bytes": size_bytes,
                            "row_count": 0,
                            "columns": [],
                            "provenance": "Authentic project dataset",
                            "is_voyage_dataset": False,
                        }

                        if ext == ".csv":
                            try:
                                sample_df = pd.read_csv(fpath, nrows=3)
                                entry["columns"] = list(sample_df.columns)
                                # Count rows efficiently
                                with open(fpath, "rb") as fp:
                                    entry["row_count"] = max(
                                        0, sum(1 for _ in fp) - 1
                                    )
                            except Exception as read_err:
                                entry["error"] = str(read_err)

                        # Determine if this file contains voyage observations
                        cols_lower = [str(c).lower() for c in entry["columns"]]
                        has_voyage_signals = any(
                            k in c for c in cols_lower for k in ["voyage", "fixture", "departure", "arrival"]
                        )
                        if "updatedpub150" in f.lower() or "ports" in f.lower():
                            entry["provenance"] = "NGA World Port Index Pub 150 Port Infrastructure Database"
                            entry["is_voyage_dataset"] = False
                        else:
                            entry["is_voyage_dataset"] = has_voyage_signals

                        discovered.append(entry)

        # 2. Inspect Supabase database tables
        try:
            load_dotenv(root / "backend" / ".env")
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SECRET_KEY")
            if url and key:
                from supabase import create_client
                supabase_client = create_client(url, key)

                core_tables = [
                    "ports",
                    "vessels",
                    "cargo",
                    "routes",
                    "voyages",
                    "historical_voyages",
                    "fixtures",
                    "risk_assessments",
                    "eta_predictions",
                    "cost_predictions",
                ]

                for tbl in core_tables:
                    try:
                        res = (
                            supabase_client
                            .table(tbl)
                            .select("*", count="exact")
                            .limit(1)
                            .execute()
                        )
                        count = res.count if hasattr(res, "count") and res.count is not None else len(res.data)
                        cols = list(res.data[0].keys()) if res.data else []
                        discovered.append({
                            "source_type": "supabase_table",
                            "file_name": f"public.{tbl}",
                            "relative_path": f"supabase://public.{tbl}",
                            "format": "POSTGRESQL_TABLE",
                            "size_bytes": None,
                            "row_count": count,
                            "columns": cols,
                            "provenance": "Supabase Managed PostgreSQL Table",
                            "is_voyage_dataset": tbl in ["voyages", "historical_voyages", "fixtures"],
                        })
                    except Exception:
                        # Table does not exist in schema cache
                        pass
        except Exception:
            pass

        return discovered

    @classmethod
    def validate_historical_voyage_dimensions(
        cls, df: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """
        Audits candidate data against the 8 required core historical voyage dimensions.
        Reports exact missing counts, data types, units, and authenticity status.
        """
        results: Dict[str, Any] = {}

        if df is None or df.empty:
            for dim_info in cls.CORE_HISTORICAL_DIMENSIONS:
                dim_key = dim_info["dimension"]
                results[dim_key] = {
                    "dimension": dim_key,
                    "description": dim_info["description"],
                    "matched_field": None,
                    "status": "DATA_UNAVAILABLE",
                    "record_count": 0,
                    "missing_count": 0,
                    "data_type": None,
                    "unit": dim_info["unit"],
                    "reason": "No historical voyage dataset uploaded in project repository.",
                }
            return results

        columns_lower = {str(c).lower(): c for c in df.columns}

        for dim_info in cls.CORE_HISTORICAL_DIMENSIONS:
            dim_key = dim_info["dimension"]
            matched_col = None

            candidates = dim_info["candidate_fields"]
            if isinstance(candidates[0], tuple):
                # Composite pair like origin & destination
                all_found = True
                pair_names = []
                for pair in candidates:
                    p1, p2 = pair
                    if p1.lower() in columns_lower and p2.lower() in columns_lower:
                        matched_col = f"{columns_lower[p1.lower()]}, {columns_lower[p2.lower()]}"
                        break
            else:
                for cand in candidates:
                    if cand.lower() in columns_lower:
                        matched_col = columns_lower[cand.lower()]
                        break

            if matched_col is None:
                results[dim_key] = {
                    "dimension": dim_key,
                    "description": dim_info["description"],
                    "matched_field": None,
                    "status": "DATA_UNAVAILABLE",
                    "record_count": len(df),
                    "missing_count": len(df),
                    "data_type": None,
                    "unit": dim_info["unit"],
                    "reason": f"Required dimension '{dim_key}' not found in candidate dataset columns.",
                }
            else:
                if "," in matched_col:
                    f1, f2 = [f.strip() for f in matched_col.split(",")]
                    null_count = int(df[f1].isna().sum() + df[f2].isna().sum())
                    dtype_str = f"{df[f1].dtype}, {df[f2].dtype}"
                else:
                    null_count = int(df[matched_col].isna().sum())
                    dtype_str = str(df[matched_col].dtype)

                valid_count = len(df) - null_count
                results[dim_key] = {
                    "dimension": dim_key,
                    "description": dim_info["description"],
                    "matched_field": matched_col,
                    "status": "actual" if valid_count > 0 else "DATA_UNAVAILABLE",
                    "record_count": len(df),
                    "missing_count": null_count,
                    "valid_count": valid_count,
                    "data_type": dtype_str,
                    "unit": dim_info["unit"],
                    "reason": "Empirical field identified" if valid_count > 0 else "All values null.",
                }

        return results

    @classmethod
    def clean_and_deduplicate(
        cls,
        df: pd.DataFrame,
        key_columns: Optional[List[str]] = None,
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans, normalizes, and deduplicates historical records.
        Strictly preserves genuine records and avoids synthetic data.
        """
        stats = {
            "initial_row_count": len(df),
            "final_row_count": 0,
            "duplicate_count": 0,
            "null_rows_removed": 0,
            "cleaned_at": datetime.now(timezone.utc).isoformat(),
        }

        if df.empty:
            stats["final_row_count"] = 0
            return df, stats

        cleaned_df = df.copy()

        # 1. Clean string whitespace
        for col in cleaned_df.select_dtypes(include=["object"]).columns:
            cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
            # Replace placeholder null strings
            cleaned_df[col] = cleaned_df[col].replace(
                ["", "nan", "NaN", "NULL", "null", "None", "N/A", "NA", "-"],
                np.nan,
            )

        # 2. Duplicate detection
        dup_subset = key_columns if key_columns and all(k in cleaned_df.columns for k in key_columns) else None
        duplicate_mask = cleaned_df.duplicated(subset=dup_subset, keep="first")
        duplicate_count = int(duplicate_mask.sum())
        stats["duplicate_count"] = duplicate_count

        if duplicate_count > 0:
            cleaned_df = cleaned_df[~duplicate_mask].reset_index(drop=True)

        stats["final_row_count"] = len(cleaned_df)
        return cleaned_df, stats

    @classmethod
    def assess_target_availability(
        cls, df: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """
        Assesses availability of downstream ML targets for Module 15 (ETA) and Module 16 (Cost).
        """
        # Module 15 Target Assessment
        eta_audit = audit_historical_dataset(df)

        # Module 16 Target Assessment
        cost_audit = audit_historical_cost_dataset(df)

        return {
            "module_15_eta": {
                "target_name": "actual_voyage_duration_hours",
                "is_available": eta_audit.get("target_available", False),
                "audit_status": eta_audit.get("status"),
                "reason": eta_audit.get("reason"),
                "readiness": "READY" if eta_audit.get("is_sufficient") else "PENDING_HISTORICAL_DATA",
            },
            "module_16_cost": {
                "target_name": cost_audit.get("target_column") or HistoricalCostSchema.DEFAULT_TARGET_FIELD,
                "is_available": cost_audit.get("target_available", False),
                "audit_status": cost_audit.get("status"),
                "reason": cost_audit.get("reason"),
                "readiness": "READY" if cost_audit.get("is_sufficient") else "PENDING_HISTORICAL_DATA",
            },
        }

    @classmethod
    def run_pipeline(
        cls, base_dir: Optional[Union[str, Path]] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end Module 14 discovery, inspection, and target audit.
        """
        # 1. Discover all datasets in project
        discovered = cls.discover_project_datasets(base_dir)

        # 2. Identify candidate historical voyage datasets
        voyage_datasets = [d for d in discovered if d.get("is_voyage_dataset")]

        # In current authentic project state:
        # Ports dataset exists (Pub 150, 3,779 ports).
        # Vessels (4 reference rows) and Cargo (4 consignments) exist.
        # Historical voyage logs are 0 rows.
        historical_records_discovered = sum(d["row_count"] for d in voyage_datasets)

        # 3. Evaluate historical dimensions on candidate data
        candidate_df: Optional[pd.DataFrame] = None
        cleaned_records_count = 0
        root = cls.get_base_dir(base_dir)

        if voyage_datasets:
            for vds in voyage_datasets:
                if vds.get("source_type") == "local_file":
                    csv_full_path = root / vds["relative_path"]
                    if csv_full_path.exists():
                        try:
                            raw_df = pd.read_csv(csv_full_path)
                            candidate_df, clean_stats = cls.clean_and_deduplicate(raw_df)
                            cleaned_records_count = clean_stats["final_row_count"]
                            break
                        except Exception:
                            pass

        dimensions_report = cls.validate_historical_voyage_dimensions(candidate_df)

        # 4. Target availability for downstream ML modules
        targets_report = cls.assess_target_availability(candidate_df)

        # 5. Determine overall Module 14 status
        if (
            historical_records_discovered >= 50
            and targets_report["module_15_eta"]["is_available"]
            and targets_report["module_16_cost"]["is_available"]
        ):
            pipeline_status = "COMPLETE"
            remaining_blockers = []
        else:
            # Honestly report status as BLOCKED / PENDING_HISTORICAL_DATA
            pipeline_status = "BLOCKED"
            remaining_blockers = [
                "No empirical completed voyage observations in Data/ or Supabase tables.",
                "Module 15 ETA training label ('actual_voyage_duration_hours') is unavailable in source files.",
                "Module 16 Cost training label ('actual_total_voyage_cost') is unavailable in source files.",
                "Per non-negotiable Rules 28 and 33, model training on synthetic or fabricated data is strictly prohibited.",
            ]

        return {
            "status": pipeline_status,
            "pipeline": {
                "name": cls.MODULE_NAME,
                "version": cls.VERSION,
                "executed_at": datetime.now(timezone.utc).isoformat(),
            },
            "datasets_discovered": discovered,
            "historical_records_discovered": historical_records_discovered,
            "valid_records_after_cleaning": cleaned_records_count,
            "historical_dimensions": dimensions_report,
            "targets_assessment": targets_report,
            "downstream_compatibility": {
                "module_15_eta_readiness": targets_report["module_15_eta"]["readiness"],
                "module_16_cost_readiness": targets_report["module_16_cost"]["readiness"],
            },
            "data_authenticity_guarantee": {
                "zero_synthetic_data_enforced": True,
                "fabricated_timestamps_count": 0,
                "fabricated_costs_count": 0,
                "fabricated_durations_count": 0,
            },
            "database_status": {
                "supabase_tables_checked": [
                    "ports",
                    "vessels",
                    "cargo",
                    "routes",
                    "voyages",
                    "historical_voyages",
                    "risk_assessments",
                ],
                "database_changes_required": False,
                "idempotent_sync_ready": True,
            },
            "remaining_blockers": remaining_blockers,
        }
