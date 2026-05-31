import { Link } from "react-router-dom";
import { Briefcase, FileText, Clock, Target } from "lucide-react";
import { useHrOverview } from "@/hooks/useStats";
import { useAuthStore } from "@/stores/auth.store";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AreaChart } from "@/components/dashboard/charts/AreaChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status-meta";
import { formatDate, formatWeekLabel } from "@/lib/constants";

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1][0] + (parts[0][0] ?? "")).toUpperCase();
}

export function HrDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useHrOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 w-full lg:col-span-2" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const labels = data.series.labels.map(formatWeekLabel);
  const statusData = STATUS_ORDER.map((s) => ({
    label: STATUS_META[s].label,
    value: data.resumeByStatus[s] ?? 0,
    color: STATUS_META[s].color,
  }));
  const maxStatus = Math.max(...statusData.map((s) => s.value), 1);
  const last2 = data.series.resumes.slice(-2).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Xin chào, {user?.name?.split(" ").slice(-1)[0] ?? "HR"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan tuyển dụng của{" "}
          <span className="font-medium text-foreground">
            {user?.company?.name ?? "công ty"}
          </span>
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Briefcase className="h-6 w-6" />}
          iconClass="bg-blue-50 text-blue-700"
          label="Tin đang tuyển"
          value={data.kpis.activeJobs}
          spark={data.sparks.jobs}
          sparkColor="#3B82F6"
          deltaText={`${data.kpis.totalJobs} tổng tin`}
        />
        <KpiCard
          icon={<FileText className="h-6 w-6" />}
          iconClass="bg-violet-50 text-violet-700"
          label="Tổng hồ sơ nhận"
          value={data.kpis.totalResumes}
          spark={data.sparks.resumes}
          sparkColor="#8B5CF6"
          deltaText={`+${last2} trong 2 tuần`}
          deltaUp
        />
        <KpiCard
          icon={<Clock className="h-6 w-6" />}
          iconClass="bg-amber-50 text-amber-700"
          label="Chờ xử lý"
          value={data.kpis.pending}
          spark={data.sparks.pending}
          sparkColor="#F59E0B"
          deltaText="cần duyệt sớm"
        />
        <KpiCard
          icon={<Target className="h-6 w-6" />}
          iconClass="bg-emerald-50 text-emerald-700"
          label="Tỉ lệ duyệt"
          value={`${data.approvalRate}%`}
          deltaText={`${data.resumeByStatus.APPROVED} hồ sơ đã duyệt`}
          deltaUp
        />
      </div>

      {/* Area + donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard title="Hồ sơ nhận theo tuần" className="lg:col-span-2">
          <AreaChart
            labels={labels}
            height={210}
            series={[
              { label: "Hồ sơ", values: data.series.resumes, color: "#3B82F6" },
            ]}
          />
        </DashboardCard>

        <DashboardCard
          title="Phân loại hồ sơ"
          linkLabel="Quản lý"
          linkTo="/hr/resumes"
        >
          <div className="flex flex-col items-center gap-4">
            <DonutChart
              data={statusData}
              centerValue={data.kpis.totalResumes}
              centerLabel="hồ sơ"
            />
            <div className="flex w-full flex-col gap-2">
              {statusData.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                  <span className="ml-auto font-semibold tabular-nums">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Pipeline + latest resumes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard title="Pipeline tuyển dụng">
          <div className="flex flex-col gap-3.5">
            {statusData.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="font-bold tabular-nums">{s.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(s.value / maxStatus) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Hồ sơ mới nhận"
          linkLabel="Xem tất cả"
          linkTo="/hr/resumes"
          className="lg:col-span-2"
        >
          {data.latestResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Chưa có hồ sơ nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {data.latestResumes.map((r) => (
                <Link
                  key={r._id}
                  to={`/hr/candidates/${r.userId._id}`}
                  className="flex items-center gap-3 rounded-lg py-2 transition-colors hover:bg-accent/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(r.userId.name ?? r.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.userId.name ?? r.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.jobId.name ?? "—"} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${STATUS_META[r.status].badgeClass}`}
                  >
                    {STATUS_META[r.status].label}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Recent jobs */}
      <DashboardCard
        title="Tin tuyển dụng gần đây"
        linkLabel="Quản lý"
        linkTo="/hr/jobs"
      >
        {data.recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Chưa có tin tuyển dụng nào
            </p>
            <Link
              to="/hr/jobs"
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {data.recentJobs.map((j) => (
              <div key={j._id} className="flex items-center gap-3 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{j.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[j.location, j.level, formatDate(j.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    j.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {j.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
