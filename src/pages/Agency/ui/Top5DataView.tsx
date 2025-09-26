import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import * as exportService from "@/utils/exportService";
import getTopStates from "@/utils/getTopStatesByDateRange";
import { Download, Globe, MapPin, Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  CategoryKey,
  categoryLabelMap,
  categoryOptions,
  DailyData,
  DistrictStats,
} from "../types";
import ChartCard from "./ChartCard";

function isValidCategoryKey(category: string): category is CategoryKey {
  return categoryOptions.includes(category as CategoryKey);
}

interface Props {
  allData: DailyData[];
  categories: string[];
  dataTypes: string[];
  selectedStates?: string[];
}

const getTopDistrictsByState = (
  allData: DailyData[],
  stateName: string,
  category: CategoryKey
) => {
  const districtTotals: Record<string, Record<string, number>> = {};
  const stateNameLower = stateName.toLowerCase().trim();

  allData.forEach((day) => {
    let stateData = null;

    for (const stateKey of Object.keys(day.data || {})) {
      if (stateKey.toLowerCase().trim() === stateNameLower) {
        stateData = day.data[stateKey];
        break;
      }
    }

    if (stateData) {
      Object.keys(stateData).forEach((district) => {
        const districtData = stateData[district];
        if (districtData && typeof districtData === "object") {
          const categoryData = districtData[category];
          if (categoryData && typeof categoryData === "object") {
            if (!districtTotals[district]) {
              districtTotals[district] = {
                hit: 0,
                nohit: 0,
                enrol: 0,
                delete: 0,
              };
            }
            districtTotals[district].hit += Number(categoryData.hit) || 0;
            districtTotals[district].nohit += Number(categoryData.nohit) || 0;
            districtTotals[district].enrol += Number(categoryData.enrol) || 0;
            districtTotals[district].delete += Number(categoryData.delete) || 0;
          }
        }
      });
    }
  });

  const districts: DistrictStats[] = Object.keys(districtTotals).map(
    (district) => ({
      district,
      hit: districtTotals[district].hit,
      nohit: districtTotals[district].nohit,
      enrol: districtTotals[district].enrol,
      delete: districtTotals[district].delete,
    })
  );

  return {
    hitTop5: districts
      .sort((a, b) => b.hit - a.hit)
      .slice(0, 5)
      .map((d) => ({ state: d.district, hit: d.hit })),
    nohitTop5: districts
      .sort((a, b) => b.nohit - a.nohit)
      .slice(0, 5)
      .map((d) => ({ state: d.district, nohit: d.nohit })),
    enrolTop5: districts
      .sort((a, b) => b.enrol - a.enrol)
      .slice(0, 5)
      .map((d) => ({ state: d.district, enrol: d.enrol })),
    deleteTop5: districts
      .sort((a, b) => b.delete - a.delete)
      .slice(0, 5)
      .map((d) => ({ state: d.district, delete: d.delete })),
  };
};

const CategorySection = ({
  category,
  allData,
  dataTypes,
  selectedStates = [],
}: {
  category: CategoryKey;
  allData: DailyData[];
  dataTypes: string[];
  selectedStates?: string[];
}) => {
  const [viewMode, setViewMode] = useState<"state" | "district">("state");
  const { toast } = useToast();
  const sectionRef = useRef<HTMLDivElement>(null);

  const topStatesData = useMemo(
    () => getTopStates(allData, category),
    [allData, category]
  );

  const topDistrictsData = useMemo(() => {
    if (selectedStates.length === 1) {
      return getTopDistrictsByState(allData, selectedStates[0], category);
    }
    return null;
  }, [allData, selectedStates, category]);

  const canShowDistricts = selectedStates.length === 1;

  const currentData =
    viewMode === "district" && topDistrictsData
      ? topDistrictsData
      : topStatesData;

  const allMetricData = useMemo(
    () =>
      dataTypes
        .filter((metric) => metric !== "total")
        .map((metric) => {
          const metricTop5 = currentData?.[`${metric}Top5`] || [];
          return {
            metric,
            chartData: metricTop5
              .filter(
                (item) =>
                  item.state?.toLowerCase() !== "total" &&
                  item[metric] !== undefined
              )
              .map((item) => ({ state: item.state, value: item[metric] })),
          };
        }),
    [currentData, dataTypes]
  );

  const hideButtons = (hide: boolean) => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = hide ? "none" : "";
    });
  };

  const handleToggleDistrictView = () => {
    if (!canShowDistricts && viewMode === "state") {
      toast({
        variant: "destructive",
        title: "Cannot switch to district view",
        description: `You have selected ${selectedStates.length} states. Please select only one.`,
        duration: 2500,
      });
      return;
    }
    setViewMode(viewMode === "state" ? "district" : "state");
  };

  const handleExportCSV = () => {
    hideButtons(true);

    const headers: string[] = [viewMode === "district" ? "District" : "State"];
    const dataRows: (string | number)[][] = [];

    allMetricData.forEach(({ metric, chartData }, i) => {
      headers.push(metric.toUpperCase());

      chartData.forEach((item, rowIndex) => {
        if (!dataRows[rowIndex]) dataRows[rowIndex] = [item.state];
        dataRows[rowIndex].push(item.value);
      });
    });

    const filename = `${category}-${viewMode}-top5.csv`;
    exportService.exportToCSV(filename, headers, dataRows);

    setTimeout(() => hideButtons(false), 500);
  };

  const handlePrint = () => {
    hideButtons(true);
    exportService.printComponent(
      sectionRef.current,
      viewMode === "district"
        ? `Top 5 Districts - ${category}`
        : `Top 5 States - ${category}`
    );
    setTimeout(() => hideButtons(false), 500);
  };

  return (
    <div id={`category-${category}`} ref={sectionRef}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          {viewMode === "district"
            ? `Top 5 Districts - ${
                categoryLabelMap[category] || category.toUpperCase()
              } (${selectedStates[0]})`
            : `Top 5 States - ${
                categoryLabelMap[category] || category.toUpperCase()
              }`}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "district" ? "default" : "outline"}
            onClick={handleToggleDistrictView}
            className="print-hide"
            size="sm"
          >
            {viewMode === "district" ? (
              <>
                <MapPin className="size-4 mr-1" /> Districts
              </>
            ) : (
              <>
                <Globe className="size-4 mr-1" />{" "}
                {canShowDistricts ? "District wise" : "Select 1 state only"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="print-hide"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="size-4 mr-1" /> CSV
          </Button>
          <Button
            variant="outline"
            className="print-hide"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="size-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {allMetricData.map(({ metric, chartData }) => (
          <ChartCard key={metric} title={`${metric}`} data={chartData} />
        ))}
      </div>
    </div>
  );
};

export const Top5DataView = ({
  allData,
  categories,
  dataTypes,
  selectedStates = [],
}: Props) => {
  const validCategories = useMemo(
    () => categories.filter(isValidCategoryKey),
    [categories]
  );

  return (
    <>
      <div className="space-y-3 mt-6">
        {validCategories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            allData={allData}
            dataTypes={dataTypes}
            selectedStates={selectedStates}
          />
        ))}
      </div>

      <Toaster />
    </>
  );
};
