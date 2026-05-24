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
import { companyLogoUrl, formatJobSalary } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";

interface JobDetailTooltipProps {
	job: Job;
	children: React.ReactNode;
	side?: "right" | "left" | "top" | "bottom";
}

function TooltipSection({
	title,
	items,
}: {
	title: string;
	items?: string[];
}) {
	if (!items || items.length === 0) return null;
	return (
		<section>
			<h4 className="text-sm font-semibold text-slate-900">{title}</h4>
			<ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</section>
	);
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
	const salaryLabel = formatJobSalary(job.salary);
	const negotiable = !!job.salary?.isNegotiable;
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
						"z-50 flex w-110 max-h-[80vh] flex-col rounded-xl border border-slate-200 bg-white shadow-xl",
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
					{/* ── Header (fixed) ── */}
					<div className="flex shrink-0 items-start gap-3 border-b border-slate-100 p-4 pb-3">
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

					{/* ── Scrollable content ── */}
					<div className="flex-1 overflow-y-auto">
						{/* Key info */}
						<div className="space-y-2 px-4 pt-3">
							{/* Salary */}
							<div
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
									negotiable
										? "bg-rose-50 text-rose-500"
										: "bg-blue-50 text-blue-600",
								)}
							>
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

						{/* Skills */}
						{job.skills?.length > 0 && (
							<div className="px-4 pt-3">
								<div className="flex flex-wrap gap-1">
									{job.skills.map((skill) => (
										<Badge
											key={skill}
											variant="secondary"
											className="rounded-full border border-blue-100 bg-blue-50/60 px-2 py-0.5 text-[10px] font-medium leading-none text-blue-600 hover:bg-blue-50"
										>
											{skill}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* JD details — same layout as JobDetailPage */}
						{(job.description ||
							job.responsibilities?.length ||
							job.requirements?.length ||
							job.benefits?.length) && (
							<div className="border-t border-slate-100 px-4 py-3 mt-3">
								<h3 className="text-base font-semibold text-slate-900">
									Mô tả công việc
								</h3>
								<div className="mt-3 space-y-4">
									{job.description && (
										<section>
											<div
												className="text-xs leading-relaxed text-slate-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-1"
												// eslint-disable-next-line react/no-danger -- admin-authored HTML from RichTextEditor; same pattern as CompanyDetailPage
												dangerouslySetInnerHTML={{
													__html: job.description,
												}}
											/>
										</section>
									)}
									<TooltipSection
										title="Trách nhiệm chính"
										items={job.responsibilities}
									/>
									<TooltipSection
										title="Yêu cầu công việc"
										items={job.requirements}
									/>
									<TooltipSection title="Quyền lợi" items={job.benefits} />
								</div>
							</div>
						)}
					</div>

					{/* ── Footer CTA (fixed) ── */}
					<div className="shrink-0 border-t border-slate-100 px-4 py-3">
						<Link
							to={`/jobs/${job._id}`}
							className="block w-full rounded-lg bg-blue-500 px-3 py-2 text-center text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-600"
						>
							Ứng tuyển ngay
						</Link>
					</div>
				</HoverCardPrimitive.Content>
			</HoverCardPrimitive.Portal>
		</HoverCardPrimitive.Root>
	);
}
