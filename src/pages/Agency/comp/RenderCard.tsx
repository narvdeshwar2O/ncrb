import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
}

interface RenderCardProps {
  title: string;
  total: Totals;
  selectedDataTypes?: string[]; // which metrics are active
}

/**
 * Always render all three metrics.
 * If a metric is *not* in `selectedDataTypes`, display 0 for that field.
 * If `selectedDataTypes` is empty or undefined, treat as "none selected" (show 0s).
 */
const RenderCard: React.FC<RenderCardProps> = ({
  title,
  total,
  selectedDataTypes = [],
}) => {
  const hasSelection = selectedDataTypes.length > 0;

  const getValue = (key: keyof Totals): number => {
    if (!hasSelection) return 0; // nothing selected -> zero everything
    return selectedDataTypes.includes(key) ? total[key] : 0;
  };

  return (
    <Card className="border border-l-4 border-blue-600 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Enrollment:{" "}
          <span className="font-semibold text-foreground">{getValue("enrollment")}</span>
        </p>
        <p>
          Hit:{" "}
          <span className="font-semibold text-foreground">{getValue("hit")}</span>
        </p>
        <p>
          No Hit:{" "}
          <span className="font-semibold text-foreground">{getValue("nohit")}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default RenderCard;
