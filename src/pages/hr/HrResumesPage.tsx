import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
	Eye,
	FileDown,
	User as UserIcon,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { useResumes } from "@/hooks/useResumes";
import { formatDateTime } from "@/lib/constants";
import { toSearchRegex } from "@/lib/vietnamese";
import { ResumeDetail } from "@/components/admin/resume/ResumeDetail";
import { usersApi } from "@/api/users.api";
import type { Resume } from "@/types/resume";

const STATUS_TABS = [
	{ key: "ALL", label: "Tất cả" },
	{ key: "PENDING", label: "Chờ duyệt" },
	{ key: "REVIEWING", label: "Đang xem" },
	{ key: "APPROVED", label: "Đã duyệt" },
	{ key: "REJECTED", label: "Từ chối" },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

const statusColor: Record<string, string> = {
	PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
	REVIEWING: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
	APPROVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
	REJECTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

/**
 * HR Resumes page — danh sách hồ sơ ứng tuyển vào công ty của HR.
 * BE auto-scope theo user.company._id (resumes.service.scopeFilter).
 * HR KHÔNG được delete — chỉ cập nhật status.
 */
export function HrResumesPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [status, setStatus] = useState<StatusKey>("ALL");
	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<"email" | "userId.name" | null>(
		null,
	);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

	const handleSort = (field: "email" | "userId.name") => {
		if (sortField !== field) {
			setSortField(field);
			setSortDir("asc");
		} else if (sortDir === "asc") {
			setSortDir("desc");
		} else {
			setSortField(null);
			setSortDir("asc");
		}
		setPage(1);
	};

	const SortIcon = ({ field }: { field: "email" | "userId.name" }) => {
		if (sortField !== field)
			return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
		return sortDir === "asc" ? (
			<ArrowUp className="h-3.5 w-3.5 text-primary" />
		) : (
			<ArrowDown className="h-3.5 w-3.5 text-primary" />
		);
	};

	const sortParam = sortField
		? sortDir === "asc"
			? sortField
			: `-${sortField}`
		: undefined;

	const isSearching = search.trim().length > 0;
	const isEmailSearch = search.includes("@");
	// Khi search theo tên ứng viên, phải tra cứu /users để lấy userIds
	// (resume không lưu name). Khi search theo email — resume có sẵn field
	// `email` snapshot — đi thẳng vào API resumes, không cần round-trip users.
	const needsUserLookup = isSearching && !isEmailSearch;

	const { data: usersData } = useQuery({
		queryKey: ["users", "hr-resume-search", search],
		queryFn: () =>
			usersApi
				.getList({
					current: 1,
					pageSize: 1000,
					name: toSearchRegex(search),
				} as Record<string, unknown>)
				.then((r) => r.data.data),
		staleTime: 5 * 60 * 1000,
		enabled: needsUserLookup,
	});

	const matchedUserIds = useMemo(() => {
		if (!needsUserLookup) return [] as string[];
		return (usersData?.result ?? []).map((u) => u._id);
	}, [usersData, needsUserLookup]);

	const shouldSkipResumes = needsUserLookup && matchedUserIds.length === 0;

	const { data, isLoading } = useResumes({
		current: page,
		pageSize,
		sort: sortParam ?? "-updatedAt",
		populate: "jobId,companyId",
		fields: "jobId._id,jobId.name,companyId._id,companyId.name,companyId.logo",
		...(status !== "ALL" ? { status } : {}),
		...(isSearching && isEmailSearch ? { email: toSearchRegex(search) } : {}),
		...(needsUserLookup && matchedUserIds.length > 0
			? { userId: matchedUserIds.join(",") }
			: {}),
	} as Record<string, unknown>);

	const displayMeta = shouldSkipResumes
		? { current: 1, pageSize, pages: 0, total: 0 }
		: data?.meta;

	// Populate user info (BE không populate userId trực tiếp)
	const userIds = useMemo(() => {
		const ids = new Set<string>();
		(data?.result ?? []).forEach((r) => {
			if (typeof r.userId === "string") ids.add(r.userId);
		});
		return Array.from(ids);
	}, [data]);

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

	const userNameMap = useMemo(() => {
		const map: Record<string, string> = {};
		userIds.forEach((id, i) => {
			const name = userQueries[i]?.data?.name;
			if (name) map[id] = name;
		});
		return map;
	}, [userIds, userQueries]);

	const displayData = useMemo(() => {
		const base = shouldSkipResumes ? [] : (data?.result ?? []);
		if (!sortField) return base;
		return [...base].sort((a, b) => {
			let cmp = 0;
			if (sortField === "email") {
				cmp = (a.email ?? "").localeCompare(b.email ?? "");
			} else if (sortField === "userId.name") {
				const aName =
					typeof a.userId === "object"
						? a.userId.name
						: (userNameMap[a.userId as string] ?? "");
				const bName =
					typeof b.userId === "object"
						? b.userId.name
						: (userNameMap[b.userId as string] ?? "");
				cmp = aName.localeCompare(bName, "vi", { sensitivity: "base" });
			}
			return sortDir === "asc" ? cmp : -cmp;
		});
	}, [shouldSkipResumes, data, sortField, sortDir, userNameMap]);

	const [selected, setSelected] = useState<Resume | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);

	const getJobName = (r: Resume) => {
		if (!r.jobId) return "—";
		return typeof r.jobId === "object" ? r.jobId.name : r.jobId;
	};
	const getUserId = (r: Resume) =>
		typeof r.userId === "object" ? r.userId._id : r.userId;
	const getUserName = (r: Resume) => {
		if (!r.userId) return "—";
		if (typeof r.userId === "object") return r.userId.name;
		return userNameMap[r.userId] ?? "...";
	};

	const columns: Column<Resume>[] = [
		{
			key: "stt",
			label: "STT",
			className: "w-[5%]",
			render: (_row, idx) => (page - 1) * pageSize + idx + 1,
		},
		{
			key: "name",
			label: "Ứng viên",
			className: "w-[18%]",
			labelNode: (
				<button
					type="button"
					className="flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
					onClick={() => handleSort("userId.name")}
				>
					Ứng viên
					<SortIcon field="userId.name" />
				</button>
			),
			render: (row) => (
				<Link
					to={`/hr/candidates/${getUserId(row)}`}
					className="block truncate font-medium text-primary hover:underline"
				>
					{getUserName(row)}
				</Link>
			),
		},
		{
			key: "email",
			label: "Email",
			className: "w-[20%]",
			labelNode: (
				<button
					type="button"
					className="flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
					onClick={() => handleSort("email")}
				>
					Email
					<SortIcon field="email" />
				</button>
			),
			render: (row) => (
				<span className="block truncate text-muted-foreground">
					{row.email}
				</span>
			),
		},
		{
			key: "job",
			label: "Vị trí ứng tuyển",
			className: "w-[18%]",
			render: (row) => (
				<span className="block truncate">{getJobName(row)}</span>
			),
		},
		{
			key: "cv",
			label: "CV",
			className: "w-[8%] text-center",
			render: (row) =>
				row.url ? (
					<a
						href={`${import.meta.env.VITE_STATIC_URL}/images/resume/${row.url}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100"
						title="Xem / tải CV"
					>
						<FileDown className="h-3.5 w-3.5" />
						Xem CV
					</a>
				) : (
					<span className="text-xs text-muted-foreground">—</span>
				),
		},
		{
			key: "status",
			label: "Trạng thái",
			className: "w-[12%]",
			render: (row) => (
				<Badge variant="outline" className={statusColor[row.status] ?? ""}>
					{row.status}
				</Badge>
			),
		},
		{
			key: "createdAt",
			label: "Ngày nộp",
			className: "w-[15%]",
			render: (row) => formatDateTime(row.createdAt),
		},
		{
			key: "actions",
			label: "Thao tác",
			className: "w-[8%] text-center",
			render: (row) => (
				<div className="flex items-center justify-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50"
						title="Xem & cập nhật trạng thái"
						onClick={() => {
							setSelected(row);
							setDetailOpen(true);
						}}
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Link
						to={`/hr/candidates/${getUserId(row)}`}
						className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-violet-700 transition-colors hover:bg-violet-50"
						title="Xem profile ứng viên"
					>
						<UserIcon className="h-4 w-4" />
					</Link>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Hồ sơ ứng tuyển</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Quản lý hồ sơ ứng viên đã nộp vào các tin tuyển dụng của công ty
				</p>
			</div>

			{/* Status tabs */}
			<div className="flex flex-wrap gap-2 border-b border-border">
				{STATUS_TABS.map((t) => (
					<button
						key={t.key}
						type="button"
						onClick={() => {
							setStatus(t.key);
							setPage(1);
						}}
						className={`-mb-px cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
							status === t.key
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			<DataTable
				columns={columns}
				data={displayData}
				meta={displayMeta}
				loading={isLoading}
				searchPlaceholder="Tìm theo tên hoặc email ứng viên..."
				searchValue={search}
				onSearchChange={(v) => {
					setSearch(v);
					setPage(1);
				}}
				onPageChange={setPage}
				onPageSizeChange={(s) => {
					setPageSize(s);
					setPage(1);
				}}
				rowKey={(row) => row._id}
			/>

			<ResumeDetail
				open={detailOpen}
				onOpenChange={setDetailOpen}
				resume={selected}
			/>
		</div>
	);
}
