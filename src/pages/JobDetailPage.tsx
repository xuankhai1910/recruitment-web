import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useJob, useSimilarJobs } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompanies";
import { useAuthStore } from "@/stores/auth.store";
import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyModal } from "@/components/common/ApplyModal";
import { JobCard } from "@/components/common/JobCard";
import { toast } from "sonner";
import {
	ArrowLeft,
	Banknote,
	Bookmark,
	BookmarkCheck,
	Briefcase,
	Building2,
	Calendar,
	Clock,
	Mail,
	MapPin,
	Phone,
	Send,
	Sparkles,
	Users,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatSalary } from "@/lib/constants";
import { companyLogoUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIMILAR_JOB_SKELETON_KEYS = [
	"similar-job-sk-1",
	"similar-job-sk-2",
	"similar-job-sk-3",
	"similar-job-sk-4",
];

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

	const handleToggleSave = () => {
		if (!isAuthenticated) {
			toast.error("Đăng nhập để lưu việc làm");
			return;
		}
		toggleSave.mutate(id);
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<Skeleton className="h-96 rounded-lg" />
					<Skeleton className="h-64 rounded-lg" />
				</div>
			</div>
		);
	}

	if (!job) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-20 text-center">
				<Briefcase className="mx-auto h-12 w-12 text-slate-300" />
				<h2 className="mt-4 text-xl font-semibold text-slate-900">
					Không tìm thấy công việc
				</h2>
				<p className="mt-1 text-sm text-slate-500">
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
				className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 hover:text-blue-600"
			>
				<ArrowLeft className="h-4 w-4" />
				Quay lại danh sách
			</Link>

			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				{/* Main */}
				<div className="space-y-6">
					{/* Header card */}
					<Card className="rounded-xl border-slate-200">
						<CardContent className="p-5 sm:p-6">
							<div className="flex items-start gap-4">
								{job.company?.logo ? (
									<img
										src={companyLogoUrl(job.company.logo)}
										alt={job.company.name}
										className="h-14 w-14 shrink-0 rounded-md border border-slate-200 bg-white object-contain p-1"
									/>
								) : (
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
										<Building2 className="h-6 w-6 text-slate-400" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<h1 className="text-xl font-bold leading-tight text-slate-900">
										{job.name}
									</h1>
									<Link
										to={`/companies/${job.company._id}`}
										className="mt-1 inline-block cursor-pointer text-sm text-slate-500 transition-colors duration-150 hover:text-blue-600"
									>
										{job.company.name}
									</Link>
									<div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
										<Clock className="h-3 w-3" />
										Đăng{" "}
										{formatDistanceToNow(new Date(job.createdAt), {
											addSuffix: true,
											locale: vi,
										})}
									</div>
								</div>
							</div>

							<div className="mt-5 flex flex-wrap gap-2">
								{job.skills?.map((s) => (
									<Badge
										key={s}
										variant="secondary"
										className="rounded-md bg-blue-50 font-normal text-blue-700 hover:bg-blue-50"
									>
										{s}
									</Badge>
								))}
							</div>

							<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
								<div>
									<div className="flex items-center gap-1.5 text-xs text-slate-500">
										<Banknote className="h-3.5 w-3.5" />
										Mức lương
									</div>
									<p className="mt-0.5 text-lg font-bold text-blue-600">
										{formatSalary(job.salary)}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Button
										onClick={() => {
											setApplyOpen(true);
										}}
										className="cursor-pointer bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700"
										size="lg"
										disabled={!job.isActive}
									>
										<Send className="mr-2 h-4 w-4" />
										Ứng tuyển ngay
									</Button>
									<Button
										onClick={handleToggleSave}
										disabled={toggleSave.isPending}
										variant="outline"
										size="lg"
										className={cn(
											"cursor-pointer border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700",
											saved &&
												"border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600",
										)}
									>
										{saved ? (
											<>
												<BookmarkCheck className="mr-2 h-4 w-4" />
												Đã lưu
											</>
										) : (
											<>
												<Bookmark className="mr-2 h-4 w-4" />
												Lưu việc làm
											</>
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Description */}
					<Card className="rounded-xl border-slate-200">
						<CardContent className="p-5 sm:p-6">
							<h2 className="text-base font-semibold text-slate-900">
								Mô tả công việc
							</h2>
							<div
								className="prose prose-sm mt-3 max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-blue-600 prose-strong:text-slate-900 prose-ul:my-2 prose-ol:my-2"
								dangerouslySetInnerHTML={{ __html: job.description }}
							/>
						</CardContent>
					</Card>

					{/* Similar Jobs */}
					<Card className="rounded-xl border-slate-200">
						<CardContent className="p-5 sm:p-6">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-blue-600" />
								<h2 className="text-base font-semibold text-slate-900">
									Việc làm tương tự
								</h2>
							</div>
							{isLoadingSimilar ? (
								<div className="mt-4 grid gap-4 lg:grid-cols-2">
									{SIMILAR_JOB_SKELETON_KEYS.map((key) => (
										<Skeleton key={key} className="h-52 rounded-xl" />
									))}
								</div>
							) : similarJobs && similarJobs.length > 0 ? (
								<div className="mt-4 grid gap-4 lg:grid-cols-2">
									{similarJobs.slice(0, 6).map((j) => (
										<JobCard key={j._id} job={j} variant="card" />
									))}
								</div>
							) : (
								<p className="mt-3 text-sm text-slate-500">
									Chưa có việc làm tương tự.
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
					<Card className="rounded-xl border-slate-200">
						<CardContent className="p-5">
							<h3 className="text-sm font-semibold text-slate-900">
								Thông tin chung
							</h3>
							<dl className="mt-3 space-y-2.5 text-sm">
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-slate-500">
										<MapPin className="h-3.5 w-3.5" />
										Địa điểm
									</dt>
									<dd className="font-medium text-slate-900">{job.location}</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-slate-500">
										<Briefcase className="h-3.5 w-3.5" />
										Cấp bậc
									</dt>
									<dd className="font-medium text-slate-900">{job.level}</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-slate-500">
										<Users className="h-3.5 w-3.5" />
										Số lượng
									</dt>
									<dd className="font-medium text-slate-900">{job.quantity}</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-slate-500">
										<Calendar className="h-3.5 w-3.5" />
										Bắt đầu
									</dt>
									<dd className="text-slate-900">
										{format(new Date(job.startDate), "dd/MM/yyyy")}
									</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-slate-500">
										<Calendar className="h-3.5 w-3.5" />
										Kết thúc
									</dt>
									<dd className="text-slate-900">
										{format(new Date(job.endDate), "dd/MM/yyyy")}
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					<Card className="rounded-xl border-slate-200">
						<CardContent className="p-5">
							<h3 className="text-sm font-semibold text-slate-900">Công ty</h3>
							<Link
								to={`/companies/${job.company._id}`}
								className="mt-3 flex cursor-pointer items-center gap-3 transition-opacity duration-150 hover:opacity-80"
							>
								{job.company?.logo ? (
									<img
										src={companyLogoUrl(job.company.logo)}
										alt={job.company.name}
										className="h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white object-contain p-1"
									/>
								) : (
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
										<Building2 className="h-5 w-5 text-slate-400" />
									</div>
								)}
								<div className="min-w-0">
									<p className="line-clamp-1 text-sm font-semibold text-slate-900">
										{job.company.name}
									</p>
									<p className="mt-0.5 text-xs text-blue-600">
										Xem hồ sơ công ty →
									</p>
								</div>
							</Link>

							{(company?.email || company?.phone) && (
								<div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
									{company?.email && (
										<a
											href={`mailto:${company.email}`}
											className="flex items-center gap-2 text-sm text-slate-600 transition-colors duration-150 hover:text-blue-600"
										>
											<Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
											<span className="truncate">{company.email}</span>
										</a>
									)}
									{company?.phone && (
										<a
											href={`tel:${company.phone}`}
											className="flex items-center gap-2 text-sm text-slate-600 transition-colors duration-150 hover:text-blue-600"
										>
											<Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
											{company.phone}
										</a>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</aside>
			</div>

			<ApplyModal open={applyOpen} onOpenChange={setApplyOpen} job={job} />
		</div>
	);
}
