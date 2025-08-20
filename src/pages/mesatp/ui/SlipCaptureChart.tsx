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
  PieChart,
  Pie,
  Cell,
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

interface SlipChartProps {
  filteredData: SlipDailyData[];
  selectedCrimeTypes: StatusKey[];
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

export default function SlipCaptureChart({
  filteredData,
  selectedCrimeTypes,
}: SlipChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<"stacked" | "grouped" | "pie">(
    "stacked"
  );
  console.log("filtered data", filteredData);
  const crimeTypes = useMemo(
    () => selectedCrimeTypes.filter((type) => type !== "Total"),
    [selectedCrimeTypes]
  );

  const handleChartTypeChange = (value: string) => {
    if (value === "stacked" || value === "grouped" || value === "pie") {
      setChartType(value);
    }
  };

  // Helper function to aggregate data for a specific crime type across all states
  const aggregateCrimeTypeData = (
    dayData: any,
    crimeType: StatusKey
  ): number => {
    let total = 0;

    // console.log(`\n=== Aggregating ${crimeType} data ===`);

    if (!dayData?.state) {
      // console.log("❌ No state data found");
      return 0;
    }

    const fieldName = FIELD_MAPPING[crimeType as keyof typeof FIELD_MAPPING];
    if (!fieldName) {
      // console.log(`❌ No field mapping found for ${crimeType}`);
      return 0;
    }

    // console.log(`Looking for field: ${fieldName}`);

    // Iterate through all states
    Object.entries(dayData.state).forEach(([stateName, stateData]) => {
      // console.log(`  State: ${stateName}`);

      if (!stateData || typeof stateData !== "object") {
        // console.log(`    ⚠️ Invalid state data`);
        return;
      }

      // Iterate through districts
      Object.entries(stateData).forEach(([districtName, districtData]) => {
        // console.log(`    District: ${districtName}`);

        if (!districtData || typeof districtData !== "object") {
          // console.log(`      ⚠️ Invalid district data`);
          return;
        }

        // Iterate through acts
        Object.entries(districtData).forEach(([actName, actData]) => {
          // console.log(`      Act: ${actName}`);

          if (!actData || typeof actData !== "object") {
            // console.log(`        ⚠️ Invalid act data`);
            return;
          }

          // Iterate through sections
          Object.entries(actData).forEach(([sectionName, sectionData]) => {
            // console.log(`        Section: ${sectionName}`);

            if (
              !sectionData ||
              typeof sectionData !== "object" ||
              sectionData === null
            ) {
              // console.log(`          ⚠️ Invalid section data`);
              return;
            }

            const validSectionData = sectionData as Record<string, any>;
            const value = Number(validSectionData[fieldName] || 0);

            // console.log(`          ${fieldName}: ${value}`);
            total += value;
          });
        });
      });
    });

    // console.log(`📊 Total ${crimeType}: ${total}`);
    return total;
  };

  // Bar Chart Data
  const chartData = useMemo(() => {
    // console.log("\n🔍 Processing chart data...");
    // console.log("Filtered data length:", filteredData.length);
    // console.log("Selected crime types:", crimeTypes);

    const result = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day, index) => {
        // console.log(`\n--- Processing day ${index + 1}: ${day.date} ---`);

        const row: Record<string, any> = {
          label: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };

        for (const crimeType of crimeTypes) {
          const total = aggregateCrimeTypeData(day.data, crimeType);
          row[crimeType] = total;
          // console.log(`${crimeType}: ${total}`);
        }

        // console.log("Day result:", row);
        return row;
      });

    // console.log("📈 Final chart data:", result);
    return result;
  }, [filteredData, crimeTypes]);

  // Pie Chart Data
  const pieData = useMemo(() => {
    // console.log("\n🥧 Processing pie chart data...");

    const totals: Record<string, number> = {};

    for (const day of filteredData) {
      for (const crimeType of crimeTypes) {
        const dayTotal = aggregateCrimeTypeData(day.data, crimeType);
        totals[crimeType] = (totals[crimeType] ?? 0) + dayTotal;
      }
    }

    const result = crimeTypes
      .map((type, idx) => ({
        name: type,
        value: totals[type] ?? 0,
        color: COLORS[idx % COLORS.length],
      }))
      .filter((item) => item.value > 0); // Filter out zero values

    // console.log("🥧 Pie data (filtered):", result);
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

  // console.log("🎯 Chart summary:");
  // console.log("- Chart data length:", chartData.length);
  // console.log("- Crime types:", crimeTypes);
  // console.log("- Has data:", hasData);
  // console.log(
  //   "- Total values:",
  //   chartData.reduce((acc, day) => {
  //     crimeTypes.forEach((type) => {
  //       acc[type] = (acc[type] || 0) + (day[type] || 0);
  //     });
  //     return acc;
  //   }, {} as Record<string, number>)
  // );

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
          <div className="text-sm text-red-600 mt-2">
            ⚠️ No data found. Check console for detailed debug information.
            <br />
            Data points: {chartData.length}, Crime types:{" "}
            {crimeTypes.join(", ")}
          </div>
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
              <Tooltip
                contentStyle={{
                  background: "bg-card",
                  border: "1px solid white",
                  fontWeight: "400",
                  borderRadius: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
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
                  background: "bg-card",
                  border: "1px solid hsl(var(--border))",
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
