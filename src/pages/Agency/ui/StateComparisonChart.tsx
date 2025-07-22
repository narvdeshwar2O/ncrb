import React, { useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import { StateData } from "./AgencyTable";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV, printHTMLElement } from "@/utils/exportHelpers";

interface StateComparisonChartProps {
  data: StateData;
  selectedStates: string[];
  /** Which metrics are active from global filters. */
  dataTypes: string[]; // "enrollment" | "hit" | "nohit"
  /** Which categories are active from global filters. */
  categories?: string[]; // "tp" | "cp" | "mesa"
}

/** Stronger typing for internal use. */
type MetricKey = "enrollment" | "hit" | "nohit";
type CategoryKey = "tp" | "cp" | "mesa";

/** Friendly labels for legend. Adjust if needed. */
const categoryLabelMap: Record<CategoryKey, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

export function StateComparisonChart({
  data,
  selectedStates,
  dataTypes,
  categories,
}: StateComparisonChartProps) {
  // Normalize metrics
  const activeMetrics: MetricKey[] = (
    dataTypes?.length
      ? (dataTypes as MetricKey[])
      : ["enrollment", "hit", "nohit"]
  ) as MetricKey[];

  // Normalize categories
  const activeCategories: CategoryKey[] = (
    categories?.length
      ? (categories.filter((c) =>
          ["tp", "cp", "mesa"].includes(c)
        ) as CategoryKey[])
      : ["tp", "cp", "mesa"]
  ) as CategoryKey[];

  /** Ref to the whole card we want to capture as PNG. */
  const chartWrapRef = useRef<HTMLDivElement>(null);

  /** shorten x‑axis labels when many states */
  const maxLabelChars = selectedStates.length > 10 ? 6 : 10;

  /** Build chart rows for each state. Value = sum of selected metrics for that category. */
  const chartData = useMemo(() => {
    return selectedStates.map((state) => {
      const stateInfo = data[state] || {};
      const row: Record<string, any> = { state };

      activeCategories.forEach((cat) => {
        const rec = (stateInfo as any)[cat] as
          | { [K in MetricKey]?: number }
          | undefined;
        const sum = activeMetrics.reduce((acc, m) => acc + (rec?.[m] ?? 0), 0);
        row[cat] = sum;
      });

      return row;
    });
  }, [selectedStates, data, activeCategories, activeMetrics]);

  /** Track which categories actually have non‑zero data (to hide empty bars + CSV cols). */
  const hasCat = (cat: CategoryKey) => chartData.some((d) => (d[cat] ?? 0) > 0);
  const hasTP = activeCategories.includes("tp") && hasCat("tp");
  const hasCP = activeCategories.includes("cp") && hasCat("cp");
  const hasMESA = activeCategories.includes("mesa") && hasCat("mesa");

  /* ------------------------------------------------------------------ *
   *  CSV (client-side)
   * ------------------------------------------------------------------ */
  const handleExportCSV = () => {
    const { headers, rows } = buildHeadersAndRows(chartData, {
      hasTP,
      hasCP,
      hasMESA,
    });
    exportToCSV("state-comparison.csv", headers, rows);
  };

  /* ------------------------------------------------------------------ *
   *  Print (client-side)
   * ------------------------------------------------------------------ */
  const handlePrint = () => {
    printHTMLElement(chartWrapRef.current, "State Comparison Chart");
  };

  /* ------------------------------------------------------------------ *
   *  Excel Export via Node API
   *  - Capture chart to PNG (base64)
   *  - Send headers + rows + meta to Node
   *  - Receive Excel file blob; download
   * ------------------------------------------------------------------ */
  const handleExportExcel = async () => {
    if (!chartWrapRef.current) return;

    try {
      // capture card/chart to PNG
      const canvas = await html2canvas(chartWrapRef.current);
      const imageBase64 = canvas.toDataURL("image/png");

      // same tabular data we use for CSV
      const { headers, rows } = buildHeadersAndRows(chartData, {
        hasTP,
        hasCP,
        hasMESA,
      });

      // optional meta for workbook annotation
      const meta = {
        states: selectedStates,
        metrics: activeMetrics,
        categories: activeCategories,
        generatedAt: new Date().toISOString(),
      };

      const resp = await fetch("http://localhost:5000/save-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, headers, rows, meta }),
      });

      if (!resp.ok) {
        console.error("Excel export failed", resp.status, await resp.text());
        return;
      }

      const blob = await resp.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "state-comparison.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Excel export error", err);
    }
  };

  /* ------------------------------------------------------------------ *
   *  Early exit if <2 states selected
   * ------------------------------------------------------------------ */
  if (selectedStates.length < 2) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
        </CardContent>
      </Card>
    );
  }

  /* Legend based on visible categories */
  const legendPayload = [
    hasTP && {
      id: "tp",
      type: "square",
      value: categoryLabelMap.tp,
      color: "#2563eb",
    },
    hasCP && {
      id: "cp",
      type: "square",
      value: categoryLabelMap.cp,
      color: "#16a34a",
    },
    hasMESA && {
      id: "mesa",
      type: "square",
      value: categoryLabelMap.mesa,
      color: "#f59e0b",
    },
  ].filter(Boolean) as any[];

  /* Build tick formatter w/ ellipsis */
  const formatTick = (val: string) =>
    val.length > maxLabelChars ? `${val.slice(0, maxLabelChars)}…` : val;

  return (
    <Card className="mt-3 w-full" ref={chartWrapRef}>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold">State Comparison</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-1" /> Excel (Chart + Data)
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={700}>
          <BarChart
            data={chartData}
            margin={{ top: 60, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis
              dataKey="state"
              tickFormatter={formatTick}
              interval={0}
              height={80}
              tickLine={false}
            />
            <YAxis />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ top: 0 }}
              payload={legendPayload}
            />

            {hasTP && (
              <Bar
                dataKey="tp"
                fill="#2563eb"
                name={categoryLabelMap.tp}
                radius={[10, 10, 0, 0]}
              />
            )}
            {hasCP && (
              <Bar
                dataKey="cp"
                fill="#16a34a"
                name={categoryLabelMap.cp}
                radius={[10, 10, 0, 0]}
              />
            )}
            {hasMESA && (
              <Bar
                dataKey="mesa"
                fill="#f59e0b"
                name={categoryLabelMap.mesa}
                radius={[10, 10, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 *  Helper: build headers + rows in *visible order* for CSV/Excel.
 * ------------------------------------------------------------------ */
function buildHeadersAndRows(
  chartData: Array<Record<string, any>>,
  vis: { hasTP: boolean; hasCP: boolean; hasMESA: boolean }
) {
  const headers = ["State"];
  if (vis.hasTP) headers.push("TP");
  if (vis.hasCP) headers.push("CP");
  if (vis.hasMESA) headers.push("MESA");

  const rows = chartData.map((r) => {
    const row: (string | number)[] = [r.state];
    if (vis.hasTP) row.push(r.tp ?? 0);
    if (vis.hasCP) row.push(r.cp ?? 0);
    if (vis.hasMESA) row.push(r.mesa ?? 0);
    return row;
  });

  return { headers, rows };
}
