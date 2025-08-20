import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { enIN } from "date-fns/locale";

interface DateCellProps {
  label: string;
  date: Date | null;
  onDateChange: (d: Date | null) => void;
}

const DateCell: React.FC<DateCellProps> = ({ label, date, onDateChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start text-left w-full", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd MMM yyyy", { locale: enIN }) : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <input
            type="date"
            className="p-2 text-sm border rounded-md"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const v = e.target.value;
              onDateChange(v ? new Date(v) : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateCell;
