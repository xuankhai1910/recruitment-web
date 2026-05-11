import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	Mail,
	MapPin,
	Phone,
	FileDown,
	ExternalLink,
	Briefcase,
	Eye,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumes } from "@/hooks/useResumes";
import { usePublicUserProfile } from "@/hooks/useUserProfile";
import { usersApi } from "@/api/users.api";
import { ResumeDetail } from "@/components/admin/resume/ResumeDetail";
import { formatDateTime } from "@/lib/constants";
import type { Resume } from "@/types/resume";

const statusColor: Record<string, string> = {
	PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
	REVIEWING: "bg-blue-50 text-blue-700 border-blue-200",
	APPROVED: "bg-green-50 text-green-700 border-green-200",
	REJECTED: "bg-red-50 text-red-700 border-red-200",
};

function initialsFrom(name?: string) {
	return (name || "U")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/**
 * HR Candidate Detail — xem thông tin user + lịch sử apply (đã lọc theo company của HR).
 */
export function HrCandidateDetailPage() {
	const { userId = "" } = useParams<{ userId: string }>();

	// Basic user info
	const userQ = useQuery({
		queryKey: ["users", userId],
		queryFn: () => usersApi.getById(userId).then((r) => r.data.data),
		enabled: !!userId,
		staleTime: 10 * 60 * 1000,
	});

	// Public profile (CV builder)
	const profileQ = usePublicUserProfile(userId);

	// Resumes của user này — BE đã scope theo company của HR
	const resumesQ = useResumes({
		current: 1,
		pageSize: 100,
		sort: "-createdAt",
		populate: "jobId",
		fields: "jobId._id,jobId.name",
		userId,
	} as Record<string, unknown>);

	const resumes = useMemo(() => resumesQ.data?.result ?? [], [resumesQ.data]);

	const [selected, setSelected] = useState<Resume | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);

	const user = userQ.data;
	const profile = profileQ.data?.profile;

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-sm">
				<Link
					to="/hr/candidates"
					className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Ứng viên
				</Link>
				<span className="text-muted-foreground">/</span>
				<span className="font-medium text-foreground">
					{user?.name ?? "Chi tiết"}
				</span>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
				{/* Main */}
				<div className="space-y-4">
					{/* Hero */}
					<Card>
						<CardContent className="p-5">
							{userQ.isLoading ? (
								<div className="flex items-center gap-4">
									<Skeleton className="h-16 w-16 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-48" />
										<Skeleton className="h-4 w-32" />
									</div>
								</div>
							) : !user ? (
								<p className="py-6 text-center text-sm text-muted-foreground">
									Không tìm thấy ứng viên
								</p>
							) : (
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
									<Avatar className="h-16 w-16">
										<AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
											{initialsFrom(user.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<h1 className="font-heading text-2xl font-bold text-foreground">
											{user.name}
										</h1>
										{profile?.title && (
											<p className="mt-0.5 text-sm text-muted-foreground">
												{profile.title}
											</p>
										)}
										<div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
											<InfoRow icon={Mail} value={user.email} />
											{user.address && (
												<InfoRow icon={MapPin} value={user.address} />
											)}
											{profile?.personalInfo?.phone && (
												<InfoRow
													icon={Phone}
													value={profile.personalInfo.phone}
												/>
											)}
										</div>
									</div>
									<Button
										asChild
										variant="outline"
										size="sm"
										className="cursor-pointer gap-1.5"
									>
										<Link to={`/profiles/${userId}`} target="_blank">
											<ExternalLink className="h-3.5 w-3.5" />
											Profile công khai
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Summary from CV builder */}
					{profile?.summary && (
						<Card>
							<CardContent className="space-y-2 p-5">
								<h2 className="text-sm font-semibold">Giới thiệu</h2>
								<p className="whitespace-pre-line text-sm leading-6 text-foreground/80">
									{profile.summary}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Skills (if profile) */}
					{profile?.skills && profile.skills.length > 0 && (
						<Card>
							<CardContent className="space-y-3 p-5">
								<h2 className="text-sm font-semibold">Kỹ năng</h2>
								<div className="flex flex-wrap gap-1.5">
									{profile.skills.map((s) => (
										<Badge
											key={s.name}
											variant="outline"
											className="bg-primary/5 font-normal"
										>
											{s.name}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Applications history */}
					<Card>
						<CardContent className="space-y-3 p-5">
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-semibold">
									Lịch sử ứng tuyển ({resumes.length})
								</h2>
							</div>
							<Separator />
							{resumesQ.isLoading ? (
								<div className="space-y-2">
									{[0, 1].map((i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : resumes.length === 0 ? (
								<p className="py-4 text-center text-sm text-muted-foreground">
									Ứng viên chưa apply tin tuyển dụng nào của công ty bạn
								</p>
							) : (
								<div className="space-y-2">
									{resumes.map((r) => {
										const jobName =
											typeof r.jobId === "object"
												? (r.jobId?.name ?? "—")
												: "—";
										return (
											<div
												key={r._id}
												className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-accent/40"
											>
												<div className="flex min-w-0 flex-1 items-center gap-3">
													<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
														<Briefcase className="h-4 w-4" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate text-sm font-medium">
															{jobName}
														</p>
														<p className="truncate text-xs text-muted-foreground">
															{formatDateTime(r.createdAt)}
														</p>
													</div>
												</div>
												<Badge
													variant="outline"
													className={`text-xs ${statusColor[r.status] ?? ""}`}
												>
													{r.status}
												</Badge>
												<div className="flex items-center gap-1">
													{r.url && (
														<a
															href={`${import.meta.env.VITE_STATIC_URL}/images/resume/${r.url}`}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-blue-700 transition-colors hover:bg-blue-50"
															title="Tải CV"
														>
															<FileDown className="h-4 w-4" />
														</a>
													)}
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 cursor-pointer text-sky-700 hover:bg-sky-50"
														title="Cập nhật trạng thái"
														onClick={() => {
															setSelected(r);
															setDetailOpen(true);
														}}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<aside className="space-y-4">
					<Card>
						<CardContent className="space-y-3 p-5">
							<h2 className="text-sm font-semibold">Thống kê</h2>
							<Separator />
							<StatRow label="Tổng số lần apply" value={resumes.length} />
							<StatRow
								label="Đang chờ duyệt"
								value={resumes.filter((r) => r.status === "PENDING").length}
							/>
							<StatRow
								label="Đang xem xét"
								value={resumes.filter((r) => r.status === "REVIEWING").length}
							/>
							<StatRow
								label="Đã duyệt"
								value={resumes.filter((r) => r.status === "APPROVED").length}
								valueClass="text-green-700"
							/>
							<StatRow
								label="Từ chối"
								value={resumes.filter((r) => r.status === "REJECTED").length}
								valueClass="text-red-700"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="space-y-2 p-5">
							<h2 className="text-sm font-semibold">Thông tin khác</h2>
							<Separator />
							{user?.age && (
								<p className="text-xs text-muted-foreground">
									Tuổi: <span className="text-foreground">{user.age}</span>
								</p>
							)}
							{user?.gender && (
								<p className="text-xs text-muted-foreground">
									Giới tính:{" "}
									<span className="text-foreground">
										{user.gender === "MALE"
											? "Nam"
											: user.gender === "FEMALE"
												? "Nữ"
												: "Khác"}
									</span>
								</p>
							)}
							{user?.createdAt && (
								<p className="text-xs text-muted-foreground">
									Tham gia: {formatDateTime(user.createdAt)}
								</p>
							)}
						</CardContent>
					</Card>
				</aside>
			</div>

			<ResumeDetail
				open={detailOpen}
				onOpenChange={setDetailOpen}
				resume={selected}
			/>
		</div>
	);
}

function InfoRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
	return (
		<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
			<Icon className="h-3.5 w-3.5 shrink-0" />
			<span className="truncate">{value}</span>
		</div>
	);
}

function StatRow({
	label,
	value,
	valueClass,
}: {
	label: string;
	value: number;
	valueClass?: string;
}) {
	return (
		<div className="flex items-center justify-between text-xs">
			<span className="text-muted-foreground">{label}</span>
			<span className={`font-semibold tabular-nums ${valueClass ?? ""}`}>
				{value}
			</span>
		</div>
	);
}
