import os
import random
import json

states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "DD & DNH", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "CFPB"
]

types = [
    "Arrested", "Convicted", "Externee", "Deportee",
    "UIFP", "Suspect", "UDB", "Absconder"
]

def generate_state_data():
    data = {}
    for state in states:
        record = {}
        total = 0
        for typ in types:
            val = random.randint(10, 200)
            record[typ] = val
            total += val
        record["total"] = total
        data[state] = record
    return data

# 📂 Target root: slip_capture/2025/
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
print("test",base_dir)

for month in os.listdir(base_dir):
    month_path = os.path.join(base_dir, month, "daily")
    if not os.path.isdir(month_path):
        continue

    print(f"Looking in: {month_path}")

    for filename in os.listdir(month_path):
        print(f"Found file: {filename}")
        if filename.startswith("slip_cp_output_") and filename.endswith(".json"):
            full_path = os.path.join(month_path, filename)
            print(f"Writing to: {full_path}")
            with open(full_path, "w") as f:
                json.dump(generate_state_data(), f, indent=2)


print("All slip_cp_output_*.json files updated.")
