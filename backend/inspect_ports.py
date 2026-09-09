import csv
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parent.parent / "Data" / "ports" / "updatedpub150.csv"

print("CSV path:", CSV_PATH)
print("File exists:", CSV_PATH.exists())

with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.reader(file)

    headers = next(reader)

    print("\n===== PORT DATASET COLUMNS =====")
    for i, header in enumerate(headers):
        print(f"{i}: {header}")

    print("\n===== FIRST 3 ROWS =====")
    for i, row in enumerate(reader):
        print(row)
        if i == 2:
            break