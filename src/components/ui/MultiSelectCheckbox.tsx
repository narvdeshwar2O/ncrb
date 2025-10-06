import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";

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

const ITEM_HEIGHT = 30;
const CONTAINER_HEIGHT = 224;
const OVERSCAN = 3;

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
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Convert selected array to Set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const getDisplayLabel = useCallback(
    (value: string): React.ReactNode => {
      if (getOptionLabel) return getOptionLabel(value);
      if (value.toLowerCase() === "enrol") return "ENROLL";
      return value.toUpperCase();
    },
    [getOptionLabel]
  );

  const safeSetOpen = (v: boolean) => {
    if (disabled) return;
    setOpen(v);
    setSearch("");
    setScrollTop(0);
  };

  const toggleOption = useCallback(
    (value: string) => {
      if (disabled) return;
      const newSelected = selectedSet.has(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onChange(newSelected);
    },
    [disabled, selected, selectedSet, onChange]
  );

  const handleSelectAll = useCallback(() => {
    if (!disabled) onChange(filteredOptions);
  }, [disabled, onChange]);

  const handleClearAll = useCallback(() => {
    if (!disabled) onChange([]);
  }, [disabled, onChange]);

  const handleRemoveChip = useCallback(
    (value: string) => {
      onChange(selected.filter((item) => item !== value));
    },
    [onChange, selected]
  );

  const buttonLabel = disabled
    ? disabledText ?? placeholder
    : selected.length > 0
    ? `${selected.length} Selected`
    : placeholder;

  // Filter options efficiently
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter((opt) => {
      const label = getDisplayLabel(opt);
      const labelText =
        typeof label === "string" ? label.toLowerCase() : opt.toLowerCase();
      return (
        opt.toLowerCase().includes(searchLower) ||
        labelText.includes(searchLower)
      );
    });
  }, [options, search, getDisplayLabel]);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const visibleEnd = Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT);

    const start = Math.max(0, visibleStart - OVERSCAN);
    const end = Math.min(filteredOptions.length, visibleEnd + OVERSCAN);

    return { start, end };
  }, [scrollTop, filteredOptions.length]);

  const visibleItems = useMemo(() => {
    return filteredOptions.slice(visibleRange.start, visibleRange.end);
  }, [filteredOptions, visibleRange]);

  const totalHeight = filteredOptions.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef.current && selected.length > 0) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
      });
    }
  }, [selected.length]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset scroll when search changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [search]);

  // Optimized option renderer
  const OptionItem = memo(
    ({ option }: { option: string }) => {
      const checked = selectedSet.has(option);
      const displayLabel = useMemo(() => getDisplayLabel(option), [option]);

      const handleClick = useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          toggleOption(option);
        },
        [option]
      );

      return (
        <div
          className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
          style={{ height: ITEM_HEIGHT }}
          onClick={handleClick}
        >
          <Checkbox id={`opt-${option}`} checked={checked} />
          <label
            htmlFor={`opt-${option}`}
            className="text-sm truncate cursor-pointer flex-1"
          >
            {displayLabel}
          </label>
        </div>
      );
    },
    (prevProps, nextProps) => prevProps.option === nextProps.option
  );
  OptionItem.displayName = "OptionItem";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={!disabled && open} onOpenChange={safeSetOpen}>
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
          <PopoverContent className="w-80 p-2 space-y-2">
            <div
              ref={containerRef}
              className="flex items-center gap-1 border rounded px-2 py-1 overflow-x-auto scrollbar-hide"
            >
              {selected.slice(0, 3).map((sel) => (
                <span
                  key={sel}
                  className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                >
                  {getDisplayLabel(sel)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChip(sel);
                    }}
                  />
                </span>
              ))}
              {selected.length > 3 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  +{selected.length - 3} more
                </span>
              )}
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 border-none shadow-none focus-visible:ring-1 focus-visible:ring-offset-1 focus:outline-none text-sm min-w-[200px]"
              />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <button onClick={handleSelectAll} className="hover:underline">
                Select All {search && `(${filteredOptions.length})`}
              </button>
              <button onClick={handleClearAll} className="hover:underline">
                Clear All
              </button>
            </div>

            {/* Custom virtualized list */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto border rounded"
              style={{ height: CONTAINER_HEIGHT }}
              onScroll={handleScroll}
            >
              {filteredOptions.length > 0 ? (
                <div style={{ height: totalHeight, position: "relative" }}>
                  <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((option) => (
                      <OptionItem key={option} option={option} />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm text-muted-foreground px-2 py-2 flex items-center justify-center"
                  style={{ height: CONTAINER_HEIGHT }}
                >
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
