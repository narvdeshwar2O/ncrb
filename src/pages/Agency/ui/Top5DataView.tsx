import { useMemo, useRef } from "react";
import getTopStatesByDateRange from "@/utils/getTopStatesByDateRange";
import ChartCard from "./ChartCard";
import type { DailyData } from "../Agency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";

// ---------------- Types ----------------
type Category = "tp" | "cp" | "mesa";
type DataTypeKey = "enrollment" | "hit" | "nohit";

interface StateStats {
  state: string;
  enrollment: number;
  hit: number;
  nohit: number;
}

interface Top5DataViewProps {
  allData: DailyData[];
  from: Date;
  to: Date;
  categories: string[];
  dataTypes: string[];
}

// ---------------- Config ----------------
const metricsConfig: {
  key: DataTypeKey;
  label: string;
  dataKey: keyof ReturnType<typeof getTopStatesByDateRange>;
}[] = [
  { key: "enrollment", label: "Enrollment", dataKey: "enrollmentTop5" },
  { key: "hit", label: "Hit", dataKey: "hitTop5" },
  { key: "nohit", label: "NoHit", dataKey: "nohitTop5" },
];

const VALID_CATEGORIES: Category[] = ["tp", "cp", "mesa"];
const isValidCategory = (v: string): v is Category =>
  (VALID_CATEGORIES as string[]).includes(v);

const categoryLabelMap: Record<Category, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

export function Top5DataView({
  allData,
  from,
  to,
  categories,
  dataTypes,
}: Top5DataViewProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<Category, HTMLDivElement | null>>({
    tp: null,
    cp: null,
    mesa: null,
  });

  // Safe categories
  const activeCategories: Category[] = categories.filter(isValidCategory);

  // Precompute Top Data
  const topDataByCategory = useMemo(() => {
    return {
      tp: getTopStatesByDateRange(allData, from, to, "tp"),
      cp: getTopStatesByDateRange(allData, from, to, "cp"),
      mesa: getTopStatesByDateRange(allData, from, to, "mesa"),
    };
  }, [allData, from, to]);

  // Format Chart Data
  const formatChartData = (arr: StateStats[] | undefined, key: DataTypeKey) =>
    (arr ?? []).map((item) => ({
      state: item.state,
      value: item[key],
    }));

  // Print All
  const handlePrintAll = () => {
    const printButtons = document.querySelectorAll(".print-hide");
    printButtons.forEach((btn) => (btn as HTMLElement).style.display = "none");

    exportService.printComponent(viewRef.current, "Top 5 States Report - All");

    setTimeout(() => {
      printButtons.forEach((btn) => (btn as HTMLElement).style.display = "");
    }, 500);
  };

  // Export All CSV
  const handleExportAllCSV = () => {
    const csvRows: (string | number)[][] = [];
    activeCategories.forEach((category) => {
      const categoryLabel = categoryLabelMap[category];
      const categoryData = topDataByCategory[category];

      metricsConfig.forEach((metric) => {
        if (dataTypes.includes(metric.key)) {
          const metricData = categoryData[metric.dataKey] || [];
          csvRows.push([`Top 5 - ${categoryLabel} (${metric.label})`]);
          csvRows.push(["State", metric.label]);
          metricData.forEach((item) => {
            csvRows.push([item.state, item[metric.key]]);
          });
          csvRows.push([]);
        }
      });
    });

    exportService.exportRawDataToCSV("top-5-report-all.csv", csvRows);
  };

  // Print Row
  const handlePrintRow = (category: Category) => {
    const rowEl = rowRefs.current[category];
    const buttons = rowEl?.querySelectorAll(".print-hide") as
      | NodeListOf<HTMLElement>
      | undefined;

    buttons?.forEach((btn) => (btn.style.display = "none"));

    exportService.printComponent(
      rowEl,
      `${categoryLabelMap[category]} - Top 5 States`
    );

    setTimeout(() => {
      buttons?.forEach((btn) => (btn.style.display = ""));
    }, 500);
  };

  // Export Row CSV
  const handleExportRowCSV = (category: Category) => {
    const csvRows: (string | number)[][] = [];
    const categoryLabel = categoryLabelMap[category];
    const categoryData = topDataByCategory[category];

    metricsConfig.forEach((metric) => {
      if (dataTypes.includes(metric.key)) {
        const metricData = categoryData[metric.dataKey] || [];
        csvRows.push([`Top 5 - ${categoryLabel} (${metric.label})`]);
        csvRows.push(["State", metric.label]);
        metricData.forEach((item) => {
          csvRows.push([item.state, item[metric.key]]);
        });
        csvRows.push([]);
      }
    });

    exportService.exportRawDataToCSV(
      `${slugify(categoryLabel)}-top-5.csv`,
      csvRows
    );
  };

  return (
    <Card ref={viewRef}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Top 5 States by Category</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllCSV}
            className="print-hide"
          >
            <Download className="h-4 w-4 mr-1" /> CSV All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintAll}
            className="print-hide"
          >
            <Printer className="h-4 w-4 mr-1" /> Print All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {activeCategories.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No categories selected. Please choose at least one category.
          </div>
        ) : (
          activeCategories.map((category) => {
            const label = categoryLabelMap[category];
            const catData = topDataByCategory[category];

            return (
              <div
                key={category}
                className="border p-3 rounded-md"
                ref={(el) => (rowRefs.current[category] = el)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{label}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportRowCSV(category)}
                      className="print-hide"
                    >
                      <Download className="h-4 w-4 mr-1" /> Export Row CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintRow(category)}
                      className="print-hide"
                    >
                      <Printer className="h-4 w-4 mr-1" /> Print Row
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                  {metricsConfig.map(
                    (metric) =>
                      dataTypes.includes(metric.key) && (
                        <ChartCard
                          key={metric.key}
                          title={`${label} (${metric.label})`}
                          data={formatChartData(
                            catData[metric.dataKey],
                            metric.key
                          )}
                        />
                      )
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
