// components/RenderCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
}

interface RenderCardProps {
  title: string;
  total: Totals;
}

function RenderCard({ title, total }: RenderCardProps) {
  return (
    <Card className="rounded-2xl border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p><strong>Enrollment:</strong> {total.enrollment.toLocaleString()}</p>
        <p><strong>Hit:</strong> {total.hit.toLocaleString()}</p>
        <p><strong>No Hit:</strong> {total.nohit.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

export default RenderCard;
