import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";
import { companyLogoUrl, formatJobSalary } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecommendedJobItem } from "@/types/cv-recommendation";

interface RecommendedJobCardProps {
	item: RecommendedJobItem;
}

function getScoreBadgeClass(score: number) {
	if (score >= 0.8) return "bg-blue-600 text-white";
	if (score >= 0.6) return "bg-blue-500 text-white";
	if (score >= 0.4) return "bg-blue-100 text-blue-700";
	return "bg-slate-100 text-slate-600";
}

export function RecommendedJobCard({ item }: RecommendedJobCardProps) {
	const { job, score } = item;
	const percent = Math.round(score * 100);
	const negotiable = !!job.salary?.isNegotiable;

	return (
		<div className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)]">
			<Link
				to={`/jobs/${job._id}`}
				className="flex min-w-0 items-start gap-3 pr-10"
			>
				{job.company?.logo ? (
					<img
						src={companyLogoUrl(job.company.logo)}
						alt={job.company.name}
						className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
					/>
				) : (
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
						<Building2 className="h-5 w-5 text-slate-400" />
					</div>
				)}
				<div className="min-w-0 flex-1">
					<h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-blue-700">
						{job.name}
					</h3>
					<p className="mt-0.5 line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
						{job.company?.name}
					</p>
				</div>
			</Link>

			<div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
				<span
					className={cn(
						"inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium",
						negotiable
							? "bg-rose-50 text-rose-600"
							: "bg-slate-100 text-slate-700",
					)}
				>
					{formatJobSalary(job.salary)}
				</span>
				<span className="inline-block max-w-[50%] truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
					{job.location}
				</span>
				<span
					className={cn(
						"inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold",
						getScoreBadgeClass(score),
					)}
				>
					{percent}% phù hợp
				</span>
			</div>

			<JobBookmarkButton
				jobId={job._id}
				className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600"
			/>
		</div>
	);
}
