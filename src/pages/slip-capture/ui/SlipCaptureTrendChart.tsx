import { useState } from "react";
import { GitCommitVertical, Download, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SlipDailyData, StatusKey } from "../types";
import { Button } from "@/components/ui/button";
import * as exportService from "@/utils/exportService";

// Chart configuration
const chartConfig: ChartConfig = {
  Arrested: { label: "Arrested", color: "#3B82F6" },
  Convicted: { label: "Convicted", color: "#22C55E" },
  Suspect: { label: "Suspect", color: "#EF4444" },
  Total: { label: "Total", color: "#F59E0B" },
};

interface SlipCaptureTrendChartProps {
  filteredData: SlipDailyData[];
  selectedState: string;
  dateRange?: { from?: Date; to?: Date }; // Make from and to optional
}

export function SlipCaptureTrendChart({
  filteredData,
  selectedState,
  dateRange,
}: SlipCaptureTrendChartProps) {
  const [activeLines, setActiveLines] = useState<StatusKey[]>([
    "Arrested",
    "Convicted",
    "Suspect",
    "Total",
  ]);

  const toggleLine = (key: StatusKey) => {
    setActiveLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Dynamic field detection - find the actual field names in your data
  const detectFields = (sampleData: any) => {
    const fields = {
      arrested: null as string | null,
      convicted: null as string | null,
      suspect: null as string | null,
    };

    // Look for fields that contain these keywords (case insensitive)
    const fieldKeys = Object.keys(sampleData || {});

    fields.arrested =
      fieldKeys.find(
        (key) =>
          key.toLowerCase().includes("arrest") ||
          key.toLowerCase().includes("arresty")
      ) || null;

    fields.convicted =
      fieldKeys.find((key) => key.toLowerCase().includes("convict")) || null;

    fields.suspect =
      fieldKeys.find((key) => key.toLowerCase().includes("suspect")) || null;

    return fields;
  };

  // Generate complete date range (fixed for timezone issues)
  const generateDateRange = (from: Date, to: Date): string[] => {
    const dates: string[] = [];
    // Create new dates to avoid modifying originals
    const current = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    while (current <= end) {
      // Use local date parts to avoid timezone issues
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`); // YYYY-MM-DD format
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Create a map of available data by date (fixed for timezone)
  const dataByDate = new Map<string, SlipDailyData>();
  filteredData.forEach((day) => {
    // Parse the date properly to avoid timezone issues
    const dayDate = new Date(day.date);
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, "0");
    const dayNum = String(dayDate.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${dayNum}`;
    dataByDate.set(dateKey, day);
  });

  // Generate complete date range (with validation for optional dates)
  const completeDateRange =
    dateRange?.from && dateRange?.to
      ? generateDateRange(dateRange.from, dateRange.to)
      : filteredData
          .map((day) => {
            const dayDate = new Date(day.date);
            const year = dayDate.getFullYear();
            const month = String(dayDate.getMonth() + 1).padStart(2, "0");
            const dayNum = String(dayDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${dayNum}`;
          })
          .sort();


  // Enhanced data processing with complete date range
  const chartData = completeDateRange.map((dateString, dayIndex) => {

    const day = dataByDate.get(dateString);

    // If no data for this date, return zero values
    if (!day) {
      const [year, month, dayNum] = dateString.split("-");
      return {
        date: new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(dayNum)
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: dateString,
        Arrested: 0,
        Convicted: 0,
        Suspect: 0,
        Total: 0,
      };
    }

    // Process actual data (existing logic)
    if (!day.data || !day.data.state) {
      const [year, month, dayNum] = dateString.split("-");
      return {
        date: new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(dayNum)
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: dateString,
        Arrested: 0,
        Convicted: 0,
        Suspect: 0,
        Total: 0,
      };
    }

    // Find state data (case-insensitive search)
    let stateData = null;
    const stateKeys = Object.keys(day.data.state);

    // Try exact match first
    if (day.data.state[selectedState]) {
      stateData = day.data.state[selectedState];
    } else {
      // Try case-insensitive match
      const matchedKey = stateKeys.find(
        (key) => key.toLowerCase() === selectedState.toLowerCase()
      );
      if (matchedKey) {
        stateData = day.data.state[matchedKey];
      }
    }

    if (!stateData) {
      const [year, month, dayNum] = dateString.split("-");
      return {
        date: new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(dayNum)
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: dateString,
        Arrested: 0,
        Convicted: 0,
        Suspect: 0,
        Total: 0,
      };
    }

    // Initialize counters
    let arrested = 0;
    let convicted = 0;
    let suspect = 0;
    let detectedFields = null;

    // Process all districts, acts, and sections
    Object.entries(stateData).forEach(([districtName, districts]) => {
      if (!districts || typeof districts !== "object") {
        return;
      }

      Object.entries(districts).forEach(([actName, acts]) => {
        if (!acts || typeof acts !== "object") {
          return;
        }

        Object.entries(acts).forEach(([sectionName, sectionData]) => {
          if (!sectionData || !Array.isArray(sectionData)) {
            return;
          }

          // Process each item in the section array
          sectionData.forEach((item, itemIndex) => {
            if (!item || typeof item !== "object") {
              return;
            }

            // Detect field names from the first valid item if not done yet
            if (!detectedFields) {
              detectedFields = detectFields(item);
            }

            // Extract values using the correct field names from your data structure
            const arrestedValue = Number(item.arresty_received_tp || 0);
            const convictedValue = Number(item.convicted_received_tp || 0);
            const suspectValue = Number(item.suspect_received_tp || 0);

            arrested += arrestedValue;
            convicted += convictedValue;
            suspect += suspectValue;

            if (arrestedValue > 0 || convictedValue > 0 || suspectValue > 0) {
            }
          });
        });
      });
    });

    const total = arrested + convicted + suspect;

    const [year, month, dayNum] = dateString.split("-");
    const result = {
      date: new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(dayNum)
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: dateString,
      Arrested: arrested,
      Convicted: convicted,
      Suspect: suspect,
      Total: total,
    };

    return result;
  });

  const handleExportCSV = () => {
    const headers = ["Date", "Arrested", "Convicted", "Suspect", "Total"];
    const rows = chartData.map((d) => [
      d.date,
      d.Arrested,
      d.Convicted,
      d.Suspect,
      d.Total,
    ]);
    exportService.exportToCSV(`${selectedState}-trend.csv`, headers, rows);
  };

  const handlePrint = () => {
    if (chartData.length === 0) {
      alert(
        "No data available to print. Please select a valid state and date range."
      );
      return;
    }

    const hideElements = document.querySelectorAll<HTMLElement>(".print-hide");
    hideElements.forEach((el) => (el.style.display = "none"));

    const element = document.getElementById("trend-chart-container");
    exportService.printComponent(
      element as HTMLDivElement,
      `${selectedState} Trend Report`
    );

    setTimeout(() => {
      hideElements.forEach((el) => (el.style.display = ""));
    }, 500);
  };

  // Enhanced debugging for no data case
  if (chartData.length === 0) {
    // Debug: Show available states and sample data structure
    const availableStates = new Set<string>();
    let sampleDataStructure = null;

    filteredData.forEach((day) => {
      if (day.data?.state) {
        Object.keys(day.data.state).forEach((state) => {
          availableStates.add(state);

          // Get sample data structure from first state
          if (!sampleDataStructure && day.data.state[state]) {
            const firstDistrict = Object.values(day.data.state[state])[0];
            if (firstDistrict && typeof firstDistrict === "object") {
              const firstAct = Object.values(firstDistrict)[0];
              if (firstAct && typeof firstAct === "object") {
                const firstSection = Object.values(firstAct)[0];
                if (firstSection) {
                  sampleDataStructure = Object.keys(firstSection);
                }
              }
            }
          }
        });
      }
    });

    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base">
            No Data Available for Trend Chart
          </CardTitle>
          <CardDescription className="text-xs">
            <div className="space-y-1">
              <div>Selected state: "{selectedState}"</div>
              <div>
                Available states ({availableStates.size}):{" "}
                {Array.from(availableStates).slice(0, 5).join(", ")}
                {availableStates.size > 5 ? "..." : ""}
              </div>
              <div>Total filtered entries: {filteredData.length}</div>
              {sampleDataStructure && (
                <div>
                  Sample fields available: {sampleDataStructure.join(", ")}
                </div>
              )}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show debug info when data is found but values are zero
  const hasZeroData = chartData.every((d) => d.Total === 0);
  const totalDataPoints = chartData.reduce((sum, d) => sum + d.Total, 0);

  return (
    <Card id="trend-chart-container" className="py-2">
      <CardHeader className="py-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedState} - Crime Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Arrested, Convicted, Suspect & Total ({chartData.length} data
              points, {totalDataPoints} total cases)
              {hasZeroData && (
                <span className="text-red-500 block mt-1">
                  ⚠️ All values are zero
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 print-hide">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[400px]">
        <ChartContainer config={chartConfig} className="h-full w-full p-2">
          <div className="w-full h-[300px] sm:h-[340px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 8, bottom: 4, left: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ top: 0, cursor: "pointer" }}
                  payload={Object.keys(chartConfig).map((key) => ({
                    id: key,
                    value: chartConfig[key as StatusKey].label,
                    type: "line",
                    color: chartConfig[key as StatusKey].color,
                    inactive: !activeLines.includes(key as StatusKey),
                  }))}
                  onClick={(e) => toggleLine(e.id as StatusKey)}
                  formatter={(value, entry) => {
                    const isActive = activeLines.includes(
                      entry?.id as StatusKey
                    );
                    return (
                      <span style={{ opacity: isActive ? 1 : 0.4 }}>
                        {value}
                      </span>
                    );
                  }}
                />

                {activeLines.includes("Arrested") && (
                  <Line
                    dataKey="Arrested"
                    stroke={chartConfig.Arrested.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Convicted") && (
                  <Line
                    dataKey="Convicted"
                    stroke={chartConfig.Convicted.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Suspect") && (
                  <Line
                    dataKey="Suspect"
                    stroke={chartConfig.Suspect.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Total") && (
                  <Line
                    dataKey="Total"
                    stroke={chartConfig.Total.color}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={({ cx, cy, payload }) => {
                      const r = 14;
                      return (
                        <GitCommitVertical
                          key={payload.date}
                          x={cx - r / 2}
                          y={cy - r / 2}
                          width={r}
                          height={r}
                          fill="#FFFFFF"
                          stroke={chartConfig.Total.color}
                        />
                      );
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
