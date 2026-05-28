import { useState, useTransition } from "react";
import { Plus, Pencil, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { BulkDeleteButton } from "@/components/admin/BulkDeleteButton";
import { MultiSelectFilter } from "@/components/admin/MultiSelectFilter";
import { CompanyCombobox } from "@/components/admin/CompanyCombobox";
import { JobModal } from "@/components/admin/job/JobModal";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useJobsByAdmin, useDeleteJob } from "@/hooks/useJobs";
import { useBulkDelete } from "@/hooks/useBulkDelete";
import { useCompaniesDropdown } from "@/hooks/useCompanies";
import { jobsApi } from "@/api/jobs.api";
import { LEVEL_LIST } from "@/lib/constants";
import { formatJobSalary } from "@/lib/format";
import { toSearchRegex } from "@/lib/vietnamese";
import type { Job } from "@/types/job";

const SALARY_RANGES = [
	{ key: "all", label: "Tất cả", min: undefined, max: undefined, negotiable: undefined },
	{ key: "negotiable", label: "Thỏa thuận", min: undefined, max: undefined, negotiable: true },
	{ key: "under-10", label: "Dưới 10 triệu", min: undefined, max: 10_000_000, negotiable: undefined },
	{ key: "10-20", label: "10 - 20 triệu", min: 10_000_000, max: 20_000_000, negotiable: undefined },
	{ key: "20-30", label: "20 - 30 triệu", min: 20_000_000, max: 30_000_000, negotiable: undefined },
	{ key: "30-50", label: "30 - 50 triệu", min: 30_000_000, max: 50_000_000, negotiable: undefined },
	{ key: "over-50", label: "Trên 50 triệu", min: 50_000_000, max: undefined, negotiable: undefined },
] as const;

export default function JobPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [levels, setLevels] = useState<string[]>([]);
	const [salaryKey, setSalaryKey] = useState("all");
	const [companyId, setCompanyId] = useState<string | undefined>(undefined);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingJob, setEditingJob] = useState<Job | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [sortField, setSortField] = useState<"name" | "salary" | null>(null);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	// Mounting the heavy JobModal (form + Tiptap) blocks the click handler for
	// 200-400ms. Marking the open as a transition lets React keep the UI
	// responsive while the modal mounts off the main render path.
	const [, startTransition] = useTransition();

	const openModal = (job: Job | null) => {
		startTransition(() => {
			setEditingJob(job);
			setModalOpen(true);
		});
	};

	const handleSort = (field: "name" | "salary") => {
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

	const getSortTitle = (field: "name" | "salary") => {
		if (sortField !== field) return "Nhấn để sắp xếp tăng dần";
		if (sortDir === "asc") return "Nhấn để sắp xếp giảm dần";
		return "Nhấn để hủy sắp xếp";
	};

	// `salary` is a nested doc — sorting on it must target a scalar.
	const sortKey = sortField === "salary" ? "salary.min" : sortField;
	const sortParam = sortKey ? (sortDir === "asc" ? sortKey : `-${sortKey}`) : undefined;

	const salaryRange = SALARY_RANGES.find((r) => r.key === salaryKey);

	const { data, isLoading } = useJobsByAdmin({
		current: page,
		pageSize,
		sort: sortParam,
		name: toSearchRegex(search),
		level: levels.length > 0 ? levels.join(",") : undefined,
		"salary.min[$gte]": salaryRange?.min,
		"salary.max[$lte]": salaryRange?.max,
		"salary.isNegotiable": salaryRange?.negotiable,
		"company._id": companyId,
	});
	const deleteJob = useDeleteJob();
	const bulkDelete = useBulkDelete({
		queryKeys: [["jobs"], ["jobs-admin"]],
		deleteFn: (id) => jobsApi.delete(id),
		successMessage: (count) => `Đã xóa ${count} tin tuyển dụng`,
	});
	// Pulls from the cache warmed by JobModal — same query key, no extra fetch.
	const { data: companiesData } = useCompaniesDropdown(true);
	const companies = companiesData?.result ?? [];

	const displayData = data?.result ?? [];
	const displayMeta = data?.meta;

	const resetFilters = () => {
		setLevels([]);
		setSalaryKey("all");
		setCompanyId(undefined);
		setSelectedIds([]);
		setPage(1);
	};

	const hasFilter =
		levels.length > 0 || salaryKey !== "all" || companyId !== undefined;

	const SortIcon = ({ field }: { field: "name" | "salary" }) => {
		if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
		return sortDir === "asc"
			? <ArrowUp className="h-3.5 w-3.5 text-primary" />
			: <ArrowDown className="h-3.5 w-3.5 text-primary" />;
	};

	const columns: Column<Job>[] = [
		{
			key: "name",
			label: "Tên công việc",
			className: "w-[24%]",
			labelNode: (
				<button
					type="button"
					title={getSortTitle("name")}
					className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
					onClick={() => handleSort("name")}
				>
					Tên công việc
					<SortIcon field="name" />
				</button>
			),
			render: (row) => (
				<span className="font-medium truncate block">{row.name}</span>
			),
		},
		{
			key: "company",
			label: "Công ty",
			className: "w-[22%]",
			render: (row) => (
				<span className="block truncate">{row.company.name}</span>
			),
		},
		{
			key: "salary",
			label: "Mức lương",
			className: "w-[14%]",
			labelNode: (
				<button
					type="button"
					title={getSortTitle("salary")}
					className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
					onClick={() => handleSort("salary")}
				>
					Mức lương
					<SortIcon field="salary" />
				</button>
			),
			render: (row) => formatJobSalary(row.salary),
		},
		{
			key: "level",
			label: "Level",
			className: "w-[10%]",
			render: (row) => (
				<Badge variant="outline" className="font-normal">
					{row.level}
				</Badge>
			),
		},
		{
			key: "status",
			label: "Trạng thái",
			className: "w-[14%]",
			render: (row) => (
				<Badge
					className={
						row.isActive
							? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
							: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
					}
					variant="outline"
				>
					{row.isActive ? "ACTIVE" : "INACTIVE"}
				</Badge>
			),
		},
		{
			key: "actions",
			label: "Thao tác",
			className: "w-[12%] text-center",
			render: (row) => (
				<div className="flex items-center justify-center gap-1">
					<Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
							onClick={() => openModal(row)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</Access>
					<Access permission={ALL_PERMISSIONS.JOBS.DELETE} hideChildren>
						<ConfirmDelete onConfirm={() => deleteJob.mutateAsync(row._id)} />
					</Access>
				</div>
			),
		},
	];

	return (
		<Access permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}>
			<div className="space-y-6">
				<h1 className="text-2xl font-bold tracking-tight">Quản lý công việc</h1>
				<DataTable
					columns={columns}
					data={displayData}
					meta={displayMeta}
					loading={isLoading}
					searchPlaceholder="Tìm kiếm theo tên..."
					searchValue={search}
					onSearchChange={(v) => {
						setSearch(v);
						setSelectedIds([]);
						setPage(1);
					}}
					onPageChange={(p) => {
						setSelectedIds([]);
						setPage(p);
					}}
					onPageSizeChange={(s) => {
						setSelectedIds([]);
						setPageSize(s);
						setPage(1);
					}}
					rowKey={(row) => row._id}
					selectedRowKeys={selectedIds}
					onSelectedRowKeysChange={setSelectedIds}
					filters={
						<>
							<MultiSelectFilter
								label="Level"
								options={LEVEL_LIST}
								value={levels}
								onChange={(v) => {
									setLevels(v);
									setSelectedIds([]);
									setPage(1);
								}}
							/>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Công ty:</span>
								<div className="w-56">
									<CompanyCombobox
										companies={companies}
										value={companyId}
										onChange={(id) => {
											setCompanyId(id);
											setSelectedIds([]);
											setPage(1);
										}}
										allowClear
										placeholder="Tất cả công ty"
									/>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									Mức lương:
								</span>
								<Select
									value={salaryKey}
									onValueChange={(v) => {
										setSalaryKey(v);
										setSelectedIds([]);
										setPage(1);
									}}
								>
									<SelectTrigger className="h-9 w-44 cursor-pointer">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SALARY_RANGES.map((r) => (
											<SelectItem
												key={r.key}
												value={r.key}
												className="cursor-pointer"
											>
												{r.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{hasFilter && (
								<Button
									variant="ghost"
									size="sm"
									className="h-9 cursor-pointer text-muted-foreground hover:text-foreground"
									onClick={resetFilters}
								>
									<RotateCcw className="mr-1.5 h-3.5 w-3.5" />
									Đặt lại
								</Button>
							)}
						</>
					}
					toolbar={
						<>
							<Access permission={ALL_PERMISSIONS.JOBS.DELETE} hideChildren>
								<BulkDeleteButton
									selectedCount={selectedIds.length}
									itemLabel="tin tuyển dụng"
									onConfirm={async () => {
										await bulkDelete.mutateAsync(selectedIds);
										setSelectedIds([]);
									}}
								/>
							</Access>
						<Access permission={ALL_PERMISSIONS.JOBS.CREATE} hideChildren>
							<Button
								className="cursor-pointer bg-primary hover:bg-primary/90 transition-colors duration-150"
								onClick={() => openModal(null)}
							>
								<Plus className="mr-1.5 h-4 w-4" />
								Thêm mới
							</Button>
						</Access>
						</>
					}
				/>

				<JobModal
					open={modalOpen}
					onOpenChange={setModalOpen}
					job={editingJob}
				/>
			</div>
		</Access>
	);
}
