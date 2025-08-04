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

  const enrollment = getValue("enrollment");
  const hit = getValue("hit");
  const nohit = getValue("nohit");
  const others = getValue("others");

  return (
    <Card className="border border-l-4 border-blue-600 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {enrollment > 0 && (
          <p>
            Enrollment:{" "}
            <span className="font-semibold text-foreground">{enrollment}</span>
          </p>
        )}
        {hit > 0 && (
          <p>
            Hit: <span className="font-semibold text-foreground">{hit}</span>
          </p>
        )}
        {nohit > 0 && (
          <p>
            No Hit:{" "}
            <span className="font-semibold text-foreground">{nohit}</span>
          </p>
        )}
        {others > 0 && (
          <p>
            Others:{" "}
            <span className="font-semibold text-foreground">{others}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RenderCard;
