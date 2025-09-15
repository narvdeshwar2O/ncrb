import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CountryComparisonProps {
  rows: {
    date: string;
    data: { country: string; agency: string; count: number }[];
  }[];
  selectedCountries: string[];
}

const colors = [
  "#2563eb", // blue
  "#16a34a", // green
  "#f97316", // orange
  "#9333ea", // purple
  "#dc2626", // red
  "#0891b2", // cyan
  "#ca8a04", // yellow
];

export const CountryComparison: React.FC<CountryComparisonProps> = ({
  rows,
  selectedCountries,
}) => {
  // Aggregate by country (ignore agencies)
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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center border rounded-md bg-card">
        <p className="text-gray-500 text-lg">No Data Available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="country" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar
            dataKey="total"
            fill={colors[0]}
            radius={[6, 6, 0, 0]}
            name="Total Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
