import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
	Award,
	Briefcase,
	Download,
	FileEdit,
	Globe,
	GraduationCap,
	Link2,
	Link as GithubIcon,
	Mail,
	MapPin,
	Phone,
	Pencil,
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
import { brandShort } from "@/lib/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

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

function ProfileCard({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: LucideIcon;
	children: ReactNode;
}) {
	return (
		<div className="mb-4 rounded-xl border border-line bg-white p-6">
			<h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink">
				<Icon className="h-[18px] w-[18px] text-teal-500" />
				{title}
			</h3>
			{children}
		</div>
	);
}

const iconLinkBtn =
	"grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-slate-600 transition-colors hover:border-ink hover:text-ink";
const asideCard = "rounded-xl border border-line bg-white p-6";
const asideH4 =
	"mb-4 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600";
const metaDl = "grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm";

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
			await downloadNodeAsPdf(printRef.current, profile?.personalInfo.fullName || "CV");
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
			<div className="mx-auto max-w-[1280px] px-7 py-12">
				<Skeleton className="h-40 rounded-xl" />
				<div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="mx-auto max-w-[1280px] px-7 py-12">
				<div className={ui.empty}>
					<div className={ui.emptyIcon}>
						<FileEdit className="h-7 w-7" />
					</div>
					<h3 className="mb-2 text-xl font-semibold text-ink">Chưa có hồ sơ trực tuyến</h3>
					<p className="max-w-[380px] text-sm text-slate-600">
						Tạo CV chuyên nghiệp ngay trên hệ thống. Nhà tuyển dụng có thể tìm
						thấy hồ sơ của bạn dễ dàng hơn.
					</p>
					<div className="mt-5 flex flex-wrap justify-center gap-2.5">
						<button className={ui.btnAccent} onClick={() => navigate("/account/cv-builder")}>
							<Sparkles className="h-4 w-4" />
							Tạo CV ngay
						</button>
						<button className={ui.btnOutline} onClick={() => navigate("/account/settings")}>
							Chỉnh sửa thông tin
						</button>
					</div>
				</div>
			</div>
		);
	}

	const pi = profile.personalInfo;
	const initials = brandShort(pi.fullName || user?.name);
	const completion = Math.max(0, Math.min(100, profile.completionScore ?? 0));
	const dash = 2 * Math.PI * 28;
	const offset = dash * (1 - completion / 100);

	return (
		<div className="mx-auto max-w-[1280px] px-7 pb-16 pt-12">
			<div className="mb-7 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-display text-[32px] font-bold tracking-tight text-ink">
						Hồ sơ cá nhân
					</h1>
					<p className="mt-1.5 text-sm text-slate-600">
						Xem trước hồ sơ trực tuyến mà nhà tuyển dụng nhìn thấy.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button className={ui.btnOutline} onClick={handleExportPdf} disabled={exporting}>
						<Download className="h-4 w-4" />
						{exporting ? "Đang tạo PDF..." : "Tải CV PDF"}
					</button>
					<button className={ui.btnAccent} onClick={() => navigate("/account/cv-builder")}>
						<Pencil className="h-4 w-4" />
						Chỉnh sửa
					</button>
				</div>
			</div>

			<div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-ink p-6 text-white">
				<div className="relative h-16 w-16 shrink-0">
					<svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
						<circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-white/10" />
						<circle
							cx="32"
							cy="32"
							r="28"
							fill="none"
							strokeWidth="6"
							strokeLinecap="round"
							strokeDasharray={dash}
							strokeDashoffset={offset}
							className="stroke-teal-400"
						/>
					</svg>
					<div className="absolute inset-0 grid place-items-center font-display text-base font-bold text-teal-400">
						{completion}%
					</div>
				</div>
				<div className="min-w-[200px] flex-1">
					<h4 className="font-display text-base font-semibold text-white">
						Hồ sơ của bạn đã hoàn thành {completion}%
					</h4>
					<p className="mt-1 text-[13px] text-white/65">
						Bổ sung kinh nghiệm, kỹ năng và dự án để hồ sơ nổi bật hơn với nhà
						tuyển dụng.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
				<div>
					<div className="mb-4 rounded-xl border border-line bg-white p-6">
						<div className="flex items-start gap-4">
							<div className="grid h-18 w-18 shrink-0 place-items-center rounded-full bg-teal-500 text-2xl font-semibold text-ink">
								{initials}
							</div>
							<div className="min-w-0 flex-1">
								<h2 className="font-display text-2xl font-bold tracking-tight text-ink">
									{pi.fullName || user?.name}
								</h2>
								{profile.title && (
									<p className="mt-0.5 font-semibold text-teal-700">{profile.title}</p>
								)}
								{fullUser?.isJobSeeking && (
									<span className="mt-2 inline-flex rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
										Đang tìm việc
									</span>
								)}
								<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-slate-600">
									{pi.email && (
										<span className="inline-flex items-center gap-1.5">
											<Mail className="h-[13px] w-[13px]" />
											{pi.email}
										</span>
									)}
									{pi.phone && (
										<span className="inline-flex items-center gap-1.5">
											<Phone className="h-[13px] w-[13px]" />
											{pi.phone}
										</span>
									)}
									{pi.address && (
										<span className="inline-flex items-center gap-1.5">
											<MapPin className="h-[13px] w-[13px]" />
											{pi.address}
										</span>
									)}
								</div>
								{(pi.github || pi.linkedin || pi.portfolio) && (
									<div className="mt-3 flex gap-2">
										{pi.github && (
											<a href={pi.github} target="_blank" rel="noopener noreferrer" className={iconLinkBtn} aria-label="GitHub">
												<GithubIcon className="h-4 w-4" />
											</a>
										)}
										{pi.linkedin && (
											<a href={pi.linkedin} target="_blank" rel="noopener noreferrer" className={iconLinkBtn} aria-label="LinkedIn">
												<Link2 className="h-4 w-4" />
											</a>
										)}
										{pi.portfolio && (
											<a href={pi.portfolio} target="_blank" rel="noopener noreferrer" className={iconLinkBtn} aria-label="Portfolio">
												<Globe className="h-4 w-4" />
											</a>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{profile.summary && (
						<ProfileCard title="Giới thiệu" icon={User}>
							<p className="whitespace-pre-line text-sm leading-7 text-slate-700">
								{profile.summary}
							</p>
						</ProfileCard>
					)}

					{profile.skills?.length > 0 && (
						<ProfileCard title="Kỹ năng" icon={Star}>
							<div className="flex flex-wrap gap-2">
								{profile.skills.map((s, i) => (
									<span
										key={`${s.name}-${i}`}
										className="inline-flex rounded-full border-[1.5px] border-ink px-3.5 py-2 font-mono-jb text-[13px] font-semibold text-ink"
									>
										{s.name}
										<span className="font-normal text-slate-600">
											{" "}
											· {SKILL_LEVEL_LABEL[s.level] ?? s.level}
										</span>
									</span>
								))}
							</div>
						</ProfileCard>
					)}

					{profile.experiences?.length > 0 && (
						<ProfileCard title="Kinh nghiệm" icon={Briefcase}>
							{profile.experiences.map((exp, i) => (
								<div
									key={`${exp.company}-${i}`}
									className={cn(
										"pb-3.5",
										i < profile.experiences.length - 1 && "mb-3.5 border-b border-dashed border-line",
									)}
								>
									<div className="flex items-baseline justify-between gap-3">
										<div className="font-display text-[15px] font-semibold text-ink">
											{exp.position}
										</div>
										<div className="font-mono-jb text-xs text-slate-400">
											{fmt(exp.startDate)} – {exp.isCurrent ? "Hiện tại" : fmt(exp.endDate)}
										</div>
									</div>
									<div className="mt-0.5 text-[13px] font-medium text-teal-700">{exp.company}</div>
									{exp.description && (
										<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
											{exp.description}
										</p>
									)}
								</div>
							))}
						</ProfileCard>
					)}

					{profile.education?.length > 0 && (
						<ProfileCard title="Học vấn" icon={GraduationCap}>
							{profile.education.map((edu, i) => (
								<div
									key={`${edu.school}-${i}`}
									className={cn(
										"pb-3.5",
										i < profile.education.length - 1 && "mb-3.5 border-b border-dashed border-line",
									)}
								>
									<div className="flex items-baseline justify-between gap-3">
										<div className="font-display text-[15px] font-semibold text-ink">
											{edu.school}
										</div>
										<div className="font-mono-jb text-xs text-slate-400">
											{fmt(edu.startDate)} – {fmt(edu.endDate)}
										</div>
									</div>
									<div className="mt-0.5 text-[13px] text-slate-600">
										{edu.degree}
										{edu.field ? ` · ${edu.field}` : ""}
									</div>
								</div>
							))}
						</ProfileCard>
					)}

					{profile.projects?.length > 0 && (
						<ProfileCard title="Dự án" icon={Wrench}>
							{profile.projects.map((proj, i) => (
								<div
									key={`${proj.name}-${i}`}
									className={cn(
										"pb-3.5",
										i < profile.projects.length - 1 && "mb-3.5 border-b border-dashed border-line",
									)}
								>
									<div className="flex items-baseline justify-between gap-3">
										<div className="font-display text-[15px] font-semibold text-ink">{proj.name}</div>
										{proj.role && <div className="text-xs text-slate-400">{proj.role}</div>}
									</div>
									{proj.techStack?.length > 0 && (
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{proj.techStack.map((t) => (
												<span key={t} className="rounded border border-line px-2 py-0.5 text-[11px] text-slate-700">
													{t}
												</span>
											))}
										</div>
									)}
									{proj.description && (
										<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
											{proj.description}
										</p>
									)}
									{proj.url && (
										<a href={proj.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-teal-700">
											{proj.url}
										</a>
									)}
								</div>
							))}
						</ProfileCard>
					)}

					{profile.certifications?.length > 0 && (
						<ProfileCard title="Chứng chỉ" icon={Award}>
							<ul className="flex flex-col gap-2">
								{profile.certifications.map((c, i) => (
									<li key={`${c.name}-${i}`} className="text-sm">
										<span className="font-semibold text-ink">{c.name}</span>
										<span className="text-slate-600">
											{" — "}
											{c.issuer}
											{c.date ? ` · ${format(new Date(c.date), "dd/MM/yyyy")}` : ""}
										</span>
									</li>
								))}
							</ul>
						</ProfileCard>
					)}

					{profile.awards?.length > 0 && (
						<ProfileCard title="Giải thưởng" icon={Star}>
							<ul className="flex flex-col gap-2">
								{profile.awards.map((a, i) => (
									<li key={`${a.name}-${i}`} className="text-sm">
										<span className="font-semibold text-ink">{a.name}</span>
										<span className="text-slate-600">
											{" — "}
											{a.issuer}
											{a.date ? ` · ${format(new Date(a.date), "dd/MM/yyyy")}` : ""}
										</span>
									</li>
								))}
							</ul>
						</ProfileCard>
					)}
				</div>

				<aside className="flex flex-col gap-5">
					<div className={asideCard}>
						<h4 className={asideH4}>Thông tin</h4>
						<dl className={metaDl}>
							<dt className="text-slate-400">Tuổi</dt>
							<dd className="text-right font-medium text-ink">
								{fullUser?.age ? String(fullUser.age) : "—"}
							</dd>
							<dt className="text-slate-400">Giới tính</dt>
							<dd className="text-right font-medium text-ink">{genderLabel(fullUser?.gender)}</dd>
							<dt className="text-slate-400">Địa chỉ</dt>
							<dd className="text-right font-medium text-ink">{fullUser?.address || "—"}</dd>
							<dt className="text-slate-400">Vai trò</dt>
							<dd className="text-right font-medium text-ink">{fullUser?.role?.name || "—"}</dd>
						</dl>
					</div>

					{profile.languages?.length > 0 && (
						<div className={asideCard}>
							<h4 className={asideH4}>Ngôn ngữ</h4>
							<dl className={metaDl}>
								{profile.languages.map((l, i) => (
									<div key={`${l.name}-${i}`} className="contents">
										<dt className="text-slate-400">{l.name}</dt>
										<dd className="text-right font-medium text-ink">{l.proficiency}</dd>
									</div>
								))}
							</dl>
						</div>
					)}

					<div className={asideCard}>
						<div className="flex flex-col gap-2.5">
							<button className={ui.btnOutline + " w-full"} onClick={() => navigate("/jobs/recommended")}>
								<Sparkles className="h-4 w-4" />
								Xem việc gợi ý
							</button>
							<button className={ui.btnAccent + " w-full"} onClick={() => navigate("/account/cv-builder")}>
								<FileEdit className="h-4 w-4" />
								Chỉnh sửa hồ sơ
							</button>
						</div>
					</div>

					<div className={asideCard + " flex items-center gap-2 text-xs text-slate-600"}>
						<Shield className="h-3.5 w-3.5 text-teal-500" />
						{profile.isPublic
							? "Hồ sơ đang công khai với nhà tuyển dụng."
							: "Hồ sơ đang ở chế độ riêng tư."}
					</div>
				</aside>
			</div>

			<div
				aria-hidden="true"
				style={{ position: "fixed", left: "-10000px", top: 0, width: "794px", pointerEvents: "none" }}
			>
				<div ref={printRef}>
					<CvPreview profile={profile} />
				</div>
			</div>
		</div>
	);
}
