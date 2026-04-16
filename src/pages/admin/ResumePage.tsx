import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useResumes, useDeleteResume } from "@/hooks/useResumes";
import { formatDateTime } from "@/lib/constants";
import { ResumeDetail } from "@/components/admin/resume/ResumeDetail";
import type { Resume } from "@/types/resume";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
  REVIEWING: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  APPROVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  REJECTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

export default function ResumePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useResumes({
    current: page,
    pageSize: 10,
    sort: "-updatedAt",
    populate: "companyId,jobId",
    fields: "companyId._id,companyId.name,companyId.logo,jobId._id,jobId.name",
  });
  const deleteResume = useDeleteResume();

  const [selected, setSelected] = useState<Resume | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const getJobName = (r: Resume) => {
    if (!r.jobId) return "—";
    return typeof r.jobId === "object" ? r.jobId.name : r.jobId;
  };
  const getCompanyName = (r: Resume) => {
    if (!r.companyId) return "—";
    return typeof r.companyId === "object" ? r.companyId.name : r.companyId;
  };

  const columns: Column<Resume>[] = [
    {
      key: "stt",
      label: "STT",
      className: "w-[60px]",
      render: (_row, idx) => (page - 1) * 10 + idx + 1,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <Badge variant="outline" className={statusColor[row.status] ?? ""}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "job",
      label: "Công việc",
      render: (row) => getJobName(row),
    },
    {
      key: "company",
      label: "Công ty",
      render: (row) => getCompanyName(row),
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-700"
            onClick={() => {
              setSelected(row);
              setSheetOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Access permission={ALL_PERMISSIONS.RESUMES.DELETE} hideChildren>
            <ConfirmDelete onConfirm={() => deleteResume.mutateAsync(row._id)} />
          </Access>
        </div>
      ),
    },
  ];

  return (
    <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý hồ sơ</h1>
        <DataTable
          columns={columns}
          data={data?.result ?? []}
          meta={data?.meta}
          loading={isLoading}
          onPageChange={setPage}
          rowKey={(row) => row._id}
        />
        <ResumeDetail
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          resume={selected}
        />
      </div>
    </Access>
  );
}
