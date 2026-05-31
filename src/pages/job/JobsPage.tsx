import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/common/job-card/JobCard";
import { JfPager } from "@/components/common/JfPager";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import { CategorySpecializationModal } from "@/components/common/CategorySpecializationModal";
import {
  pushRecentSearch,
  SearchAutocomplete,
} from "@/components/common/SearchAutocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { LEVEL_LIST, SALARY_RANGES } from "@/lib/constants";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Grid3x3,
  Layers,
  List,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const;
const WORK_MODES = ["Onsite", "Remote", "Hybrid"] as const;

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { value: "-createdAt", label: "Mới nhất" },
  { value: "-salary.min", label: "Lương cao - thấp" },
  { value: "salary.min", label: "Lương thấp - cao" },
];
const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f"];

function parseMultiParam(value: string) {
  return value ? value.split(",").filter(Boolean) : [];
}

function CheckRow({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 py-1.5 text-sm transition-colors",
        checked ? "text-ink" : "text-slate-700 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center rounded border-[1.5px]",
          checked ? "border-ink bg-ink" : "border-ink-soft",
        )}
      >
        {checked && <Check className="h-3 w-3 text-teal-400" />}
      </span>
      <span>{label}</span>
    </div>
  );
}

function ActivePill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Bỏ ${label}`}
        className="opacity-70 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("current") || "1");
  const sort = searchParams.get("sort") || "-createdAt";
  const keywordParam = searchParams.get("keyword") || "";
  const locationParam = searchParams.get("location") || "";
  const levelParam = searchParams.get("level") || "";
  const salaryParam = searchParams.get("salary") || "all";
  const specializationParam = searchParams.get("specializations") || "";
  const jobTypeParam = searchParams.get("jobType") || "";
  const workModeParam = searchParams.get("workMode") || "";

  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const topRef = useRef<HTMLDivElement>(null);

  const locations = parseMultiParam(locationParam);
  const selectedLevels = parseMultiParam(levelParam);
  const selectedSpecializations = parseMultiParam(specializationParam);

  const sortForApi =
    sort === "-salary"
      ? "-salary.min"
      : sort === "salary"
        ? "salary.min"
        : sort;

  const queryParams: Record<string, unknown> = {
    current: page,
    pageSize: PAGE_SIZE,
    sort: sortForApi,
    isActive: true,
  };

  if (keywordParam) queryParams.keyword = keywordParam;
  if (locationParam) {
    queryParams.location = `/${parseMultiParam(locationParam).join("|")}/i`;
  }
  if (levelParam) {
    const levels = parseMultiParam(levelParam);
    queryParams.level =
      levels.length > 1 ? `/${levels.join("|")}/i` : levels[0];
  }
  if (selectedSpecializations.length > 0) {
    queryParams.specialization =
      selectedSpecializations.length > 1
        ? `/${selectedSpecializations
            .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|")}/i`
        : selectedSpecializations[0];
  }
  if (jobTypeParam) queryParams.jobType = jobTypeParam;
  if (workModeParam) queryParams.workMode = workModeParam;

  if (salaryParam === "negotiable") {
    queryParams["salary.isNegotiable"] = true;
  } else {
    const range = SALARY_RANGES.find((item) => item.key === salaryParam);
    if (range?.min !== undefined) queryParams["salary.min[$gte]"] = range.min;
    if (range?.max !== undefined) queryParams["salary.max[$lte]"] = range.max;
  }

  const { data, isLoading } = useJobs(queryParams);
  const meta = data?.meta;
  const jobs = data?.result ?? [];

  const setParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    updater(params);
    setSearchParams(params);
  };

  const setMultiParam = (key: "level", value: string) => {
    setParams((params) => {
      const current = parseMultiParam(params.get(key) || "");
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      if (next.length > 0) params.set(key, next.join(","));
      else params.delete(key);
      params.set("current", "1");
    });
  };

  const setSingleParam = (
    key: "jobType" | "workMode" | "salary",
    value: string,
  ) => {
    setParams((params) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.set("current", "1");
    });
  };

  const applyLocations = (next: string[]) => {
    setParams((params) => {
      if (next.length > 0) params.set("location", next.join(","));
      else params.delete("location");
      params.set("current", "1");
    });
  };

  const applySpecializationSelection = (specs: string[]) => {
    setParams((params) => {
      if (specs.length > 0) params.set("specializations", specs.join(","));
      else params.delete("specializations");
      params.set("current", "1");
    });
  };

  const applySearch = (nextKeyword: string) => {
    setParams((params) => {
      const trimmed = nextKeyword.trim();
      if (trimmed) {
        params.set("keyword", trimmed);
        pushRecentSearch(trimmed);
      } else {
        params.delete("keyword");
      }
      params.set("current", "1");
    });
  };

  const resetFilters = () => {
    setKeywordInput("");
    setSearchParams(new URLSearchParams());
  };

  const changePage = (next: number) => {
    setParams((params) => params.set("current", String(next)));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount =
    (keywordParam ? 1 : 0) +
    locations.length +
    selectedLevels.length +
    selectedSpecializations.length +
    (jobTypeParam ? 1 : 0) +
    (workModeParam ? 1 : 0) +
    (salaryParam !== "all" ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1280px] px-7 pb-16 pt-8" ref={topRef}>
      <div className="mb-5 flex items-center gap-2 text-[13px] text-slate-400">
        <Link to="/" className="text-slate-600 hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>Việc làm</span>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className={ui.h1}>Khám phá việc làm</h1>
          <p className="mt-3 text-[15px] text-slate-600">
            {meta ? (
              <>
                Có{" "}
                <b className="font-display font-bold text-ink">{meta.total}</b>{" "}
                việc làm phù hợp
                {keywordParam ? (
                  <>
                    {" "}
                    cho "
                    <b className="font-display font-bold text-ink">
                      {keywordParam}
                    </b>
                    "
                  </>
                ) : null}
              </>
            ) : (
              "Đang tải..."
            )}
          </p>
        </div>
        <form
          className="flex h-11 w-80 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 focus-within:border-ink"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch(keywordInput);
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <SearchAutocomplete
            value={keywordInput}
            onChange={setKeywordInput}
            onSelect={(v) => {
              setKeywordInput(v);
              applySearch(v);
            }}
            placeholder="Tìm theo tên việc hoặc kỹ năng"
            className="min-w-0 flex-1"
            showIcon={false}
            inputClassName="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border border-line bg-white p-6 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">
              Bộ lọc
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-teal-700"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="mb-6 border-b border-dashed border-line pb-6">
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Ngành nghề
            </h4>
            <button
              type="button"
              onClick={() => setSpecModalOpen(true)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors",
                selectedSpecializations.length > 0
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-line bg-white text-slate-700 hover:border-ink",
              )}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                {selectedSpecializations.length === 0
                  ? "Chọn ngành nghề"
                  : `Đã chọn ${selectedSpecializations.length}`}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            </button>
            {selectedSpecializations.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {selectedSpecializations.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    title={s}
                    className="max-w-full truncate rounded border border-line px-2 py-0.5 text-[11px] text-slate-700"
                  >
                    {s}
                  </span>
                ))}
                {selectedSpecializations.length > 3 && (
                  <span className="rounded border border-line bg-cream-2 px-2 py-0.5 text-[11px] text-slate-700">
                    +{selectedSpecializations.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 border-b border-dashed border-line pb-6">
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Cấp bậc
            </h4>
            {LEVEL_LIST.map((l) => (
              <CheckRow
                key={l}
                label={l}
                checked={selectedLevels.includes(l)}
                onClick={() => setMultiParam("level", l)}
              />
            ))}
          </div>

          <div className="mb-6 border-b border-dashed border-line pb-6">
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Địa điểm
            </h4>
            <LocationMultiSelect value={locations} onChange={applyLocations} />
          </div>

          <div className="mb-6 border-b border-dashed border-line pb-6">
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Hình thức làm việc
            </h4>
            {WORK_MODES.map((m) => (
              <CheckRow
                key={m}
                label={m}
                checked={workModeParam === m}
                onClick={() =>
                  setSingleParam("workMode", workModeParam === m ? "" : m)
                }
              />
            ))}
          </div>

          <div className="mb-6 border-b border-dashed border-line pb-6">
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Loại hình
            </h4>
            {JOB_TYPES.map((t) => (
              <CheckRow
                key={t}
                label={t}
                checked={jobTypeParam === t}
                onClick={() =>
                  setSingleParam("jobType", jobTypeParam === t ? "" : t)
                }
              />
            ))}
          </div>

          <div>
            <h4 className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600">
              Mức lương
            </h4>
            {SALARY_RANGES.filter((r) => r.key !== "all").map((r) => (
              <CheckRow
                key={r.key}
                label={r.label}
                checked={salaryParam === r.key}
                onClick={() =>
                  setSingleParam(
                    "salary",
                    salaryParam === r.key ? "all" : r.key,
                  )
                }
              />
            ))}
          </div>
        </aside>

        <div>
          {activeFilterCount > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {keywordParam && (
                <ActivePill
                  label={`"${keywordParam}"`}
                  onRemove={() => applySearch("")}
                />
              )}
              {selectedSpecializations.map((s) => (
                <ActivePill
                  key={"spec-" + s}
                  label={s}
                  onRemove={() =>
                    applySpecializationSelection(
                      selectedSpecializations.filter((x) => x !== s),
                    )
                  }
                />
              ))}
              {selectedLevels.map((l) => (
                <ActivePill
                  key={"lv-" + l}
                  label={l}
                  onRemove={() => setMultiParam("level", l)}
                />
              ))}
              {locations.map((loc) => (
                <ActivePill
                  key={"loc-" + loc}
                  label={loc}
                  onRemove={() =>
                    applyLocations(locations.filter((x) => x !== loc))
                  }
                />
              ))}
              {workModeParam && (
                <ActivePill
                  label={workModeParam}
                  onRemove={() => setSingleParam("workMode", "")}
                />
              )}
              {jobTypeParam && (
                <ActivePill
                  label={jobTypeParam}
                  onRemove={() => setSingleParam("jobType", "")}
                />
              )}
              {salaryParam !== "all" && (
                <ActivePill
                  label={
                    SALARY_RANGES.find((r) => r.key === salaryParam)?.label ??
                    ""
                  }
                  onRemove={() => setSingleParam("salary", "all")}
                />
              )}
            </div>
          )}

          <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              <span>Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) =>
                  setParams((p) => {
                    p.set("sort", e.target.value);
                    p.set("current", "1");
                  })
                }
                className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
                  view === "list"
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-slate-600 hover:border-ink",
                )}
                onClick={() => setView("list")}
                aria-label="Danh sách"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
                  view === "grid"
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-slate-600 hover:border-ink",
                )}
                onClick={() => setView("grid")}
                aria-label="Lưới"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div
              className={
                view === "list"
                  ? "flex flex-col gap-3"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2"
              }
            >
              {SKELETON_ROWS.map((r) => (
                <Skeleton
                  key={r}
                  className={
                    view === "list" ? "h-24 rounded-xl" : "h-60 rounded-xl"
                  }
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className={ui.empty}>
              <div className={ui.emptyIcon}>
                <SearchX className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-ink">
                Không có việc làm nào phù hợp
              </h3>
              <p className="max-w-[380px] text-sm text-slate-600">
                Thử thay đổi bộ lọc hoặc từ khóa khác để tìm thêm cơ hội.
              </p>
              {activeFilterCount > 0 && (
                <button
                  className={cn(ui.btnOutline, "mt-5")}
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : view === "list" ? (
            <div className="flex flex-col gap-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} variant="row" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} variant="default" />
              ))}
            </div>
          )}

          <JfPager
            page={page}
            totalPages={meta?.pages ?? 1}
            onChange={changePage}
          />
        </div>
      </div>

      <CategorySpecializationModal
        open={specModalOpen}
        onOpenChange={setSpecModalOpen}
        initialSpecializations={selectedSpecializations}
        onConfirm={({ specializations }) =>
          applySpecializationSelection(specializations)
        }
      />
    </div>
  );
}
