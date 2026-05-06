import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
	Award,
	Briefcase,
	Building2,
	Calendar,
	Download,
	FileEdit,
	Globe,
	GraduationCap,
	Link2 as LinkedinIcon,
	Link as GithubIcon,
	Mail,
	MapPin,
	Pencil,
	Phone,
	Shield,
	Sparkles,
	Star,
	User,
	Wrench,
	type LucideIcon,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useUser } from "@/hooks/useUsers";
import { useMyProfile } from "@/hooks/useUserProfile";
import { CvPreview } from "@/components/common/cv-builder/CvPreview";
import { downloadNodeAsPdf } from "@/lib/pdf";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SKILL_LEVEL_LABEL: Record<string, string> = {
	BEGINNER: "Cơ bản",
	INTERMEDIATE: "Trung cấp",
	ADVANCED: "Thành thạo",
	EXPERT: "Chuyên gia",
};

function genderLabel(g?: string) {
	if (!g) return "—";
	const v = g.toUpperCase();
	if (v === "MALE") return "Nam";
	if (v === "FEMALE") return "Nữ";
	if (v === "OTHER") return "Khác";
	return g;
}

function fmt(d?: string) {
	if (!d) return "";
	try {
		return format(new Date(d), "MM/yyyy");
	} catch {
		return "";
	}
}

function ProfileSection({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: LucideIcon;
	children: ReactNode;
}) {
	return (
		<Card>
			<CardContent className="p-5">
				<h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground mb-3">
					<Icon className="h-4 w-4 text-primary" />
					{title}
				</h2>
				{children}
			</CardContent>
		</Card>
	);
}

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="flex items-center gap-1.5 text-muted-foreground">
				<Icon className="h-3.5 w-3.5" />
				{label}
			</dt>
			<dd className="font-medium text-foreground text-right truncate">
				{value}
			</dd>
		</div>
	);
}

export function ProfilePage() {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { data: fullUser, isLoading: userLoading } = useUser(user?._id ?? "");
	const { data: profile, isLoading: profileLoading } = useMyProfile();
	const isLoading = userLoading || profileLoading;

	const printRef = useRef<HTMLDivElement>(null);
	const [exporting, setExporting] = useState(false);

	const handleExportPdf = async () => {
		if (!printRef.current) return;
		try {
			setExporting(true);
			await downloadNodeAsPdf(
				printRef.current,
				profile?.personalInfo.fullName || "CV",
			);
			toast.success("Đã tải CV PDF");
		} catch (e) {
			console.error(e);
			toast.error("Không thể tải PDF");
		} finally {
			setExporting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<Skeleton className="h-48 rounded-lg" />
					<Skeleton className="h-64 rounded-lg" />
				</div>
			</div>
		);
	}

	// Empty state
	if (!profile) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-14 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
							<FileEdit className="h-8 w-8" />
						</div>
						<h2 className="font-heading text-base font-semibold text-foreground">
							Chưa có hồ sơ trực tuyến
						</h2>
						<p className="max-w-md text-sm text-muted-foreground">
							Tạo CV chuyên nghiệp ngay trên hệ thống. Nhà tuyển dụng có thể tìm
							thấy hồ sơ của bạn dễ dàng hơn.
						</p>
						<div className="mt-2 flex flex-wrap items-center justify-center gap-2">
							<Button
								onClick={() => {
									navigate("/account/cv-builder");
								}}
								className="cursor-pointer bg-[#22C55E] text-white hover:bg-[#16A34A]"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Tạo CV ngay
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									navigate("/account/settings");
								}}
								className="cursor-pointer"
							>
								Chỉnh sửa thông tin
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const pi = profile.personalInfo;
	const initials = (pi.fullName || user?.name || "U")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const completionScore = Math.max(
		0,
		Math.min(100, profile.completionScore ?? 0),
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				{/* Main column */}
				<div>
					{/* Hero */}
					<Card>
						<CardContent className="p-5 sm:p-6">
							<div className="flex flex-row items-start gap-4">
								<Avatar className="h-20 w-20">
									<AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<h1 className="font-heading text-xl font-bold text-foreground">
										{pi.fullName || user?.name}
									</h1>
									{profile.title && (
										<p className="mt-0.5 text-sm text-muted-foreground">
											{profile.title}
										</p>
									)}
									{fullUser?.isJobSeeking && (
										<div className="mt-2 flex items-center gap-2">
											<Badge className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-normal text-xs">
												Đang tìm việc
											</Badge>
										</div>
									)}
									<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
										{pi.email && (
											<span className="inline-flex items-center gap-1">
												<Mail className="h-3 w-3" />
												{pi.email}
											</span>
										)}
										{pi.phone && (
											<span className="inline-flex items-center gap-1">
												<Phone className="h-3 w-3" />
												{pi.phone}
											</span>
										)}
										{pi.address && (
											<span className="inline-flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{pi.address}
											</span>
										)}
									</div>
									{(pi.github || pi.linkedin || pi.portfolio) && (
										<div className="mt-3 flex items-center gap-1.5">
											{pi.github && (
												<a
													href={pi.github}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 cursor-pointer"
													>
														<GithubIcon className="h-4 w-4" />
													</Button>
												</a>
											)}
											{pi.linkedin && (
												<a
													href={pi.linkedin}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 cursor-pointer"
													>
														<LinkedinIcon className="h-4 w-4" />
													</Button>
												</a>
											)}
											{pi.portfolio && (
												<a
													href={pi.portfolio}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 cursor-pointer"
													>
														<Globe className="h-4 w-4" />
													</Button>
												</a>
											)}
										</div>
									)}
								</div>
							</div>

							<Separator className="my-4" />

							<div className="flex items-center justify-between gap-4">
								<div className="flex-1">
									<div className="flex justify-between text-xs mb-1">
										<span className="text-muted-foreground">
											Hoàn thiện hồ sơ
										</span>
										<span className="font-heading font-semibold text-primary">
											{completionScore}%
										</span>
									</div>
									<div className="h-2 rounded-full bg-muted overflow-hidden">
										<div
											className="h-full rounded-full bg-gradient-to-r from-primary to-[#22C55E] transition-all"
											style={{ width: `${completionScore}%` }}
										/>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										navigate("/account/cv-builder");
									}}
									className="cursor-pointer"
								>
									<Pencil className="mr-1.5 h-3.5 w-3.5" />
									Chỉnh sửa
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Sections */}
					<div className="space-y-5 mt-5">
						{profile.summary && (
							<ProfileSection title="Giới thiệu" icon={User}>
								<p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">
									{profile.summary}
								</p>
							</ProfileSection>
						)}

						{profile.skills?.length > 0 && (
							<ProfileSection title="Kỹ năng" icon={Star}>
								<div className="flex flex-wrap gap-2">
									{profile.skills.map((s, i) => (
										<Badge
											key={`${s.name}-${i}`}
											variant="secondary"
											className="font-normal"
										>
											{s.name}
											<span className="ml-1 text-[10px] text-muted-foreground">
												{SKILL_LEVEL_LABEL[s.level] ?? s.level}
											</span>
										</Badge>
									))}
								</div>
							</ProfileSection>
						)}

						{profile.experiences?.length > 0 && (
							<ProfileSection title="Kinh nghiệm" icon={Briefcase}>
								<ol className="relative ml-3 border-l-2 border-border space-y-4">
									{profile.experiences.map((exp, i) => (
										<li key={`${exp.company}-${i}`} className="relative pl-6">
											<span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-card" />
											<p className="font-heading text-sm font-semibold text-foreground">
												{exp.position}
											</p>
											<p className="text-sm text-primary">{exp.company}</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{fmt(exp.startDate)} –{" "}
												{exp.isCurrent ? "Hiện tại" : fmt(exp.endDate)}
											</p>
											{exp.description && (
												<p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-line">
													{exp.description}
												</p>
											)}
										</li>
									))}
								</ol>
							</ProfileSection>
						)}

						{profile.education?.length > 0 && (
							<ProfileSection title="Học vấn" icon={GraduationCap}>
								<ol className="relative ml-3 border-l-2 border-border space-y-4">
									{profile.education.map((edu, i) => (
										<li key={`${edu.school}-${i}`} className="relative pl-6">
											<span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-border bg-card" />
											<p className="font-heading text-sm font-semibold text-foreground">
												{edu.school}
											</p>
											<p className="text-sm text-foreground/80">
												{edu.degree}
												{edu.field ? ` · ${edu.field}` : ""}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{fmt(edu.startDate)} – {fmt(edu.endDate)}
											</p>
											{edu.description && (
												<p className="text-sm text-foreground/70 mt-1">
													{edu.description}
												</p>
											)}
										</li>
									))}
								</ol>
							</ProfileSection>
						)}

						{profile.projects?.length > 0 && (
							<ProfileSection title="Dự án" icon={Wrench}>
								<div className="space-y-4">
									{profile.projects.map((proj, i) => (
										<div key={`${proj.name}-${i}`}>
											<div className="flex items-baseline justify-between gap-2">
												<p className="font-heading text-sm font-semibold text-foreground">
													{proj.name}
												</p>
												{proj.role && (
													<span className="text-xs text-muted-foreground">
														{proj.role}
													</span>
												)}
											</div>
											{proj.techStack?.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1">
													{proj.techStack.map((t) => (
														<Badge
															key={t}
															variant="outline"
															className="text-[10px] font-normal"
														>
															{t}
														</Badge>
													))}
												</div>
											)}
											{proj.description && (
												<p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-line">
													{proj.description}
												</p>
											)}
											{proj.url && (
												<a
													href={proj.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-xs text-primary hover:underline mt-1 inline-block"
												>
													{proj.url}
												</a>
											)}
										</div>
									))}
								</div>
							</ProfileSection>
						)}

						{profile.certifications?.length > 0 && (
							<ProfileSection title="Chứng chỉ" icon={Award}>
								<ul className="space-y-2">
									{profile.certifications.map((c, i) => (
										<li key={`${c.name}-${i}`} className="text-sm">
											<span className="font-medium text-foreground">
												{c.name}
											</span>
											<span className="text-muted-foreground">
												{" — "}
												{c.issuer}
												{c.date
													? ` · ${format(new Date(c.date), "dd/MM/yyyy")}`
													: ""}
											</span>
											{c.url && (
												<a
													href={c.url}
													target="_blank"
													rel="noopener noreferrer"
													className="ml-2 text-xs text-primary hover:underline"
												>
													Xem
												</a>
											)}
										</li>
									))}
								</ul>
							</ProfileSection>
						)}

						{profile.awards?.length > 0 && (
							<ProfileSection title="Giải thưởng" icon={Star}>
								<ul className="space-y-2">
									{profile.awards.map((a, i) => (
										<li key={`${a.name}-${i}`} className="text-sm">
											<span className="font-medium text-foreground">
												{a.name}
											</span>
											<span className="text-muted-foreground">
												{" — "}
												{a.issuer}
												{a.date
													? ` · ${format(new Date(a.date), "dd/MM/yyyy")}`
													: ""}
											</span>
										</li>
									))}
								</ul>
							</ProfileSection>
						)}
					</div>
				</div>

				{/* Sidebar */}
				<aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
					<Card>
						<CardContent className="p-5">
							<h3 className="font-heading text-sm font-semibold text-foreground mb-3">
								Thông tin
							</h3>
							<dl className="space-y-2.5 text-sm">
								<InfoRow
									icon={Calendar}
									label="Tuổi"
									value={fullUser?.age ? String(fullUser.age) : "—"}
								/>
								<InfoRow
									icon={User}
									label="Giới tính"
									value={genderLabel(fullUser?.gender)}
								/>
								<InfoRow
									icon={MapPin}
									label="Địa chỉ"
									value={fullUser?.address || "—"}
								/>
								<InfoRow
									icon={Building2}
									label="Công ty"
									value={fullUser?.company?.name || "—"}
								/>
								<InfoRow
									icon={Shield}
									label="Vai trò"
									value={fullUser?.role?.name || "—"}
								/>
							</dl>
						</CardContent>
					</Card>

					{profile.languages?.length > 0 && (
						<Card>
							<CardContent className="p-5">
								<h3 className="font-heading text-sm font-semibold text-foreground mb-3">
									Ngôn ngữ
								</h3>
								<ul className="space-y-1.5">
									{profile.languages.map((l, i) => (
										<li
											key={`${l.name}-${i}`}
											className="flex justify-between text-sm"
										>
											<span className="text-foreground">{l.name}</span>
											<span className="text-muted-foreground">
												{l.proficiency}
											</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardContent className="p-5 space-y-2">
							<Button
								className="w-full cursor-pointer"
								variant="outline"
								size="sm"
								onClick={handleExportPdf}
								disabled={exporting || !profile}
							>
								<Download className="mr-2 h-4 w-4" />
								{exporting ? "Đang tạo PDF..." : "Tải CV PDF"}
							</Button>
							<Button
								className="w-full cursor-pointer"
								variant="outline"
								size="sm"
								onClick={() => {
									navigate("/jobs/recommended");
								}}
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Xem việc gợi ý
							</Button>
							<Button
								className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
								size="sm"
								onClick={() => {
									navigate("/account/cv-builder");
								}}
							>
								<FileEdit className="mr-2 h-4 w-4" />
								Chỉnh sửa hồ sơ
							</Button>
						</CardContent>
					</Card>
				</aside>
			</div>

			{/* Offscreen render target for PDF capture (kept off-canvas, never visible) */}
			<div
				aria-hidden="true"
				style={{
					position: "fixed",
					left: "-10000px",
					top: 0,
					width: "794px",
					pointerEvents: "none",
				}}
			>
				<div ref={printRef}>
					<CvPreview profile={profile} />
				</div>
			</div>
		</div>
	);
}
