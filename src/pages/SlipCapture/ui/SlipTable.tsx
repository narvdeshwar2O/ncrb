// components/slip-capture/ui/SlipTable.tsx
import { SlipTableRow, StatusKey } from "../types";

interface SlipTableProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
}

export const SlipTable: React.FC<SlipTableProps> = ({ rows, statuses }) => {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-2 py-1 text-left">State</th>
            {statuses.map((s) => (
              <th key={s} className="px-2 py-1 text-right whitespace-nowrap">
                {s}
              </th>
            ))}
            <th className="px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.state} className="border-t">
              <td className="px-2 py-1 whitespace-nowrap">{r.state}</td>
              {statuses.map((s) => (
                <td key={s} className="px-2 py-1 text-right">
                  {(r[s] as number).toLocaleString()}
                </td>
              ))}
              <td className="px-2 py-1 text-right font-semibold">
                {(r.total as number).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
