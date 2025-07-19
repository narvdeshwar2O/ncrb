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
  selectedDataTypes?: string[]; // Data type filter from parent
}

const RenderCard: React.FC<RenderCardProps> = ({ title, total, selectedDataTypes = [] }) => {
  const showAll = selectedDataTypes.length === 0;

  return (
    <Card className="border border-l-4 border-blue-600 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {(showAll || selectedDataTypes.includes("enrollment")) && (
          <p>
            Enrollment: <span className="font-semibold text-foreground">{total.enrollment}</span>
          </p>
        )}
        {(showAll || selectedDataTypes.includes("hit")) && (
          <p>
            Hit: <span className="font-semibold text-foreground">{total.hit}</span>
          </p>
        )}
        {(showAll || selectedDataTypes.includes("nohit")) && (
          <p>
            No Hit: <span className="font-semibold text-foreground">{total.nohit}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RenderCard;
