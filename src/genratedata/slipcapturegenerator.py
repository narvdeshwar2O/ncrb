import os
import random
import json
from datetime import datetime, timedelta

# States and types
states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "CFPB"
]

types = [
    "Arrested", "Convicted", "Externee", "Deportee",
    "UIFP", "Suspect", "UDB", "Absconder"
]


start_date = datetime.strptime("01-04-2025", "%d-%m-%Y")
end_date = datetime.strptime("20-07-2025", "%d-%m-%Y")


allowed_months = ["04", "05", "06","07"]  # April, May, June

# Base directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "slip_capture", "2025"))

# ✅ Function to generate random data for each state
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

# ✅ Iterate through each date in range
current_date = start_date
while current_date <= end_date:
    month = current_date.strftime("%d")
    
    # ✅ Only process April, May, June
    if month in allowed_months:
        month_path = os.path.join(base_dir, month, "daily")
        os.makedirs(month_path, exist_ok=True)

        filename = f"slip_cp_output_{current_date.strftime('%d-%m-%Y')}.json"
        full_path = os.path.join(month_path, filename)

        # ✅ Write random data to the file
        with open(full_path, "w") as f:
            json.dump(generate_state_data(), f, indent=2)
        
        print(f"Created: {full_path}")

    current_date += timedelta(days=1)

print("All JSON files generated for April, May, June (and July 20 cutoff).")
