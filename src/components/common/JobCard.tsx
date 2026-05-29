import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowRight, Briefcase, Building2, Clock, MapPin } from "lucide-react";

import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";
import { companyLogoUrl, formatJobSalary } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";

type JobCardVariant = "default" | "dark" | "row";

interface JobCardProps {
	job: Job;
	variant?: JobCardVariant;
	isSelected?: boolean;
	/** When provided, the card click runs this instead of navigating to the detail page. */
	onClick?: () => void;
}

function JobLogo({ job, size }: { job: Job; size: "md" | "lg" }) {
	const logo = companyLogoUrl(job.company?.logo);
	const cls = cn(
		"grid shrink-0 place-items-center overflow-hidden rounded-lg font-display font-bold tracking-tight text-white",
		size === "md" ? "h-12 w-12 text-sm" : "h-14 w-14 text-base",
	);
	if (logo) {
		return (
			<div className={cls}>
				<img
					src={logo}
					alt={job.company?.name}
					className="h-full w-full bg-white object-contain"
				/>
			</div>
		);
	}
	return (
		<div className={cls} style={{ background: brandColor(job.company?.name) }}>
			{brandShort(job.company?.name)}
		</div>
	);
}

function timeAgo(job: Job) {
	if (!job.createdAt) return "";
	return formatDistanceToNow(new Date(job.createdAt), {
		addSuffix: true,
		locale: vi,
	});
}

const CARD_BASE =
	"relative flex cursor-pointer flex-col rounded-xl border bg-white text-left transition-all duration-200 hover:-translate-y-0.5";

export function JobCard({
	job,
	variant = "default",
	isSelected,
	onClick,
}: JobCardProps) {
	const navigate = useNavigate();
	const negotiable = !!job.salary?.isNegotiable;
	const detailHref = `/jobs/${job._id}`;
	const posted = timeAgo(job);

	const open = () => {
		if (onClick) onClick();
		else navigate(detailHref);
	};

	if (variant === "row") {
		return (
			<article
				onClick={open}
				className={cn(
					"relative flex cursor-pointer items-center gap-6 rounded-xl border bg-white px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.18)] max-[700px]:flex-col max-[700px]:items-stretch",
					isSelected ? "border-ink" : "border-line",
				)}
			>
				<JobLogo job={job} size="lg" />
				<div className="min-w-0 flex-1">
					<div className="line-clamp-1 font-display text-base font-semibold text-ink">
						{job.name}
					</div>
					<div className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
						<Building2 className="h-3 w-3 text-slate-400" />
						<span className="truncate">{job.company?.name}</span>
					</div>
					<div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="h-3 w-3 text-slate-400" />
							{job.location}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Briefcase className="h-3 w-3 text-slate-400" />
							{job.level}
						</span>
						{posted && (
							<span className="inline-flex items-center gap-1.5">
								<Clock className="h-3 w-3 text-slate-400" />
								{posted}
							</span>
						)}
					</div>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-1.5 max-[700px]:flex-row max-[700px]:items-center">
					<div
						className={cn(
							"font-display text-[17px] font-bold tracking-tight",
							negotiable ? "text-rose-800" : "text-ink",
						)}
					>
						{formatJobSalary(job.salary)}
					</div>
				</div>
				<JobBookmarkButton jobId={job._id} />
			</article>
		);
	}

	const isDark = variant === "dark";

	return (
		<article
			onClick={open}
			className={cn(
				CARD_BASE,
				"p-6",
				isDark
					? "border-ink bg-ink hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.5)]"
					: "border-line hover:border-ink hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.18)]",
			)}
		>
			<div className="mb-4 flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<JobLogo job={job} size="md" />
					<div className="min-w-0 flex-1">
						<div
							className={cn(
								"line-clamp-2 text-[13px] font-semibold leading-[1.35] [min-height:2.7em]",
								isDark ? "text-teal-400" : "text-ink",
							)}
						>
							{job.name}
						</div>
						<div
							className={cn(
								"mt-1 truncate font-mono-jb text-[11px]",
								isDark ? "text-white/50" : "text-slate-400",
							)}
						>
							{job.company?.name}
						</div>
					</div>
				</div>
				<JobBookmarkButton
					jobId={job._id}
					variant={isDark ? "dark" : "light"}
				/>
			</div>

			<div
				className={cn(
					"mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs",
					isDark ? "text-white/60" : "text-slate-600",
				)}
			>
				<span className="inline-flex items-center gap-1.5">
					<MapPin
						className={cn("h-3 w-3", isDark ? "text-white/40" : "text-slate-400")}
					/>
					{job.location}
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Briefcase
						className={cn("h-3 w-3", isDark ? "text-white/40" : "text-slate-400")}
					/>
					{job.level}
				</span>
			</div>

			<div className="mb-4 flex min-h-6 flex-nowrap gap-1.5 overflow-hidden">
				{(job.skills || []).slice(0, 3).map((s) => (
					<span
						key={s}
						className={cn(
							"shrink-0 rounded px-2 py-0.5 text-[11px] font-medium",
							isDark
								? "bg-white/10 text-white/85"
								: "border border-line bg-transparent text-slate-700",
						)}
					>
						{s}
					</span>
				))}
				{(job.skills?.length ?? 0) > 3 && (
					<span
						className={cn(
							"shrink-0 rounded px-2 py-0.5 text-[11px] font-medium",
							isDark
								? "bg-white/10 text-white/85"
								: "border border-line bg-transparent text-slate-700",
						)}
					>
						+{(job.skills?.length ?? 0) - 3} kỹ năng
					</span>
				)}
			</div>

			<div
				className={cn(
					"mt-auto flex items-center justify-between gap-3 border-t border-dashed pt-4",
					isDark ? "border-white/10" : "border-line",
				)}
			>
				<div>
					<div
						className={cn(
							"font-display text-[17px] font-bold tracking-tight",
							negotiable
								? "text-rose-800"
								: isDark
									? "text-teal-400"
									: "text-ink",
						)}
					>
						{formatJobSalary(job.salary)}
					</div>
					{posted && (
						<div
							className={cn(
								"text-xs",
								isDark ? "text-white/50" : "text-slate-400",
							)}
						>
							{posted}
						</div>
					)}
				</div>
				<Link
					to={detailHref}
					onClick={(e) => e.stopPropagation()}
					className={cn(
						"inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors",
						isDark
							? "bg-teal-500 text-white hover:bg-teal-600"
							: "border border-ink bg-white text-ink hover:bg-ink hover:text-white",
					)}
				>
					Xem
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</article>
	);
}
