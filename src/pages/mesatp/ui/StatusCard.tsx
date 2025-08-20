// components/slip-capture/ui/StatusCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, value }) => (
  <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
    <CardHeader className="py-2 px-3">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-3 text-2xl font-bold">
      {value.toLocaleString()}
    </CardContent>
  </Card>
);
