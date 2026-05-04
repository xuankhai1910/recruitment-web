import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Banknote,
	Bookmark,
	BookmarkCheck,
	Building2,
	Clock,
	MapPin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import type { Job } from "@/types/job";
import { formatSalaryCompact, companyLogoUrl } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";
import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { cn } from "@/lib/utils";

interface JobCardProps {
	job: Job;
}

export function JobCard({ job }: JobCardProps) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const { data: savedCheck } = useCheckSaved(isAuthenticated ? job._id : "");
	const toggle = useToggleSaveJob();
	const saved = savedCheck ?? false;

	const handleBookmark = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) {
			toast.error("Đăng nhập để lưu việc làm");
			return;
		}
		toggle.mutate(job._id);
	};

	return (
		<Link to={`/jobs/${job._id}`} className="block">
			<Card className="group relative cursor-pointer transition-colors duration-150 hover:border-primary/50">
				<button
					type="button"
					onClick={handleBookmark}
					disabled={toggle.isPending}
					aria-label={saved ? "Bỏ lưu" : "Lưu việc làm"}
					className={cn(
						"absolute right-3 top-3 z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary",
						saved && "border-primary bg-primary/10 text-primary",
					)}
				>
					{saved ? (
						<BookmarkCheck className="h-4 w-4" />
					) : (
						<Bookmark className="h-4 w-4" />
					)}
				</button>
				<CardContent className="flex gap-4 p-4 sm:p-5">
					{job.company?.logo ? (
						<img
							src={companyLogoUrl(job.company.logo)}
							alt={job.company.name}
							className="h-14 w-14 shrink-0 rounded-md border border-border bg-white object-contain p-1"
						/>
					) : (
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
							<Building2 className="h-6 w-6 text-muted-foreground" />
						</div>
					)}

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 pr-10">
								<h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
									{job.name}
								</h3>
								<p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
									{job.company?.name}
								</p>
							</div>
							<span className="shrink-0 pr-10 font-heading text-sm font-semibold text-[#16A34A]">
								{formatSalaryCompact(job.salary)}
							</span>
						</div>

						<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
							<span className="inline-flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								{job.location}
							</span>
							<span className="inline-flex items-center gap-1">
								<Banknote className="h-3.5 w-3.5" />
								{job.level}
							</span>
							<span className="ml-auto hidden items-center gap-1 sm:inline-flex">
								<Clock className="h-3.5 w-3.5" />
								{formatDistanceToNow(new Date(job.createdAt), {
									addSuffix: true,
									locale: vi,
								})}
							</span>
						</div>

						{job.skills && job.skills.length > 0 && (
							<div className="mt-2.5 flex flex-wrap gap-1.5">
								{job.skills.slice(0, 4).map((s) => (
									<Badge
										key={s}
										variant="secondary"
										className="rounded-md bg-muted font-normal text-foreground/80 hover:bg-muted"
									>
										{s}
									</Badge>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
