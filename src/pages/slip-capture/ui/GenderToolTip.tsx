import { TooltipProps } from "recharts";

// Custom Tooltip Component
const GenderChartTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // All status values for this gender
    const data = payload[0].payload;
    const total = data.total;

    return (
      <div className="rounded-md border bg-card p-3 shadow-md text-sm">
        <p className="font-semibold mb-1">Gender: {label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {entry.name}
              </span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t pt-1 flex justify-between font-semibold text-xs">
          <span>Total</span>
          <span>{total}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default GenderChartTooltip