"use client";

import { useNavigation } from "react-day-picker";

export function CustomCaption() {
  const { goToMonth, currentMonth } = useNavigation();

  return (
    <div className="flex justify-between px-3 py-2">
      {/* Year Dropdown */}
      <select
        value={currentMonth.getFullYear()}
        onChange={(e) =>
          goToMonth(new Date(Number(e.target.value), currentMonth.getMonth()))
        }
        className="border rounded-md px-2 py-1 bg-card outline-none cursor-pointer"
      >
        {Array.from({ length: 20 }, (_, i) => {
          const year = new Date().getFullYear() - 10 + i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>

      {/* Month Dropdown */}
      <select
        value={currentMonth.getMonth()}
        onChange={(e) =>
          goToMonth(new Date(currentMonth.getFullYear(), Number(e.target.value)))
        }
        className="border rounded-md px-2 py-1 bg-card outline-none cursor-pointer focus:rounded-md"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i} className="bg-card !cursor-pointer">
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>
    </div>
  );
}
