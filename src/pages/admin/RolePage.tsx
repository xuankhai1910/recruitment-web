import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { rolesApi } from "@/api/roles.api";
import { formatDateTime } from "@/lib/constants";
import { RoleModal } from "@/components/admin/role/RoleModal";
import type { Role } from "@/types/role";

export default function RolePage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["roles", page],
    queryFn: () => rolesApi.getList({ current: page, pageSize: 10 }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã xóa vai trò");
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: Column<Role>[] = [
    {
      key: "name",
      label: "Tên vai trò",
      className: "w-[40%]",
      render: (row) => <span className="font-medium truncate block">{row.name}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      className: "w-[18%]",
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.isActive
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      className: "w-[24%]",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      label: "Thao tác",
      className: "w-[18%] text-center",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Access permission={ALL_PERMISSIONS.ROLES.UPDATE} hideChildren>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
              onClick={() => {
                setEditingId(row._id);
                setModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Access>
          <Access permission={ALL_PERMISSIONS.ROLES.DELETE} hideChildren>
            <ConfirmDelete onConfirm={() => deleteMutation.mutateAsync(row._id)} />
          </Access>
        </div>
      ),
    },
  ];

  return (
    <Access permission={ALL_PERMISSIONS.ROLES.GET_PAGINATE}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý vai trò</h1>
        <DataTable
          columns={columns}
          data={data?.result ?? []}
          meta={data?.meta}
          loading={isLoading}
          onPageChange={setPage}
          rowKey={(row) => row._id}
          toolbar={
            <Access permission={ALL_PERMISSIONS.ROLES.CREATE} hideChildren>
              <Button
                className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
                onClick={() => {
                  setEditingId(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm mới
              </Button>
            </Access>
          }
        />
        <RoleModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          roleId={editingId}
        />
      </div>
    </Access>
  );
}
