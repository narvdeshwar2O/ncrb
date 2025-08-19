import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MultiSelectCheckboxProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledText?: string;
  getOptionLabel?: (value: string) => React.ReactNode;
}

const MultiSelectCheckbox = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select Options",
  disabled = false,
  disabledText,
  getOptionLabel,
}: MultiSelectCheckboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeSetOpen = (v: boolean) => {
    if (disabled) return;
    setOpen(v);
    setSearch(""); // reset search when closing/opening
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

  const handleRemoveChip = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const isSelected = (value: string) => selected.includes(value);

  const buttonLabel = disabled
    ? disabledText ?? placeholder
    : selected.length > 0
    ? `${selected.length} Selected`
    : placeholder;

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // 🔥 Always scroll to keep search input visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [selected, search]);

  // 🔥 Auto-focus search when Popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="space-y-2">
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
          <PopoverContent className="w-80 max-h-80 p-2 space-y-2">
            {/* Chips + Search inside scrollable row */}
            <div
              ref={containerRef}
              className="flex items-center gap-1 border rounded px-2 py-1 overflow-x-auto scrollbar-hide"
            >
              {selected.map((sel) => (
                <span
                  key={sel}
                  className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                >
                  {getOptionLabel ? getOptionLabel(sel) : sel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveChip(sel)}
                  />
                </span>
              ))}
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 border-none shadow-none focus-visible:ring-0 text-sm min-w-[100px]"
              />
            </div>

            {/* Select All / Clear All */}
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <button onClick={handleSelectAll} className="hover:underline">
                Select All
              </button>
              <button onClick={handleClearAll} className="hover:underline">
                Clear All
              </button>
            </div>

            {/* Options */}
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
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
                      {getOptionLabel ? getOptionLabel(option) : option}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground px-1 py-2">
                  No results found
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default MultiSelectCheckbox;
