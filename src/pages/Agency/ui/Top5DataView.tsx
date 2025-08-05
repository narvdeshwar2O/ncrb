import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";
import getTopStatesByDateRange from "@/utils/getTopStatesByDateRange";
import { DailyData } from "../types";

interface Props {
  allData: DailyData[];
  from: Date;
  to: Date;
  categories: string[];
  dataTypes: string[];
}

export const Top5DataView = ({
  allData,
  from,
  to,
  categories,
  dataTypes,
}: Props) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleStateClick = (stateName: string) => {
    setSelectedState((prev) => (prev === stateName ? null : stateName));
  };

  return (
    <div className="space-y-10 mt-6">
      {categories.map((category) => {
        const topStatesData = useMemo(
          () => getTopStatesByDateRange(allData, from, to, category),
          [allData, from, to, category]
        );

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-4">
              Top 5 States - {category.toUpperCase()}
            </h3>

            {dataTypes.map((metric) => {
              const metricTop5 = topStatesData?.[`${metric}Top5`] || [];

              return (
                <div key={metric} className="mb-8">
                  <h4 className="text-md font-semibold mb-2 capitalize">
                    Metric: {metric}
                  </h4>

                  {metricTop5.map((state) => {
                    const stateValue = state[metric];
                    const districts = [...state.districts].sort(
                      (a, b) => b[metric] - a[metric]
                    );

                    return (
                      <div key={state.state} className="mb-4">
                        <div
                          className="cursor-pointer hover:bg-muted p-2 rounded-md transition"
                          onClick={() => handleStateClick(state.state)}
                        >
                          <ResponsiveContainer width="100%" height={50}>
                            <BarChart data={[{ name: state.state, value: stateValue }]}>
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8">
                                <LabelList dataKey="value" position="right" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {selectedState === state.state && (
                          <div className="pl-6 mt-2">
                            <h5 className="text-sm font-semibold mb-2">District-wise</h5>
                            <ResponsiveContainer width="100%" height={40 * districts.length}>
                              <BarChart
                                layout="vertical"
                                data={districts.map((d) => ({
                                  name: d.district,
                                  value: d[metric],
                                }))}
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                              >
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={120} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Bar dataKey="value" fill="#82ca9d">
                                  <LabelList dataKey="value" position="right" />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
