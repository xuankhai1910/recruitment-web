import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompanies";
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
	Mail,
	MapPin,
	Phone,
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
	const { data: company } = useCompany(job?.company._id ?? "");
	const [applyOpen, setApplyOpen] = useState(false);

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
					<Card>
						<CardContent className="p-5 sm:p-6">
							<div className="flex items-start gap-4">
								{job.company?.logo ? (
									<img
										src={companyLogoUrl(job.company.logo)}
										alt={job.company.name}
										className="h-16 w-16 shrink-0 rounded-md border border-border bg-white object-contain p-1"
									/>
								) : (
									<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
										<Building2 className="h-7 w-7 text-muted-foreground" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<h1 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">
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
										className="rounded-md bg-primary/5 font-normal text-primary hover:bg-primary/5"
									>
										{s}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Description */}
					<Card>
						<CardContent className="p-5 sm:p-6">
							<h2 className="font-heading text-base font-semibold text-foreground">
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
				<aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
					{/* Apply CTA */}
					<Card>
						<CardContent className="p-5">
							<div className="space-y-3">
								<div>
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<Banknote className="h-3.5 w-3.5" />
										Mức lương
									</div>
									<p className="mt-0.5 font-heading text-lg font-bold text-[#16A34A]">
										{formatSalary(job.salary)}
									</p>
								</div>
								<Button
									onClick={() => {
										setApplyOpen(true);
									}}
									className="w-full cursor-pointer bg-[#22C55E] text-white transition-colors duration-150 hover:bg-[#16A34A]"
									size="lg"
									disabled={!job.isActive}
								>
									<Send className="mr-2 h-4 w-4" />
									Ứng tuyển ngay
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-5">
							<h3 className="font-heading text-sm font-semibold text-foreground">
								Thông tin chung
							</h3>
							<dl className="mt-3 space-y-2.5 text-sm">
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-muted-foreground">
										<MapPin className="h-3.5 w-3.5" />
										Địa điểm
									</dt>
									<dd className="font-medium text-foreground">
										{job.location}
									</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-muted-foreground">
										<Briefcase className="h-3.5 w-3.5" />
										Cấp bậc
									</dt>
									<dd className="font-medium text-foreground">{job.level}</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-muted-foreground">
										<Users className="h-3.5 w-3.5" />
										Số lượng
									</dt>
									<dd className="font-medium text-foreground">
										{job.quantity}
									</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="flex items-center gap-1.5 text-muted-foreground">
										<Calendar className="h-3.5 w-3.5" />
										Bắt đầu
									</dt>
									<dd className="text-foreground">
										{format(new Date(job.startDate), "dd/MM/yyyy")}
									</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
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

					<Card>
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
										className="h-12 w-12 shrink-0 rounded-md border border-border bg-white object-contain p-1"
									/>
								) : (
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
										<Building2 className="h-5 w-5 text-muted-foreground" />
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

							{(company?.email || company?.phone) && (
								<div className="mt-4 space-y-2 border-t border-border pt-3">
									{company?.email && (
										<a
											href={`mailto:${company.email}`}
											className="flex items-center gap-2 text-sm text-foreground/80 transition-colors duration-150 hover:text-primary"
										>
											<Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
											<span className="truncate">{company.email}</span>
										</a>
									)}
									{company?.phone && (
										<a
											href={`tel:${company.phone}`}
											className="flex items-center gap-2 text-sm text-foreground/80 transition-colors duration-150 hover:text-primary"
										>
											<Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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
