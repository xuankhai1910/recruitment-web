import { useJobs } from "@/hooks/useJobs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Banknote,
	Briefcase,
	Building2,
	ChevronLeft,
	ChevronRight,
	Clock,
	MapPin,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const PAGE_SIZE = 5;

function formatSalary(salary: number) {
	if (salary >= 1_000_000) {
		return `${(salary / 1_000_000).toFixed(0)}M`;
	}
	if (salary >= 1_000) {
		return `${(salary / 1_000).toFixed(0)}K`;
	}
	return salary.toString();
}

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
						{Array.from({ length: PAGE_SIZE }).map((_, i) => (
							<Skeleton key={i} className="h-24 rounded-lg" />
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
							<Link key={job._id} to={`/jobs/${job._id}`} className="block">
								<Card className="group cursor-pointer transition-colors duration-150 hover:border-primary/50">
									<CardContent className="flex gap-4 p-4 sm:p-5">
										{job.company?.logo ? (
											<img
												src={
													job.company.logo.startsWith("http")
														? job.company.logo
														: `${import.meta.env.VITE_STATIC_URL}/images/company/${job.company.logo}`
												}
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
												<div className="min-w-0">
													<h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
														{job.name}
													</h3>
													<p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
														{job.company?.name}
													</p>
												</div>
												<span className="shrink-0 font-heading text-sm font-semibold text-[#16A34A]">
													{formatSalary(job.salary)}
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
													{job.skills.slice(0, 4).map((skill) => (
														<Badge
															key={skill}
															variant="secondary"
															className="rounded-md bg-muted font-normal text-foreground/80 hover:bg-muted"
														>
															{skill}
														</Badge>
													))}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
