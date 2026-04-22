import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Building2, Clock, MapPin, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { RecommendedJobItem } from "@/types/cv-recommendation";
import { formatSalaryCompact, companyLogoUrl } from "@/lib/format";

interface RecommendedJobCardProps {
	item: RecommendedJobItem;
}

export function getScoreBadge(score: number) {
	if (score >= 0.8)
		return {
			label: "Rất phù hợp",
			className:
				"bg-gradient-to-r from-emerald-500 to-green-500 text-white border-transparent",
			ringClass: "ring-emerald-200",
		};
	if (score >= 0.6)
		return {
			label: "Phù hợp",
			className: "bg-blue-500 text-white border-transparent",
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
			<Card
				className={`relative overflow-hidden border border-border/60 transition-all duration-200 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md`}
			>
				{/* Score ribbon */}
				<div className="absolute right-0 top-0 z-10 flex items-center gap-1 rounded-bl-lg px-3 py-1.5 text-xs font-bold shadow-sm">
					<Badge
						className={`gap-1 px-2.5 py-1 text-xs font-semibold ${badge.className}`}
					>
						<Sparkles className="h-3 w-3" />
						{percent}% · {badge.label}
					</Badge>
				</div>

				<CardContent className="flex gap-4 p-5 pt-6">
					{job.company?.logo ? (
						<img
							src={companyLogoUrl(job.company.logo)}
							alt={job.company.name}
							className="h-14 w-14 shrink-0 rounded-lg object-contain"
						/>
					) : (
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
							<Building2 className="h-7 w-7 text-primary/60" />
						</div>
					)}

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 pr-32 sm:pr-36">
								<h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
									{job.name}
								</h3>
								<p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
									{job.company?.name}
								</p>
							</div>
						</div>

						<div className="mt-3 flex flex-wrap items-center gap-2">
							<span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 font-heading text-sm font-bold text-emerald-700">
								{formatSalaryCompact(job.salary)}
							</span>
							<Badge variant="secondary" className="gap-1 font-normal">
								<MapPin className="h-3 w-3" />
								{job.location}
							</Badge>
							<Badge variant="secondary" className="gap-1 font-normal">
								<Banknote className="h-3 w-3" />
								{job.level}
							</Badge>
							<span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
								<Clock className="h-3 w-3" />
								{formatDistanceToNow(new Date(job.createdAt), {
									addSuffix: true,
									locale: vi,
								})}
							</span>
						</div>

						{/* Skills with matched highlighted */}
						{job.skills && job.skills.length > 0 && (
							<div className="mt-2.5 flex flex-wrap gap-1">
								{job.skills.slice(0, 6).map((s) => {
									const matched = matchedSet.has(s.toLowerCase());
									return (
										<Badge
											key={s}
											variant="outline"
											className={
												matched
													? "border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
													: "font-normal"
											}
										>
											{matched && "✓ "}
											{s}
										</Badge>
									);
								})}
								{job.skills.length > 6 && (
									<Badge variant="outline" className="font-normal">
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
