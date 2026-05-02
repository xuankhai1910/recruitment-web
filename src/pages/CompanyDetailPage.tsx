import { Link, useNavigate, useParams } from "react-router-dom";
import { useCompany } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/common/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowLeft,
	Briefcase,
	Building2,
	Mail,
	MapPin,
	Phone,
} from "lucide-react";
import { companyLogoUrl } from "@/lib/format";

export function CompanyDetailPage() {
	const { id = "" } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: company, isLoading } = useCompany(id);
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
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Skeleton className="h-48 rounded-xl" />
				<div className="mt-6 space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-28 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (!company) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-20 text-center">
				<Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
				<h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
					Không tìm thấy công ty
				</h2>
				<Button
					onClick={() => {
						navigate("/companies");
					}}
					className="mt-4 cursor-pointer"
				>
					Xem công ty khác
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<Link
				to="/companies"
				className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" />
				Quay lại danh sách
			</Link>

			{/* Company hero */}
			<Card className="border border-border/60">
				<CardContent className="p-6 sm:p-8">
					<div className="flex flex-col items-start gap-5 sm:flex-row">
						{company.logo ? (
							<img
								src={companyLogoUrl(company.logo)}
								alt={company.name}
								className="h-24 w-24 shrink-0 rounded-2xl object-contain"
							/>
						) : (
							<div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-secondary">
								<Building2 className="h-12 w-12 text-primary/60" />
							</div>
						)}
						<div className="min-w-0 flex-1">
							<h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
								{company.name}
							</h1>
							<p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
								<MapPin className="h-4 w-4 shrink-0" />
								{company.address}
							</p>
							<div className="mt-3 flex items-center gap-1.5 text-sm text-primary">
								<Briefcase className="h-4 w-4" />
								<span className="font-medium">
									{companyJobs.length} việc làm đang tuyển
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Description */}
			{company.description && (
				<Card className="mt-6 border border-border/60">
					<CardContent className="p-6">
						<h2 className="font-heading text-lg font-semibold text-foreground">
							Giới thiệu công ty
						</h2>
						<div
							className="prose prose-sm mt-3 max-w-none text-foreground/90 prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
							dangerouslySetInnerHTML={{ __html: company.description }}
						/>
					</CardContent>
				</Card>
			)}

			{/* Contact info */}
			{(company.email || company.phone) && (
				<Card className="mt-6 border border-border/60">
					<CardContent className="p-6">
						<h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
							Thông tin liên hệ
						</h2>
						<div className="space-y-3">
							{company.email && (
								<div className="flex items-center gap-2.5 text-sm">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<Mail className="h-4 w-4 text-primary" />
									</span>
									<a
										href={`mailto:${company.email}`}
										className="text-primary transition-colors duration-150 hover:underline"
									>
										{company.email}
									</a>
								</div>
							)}
							{company.phone && (
								<div className="flex items-center gap-2.5 text-sm">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<Phone className="h-4 w-4 text-primary" />
									</span>
									<a
										href={`tel:${company.phone}`}
										className="text-primary transition-colors duration-150 hover:underline"
									>
										{company.phone}
									</a>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Jobs */}
			<div className="mt-6">
				<h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
					Việc làm tại {company.name}
				</h2>
				{jobsLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className="h-28 rounded-xl" />
						))}
					</div>
				) : companyJobs.length === 0 ? (
					<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-card py-16">
						<Briefcase className="h-10 w-10 text-muted-foreground/40" />
						<p className="text-muted-foreground">
							Công ty chưa có tin tuyển dụng nào
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{companyJobs.map((job) => (
							<JobCard key={job._id} job={job} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
