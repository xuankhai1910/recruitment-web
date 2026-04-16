import { useState } from "react";
import { Plus, Pencil, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { permissionsApi } from "@/api/permissions.api";
import { formatDateTime, colorMethodBg } from "@/lib/constants";
import { PermissionModal } from "@/components/admin/permission/PermissionModal";
import { PermissionDetail } from "@/components/admin/permission/PermissionDetail";
import type { Permission } from "@/types/permission";

export default function PermissionPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["permissions", page, search],
    queryFn: () =>
      permissionsApi
        .getList({ current: page, pageSize: 10, ...(search ? { name: `/${search}/i` } as Record<string, unknown> : {}) })
        .then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

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
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "apiPath",
      label: "API Path",
      render: (row) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.apiPath}</code>,
    },
    {
      key: "method",
      label: "Method",
      render: (row) => (
        <Badge variant="outline" className={`font-mono text-xs ${colorMethodBg(row.method)}`}>
          {row.method}
        </Badge>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (row) => row.module,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      label: "Thao tác",
      className: "w-[130px]",
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
            <ConfirmDelete onConfirm={() => deleteMutation.mutateAsync(row._id)} />
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
          data={data?.result ?? []}
          meta={data?.meta}
          loading={isLoading}
          searchPlaceholder="Tìm kiếm theo tên..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onPageChange={setPage}
          rowKey={(row) => row._id}
          toolbar={
            <Access permission={ALL_PERMISSIONS.PERMISSIONS.CREATE} hideChildren>
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
