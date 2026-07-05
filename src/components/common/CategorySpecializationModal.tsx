import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Search, X } from "lucide-react";

import { useJobTaxonomy } from "@/hooks/useJobs";
import { nonAccentVietnamese } from "@/lib/vietnamese";
import { cn } from "@/lib/utils";

export interface CategorySelection {
  specializations: string[];
}

interface CategorySpecializationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSpecializations?: string[];
  onConfirm: (selection: CategorySelection) => void;
}

function matchesSearch(query: string, text: string): boolean {
  if (!query.trim()) return true;
  return nonAccentVietnamese(text)
    .toLowerCase()
    .includes(nonAccentVietnamese(query).toLowerCase().trim());
}

function CheckboxBtn({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-[18px] w-[18px] shrink-0 place-items-center rounded border-[1.5px] transition-colors",
        checked
          ? "border-teal-500 bg-teal-500 text-ink"
          : "border-ink-soft bg-white hover:border-teal-500",
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const listHeaderRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(initialSpecializations);
      setSearch("");
      setActiveCategory("");
    }
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const categories = useMemo(() => taxonomy?.categories ?? [], [taxonomy]);
  const specMap = useMemo(
    () => taxonomy?.specializationsByCategory ?? {},
    [taxonomy],
  );

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((cat) => {
      if (matchesSearch(search, cat)) return true;
      return (specMap[cat] ?? []).some((s) => matchesSearch(search, s));
    });
  }, [categories, specMap, search]);

  const currentActive = activeCategory || filteredCategories[0] || "";
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

  const selectedCountIn = (cat: string) =>
    (specMap[cat] ?? []).filter((s) => selected.includes(s)).length;

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

  const scrollToGroup = (cat: string) => {
    setActiveCategory(cat);
    const el = groupRefs.current[cat];
    const scrollEl = scrollRef.current;
    if (el && scrollEl) {
      const headerHeight = listHeaderRef.current?.offsetHeight ?? 0;
      const scrollRect = scrollEl.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const visibleHeight = scrollEl.clientHeight - headerHeight;
      const currentCenter = elRect.top + elRect.height / 2;
      const targetCenter = scrollRect.top + headerHeight + visibleHeight / 2;

      scrollEl.scrollTo({
        top: scrollEl.scrollTop + currentCenter - targetCenter,
        behavior: "smooth",
      });
    }
  };

  if (!open) return null;

  const railHeadCls =
    "sticky top-0 bg-cream-2 px-5 pb-2.5 pt-3.5 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="flex h-[720px] max-h-[calc(100vh-64px)] w-[980px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.32)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-[18px]">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">
            Chọn Nhóm nghề hoặc Chuyên môn
          </h2>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-cream-2 hover:text-ink"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="relative mx-6 my-4 flex h-11 items-center gap-2.5 rounded-lg border-[1.5px] border-teal-500 bg-white px-3.5">
          <Search className="h-4 w-4 shrink-0 text-slate-600" />
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Xóa"
              className="grid h-6 w-6 place-items-center rounded text-slate-600 hover:bg-cream-2 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 border-t border-line min-[720px]:grid-cols-[280px_1fr]">
          {/* Rail */}
          <aside className="flex min-h-0 flex-col border-r border-line bg-cream-2 max-[720px]:hidden">
            <div className={railHeadCls}>Nhóm nghề</div>
            <div className="flex-1 overflow-y-auto px-3 pb-4 pt-1">
              {isLoading && (
                <div className="px-2 py-8 text-center text-[13px] text-slate-600">
                  Đang tải danh mục…
                </div>
              )}
              {filteredCategories.map((cat) => {
                const checked = isCategoryAllSelected(cat);
                const selCount = selectedCountIn(cat);
                const showCount = selCount > 0 && !checked;
                return (
                  <div
                    key={cat}
                    onClick={() => scrollToGroup(cat)}
                    className={cn(
                      "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors",
                      currentActive === cat
                        ? "bg-white text-ink"
                        : "text-slate-700 hover:bg-white/70",
                    )}
                  >
                    <CheckboxBtn
                      checked={checked}
                      label={cat}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat);
                      }}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        currentActive === cat && "font-semibold",
                      )}
                    >
                      {cat}
                    </span>
                    <span
                      className="rounded-full bg-teal-500 px-1.5 font-mono-jb text-[11px] font-bold text-ink"
                      style={{ visibility: showCount ? "visible" : "hidden" }}
                    >
                      {selCount || 0}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </div>
                );
              })}
              {!isLoading && filteredCategories.length === 0 && (
                <div className="px-2 py-8 text-center text-[13px] text-slate-600">
                  Không tìm thấy nhóm nghề phù hợp.
                </div>
              )}
            </div>
          </aside>

          {/* Main */}
          <div
            className="relative min-h-0 overflow-y-auto bg-white"
            ref={scrollRef}
          >
            <div
              ref={listHeaderRef}
              className="sticky top-0 z-[1] grid grid-cols-[240px_1fr] gap-6 border-b border-line bg-white px-6 py-3.5 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 max-[720px]:grid-cols-1"
            >
              <span>Nghề</span>
              <span>Vị trí chuyên môn</span>
            </div>
            <div className="px-6 pb-6 pt-2">
              {filteredCategories.map((cat) => {
                const specs = specMap[cat] ?? [];
                const visibleSpecs = search.trim()
                  ? specs.filter(
                      (s) =>
                        matchesSearch(search, s) || matchesSearch(search, cat),
                    )
                  : specs;
                if (visibleSpecs.length === 0) return null;
                const checked = isCategoryAllSelected(cat);
                return (
                  <div
                    key={cat}
                    ref={(el) => {
                      groupRefs.current[cat] = el;
                    }}
                    className="grid grid-cols-[240px_1fr] items-start gap-6 border-b border-line-soft py-[18px] last:border-b-0 max-[720px]:grid-cols-1"
                  >
                    <div className="flex items-center gap-2.5 pt-1 text-sm font-medium text-ink">
                      <CheckboxBtn
                        checked={checked}
                        label={cat}
                        onClick={() => toggleCategory(cat)}
                      />
                      <span>{cat}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleSpecs.map((spec) => {
                        const on = selected.includes(spec);
                        return (
                          <button
                            key={spec}
                            onClick={() => toggleSpec(spec)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                              on
                                ? "border-teal-500 bg-teal-500 font-semibold text-ink"
                                : "border-line bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700",
                            )}
                          >
                            {on && <Check className="h-3 w-3" />}
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="px-2 py-8 text-center text-[13px] text-slate-600">
                  Không tìm thấy kết quả cho "<b>{search}</b>". Thử từ khóa
                  khác.
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line bg-white px-6 py-3.5">
          <button
            onClick={() => setSelected([])}
            disabled={totalSelected === 0}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-cream-2 hover:text-ink disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <X className="h-3.5 w-3.5" />
            Bỏ chọn tất cả ({totalSelected})
          </button>
          <div className="flex gap-2.5">
            <button
              className={ui_btnOutline}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </button>
            <button
              className={ui_btnAccent}
              onClick={() => {
                onConfirm({ specializations: selected });
                onOpenChange(false);
              }}
            >
              Chọn
              {totalSelected > 0 && (
                <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-black/20 px-1.5 font-mono-jb text-[11px] font-bold text-white">
                  {totalSelected}
                </span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const ui_btnOutline =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink bg-white px-[18px] text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white";
const ui_btnAccent =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-500 px-[18px] text-sm font-semibold text-white transition-colors hover:bg-teal-600";
