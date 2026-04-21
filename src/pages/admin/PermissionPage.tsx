import { useState } from "react";
import { Plus, Pencil, Eye, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { MultiSelectFilter } from "@/components/admin/MultiSelectFilter";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS, ALL_MODULES } from "@/lib/permissions";
import { permissionsApi } from "@/api/permissions.api";
import { formatDateTime, colorMethodBg } from "@/lib/constants";
import { toSearchRegex } from "@/lib/vietnamese";
import { PermissionModal } from "@/components/admin/permission/PermissionModal";
import { PermissionDetail } from "@/components/admin/permission/PermissionDetail";
import type { Permission } from "@/types/permission";

const METHOD_LIST = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;

export default function PermissionPage() {
	const qc = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [methods, setMethods] = useState<string[]>([]);
	const [modules, setModules] = useState<string[]>([]);
	const [sortField, setSortField] = useState<"name" | "apiPath" | null>(null);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

	const handleSort = (field: "name" | "apiPath") => {
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

	const getSortTitle = (field: "name" | "apiPath") => {
		if (sortField !== field) return "Nhấn để sắp xếp tăng dần";
		if (sortDir === "asc") return "Nhấn để sắp xếp giảm dần";
		return "Nhấn để hủy sắp xếp";
	};

	const SortIcon = ({ field }: { field: "name" | "apiPath" }) => {
		if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
		return sortDir === "asc"
			? <ArrowUp className="h-3.5 w-3.5 text-primary" />
			: <ArrowDown className="h-3.5 w-3.5 text-primary" />;
	};

	const sortParam = sortField ? (sortDir === "asc" ? sortField : `-${sortField}`) : undefined;

	const { data, isLoading } = useQuery({
		queryKey: ["permissions", page, pageSize, search, methods, modules, sortField, sortDir],
		queryFn: () =>
			permissionsApi
				.getList({
					current: page,
					pageSize,
					sort: sortParam,
					name: toSearchRegex(search),
					...(methods.length > 0 ? { method: methods.join(",") } : {}),
					...(modules.length > 0 ? { module: modules.join(",") } : {}),
				} as Record<string, unknown>)
				.then((r) => r.data.data),
		placeholderData: (prev) => prev,
	});

	const displayData = data?.result ?? [];
	const displayMeta = data?.meta;

	const hasFilter = methods.length > 0 || modules.length > 0;
	const resetFilters = () => {
		setMethods([]);
		setModules([]);
		setPage(1);
	};

	const deleteMutation = useMutation({
		mutationFn: (id: string) => permissionsApi.delete(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Đã xóa permission");
		},
	});

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<Permission | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [viewing, setViewing] = useState<Permission | null>(null);

	const columns: Column<Permission>[] = [
		{
			key: "name",
			label: "Tên",
			className: "w-[22%]",
			labelNode: (
				<button
					type="button"
					title={getSortTitle("name")}
					className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
					onClick={() => handleSort("name")}
				>
					Tên
					<SortIcon field="name" />
				</button>
			),
			render: (row) => (
				<span className="font-medium truncate block">{row.name}</span>
			),
		},
		{
			key: "apiPath",
			label: "API Path",
			className: "w-[28%]",
			labelNode: (
				<button
					type="button"
					title={getSortTitle("apiPath")}
					className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
					onClick={() => handleSort("apiPath")}
				>
					API Path
					<SortIcon field="apiPath" />
				</button>
			),
			render: (row) => (
				<code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate block">
					{row.apiPath}
				</code>
			),
		},
		{
			key: "method",
			label: "Method",
			className: "w-[10%]",
			render: (row) => (
				<Badge
					variant="outline"
					className={`font-mono text-xs ${colorMethodBg(row.method)}`}
				>
					{row.method}
				</Badge>
			),
		},
		{
			key: "module",
			label: "Module",
			className: "w-[13%]",
			render: (row) => (
				<Badge variant="secondary" className="font-normal">
					{row.module}
				</Badge>
			),
		},
		{
			key: "createdAt",
			label: "Ngày tạo",
			className: "w-[15%]",
			render: (row) => formatDateTime(row.createdAt),
		},
		{
			key: "actions",
			label: "Thao tác",
			className: "w-[12%] text-center",
			render: (row) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
						onClick={() => {
							setViewing(row);
							setDetailOpen(true);
						}}
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Access permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE} hideChildren>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
							onClick={() => {
								setEditing(row);
								setModalOpen(true);
							}}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</Access>
					<Access permission={ALL_PERMISSIONS.PERMISSIONS.DELETE} hideChildren>
						<ConfirmDelete
							onConfirm={() => deleteMutation.mutateAsync(row._id)}
						/>
					</Access>
				</div>
			),
		},
	];

	return (
		<Access permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}>
			<div className="space-y-6">
				<h1 className="text-2xl font-bold tracking-tight">Quản lý quyền hạn</h1>
				<DataTable
					columns={columns}
					data={displayData}
					meta={displayMeta}
					loading={isLoading}
					searchPlaceholder="Tìm kiếm theo tên..."
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
					filters={
						<>
							<MultiSelectFilter
								label="Method"
								options={METHOD_LIST}
								value={methods}
								onChange={(v) => {
									setMethods(v);
									setPage(1);
								}}
							/>
							<MultiSelectFilter
								label="Module"
								options={ALL_MODULES}
								value={modules}
								onChange={(v) => {
									setModules(v);
									setPage(1);
								}}
							/>
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
						<Access
							permission={ALL_PERMISSIONS.PERMISSIONS.CREATE}
							hideChildren
						>
							<Button
								className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
								onClick={() => {
									setEditing(null);
									setModalOpen(true);
								}}
							>
								<Plus className="mr-1.5 h-4 w-4" />
								Thêm mới
							</Button>
						</Access>
					}
				/>
				<PermissionModal
					open={modalOpen}
					onOpenChange={setModalOpen}
					permission={editing}
				/>
				<PermissionDetail
					open={detailOpen}
					onOpenChange={setDetailOpen}
					permission={viewing}
				/>
			</div>
		</Access>
	);
}
