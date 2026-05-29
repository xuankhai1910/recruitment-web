import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";

import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";
import { companyLogoUrl, formatJobSalary } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { RecommendedJobItem } from "@/types/cv-recommendation";

interface RecommendedJobCardProps {
	item: RecommendedJobItem;
}

export function RecommendedJobCard({ item }: RecommendedJobCardProps) {
	const { job, score } = item;
	const navigate = useNavigate();
	const percent = Math.round(score * 100);
	const negotiable = !!job.salary?.isNegotiable;
	const logo = companyLogoUrl(job.company?.logo);

	return (
		<article
			onClick={() => navigate(`/jobs/${job._id}`)}
			className="group relative flex cursor-pointer flex-col gap-3.5 overflow-hidden rounded-xl border border-line bg-white p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.18)]"
		>
			<span className="absolute inset-y-[18px] left-0 w-0.5 rounded-sm bg-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />
			<div className="flex min-w-0 items-start gap-3">
				{logo ? (
					<div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg">
						<img src={logo} alt={job.company?.name} className="h-full w-full bg-white object-contain" />
					</div>
				) : (
					<div
						className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display text-[13px] font-bold text-white"
						style={{ background: brandColor(job.company?.name) }}
					>
						{brandShort(job.company?.name)}
					</div>
				)}
				<div className="min-w-0 flex-1">
					<div className="line-clamp-2 min-h-[2.5em] font-display text-[15px] font-semibold leading-tight tracking-tight text-ink">
						{job.name}
					</div>
					<div className="mt-1 truncate font-mono-jb text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-600">
						{job.company?.name}
					</div>
				</div>
				<JobBookmarkButton jobId={job._id} size="sm" />
			</div>
			<div className="mt-auto flex items-center gap-1.5">
				<span
					className={cn(
						"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-medium",
						negotiable ? "bg-rose-50 text-rose-800" : "bg-cream-2 text-ink",
					)}
				>
					{formatJobSalary(job.salary)}
				</span>
				<span className="inline-flex min-w-0 items-center gap-1 rounded-full border border-line bg-cream-2 px-2 py-[3px] text-[11px] font-medium text-ink">
					<MapPin className="h-[11px] w-[11px] shrink-0" />
					<span className="truncate">{job.location}</span>
				</span>
				<span
					className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-ink px-2 py-[3px] font-mono-jb text-[11px] font-bold text-teal-400"
					title={`Phù hợp ${percent}%`}
				>
					<Sparkles className="h-[11px] w-[11px]" />
					{percent}% phù hợp
				</span>
			</div>
		</article>
	);
}
