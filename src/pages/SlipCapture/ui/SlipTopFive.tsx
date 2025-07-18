import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SlipTableRow, StatusKey } from "../types";
import { topNByStatus } from "../utils";

interface SlipTop5Props {
  rows: SlipTableRow[];
  status: StatusKey;
}

const SlipTopFive: React.FC<SlipTop5Props> = ({ rows, status }) => {
  const top5 = topNByStatus(rows, status, 5);
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Top 5 States by {status}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          {top5.map((r) => (
            <li key={r.state}>
              {r.state}: {(r[status] as number).toLocaleString()}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

export default SlipTopFive;
