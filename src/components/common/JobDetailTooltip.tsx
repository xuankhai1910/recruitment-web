import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
	Banknote,
	Briefcase,
	Building2,
	CalendarX2,
	MapPin,
	Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { companyLogoUrl, formatSalaryFull } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";

interface JobDetailTooltipProps {
	job: Job;
	children: React.ReactNode;
	side?: "right" | "left" | "top" | "bottom";
}

function CompanyLogo({ job }: { job: Job }) {
	return job.company?.logo ? (
		<img
			src={companyLogoUrl(job.company.logo)}
			alt={job.company.name}
			className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
		/>
	) : (
		<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
			<Building2 className="h-5 w-5 text-slate-400" />
		</div>
	);
}

export function JobDetailTooltip({
	job,
	children,
	side = "right",
}: JobDetailTooltipProps) {
	const salaryLabel =
		job.salary > 0 ? formatSalaryFull(job.salary) : "Thỏa thuận";
	const deadlineFormatted = format(new Date(job.endDate), "dd/MM/yyyy");

	return (
		<HoverCardPrimitive.Root openDelay={250} closeDelay={100}>
			<HoverCardPrimitive.Trigger asChild>
				{children}
			</HoverCardPrimitive.Trigger>

			<HoverCardPrimitive.Portal>
				<HoverCardPrimitive.Content
					side={side}
					sideOffset={10}
					align="start"
					avoidCollisions
					collisionPadding={16}
					className={cn(
						"z-50 w-85 rounded-xl border border-slate-200 bg-white shadow-xl",
						"outline-none",
						// entrance animation
						"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
						"data-[side=bottom]:slide-in-from-top-2",
						"data-[side=top]:slide-in-from-bottom-2",
						"data-[side=right]:slide-in-from-left-2",
						"data-[side=left]:slide-in-from-right-2",
						"duration-150",
					)}
				>
					{/* ── Header ── */}
					<div className="flex items-start gap-3 border-b border-slate-100 p-4 pb-3">
						<CompanyLogo job={job} />
						<div className="min-w-0 flex-1">
							<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
								{job.name}
							</h3>
							<p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
								{job.company?.name}
							</p>
						</div>
					</div>

					{/* ── Key info ── */}
					<div className="space-y-2 px-4 pt-3">
						{/* Salary */}
						<div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
							<Banknote className="h-3.5 w-3.5 shrink-0" />
							{salaryLabel}
						</div>

						{/* Meta row */}
						<div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
							<span className="inline-flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
								{job.location}
							</span>
							<span className="inline-flex items-center gap-1">
								<Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
								{job.level}
							</span>
							<span className="inline-flex items-center gap-1">
								<Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
								{job.quantity} vị trí
							</span>
							<span className="inline-flex items-center gap-1">
								<CalendarX2 className="h-3.5 w-3.5 shrink-0 text-rose-400" />
								<span className="font-medium text-rose-500">
									Hạn ứng tuyển: {deadlineFormatted}
								</span>
							</span>
						</div>
					</div>

					{/* ── Skills ── */}
					{job.skills?.length > 0 && (
						<div className="px-4 pt-3">
							<div className="flex flex-wrap gap-1">
								{job.skills.map((skill) => (
									<Badge
										key={skill}
										variant="secondary"
										className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal leading-none text-slate-600 hover:bg-slate-100"
									>
										{skill}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* ── Description excerpt ── */}
					{job.description && (
						<div className="px-4 pt-3">
							<p className="text-[14px] font-semibold text-slate-700">
								Mô tả công việc
							</p>
							<p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
								{job.description
									.replace(/<[^>]*>/g, " ")
									.replace(/\s+/g, " ")
									.trim()}
							</p>
						</div>
					)}

					{/* ── Footer CTA ── */}
					<div className="mt-3 border-t border-slate-100 px-4 py-3">
						<Link
							to={`/jobs/${job._id}`}
							className="block w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
						>
							Ứng tuyển ngay
						</Link>
					</div>
				</HoverCardPrimitive.Content>
			</HoverCardPrimitive.Portal>
		</HoverCardPrimitive.Root>
	);
}
