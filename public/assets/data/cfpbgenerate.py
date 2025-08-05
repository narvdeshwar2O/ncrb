import os
import random
import json

states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
    "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu Kashmir & Ladakh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

with open(r'D:\Office\Development\crime-eye-insights-cctns-main\src\gen\statesDistrictscopy.json', 'r', encoding='utf-8') as file:
    stateWithDistrict = json.load(file)

types = ["tp", "cp", "mesa"]
months = ["04", "05", "06", "07", "08"]

days_in_month = {
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 31,
    "08": 10
}

def generate_day_data():
    day_data = {}
    for state in states:
        districts = stateWithDistrict.get(state, [])
        state_data = {}

        for district in districts:
            district_data = {}
            for t in types:
                hit = random.randint(50, 400)
                nohit = random.randint(0, 400 - hit)
                total = hit + nohit

                district_data[t] = {
                    "hit": hit,
                    "nohit": nohit,
                    "total": total
                }

            state_data[district] = district_data

        day_data[state] = state_data

    return {"state": day_data}

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "cfpb_generic_report", "2025"))
print("Base directory:", base_dir)

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

print("All daily data files generated for April–August 2025.")
