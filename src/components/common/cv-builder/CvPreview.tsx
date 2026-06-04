import { format } from "date-fns";
import type { CvTemplate, UserProfile } from "@/types/user-profile";

interface CvPreviewProps {
	profile: UserProfile;
	/** Kept for backward-compat; there is now a single DevMarket template. */
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

// Literal colors (not CSS vars) so html2canvas PDF capture renders correctly.
const INK = "#0A0F1A";
const TEAL = "#0F766E";
const MUTED = "#475569";
const FAINT = "#94A3B8";
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<h2
			style={{
				fontFamily: MONO,
				fontSize: 11,
				fontWeight: 700,
				letterSpacing: "0.12em",
				textTransform: "uppercase",
				color: TEAL,
				margin: "20px 0 10px",
			}}
		>
			{children}
		</h2>
	);
}

function ItemHead({ role, when }: { role: string; when?: string }) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "baseline",
				gap: 12,
				marginBottom: 2,
			}}
		>
			<span style={{ fontWeight: 700, color: INK, fontSize: 14 }}>{role}</span>
			{when && (
				<span style={{ fontSize: 11, color: FAINT, fontFamily: MONO }}>
					{when}
				</span>
			)}
		</div>
	);
}

/**
 * Single DevMarket CV template (Wellfound-style: Space Grotesk display, mono
 * teal section labels, sharp skill tags). Rendered at A4 width for PDF export.
 */
export function CvPreview({ profile }: CvPreviewProps) {
	const p = profile.personalInfo ?? ({} as UserProfile["personalInfo"]);
	const contacts = [p.email, p.phone, p.address, p.github, p.linkedin, p.portfolio].filter(
		Boolean,
	);

	return (
		<div
			style={{
				margin: "0 auto",
				width: "100%",
				maxWidth: 794,
				minHeight: 1123,
				background: "#fff",
				color: "#0F172A",
				fontFamily: '"Inter", system-ui, sans-serif',
				fontSize: 13,
				lineHeight: 1.55,
				padding: "44px 48px",
			}}
		>
			{/* Header */}
			<h1
				style={{
					fontFamily: DISPLAY,
					fontSize: 32,
					fontWeight: 700,
					letterSpacing: "-0.02em",
					color: INK,
					marginBottom: 4,
				}}
			>
				{p.fullName || "Họ và tên"}
			</h1>
			<div style={{ fontSize: 15, color: TEAL, fontWeight: 600, marginBottom: 14 }}>
				{profile.title || "Vị trí mong muốn"}
			</div>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "4px 18px",
					fontSize: 11.5,
					color: MUTED,
					paddingBottom: 16,
					borderBottom: `2px solid ${INK}`,
				}}
			>
				{contacts.map((c) => (
					<span key={c}>{c}</span>
				))}
			</div>

			{profile.summary && (
				<>
					<SectionLabel>Giới thiệu</SectionLabel>
					<p style={{ whiteSpace: "pre-line", color: "#334155" }}>
						{profile.summary}
					</p>
				</>
			)}

			{profile.experiences?.length > 0 && (
				<>
					<SectionLabel>Kinh nghiệm</SectionLabel>
					{profile.experiences.map((e, i) => (
						<div key={i} style={{ marginBottom: 14 }}>
							<ItemHead
								role={e.position}
								when={`${fmt(e.startDate)} – ${e.isCurrent ? "Hiện tại" : fmt(e.endDate)}`}
							/>
							<div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>
								{e.company}
							</div>
							{e.description && (
								<p style={{ whiteSpace: "pre-line", fontSize: 12, color: "#334155" }}>
									{e.description}
								</p>
							)}
						</div>
					))}
				</>
			)}

			{profile.education?.length > 0 && (
				<>
					<SectionLabel>Học vấn</SectionLabel>
					{profile.education.map((ed, i) => (
						<div key={i} style={{ marginBottom: 14 }}>
							<ItemHead
								role={ed.school}
								when={`${fmt(ed.startDate)} – ${fmt(ed.endDate)}`}
							/>
							<div style={{ fontSize: 12, color: MUTED }}>
								{ed.degree}
								{ed.field ? ` · ${ed.field}` : ""}
							</div>
							{ed.description && (
								<p style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
									{ed.description}
								</p>
							)}
						</div>
					))}
				</>
			)}

			{profile.projects?.length > 0 && (
				<>
					<SectionLabel>Dự án</SectionLabel>
					{profile.projects.map((pr, i) => (
						<div key={i} style={{ marginBottom: 14 }}>
							<ItemHead role={pr.name} when={pr.role} />
							{pr.techStack?.length > 0 && (
								<div style={{ fontSize: 11, color: FAINT, marginBottom: 2 }}>
									{pr.techStack.join(" · ")}
								</div>
							)}
							{pr.description && (
								<p style={{ whiteSpace: "pre-line", fontSize: 12, color: "#334155" }}>
									{pr.description}
								</p>
							)}
							{pr.url && (
								<div style={{ fontSize: 11, color: TEAL }}>{pr.url}</div>
							)}
						</div>
					))}
				</>
			)}

			{profile.skills?.length > 0 && (
				<>
					<SectionLabel>Kỹ năng</SectionLabel>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
						{profile.skills.map((s) => (
							<span
								key={s.name}
								style={{
									padding: "2px 8px",
									border: `1px solid ${INK}`,
									borderRadius: 9999,
									fontSize: 10.5,
									fontWeight: 600,
								}}
							>
								{s.name}
								<span style={{ color: MUTED, fontWeight: 500 }}>
									{" "}
									· {SKILL_LEVEL_LABEL[s.level] ?? s.level}
								</span>
							</span>
						))}
					</div>
				</>
			)}

			{profile.languages?.length > 0 && (
				<>
					<SectionLabel>Ngôn ngữ</SectionLabel>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 12 }}>
						{profile.languages.map((l) => (
							<span key={l.name}>
								<b style={{ color: INK }}>{l.name}</b>
								<span style={{ color: MUTED }}> — {l.proficiency}</span>
							</span>
						))}
					</div>
				</>
			)}

			{profile.certifications?.length > 0 && (
				<>
					<SectionLabel>Chứng chỉ</SectionLabel>
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{profile.certifications.map((c) => (
							<li key={c.name} style={{ fontSize: 12, marginBottom: 4 }}>
								<b style={{ color: INK }}>{c.name}</b>
								<span style={{ color: MUTED }}>
									{" — "}
									{c.issuer}
									{c.date ? ` · ${fmt(c.date)}` : ""}
								</span>
							</li>
						))}
					</ul>
				</>
			)}

			{profile.awards?.length > 0 && (
				<>
					<SectionLabel>Giải thưởng</SectionLabel>
					<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
						{profile.awards.map((a, i) => (
							<li key={i} style={{ fontSize: 12, marginBottom: 4 }}>
								<b style={{ color: INK }}>{a.name}</b>
								<span style={{ color: MUTED }}>
									{" — "}
									{a.issuer}
									{a.date ? ` · ${fmt(a.date)}` : ""}
								</span>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
