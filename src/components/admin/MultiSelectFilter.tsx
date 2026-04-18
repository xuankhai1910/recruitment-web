import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectFilterProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 min-w-40 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors duration-150 hover:border-primary/50"
        >
          <span className="text-muted-foreground">{label}:</span>
          {value.length === 0 ? (
            <span className="flex-1 text-left text-muted-foreground">
              Tất cả
            </span>
          ) : (
            <span className="flex flex-1 flex-wrap gap-1 overflow-hidden">
              {value.slice(0, 2).map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1 px-1.5 text-xs font-normal"
                >
                  {v}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(v);
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
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-56 p-1.5">
        {options.map((opt) => {
          const checked = value.includes(opt);
          return (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150 hover:bg-accent"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => { toggle(opt); }}
                className="cursor-pointer"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
