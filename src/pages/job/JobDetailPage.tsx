import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
	Bookmark,
	Briefcase,
	Building2,
	Calendar,
	ChevronRight,
	Clock,
	DollarSign,
	Mail,
	MapPin,
	Phone,
	Send,
	Sparkles,
	Users,
} from "lucide-react";

import { useJob, useSimilarJobs } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompanies";
import { useAuthStore } from "@/stores/auth.store";
import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyModal } from "@/components/common/ApplyModal";
import { JobCard } from "@/components/common/JobCard";
import { LoginRequiredDialog } from "@/components/dialog/LoginRequiredDialog";
import {
	companyLogoUrl,
	formatJobSalary,
	formatYearsOfExperience,
} from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { ui } from "@/lib/ui";

const SIMILAR_KEYS = ["s1", "s2", "s3"];

const sectionCls = "mb-5 rounded-xl border border-line bg-white p-8";
const sectionH3 = "mb-4 font-display text-[22px] font-bold tracking-tight text-ink";
const bulletLi =
	"relative pl-6 text-[15px] leading-7 text-slate-700 before:absolute before:left-0 before:top-[11px] before:h-0.5 before:w-3 before:rounded-sm before:bg-teal-500";
const asideCard = "rounded-xl border border-line bg-white p-6";
const asideH4 =
	"mb-4 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600";
const metaDl = "grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm";

export function JobDetailPage() {
	const { id = "" } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: job, isLoading } = useJob(id);
	const { data: company } = useCompany(job?.company._id ?? "");
	const { data: similarJobs, isLoading: isLoadingSimilar } = useSimilarJobs(id);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const { data: savedCheck } = useCheckSaved(isAuthenticated ? id : "");
	const toggleSave = useToggleSaveJob();
	const saved = savedCheck ?? false;
	const [applyOpen, setApplyOpen] = useState(false);
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);

	const handleToggleSave = () => {
		if (!isAuthenticated) {
			toast.error("Đăng nhập để lưu việc làm");
			return;
		}
		toggleSave.mutate(id);
	};

	const handleApply = () => {
		if (!isAuthenticated) {
			setLoginDialogOpen(true);
			return;
		}
		setApplyOpen(true);
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-[1280px] px-7 py-12">
				<Skeleton className="h-72 rounded-xl" />
				<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			</div>
		);
	}

	if (!job) {
		return (
			<div className="mx-auto max-w-[1280px] px-7 py-8">
				<div className={ui.empty}>
					<div className={ui.emptyIcon}>
						<Briefcase className="h-7 w-7" />
					</div>
					<h3 className="mb-2 text-xl font-semibold text-ink">
						Không tìm thấy công việc
					</h3>
					<p className="max-w-[380px] text-sm text-slate-600">
						Công việc có thể đã được gỡ xuống hoặc không tồn tại.
					</p>
					<button className={ui.btnPrimary + " mt-5"} onClick={() => navigate("/jobs")}>
						Xem việc làm khác
					</button>
				</div>
			</div>
		);
	}

	const logo = companyLogoUrl(job.company?.logo);
	const co = job.company;
	const addr = company?.address;
	const posted = job.createdAt
		? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })
		: "";

	const detailSections: Array<{ title: string; items: string[] }> = [];
	if (job.responsibilities?.length)
		detailSections.push({ title: "Trách nhiệm chính", items: job.responsibilities });
	if (job.requirements?.length)
		detailSections.push({ title: "Yêu cầu công việc", items: job.requirements });
	if (job.benefits?.length)
		detailSections.push({ title: "Quyền lợi", items: job.benefits });

	return (
		<>
			<div className="relative overflow-hidden bg-ink text-white">
				<div className="mx-auto max-w-[1280px] px-7 pb-14 pt-12">
					<div className="mb-7 flex items-center gap-2 text-[13px] text-white/50">
						<Link to="/jobs" className="text-white/70 hover:text-white">
							Việc làm
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{co.name}</span>
					</div>
					<div className="flex flex-wrap items-start gap-6">
						{logo ? (
							<div className="grid h-22 w-22 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10">
								<img src={logo} alt={co.name} className="h-full w-full bg-white object-contain" />
							</div>
						) : (
							<div
								className="grid h-22 w-22 shrink-0 place-items-center rounded-xl border border-white/10 font-display text-3xl font-bold text-white"
								style={{ background: brandColor(co.name) }}
							>
								{brandShort(co.name)}
							</div>
						)}
						<div className="min-w-[280px] flex-1">
							<Link
								to={`/companies/${co._id}`}
								className="mb-3 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-teal-400 after:h-px after:w-3.5 after:bg-teal-400/50 after:content-['']"
							>
								{co.name}
							</Link>
							<h1 className="mb-5 font-display text-[clamp(32px,5vw,48px)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
								{job.name}
							</h1>
							<div className="mb-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/80">
								<span className="inline-flex items-center gap-2">
									<MapPin className="h-4 w-4 text-teal-400" />
									{job.location}
								</span>
								<span className="inline-flex items-center gap-2">
									<Briefcase className="h-4 w-4 text-teal-400" />
									<b className="font-display text-[15px] font-semibold text-white">{job.level}</b>
								</span>
								<span className="inline-flex items-center gap-2">
									<DollarSign className="h-4 w-4 text-teal-400" />
									<b className="font-display text-[15px] font-semibold text-white">
										{formatJobSalary(job.salary)}
									</b>
								</span>
								{posted && (
									<span className="inline-flex items-center gap-2">
										<Clock className="h-4 w-4 text-teal-400" />
										{posted}
									</span>
								)}
								<span className="inline-flex items-center gap-2">
									<Users className="h-4 w-4 text-teal-400" />
									<b className="font-display text-[15px] font-semibold text-white">{job.quantity}</b> vị trí
								</span>
							</div>
							<div className="flex flex-wrap gap-3">
								<button
									className="inline-flex h-13 items-center gap-2 rounded-lg bg-teal-500 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
									onClick={handleApply}
									disabled={!job.isActive}
								>
									<Send className="h-[18px] w-[18px]" />
									Ứng tuyển ngay
								</button>
								<button
									className="inline-flex h-13 items-center gap-2 rounded-lg border border-white/20 bg-transparent px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
									onClick={handleToggleSave}
									disabled={toggleSave.isPending}
								>
									<Bookmark className="h-[18px] w-[18px]" />
									{saved ? "Đã lưu" : "Lưu việc"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-7 py-14 lg:grid-cols-[1fr_360px]">
				<div>
					{job.description && (
						<div className={sectionCls}>
							<h3 className={sectionH3}>Mô tả công việc</h3>
							<div className={ui.richtext} dangerouslySetInnerHTML={{ __html: job.description }} />
						</div>
					)}

					{detailSections.map((section) => (
						<div className={sectionCls} key={section.title}>
							<h3 className={sectionH3}>{section.title}</h3>
							<ul className="space-y-2.5">
								{section.items.map((item) => (
									<li key={item} className={bulletLi}>
										{item}
									</li>
								))}
							</ul>
						</div>
					))}

					{job.skills && job.skills.length > 0 && (
						<div className={sectionCls}>
							<h3 className={sectionH3}>Kỹ năng yêu cầu</h3>
							<div className="flex flex-wrap gap-2">
								{job.skills.map((s) => (
									<span
										key={s}
										className="inline-flex rounded-full border-[1.5px] border-ink px-3.5 py-2 font-mono-jb text-[13px] font-semibold text-ink"
									>
										{s}
									</span>
								))}
							</div>
						</div>
					)}

					<div className={sectionCls}>
						<h3 className={sectionH3 + " flex items-center gap-2"}>
							<Sparkles className="h-[18px] w-[18px] text-teal-500" />
							Việc làm tương tự
						</h3>
						{isLoadingSimilar ? (
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
								{SIMILAR_KEYS.map((k) => (
									<Skeleton key={k} className="h-60 rounded-xl" />
								))}
							</div>
						) : similarJobs && similarJobs.length > 0 ? (
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
								{similarJobs.slice(0, 6).map((j) => (
									<JobCard key={j._id} job={j} variant="default" />
								))}
							</div>
						) : (
							<p className="text-[15px] text-slate-600">Chưa có việc làm tương tự.</p>
						)}
					</div>
				</div>

				<aside className="flex flex-col gap-5">
					<div className={asideCard}>
						<div className="mb-4 flex items-center gap-3">
							{logo ? (
								<div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg">
									<img src={logo} alt={co.name} className="h-full w-full bg-white object-contain" />
								</div>
							) : (
								<div
									className="grid h-11 w-11 shrink-0 place-items-center rounded-lg font-display text-[13px] font-bold text-white"
									style={{ background: brandColor(co.name) }}
								>
									{brandShort(co.name)}
								</div>
							)}
							<div className="min-w-0">
								<div className="font-display text-base font-semibold text-ink">{co.name}</div>
								{addr && (
									<div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
										<MapPin className="h-[11px] w-[11px]" />
										<span className="truncate">{addr}</span>
									</div>
								)}
							</div>
						</div>
						<Link to={`/companies/${co._id}`} className={ui.btnOutline + " w-full"}>
							<Building2 className="h-4 w-4" />
							Xem trang công ty
						</Link>
						{(company?.email || company?.phone) && (
							<div className="mt-4 flex flex-col gap-2 border-t border-line-soft pt-3">
								{company?.email && (
									<a href={`mailto:${company.email}`} className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-ink">
										<Mail className="h-3.5 w-3.5" />
										<span className="truncate">{company.email}</span>
									</a>
								)}
								{company?.phone && (
									<a href={`tel:${company.phone}`} className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-ink">
										<Phone className="h-3.5 w-3.5" />
										{company.phone}
									</a>
								)}
							</div>
						)}
					</div>

					<div className={asideCard}>
						<h4 className={asideH4}>Tổng quan</h4>
						<dl className={metaDl}>
							<dt className="text-slate-400">Cấp bậc</dt>
							<dd className="text-right font-medium text-ink">{job.level}</dd>
							{job.jobType && (
								<>
									<dt className="text-slate-400">Loại hình</dt>
									<dd className="text-right font-medium text-ink">{job.jobType}</dd>
								</>
							)}
							{job.workMode && (
								<>
									<dt className="text-slate-400">Hình thức</dt>
									<dd className="text-right font-medium text-ink">{job.workMode}</dd>
								</>
							)}
							<dt className="text-slate-400">Lương</dt>
							<dd className="text-right font-medium text-ink">{formatJobSalary(job.salary)}</dd>
							<dt className="text-slate-400">Số lượng</dt>
							<dd className="text-right font-medium text-ink">{job.quantity} vị trí</dd>
							{formatYearsOfExperience(job.yearsOfExperience) && (
								<>
									<dt className="text-slate-400">Kinh nghiệm</dt>
									<dd className="text-right font-medium text-ink">
										{formatYearsOfExperience(job.yearsOfExperience)}
									</dd>
								</>
							)}
						</dl>
					</div>

					<div className={asideCard}>
						<h4 className={asideH4}>Thời gian</h4>
						<dl className={metaDl}>
							{posted && (
								<>
									<dt className="text-slate-400">Đăng tuyển</dt>
									<dd className="text-right font-medium text-ink">{posted}</dd>
								</>
							)}
							<dt className="text-slate-400">Bắt đầu</dt>
							<dd className="inline-flex items-center justify-end gap-1.5 text-right font-medium text-ink">
								<Calendar className="h-3 w-3" />
								{format(new Date(job.startDate), "dd/MM/yyyy")}
							</dd>
							<dt className="text-slate-400">Hạn nộp</dt>
							<dd className="text-right font-medium text-ink">
								{format(new Date(job.endDate), "dd/MM/yyyy")}
							</dd>
						</dl>
					</div>
				</aside>
			</div>

			<ApplyModal open={applyOpen} onOpenChange={setApplyOpen} job={job} />
			<LoginRequiredDialog
				open={loginDialogOpen}
				onOpenChange={setLoginDialogOpen}
				description="Bạn cần đăng nhập để ứng tuyển công việc này."
			/>
		</>
	);
}
