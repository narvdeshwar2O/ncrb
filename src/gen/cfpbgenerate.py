import os
import random
import json
from datetime import datetime

states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

types = ["tp", "cp", "mesa"]

months = ["04", "05", "06","07"]

# Optionally, days in month based on real calendar (not leap-year aware)
days_in_month = {
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 25
}

def generate_day_data():
    day_data = {}
    for state in states:
        state_data = {}
        for t in types:
            enrollment = random.randint(100, 500)
            hit = random.randint(50, enrollment)
            nohit = random.randint(0, enrollment - hit)
            state_data[t] = {
                "enrollment": enrollment,
                "hit": hit,
                "nohit": nohit,
                "total": hit + nohit
            }
        day_data[state] = state_data
    return day_data

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "cfpb_generic_report", "2025"))
print("base_directory",base_dir)

for month in months:
    daily_dir = os.path.join(base_dir, month, "daily")
    os.makedirs(daily_dir, exist_ok=True)

    for day in range(1, days_in_month[month] + 1):
        day_str = str(day).zfill(2)
        file_name = f"cfpb_gr_output_{month}_{day_str}_2025.json"
        file_path = os.path.join(daily_dir, file_name)

        day_data = generate_day_data()

        with open(file_path, "w") as f:
            json.dump(day_data, f, indent=2)

        print(f"Wrote: {file_path}")

print("All daily data files generated for April–June 2025.")
