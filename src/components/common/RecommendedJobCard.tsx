import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Banknote, Briefcase, Building2, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";
import { companyLogoUrl, formatSalaryCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecommendedJobItem } from "@/types/cv-recommendation";

interface RecommendedJobCardProps {
	item: RecommendedJobItem;
}

function getScoreBadge(score: number) {
	if (score >= 0.8) {
		return {
			label: "Rất phù hợp",
			className: "bg-blue-600 text-white",
		};
	}
	if (score >= 0.6) {
		return {
			label: "Phù hợp",
			className: "bg-blue-500 text-white",
		};
	}
	if (score >= 0.4) {
		return {
			label: "Tương đối",
			className: "bg-blue-200 text-blue-800",
		};
	}
	return {
		label: "Ít phù hợp",
		className: "bg-slate-100 text-slate-600",
	};
}

function salaryLabel(salary: number) {
	return salary > 0 ? formatSalaryCompact(salary) : "Thỏa thuận";
}

export function RecommendedJobCard({ item }: RecommendedJobCardProps) {
	const { job, score, matchedSkills } = item;
	const badge = getScoreBadge(score);
	const percent = Math.round(score * 100);
	const matchedSet = new Set(matchedSkills.map((skill) => skill.toLowerCase()));

	return (
		<div className="group relative h-full rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
			<Link to={`/jobs/${job._id}`} className="block h-full pr-1">
				<div className="flex items-start gap-3 pr-36">
					{job.company?.logo ? (
						<img
							src={companyLogoUrl(job.company.logo)}
							alt={job.company.name}
							className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
						/>
					) : (
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
							<Building2 className="h-5 w-5 text-slate-400" />
						</div>
					)}

					<div className="min-w-0 flex-1">
						<h3 className="line-clamp-2 text-sm font-semibold leading-5 text-blue-700 transition-colors group-hover:text-blue-800">
							{job.name}
						</h3>
						<p className="mt-1 line-clamp-1 text-xs text-slate-500">
							{job.company?.name}
						</p>
					</div>
				</div>

				<div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
					<Banknote className="h-3.5 w-3.5" />
					<span>{salaryLabel(job.salary)}</span>
				</div>

				<div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-400">
					<span className="inline-flex min-w-0 items-center gap-1">
						<MapPin className="h-3.5 w-3.5 shrink-0" />
						<span className="truncate">{job.location}</span>
					</span>
					<span className="inline-flex min-w-0 items-center gap-1">
						<Briefcase className="h-3.5 w-3.5 shrink-0" />
						<span className="truncate">{job.level}</span>
					</span>
					<span className="inline-flex min-w-0 items-center gap-1 col-span-2">
						<Clock className="h-3.5 w-3.5 shrink-0" />
						<span className="truncate">
							{formatDistanceToNow(new Date(job.createdAt), {
								addSuffix: true,
								locale: vi,
							})}
						</span>
					</span>
				</div>

				{job.skills && job.skills.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{job.skills.slice(0, 6).map((skill) => {
							const matched = matchedSet.has(skill.toLowerCase());
							return (
								<Badge
									key={skill}
									variant="secondary"
									className={cn(
										"rounded-md px-2 py-0.5 text-xs font-normal",
										matched
											? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
											: "bg-slate-100 text-slate-600 hover:bg-slate-100",
									)}
								>
									{skill}
								</Badge>
							);
						})}
						{job.skills.length > 6 && (
							<Badge
								variant="secondary"
								className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600 hover:bg-slate-100"
							>
								+{job.skills.length - 6}
							</Badge>
						)}
					</div>
				)}
			</Link>

			<div className="absolute right-4 top-4 z-10 flex items-center gap-2">
				<JobBookmarkButton
					jobId={job._id}
					className="h-7 w-7 rounded-md border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600"
				/>
				<span
					className={cn(
						"inline-flex h-7 items-center rounded-md px-2 text-[11px] font-semibold",
						badge.className,
					)}
				>
					{percent}% · {badge.label}
				</span>
			</div>
		</div>
	);
}
