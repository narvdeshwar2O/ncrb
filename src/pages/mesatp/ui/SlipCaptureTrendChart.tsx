import { useState } from "react";
import { GitCommitVertical, Download, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SlipDailyData, StatusKey } from "../types";
import { Button } from "@/components/ui/button";
import * as exportService from "@/utils/exportService";

// Chart configuration
const chartConfig: ChartConfig = {
  Arrested: { label: "Arrested", color: "#3B82F6" },
  Convicted: { label: "Convicted", color: "#22C55E" },
  Suspect: { label: "Suspect", color: "#EF4444" },
  Total: { label: "Total", color: "#F59E0B" },
};

// Fixed field mapping - use the actual field names from your data
const FIELD_MAPPING = {
  arrested: 'arresty_received_tp',
  convicted: 'convicted_received_tp',
  suspect: 'suspect_received_tp',
};

interface SlipCaptureTrendChartProps {
  filteredData: SlipDailyData[];
  selectedState: string;
}

export function SlipCaptureTrendChart({
  filteredData,
  selectedState,
}: SlipCaptureTrendChartProps) {
  const [activeLines, setActiveLines] = useState<StatusKey[]>([
    "Arrested",
    "Convicted",
    "Suspect",
    "Total",
  ]);

  const toggleLine = (key: StatusKey) => {
    setActiveLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Fixed data processing logic
  const chartData = filteredData
    .map((day, dayIndex) => {
      console.log(`\n=== DAY ${dayIndex + 1} ===`);
      console.log("Processing day:", day.date, "Looking for state:", selectedState);
      
      // Check if data exists
      if (!day.data?.state) {
        console.log("❌ No state data found");
        return null;
      }
      
      console.log("✅ Available states:", Object.keys(day.data.state));
      
      // Find state data (try exact match first, then case-insensitive)
      let stateData = day.data.state[selectedState];
      if (!stateData) {
        const stateKeys = Object.keys(day.data.state);
        const caseInsensitiveMatch = stateKeys.find(
          key => key.toLowerCase() === selectedState.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          stateData = day.data.state[caseInsensitiveMatch];
          console.log(`🔍 Found case-insensitive match: "${caseInsensitiveMatch}"`);
        } else {
          console.log(`❌ No data found for state: "${selectedState}"`);
          return null;
        }
      }

      console.log("✅ Found state data with districts:", Object.keys(stateData));

      // Initialize counters
      let arrested = 0;
      let convicted = 0;
      let suspect = 0;
      let processedSections = 0;

      // Aggregate data across all districts, acts, and sections for this state
      Object.entries(stateData).forEach(([districtName, districts]) => {
        console.log(`  District: ${districtName}`);
        
        if (!districts || typeof districts !== 'object') {
          console.log(`    ⚠️ Invalid district data for ${districtName}`);
          return;
        }
        
        Object.entries(districts).forEach(([actName, acts]) => {
          console.log(`    Act: ${actName}`);
          
          if (!acts || typeof acts !== 'object') {
            console.log(`      ⚠️ Invalid act data for ${actName}`);
            return;
          }
          
          Object.entries(acts).forEach(([sectionName, sectionData]) => {
            console.log(`      Section: ${sectionName}`);
            console.log(`      Section data:`, sectionData);
            
            if (!sectionData || typeof sectionData !== 'object' || sectionData === null) {
              console.log(`        ⚠️ Invalid section data for ${sectionName}`);
              return;
            }
            
            // Type assertion after null check
            const validSectionData = sectionData as Record<string, any>;
            
            processedSections++;
            
            // Extract values using the correct field names
            const arrestedValue = Number(validSectionData[FIELD_MAPPING.arrested] || 0);
            const convictedValue = Number(validSectionData[FIELD_MAPPING.convicted] || 0);
            const suspectValue = Number(validSectionData[FIELD_MAPPING.suspect] || 0);
            
            console.log(`        Values: arrested=${arrestedValue}, convicted=${convictedValue}, suspect=${suspectValue}`);
            
            arrested += arrestedValue;
            convicted += convictedValue;
            suspect += suspectValue;
            
            console.log(`        Running totals: arrested=${arrested}, convicted=${convicted}, suspect=${suspect}`);
          });
        });
      });

      const total = arrested + convicted + suspect;

      console.log(`📊 FINAL TOTALS for ${day.date}:`, { 
        arrested, 
        convicted, 
        suspect, 
        total, 
        processedSections 
      });

      return {
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: day.date,
        Arrested: arrested,
        Convicted: convicted,
        Suspect: suspect,
        Total: total,
      };
    })
    .filter(Boolean) as any[];

  console.log("🎯 FINAL CHART DATA:", chartData);
  console.log("📈 Chart data summary:", {
    totalDataPoints: chartData.length,
    totalArrested: chartData.reduce((sum, d) => sum + d.Arrested, 0),
    totalConvicted: chartData.reduce((sum, d) => sum + d.Convicted, 0),
    totalSuspect: chartData.reduce((sum, d) => sum + d.Suspect, 0),
  });

  const handleExportCSV = () => {
    const headers = ["Date", "Arrested", "Convicted", "Suspect", "Total"];
    const rows = chartData.map((d) => [
      d.date,
      d.Arrested,
      d.Convicted,
      d.Suspect,
      d.Total,
    ]);
    exportService.exportToCSV(`${selectedState}-trend.csv`, headers, rows);
  };

  const handlePrint = () => {
    if (chartData.length === 0) {
      alert(
        "No data available to print. Please select a valid state and date range."
      );
      return;
    }

    const hideElements = document.querySelectorAll<HTMLElement>(".print-hide");
    hideElements.forEach((el) => (el.style.display = "none"));

    const element = document.getElementById("trend-chart-container");
    exportService.printComponent(
      element as HTMLDivElement,
      `${selectedState} Trend Report`
    );

    setTimeout(() => {
      hideElements.forEach((el) => (el.style.display = ""));
    }, 500);
  };

  // Enhanced debugging for no data case
  if (chartData.length === 0) {
    console.log("❌ NO CHART DATA AVAILABLE");
    console.log("Filtered data length:", filteredData.length);
    console.log("Selected state:", selectedState);
    
    // Debug: Show available states
    const availableStates = new Set<string>();
    filteredData.forEach(day => {
      if (day.data?.state) {
        Object.keys(day.data.state).forEach(state => availableStates.add(state));
      }
    });
    console.log("Available states in data:", Array.from(availableStates));

    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base">No Data Available</CardTitle>
          <CardDescription className="text-xs">
            Selected state: "{selectedState}" not found in data.
            <br />
            Available states: {Array.from(availableStates).join(", ") || "None"}
            <br />
            Total filtered entries: {filteredData.length}
            <br />
            <strong>Debug: Check browser console for detailed logs</strong>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show debug info in the UI when data is found but values are zero
  const hasZeroData = chartData.every(d => d.Total === 0);

  return (
    <Card id="trend-chart-container" className="py-2">
      <CardHeader className="py-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedState} - Crime Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Arrested, Convicted, Suspect & Total ({chartData.length} data points)
              {hasZeroData && (
                <span className="text-red-500 block mt-1">
                  ⚠️ All values are zero - check console for detailed debug info
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 print-hide">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[400px]">
        <ChartContainer config={chartConfig} className="h-full w-full p-2">
          <div className="w-full h-[300px] sm:h-[340px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 8, bottom: 4, left: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ top: 0, cursor: "pointer" }}
                  payload={Object.keys(chartConfig).map((key) => ({
                    id: key,
                    value: chartConfig[key as StatusKey].label,
                    type: "line",
                    color: chartConfig[key as StatusKey].color,
                    inactive: !activeLines.includes(key as StatusKey),
                  }))}
                  onClick={(e) => toggleLine(e.id as StatusKey)}
                  formatter={(value, entry) => {
                    const isActive = activeLines.includes(entry?.id as StatusKey);
                    return (
                      <span style={{ opacity: isActive ? 1 : 0.4 }}>
                        {value}
                      </span>
                    );
                  }}
                />

                {activeLines.includes("Arrested") && (
                  <Line
                    dataKey="Arrested"
                    stroke={chartConfig.Arrested.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Convicted") && (
                  <Line
                    dataKey="Convicted"
                    stroke={chartConfig.Convicted.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Suspect") && (
                  <Line
                    dataKey="Suspect"
                    stroke={chartConfig.Suspect.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Total") && (
                  <Line
                    dataKey="Total"
                    stroke={chartConfig.Total.color}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={({ cx, cy, payload }) => {
                      const r = 14;
                      return (
                        <GitCommitVertical
                          key={payload.date}
                          x={cx - r / 2}
                          y={cy - r / 2}
                          width={r}
                          height={r}
                          fill="#FFFFFF"
                          stroke={chartConfig.Total.color}
                        />
                      );
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}