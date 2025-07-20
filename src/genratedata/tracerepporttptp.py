import os
import random
import json
from datetime import datetime, timedelta

# List of states
states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "DD & DNH", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "CFPB"
]

# Date range
start_date = datetime.strptime("01-04-2025", "%d-%m-%Y")
end_date = datetime.strptime("20-07-2025", "%d-%m-%Y")
allowed_months = ["04", "05", "06", "07"]  # April to July (till 20th)

# Base directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "trace_report_tp_cp", "2025"))

# ✅ Function to generate `tp_tp` data for a state
def generate_tp_tp_data():
    hit = random.randint(50, 300)
    no_hit = random.randint(20, 150)
    total = hit + no_hit
    own_state = random.randint(20, hit)
    inter_state = hit - own_state
    return {
        "hit": hit,
        "no_hit": no_hit,
        "total": total,
        "own_state": own_state,
        "inter_state": inter_state
    }

# ✅ Function to generate data for all states
def generate_state_data():
    data = {}
    for state in states:
        data[state] = {
            "tp_tp": generate_tp_tp_data()
        }
    return data

# ✅ Iterate through each date in range
current_date = start_date
while current_date <= end_date:
    month = current_date.strftime("%m")

    if month in allowed_months:
        month_path = os.path.join(base_dir, month, "daily")
        os.makedirs(month_path, exist_ok=True)

        filename = f"tp_cp_output_{current_date.strftime('%m_%d_%Y')}.json"
        full_path = os.path.join(month_path, filename)

        # ✅ Write random data to the file
        with open(full_path, "w") as f:
            json.dump(generate_state_data(), f, indent=2)

        print(f"Created: {full_path}")

    current_date += timedelta(days=1)

print("All JSON files generated with tp_tp format for April, May, June, and July till 20th.")
