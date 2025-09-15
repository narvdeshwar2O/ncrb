import React, { useEffect, useMemo, useState } from "react";
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
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InterpoleFilters>({
    dateRange: { from, to },
    countries: [],
  });

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

  // Country + Agency totals
  const countryAgencyTotals = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {};

    filteredData.forEach((day) => {
      day.data.forEach((d) => {
        if (!totals[d.country]) totals[d.country] = {};
        totals[d.country][d.agency] =
          (totals[d.country][d.agency] || 0) + (d.count || 0);
      });
    });

    return Object.entries(totals).flatMap(([country, agencies]) =>
      Object.entries(agencies).map(([agency, total]) => ({
        country,
        agency,
        total,
      }))
    );
  }, [filteredData]);

  const totalCount = useMemo(
    () => countryAgencyTotals.reduce((sum, c) => sum + c.total, 0),
    [countryAgencyTotals]
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
              <CardContent className="py-3 flex justify-between items-center">
                <div>
                  <strong>Countries ({filters.countries.length}):</strong>{" "}
                  {filters.countries.length <= 3
                    ? filters.countries.join(", ")
                    : `${filters.countries.slice(0, 3).join(", ")} +${
                        filters.countries.length - 3
                      } more`}
                  <p className="text-sm mt-1">
                    <strong>Total count :</strong>{" "}
                    {totalCount.toLocaleString()}
                  </p>
                </div>

                {/* 👇 Toggle Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowTable((prev) => !prev)}
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                >
                  {showTable ? "Hide Table" : "Show Table"}
                </Button>
              </CardContent>
            </Card>

            {showTable ? (
              <InterpoleTable countryTotals={countryAgencyTotals} />
            ) : (
              <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Interpole;
