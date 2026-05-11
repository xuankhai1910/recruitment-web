import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumes } from "@/hooks/useResumes";
import { usersApi } from "@/api/users.api";
import { formatDateTime } from "@/lib/constants";
import type { Resume } from "@/types/resume";

interface CandidateRow {
	userId: string;
	name: string;
	email: string;
	totalApplications: number;
	latestStatus: Resume["status"];
	latestJob: string;
	latestAt: string;
}

const statusColor: Record<string, string> = {
	PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
	REVIEWING: "bg-blue-50 text-blue-700 border-blue-200",
	APPROVED: "bg-green-50 text-green-700 border-green-200",
	REJECTED: "bg-red-50 text-red-700 border-red-200",
};

function initialsFrom(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/**
 * HR Candidates Page — danh sách ứng viên unique đã apply.
 * Group toàn bộ resumes (BE auto-scope theo company) theo userId,
 * giữ lại bản ghi mới nhất + tổng số lần apply.
 */
export function HrCandidatesPage() {
	const [search, setSearch] = useState("");

	// Lấy toàn bộ resumes của công ty (BE đã scope).
	// pageSize lớn để gom client-side; với dataset thật lớn cần BE distinct endpoint.
	const { data, isLoading } = useResumes({
		current: 1,
		pageSize: 500,
		sort: "-createdAt",
		populate: "jobId",
		fields: "jobId._id,jobId.name",
	} as Record<string, unknown>);

	const resumes = data?.result ?? [];

	// userIds duy nhất (chỉ khi userId là string — vì BE không populate user).
	const userIds = useMemo(() => {
		const ids = new Set<string>();
		resumes.forEach((r) => {
			const id = typeof r.userId === "object" ? r.userId._id : r.userId;
			if (id) ids.add(id);
		});
		return Array.from(ids);
	}, [resumes]);

	const userQueries = useQueries({
		queries: userIds.map((id) => ({
			queryKey: ["users", id],
			queryFn: () => usersApi.getById(id).then((r) => r.data.data),
			staleTime: 10 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		})),
	});

	const userInfoMap = useMemo(() => {
		const map: Record<string, { name: string; email: string }> = {};
		userIds.forEach((id, i) => {
			const u = userQueries[i]?.data;
			if (u) map[id] = { name: u.name, email: u.email };
		});
		return map;
	}, [userIds, userQueries]);

	// Group resumes by userId — lấy bản ghi mới nhất.
	const candidates = useMemo<CandidateRow[]>(() => {
		const map = new Map<string, CandidateRow>();
		// resumes đã sort -createdAt → bản đầu tiên gặp là mới nhất.
		resumes.forEach((r) => {
			const id = typeof r.userId === "object" ? r.userId._id : r.userId;
			if (!id) return;
			const existing = map.get(id);
			const jobName =
				typeof r.jobId === "object" ? (r.jobId?.name ?? "—") : "—";
			if (!existing) {
				const info = userInfoMap[id];
				const fallbackName =
					typeof r.userId === "object" ? r.userId.name : undefined;
				map.set(id, {
					userId: id,
					name: info?.name ?? fallbackName ?? r.email,
					email: info?.email ?? r.email,
					totalApplications: 1,
					latestStatus: r.status,
					latestJob: jobName,
					latestAt: r.createdAt,
				});
			} else {
				existing.totalApplications += 1;
			}
		});
		return Array.from(map.values());
	}, [resumes, userInfoMap]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return candidates;
		return candidates.filter(
			(c) =>
				c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
		);
	}, [candidates, search]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Ứng viên</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Danh sách ứng viên đã ứng tuyển vào công ty của bạn
				</p>
			</div>

			<div className="relative max-w-md">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Tìm theo tên hoặc email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="h-10 pl-9"
				/>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-28 w-full rounded-xl" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-3 py-16">
						<FileText className="h-12 w-12 text-muted-foreground/40" />
						<p className="text-sm text-muted-foreground">
							{search
								? "Không tìm thấy ứng viên phù hợp"
								: "Chưa có ứng viên nào"}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{filtered.map((c) => (
						<Link
							key={c.userId}
							to={`/hr/candidates/${c.userId}`}
							className="group rounded-xl border border-border/60 bg-card p-4 transition-all duration-150 hover:border-primary/40 hover:shadow-md"
						>
							<div className="flex items-start gap-3">
								<Avatar className="h-11 w-11 shrink-0">
									<AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
										{initialsFrom(c.name)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
										{c.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{c.email}
									</p>
									<div className="mt-2 flex flex-wrap items-center gap-1.5">
										<Badge
											variant="outline"
											className={`text-[10px] ${statusColor[c.latestStatus] ?? ""}`}
										>
											{c.latestStatus}
										</Badge>
										<Badge
											variant="outline"
											className="border-slate-200 bg-slate-50 text-[10px] text-slate-700"
										>
											{c.totalApplications} lần apply
										</Badge>
									</div>
								</div>
							</div>
							<div className="mt-3 border-t border-border/60 pt-2 text-xs text-muted-foreground">
								<p className="truncate">
									<span className="font-medium text-foreground/70">
										Mới nhất:
									</span>{" "}
									{c.latestJob}
								</p>
								<p className="mt-0.5">{formatDateTime(c.latestAt)}</p>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
