import {
	Award,
	Briefcase,
	Calendar,
	GraduationCap,
	Languages,
	Link as LinkIcon,
	Mail,
	MapPin,
	Phone,
	Star,
	Wrench,
} from "lucide-react";
import { format } from "date-fns";

import type { CvTemplate, UserProfile } from "@/types/user-profile";

interface CvPreviewProps {
	profile: UserProfile;
	template?: CvTemplate;
}

function fmt(d?: string) {
	if (!d) return "";
	try {
		return format(new Date(d), "MM/yyyy");
	} catch {
		return d;
	}
}

const SKILL_LEVEL_LABEL: Record<string, string> = {
	BEGINNER: "Cơ bản",
	INTERMEDIATE: "Trung cấp",
	ADVANCED: "Thành thạo",
	EXPERT: "Chuyên gia",
};

const SKILL_LEVEL_PCT: Record<string, number> = {
	BEGINNER: 25,
	INTERMEDIATE: 50,
	ADVANCED: 75,
	EXPERT: 100,
};

export function CvPreview({ profile, template }: CvPreviewProps) {
	const tpl = template ?? (profile.templateId as CvTemplate) ?? "modern";
	if (tpl === "classic") return <ClassicTemplate profile={profile} />;
	if (tpl === "minimal") return <MinimalTemplate profile={profile} />;
	return <ModernTemplate profile={profile} />;
}

/* -------------------- MODERN: 2-column -------------------- */
function ModernTemplate({ profile }: { profile: UserProfile }) {
	const p = profile.personalInfo;
	return (
		<div className="mx-auto flex min-h-[1123px] w-full max-w-[794px] bg-white text-[12px] leading-relaxed text-slate-800 shadow-sm">
			{/* Sidebar */}
			<aside className="w-[34%] bg-slate-900 p-6 text-slate-100">
				<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold text-white">
					{p.fullName?.charAt(0).toUpperCase() || "?"}
				</div>
				<h2 className="mt-3 text-center font-heading text-lg font-bold text-white">
					{p.fullName || "Họ và tên"}
				</h2>
				<p className="mt-1 text-center text-xs text-slate-300">
					{profile.title || "Vị trí mong muốn"}
				</p>

				<div className="mt-5 space-y-2 text-xs">
					{p.email && (
						<div className="flex items-start gap-2">
							<Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							<span className="break-all">{p.email}</span>
						</div>
					)}
					{p.phone && (
						<div className="flex items-start gap-2">
							<Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							<span>{p.phone}</span>
						</div>
					)}
					{p.address && (
						<div className="flex items-start gap-2">
							<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							<span>{p.address}</span>
						</div>
					)}
					{p.linkedin && (
						<div className="flex items-start gap-2">
							<LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							<span className="break-all">{p.linkedin}</span>
						</div>
					)}
				</div>

				{profile.skills?.length > 0 && (
					<div className="mt-6">
						<h3 className="mb-2 border-b border-slate-700 pb-1 font-heading text-sm font-semibold uppercase">
							Kỹ năng
						</h3>
						<div className="space-y-2">
							{profile.skills.map((s) => (
								<div key={s.name}>
									<div className="flex justify-between text-[11px]">
										<span>{s.name}</span>
										<span className="text-slate-300">
											{SKILL_LEVEL_LABEL[s.level] ?? s.level}
										</span>
									</div>
									<div className="mt-1 h-1 w-full rounded-full bg-slate-700">
										<div
											className="h-full rounded-full bg-blue-500"
											style={{ width: `${SKILL_LEVEL_PCT[s.level] ?? 50}%` }}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{profile.languages?.length > 0 && (
					<div className="mt-6">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-700 pb-1 font-heading text-sm font-semibold uppercase">
							<Languages className="h-3.5 w-3.5" /> Ngôn ngữ
						</h3>
						<ul className="space-y-1 text-xs">
							{profile.languages.map((l) => (
								<li key={l.name} className="flex justify-between">
									<span>{l.name}</span>
									<span className="text-slate-300">{l.proficiency}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{profile.certifications?.length > 0 && (
					<div className="mt-6">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-700 pb-1 font-heading text-sm font-semibold uppercase">
							<Award className="h-3.5 w-3.5" /> Chứng chỉ
						</h3>
						<ul className="space-y-1.5 text-xs">
							{profile.certifications.map((c) => (
								<li key={c.name}>
									<p className="font-medium text-white">{c.name}</p>
									<p className="text-slate-300">
										{c.issuer} · {fmt(c.date)}
									</p>
								</li>
							))}
						</ul>
					</div>
				)}
			</aside>

			{/* Main */}
			<main className="flex-1 p-7">
				{profile.summary && (
					<section>
						<h3 className="mb-2 border-b border-slate-200 pb-1 font-heading text-base font-bold uppercase text-blue-600">
							Giới thiệu
						</h3>
						<p className="whitespace-pre-line text-[12px] text-slate-700">
							{profile.summary}
						</p>
					</section>
				)}

				{profile.experiences?.length > 0 && (
					<section className="mt-5">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 font-heading text-base font-bold uppercase text-blue-600">
							<Briefcase className="h-4 w-4" /> Kinh nghiệm làm việc
						</h3>
						<div className="space-y-3">
							{profile.experiences.map((e, i) => (
								<div key={i}>
									<div className="flex items-baseline justify-between gap-3">
										<p className="font-heading text-sm font-semibold text-slate-900">
											{e.position}
										</p>
										<span className="text-xs text-slate-500">
											{fmt(e.startDate)} -{" "}
											{e.isCurrent ? "Hiện tại" : fmt(e.endDate)}
										</span>
									</div>
									<p className="text-[12px] font-medium text-blue-600">
										{e.company}
									</p>
									<p className="mt-1 whitespace-pre-line text-[11.5px] text-slate-700">
										{e.description}
									</p>
								</div>
							))}
						</div>
					</section>
				)}

				{profile.education?.length > 0 && (
					<section className="mt-5">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 font-heading text-base font-bold uppercase text-blue-600">
							<GraduationCap className="h-4 w-4" /> Học vấn
						</h3>
						<div className="space-y-3">
							{profile.education.map((ed, i) => (
								<div key={i}>
									<div className="flex items-baseline justify-between gap-3">
										<p className="font-heading text-sm font-semibold text-slate-900">
											{ed.school}
										</p>
										<span className="text-xs text-slate-500">
											{fmt(ed.startDate)} - {fmt(ed.endDate)}
										</span>
									</div>
									<p className="text-[12px] text-slate-700">
										{ed.degree}
										{ed.field ? ` · ${ed.field}` : ""}
									</p>
									{ed.description && (
										<p className="mt-0.5 text-[11.5px] text-slate-600">
											{ed.description}
										</p>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{profile.projects?.length > 0 && (
					<section className="mt-5">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 font-heading text-base font-bold uppercase text-blue-600">
							<Wrench className="h-4 w-4" /> Dự án
						</h3>
						<div className="space-y-3">
							{profile.projects.map((pr, i) => (
								<div key={i}>
									<div className="flex items-baseline justify-between gap-3">
										<p className="font-heading text-sm font-semibold text-slate-900">
											{pr.name}
										</p>
										{pr.role && (
											<span className="text-xs text-slate-500">{pr.role}</span>
										)}
									</div>
									{pr.techStack?.length > 0 && (
										<p className="text-[11px] italic text-slate-500">
											{pr.techStack.join(" · ")}
										</p>
									)}
									<p className="mt-1 whitespace-pre-line text-[11.5px] text-slate-700">
										{pr.description}
									</p>
									{pr.url && (
										<p className="text-[11px] text-blue-600">{pr.url}</p>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{profile.awards?.length > 0 && (
					<section className="mt-5">
						<h3 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 font-heading text-base font-bold uppercase text-blue-600">
							<Star className="h-4 w-4" /> Giải thưởng
						</h3>
						<ul className="space-y-1 text-[11.5px] text-slate-700">
							{profile.awards.map((a, i) => (
								<li key={i}>
									<span className="font-medium">{a.name}</span> — {a.issuer} ·{" "}
									{fmt(a.date)}
								</li>
							))}
						</ul>
					</section>
				)}
			</main>
		</div>
	);
}

/* -------------------- CLASSIC: 1-column -------------------- */
function ClassicTemplate({ profile }: { profile: UserProfile }) {
	const p = profile.personalInfo;
	return (
		<div className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white p-10 text-[12px] text-slate-800 shadow-sm">
			<header className="border-b-2 border-slate-900 pb-4 text-center">
				<h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-slate-900">
					{p.fullName || "Họ và tên"}
				</h1>
				<p className="mt-1 text-sm text-slate-700">
					{profile.title || "Vị trí mong muốn"}
				</p>
				<div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
					{p.email && <span>{p.email}</span>}
					{p.phone && <span>· {p.phone}</span>}
					{p.address && <span>· {p.address}</span>}
				</div>
			</header>

			{profile.summary && (
				<Section title="Giới thiệu">
					<p className="whitespace-pre-line">{profile.summary}</p>
				</Section>
			)}

			{profile.experiences?.length > 0 && (
				<Section title="Kinh nghiệm làm việc">
					<div className="space-y-3">
						{profile.experiences.map((e, i) => (
							<div key={i}>
								<div className="flex justify-between">
									<p className="font-semibold text-slate-900">
										{e.position} · {e.company}
									</p>
									<span className="text-xs text-slate-500">
										<Calendar className="mr-1 inline h-3 w-3" />
										{fmt(e.startDate)} -{" "}
										{e.isCurrent ? "Hiện tại" : fmt(e.endDate)}
									</span>
								</div>
								<p className="mt-1 whitespace-pre-line text-[11.5px]">
									{e.description}
								</p>
							</div>
						))}
					</div>
				</Section>
			)}

			{profile.education?.length > 0 && (
				<Section title="Học vấn">
					{profile.education.map((ed, i) => (
						<div key={i} className="mb-2">
							<div className="flex justify-between">
								<p className="font-semibold text-slate-900">{ed.school}</p>
								<span className="text-xs text-slate-500">
									{fmt(ed.startDate)} - {fmt(ed.endDate)}
								</span>
							</div>
							<p className="text-[12px]">
								{ed.degree}
								{ed.field ? ` · ${ed.field}` : ""}
							</p>
						</div>
					))}
				</Section>
			)}

			{profile.skills?.length > 0 && (
				<Section title="Kỹ năng">
					<p>
						{profile.skills
							.map(
								(s) => `${s.name} (${SKILL_LEVEL_LABEL[s.level] ?? s.level})`,
							)
							.join(" · ")}
					</p>
				</Section>
			)}

			{profile.projects?.length > 0 && (
				<Section title="Dự án">
					<div className="space-y-2">
						{profile.projects.map((pr, i) => (
							<div key={i}>
								<p className="font-semibold text-slate-900">
									{pr.name}
									{pr.role ? ` — ${pr.role}` : ""}
								</p>
								{pr.techStack?.length > 0 && (
									<p className="text-[11px] italic text-slate-500">
										{pr.techStack.join(" · ")}
									</p>
								)}
								<p className="whitespace-pre-line text-[11.5px]">
									{pr.description}
								</p>
							</div>
						))}
					</div>
				</Section>
			)}

			{profile.certifications?.length > 0 && (
				<Section title="Chứng chỉ">
					<ul className="list-disc pl-4">
						{profile.certifications.map((c) => (
							<li key={c.name}>
								{c.name} — {c.issuer} · {fmt(c.date)}
							</li>
						))}
					</ul>
				</Section>
			)}
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mt-4">
			<h3 className="mb-2 border-b border-slate-300 pb-0.5 font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
				{title}
			</h3>
			{children}
		</section>
	);
}

/* -------------------- MINIMAL -------------------- */
function MinimalTemplate({ profile }: { profile: UserProfile }) {
	const p = profile.personalInfo;
	return (
		<div className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white p-12 text-[12px] text-slate-800 shadow-sm">
			<h1 className="font-heading text-3xl font-light tracking-tight text-slate-900">
				{p.fullName || "Họ và tên"}
			</h1>
			<p className="mt-1 text-sm text-slate-500">
				{profile.title || "Vị trí mong muốn"}
			</p>
			<p className="mt-2 text-xs text-slate-500">
				{[p.email, p.phone, p.address].filter(Boolean).join("  ·  ")}
			</p>

			{profile.summary && (
				<p className="mt-6 whitespace-pre-line border-l-2 border-slate-300 pl-3 text-[12px] text-slate-700">
					{profile.summary}
				</p>
			)}

			{profile.experiences?.length > 0 && (
				<section className="mt-6">
					<h3 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						Kinh nghiệm
					</h3>
					<div className="mt-2 space-y-3">
						{profile.experiences.map((e, i) => (
							<div key={i}>
								<p className="text-sm font-medium text-slate-900">
									{e.position}{" "}
									<span className="text-slate-500">/ {e.company}</span>
								</p>
								<p className="text-xs text-slate-500">
									{fmt(e.startDate)} -{" "}
									{e.isCurrent ? "Hiện tại" : fmt(e.endDate)}
								</p>
								<p className="mt-1 whitespace-pre-line text-[11.5px] text-slate-700">
									{e.description}
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			{profile.education?.length > 0 && (
				<section className="mt-6">
					<h3 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						Học vấn
					</h3>
					<div className="mt-2 space-y-1.5">
						{profile.education.map((ed, i) => (
							<p key={i} className="text-[12px]">
								<span className="font-medium text-slate-900">{ed.school}</span>{" "}
								— {ed.degree} ({fmt(ed.startDate)} - {fmt(ed.endDate)})
							</p>
						))}
					</div>
				</section>
			)}

			{profile.skills?.length > 0 && (
				<section className="mt-6">
					<h3 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						Kỹ năng
					</h3>
					<p className="mt-2 text-[12px]">
						{profile.skills.map((s) => s.name).join("  ·  ")}
					</p>
				</section>
			)}
		</div>
	);
}
