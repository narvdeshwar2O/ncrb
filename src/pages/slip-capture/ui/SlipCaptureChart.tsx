import { useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";
import { SlipDailyData, StatusKey } from "../types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PieChartComponent } from "@/pages/agency/ui/PieChartComponent";

interface SlipChartProps {
  filteredData: SlipDailyData[];
  selectedCrimeTypes: StatusKey[];
  dateRange?: { from?: Date; to?: Date }; // Add date range prop
}

const COLORS = [
  "#1E90FF",
  "#32CD32",
  "#FFA500",
  "#FF4500",
  "#8A2BE2",
  "#20B2AA",
  "#DC143C",
  "#708090",
];

// Fixed field mapping - use the actual field names from your data
const FIELD_MAPPING = {
  Arrested: "arresty_received_tp",
  Convicted: "convicted_received_tp",
  Externee: "externee_received_tp",
  Deportee: "deportee_received_tp",
  UIFP: "uifp_received_tp",
  Suspect: "suspect_received_tp",
  UDB: "deadbody_received_tp",
  Absconder: "absconder_received_tp",
};

// Helper function to aggregate array metrics (same as in types.ts)
function aggregateArrayMetrics(sectionData: any): any {
  const aggregated = {
    arrest_act: "",
    arrest_section: "",
    arresty_received_tp: 0,
    convicted_received_tp: 0,
    externee_received_tp: 0,
    absconder_received_tp: 0,
    deportee_received_tp: 0,
    deadbody_received_tp: 0,
    uifp_received_tp: 0,
    suspect_received_tp: 0,
    udb_received_tp: 0,
  };

  const dataArray = Array.isArray(sectionData) ? sectionData : [sectionData];

  dataArray.forEach((item: any) => {
    if (!item || typeof item !== "object") return;

    if (!aggregated.arrest_act && item.arrest_act) {
      aggregated.arrest_act = item.arrest_act;
    }
    if (!aggregated.arrest_section && item.arrest_section) {
      aggregated.arrest_section = item.arrest_section;
    }

    aggregated.arresty_received_tp += item.arresty_received_tp || 0;
    aggregated.convicted_received_tp += item.convicted_received_tp || 0;
    aggregated.externee_received_tp += item.externee_received_tp || 0;
    aggregated.absconder_received_tp += item.absconder_received_tp || 0;
    aggregated.deportee_received_tp += item.deportee_received_tp || 0;
    aggregated.deadbody_received_tp += item.deadbody_received_tp || 0;
    aggregated.uifp_received_tp += item.uifp_received_tp || 0;
    aggregated.suspect_received_tp += item.suspect_received_tp || 0;
    aggregated.udb_received_tp += item.udb_received_tp || 0;
  });

  return aggregated;
}

export default function SlipCaptureChart({
  filteredData,
  selectedCrimeTypes,
  dateRange,
}: SlipChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<"stacked" | "grouped" | "pie">(
    "stacked"
  );

  const crimeTypes = useMemo(
    () => selectedCrimeTypes.filter((type) => type !== "Total"),
    [selectedCrimeTypes]
  );

  const handleChartTypeChange = (value: string) => {
    if (value === "stacked" || value === "grouped" || value === "pie") {
      setChartType(value);
    }
  };

  // FIXED: Helper function to aggregate data for a specific crime type across all states
  const aggregateCrimeTypeData = (
    dayData: any,
    crimeType: StatusKey
  ): number => {
    let total = 0;

    if (!dayData?.state) {
      return 0;
    }

    const fieldName = FIELD_MAPPING[crimeType as keyof typeof FIELD_MAPPING];
    if (!fieldName) {
      return 0;
    }

    // Iterate through all states
    Object.entries(dayData.state).forEach(([stateName, stateData]) => {
      if (!stateData || typeof stateData !== "object") {
        return;
      }

      // Iterate through districts
      Object.entries(stateData).forEach(([districtName, districtData]) => {
        if (!districtData || typeof districtData !== "object") {
          return;
        }

        // Iterate through acts
        Object.entries(districtData).forEach(([actName, actData]) => {
          if (!actData || typeof actData !== "object") {
            return;
          }

          // FIXED: Iterate through genders (new level in data structure)
          Object.entries(actData).forEach(([genderName, genderData]) => {
            if (!genderData || typeof genderData !== "object") {
              return;
            }

            // Iterate through sections
            Object.entries(genderData).forEach(([sectionName, sectionData]) => {
              if (!sectionData) {
                return;
              }

              // FIXED: Use the aggregateArrayMetrics helper function
              const aggregatedMetrics = aggregateArrayMetrics(sectionData);
              const value = Number(aggregatedMetrics[fieldName] || 0);

              total += value;
            });
          });
        });
      });
    });

    return total;
  };

  // Generate complete date range (same as trend chart)
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

  // Bar Chart Data
  const chartData = useMemo(() => {
    const result = completeDateRange.map((dateString, index) => {
      const [year, month, dayNum] = dateString.split("-");
      const displayDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(dayNum)
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const row: Record<string, any> = {
        label: displayDate,
      };

      const day = dataByDate.get(dateString);

      if (!day) {
        // Set all crime types to 0 for missing days
        for (const crimeType of crimeTypes) {
          row[crimeType] = 0;
        }
      } else {
        // Process actual data
        for (const crimeType of crimeTypes) {
          const total = aggregateCrimeTypeData(day.data, crimeType);
          row[crimeType] = total;
        }
      }

      return row;
    });

    return result;
  }, [completeDateRange, crimeTypes, dataByDate]);

  // Pie Chart Data - formatted for PieChartComponent
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const day of filteredData) {
      for (const crimeType of crimeTypes) {
        const dayTotal = aggregateCrimeTypeData(day.data, crimeType);
        totals[crimeType] = (totals[crimeType] ?? 0) + dayTotal;
      }
    }

    const result = crimeTypes
      .map((type) => ({
        name: type,
        value: totals[type] ?? 0,
      }))
      .filter((item) => item.value > 0); // Filter out zero values

    return result;
  }, [filteredData, crimeTypes]);

  // Chart Config
  const chartConfig = useMemo(() => {
    const config: any = {};
    crimeTypes.forEach((type, idx) => {
      config[type] = {
        label: type,
        color: COLORS[idx % COLORS.length],
      };
    });
    return config;
  }, [crimeTypes]);

  const chartTitle = `Crime Type Trends (${chartData.length} days)`;

  // Export CSV
  const handleExportCSV = () => {
    if (chartType === "pie") {
      const headers = ["Crime Type", "Total"];
      const rows = pieData.map((it) => [it.name, it.value]);
      exportService.exportToCSV(
        `${chartTitle.replace(/\s+/g, "_")}_Pie.csv`,
        headers,
        rows
      );
    } else {
      const headers = ["Date", ...crimeTypes];
      const rows = chartData.map((item) => [
        item.label,
        ...crimeTypes.map((c) => item[c] ?? 0),
      ]);
      exportService.exportToCSV(
        `${chartTitle.replace(/\s+/g, "_")}.csv`,
        headers,
        rows
      );
    }
  };

  // Print
  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

  // Check if we have any data
  const hasData = chartData.some((day) =>
    crimeTypes.some((type) => (day[type] || 0) > 0)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">{chartTitle}</h3>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-[120px] print-hide">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="grouped">Grouped</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="print-hide"
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="print-hide"
            >
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
        {!hasData && (
          <div className="text-sm text-red-600 mt-2">No data found.</div>
        )}
      </CardHeader>
      <CardContent ref={chartRef} className="h-[400px]">
        {crimeTypes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-red-600 font-medium">
            Please select at least one crime type to display the chart.
          </div>
        ) : !hasData ? (
          <div className="h-full flex items-center justify-center text-gray-600 font-medium">
            <div className="text-center">
              <p>No data available for the selected criteria.</p>
              <p className="text-sm mt-2">
                Check browser console for detailed debug logs.
              </p>
            </div>
          </div>
        ) : chartType === "pie" ? (
          <PieChartComponent pieData={pieData} pieSliceColors={COLORS} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid vertical={false} strokeOpacity={0.1} />
              <XAxis
                dataKey="label"
                tickMargin={10}
                angle={chartData.length > 10 ? -45 : 0}
                textAnchor={chartData.length > 10 ? "end" : "middle"}
                height={chartData.length > 10 ? 80 : 40}
              />
              <YAxis />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--popover-foreground))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
              {crimeTypes.map((crimeType, idx) => (
                <Bar
                  key={crimeType}
                  dataKey={crimeType}
                  fill={chartConfig[crimeType]?.color}
                  stackId={chartType === "stacked" ? "stack" : undefined}
                  radius={idx === crimeTypes.length - 1 ? 4 : 0}
                >
                  <LabelList
                    dataKey={crimeType}
                    position="inside"
                    angle={chartType === "stacked" ? 0 : -90}
                    fill="#fff"
                    fontSize={11}
                    formatter={(value) => (Number(value) > 0 ? value : "")}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
