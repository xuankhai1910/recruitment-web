import { useJobs, usePrefetchJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/common/JobCard";
import { JobDetailTooltip } from "@/components/common/JobDetailTooltip";

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

	// `placeholderData` only fills `data` while the query is pending. If a
	// fetch ends in error (common on Atlas free tier at high skip offsets),
	// `data` drops to `undefined` and the grid would flash to skeleton. We
	// cache the last successful payload here so the previous page stays
	// rendered even through error states.
	const [lastGood, setLastGood] = useState<typeof data>();
	useEffect(() => {
		if (data) setLastGood(data);
	}, [data]);
	const display = data ?? lastGood;
	const meta = display?.meta;
	const jobs = display?.result ?? [];

	// Prefetch adjacent pages so paginating feels instant. Skips when the
	// neighbour is out of range. The same staleTime as useJobs is set inside
	// usePrefetchJobs, so cache hits skip refetch on click.
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
		<section className="px-4 py-12">
			<div className="mx-auto max-w-7xl">
				{/* Section header */}
				<div className="mb-6 flex items-end justify-between">
					<div>
						<h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">
							Việc làm mới nhất
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							Cập nhật liên tục các cơ hội việc làm hấp dẫn
						</p>
					</div>
					{meta && meta.pages > 1 && (
						<div className="flex items-center gap-1.5">
							<span className="mr-1 text-sm font-medium text-muted-foreground">
								{page}/{meta.pages}
							</span>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 cursor-pointer transition-colors duration-150"
								disabled={page <= 1 || isFetching}
								onClick={() => {
									setPage((p) => p - 1);
								}}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 cursor-pointer transition-colors duration-150"
								disabled={page >= meta.pages || isFetching}
								onClick={() => {
									setPage((p) => p + 1);
								}}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Job grid.
				    Skeleton only when nothing has ever loaded. After the
				    first success, `display` falls back to the last good
				    payload, so transient errors don't blank the grid. */}
				{!display ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from(
							{ length: PAGE_SIZE },
							(_, index) => `latest-job-skeleton-${index}`,
						).map((skeletonId) => (
							<Skeleton key={skeletonId} className="h-52 rounded-xl" />
						))}
					</div>
				) : jobs.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-16">
						<Briefcase className="h-12 w-12 text-muted-foreground/40" />
						<p className="text-muted-foreground">Chưa có việc làm nào</p>
					</div>
				) : (
					<div
						className={`grid grid-cols-1 gap-4 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-4 ${
							isFetching ? "opacity-60" : ""
						}`}
					>
						{jobs.map((job) => (
							<JobDetailTooltip key={job._id} job={job}>
								<div>
									<JobCard job={job} variant="card" />
								</div>
							</JobDetailTooltip>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
