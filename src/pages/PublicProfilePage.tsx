import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
	AlertCircle,
	Award,
	Briefcase,
	Copy,
	ExternalLink,
	Globe,
	GraduationCap,
	Languages,
	Link as GithubIcon,
	Link2 as LinkedinIcon,
	Mail,
	MapPin,
	Phone,
	ShieldCheck,
	Star,
	User,
	Wrench,
	type LucideIcon,
} from "lucide-react";

import { usePublicUserProfile } from "@/hooks/useUserProfile";
import type { PublicProfile } from "@/types/user-profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SKILL_LEVEL_LABEL: Record<string, string> = {
	BEGINNER: "Cơ bản",
	INTERMEDIATE: "Trung cấp",
	ADVANCED: "Thành thạo",
	EXPERT: "Chuyên gia",
};

function fmtMonth(date?: string) {
	if (!date) return "";
	try {
		return format(new Date(date), "MM/yyyy");
	} catch {
		return "";
	}
}

function fmtDate(date?: string) {
	if (!date) return "";
	try {
		return format(new Date(date), "dd/MM/yyyy");
	} catch {
		return "";
	}
}

function initialsFrom(name?: string) {
	return (name || "U")
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function makeKey(...parts: Array<string | undefined>) {
	return parts.filter(Boolean).join("-");
}

function PublicSection({
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
				<h2 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
					<Icon className="h-4 w-4 text-sky-600" />
					{title}
				</h2>
				{children}
			</CardContent>
		</Card>
	);
}

function ContactRow({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: LucideIcon;
	label: string;
	value?: string;
	href?: string;
}) {
	if (!value) return null;
	const content = (
		<>
			<Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
			<span className="min-w-0">
				<span className="block text-xs text-muted-foreground">{label}</span>
				<span className="block wrap-break-word text-sm font-medium text-foreground">
					{value}
				</span>
			</span>
		</>
	);

	if (href) {
		return (
			<a
				href={href}
				className="flex cursor-pointer items-start gap-2 rounded-md p-2 transition-colors hover:bg-sky-50 dark:hover:bg-sky-950/40"
			>
				{content}
			</a>
		);
	}

	return <div className="flex items-start gap-2 p-2">{content}</div>;
}

function ProfileUnavailable() {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
				<AlertCircle className="h-8 w-8" />
			</div>
			<h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">
				Hồ sơ chưa khả dụng
			</h1>
			<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
				Ứng viên có thể chưa công khai CV trực tuyến hoặc hồ sơ đã bị gỡ khỏi
				chế độ công khai.
			</p>
			<Button
				asChild
				className="mt-5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
			>
				<Link to="/jobs">Xem việc làm</Link>
			</Button>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				<div className="space-y-5">
					<Skeleton className="h-52 rounded-lg" />
					<Skeleton className="h-32 rounded-lg" />
					<Skeleton className="h-56 rounded-lg" />
				</div>
				<Skeleton className="h-72 rounded-lg" />
			</div>
		</div>
	);
}

function PublicHero({
	profile,
	userName,
}: {
	profile: PublicProfile;
	userName?: string;
}) {
	const personalInfo = profile.personalInfo || {};
	const displayName = personalInfo.fullName || userName || "Ứng viên";
	const initials = initialsFrom(displayName);

	return (
		<Card>
			<CardContent className="p-5 sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<Avatar className="h-20 w-20">
						<AvatarFallback className="bg-sky-100 text-xl font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-200">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
									{displayName}
								</h1>
								{profile.title && (
									<p className="mt-1 text-sm text-muted-foreground sm:text-base">
										{profile.title}
									</p>
								)}
							</div>
							<Badge className="w-fit border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
								<ShieldCheck className="mr-1 h-3.5 w-3.5" />
								Đang tìm việc
							</Badge>
						</div>

						<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
							{personalInfo.email && (
								<span className="inline-flex items-center gap-1.5">
									<Mail className="h-4 w-4" />
									{personalInfo.email}
								</span>
							)}
							{personalInfo.phone && (
								<span className="inline-flex items-center gap-1.5">
									<Phone className="h-4 w-4" />
									{personalInfo.phone}
								</span>
							)}
							{personalInfo.address && (
								<span className="inline-flex items-center gap-1.5">
									<MapPin className="h-4 w-4" />
									{personalInfo.address}
								</span>
							)}
						</div>

						{(personalInfo.github ||
							personalInfo.linkedin ||
							personalInfo.portfolio) && (
							<div className="mt-4 flex flex-wrap items-center gap-2">
								{personalInfo.github && (
									<Button
										asChild
										variant="outline"
										size="sm"
										className="cursor-pointer"
									>
										<a
											href={personalInfo.github}
											target="_blank"
											rel="noopener noreferrer"
										>
											<GithubIcon className="mr-1.5 h-4 w-4" />
											GitHub
										</a>
									</Button>
								)}
								{personalInfo.linkedin && (
									<Button
										asChild
										variant="outline"
										size="sm"
										className="cursor-pointer"
									>
										<a
											href={personalInfo.linkedin}
											target="_blank"
											rel="noopener noreferrer"
										>
											<LinkedinIcon className="mr-1.5 h-4 w-4" />
											LinkedIn
										</a>
									</Button>
								)}
								{personalInfo.portfolio && (
									<Button
										asChild
										variant="outline"
										size="sm"
										className="cursor-pointer"
									>
										<a
											href={personalInfo.portfolio}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Globe className="mr-1.5 h-4 w-4" />
											Portfolio
										</a>
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function PublicProfilePage() {
	const { userId = "" } = useParams();
	const { data, isLoading, isError } = usePublicUserProfile(userId);

	if (isLoading) return <LoadingState />;
	if (!userId || isError || !data) return <ProfileUnavailable />;

	const { profile, user } = data;
	const personalInfo = profile.personalInfo || {};

	const copyProfileUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("Đã sao chép liên kết hồ sơ");
		} catch {
			toast.error("Không thể sao chép liên kết");
		}
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
				<main className="space-y-5">
					<PublicHero profile={profile} userName={user.name} />

					{profile.summary && (
						<PublicSection title="Giới thiệu" icon={User}>
							<p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
								{profile.summary}
							</p>
						</PublicSection>
					)}

					{profile.skills?.length > 0 && (
						<PublicSection title="Kỹ năng" icon={Star}>
							<div className="flex flex-wrap gap-2">
								{profile.skills.map((skill) => (
									<Badge
										key={makeKey(skill.name, skill.level)}
										variant="secondary"
										className="font-normal"
									>
										{skill.name}
										<span className="ml-1 text-[11px] text-muted-foreground">
											{SKILL_LEVEL_LABEL[skill.level] ?? skill.level}
										</span>
									</Badge>
								))}
							</div>
						</PublicSection>
					)}

					{profile.experiences?.length > 0 && (
						<PublicSection title="Kinh nghiệm" icon={Briefcase}>
							<ol className="relative ml-3 space-y-4 border-l-2 border-border">
								{profile.experiences.map((experience) => (
									<li
										key={makeKey(
											experience.company,
											experience.position,
											experience.startDate,
										)}
										className="relative pl-6"
									>
										<span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-sky-600 bg-card" />
										<p className="font-heading text-sm font-semibold text-foreground">
											{experience.position}
										</p>
										<p className="text-sm text-sky-700 dark:text-sky-300">
											{experience.company}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{fmtMonth(experience.startDate)} -{" "}
											{experience.isCurrent
												? "Hiện tại"
												: fmtMonth(experience.endDate)}
										</p>
										{experience.description && (
											<p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/80">
												{experience.description}
											</p>
										)}
									</li>
								))}
							</ol>
						</PublicSection>
					)}

					{profile.education?.length > 0 && (
						<PublicSection title="Học vấn" icon={GraduationCap}>
							<ol className="relative ml-3 space-y-4 border-l-2 border-border">
								{profile.education.map((education) => (
									<li
										key={makeKey(
											education.school,
											education.degree,
											education.startDate,
										)}
										className="relative pl-6"
									>
										<span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-sky-600 bg-card" />
										<p className="font-heading text-sm font-semibold text-foreground">
											{education.school}
										</p>
										<p className="text-sm text-foreground/80">
											{education.degree}
											{education.field ? ` - ${education.field}` : ""}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{fmtMonth(education.startDate)} -{" "}
											{fmtMonth(education.endDate)}
										</p>
										{education.description && (
											<p className="mt-1 text-sm leading-6 text-foreground/70">
												{education.description}
											</p>
										)}
									</li>
								))}
							</ol>
						</PublicSection>
					)}

					{profile.projects?.length > 0 && (
						<PublicSection title="Dự án" icon={Wrench}>
							<div className="space-y-4">
								{profile.projects.map((project) => (
									<div key={makeKey(project.name, project.role, project.url)}>
										<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
											<p className="font-heading text-sm font-semibold text-foreground">
												{project.name}
											</p>
											{project.role && (
												<span className="text-xs text-muted-foreground">
													{project.role}
												</span>
											)}
										</div>
										{project.techStack?.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{project.techStack.map((tech) => (
													<Badge
														key={tech}
														variant="outline"
														className="text-[11px] font-normal"
													>
														{tech}
													</Badge>
												))}
											</div>
										)}
										{project.description && (
											<p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/80">
												{project.description}
											</p>
										)}
										{project.url && (
											<a
												href={project.url}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
											>
												<ExternalLink className="h-3.5 w-3.5" />
												Xem dự án
											</a>
										)}
									</div>
								))}
							</div>
						</PublicSection>
					)}

					{profile.certifications?.length > 0 && (
						<PublicSection title="Chứng chỉ" icon={Award}>
							<ul className="space-y-2">
								{profile.certifications.map((certification) => (
									<li
										key={makeKey(
											certification.name,
											certification.issuer,
											certification.date,
										)}
										className="text-sm leading-6"
									>
										<span className="font-medium text-foreground">
											{certification.name}
										</span>
										<span className="text-muted-foreground">
											{` - ${certification.issuer}`}
											{certification.date
												? ` - ${fmtDate(certification.date)}`
												: ""}
										</span>
										{certification.url && (
											<a
												href={certification.url}
												target="_blank"
												rel="noopener noreferrer"
												className="ml-2 cursor-pointer text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
											>
												Xem
											</a>
										)}
									</li>
								))}
							</ul>
						</PublicSection>
					)}

					{profile.awards?.length > 0 && (
						<PublicSection title="Giải thưởng" icon={Star}>
							<ul className="space-y-2">
								{profile.awards.map((award) => (
									<li
										key={makeKey(award.name, award.issuer, award.date)}
										className="text-sm leading-6"
									>
										<span className="font-medium text-foreground">
											{award.name}
										</span>
										<span className="text-muted-foreground">
											{` - ${award.issuer}`}
											{award.date ? ` - ${fmtDate(award.date)}` : ""}
										</span>
									</li>
								))}
							</ul>
						</PublicSection>
					)}
				</main>

				<aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
					<Card>
						<CardContent className="p-5">
							<h2 className="font-heading text-sm font-semibold text-foreground">
								Liên hệ ứng viên
							</h2>
							<p className="mt-1 text-xs leading-5 text-muted-foreground">
								Thông tin bên dưới do ứng viên công khai trong CV trực tuyến.
							</p>
							<Separator className="my-3" />
							<div className="space-y-1">
								<ContactRow
									icon={Mail}
									label="Email"
									value={personalInfo.email}
									href={
										personalInfo.email
											? `mailto:${personalInfo.email}`
											: undefined
									}
								/>
								<ContactRow
									icon={Phone}
									label="Điện thoại"
									value={personalInfo.phone}
									href={
										personalInfo.phone ? `tel:${personalInfo.phone}` : undefined
									}
								/>
								<ContactRow
									icon={MapPin}
									label="Địa chỉ"
									value={personalInfo.address}
								/>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="mt-4 w-full cursor-pointer"
								onClick={copyProfileUrl}
							>
								<Copy className="mr-2 h-4 w-4" />
								Sao chép link hồ sơ
							</Button>
						</CardContent>
					</Card>

					{profile.languages?.length > 0 && (
						<Card>
							<CardContent className="p-5">
								<h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
									<Languages className="h-4 w-4 text-sky-600" />
									Ngôn ngữ
								</h2>
								<ul className="space-y-2">
									{profile.languages.map((language) => (
										<li
											key={makeKey(language.name, language.proficiency)}
											className="flex justify-between gap-3 text-sm"
										>
											<span className="text-foreground">{language.name}</span>
											<span className="text-right text-muted-foreground">
												{language.proficiency}
											</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}
				</aside>
			</div>
		</div>
	);
}
