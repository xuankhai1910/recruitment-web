import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyModal } from "@/components/common/ApplyModal";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Send,
  Users,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatSalary } from "@/lib/constants";
import { companyLogoUrl } from "@/lib/format";

export function JobDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(id);
  const [applyOpen, setApplyOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
          Không tìm thấy công việc
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Công việc có thể đã được gỡ xuống hoặc không tồn tại.
        </p>
        <Button
          onClick={() => {
            navigate("/jobs");
          }}
          className="mt-4 cursor-pointer"
        >
          Xem việc làm khác
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to="/jobs"
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Header card */}
          <Card className="border border-border/60">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {job.company?.logo ? (
                  <img
                    src={companyLogoUrl(job.company.logo)}
                    alt={job.company.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Building2 className="h-8 w-8 text-primary/60" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                    {job.name}
                  </h1>
                  <Link
                    to={`/companies/${job.company._id}`}
                    className="mt-1 inline-block cursor-pointer text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                  >
                    {job.company.name}
                  </Link>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Đăng {" "}
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-[#22C55E]/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
                    <Banknote className="h-3.5 w-3.5" />
                    Mức lương
                  </div>
                  <p className="mt-1 font-heading text-sm font-bold text-[#16A34A]">
                    {formatSalary(job.salary)}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Địa điểm
                  </div>
                  <p className="mt-1 line-clamp-1 font-heading text-sm font-semibold text-foreground">
                    {job.location}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    Cấp bậc
                  </div>
                  <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                    {job.level}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Số lượng
                  </div>
                  <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                    {job.quantity}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {job.skills?.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="border-primary/30 bg-primary/5 font-normal text-primary"
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={() => {
                  setApplyOpen(true);
                }}
                className="mt-5 w-full cursor-pointer bg-[#22C55E] text-white transition-colors duration-200 hover:bg-[#16A34A] sm:w-auto"
                size="lg"
                disabled= {!job.isActive}
              >
                <Send className="mr-2 h-4 w-4" />
                Ứng tuyển ngay
              </Button>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border border-border/60">
            <CardContent className="p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Mô tả công việc
              </h2>
              <div
                className="prose prose-sm mt-3 max-w-none text-foreground/90 prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="border border-border/60">
            <CardContent className="p-5">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Thông tin chung
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Bắt đầu
                  </dt>
                  <dd className="text-foreground">
                    {format(new Date(job.startDate), "dd/MM/yyyy")}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Kết thúc
                  </dt>
                  <dd className="text-foreground">
                    {format(new Date(job.endDate), "dd/MM/yyyy")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardContent className="p-5">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Công ty
              </h3>
              <Link
                to={`/companies/${job.company._id}`}
                className="mt-3 flex cursor-pointer items-center gap-3 transition-opacity duration-150 hover:opacity-80"
              >
                {job.company?.logo ? (
                  <img
                    src={companyLogoUrl(job.company.logo)}
                    alt={job.company.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Building2 className="h-6 w-6 text-primary/60" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-1 font-heading text-sm font-semibold text-foreground">
                    {job.company.name}
                  </p>
                  <p className="mt-0.5 text-xs text-primary">
                    Xem hồ sơ công ty →
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ApplyModal open={applyOpen} onOpenChange={setApplyOpen} job={job} />
    </div>
  );
}
