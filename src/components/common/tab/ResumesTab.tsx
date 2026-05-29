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

import { Skeleton } from "@/components/ui/skeleton";
import { useMyResumes } from "@/hooks/useResumes";
import { resumeFileUrl } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { ResumeTimelineDialog } from "@/components/common/ResumeTimelineDialog";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/resume";

const STATUS: Record<string, { cls: string; label: string }> = {
	PENDING: { cls: "bg-amber-100 text-amber-800", label: "Chờ xử lý" },
	REVIEWING: { cls: "bg-teal-50 text-teal-700", label: "Đang xem xét" },
	APPROVED: { cls: "bg-emerald-50 text-emerald-700", label: "Được duyệt" },
	REJECTED: { cls: "bg-rose-50 text-rose-800", label: "Đã từ chối" },
};

const FILTERS = [
	{ key: "ALL", label: "Tất cả" },
	{ key: "PENDING", label: "Chờ xử lý" },
	{ key: "REVIEWING", label: "Đang xem xét" },
	{ key: "APPROVED", label: "Được duyệt" },
	{ key: "REJECTED", label: "Đã từ chối" },
];

function StatTile({
	icon: Icon,
	tone,
	value,
	label,
}: {
	icon: React.ComponentType<{ className?: string }>;
	tone: string;
	value: number;
	label: string;
}) {
	return (
		<div className="rounded-xl border border-line bg-white p-5">
			<div className={cn("mb-3 grid h-9 w-9 place-items-center rounded-lg", tone)}>
				<Icon className="h-[18px] w-[18px]" />
			</div>
			<div className="font-display text-[32px] font-bold leading-none tracking-tight text-ink">
				{value}
			</div>
			<div className="mt-2 text-xs text-slate-600">{label}</div>
		</div>
	);
}

export function ResumesTab() {
	const { data, isLoading } = useMyResumes();
	const resumes = useMemo(() => data ?? [], [data]);
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
			<div className="space-y-5">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={k} className="h-24 rounded-xl" />
					))}
				</div>
				<div className="space-y-2.5">
					{["a", "b", "c"].map((k) => (
						<Skeleton key={k} className="h-20 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (resumes.length === 0) {
		return (
			<div className={ui.empty}>
				<div className={ui.emptyIcon}>
					<FileText className="h-7 w-7" />
				</div>
				<h3 className="mb-2 text-xl font-semibold text-ink">
					Bạn chưa nộp đơn ứng tuyển nào
				</h3>
				<p className="max-w-[380px] text-sm text-slate-600">
					Khám phá việc làm phù hợp và nộp CV để bắt đầu hành trình của bạn.
				</p>
				<Link to="/jobs" className={cn(ui.btnPrimary, "mt-5")}>
					<Search className="h-4 w-4" />
					Tìm việc ngay
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatTile icon={FileText} tone="bg-teal-50 text-teal-700" value={stats.total} label="Tổng số đơn" />
				<StatTile
					icon={Hourglass}
					tone="bg-amber-100 text-amber-800"
					value={stats.PENDING + stats.REVIEWING}
					label="Đang chờ"
				/>
				<StatTile icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" value={stats.APPROVED} label="Được duyệt" />
				<StatTile icon={XCircle} tone="bg-rose-50 text-rose-800" value={stats.REJECTED} label="Đã từ chối" />
			</div>

			<div className="mb-5 flex flex-wrap gap-2">
				{FILTERS.map((opt) => (
					<button
						key={opt.key}
						onClick={() => setStatusFilter(opt.key)}
						className={cn(
							"inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
							statusFilter === opt.key
								? "border-ink bg-ink text-white"
								: "border-line bg-white text-slate-700 hover:border-ink",
						)}
					>
						{opt.label}
					</button>
				))}
			</div>

			{filteredResumes.length === 0 ? (
				<div className={ui.empty + " py-10"}>
					<div className={ui.emptyIcon}>
						<FileText className="h-7 w-7" />
					</div>
					<h3 className="mb-2 text-xl font-semibold text-ink">
						Không có đơn nào ở trạng thái này
					</h3>
					<p className="max-w-[380px] text-sm text-slate-600">Thử chọn bộ lọc khác.</p>
				</div>
			) : (
				<div className="space-y-2.5">
					{filteredResumes.map((r) => {
						const jobRef = r.jobId;
						const companyRef = r.companyId;
						const job =
							jobRef && typeof jobRef === "object"
								? jobRef
								: { _id: "", name: "Việc làm đã bị xóa" };
						const company =
							companyRef && typeof companyRef === "object"
								? companyRef
								: { _id: "", name: "—" };
						const st = STATUS[r.status] ?? { cls: "bg-amber-100 text-amber-800", label: r.status };
						return (
							<div
								key={r._id}
								onClick={() => setSelected(r)}
								className="flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-ink sm:flex-row sm:items-center"
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<div
										className="grid h-11 w-11 shrink-0 place-items-center rounded-lg font-display text-[13px] font-bold text-white"
										style={{ background: brandColor(company.name) }}
									>
										{brandShort(company.name)}
									</div>
									<div className="min-w-0">
										<div className="font-display text-[15px] font-semibold text-ink">
											{job.name}
										</div>
										<div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
											<span className="inline-flex items-center gap-1">
												<Briefcase className="h-[11px] w-[11px]" />
												{company.name}
											</span>
											<span>·</span>
											<span>Nộp {format(new Date(r.createdAt), "dd/MM/yyyy")}</span>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 sm:shrink-0">
									<span
										className={cn(
											"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-['']",
											st.cls,
										)}
									>
										{st.label}
									</span>
									<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
										<button
											className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-slate-600 hover:border-ink hover:text-ink"
											title="Xem tiến trình"
											onClick={() => setSelected(r)}
										>
											<History className="h-4 w-4" />
										</button>
										<a
											href={resumeFileUrl(r.url)}
											target="_blank"
											rel="noopener noreferrer"
											className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-slate-600 hover:border-ink hover:text-ink"
											title="Mở file CV"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</div>
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
