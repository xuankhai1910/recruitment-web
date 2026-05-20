import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
	Banknote,
	Briefcase,
	Building2,
	CalendarX2,
	Clock,
	MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";
import { companyLogoUrl, formatJobSalary } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";

interface JobCardProps {
	job: Job;
	variant?: "card" | "compact";
	isSelected?: boolean;
	showSkills?: boolean;
	onClick?: () => void;
}

function CompanyLogo({ job, className }: { job: Job; className: string }) {
	return job.company?.logo ? (
		<img
			src={companyLogoUrl(job.company.logo)}
			alt={job.company.name}
			className={cn(
				"shrink-0 border border-slate-200 bg-white object-contain p-1",
				className,
			)}
		/>
	) : (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center border border-slate-200 bg-slate-50",
				className,
			)}
		>
			<Building2 className="h-5 w-5 text-slate-400" />
		</div>
	);
}

function timeAgo(job: Job) {
	return formatDistanceToNow(new Date(job.createdAt), {
		addSuffix: true,
		locale: vi,
	});
}

function salaryLabel(job: Job) {
	return formatJobSalary(job.salary);
}

function CardVariant({ job, showSkills }: { job: Job; showSkills?: boolean }) {
	const negotiable = !!job.salary?.isNegotiable;
	return (
		<div className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)]">
			<Link to={`/jobs/${job._id}`} className="block flex-1 pr-1">
				<div className="flex items-center gap-3">
					<CompanyLogo job={job} className="h-12 w-12 shrink-0 rounded-lg" />
					<div className="min-w-0 flex-1">
						<h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-blue-600">
							{job.name}
						</h3>
						<p className="line-clamp-1 text-xs text-slate-500">
							{job.company?.name}
						</p>
					</div>
				</div>

				<div
					className={cn(
						"mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
						negotiable
							? "bg-rose-50 text-rose-500"
							: "bg-blue-50 text-blue-600",
					)}
				>
					<Banknote className="h-3.5 w-3.5" />
					<span>{salaryLabel(job)}</span>
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
					<span className="inline-flex min-w-0 items-center gap-1">
						<MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
						<span className="truncate">{job.location}</span>
					</span>
					<span className="inline-flex min-w-0 items-center gap-1">
						<Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
						<span className="truncate">{job.level}</span>
					</span>
					{!showSkills && (
						<span className="ml-auto inline-flex items-center gap-1">
							<CalendarX2 className="h-3.5 w-3.5 shrink-0 text-rose-400" />
							<span className="font-medium text-rose-500">
								{format(new Date(job.endDate), "dd/MM/yyyy")}
							</span>
						</span>
					)}
				</div>

				{showSkills && (
					<div className="mt-3 flex flex-wrap items-center gap-1.5">
						{job.skills.slice(0, 3).map((skill) => (
							<Badge
								key={skill}
								variant="secondary"
								className="rounded-full border border-blue-100 bg-blue-50/60 px-2 py-0.5 text-[11px] font-medium leading-none text-blue-600 hover:bg-blue-50"
							>
								{skill}
							</Badge>
						))}
						{job.skills.length > 3 && (
							<Badge
								variant="secondary"
								className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium leading-none text-slate-500 hover:bg-slate-50"
							>
								+{job.skills.length - 3}
							</Badge>
						)}
						<span className="ml-auto inline-flex items-center gap-1">
							<CalendarX2 className="h-3.5 w-3.5 shrink-0 text-rose-400" />
							<span className="text-xs font-medium text-rose-500">
								{format(new Date(job.endDate), "dd/MM/yyyy")}
							</span>
						</span>
					</div>
				)}
			</Link>

			<div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
				<span className="inline-flex min-w-0 flex-1 items-center gap-1 text-xs text-slate-400">
					<Clock className="h-3.5 w-3.5 shrink-0" />
					<span className="truncate">{timeAgo(job)}</span>
				</span>
				<div className="flex shrink-0 items-center gap-2">
					<JobBookmarkButton
						jobId={job._id}
						className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600"
					/>
					<Link
						to={`/jobs/${job._id}`}
						className="inline-flex h-7 items-center rounded-md bg-blue-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
					>
						Ứng tuyển
					</Link>
				</div>
			</div>
		</div>
	);
}

function CompactContent({ job }: { job: Job }) {
	const negotiable = !!job.salary?.isNegotiable;
	return (
		<div className="flex gap-3 p-3 pr-10">
			<CompanyLogo job={job} className="h-10 w-10 rounded-lg" />

			<div className="min-w-0 flex-1">
				<h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600">
					{job.name}
				</h3>
				<p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
					{job.company?.name}
				</p>
				<p
					className={cn(
						"mt-1 text-xs font-semibold",
						negotiable ? "text-rose-500" : "text-blue-600",
					)}
				>
					{salaryLabel(job)}
				</p>

				<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
					<span className="inline-flex min-w-0 items-center gap-1">
						<MapPin className="h-3 w-3 shrink-0 text-slate-400" />
						<span className="truncate">{job.location}</span>
					</span>
					<span className="inline-flex min-w-0 items-center gap-1">
						<Briefcase className="h-3 w-3 shrink-0 text-slate-400" />
						<span className="truncate">{job.level}</span>
					</span>
				</div>

				{job.skills && job.skills.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-1.5">
						{job.skills.slice(0, 3).map((skill) => (
							<Badge
								key={skill}
								variant="secondary"
								className="rounded-full border border-blue-100 bg-blue-50/60 px-2 py-0.5 text-[10px] font-medium leading-none text-blue-600 hover:bg-blue-50"
							>
								{skill}
							</Badge>
						))}
					</div>
				)}

				<div className="mt-2 flex items-center text-[11px] text-slate-400">
					<Clock className="mr-1 h-3 w-3" />
					<span className="truncate">{timeAgo(job)}</span>
				</div>
			</div>
		</div>
	);
}

function CompactVariant({
	job,
	isSelected,
	onClick,
}: {
	job: Job;
	isSelected?: boolean;
	onClick?: () => void;
}) {
	const className = cn(
		"relative block w-full border-b border-slate-100 bg-white text-left transition-colors duration-150 hover:bg-slate-50",
		isSelected && "border-l-[3px] border-l-blue-600 bg-blue-50/40",
		onClick && "cursor-pointer",
	);

	return (
		<div className="relative">
			{onClick ? (
				<button type="button" onClick={onClick} className={className}>
					<CompactContent job={job} />
				</button>
			) : (
				<Link to={`/jobs/${job._id}`} className={className}>
					<CompactContent job={job} />
				</Link>
			)}

			<JobBookmarkButton
				jobId={job._id}
				className="absolute bottom-3 right-3 z-10 h-7 w-7 border-0 bg-transparent text-slate-400 hover:bg-blue-50 hover:text-blue-600"
			/>
		</div>
	);
}

export function JobCard({
	job,
	variant = "card",
	isSelected,
	showSkills,
	onClick,
}: JobCardProps) {
	if (variant === "compact") {
		return (
			<CompactVariant job={job} isSelected={isSelected} onClick={onClick} />
		);
	}

	return <CardVariant job={job} showSkills={showSkills} />;
}
