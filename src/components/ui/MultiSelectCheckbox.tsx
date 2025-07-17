import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface MultiSelectCheckboxProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectCheckbox = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select Options",
}: MultiSelectCheckboxProps) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      // ✅ Prevent removing last selected option
      if (selected.length === 1) return;
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    onChange(options);
  };

  const handleClearAll = () => {
    // ✅ Do nothing if only one selected (prevent clearing everything)
    if (selected.length <= 1) return;
    // ✅ Or keep first one selected instead of clearing all
    onChange([selected[0]]);
  };

  const isSelected = (value: string) => selected.includes(value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected.length > 0 ? `${selected.length} Selected` : placeholder}
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 max-h-72 overflow-y-auto p-2 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground px-1">
            <button onClick={handleSelectAll} className="hover:underline">
              Select All
            </button>
            <button onClick={handleClearAll} className="hover:underline">
              Clear All
            </button>
          </div>
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 px-1 py-1 rounded hover:bg-muted cursor-pointer"
            >
              <Checkbox
                id={option}
                checked={isSelected(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              <label htmlFor={option} className="text-sm">
                {option.toUpperCase()}
              </label>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectCheckbox;
