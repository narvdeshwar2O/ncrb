import { useState } from "react";
import { Download, Printer, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import GenderChartTooltip from "./GenderToolTip";

// Crime type colors - different colors for different crime types/statuses
const CRIME_TYPE_COLORS = {
  arrested: "#3B82F6", // Blue
  convicted: "#22C55E", // Green
  externee: "#EF4444", // Red
  absconder: "#F59E0B", // Orange
  deportee: "#8B5CF6", // Purple
  udb: "#EC4899", // Pink
  uifp: "#10B981", // Teal
  suspect: "#6B7280", // Gray
};

// Define the interface for chart data
interface ChartDataItem {
  gender: string;
  total: number;
  [key: string]: string | number;
}

interface GenderBarChartProps {
  filteredData: SlipDailyData[];
  selectedState?: string[];
  selectedStatuses?: StatusKey[];
  title?: string;
}

export function GenderBasedChart({
  filteredData,
  selectedState = [],
  selectedStatuses = [],
  title = "Cases by Gender",
}: GenderBarChartProps) {
  console.log("Gender chart data:", filteredData);

  // Helper function to aggregate array metrics
  const aggregateArrayMetrics = (sectionData: any) => {
    const aggregated = {
      arresty_received_tp: 0,
      convicted_received_tp: 0,
      externee_received_tp: 0,
      absconder_received_tp: 0,
      deportee_received_tp: 0,
      deadbody_received_tp: 0,
      uifp_received_tp: 0,
      suspect_received_tp: 0,
    };

    const dataArray = Array.isArray(sectionData) ? sectionData : [sectionData];

    dataArray.forEach((item: any) => {
      if (!item || typeof item !== "object") return;

      aggregated.arresty_received_tp += item.arresty_received_tp || 0;
      aggregated.convicted_received_tp += item.convicted_received_tp || 0;
      aggregated.externee_received_tp += item.externee_received_tp || 0;
      aggregated.absconder_received_tp += item.absconder_received_tp || 0;
      aggregated.deportee_received_tp += item.deportee_received_tp || 0;
      aggregated.deadbody_received_tp += item.deadbody_received_tp || 0;
      aggregated.uifp_received_tp += item.uifp_received_tp || 0;
      aggregated.suspect_received_tp += item.suspect_received_tp || 0;
    });

    return aggregated;
  };

  // Status key mapping - Fixed to include all possible statuses
  const STATUS_KEY_MAP: Record<string, string> = {
    arrested: "arresty_received_tp",
    convicted: "convicted_received_tp",
    externee: "externee_received_tp",
    absconder: "absconder_received_tp",
    deportee: "deportee_received_tp",
    udb: "deadbody_received_tp",
    uifp: "uifp_received_tp",
    suspect: "suspect_received_tp",
  };

  // Process data to aggregate by gender
  const processGenderData = (): ChartDataItem[] => {
    const genderAggregates = new Map<string, ChartDataItem>();

    // Initialize gender categories
    const initializeGender = (gender: string) => {
      if (!genderAggregates.has(gender)) {
        const genderData: ChartDataItem = { gender, total: 0 };
        selectedStatuses.forEach((status) => {
          genderData[status] = 0;
        });
        genderAggregates.set(gender, genderData);
      }
    };

    // Process all filtered data
    filteredData.forEach((entry) => {
      if (!entry.data?.state) return;

      Object.entries(entry.data.state).forEach(([state, districts]) => {
        // Check if state is in the selectedState array
        if (
          selectedState.length > 0 &&
          !selectedState.some(
            (selectedStateName) =>
              selectedStateName.toLowerCase() === state.toLowerCase()
          )
        ) {
          return;
        }

        Object.entries(districts).forEach(([district, acts]) => {
          Object.entries(acts).forEach(([act, genders]) => {
            Object.entries(genders).forEach(([gender, sections]) => {
              // Initialize gender if not exists
              initializeGender(gender);
              const genderData = genderAggregates.get(gender)!;

              Object.entries(sections).forEach(([section, sectionData]) => {
                const aggregatedMetrics = aggregateArrayMetrics(sectionData);

                // Add to each selected status
                selectedStatuses.forEach((status) => {
                  const fieldKey = STATUS_KEY_MAP[status.toLowerCase()];
                  if (fieldKey && aggregatedMetrics[fieldKey]) {
                    const value = aggregatedMetrics[fieldKey] || 0;
                    genderData[status] = (genderData[status] as number) + value;
                    genderData.total += value;
                  }
                });
              });
            });
          });
        });
      });
    });

    // Convert to array format for chart
    return Array.from(genderAggregates.values()).sort(
      (a, b) => b.total - a.total
    );
  };

  const chartData = processGenderData();
  const totalCases = chartData.reduce((sum, item) => sum + item.total, 0);

  console.log("Processed gender chart data:", chartData);

  // Generate chart config based on selected statuses
  const chartConfig: ChartConfig = {};
  selectedStatuses.forEach((status) => {
    chartConfig[status] = {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color:
        CRIME_TYPE_COLORS[
          status.toLowerCase() as keyof typeof CRIME_TYPE_COLORS
        ] || "#6B7280",
    };
  });

  const handleExportCSV = () => {
    const headers = ["Gender", ...selectedStatuses, "Total"];
    const rows = chartData.map((item) => [
      item.gender,
      ...selectedStatuses.map((status) => item[status] || 0),
      item.total,
    ]);

    // Handle multiple states in filename
    const stateLabel =
      selectedState.length === 1
        ? selectedState[0]
        : `${selectedState.length}-states`;

    exportService.exportToCSV(
      `${stateLabel}-gender-breakdown.csv`,
      headers,
      rows
    );
  };

  const handlePrint = () => {
    if (chartData.length === 0) {
      alert("No data available to print.");
      return;
    }

    const hideElements = document.querySelectorAll<HTMLElement>(".print-hide");
    hideElements.forEach((el) => (el.style.display = "none"));

    const element = document.getElementById("gender-chart-container");

    // Handle multiple states in print title
    const stateLabel =
      selectedState.length === 1
        ? selectedState[0]
        : `${selectedState.length} States`;

    exportService.printComponent(
      element as HTMLDivElement,
      `${stateLabel} Gender Breakdown Report`
    );

    setTimeout(() => {
      hideElements.forEach((el) => (el.style.display = ""));
    }, 500);
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            No Gender Data Available
          </CardTitle>
          
        </CardHeader>
      </Card>
    );
  }

  // Handle multiple states in display
  const stateDisplay =
    selectedState.length === 1
      ? selectedState[0]
      : selectedState.length <= 3
      ? selectedState.join(", ")
      : `${selectedState.slice(0, 2).join(", ")} +${
          selectedState.length - 2
        } more`;

  return (
    <Card id="gender-chart-container" className="border">
      {/* Header */}
      <CardHeader className="pb-2 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {title} - {stateDisplay}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Gender breakdown for {selectedStatuses.join(", ")} ({totalCases}{" "}
              total cases)
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

      {/* Summary Section */}
      <div className="px-4 py-3 bg-muted/30 border-b">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          {chartData.map((item) => (
            <div key={item.gender}>
              <div className="font-semibold text-sm">
                {item.gender}
              </div>
              <div className="text-xs text-gray-400">
                {item.total} cases (
                {((item.total / totalCases) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <CardContent className="p-4 h-[420px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="gender"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={<GenderChartTooltip />}
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Gender: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />

              {selectedStatuses.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  name={status.charAt(0).toUpperCase() + status.slice(1)}
                  fill={
                    CRIME_TYPE_COLORS[
                      status.toLowerCase() as keyof typeof CRIME_TYPE_COLORS
                    ] || "#6B7280"
                  }
                  radius={[3, 3, 0, 0]}
                  barSize={30}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
