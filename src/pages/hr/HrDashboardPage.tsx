import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
	Briefcase,
	FileText,
	Clock,
	CheckCircle2,
	XCircle,
	Users2,
	ArrowUpRight,
} from "lucide-react";
import { useJobsByAdmin } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth.store";
import type { Resume } from "@/types/resume";
import type { ReactNode } from "react";

const STATUS_META: Record<
	Resume["status"],
	{ label: string; className: string }
> = {
	PENDING: {
		label: "Chờ duyệt",
		className: "bg-yellow-50 text-yellow-700 border-yellow-200",
	},
	REVIEWING: {
		label: "Đang xem",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	APPROVED: {
		label: "Đã duyệt",
		className: "bg-green-50 text-green-700 border-green-200",
	},
	REJECTED: {
		label: "Từ chối",
		className: "bg-red-50 text-red-700 border-red-200",
	},
};

export function HrDashboardPage() {
	const user = useAuthStore((s) => s.user);

	const activeJobsQ = useJobsByAdmin({
		current: 1,
		pageSize: 1,
		isActive: true,
	});
	const totalJobsQ = useJobsByAdmin({ current: 1, pageSize: 1 });

	const allResumesQ = useResumes({ current: 1, pageSize: 1 });
	const pendingQ = useResumes({
		current: 1,
		pageSize: 1,
		status: "PENDING",
	} as Record<string, unknown>);
	const reviewingQ = useResumes({
		current: 1,
		pageSize: 1,
		status: "REVIEWING",
	} as Record<string, unknown>);
	const approvedQ = useResumes({
		current: 1,
		pageSize: 1,
		status: "APPROVED",
	} as Record<string, unknown>);
	const rejectedQ = useResumes({
		current: 1,
		pageSize: 1,
		status: "REJECTED",
	} as Record<string, unknown>);

	const latestResumesQ = useResumes({
		current: 1,
		pageSize: 5,
		sort: "-createdAt",
		populate: "jobId",
		fields: "jobId._id,jobId.name",
	} as Record<string, unknown>);

	const recentJobsQ = useJobsByAdmin({
		current: 1,
		pageSize: 5,
		sort: "-createdAt",
	});

	const stats = useMemo(
		() => [
			{
				label: "Tin đang tuyển",
				value: activeJobsQ.data?.meta.total,
				icon: <Briefcase className="h-5 w-5" />,
				color: "bg-blue-50 text-blue-700",
			},
			{
				label: "Tổng tin tuyển dụng",
				value: totalJobsQ.data?.meta.total,
				icon: <Briefcase className="h-5 w-5" />,
				color: "bg-slate-50 text-slate-700",
			},
			{
				label: "Tổng hồ sơ nhận",
				value: allResumesQ.data?.meta.total,
				icon: <FileText className="h-5 w-5" />,
				color: "bg-purple-50 text-purple-700",
			},
			{
				label: "Chờ xử lý",
				value: pendingQ.data?.meta.total,
				icon: <Clock className="h-5 w-5" />,
				color: "bg-yellow-50 text-yellow-700",
			},
		],
		[activeJobsQ.data, totalJobsQ.data, allResumesQ.data, pendingQ.data],
	);

	const statusBreakdown = useMemo(
		() => [
			{
				key: "PENDING" as const,
				total: pendingQ.data?.meta.total ?? 0,
				icon: <Clock className="h-4 w-4" />,
			},
			{
				key: "REVIEWING" as const,
				total: reviewingQ.data?.meta.total ?? 0,
				icon: <FileText className="h-4 w-4" />,
			},
			{
				key: "APPROVED" as const,
				total: approvedQ.data?.meta.total ?? 0,
				icon: <CheckCircle2 className="h-4 w-4" />,
			},
			{
				key: "REJECTED" as const,
				total: rejectedQ.data?.meta.total ?? 0,
				icon: <XCircle className="h-4 w-4" />,
			},
		],
		[pendingQ.data, reviewingQ.data, approvedQ.data, rejectedQ.data],
	);

	const maxStatus = Math.max(...statusBreakdown.map((s) => s.total), 1);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">
					Xin chào, {user?.name?.split(" ").slice(-1)[0] ?? "HR"} 👋
				</h1>
				<p className="text-sm text-muted-foreground">
					Tổng quan tuyển dụng của{" "}
					<span className="font-medium text-foreground">
						{user?.company?.name ?? "công ty"}
					</span>
				</p>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{stats.map((s) => (
					<StatCard key={s.label} {...s} />
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Status breakdown */}
				<Card className="lg:col-span-1">
					<CardContent className="space-y-4 p-5">
						<div className="flex items-center justify-between">
							<h2 className="text-sm font-semibold">Phân loại hồ sơ</h2>
							<Link
								to="/hr/resumes"
								className="text-xs font-medium text-primary hover:underline"
							>
								Quản lý →
							</Link>
						</div>
						<div className="space-y-3">
							{statusBreakdown.map((s) => {
								const meta = STATUS_META[s.key];
								const pct = Math.round((s.total / maxStatus) * 100);
								return (
									<div key={s.key} className="space-y-1.5">
										<div className="flex items-center justify-between text-xs">
											<span className="flex items-center gap-2 font-medium text-foreground/80">
												{s.icon}
												{meta.label}
											</span>
											<span className="font-semibold tabular-nums">
												{s.total.toLocaleString("vi-VN")}
											</span>
										</div>
										<div className="h-1.5 overflow-hidden rounded-full bg-muted">
											<div
												className={`h-full rounded-full transition-all duration-500 ${
													s.key === "PENDING"
														? "bg-yellow-500"
														: s.key === "REVIEWING"
															? "bg-blue-500"
															: s.key === "APPROVED"
																? "bg-green-500"
																: "bg-red-500"
												}`}
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Latest resumes */}
				<Card className="lg:col-span-2">
					<CardContent className="space-y-4 p-5">
						<div className="flex items-center justify-between">
							<h2 className="text-sm font-semibold">Hồ sơ mới nhận</h2>
							<Link
								to="/hr/resumes"
								className="text-xs font-medium text-primary hover:underline"
							>
								Xem tất cả →
							</Link>
						</div>
						{latestResumesQ.isLoading ? (
							<div className="space-y-2">
								{[0, 1, 2].map((i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : !latestResumesQ.data?.result?.length ? (
							<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
								<FileText className="h-8 w-8 text-muted-foreground/50" />
								<p className="text-sm text-muted-foreground">
									Chưa có hồ sơ nào
								</p>
							</div>
						) : (
							<div className="divide-y divide-border/60">
								{latestResumesQ.data.result.map((r) => {
									const meta = STATUS_META[r.status];
									const jobName =
										typeof r.jobId === "object" ? r.jobId?.name : "—";
									return (
										<Link
											key={r._id}
											to="/hr/resumes"
											className="flex items-center justify-between gap-3 py-2.5 transition-colors duration-150 hover:bg-accent/40"
										>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-foreground">
													{r.email}
												</p>
												<p className="truncate text-xs text-muted-foreground">
													{jobName} · {formatDateTime(r.createdAt)}
												</p>
											</div>
											<Badge
												variant="outline"
												className={`shrink-0 text-[10px] ${meta.className}`}
											>
												{meta.label}
											</Badge>
										</Link>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Recent jobs */}
			<Card>
				<CardContent className="space-y-4 p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold">Tin tuyển dụng gần đây</h2>
						<Link
							to="/hr/jobs"
							className="text-xs font-medium text-primary hover:underline"
						>
							Quản lý →
						</Link>
					</div>
					{recentJobsQ.isLoading ? (
						<div className="space-y-2">
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : !recentJobsQ.data?.result?.length ? (
						<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
							<Briefcase className="h-8 w-8 text-muted-foreground/50" />
							<p className="text-sm text-muted-foreground">
								Chưa có tin tuyển dụng nào
							</p>
							<Link
								to="/hr/jobs"
								className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
							>
								Đăng tin đầu tiên <ArrowUpRight className="h-3 w-3" />
							</Link>
						</div>
					) : (
						<div className="divide-y divide-border/60">
							{recentJobsQ.data.result.map((j) => (
								<div
									key={j._id}
									className="flex items-center justify-between gap-3 py-2.5"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-foreground">
											{j.name}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{j.location} · {j.level} · {formatDateTime(j.createdAt)}
										</p>
									</div>
									<Badge
										variant="outline"
										className={
											j.isActive
												? "bg-green-50 text-green-700 border-green-200"
												: "bg-red-50 text-red-700 border-red-200"
										}
									>
										{j.isActive ? "Active" : "Inactive"}
									</Badge>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({
	icon,
	label,
	value,
	color,
}: {
	icon: ReactNode;
	label: string;
	value?: number;
	color: string;
}) {
	return (
		<div className="rounded-xl border border-border/60 bg-card p-5 transition-shadow duration-150 hover:shadow-md">
			<div
				className={`inline-flex items-center justify-center rounded-lg p-2.5 ${color}`}
			>
				{icon}
			</div>
			<p className="mt-3 text-sm text-muted-foreground">{label}</p>
			<p className="text-2xl font-bold tracking-tight tabular-nums">
				{value !== undefined ? value.toLocaleString("vi-VN") : "--"}
			</p>
		</div>
	);
}

// Re-export icon used in stat type
export { Users2 };
