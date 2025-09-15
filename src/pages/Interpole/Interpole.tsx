import React, { useEffect, useMemo, useState, useRef } from "react";
import { loadAllMonthlyDataReal } from "@/utils/loadAllMonthlyDataRealData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLastNDaysRange } from "@/utils/getLastNdays";
import InterpoleFilter from "./filters/Interpolefiter";
import InterpoleTable from "./ui/InterpoleTable";
import { CountryComparison } from "./ui/CountryComparison";
import { InterpoleDailyData, InterpoleFilters } from "./Types";
import TopBottomCountries from "./ui/TopBottomCountries";

const Interpole: React.FC = () => {
  const [{ from, to }] = useState(getLastNDaysRange(7));
  const [allData, setAllData] = useState<InterpoleDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InterpoleFilters>({
    dateRange: { from, to },
    countries: [],
  });

  const tableRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const loaded = await loadAllMonthlyDataReal({ type: "interpole" });
        if (!loaded || !Array.isArray(loaded)) {
          throw new Error("Invalid data format received");
        }
        setAllData(loaded as InterpoleDailyData[]);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (allData.length === 0) return [];

    const { from, to } = filters.dateRange;
    const { countries } = filters;

    const start = from ? new Date(from.setHours(0, 0, 0, 0)) : null;
    const end = to ? new Date(to.setHours(23, 59, 59, 999)) : null;

    return allData
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return (!start || entryDate >= start) && (!end || entryDate <= end);
      })
      .map((entry) => ({
        ...entry,
        data: entry.data.filter((d) =>
          countries.length > 0
            ? countries
                .map((c) => c.toUpperCase())
                .includes(d.country.toUpperCase())
            : true
        ),
      }))
      .filter((entry) => entry.data.length > 0);
  }, [allData, filters]);

  // Country-wise totals
  const countryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredData.forEach((day) => {
      day.data.forEach((d) => {
        totals[d.country] = (totals[d.country] || 0) + (d.count || 0);
      });
    });
    return Object.entries(totals).map(([country, total]) => ({
      country,
      total: total ?? 0,
    }));
  }, [filteredData]);

  const totalCount = useMemo(
    () => countryTotals.reduce((sum, c) => sum + c.total, 0),
    [countryTotals]
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">Error</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        {/* Filters */}
        <InterpoleFilter
          value={filters}
          onChange={setFilters}
          allData={allData}
        />

        {filters.countries.length === 0 ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No countries selected. Use the <em>Countries</em> filter above.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <Card className="border-l-4 border-r-4 border-blue-600 bg-card shadow-sm">
              <CardContent className="py-3">
                <div>
                  <strong>Countries ({filters.countries.length}):</strong>{" "}
                  {filters.countries.length <= 3
                    ? filters.countries.join(", ")
                    : `${filters.countries.slice(0, 3).join(", ")} +${
                        filters.countries.length - 3
                      } more`}
                </div>
                <p className="text-sm">
                  <strong>Total count :</strong> {totalCount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <InterpoleTable countryTotals={countryTotals} />
            <CountryComparison
              rows={filteredData}
              selectedCountries={filters.countries}
            />
            <TopBottomCountries
              allData={filteredData}
              from={filters.dateRange.from!}
              to={filters.dateRange.to!}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Interpole;
