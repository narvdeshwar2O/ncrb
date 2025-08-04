import os
import random
import json
from datetime import datetime

# List of states (used only to loop through in order)
states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

# Load state to districts mapping
with open(r'D:\Office\Development\crime-eye-insights-cctns-main\src\gen\statesDistrictscopy.json', 'r', encoding='utf-8') as file:
    stateWithDistrict = json.load(file)

types = ["tp", "cp", "mesa"]
months = ["04", "05", "06", "07","08"]

days_in_month = {
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 31,
    "08":6
}

# Function to generate data for each district under a state
def generate_day_data():
    day_data = {}
    for state in states:
        districts = stateWithDistrict.get(state, [])
        state_data = {}

        for district in districts:
            district_data = {}
            for t in types:
                enrollment = random.randint(100, 500)
                hit = random.randint(50, enrollment)
                nohit = random.randint(0, enrollment - hit)
                other = enrollment - hit - nohit

                district_data[t] = {
                    "enrollment": enrollment,
                    "hit": hit,
                    "nohit": nohit,
                    "others": other
                }
            state_data[district] = district_data

        day_data[state] = state_data
    return day_data

# Output folder
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "cfpb_generic_report", "2025"))
print("base_directory", base_dir)

# Create data files
for month in months:
    daily_dir = os.path.join(base_dir, month, "daily")
    os.makedirs(daily_dir, exist_ok=True)

    for day in range(1, days_in_month[month] + 1):
        day_str = str(day).zfill(2)
        file_name = f"cfpb_gr_output_{month}_{day_str}_2025.json"
        file_path = os.path.join(daily_dir, file_name)

        day_data = generate_day_data()

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(day_data, f, indent=2)

        print(f"Wrote: {file_path}")

print("All daily data files generated for April–July 2025.")
