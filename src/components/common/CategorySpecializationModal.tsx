import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobTaxonomy } from "@/hooks/useJobs";
import { nonAccentVietnamese } from "@/lib/vietnamese";
import { cn } from "@/lib/utils";

export interface CategorySelection {
  /** Selected specialization strings (across any categories). */
  specializations: string[];
}

interface CategorySpecializationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already-selected specializations to preload the modal with. */
  initialSpecializations?: string[];
  /** Called with the final selection when user confirms. */
  onConfirm: (selection: CategorySelection) => void;
}

function matchesSearch(query: string, text: string): boolean {
  if (!query.trim()) return true;
  return nonAccentVietnamese(text)
    .toLowerCase()
    .includes(nonAccentVietnamese(query).toLowerCase().trim());
}

/**
 * Picker modal for IT job category → specialization taxonomy.
 *
 * Layout (matches TopCV-style screenshot the product team supplied):
 *  - Left column: list of categories. Hover/click opens the category on the
 *    right. A category checkbox toggles ALL its specializations at once.
 *  - Right column: every category + its specializations as toggle pills.
 *    User can multi-select pills across categories.
 *
 * Confirmation returns the flat list of selected specialization strings —
 * filtering by category alone isn't useful since specialization already
 * implies its parent.
 */
export function CategorySpecializationModal({
  open,
  onOpenChange,
  initialSpecializations = [],
  onConfirm,
}: CategorySpecializationModalProps) {
  const { data: taxonomy, isLoading } = useJobTaxonomy();
  const [selected, setSelected] = useState<string[]>(initialSpecializations);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(initialSpecializations);
      setActiveCategory("");
      setSearch("");
    }
  }, [open, initialSpecializations]);

  const categories = taxonomy?.categories ?? [];
  const specMap = taxonomy?.specializationsByCategory ?? {};

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((cat) => {
      if (matchesSearch(search, cat)) return true;
      const specs = specMap[cat] ?? [];
      return specs.some((s) => matchesSearch(search, s));
    });
  }, [categories, specMap, search]);

  const totalSelected = selected.length;

  const toggleSpec = (spec: string) => {
    setSelected((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const isCategoryAllSelected = (cat: string) => {
    const specs = specMap[cat] ?? [];
    if (specs.length === 0) return false;
    return specs.every((s) => selected.includes(s));
  };

  const isCategoryPartiallySelected = (cat: string) => {
    const specs = specMap[cat] ?? [];
    return specs.some((s) => selected.includes(s)) && !isCategoryAllSelected(cat);
  };

  const toggleCategory = (cat: string) => {
    const specs = specMap[cat] ?? [];
    const allOn = isCategoryAllSelected(cat);
    setSelected((prev) => {
      if (allOn) return prev.filter((s) => !specs.includes(s));
      const merged = new Set(prev);
      for (const s of specs) merged.add(s);
      return Array.from(merged);
    });
  };

  const clearAll = () => setSelected([]);

  const handleConfirm = () => {
    onConfirm({ specializations: selected });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold">
            Chọn Nhóm nghề, Nghề hoặc Chuyên môn
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm"
              className="pl-9 h-10"
            />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
          {/* Categories column */}
          <div className="border-r border-slate-100 overflow-y-auto">
            <p className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Nhóm nghề
            </p>
            {isLoading ? (
              <div className="space-y-2 px-3">
                {Array.from({ length: 8 }, (_, i) => `cat-sk-${i}`).map((k) => (
                  <Skeleton key={k} className="h-10 rounded-md" />
                ))}
              </div>
            ) : (
              <ul className="space-y-0.5 pb-3">
                {filteredCategories.map((cat) => {
                  const checked = isCategoryAllSelected(cat);
                  const partial = isCategoryPartiallySelected(cat);
                  const isActive = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <Checkbox
                          checked={checked || (partial ? "indeterminate" : false)}
                          onCheckedChange={() => toggleCategory(cat)}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "shrink-0",
                            checked && "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600",
                          )}
                        />
                        <span className="flex-1 line-clamp-2 leading-snug">
                          {cat}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Specializations column */}
          <div className="overflow-y-auto">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_2fr] border-b border-slate-100 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Nghề</span>
              <span>Vị trí chuyên môn</span>
            </div>
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }, (_, i) => `spec-sk-${i}`).map((k) => (
                  <Skeleton key={k} className="h-24 rounded-md" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => {
                  const specs = specMap[cat] ?? [];
                  const visibleSpecs = search.trim()
                    ? specs.filter(
                        (s) => matchesSearch(search, s) || matchesSearch(search, cat),
                      )
                    : specs;
                  if (visibleSpecs.length === 0) return null;
                  const catChecked = isCategoryAllSelected(cat);
                  return (
                    <li
                      key={cat}
                      className="grid grid-cols-[1fr_2fr] gap-3 px-4 py-4"
                    >
                      <div>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                          <Checkbox
                            checked={catChecked || (isCategoryPartiallySelected(cat) ? "indeterminate" : false)}
                            onCheckedChange={() => toggleCategory(cat)}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="leading-snug">{cat}</span>
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visibleSpecs.map((spec) => {
                          const active = selected.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpec(spec)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer",
                                active
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600",
                              )}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm text-slate-500">
                    Không tìm thấy kết quả phù hợp
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={clearAll}
            disabled={totalSelected === 0}
            className={cn(
              "inline-flex items-center gap-1 text-sm transition-colors",
              totalSelected === 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:text-emerald-600 cursor-pointer",
            )}
          >
            <X className="h-3.5 w-3.5" />
            Bỏ chọn tất cả ({totalSelected})
          </button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleConfirm}
            >
              Chọn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
