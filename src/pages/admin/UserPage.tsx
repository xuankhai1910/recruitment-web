import { useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { UserModal } from "@/components/admin/user/UserModal";
import { UserDetail } from "@/components/admin/user/UserDetail";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { formatDateTime } from "@/lib/constants";
import type { User } from "@/types/user";

export default function UserPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers({
    current: page,
    pageSize: 10,
    sort: "-createdAt",
    populate: "role",
    fields: "role._id,role.name",
    ...(search ? { name: `/${search}/i` } : {}),
  } as any);

  const deleteMutation = useDeleteUser();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setOpenModal(true);
  };

  const columns: Column<User>[] = [
    {
      key: "stt",
      label: "STT",
      className: "w-16 text-center",
      render: (_row, index) => (page - 1) * 10 + index + 1,
    },
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (row) => row.email,
    },
    {
      key: "role",
      label: "Role",
      render: (row) =>
        row.role?.name ? (
          <Badge variant="outline">{row.role.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "CreatedAt",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-32 text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => setViewUser(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDelete onConfirm={() => deleteMutation.mutateAsync(row._id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

      <DataTable
        columns={columns}
        data={data?.result ?? []}
        meta={data?.meta}
        loading={isLoading}
        searchPlaceholder="Tìm theo tên..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onPageChange={setPage}
        rowKey={(row) => row._id}
        toolbar={
          <Button className="cursor-pointer" onClick={handleCreate}>
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
