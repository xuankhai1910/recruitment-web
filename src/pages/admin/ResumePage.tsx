import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Eye, FileDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { MultiSelectFilter } from "@/components/admin/MultiSelectFilter";
import { Access } from "@/components/guards/Access";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useResumes, useDeleteResume } from "@/hooks/useResumes";
import { formatDateTime, STATUS_LIST } from "@/lib/constants";
import { ResumeDetail } from "@/components/admin/resume/ResumeDetail";
import { usersApi } from "@/api/users.api";
import type { Resume } from "@/types/resume";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
  REVIEWING: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  APPROVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  REJECTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

export default function ResumePage() {
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useResumes({
    current: page,
    pageSize: 10,
    sort: "-updatedAt",
    populate: "companyId,jobId,userId",
    fields:
      "companyId._id,companyId.name,companyId.logo,jobId._id,jobId.name,userId._id,userId.name,userId.email",
    status: statuses.length > 0 ? statuses.join(",") : undefined,
    // Resume doc has `email` — search candidate by email
    ...(search ? { email: `/${search}/i` } : {}),
  } as Record<string, unknown>);
  const deleteResume = useDeleteResume();

  const [selected, setSelected] = useState<Resume | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Collect unique userIds to fetch user info (backend can't populate userId)
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
      staleTime: 10 * 60 * 1000, // 10 min — tránh refetch liên tục
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    })),
  });

  // Map userId -> user name
  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    userIds.forEach((id, i) => {
      const name = userQueries[i]?.data?.name;
      if (name) map[id] = name;
    });
    return map;
  }, [userIds, userQueries]);

  const getJobName = (r: Resume) => {
    if (!r.jobId) return "—";
    return typeof r.jobId === "object" ? r.jobId.name : r.jobId;
  };
  const getCompanyName = (r: Resume) => {
    if (!r.companyId) return "—";
    return typeof r.companyId === "object" ? r.companyId.name : r.companyId;
  };
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
      render: (_row, idx) => (page - 1) * 10 + idx + 1,
    },
    {
      key: "name",
      label: "Tên ứng viên",
      className: "w-[16%]",
      render: (row) => (
        <span className="font-medium truncate block">{getUserName(row)}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "w-[18%]",
      render: (row) => (
        <span className="text-muted-foreground truncate block">{row.email}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      className: "w-[11%]",
      render: (row) => (
        <Badge variant="outline" className={statusColor[row.status] ?? ""}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "job",
      label: "Công việc",
      className: "w-[14%]",
      render: (row) => <span className="truncate block">{getJobName(row)}</span>,
    },
    {
      key: "company",
      label: "Công ty",
      className: "w-[12%]",
      render: (row) => <span className="truncate block">{getCompanyName(row)}</span>,
    },
    {
      key: "cv",
      label: "CV",
      className: "w-[6%]",
      render: (row) =>
        row.url ? (
          <a
            href={`${import.meta.env.VITE_STATIC_URL}/images/resume/${row.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary transition-colors duration-150 hover:text-primary/80"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <FileDown className="h-4 w-4" />
            <span className="text-xs">Tải</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      className: "w-[13%]",
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
          searchPlaceholder="Tìm theo email ứng viên..."
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onPageChange={setPage}
          rowKey={(row) => row._id}
          filters={
            <>
              <MultiSelectFilter
                label="Trạng thái"
                options={STATUS_LIST}
                value={statuses}
                onChange={(v) => {
                  setStatuses(v);
                  setPage(1);
                }}
              />
              {statuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStatuses([]);
                    setPage(1);
                  }}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Đặt lại
                </Button>
              )}
            </>
          }
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
