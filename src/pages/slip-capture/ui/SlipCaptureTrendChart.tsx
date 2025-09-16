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

const chartConfig: ChartConfig = {
  Arrested: { label: "Arrested", color: "#3B82F6" },
  Convicted: { label: "Convicted", color: "#22C55E" },
  Suspect: { label: "Suspect", color: "#EF4444" },
  Total: { label: "Total", color: "#F59E0B" },
};

interface SlipCaptureTrendChartProps {
  filteredData: SlipDailyData[];
  selectedState: string;
  dateRange?: { from?: Date; to?: Date };
}

export function SlipCaptureTrendChart({
  filteredData,
  selectedState,
  dateRange,
}: SlipCaptureTrendChartProps) {
  console.log("flds", filteredData);
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

  // Helper function to aggregate array metrics
  const aggregateArrayMetrics = (sectionData: any) => {
    const aggregated = {
      arresty_received_tp: 0,
      convicted_received_tp: 0,
      suspect_received_tp: 0,
    };

    const dataArray = Array.isArray(sectionData) ? sectionData : [sectionData];

    dataArray.forEach((item: any) => {
      if (!item || typeof item !== "object") return;

      aggregated.arresty_received_tp += item.arresty_received_tp || 0;
      aggregated.convicted_received_tp += item.convicted_received_tp || 0;
      aggregated.suspect_received_tp += item.suspect_received_tp || 0;
    });

    return aggregated;
  };

  // Generate complete date range
  const generateDateRange = (from: Date, to: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Create a map of available data by date
  const dataByDate = new Map<string, SlipDailyData>();
  filteredData.forEach((day) => {
    const dayDate = new Date(day.date);
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, "0");
    const dayNum = String(dayDate.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${dayNum}`;
    dataByDate.set(dateKey, day);
  });

  // Generate complete date range
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

  // FIXED: Enhanced data processing with gender level support
  const chartData = completeDateRange.map((dateString) => {
    const day = dataByDate.get(dateString);

    // If no data for this date, return zero values
    if (!day || !day.data || !day.data.state) {
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

    if (day.data.state[selectedState]) {
      stateData = day.data.state[selectedState];
    } else {
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

    // FIXED: Process all districts, acts, GENDERS, and sections
    Object.entries(stateData).forEach(([districtName, districts]) => {
      if (!districts || typeof districts !== "object") {
        return;
      }

      Object.entries(districts).forEach(([actName, acts]) => {
        if (!acts || typeof acts !== "object") {
          return;
        }

        // NEW: Process gender level
        Object.entries(acts).forEach(([genderName, genders]) => {
          if (!genders || typeof genders !== "object") {
            return;
          }

          Object.entries(genders).forEach(([sectionName, sectionData]) => {
            if (!sectionData) {
              return;
            }

            // Aggregate the section data (handles both array and object formats)
            const aggregatedMetrics = aggregateArrayMetrics(sectionData);

            // Extract values using the correct field names
            arrested += aggregatedMetrics.arresty_received_tp || 0;
            convicted += aggregatedMetrics.convicted_received_tp || 0;
            suspect += aggregatedMetrics.suspect_received_tp || 0;

            // Debug logging for non-zero values
            if (aggregatedMetrics.arresty_received_tp > 0 || 
                aggregatedMetrics.convicted_received_tp > 0 || 
                aggregatedMetrics.suspect_received_tp > 0) {
              console.log(`Date: ${dateString}, District: ${districtName}, Act: ${actName}, Gender: ${genderName}, Section: ${sectionName}`, aggregatedMetrics);
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

    // Debug log for non-zero totals
    if (total > 0) {
      console.log(`Chart data for ${dateString}:`, result);
    }

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
    const availableStates = new Set<string>();
    let sampleDataStructure = null;

    filteredData.forEach((day) => {
      if (day.data?.state) {
        Object.keys(day.data.state).forEach((state) => {
          availableStates.add(state);

          // Get sample data structure showing the gender level
          if (!sampleDataStructure && day.data.state[state]) {
            const firstDistrict = Object.values(day.data.state[state])[0];
            if (firstDistrict && typeof firstDistrict === "object") {
              const firstAct = Object.values(firstDistrict)[0];
              if (firstAct && typeof firstAct === "object") {
                const firstGender = Object.values(firstAct)[0]; // NEW: Gender level
                if (firstGender && typeof firstGender === "object") {
                  const firstSection = Object.values(firstGender)[0];
                  if (firstSection) {
                    sampleDataStructure = {
                      structure: "state → district → act → gender → section",
                      genders: Object.keys(firstAct),
                      sampleFields: Array.isArray(firstSection) 
                        ? Object.keys(firstSection[0] || {})
                        : Object.keys(firstSection || {})
                    };
                  }
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
                <div className="mt-2">
                  <div>Data structure: {sampleDataStructure.structure}</div>
                  <div>Available genders: {sampleDataStructure.genders?.join(", ")}</div>
                  <div>Sample fields: {sampleDataStructure.sampleFields?.join(", ")}</div>
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
                  ⚠️ All values are zero - check if gender level is being processed correctly
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