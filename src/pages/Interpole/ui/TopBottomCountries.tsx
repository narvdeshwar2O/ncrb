import { Button } from "@/components/ui/button";
import ChartCard from "@/pages/agency/ui/ChartCard";
import { exportToCSV, printComponent } from "@/utils/exportService";
import { Download, Printer } from "lucide-react";
import { useMemo, useRef } from "react";
import getTopCountriesByDateRange from "../utils";

interface Props {
  allData: {
    date: string;
    data: { country: string; agency: string; count: number }[];
  }[];
  from: Date;
  to: Date;
}

const TopBottomCountries = ({ allData, from, to }: Props) => {
  const { top5, bottom5 } = useMemo(
    () => getTopCountriesByDateRange(allData, from, to),
    [allData, from, to]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Prepare CSV data
  const csvHeaders = ["Rank", "Country", "Total", "Type"];
  const csvRows: (string | number)[][] = [
    ...top5.map((c, idx) => [idx + 1, c.country, c.total, "Top"]),
    ...bottom5.map((c, idx) => [idx + 1, c.country, c.total, "Bottom"]),
  ];

  const handlePrint = () => {
    if (containerRef.current) {
      printComponent(containerRef.current, "Top and Bottom Countries");
    }
  };

  const handleExportCSV = () => {
    exportToCSV("top_bottom_countries.csv", csvHeaders, csvRows);
  };

  return (
    <div className="space-y-4">
      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" /> Print
        </Button>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" /> CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3" ref={containerRef}>
        {/* Top 5 */}
        <div>
          <h2 className="text-lg font-bold mb-3">Top 5 Countries</h2>
          <ChartCard
            title="Top 5 Countries"
            data={top5.map((c) => ({ state: c.country, value: c.total }))}
          />
        </div>

        {/* Bottom 5 */}
        <div>
          <h2 className="text-lg font-bold mb-3">Bottom 5 Countries</h2>
          <ChartCard
            title="Bottom 5 Countries"
            data={bottom5.map((c) => ({ state: c.country, value: c.total }))}
          />
        </div>
      </div>
    </div>
  );
};

export default TopBottomCountries;
