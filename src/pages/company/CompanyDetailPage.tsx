import { Link, useNavigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCompany } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/common/job-card/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { companyLogoUrl } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { ui } from "@/lib/ui";

export function CompanyDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompany(id);
  useDocumentTitle(company?.name);
  const { data: jobsData, isLoading: jobsLoading } = useJobs({
    current: 1,
    pageSize: 20,
    sort: "-createdAt",
    isActive: true,
    "company._id": id,
  });

  const companyJobs = jobsData?.result ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-7 py-12">
        <Skeleton className="h-48 rounded-xl" />
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-[1280px] px-7 py-8">
        <div className={ui.empty}>
          <div className={ui.emptyIcon}>
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-ink">
            Không tìm thấy công ty
          </h3>
          <p className="max-w-[380px] text-sm text-slate-600">
            Công ty có thể đã bị gỡ hoặc không tồn tại.
          </p>
          <button
            className={ui.btnPrimary + " mt-5"}
            onClick={() => navigate("/companies")}
          >
            Xem công ty khác
          </button>
        </div>
      </div>
    );
  }

  const logo = companyLogoUrl(company.logo);

  return (
    <>
      <div className="relative overflow-hidden bg-ink text-white">
        <div className="mx-auto max-w-[1280px] px-7 py-12">
          <div className="mb-5 flex items-center gap-2 text-[13px] text-white/50">
            <Link to="/companies" className="text-white/70 hover:text-white">
              Công ty
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{company.name}</span>
          </div>
          <div className="flex flex-wrap items-start gap-7">
            {logo ? (
              <div className="grid h-30 w-30 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10">
                <img
                  src={logo}
                  alt={company.name}
                  className="h-full w-full bg-white object-contain"
                />
              </div>
            ) : (
              <div
                className="grid h-30 w-30 shrink-0 place-items-center rounded-xl border border-white/10 font-display text-4xl font-bold text-white"
                style={{ background: brandColor(company.name) }}
              >
                {brandShort(company.name)}
              </div>
            )}
            <div className="min-w-[280px] flex-1">
              <h1 className="mb-4 font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
                {company.name}
              </h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-white/75">
                {company.address && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-teal-400" />
                    {company.address}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-teal-400" />
                  {companyJobs.length} việc đang tuyển
                </span>
                {company.email && (
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-teal-400" />
                    {company.email}
                  </span>
                )}
                {company.phone && (
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-teal-400" />
                    {company.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-7 py-14 lg:grid-cols-[1fr_360px]">
        <div>
          <section className="mb-5 rounded-xl border border-line bg-white p-8">
            <h3 className="mb-4 font-display text-[22px] font-bold tracking-tight text-ink">
              Giới thiệu công ty
            </h3>
            {company.description ? (
              <div
                className={ui.richtext}
                dangerouslySetInnerHTML={{ __html: company.description }}
              />
            ) : (
              <p className="text-[15px] leading-7 text-slate-700">
                Công ty chưa có thông tin giới thiệu.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-line bg-white p-8">
            <h3 className="mb-4 font-display text-[22px] font-bold tracking-tight text-ink">
              Việc đang tuyển ({companyJobs.length})
            </h3>
            {jobsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : companyJobs.length === 0 ? (
              <div className={ui.empty + " py-10"}>
                <div className={ui.emptyIcon}>
                  <Briefcase className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-ink">
                  Chưa có tin tuyển dụng
                </h3>
                <p className="max-w-[380px] text-sm text-slate-600">
                  Công ty chưa đăng tin tuyển dụng nào.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {companyJobs.map((job) => (
                  <JobCard key={job._id} job={job} variant="row" />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-white p-6">
            <h4 className="mb-4 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Thông tin
            </h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              {company.address && (
                <>
                  <dt className="text-slate-400">Trụ sở</dt>
                  <dd className="text-right font-medium text-ink">
                    {company.address}
                  </dd>
                </>
              )}
              <dt className="text-slate-400">Việc đang tuyển</dt>
              <dd className="text-right font-medium text-ink">
                {companyJobs.length}
              </dd>
              {company.email && (
                <>
                  <dt className="text-slate-400">Email</dt>
                  <dd className="break-all text-right font-medium text-ink">
                    {company.email}
                  </dd>
                </>
              )}
              {company.phone && (
                <>
                  <dt className="text-slate-400">Điện thoại</dt>
                  <dd className="text-right font-medium text-ink">
                    {company.phone}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
