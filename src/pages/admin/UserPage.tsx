import { useState, useEffect } from "react";
import { Eye, Pencil, Plus, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { MultiSelectFilter } from "@/components/admin/MultiSelectFilter";
import { UserModal } from "@/components/admin/user/UserModal";
import { UserDetail } from "@/components/admin/user/UserDetail";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { rolesApi } from "@/api/roles.api";
import { formatDateTime } from "@/lib/constants";
import { toSearchRegex } from "@/lib/vietnamese";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";

export default function UserPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [roleIds, setRoleIds] = useState<string[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [viewUser, setViewUser] = useState<User | null>(null);
	const [sortField, setSortField] = useState<"name" | null>(null);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

	const handleSort = (field: "name") => {
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

	const getSortTitle = (field: "name") => {
		if (sortField !== field) return "Nhấn để sắp xếp tăng dần";
		if (sortDir === "asc") return "Nhấn để sắp xếp giảm dần";
		return "Nhấn để hủy sắp xếp";
	};

	const SortIcon = ({ field }: { field: "name" }) => {
		if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
		return sortDir === "asc"
			? <ArrowUp className="h-3.5 w-3.5 text-primary" />
			: <ArrowDown className="h-3.5 w-3.5 text-primary" />;
	};

	const sortParam = sortField ? (sortDir === "asc" ? sortField : `-${sortField}`) : undefined;

	const [roles, setRoles] = useState<Role[]>([]);
	useEffect(() => {
		rolesApi.getList({ current: 1, pageSize: 100 }).then((r) => {
			setRoles(r.data.data.result);
		});
	}, []);

	// Route search to name or email based on whether input looks like an email
	const isEmailSearch = search.includes("@");
	const { data, isLoading } = useUsers({
		current: page,
		pageSize,
		sort: sortParam ?? "-createdAt",
		populate: "role",
		fields: "role._id,role.name",
		...(roleIds.length > 0 ? { role: roleIds.join(",") } : {}),
		...(isEmailSearch
			? { email: toSearchRegex(search) }
			: { name: toSearchRegex(search) }),
	} as any);

	const displayData = data?.result ?? [];
	const displayMeta = data?.meta;

	const deleteMutation = useDeleteUser();

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setOpenModal(true);
	};

	const handleCreate = () => {
		setEditingUser(null);
		setOpenModal(true);
	};

	// Map role _id → name for filter display
	const roleNameById: Record<string, string> = Object.fromEntries(
		roles.map((r) => [r._id, r.name]),
	);
	const roleNameOptions = roles.map((r) => r.name);
	const selectedRoleNames = roleIds
		.map((id) => roleNameById[id])
		.filter(Boolean);

	const columns: Column<User>[] = [
		{
			key: "stt",
			label: "STT",
			className: "w-[6%] text-center",
			render: (_row, index) => (page - 1) * pageSize + index + 1,
		},
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
			key: "email",
			label: "Email",
			className: "w-[26%]",
			render: (row) => <span className="truncate block">{row.email}</span>,
		},
		{
			key: "role",
			label: "Vai trò",
			className: "w-[14%]",
			render: (row) =>
				row.role?.name ? (
					<Badge variant="outline">{row.role.name}</Badge>
				) : (
					<span className="text-muted-foreground">—</span>
				),
		},
		{
			key: "createdAt",
			label: "Ngày tạo",
			className: "w-[18%]",
			render: (row) => (
				<span className="text-sm text-muted-foreground">
					{formatDateTime(row.createdAt)}
				</span>
			),
		},
		{
			key: "actions",
			label: "Thao tác",
			className: "w-[14%] text-center",
			render: (row) => (
				<div className="flex items-center justify-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
						onClick={() => {
							setViewUser(row);
						}}
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
						onClick={() => {
							handleEdit(row);
						}}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<ConfirmDelete
						onConfirm={() => deleteMutation.mutateAsync(row._id)}
					/>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Quản lý người dùng</h1>

			<DataTable
				columns={columns}
				data={displayData}
				meta={displayMeta}
				loading={isLoading}
				searchPlaceholder="Tìm theo tên hoặc email..."
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
							label="Vai trò"
							options={roleNameOptions}
							value={selectedRoleNames}
							onChange={(names) => {
								const ids = roles
									.filter((r) => names.includes(r.name))
									.map((r) => r._id);
								setRoleIds(ids);
								setPage(1);
							}}
						/>
						{roleIds.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-9 cursor-pointer text-muted-foreground hover:text-foreground"
								onClick={() => {
									setRoleIds([]);
									setPage(1);
								}}
							>
								<RotateCcw className="mr-1.5 h-3.5 w-3.5" />
								Đặt lại
							</Button>
						)}
					</>
				}
				toolbar={
					<Button
						className="cursor-pointer bg-primary hover:bg-primary/90"
						onClick={handleCreate}
					>
						<Plus className="mr-1.5 h-4 w-4" />
						Thêm mới
					</Button>
				}
			/>

			<UserModal
				open={openModal}
				onOpenChange={setOpenModal}
				user={editingUser}
			/>

			<UserDetail
				open={!!viewUser}
				onOpenChange={(open) => {
					if (!open) setViewUser(null);
				}}
				user={viewUser}
			/>
		</div>
	);
}
