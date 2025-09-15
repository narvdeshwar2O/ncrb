import React, { useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

import { exportToCSV, printComponent } from "../../../utils/exportService";

interface CountryComparisonProps {
  rows: {
    date: string;
    data: { country: string; agency: string; count: number }[];
  }[];
  selectedCountries: string[];
}

const colors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
];

export const CountryComparison: React.FC<CountryComparisonProps> = ({
  rows,
  selectedCountries,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Compute totals per country
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const totals: Record<string, number> = {};

    rows.forEach((entry) => {
      entry.data.forEach(({ country, count }) => {
        if (
          selectedCountries.length > 0 &&
          !selectedCountries.includes(country)
        )
          return;

        totals[country] = (totals[country] || 0) + count;
      });
    });

    return Object.entries(totals).map(([country, total]) => ({
      country,
      total,
    }));
  }, [rows, selectedCountries]);

  // Prepare CSV data
  const csvHeaders = ["Country", "Total Count"];
  const csvRows = chartData.map((row) => [row.country, row.total]);

  const handlePrint = () => {
    if (chartContainerRef.current) {
      printComponent(chartContainerRef.current, "Country Comparison Chart");
    }
  };

  const handleExportCSV = () => {
    exportToCSV("country_comparison.csv", csvHeaders, csvRows);
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border rounded-md bg-card">
        <p className="text-gray-500 text-lg">No Data Available</p>
      </div>
    );
  }

  return (
    <div
      
      className="w-full space-y-4 border p-3 rounded-md"
    >
      {/* Buttons */}
      <div className="flex gap-2 justify-between">
        <div> Country-wise Comparison</div>
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 400 }} ref={chartContainerRef}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid opacity={0.5} />
            <XAxis dataKey="country" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                color: "black",
              }}
              labelStyle={{ color: "black" }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Total Count">
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
