import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { JobCard } from "@/components/common/JobCard";

const PAGE_SIZE = 5;

export function LatestJobs() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useJobs({
		current: page,
		pageSize: PAGE_SIZE,
		sort: "-createdAt",
		isActive: true,
	});

	const meta = data?.meta;
	const jobs = data?.result ?? [];

	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-7xl">
				{/* Section header */}
				<div className="mb-6 flex items-end justify-between">
					<div>
						<h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
							Việc làm mới nhất
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
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
								disabled={page <= 1}
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
								disabled={page >= meta.pages}
								onClick={() => {
									setPage((p) => p + 1);
								}}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Job list */}
				{isLoading ? (
					<div className="space-y-3">
						{Array.from(
							{ length: PAGE_SIZE },
							(_, index) => `latest-job-skeleton-${index}`,
						).map((skeletonId) => (
							<Skeleton key={skeletonId} className="h-24 rounded-lg" />
						))}
					</div>
				) : jobs.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-16">
						<Briefcase className="h-12 w-12 text-muted-foreground/40" />
						<p className="text-muted-foreground">Chưa có việc làm nào</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{jobs.map((job) => (
							<JobCard key={job._id} job={job} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
