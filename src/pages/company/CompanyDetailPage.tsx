import { Link, useNavigate, useParams } from "react-router-dom";
import { useCompany } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/common/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
				<Skeleton className="h-40 rounded-lg" />
				<div className="mt-6 space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-lg" />
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

			{/* Hero banner */}
			<Card>
				<CardContent className="p-5 sm:p-6">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
						{company.logo ? (
							<img
								src={companyLogoUrl(company.logo)}
								alt={company.name}
								className="h-20 w-20 shrink-0 rounded-md border border-border bg-white object-contain p-1.5"
							/>
						) : (
							<div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
								<Building2 className="h-10 w-10 text-muted-foreground" />
							</div>
						)}
						<div className="min-w-0 flex-1">
							<h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
								{company.name}
							</h1>
							<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<MapPin className="h-3.5 w-3.5 shrink-0" />
									{company.address}
								</span>
								<span className="inline-flex items-center gap-1.5 text-primary">
									<Briefcase className="h-3.5 w-3.5" />
									<span className="font-medium">
										{companyJobs.length} việc làm đang tuyển
									</span>
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="jobs" className="mt-6">
				<TabsList>
					<TabsTrigger value="jobs" className="cursor-pointer">
						Việc làm ({companyJobs.length})
					</TabsTrigger>
					<TabsTrigger value="about" className="cursor-pointer">
						Giới thiệu
					</TabsTrigger>
				</TabsList>

				<TabsContent value="jobs" className="mt-4">
					{jobsLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-24 rounded-lg" />
							))}
						</div>
					) : companyJobs.length === 0 ? (
						<div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-16">
							<Briefcase className="h-10 w-10 text-muted-foreground/40" />
							<p className="text-muted-foreground">
								Công ty chưa có tin tuyển dụng nào
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{companyJobs.map((job) => (
								<JobCard key={job._id} job={job} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="about" className="mt-4 space-y-4">
					{company.description ? (
						<Card>
							<CardContent className="p-5 sm:p-6">
								<h2 className="font-heading text-base font-semibold text-foreground">
									Giới thiệu công ty
								</h2>
								<div
									className="prose prose-sm mt-3 max-w-none text-foreground/90 prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
									dangerouslySetInnerHTML={{ __html: company.description }}
								/>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-5 text-sm text-muted-foreground">
								Công ty chưa có thông tin giới thiệu.
							</CardContent>
						</Card>
					)}

					{(company.email || company.phone) && (
						<Card>
							<CardContent className="p-5 sm:p-6">
								<h2 className="mb-3 font-heading text-base font-semibold text-foreground">
									Thông tin liên hệ
								</h2>
								<div className="space-y-2">
									{company.email && (
										<a
											href={`mailto:${company.email}`}
											className="flex items-center gap-2 text-sm text-foreground/80 transition-colors duration-150 hover:text-primary"
										>
											<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
											{company.email}
										</a>
									)}
									{company.phone && (
										<a
											href={`tel:${company.phone}`}
											className="flex items-center gap-2 text-sm text-foreground/80 transition-colors duration-150 hover:text-primary"
										>
											<Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
											{company.phone}
										</a>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
