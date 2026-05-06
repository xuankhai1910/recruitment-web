import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Building2, Clock, MapPin, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { RecommendedJobItem } from "@/types/cv-recommendation";
import { formatSalaryCompact, companyLogoUrl } from "@/lib/format";
import { JobBookmarkButton } from "@/components/common/JobBookmarkButton";

interface RecommendedJobCardProps {
	item: RecommendedJobItem;
}

function getScoreBadge(score: number) {
	if (score >= 0.8)
		return {
			label: "Rất phù hợp",
			className: "bg-[#22C55E] text-white border-transparent",
			ringClass: "ring-emerald-200",
		};
	if (score >= 0.6)
		return {
			label: "Phù hợp",
			className: "bg-primary text-primary-foreground border-transparent",
			ringClass: "ring-blue-200",
		};
	if (score >= 0.4)
		return {
			label: "Tương đối",
			className: "bg-amber-500 text-white border-transparent",
			ringClass: "ring-amber-200",
		};
	return {
		label: "Ít phù hợp",
		className: "bg-muted text-muted-foreground border-transparent",
		ringClass: "ring-border",
	};
}

export function RecommendedJobCard({ item }: RecommendedJobCardProps) {
	const { job, score, matchedSkills } = item;
	const badge = getScoreBadge(score);
	const percent = Math.round(score * 100);
	const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));

	return (
		<Link to={`/jobs/${job._id}`} className="group block">
			<Card className="relative cursor-pointer transition-colors duration-150 hover:border-primary/50">
				<div className="absolute right-3 top-3 z-10 flex items-center gap-2">
					<JobBookmarkButton jobId={job._id} />
					<Badge
						className={`gap-1 px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
					>
						<Sparkles className="h-3 w-3" />
						{percent}% · {badge.label}
					</Badge>
				</div>

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
						<div className="min-w-0 pr-28 sm:pr-32">
							<h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
								{job.name}
							</h3>
							<p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
								{job.company?.name}
							</p>
						</div>

						<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
							<span className="font-heading text-sm font-semibold text-[#16A34A]">
								{formatSalaryCompact(job.salary)}
							</span>
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

						{/* Skills with matched highlighted */}
						{job.skills && job.skills.length > 0 && (
							<div className="mt-2.5 flex flex-wrap gap-1.5">
								{job.skills.slice(0, 6).map((s) => {
									const matched = matchedSet.has(s.toLowerCase());
									return (
										<Badge
											key={s}
											variant="secondary"
											className={
												matched
													? "rounded-md border border-emerald-200 bg-emerald-50 font-medium text-emerald-700 hover:bg-emerald-50"
													: "rounded-md bg-muted font-normal text-foreground/80 hover:bg-muted"
											}
										>
											{matched && "✓ "}
											{s}
										</Badge>
									);
								})}
								{job.skills.length > 6 && (
									<Badge
										variant="secondary"
										className="rounded-md bg-muted font-normal hover:bg-muted"
									>
										+{job.skills.length - 6}
									</Badge>
								)}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
