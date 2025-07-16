import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import getTotal from "@/utils/getTotal";
import { DashboardFilters } from "../../components/filters/DashboardFilters"; // adjust import path as needed
import { FilterState } from "../../components/filters/types/FilterTypes";
import RenderCard from "./comp/RenderCard";
import { AgencyFilters } from "./comp/AgencyFilters";

interface DailyData {
  date: string;
  data: Record<
    string,
    Record<
      string,
      { enrollment: number; hit: number; nohit: number; total: number }
    >
  >;
}

interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
  total?: number;
}

function Agency() {
  const [allData, setAllData] = useState<DailyData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    district: "All Districts",
    state: "All States",
    crimeType: "All Crime Types",
  });

  useEffect(() => {
    const fetchData = async () => {
      const loaded = await loadAllMonthlyData();
      setAllData(loaded);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter((entry) => {
      const { from, to } = filters.dateRange;

      // Filter by date
      const entryDate = new Date(entry.date);
      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;

      // Filter by state
      if (filters.state !== "All States" && !(filters.state in entry.data))
        return false;

      return true;
    });
  }, [allData, filters]);

  const tpTotal: Totals = useMemo(
    () => getTotal(filteredData, "tp", filters.state),
    [filteredData, filters.state]
  );
  const cpTotal: Totals = useMemo(
    () => getTotal(filteredData, "cp", filters.state),
    [filteredData, filters.state]
  );
  const meshaTotal: Totals = useMemo(
    () => getTotal(filteredData, "mesha", filters.state),
    [filteredData, filters.state]
  );

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <AgencyFilters onFiltersChange={setFilters} />
        <Card className="border-l-4 border-blue-600 bg-slate-50 shadow-sm">
          <CardContent className="py-4 px-6 text-sm text-muted-foreground">
            <p>
              <strong>Total Days of Data:</strong> {filteredData.length} days
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RenderCard title="TP" total={tpTotal} />
          <RenderCard title="CP" total={cpTotal} />
          <RenderCard title="MESHA" total={meshaTotal} />
        </div>
      </div>
    </div>
  );
}

export default Agency;
