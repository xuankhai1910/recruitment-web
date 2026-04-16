import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LOCATIONS } from "@/lib/locations";
import { ChevronDown, MapPin, X } from "lucide-react";

interface LocationMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function LocationMultiSelect({
  value,
  onChange,
}: LocationMultiSelectProps) {
  const [open, setOpen] = useState(false);

  // Exclude "Tất cả thành phố" from multi-select — it's the empty state
  const selectableLocations = LOCATIONS.filter(
    (l) => l !== "Tất cả thành phố",
  );

  const toggleLocation = (loc: string) => {
    if (value.includes(loc)) {
      onChange(value.filter((v) => v !== loc));
    } else {
      onChange([...value, loc]);
    }
  };

  const removeLocation = (loc: string) => {
    onChange(value.filter((v) => v !== loc));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-lg bg-transparent px-3 text-left text-base transition-colors duration-200 hover:bg-accent/50"
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          {value.length === 0 ? (
            <span className="flex-1 text-muted-foreground">
              Chọn thành phố
            </span>
          ) : (
            <span className="flex flex-1 flex-wrap gap-1 overflow-hidden">
              {value.slice(0, 2).map((loc) => (
                <Badge
                  key={loc}
                  variant="secondary"
                  className="gap-1 text-xs font-normal"
                >
                  {loc}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocation(loc);
                    }}
                  />
                </Badge>
              ))}
              {value.length > 2 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{value.length - 2}
                </Badge>
              )}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-64 p-0"
      >
        <div className="border-b border-border/60 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Chọn thành phố</p>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
              }}
              className="cursor-pointer text-xs text-primary transition-colors duration-150 hover:text-primary/80"
            >
              Bỏ chọn tất cả
            </button>
          )}
        </div>
        <div className="max-h-56 overflow-y-auto p-1.5">
          {selectableLocations.map((loc) => {
            const checked = value.includes(loc);
            return (
              <label
                key={loc}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => {
                    toggleLocation(loc);
                  }}
                  className="cursor-pointer"
                />
                <span
                  className={
                    checked
                      ? "font-medium text-foreground"
                      : "text-foreground/80"
                  }
                >
                  {loc}
                </span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
