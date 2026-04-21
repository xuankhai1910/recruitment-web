import { useState, useMemo } from "react";
import { Pencil, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Access } from "@/components/guards/Access";
import { CompanyModal } from "@/components/admin/company/CompanyModal";
import { useCompanies, useDeleteCompany } from "@/hooks/useCompanies";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/constants";
import { toSearchRegex } from "@/lib/vietnamese";
import type { Company } from "@/types/company";

const { COMPANIES } = ALL_PERMISSIONS;

export default function CompanyPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");
	const [openModal, setOpenModal] = useState(false);
	const [editingCompany, setEditingCompany] = useState<Company | null>(null);
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

	const { data, isLoading } = useCompanies({
		current: page,
		pageSize,
		sort: sortParam ?? "-updatedAt",
		name: toSearchRegex(search),
	});

	const displayData = data?.result ?? [];
	const displayMeta = data?.meta;

	const { mutateAsync: deleteCompany } = useDeleteCompany();

	const columns = useMemo<Column<Company>[]>(
		() => [
			{
				key: "stt",
				label: "STT",
				className: "w-[6%] text-center",
				render: (_row, index) => (page - 1) * pageSize + index + 1,
			},
			{
				key: "name",
				label: "Tên công ty",
				className: "w-[30%]",
				labelNode: (
					<button
						type="button"
						title={getSortTitle("name")}
						className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
						onClick={() => handleSort("name")}
					>
						Tên công ty
						<SortIcon field="name" />
					</button>
				),
				render: (row) => (
					<span className="font-medium truncate block">{row.name}</span>
				),
			},
			{
				key: "address",
				label: "Địa chỉ",
				className: "w-[34%]",
				render: (row) => <span className="truncate block">{row.address}</span>,
			},
			{
				key: "createdAt",
				label: "Ngày tạo",
				className: "w-[18%]",
				render: (row) => formatDateTime(row.createdAt),
			},
			{
				key: "actions",
				label: "Thao tác",
				className: "w-[12%] text-center",
				render: (row) => (
					<div className="flex items-center justify-center gap-1">
						<Access permission={COMPANIES.UPDATE} hideChildren>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700 transition-colors duration-150"
								onClick={() => {
									setEditingCompany(row);
									setOpenModal(true);
								}}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						</Access>
						<Access permission={COMPANIES.DELETE} hideChildren>
							<ConfirmDelete onConfirm={() => deleteCompany(row._id)} />
						</Access>
					</div>
				),
			},
		],
		[page, pageSize, sortField, sortDir, deleteCompany],
	);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold tracking-tight">Quản lý Company</h1>

			<DataTable<Company>
				columns={columns}
				data={displayData}
				meta={displayMeta}
				loading={isLoading}
				searchPlaceholder="Tìm theo tên công ty..."
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
				toolbar={
					<Access permission={COMPANIES.CREATE} hideChildren>
						<Button
							className="cursor-pointer bg-[#0369A1] hover:bg-[#0369A1]/90 transition-colors duration-150"
							onClick={() => {
								setEditingCompany(null);
								setOpenModal(true);
							}}
						>
							<Plus className="mr-1.5 h-4 w-4" />
							Thêm mới
						</Button>
					</Access>
				}
			/>

			<CompanyModal
				open={openModal}
				onOpenChange={setOpenModal}
				company={editingCompany}
			/>
		</div>
	);
}
