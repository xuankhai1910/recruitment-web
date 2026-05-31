import { useJobs, usePrefetchJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/common/job-card/JobCard";
import { JobDetailTooltip } from "@/components/common/job-card/JobDetailTooltip";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function LatestJobs() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useJobs({
    current: page,
    pageSize: PAGE_SIZE,
    sort: "-createdAt",
    isActive: true,
  });
  const prefetchJobs = usePrefetchJobs();

  const [lastGood, setLastGood] = useState<typeof data>();
  if (data && data !== lastGood) setLastGood(data);
  const display = data ?? lastGood;
  const meta = display?.meta;
  const jobs = display?.result ?? [];

  useEffect(() => {
    if (!meta) return;
    const base = {
      pageSize: PAGE_SIZE,
      sort: "-createdAt",
      isActive: true as const,
    };
    if (page < meta.pages) prefetchJobs({ ...base, current: page + 1 });
    if (page > 1) prefetchJobs({ ...base, current: page - 1 });
  }, [page, meta, prefetchJobs]);

  return (
    <section className="pb-14">
      <div className={ui.wrap}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className={cn(ui.eyebrow, "mb-3")}>Tất cả việc làm</div>
            <h2 className={ui.h2}>Việc làm mới nhất</h2>
            <p className={ui.sub}>
              Cập nhật liên tục các cơ hội việc làm hấp dẫn.
            </p>
          </div>
          {meta && meta.pages > 1 && (
            <div className="flex items-center gap-2">
              <span className="mr-1 font-mono-jb text-[13px] text-slate-600">
                {page}/{meta.pages}
              </span>
              <button
                className={ui.iconBtn}
                aria-label="Trang trước"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className={ui.iconBtn}
                aria-label="Trang sau"
                disabled={page >= meta.pages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {!display ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => `lj-sk-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-60 rounded-xl" />
              ),
            )}
          </div>
        ) : jobs.length === 0 ? (
          <div className={ui.empty}>
            <div className={ui.emptyIcon}>
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-ink">
              Chưa có việc làm nào
            </h3>
            <p className="max-w-[380px] text-sm text-slate-600">
              Hãy quay lại sau để khám phá các cơ hội mới.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              isFetching && "opacity-60",
            )}
          >
            {jobs.map((job, index) => (
              <JobDetailTooltip key={job._id} job={job}>
                <div>
                  <JobCard
                    job={job}
                    variant={page === 1 && index === 0 ? "dark" : "default"}
                  />
                </div>
              </JobDetailTooltip>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
