import { Building2, Users, Briefcase, FileText } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import { useJobs } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const { data: companies } = useCompanies({ current: 1, pageSize: 1 });
  const { data: users } = useUsers({ current: 1, pageSize: 1 });
  const { data: jobs } = useJobs({ current: 1, pageSize: 1 });
  const { data: resumes } = useResumes({ current: 1, pageSize: 1 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-6 w-6" />}
          label="Công ty"
          total={companies?.meta.total}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Người dùng"
          total={users?.meta.total}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={<Briefcase className="h-6 w-6" />}
          label="Công việc"
          total={jobs?.meta.total}
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Hồ sơ"
          total={resumes?.meta.total}
          color="bg-purple-50 text-purple-700"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  total,
  color,
}: {
  icon: ReactNode;
  label: string;
  total?: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 transition-shadow duration-150 hover:shadow-md">
      <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${color}`}>
        {icon}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight">
        {total !== undefined ? total.toLocaleString("vi-VN") : "--"}
      </p>
    </div>
  );
}
