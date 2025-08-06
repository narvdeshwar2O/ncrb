import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Totals } from "../types";

interface RenderCardProps {
  title: string;
  total: Totals;
  selectedDataTypes?: string[];
}

const RenderCard: React.FC<RenderCardProps> = ({
  title,
  total,
  selectedDataTypes = [],
}) => {
  const hasSelection = selectedDataTypes.length > 0;
  const getValue = (key: keyof Totals): number => {
    if (!hasSelection) return 0;
    return selectedDataTypes.includes(key) ? total[key] : 0;
  };

  const hit = getValue("hit");
  const nohit = getValue("nohit");
  const totalCount = getValue("total");
  const enrol = getValue("enrol");

  return (
    <Card className="border border-l-4 border-blue-600 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {selectedDataTypes.includes("enrol") && (
          <p>
            Enrollment:{" "}
            <span className="font-semibold text-foreground">{enrol}</span>
          </p>
        )}
        {selectedDataTypes.includes("hit") && (
          <p>
            Hit: <span className="font-semibold text-foreground">{hit}</span>
          </p>
        )}
        {selectedDataTypes.includes("nohit") && (
          <p>
            No Hit:{" "}
            <span className="font-semibold text-foreground">{nohit}</span>
          </p>
        )}
        {selectedDataTypes.includes("total") && (
          <p>
            Total:{" "}
            <span className="font-semibold text-foreground">{totalCount}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RenderCard;
