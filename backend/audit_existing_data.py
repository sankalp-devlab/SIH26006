"""
Deep data audit script for OceanLens database and local datasets.
Audits table schemas, row counts, actual column names, and real historical labels.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
import pandas as pd
from supabase import create_client

load_dotenv(Path(__file__).parent / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")

print("=== OCEANLENS DATA AUDIT ===")
print(f"Supabase URL: {url[:25]}..." if url else "Supabase URL: None")

if not url or not key:
    print("ERROR: Supabase credentials missing from backend/.env")
    exit(1)

sb = create_client(url, key)

tables_to_check = [
    "ports",
    "vessels",
    "cargo",
    "cargos",
    "routes",
    "voyages",
    "historical_voyages",
    "bookings",
    "fixtures",
    "vessel_positions",
    "costs",
    "recommendations",
    "risk_assessments",
    "eta_predictions",
    "cost_predictions",
]

audit_results = {}

for tbl in tables_to_check:
    try:
        res = sb.table(tbl).select("*", count="exact").limit(5).execute()
        count = res.count if hasattr(res, "count") and res.count is not None else len(res.data)
        cols = list(res.data[0].keys()) if res.data else []
        sample = res.data[0] if res.data else None
        audit_results[tbl] = {
            "status": "EXISTS",
            "row_count": count,
            "columns": cols,
            "sample_record": sample,
        }
        print(f"[TABLE] public.{tbl}: {count} rows | cols: {cols}")
    except Exception as e:
        audit_results[tbl] = {
            "status": "DOES_NOT_EXIST_OR_ERROR",
            "error": str(e),
        }
        print(f"[TABLE] public.{tbl}: NOT FOUND / ERROR ({e})")

# Check Data/ directory
data_dir = Path(__file__).parent.parent / "Data"
print("\n=== LOCAL DATA FILES ===")
local_files = {}
if data_dir.exists():
    for f in data_dir.glob("**/*"):
        if f.is_file() and f.suffix.lower() in [".csv", ".json", ".parquet"]:
            try:
                rel = str(f.relative_to(data_dir.parent)).replace("\\", "/")
                sz = f.stat().st_size
                if f.suffix.lower() == ".csv":
                    df = pd.read_csv(f, nrows=5)
                    with open(f, "rb") as fp:
                        total_rows = max(0, sum(1 for _ in fp) - 1)
                    local_files[rel] = {
                        "size_bytes": sz,
                        "rows": total_rows,
                        "columns": list(df.columns),
                        "head": df.head(1).to_dict(orient="records"),
                    }
                    print(f"[FILE] {rel}: {total_rows} rows, {sz} bytes | cols: {list(df.columns)[:8]}...")
            except Exception as fe:
                print(f"[FILE] {f.name}: error reading ({fe})")

# Specifically check bookings table contents
print("\n=== DETAILED INSPECTION: BOOKINGS ===")
try:
    b_res = sb.table("bookings").select("*").limit(20).execute()
    print(f"Total bookings sample retrieved: {len(b_res.data)}")
    for b in b_res.data[:3]:
        print(json.dumps(b, indent=2, default=str))
except Exception as be:
    print(f"Bookings inspect error: {be}")

# Specifically check voyages table contents if exists
print("\n=== DETAILED INSPECTION: VOYAGES ===")
try:
    v_res = sb.table("voyages").select("*").limit(20).execute()
    print(f"Total voyages sample retrieved: {len(v_res.data)}")
    for v in v_res.data[:3]:
        print(json.dumps(v, indent=2, default=str))
except Exception as ve:
    print(f"Voyages inspect error: {ve}")

# Specifically check historical_voyages table contents if exists
print("\n=== DETAILED INSPECTION: HISTORICAL_VOYAGES ===")
try:
    hv_res = sb.table("historical_voyages").select("*").limit(20).execute()
    print(f"Total historical_voyages sample retrieved: {len(hv_res.data)}")
    for hv in hv_res.data[:3]:
        print(json.dumps(hv, indent=2, default=str))
except Exception as hve:
    print(f"Historical voyages inspect error: {hve}")

# Write audit results to json
audit_output_path = Path(__file__).parent / "data_audit_results.json"
with open(audit_output_path, "w", encoding="utf-8") as out_fp:
    json.dump({"supabase_tables": audit_results, "local_files": local_files}, out_fp, indent=2, default=str)
print(f"\nAudit complete! Saved to {audit_output_path}")
