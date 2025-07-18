import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */
export interface SlipDailyData {
  /** ISO date string (yyyy-mm-dd) */
  date: string;
  /** State / UT -> arrest-category -> counts */
  data: Record<
    string,
    {
      Arrested: number;
      Convicted: number;
      Externee: number;
      Deportee: number;
      UIFP: number;
      Suspect: number;
      UDB: number;
      Absconder: number;
      total: number;
    }
  >;
}

/** Keys in each state record we want to expose as selectable metrics */
export const STATUS_KEYS = [
  "Arrested",
  "Convicted",
  "Externee",
  "Deportee",
  "UIFP",
  "Suspect",
  "UDB",
  "Absconder",
] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];

/* ------------------------------------------------------------------
 * Filters State (local to this component)
 * ------------------------------------------------------------------ */
export interface SlipFilters {
  /** Inclusive start / end date objects */
  dateRange: { from: Date | null; to: Date | null };
  /** Multi-select of states; empty => all */
  states: string[];
  /** Which statuses are active in the UI */
  statuses: StatusKey[];
}

/* ------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------ */
const getLast7DaysRange = (): { from: Date; to: Date } => {
  const today = new Date();
  const to = today;
  const from = new Date();
  from.setDate(today.getDate() - 7);
  return { from, to };
};

/** Build a sorted unique list of states present in the dataset */
function extractStates(data: SlipDailyData[]): string[] {
  const set = new Set<string>();
  for (const day of data) {
    for (const st of Object.keys(day.data)) set.add(st);
  }
  return Array.from(set).sort();
}

/** Filter dataset by date + state */
function filterSlipData(
  all: SlipDailyData[],
  filters: SlipFilters
): SlipDailyData[] {
  const { from, to } = filters.dateRange;
  const { states } = filters;
  const restrictStates = states && states.length > 0;

  return all.filter((entry) => {
    const d = new Date(entry.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (!restrictStates) return true;
    return states.some((s) => s in entry.data);
  });
}

/** Aggregate totals per status across all filtered days + states */
interface TotalsByStatus {
  [k: string]: number; // status->sum
  total: number; // grand total across statuses
}
function computeTotalsByStatus(
  filtered: SlipDailyData[],
  statuses: StatusKey[],
  restrictStates?: string[]
): TotalsByStatus {
  const sums: Record<string, number> = {} as Record<StatusKey, number>;
  for (const st of statuses) sums[st] = 0;
  let grand = 0;

  const hasRestrict = restrictStates && restrictStates.length > 0;

  for (const day of filtered) {
    const stateKeys = hasRestrict
      ? restrictStates!.filter((s) => s in day.data)
      : Object.keys(day.data);
    for (const stKey of stateKeys) {
      const rec = day.data[stKey];
      for (const status of statuses) {
        const v = rec?.[status] ?? 0;
        sums[status] += v;
        grand += v;
      }
    }
  }
  return { ...sums, total: grand } as TotalsByStatus;
}

/** Build a table shaped like: State -> per-status counts (summed across filtered days) */
export interface SlipTableRow {
  state: string;
  [k: string]: number | string; // statuses + total
}
function buildSlipTableData(
  filtered: SlipDailyData[],
  statuses: StatusKey[]
): SlipTableRow[] {
  const stateTotals: Record<string, Record<string, number>> = {};

  for (const day of filtered) {
    for (const [state, rec] of Object.entries(day.data)) {
      if (!stateTotals[state]) {
        stateTotals[state] = Object.fromEntries(statuses.map((s) => [s, 0]));
        stateTotals[state].total = 0;
      }
      const target = stateTotals[state];
      for (const s of statuses) {
        const v = rec?.[s as StatusKey] ?? 0;
        target[s] += v;
        target.total += v;
      }
    }
  }

  return Object.entries(stateTotals)
    .map(([state, stats]) => ({ state, ...stats }))
    .sort((a, b) => (b.total as number) - (a.total as number));
}

/** Derive top N states by a given status */
function topNByStatus(
  table: SlipTableRow[],
  status: StatusKey,
  n = 5
): SlipTableRow[] {
  return [...table]
    .sort((a, b) => (b[status] as number) - (a[status] as number))
    .slice(0, n);
}

/* ------------------------------------------------------------------
 * Small Presentational Components
 * ------------------------------------------------------------------ */

interface StatusCardProps {
  title: string;
  value: number;
}
const StatusCard: React.FC<StatusCardProps> = ({ title, value }) => (
  <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
    <CardHeader className="py-2 px-3">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-3 text-2xl font-bold">
      {value.toLocaleString()}
    </CardContent>
  </Card>
);

/* ------------------------------------------------------------------
 * Filters UI (inline minimal version tailored for SlipCapture)
 * ------------------------------------------------------------------ */
interface SlipFiltersProps {
  allStates: string[];
  value: SlipFilters;
  onChange: (f: SlipFilters) => void;
}

const SlipFiltersBar: React.FC<SlipFiltersProps> = ({
  allStates,
  value,
  onChange,
}) => {
  const { dateRange, states, statuses } = value;
  const { from, to } = dateRange;

  // ----- date handlers -----
  const setFrom = (d: Date | null) =>
    onChange({ ...value, dateRange: { from: d, to } });
  const setTo = (d: Date | null) =>
    onChange({ ...value, dateRange: { from, to: d } });

  // ----- state handlers -----
  const setStates = (newStates: string[]) =>
    onChange({ ...value, states: newStates });

  // ----- status handlers -----
  const toggleStatus = (k: StatusKey) => {
    const active = statuses.includes(k)
      ? statuses.filter((s) => s !== k)
      : [...statuses, k];
    onChange({ ...value, statuses: active });
  };

  return (
    <div className="w-full grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
      {/* From date */}
      <DateCell label="From" date={from} onDateChange={setFrom} />
      {/* To date */}
      <DateCell label="To" date={to} onDateChange={setTo} />
      {/* States multi-select */}
      <StatesMulti
        label="States"
        allStates={allStates}
        selected={states}
        onChange={setStates}
      />
      {/* Statuses checklist */}
      <StatusesChecklist selected={statuses} onToggle={toggleStatus} />
    </div>
  );
};

/* ---- Date picker cell (very light inline replacement; swap w/ your real component) ---- */
interface DateCellProps {
  label: string;
  date: Date | null;
  onDateChange: (d: Date | null) => void;
}
const DateCell: React.FC<DateCellProps> = ({ label, date, onDateChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd MMM yyyy", { locale: enIN }) : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* Replace with your calendar component; here use native input as placeholder */}
          <input
            type="date"
            className="p-2 text-sm border rounded-md"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const v = e.target.value;
              onDateChange(v ? new Date(v) : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

/* ---- States Multi ---- */
interface StatesMultiProps {
  label: string;
  allStates: string[];
  selected: string[];
  onChange: (s: string[]) => void;
}
const StatesMulti: React.FC<StatesMultiProps> = ({
  label,
  allStates,
  selected,
  onChange,
}) => {
  // Quick + cheap: show a <select multiple>. Replace w/ fancy multi-select if you have one.
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">{label}</label>
      <select
        multiple
        value={selected}
        onChange={(e) => {
          const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(opts);
        }}
        className="border rounded-md p-2 text-sm h-32"
      >
        {allStates.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ---- Statuses Checklist ---- */
interface StatusesChecklistProps {
  selected: StatusKey[];
  onToggle: (k: StatusKey) => void;
}
const StatusesChecklist: React.FC<StatusesChecklistProps> = ({
  selected,
  onToggle,
}) => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">Statuses</label>
      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-1 border rounded-md">
        {STATUS_KEYS.map((k) => {
          const checked = selected.includes(k);
          return (
            <label
              key={k}
              className="flex items-center gap-1 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(k)}
              />
              {k}
            </label>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
 * Table View
 * ------------------------------------------------------------------ */
interface SlipTableProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
}
const SlipTable: React.FC<SlipTableProps> = ({ rows, statuses }) => {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-2 py-1 text-left">State</th>
            {statuses.map((s) => (
              <th key={s} className="px-2 py-1 text-right whitespace-nowrap">
                {s}
              </th>
            ))}
            <th className="px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.state} className="border-t">
              <td className="px-2 py-1 whitespace-nowrap">{r.state}</td>
              {statuses.map((s) => (
                <td key={s} className="px-2 py-1 text-right">
                  {(r[s] as number).toLocaleString()}
                </td>
              ))}
              <td className="px-2 py-1 text-right font-semibold">
                {(r.total as number).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ------------------------------------------------------------------
 * Comparison Chart (stacked bar by state, selected statuses)
 * ------------------------------------------------------------------ */
interface SlipComparisonChartProps {
  rows: SlipTableRow[]; // aggregated per state
  statuses: StatusKey[]; // which statuses to show
  selectedStates: string[]; // which states to compare (subset of rows)
}
const SlipComparisonChart: React.FC<SlipComparisonChartProps> = ({
  rows,
  statuses,
  selectedStates,
}) => {
  const data = useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));
    const used =
      selectedStates.length > 0 ? selectedStates : rows.map((r) => r.state);
    return used
      .filter((s) => lookup.has(s))
      .map((s) => lookup.get(s)!)
      .map((r) => ({ ...r, name: r.state }));
  }, [rows, selectedStates]);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis />
        <Tooltip formatter={(v: any) => v.toLocaleString?.() ?? v} />
        <Legend />
        {statuses.map((s) => (
          <Bar
            key={s}
            dataKey={s}
            stackId="a" /* no color specified per tool rule */
          >
            <LabelList
              dataKey={s}
              position="top"
              formatter={(v: any) => (v > 0 ? v : "")}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ------------------------------------------------------------------
 * Top 5 View (by total OR by first selected status)
 * ------------------------------------------------------------------ */
interface SlipTop5Props {
  rows: SlipTableRow[];
  status: StatusKey; // which metric to rank by
}
const SlipTop5: React.FC<SlipTop5Props> = ({ rows, status }) => {
  const top5 = topNByStatus(rows, status, 5);
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Top 5 States by {status}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {top5.map((r, i) => (
            <li key={r.state}>
              {r.state}: {(r[status] as number).toLocaleString()}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------------
 * Main Component
 * ------------------------------------------------------------------ */
const SlipCapture: React.FC = () => {
  const [{ from, to }, initial] = useState(getLast7DaysRange()); // <— only used for init
  const [allData, setAllData] = useState<SlipDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SlipFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [...STATUS_KEYS],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  /* ---------------------------- data load ---------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loaded = await loadAllMonthlyData({ type: "slip_cp" });
        // NOTE: If the loaded shape differs, transform to SlipDailyData here.
        setAllData(loaded as unknown as SlipDailyData[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ------------------------- derived selectors ----------------------- */
  const allStates = useMemo(() => extractStates(allData), [allData]);

  const filteredData = useMemo(
    () => filterSlipData(allData, filters),
    [allData, filters]
  );

  const tableRows = useMemo(
    () => buildSlipTableData(filteredData, filters.statuses),
    [filteredData, filters.statuses]
  );

  const selectedStates = filters.states; // alias for readability
  const selectedStateCount = selectedStates.length; // (0 => all)

  const totalsByStatus = useMemo(
    () => computeTotalsByStatus(filteredData, filters.statuses, selectedStates),
    [filteredData, filters.statuses, selectedStates]
  );

  /* ---------------------------- loading UI --------------------------- */
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-48 mb-2 flex items-center justify-center">
            Loading...
          </Skeleton>
        </div>
      </div>
    );
  }

  /* ---------------------------- render ------------------------------- */
  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <SlipFiltersBar
          allStates={allStates}
          value={filters}
          onChange={setFilters}
        />

        <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
          <CardContent className="py-2 px-2 text-sm text-muted-foreground flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
            <p>
              <strong>You are currently viewing:</strong>{" "}
              <strong>{filteredData.length}</strong> days of data containing
              states/UTs:{" "}
              <strong>
                {selectedStateCount === 0 ? "All" : selectedStateCount}
              </strong>
            </p>
            <Button size="sm" onClick={() => setShowTable((p) => !p)}>
              {showTable ? "Hide Tabular Data" : "Show Tabular Data"}
            </Button>
          </CardContent>
        </Card>

        {showTable ? (
          <SlipTable rows={tableRows} statuses={filters.statuses} />
        ) : (
          <>
            {/* Totals Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.statuses.map((s) => (
                <StatusCard key={s} title={s} value={totalsByStatus[s] ?? 0} />
              ))}
            </div>

            {/* Chart Toggle */}
            <div className="border p-3 rounded-md flex flex-col items-end">
              <Button
                size="sm"
                onClick={() => setShowCompareChart((p) => !p)}
                className="mb-3"
              >
                {showCompareChart
                  ? "Hide Comparison Chart"
                  : "Show Comparison Chart"}
              </Button>

              {showCompareChart ? (
                selectedStateCount >= 2 && selectedStateCount <= 5 ? (
                  <SlipComparisonChart
                    rows={tableRows}
                    statuses={filters.statuses}
                    selectedStates={selectedStates}
                  />
                ) : (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md text-sm text-muted-foreground">
                      Please select at least 2 and at most 5 states for chart
                      comparison.
                    </p>
                  </div>
                )
              ) : null}
            </div>

            {/* Top 5 (by first selected status fallback Arrested) */}
            <SlipTop5
              rows={tableRows}
              status={(filters.statuses[0] ?? "Arrested") as StatusKey}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SlipCapture;
