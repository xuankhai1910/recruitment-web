import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
	Briefcase,
	CheckCircle2,
	ExternalLink,
	FileText,
	History,
	Hourglass,
	Search,
	XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyResumes } from "@/hooks/useResumes";
import { resumeFileUrl } from "@/lib/format";
import { ResumeTimelineDialog } from "@/components/common/ResumeTimelineDialog";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/resume";

const RESUME_STATUS_STYLE: Record<string, string> = {
	PENDING: "bg-amber-50 text-amber-700 border-amber-200",
	REVIEWING: "bg-blue-50 text-blue-700 border-blue-200",
	APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
	REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const RESUME_STATUS_LABEL: Record<string, string> = {
	PENDING: "Chờ xử lý",
	REVIEWING: "Đang xem xét",
	APPROVED: "Được duyệt",
	REJECTED: "Đã từ chối",
};

interface StatCardProps {
	label: string;
	value: number;
	icon: React.ComponentType<{ className?: string }>;
	tone: "slate" | "amber" | "blue" | "emerald" | "rose";
}

const TONE_BG: Record<StatCardProps["tone"], string> = {
	slate: "bg-slate-50 text-slate-600",
	amber: "bg-amber-50 text-amber-600",
	blue: "bg-blue-50 text-blue-600",
	emerald: "bg-emerald-50 text-emerald-600",
	rose: "bg-rose-50 text-rose-600",
};

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-3.5">
			<div
				className={cn(
					"grid h-10 w-10 shrink-0 place-items-center rounded-lg",
					TONE_BG[tone],
				)}
			>
				<Icon className="h-5 w-5" />
			</div>
			<div className="min-w-0">
				<p className="text-xs text-slate-500">{label}</p>
				<p className="font-heading text-xl font-bold leading-tight text-slate-900">
					{value}
				</p>
			</div>
		</div>
	);
}

export function ResumesTab() {
	const { data, isLoading } = useMyResumes();
	const resumes = data ?? [];
	const [selected, setSelected] = useState<Resume | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("ALL");

	const stats = useMemo(() => {
		const counts = { PENDING: 0, REVIEWING: 0, APPROVED: 0, REJECTED: 0 };
		for (const r of resumes) {
			if (r.status in counts) counts[r.status as keyof typeof counts]++;
		}
		return { total: resumes.length, ...counts };
	}, [resumes]);

	const filteredResumes = useMemo(() => {
		if (statusFilter === "ALL") return resumes;
		return resumes.filter((r) => r.status === statusFilter);
	}, [resumes, statusFilter]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={`stat-sk-${k}`} className="h-16 rounded-xl" />
					))}
				</div>
				<div className="space-y-3">
					{["a", "b", "c"].map((k) => (
						<Skeleton key={`resume-sk-${k}`} className="h-20 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (resumes.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-6 text-center">
				<div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50">
					<FileText className="h-8 w-8 text-blue-500" />
				</div>
				<div className="space-y-1">
					<p className="font-heading text-base font-semibold text-slate-900">
						Bạn chưa nộp CV nào
					</p>
					<p className="max-w-sm text-sm text-slate-500">
						Khám phá việc làm phù hợp và nộp CV để bắt đầu hành trình của bạn.
					</p>
				</div>
				<Button
					asChild
					className="mt-2 cursor-pointer bg-blue-500 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-600"
				>
					<Link to="/jobs">
						<Search className="mr-2 h-4 w-4" />
						Tìm việc ngay
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{/* Stats row */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatCard
					label="Tổng số"
					value={stats.total}
					icon={FileText}
					tone="slate"
				/>
				<StatCard
					label="Chờ xử lý"
					value={stats.PENDING + stats.REVIEWING}
					icon={Hourglass}
					tone="amber"
				/>
				<StatCard
					label="Được duyệt"
					value={stats.APPROVED}
					icon={CheckCircle2}
					tone="emerald"
				/>
				<StatCard
					label="Đã từ chối"
					value={stats.REJECTED}
					icon={XCircle}
					tone="rose"
				/>
			</div>

			{/* Status filter pills */}
			<div className="flex flex-wrap gap-2">
				{[
					{ key: "ALL", label: "Tất cả" },
					{ key: "PENDING", label: "Chờ xử lý" },
					{ key: "REVIEWING", label: "Đang xem xét" },
					{ key: "APPROVED", label: "Được duyệt" },
					{ key: "REJECTED", label: "Đã từ chối" },
				].map((opt) => {
					const active = statusFilter === opt.key;
					return (
						<button
							key={opt.key}
							type="button"
							onClick={() => setStatusFilter(opt.key)}
							className={cn(
								"inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-all duration-150",
								active
									? "border-blue-300 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
									: "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-500",
							)}
						>
							{opt.label}
						</button>
					);
				})}
			</div>

			{/* Resume cards */}
			{filteredResumes.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
					Không có CV nào ở trạng thái này
				</div>
			) : (
				<div className="space-y-2.5">
					{filteredResumes.map((r) => {
						// jobId/companyId can be: populated object | id string | null (deleted).
						// `typeof null === "object"` so guard with truthy check too.
						const jobRef = r.jobId;
						const companyRef = r.companyId;
						const job =
							jobRef && typeof jobRef === "object"
								? jobRef
								: {
										_id: typeof jobRef === "string" ? jobRef : "",
										name: "Việc làm đã bị xóa",
									};
						const company =
							companyRef && typeof companyRef === "object"
								? companyRef
								: {
										_id: typeof companyRef === "string" ? companyRef : "",
										name: "—",
									};
						return (
							<div
								key={r._id}
								className="group flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm sm:flex-row sm:items-center"
							>
								<button
									type="button"
									onClick={() => setSelected(r)}
									className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
								>
									<div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-500">
										<FileText className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
											{job.name}
										</p>
										<div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
											<span className="inline-flex items-center gap-1">
												<Briefcase className="h-3 w-3" />
												{company.name}
											</span>
											<span className="text-slate-300">•</span>
											<span>
												Nộp {format(new Date(r.createdAt), "dd/MM/yyyy")}
											</span>
										</div>
									</div>
								</button>

								<div className="flex items-center gap-2 sm:shrink-0">
									<Badge
										variant="outline"
										className={cn(
											"font-medium",
											RESUME_STATUS_STYLE[r.status] ?? "",
										)}
									>
										{RESUME_STATUS_LABEL[r.status] ?? r.status}
									</Badge>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-blue-600"
										onClick={() => setSelected(r)}
										title="Xem tiến trình"
									>
										<History className="h-4 w-4" />
									</Button>
									<a
										href={resumeFileUrl(r.url)}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-blue-600"
											title="Mở file CV"
										>
											<ExternalLink className="h-4 w-4" />
										</Button>
									</a>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<ResumeTimelineDialog
				resume={selected}
				open={!!selected}
				onOpenChange={(o) => {
					if (!o) setSelected(null);
				}}
			/>
		</div>
	);
}
