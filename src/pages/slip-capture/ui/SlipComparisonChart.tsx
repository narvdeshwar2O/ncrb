import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StatusKey } from "../types";

interface SlipComparisonChartProps {
  rows: any[];
  statuses: StatusKey[];
  selectedStates: string[];
  selectedDistricts?: string[];
  categories: string[];
  comparisonType: "state" | "district";
}

export const SlipComparisonChart: React.FC<SlipComparisonChartProps> = ({
  rows,
  statuses,
  selectedStates,
  selectedDistricts = [],
  categories,
  comparisonType,
}) => {
  // Generate colors for each status
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#87ceeb",
    "#dda0dd",
    "#98fb98",
    "#f0e68c",
    "#ff6347",
    "#40e0d0",
    "#ee82ee",
    "#90ee90",
  ];

  // Helper function to normalize names for comparison
  const normalizeName = (name: string): string => {
    return name ? name.toLowerCase().trim() : "";
  };

  // Memoize chart data processing with zero-data handling and duplicate prevention
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0) {
      // If no data but we have selected items, show them with zero values
      if (comparisonType === "state" && selectedStates.length > 0) {
        return selectedStates.map((state) => {
          const dataPoint: any = {
            name: state,
            label: state,
          };
          statuses.forEach((status) => {
            dataPoint[status] = 0;
          });
          return dataPoint;
        });
      } else if (
        comparisonType === "district" &&
        selectedDistricts.length > 0
      ) {
        return selectedDistricts.map((district) => {
          const dataPoint: any = {
            name: district,
            label: district,
            state: selectedStates[0] || "Unknown",
          };
          statuses.forEach((status) => {
            dataPoint[status] = 0;
          });
          return dataPoint;
        });
      }
      return [];
    }

    // Process existing data
    const processedData = rows.map((row) => {
      const dataPoint: any = {};

      if (comparisonType === "state") {
        dataPoint.name = row.state || "Unknown";
        dataPoint.label = row.state || "Unknown";
      } else {
        // District comparison
        dataPoint.name = row.district || "Unknown";
        dataPoint.label = `${row.district || "Unknown"}`;
        dataPoint.state = row.state || selectedStates[0] || "Unknown";
      }

      // Add status values
      statuses.forEach((status) => {
        dataPoint[status] = row[status] || 0;
      });

      return dataPoint;
    });

    // For district comparison, ensure ALL selected districts are included
    if (comparisonType === "district" && selectedDistricts.length > 0) {
      // Create a normalized map of existing districts
      const existingDistricts = new Map();
      processedData.forEach((item) => {
        const normalizedName = normalizeName(item.name);
        if (!existingDistricts.has(normalizedName)) {
          existingDistricts.set(normalizedName, item);
        }
      });

      // Add missing districts with zero values
      selectedDistricts.forEach((district) => {
        const normalizedDistrict = normalizeName(district);
        if (!existingDistricts.has(normalizedDistrict)) {
          const dataPoint: any = {
            name: district,
            label: district,
            state: selectedStates[0] || "Unknown",
          };
          statuses.forEach((status) => {
            dataPoint[status] = 0;
          });
          processedData.push(dataPoint);
          existingDistricts.set(normalizedDistrict, dataPoint);
        }
      });

      // Remove duplicates by keeping only unique normalized names
      const uniqueData = Array.from(existingDistricts.values());
      
      // Sort by district name for consistent ordering
      uniqueData.sort((a, b) => a.name.localeCompare(b.name));
      
      return uniqueData;
    }

    // For state comparison, also remove duplicates
    if (comparisonType === "state") {
      const uniqueStates = new Map();
      processedData.forEach((item) => {
        const normalizedName = normalizeName(item.name);
        if (!uniqueStates.has(normalizedName)) {
          uniqueStates.set(normalizedName, item);
        } else {
          // If duplicate exists, merge the data by summing values
          const existing = uniqueStates.get(normalizedName);
          statuses.forEach((status) => {
            existing[status] = (existing[status] || 0) + (item[status] || 0);
          });
        }
      });
      
      return Array.from(uniqueStates.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
    }

    return processedData;
  }, [rows, statuses, comparisonType, selectedStates, selectedDistricts]);

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold text-gray-900">
            {comparisonType === "state"
              ? `State: ${label}`
              : `District: ${label}`}
          </p>
          {comparisonType === "district" && data.state && (
            <p className="text-sm text-gray-600">State: {data.state}</p>
          )}
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.dataKey}: {entry.value.toLocaleString()}
              </p>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm font-medium text-gray-800">
              Total:{" "}
              {payload
                .reduce((sum: number, entry: any) => sum + entry.value, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle empty data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border rounded-md bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">No Data Available</p>
          <p className="text-gray-400 text-sm">
            {comparisonType === "state"
              ? "Select states and crime types to view comparison"
              : "Select districts and crime types to view comparison"}
          </p>
        </div>
      </div>
    );
  }

  // Calculate chart height based on number of items
  const chartHeight = Math.max(400, chartData.length * 40 + 100);

  return (
    <div className="w-full space-y-4">
      {/* Chart Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {comparisonType === "state"
              ? "State Comparison"
              : "District Comparison"}
          </h3>
          <p className="text-sm text-gray-600">
            {comparisonType === "state"
              ? `Comparing ${selectedStates.length} states across ${statuses.length} crime types`
              : `Comparing ${selectedDistricts.length} districts in ${selectedStates[0]} across ${statuses.length} crime types`}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />

            {statuses.map((status, index) => (
              <Bar
                key={status}
                dataKey={status}
                fill={colors[index % colors.length]}
                name={status}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};