import { Building2, Users, Briefcase, FileText, Calendar } from "lucide-react";
import { useAdminOverview } from "@/hooks/useStats";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AreaChart } from "@/components/dashboard/charts/AreaChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { HBars } from "@/components/dashboard/charts/HBars";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STATUS_META,
  STATUS_ORDER,
  LEVEL_COLORS,
  ROLE_COLORS,
} from "@/components/dashboard/status-meta";
import { LEVEL_LIST, formatWeekLabel } from "@/lib/constants";

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1][0] + (parts[0][0] ?? "")).toUpperCase();
}

const today = new Date().toLocaleDateString("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function DashboardPage() {
  const { data, isLoading } = useAdminOverview();

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
  const levelData = LEVEL_LIST.map((l) => ({
    label: l,
    value: data.jobByLevel[l] ?? 0,
    color: LEVEL_COLORS[l],
  }));
  const roleData = data.userByRole.map((r) => ({
    label: r.name,
    value: r.value,
    color: ROLE_COLORS[r.name] ?? "#94A3B8",
  }));
  const moduleData = data.permByModule.slice(0, 6).map((m) => ({
    label: m.module,
    value: m.value,
    color: "#3B82F6",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan toàn hệ thống DevMarket · cập nhật {today}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            30 ngày qua
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Building2 className="h-6 w-6" />}
          iconClass="bg-blue-50 text-blue-700"
          label="Công ty"
          value={data.totals.companies}
          spark={data.sparks.companies}
          sparkColor="#3B82F6"
          deltaText={`+${data.new30.companies} trong 30 ngày`}
          deltaUp
        />
        <KpiCard
          icon={<Users className="h-6 w-6" />}
          iconClass="bg-violet-50 text-violet-700"
          label="Người dùng"
          value={data.totals.users.toLocaleString("vi-VN")}
          spark={data.sparks.users}
          sparkColor="#8B5CF6"
          deltaText={`+${data.new30.users} trong 30 ngày`}
          deltaUp
        />
        <KpiCard
          icon={<Briefcase className="h-6 w-6" />}
          iconClass="bg-amber-50 text-amber-700"
          label="Công việc"
          value={data.totals.jobs}
          spark={data.sparks.jobs}
          sparkColor="#F59E0B"
          deltaText={`+${data.new30.jobs} trong 30 ngày`}
          deltaUp
        />
        <KpiCard
          icon={<FileText className="h-6 w-6" />}
          iconClass="bg-emerald-50 text-emerald-700"
          label="Hồ sơ"
          value={data.totals.resumes}
          spark={data.sparks.resumes}
          sparkColor="#10B981"
          deltaText={`+${data.new30.resumes} trong 30 ngày`}
          deltaUp
        />
      </div>

      {/* Charts row 1 — area + donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Hồ sơ & tin tuyển dụng theo tuần"
          className="lg:col-span-2"
        >
          <div className="mb-2.5 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              Hồ sơ nộp
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              Tin đăng mới
            </span>
          </div>
          <AreaChart
            labels={labels}
            height={210}
            series={[
              {
                label: "Hồ sơ nộp",
                values: data.series.resumes,
                color: "#3B82F6",
              },
              {
                label: "Tin đăng mới",
                values: data.series.jobs,
                color: "#10B981",
              },
            ]}
          />
        </DashboardCard>

        <DashboardCard title="Phân loại hồ sơ">
          <div className="flex flex-col items-center gap-4">
            <DonutChart
              data={statusData}
              centerValue={data.totals.resumes}
              centerLabel="tổng hồ sơ"
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

      {/* Charts row 2 — bar + two distributions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <DashboardCard title="Công việc theo cấp độ" className="lg:col-span-2">
          <BarChart data={levelData} height={200} />
        </DashboardCard>
        <DashboardCard title="Người dùng theo vai trò">
          <HBars data={roleData} />
        </DashboardCard>
        <DashboardCard title="Quyền hạn theo module">
          <HBars data={moduleData} />
        </DashboardCard>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard
          title="Tin tuyển dụng mới nhất"
          linkLabel="Xem tất cả"
          linkTo="/admin/job"
        >
          <div className="flex flex-col gap-1">
            {data.recentJobs.map((j) => (
              <div key={j._id} className="flex items-center gap-3 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {initials(j.company.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{j.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {j.company.name}
                    {j.location ? ` · ${j.location}` : ""}
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
                  {j.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </Badge>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Người dùng mới"
          linkLabel="Xem tất cả"
          linkTo="/admin/user"
        >
          <div className="flex flex-col gap-1">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  {initials(u.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {u.role.name ?? "—"}
                </Badge>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
