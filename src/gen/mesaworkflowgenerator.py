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
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

types = [
    "Arrested", "Convicted", "Externee", "Deportee",
    "UIFP", "Suspect"
]

start_date = datetime.strptime("01-04-2025", "%d-%m-%Y")
end_date = datetime.strptime("25-07-2025", "%d-%m-%Y")

allowed_months = ["04", "05", "06", "07"] 

# Base directory
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "mesa", "2025"))

# Function to generate random data for each state
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

# Iterate through each date in range
current_date = start_date
while current_date <= end_date:
    month_num = current_date.strftime("%m")  # Month number as string, e.g. '04'
    
    if month_num in allowed_months:
        month_path = os.path.join(base_dir, month_num, "daily")
        os.makedirs(month_path, exist_ok=True)

        filename = f"mesa_tp_output_{current_date.strftime('%m_%d_%Y')}.json"
        full_path = os.path.join(month_path, filename)

        with open(full_path, "w") as f:
            json.dump(generate_state_data(), f, indent=2)
        
        print(f"Created: {full_path}")

    current_date += timedelta(days=1)

print("All JSON files generated for April, May, June (and up to July 20).")
