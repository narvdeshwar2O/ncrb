"use client";

import { useMemo } from "react";
import getTopStatesByDateRange from "@/utils/getTopStatesByDateRange";
import ChartCard from "./ChartCard";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";
import { DailyData, CategoryKey, categoryOptions } from "../types";

function isValidCategoryKey(category: string): category is CategoryKey {
  return categoryOptions.includes(category as CategoryKey);
}

interface Props {
  allData: DailyData[];
  from: Date;
  to: Date;
  categories: string[];
  dataTypes: string[];
}

// Separate component for each category to handle hooks properly
const CategorySection = ({ 
  category, 
  allData, 
  from, 
  to, 
  dataTypes 
}: { 
  category: CategoryKey;
  allData: DailyData[];
  from: Date;
  to: Date;
  dataTypes: string[];
}) => {
  const topStatesData = useMemo(
    () => getTopStatesByDateRange(allData, from, to, category),
    [allData, from, to, category]
  );

  const allMetricData = useMemo(() => 
    dataTypes
      .filter((metric) => metric !== "total")
      .map((metric) => {
        const metricTop5 = topStatesData?.[`${metric}Top5`] || [];
        return {
          metric,
          chartData: metricTop5
            .filter(
              (item) =>
                item.state.toLowerCase() !== "total" &&
                item[metric] !== undefined
            )
            .map((item) => ({
              state: item.state,
              value: item[metric],
            })),
        };
      }), [topStatesData, dataTypes]
  );

  const hideButtons = (hide: boolean) => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = hide ? "none" : "";
    });
  };

  const handlePrintCategory = () => {
    hideButtons(true);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      exportService.printComponent(
        element as HTMLDivElement,
        `Top 5 - ${category.toUpperCase()}`
      );
    }
    setTimeout(() => hideButtons(false), 500);
  };

  const handleExportCategoryCSV = () => {
    hideButtons(true);
    const csvRows: (string | number)[][] = [];
    allMetricData.forEach(({ metric, chartData }) => {
      csvRows.push([
        `Top 5 - ${metric.toUpperCase()} (${category.toUpperCase()})`,
      ]);
      csvRows.push(["State", "Value"]);
      chartData.forEach((item) =>
        csvRows.push([item.state, item.value])
      );
      csvRows.push([]);
    });
    exportService.exportToCSV(`top-5-${category}.csv`, [], csvRows);
    hideButtons(false);
  };

  return (
    <div id={`category-${category}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Top 5 States - {category.toUpperCase()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCategoryCSV}
            className="print-hide"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button
            variant="outline"
            onClick={handlePrintCategory}
            className="print-hide"
            size="sm"
          >
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {allMetricData.map(({ metric, chartData }) => (
          <ChartCard
            key={metric}
            title={`${metric.toUpperCase()} (${category.toUpperCase()})`}
            data={chartData}
          />
        ))}
      </div>
    </div>
  );
};

export const Top5DataView = ({
  allData,
  from,
  to,
  categories,
  dataTypes,
}: Props) => {
  const validCategories = useMemo(
    () => categories.filter(isValidCategoryKey),
    [categories]
  );

  return (
    <div className="space-y-3 mt-6">
      {validCategories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          allData={allData}
          from={from}
          to={to}
          dataTypes={dataTypes}
        />
      ))}
    </div>
  );
};