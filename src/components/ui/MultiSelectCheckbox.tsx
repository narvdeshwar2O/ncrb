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
  /** Disable user interaction. */
  disabled?: boolean;
  /** Text to show when disabled; falls back to placeholder. */
  disabledText?: string;
}

const MultiSelectCheckbox = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select Options",
  disabled = false,
  disabledText,
}: MultiSelectCheckboxProps) => {
  const [open, setOpen] = useState(false);

  const safeSetOpen = (v: boolean) => {
    if (disabled) return;
    setOpen(v);
  };

  const toggleOption = (value: string) => {
    if (disabled) return;
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(options);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]); // Clear all selections
  };

  const isSelected = (value: string) => selected.includes(value);

  const buttonLabel = disabled
    ? disabledText ?? placeholder
    : selected.length > 0
    ? `${selected.length} Selected`
    : placeholder;

  return (
    <div className="space-y-2 opacity-100">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={disabled ? false : open} onOpenChange={safeSetOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            {buttonLabel}
            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
        {!disabled && (
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
        )}
      </Popover>
    </div>
  );
};

export default MultiSelectCheckbox;
