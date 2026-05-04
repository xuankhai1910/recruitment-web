import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Clock, Eye, FileSearch, XCircle } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Resume, ResumeHistory } from "@/types/resume";
import { cn } from "@/lib/utils";

const STATUS_FLOW = ["PENDING", "REVIEWING", "APPROVED", "REJECTED"] as const;

const STATUS_LABEL: Record<string, string> = {
	PENDING: "Chờ xử lý",
	REVIEWING: "Đang xem xét",
	APPROVED: "Được duyệt",
	REJECTED: "Đã từ chối",
};

const STATUS_STYLE: Record<string, { dot: string; badge: string }> = {
	PENDING: {
		dot: "bg-amber-500",
		badge: "bg-amber-50 text-amber-700 border-amber-200",
	},
	REVIEWING: {
		dot: "bg-blue-500",
		badge: "bg-blue-50 text-blue-700 border-blue-200",
	},
	APPROVED: {
		dot: "bg-green-500",
		badge: "bg-green-50 text-green-700 border-green-200",
	},
	REJECTED: {
		dot: "bg-red-500",
		badge: "bg-red-50 text-red-700 border-red-200",
	},
};

const STATUS_ICON: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	PENDING: Clock,
	REVIEWING: Eye,
	APPROVED: CheckCircle2,
	REJECTED: XCircle,
};

interface ResumeTimelineDialogProps {
	resume: Resume | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ResumeTimelineDialog({
	resume,
	open,
	onOpenChange,
}: ResumeTimelineDialogProps) {
	if (!resume) return null;

	const job =
		typeof resume.jobId === "object" ? resume.jobId : { _id: "", name: "—" };
	const company =
		typeof resume.companyId === "object"
			? resume.companyId
			: { _id: "", name: "—" };

	const history: ResumeHistory[] =
		resume.history && resume.history.length > 0
			? resume.history
			: [
					{
						status: "PENDING",
						updatedAt: resume.createdAt,
						updatedBy: { _id: "", email: resume.email },
					},
				];

	const currentStatus = resume.status;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] w-[96vw] !max-w-2xl overflow-y-auto sm:!max-w-2xl">
				<DialogHeader>
					<DialogTitle className="font-heading">Tiến trình hồ sơ</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="rounded-lg border border-border bg-muted/30 p-3">
						<div className="flex items-center gap-2">
							<FileSearch className="h-4 w-4 text-primary" />
							<p className="line-clamp-1 font-heading text-sm font-semibold text-foreground">
								{job.name}
							</p>
						</div>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{company.name} · Nộp ngày{" "}
							{format(new Date(resume.createdAt), "dd/MM/yyyy")}
						</p>
					</div>

					{/* Status flow overview */}
					<div className="flex items-center gap-1">
						{STATUS_FLOW.filter((s) =>
							currentStatus === "REJECTED"
								? s !== "APPROVED"
								: s !== "REJECTED",
						).map((s, idx, arr) => {
							const reached = isStatusReached(history, s);
							const isCurrent = s === currentStatus;
							const style = STATUS_STYLE[s];
							return (
								<div key={s} className="flex flex-1 items-center gap-1">
									<div className="flex flex-col items-center">
										<div
											className={cn(
												"flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-card",
												reached ? style.dot : "bg-muted",
												isCurrent ? "ring-primary" : "ring-transparent",
											)}
										>
											{reached && (
												<CheckCircle2 className="h-4 w-4 text-white" />
											)}
										</div>
										<span
											className={cn(
												"mt-1 text-[10px] font-medium",
												isCurrent
													? "text-primary"
													: reached
														? "text-foreground"
														: "text-muted-foreground",
											)}
										>
											{STATUS_LABEL[s]}
										</span>
									</div>
									{idx < arr.length - 1 && (
										<div
											className={cn(
												"mb-4 h-0.5 flex-1",
												reached ? "bg-primary/60" : "bg-muted",
											)}
										/>
									)}
								</div>
							);
						})}
					</div>

					{/* Vertical detailed timeline */}
					<div>
						<h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Chi tiết tiến trình
						</h4>
						<ol className="relative ml-4 border-l-2 border-border">
							{[...history]
								.sort(
									(a, b) =>
										new Date(a.updatedAt).getTime() -
										new Date(b.updatedAt).getTime(),
								)
								.map((h, idx, arr) => {
									const isLast = idx === arr.length - 1;
									const Icon = STATUS_ICON[h.status] ?? Clock;
									const style = STATUS_STYLE[h.status];
									return (
										<li
											key={`${h.status}-${idx}`}
											className="relative mb-4 pl-6 last:mb-0"
										>
											<span
												className={cn(
													"absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full",
													style?.dot ?? "bg-muted",
													isLast && "ring-4 ring-primary/20",
												)}
											>
												<Icon className="h-3 w-3 text-white" />
											</span>
											<div className="flex flex-wrap items-center gap-2">
												<Badge
													variant="outline"
													className={cn("font-normal", style?.badge)}
												>
													{STATUS_LABEL[h.status] ?? h.status}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{format(new Date(h.updatedAt), "dd/MM/yyyy HH:mm", {
														locale: vi,
													})}
												</span>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">
												Cập nhật bởi{" "}
												<span className="font-medium text-foreground">
													{h.updatedBy?.email ?? "Hệ thống"}
												</span>
											</p>
										</li>
									);
								})}
						</ol>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function isStatusReached(history: ResumeHistory[], status: string): boolean {
	return history.some((h) => h.status === status);
}
