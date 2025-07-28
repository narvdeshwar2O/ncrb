import { useNavigation } from "react-day-picker";

export function CustomCaption() {
  const { goToMonth, currentMonth } = useNavigation();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  // Restrict year to 2000–2025
  const startYear = 2000;
  const endYear = 2025;

  // Ensure the selected month doesn't go beyond the current month of current year
  const isCurrentYear = currentMonth.getFullYear() === currentYear;

  return (
    <div className="flex justify-between px-3 py-2 gap-2">
      {/* Year Dropdown */}
      <select
        value={currentMonth.getFullYear()}
        onChange={(e) => {
          const selectedYear = Number(e.target.value);
          let newMonth = currentMonth.getMonth();

          // If changing to future year, clamp month to current month
          if (selectedYear === currentYear && newMonth > currentMonthIndex) {
            newMonth = currentMonthIndex;
          }

          goToMonth(new Date(selectedYear, newMonth));
        }}
        className="border rounded-md px-2 py-1 bg-card outline-none cursor-pointer"
      >
        {Array.from({ length: endYear - startYear + 1 }, (_, i) => {
          const year = startYear + i;
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
          goToMonth(
            new Date(currentMonth.getFullYear(), Number(e.target.value))
          )
        }
        className="border rounded-md px-2 py-1 bg-card outline-none cursor-pointer"
      >
        {Array.from({ length: 12 }, (_, i) => {
          // If it's the current year and the month is in the future, disable it
          const isDisabled = isCurrentYear && i > currentMonthIndex;
          return (
            <option key={i} value={i} disabled={isDisabled}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          );
        })}
      </select>
    </div>
  );
}
