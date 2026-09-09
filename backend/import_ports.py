import csv
import os
import re
import json
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "Data" / "ports" / "ports_final.csv"


# --------------------------------------------------
# SUPABASE CONNECTION
# --------------------------------------------------

load_dotenv(BASE_DIR / "backend" / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def normalize(text):
    """Make column names easier to compare."""
    return re.sub(r"[^a-z0-9]", "", str(text).lower())


def find_column(headers, possible_names):
    """Find a CSV column using several possible names."""
    normalized_headers = {
        normalize(header): header
        for header in headers
    }

    for name in possible_names:
        key = normalize(name)

        if key in normalized_headers:
            return normalized_headers[key]

    return None


def clean_text(value):
    """Clean text values."""
    if value is None:
        return None

    value = str(value).strip()

    if value in ("", "NULL", "null", "N/A", "NA", "-"):
        return None

    return value


def clean_number(value):
    """Convert a value to float."""
    value = clean_text(value)

    if value is None:
        return None

    value = value.replace(",", "")

    try:
        return float(value)
    except ValueError:
        return None


def clean_facilities(value):
    """Convert facilities column into a JSON-compatible list."""
    value = clean_text(value)

    if value is None:
        return []

    try:
        parsed = json.loads(value)

        if isinstance(parsed, list):
            return parsed

    except (json.JSONDecodeError, TypeError):
        pass

    return []


# --------------------------------------------------
# CHECK FILE
# --------------------------------------------------

print("======================================")
print("       PORT DATASET IMPORTER")
print("======================================")

print("\nCSV:", CSV_PATH)
print("Exists:", CSV_PATH.exists())

if not CSV_PATH.exists():
    raise FileNotFoundError(
        f"Port CSV not found: {CSV_PATH}"
    )


# --------------------------------------------------
# READ CSV
# --------------------------------------------------

with open(
    CSV_PATH,
    "r",
    encoding="utf-8-sig",
    newline=""
) as file:

    reader = csv.DictReader(file)

    headers = reader.fieldnames

    if not headers:
        raise ValueError("CSV headers could not be read.")

    print("\n===== CSV COLUMNS =====")

    for i, header in enumerate(headers):
        print(f"{i}: {header}")


    # --------------------------------------------------
    # FIND COLUMNS
    # --------------------------------------------------

    id_column = find_column(
        headers,
        [
            "id",
            "World Port Index Number",
            "WPI Number",
            "wpinumber",
        ]
    )

    name_column = find_column(
        headers,
        [
            "name",
            "Main Port Name",
            "main_port_",
            "Port Name",
        ]
    )

    unlocode_column = find_column(
        headers,
        [
            "UN/LOCODE",
            "unlocode",
        ]
    )

    country_column = find_column(
        headers,
        [
            "Country",
            "Country Code",
            "countryCode",
            "country",
        ]
    )

    city_column = find_column(
        headers,
        [
            "city",
            "City",
        ]
    )

    latitude_column = find_column(
        headers,
        [
            "Latitude",
            "latitude",
        ]
    )

    longitude_column = find_column(
        headers,
        [
            "Longitude",
            "longitude",
        ]
    )

    port_type_column = find_column(
        headers,
        [
            "port_type",
            "Port Type",
            "type",
        ]
    )

    facilities_column = find_column(
        headers,
        [
            "facilities",
            "Facilities",
        ]
    )


    # --------------------------------------------------
    # SHOW DETECTED COLUMNS
    # --------------------------------------------------

    print("\n===== DETECTED COLUMNS =====")

    print("ID:", id_column)
    print("Name:", name_column)
    print("UN/LOCODE:", unlocode_column)
    print("Country:", country_column)
    print("City:", city_column)
    print("Latitude:", latitude_column)
    print("Longitude:", longitude_column)
    print("Port Type:", port_type_column)
    print("Facilities:", facilities_column)


    # --------------------------------------------------
    # VALIDATE REQUIRED COLUMNS
    # --------------------------------------------------

    required = {
        "ID": id_column,
        "Port Name": name_column,
        "Latitude": latitude_column,
        "Longitude": longitude_column,
    }

    missing = [
        name
        for name, column in required.items()
        if column is None
    ]

    if missing:
        raise ValueError(
            "Missing required CSV columns: "
            + ", ".join(missing)
        )


    # --------------------------------------------------
    # CONVERT DATA
    # --------------------------------------------------

    ports = []

    for row in reader:

        # Use CSV id directly
        id_value = clean_number(
            row.get(id_column)
        )

        port_name = clean_text(
            row.get(name_column)
        )

        latitude = clean_number(
            row.get(latitude_column)
        )

        longitude = clean_number(
            row.get(longitude_column)
        )

        # Skip invalid records
        if (
            id_value is None
            or port_name is None
            or latitude is None
            or longitude is None
        ):
            continue

        # City
        city = (
            clean_text(row.get(city_column))
            if city_column
            else None
        )

        # Port type
        port_type = (
            clean_text(row.get(port_type_column))
            if port_type_column
            else "seaport"
        )

        if port_type is None:
            port_type = "seaport"

        # Facilities
        facilities = (
            clean_facilities(row.get(facilities_column))
            if facilities_column
            else []
        )

        # Build port object
        port = {
            "id": int(id_value),
            "name": port_name,

            "unlocode": (
                clean_text(row.get(unlocode_column))
                if unlocode_column
                else None
            ),

            "country": (
                clean_text(row.get(country_column))
                if country_column
                else None
            ),

            "city": city,

            "latitude": latitude,
            "longitude": longitude,

            "port_type": port_type,

            "facilities": facilities,
        }

        ports.append(port)


# --------------------------------------------------
# VALID RECORD COUNT
# --------------------------------------------------

print("\n======================================")
print("VALID PORT RECORDS:", len(ports))
print("======================================")


# --------------------------------------------------
# SHOW SAMPLE
# --------------------------------------------------

print("\n===== FIRST 5 PORTS =====")

for port in ports[:5]:
    print(port)


# --------------------------------------------------
# ASK BEFORE UPLOAD
# --------------------------------------------------

print("\n======================================")
print("READY TO IMPORT")
print("======================================")

answer = input(
    "\nType IMPORT to upload these ports to Supabase: "
).strip()

if answer != "IMPORT":
    print("\nImport cancelled.")
    print("No database changes were made.")
    raise SystemExit


# --------------------------------------------------
# UPLOAD IN BATCHES
# --------------------------------------------------

BATCH_SIZE = 500

total = len(ports)

for start in range(0, total, BATCH_SIZE):

    batch = ports[start:start + BATCH_SIZE]

    print(
        f"\nUploading {start + 1} - "
        f"{min(start + BATCH_SIZE, total)} "
        f"of {total}..."
    )

    response = (
        supabase
        .table("ports")
        .upsert(
            batch,
            on_conflict="id"
        )
        .execute()
    )

    print("Batch uploaded successfully.")


# --------------------------------------------------
# COMPLETED
# --------------------------------------------------

print("\n======================================")
print("✅ PORT IMPORT COMPLETED")
print("======================================")

print(f"Total processed: {total}")