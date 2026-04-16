import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useJobs, useDeleteJob } from "@/hooks/useJobs";
import { formatSalary, formatDateTime } from "@/lib/constants";
import type { Job } from "@/types/job";

export default function JobPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useJobs({ current: page, pageSize: 10, name: search ? `/${search}/i` : undefined });
  const deleteJob = useDeleteJob();

  const columns: Column<Job>[] = [
    {
      key: "name",
      label: "Tên công việc",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "salary",
      label: "Mức lương",
      render: (row) => formatSalary(row.salary),
    },
    {
      key: "level",
      label: "Level",
      render: (row) => (
        <Badge variant="outline" className="font-normal">
          {row.level}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
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
      key: "createdAt",
      label: "Ngày tạo",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      label: "Thao tác",
      className: "w-[100px]",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
              onClick={() => { navigate(`/admin/job/upsert?id=${row._id}`); }}
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
          data={data?.result ?? []}
          meta={data?.meta}
          loading={isLoading}
          searchPlaceholder="Tìm kiếm theo tên..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onPageChange={setPage}
          rowKey={(row) => row._id}
          toolbar={
            <Access permission={ALL_PERMISSIONS.JOBS.CREATE} hideChildren>
              <Button
                className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
                onClick={() => { navigate("/admin/job/upsert"); }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm mới
              </Button>
            </Access>
          }
        />
      </div>
    </Access>
  );
}
