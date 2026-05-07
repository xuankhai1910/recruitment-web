import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
	ArrowRight,
	Brain,
	Building2,
	CheckCircle2,
	Download,
	ExternalLink,
	FileText,
	GraduationCap,
	MapPin,
	RefreshCcw,
	Sparkles,
	Target,
	Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { extractOriginalFileName, resumeFileUrl } from "@/lib/format";
import type { CvAnalysis, RecommendationCv } from "@/types/cv-recommendation";

interface CvDetailsProps {
	cv: RecommendationCv;
	analysis: CvAnalysis;
	onReplace: () => void;
	onDelete: () => void;
	onView: () => void;
}

export function CvDetails({
	cv,
	analysis,
	onReplace,
	onDelete,
	onView,
}: CvDetailsProps) {
	const fileUrl = resumeFileUrl(cv.resumeUrl);
	const displayName = extractOriginalFileName(cv.resumeUrl);

	return (
		<div className="space-y-4">
			<CvFileCard
				displayName={displayName}
				fileUrl={fileUrl}
				source={cv.source}
				updatedAt={cv.updatedAt}
			/>

			<AnalysisCard analysis={analysis} />

			{/* Actions */}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={onView}
					className="cursor-pointer bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700"
				>
					<Sparkles className="mr-2 h-4 w-4" />
					Xem việc gợi ý
					<ArrowRight className="ml-1.5 h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					onClick={onReplace}
					className="cursor-pointer"
				>
					<RefreshCcw className="mr-2 h-4 w-4" />
					Thay CV
				</Button>
				<Button
					variant="ghost"
					onClick={onDelete}
					className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Xóa
				</Button>
			</div>
		</div>
	);
}

function CvFileCard({
	displayName,
	fileUrl,
	source,
	updatedAt,
}: {
	displayName: string;
	fileUrl: string;
	source: RecommendationCv["source"];
	updatedAt: string;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex flex-wrap items-start gap-3">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
					<FileText className="h-6 w-6" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p
							className="truncate font-heading text-sm font-semibold text-foreground"
							title={displayName}
						>
							{displayName}
						</p>
						<Badge
							variant="outline"
							className="shrink-0 border-blue-200 bg-blue-50 font-normal text-blue-700"
						>
							<CheckCircle2 className="mr-1 h-3 w-3" />
							Đang dùng
						</Badge>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Nguồn: {source === "upload" ? "Upload trực tiếp" : "Từ CV đã rải"} ·
						Cập nhật{" "}
						{formatDistanceToNow(new Date(updatedAt), {
							addSuffix: true,
							locale: vi,
						})}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<a
						href={fileUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex"
					>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 cursor-pointer"
							aria-label="Xem CV"
						>
							<ExternalLink className="h-4 w-4" />
						</Button>
					</a>
					<a href={fileUrl} download className="inline-flex">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 cursor-pointer"
							aria-label="Tải CV"
						>
							<Download className="h-4 w-4" />
						</Button>
					</a>
				</div>
			</div>
		</div>
	);
}

function AnalysisCard({ analysis }: { analysis: CvAnalysis }) {
	const isAi = analysis.analyzedBy === "ai";
	const { extractedData } = analysis;

	return (
		<div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
			<div className="mb-3 flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
						<Brain className="h-4 w-4" />
					</div>
					<p className="font-heading text-sm font-semibold text-slate-900">
						Phân tích bởi AI
					</p>
				</div>
				<Badge
					variant="outline"
					className={
						isAi
							? "border-blue-200 bg-white font-normal text-blue-700"
							: "border-amber-200 bg-amber-50 font-normal text-amber-700"
					}
				>
					{isAi ? "Gemini AI" : "Phân tích cơ bản"}
				</Badge>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<InfoRow icon={Target} label="Cấp độ">
					<Badge variant="secondary" className="font-medium">
						{extractedData.level || "—"}
					</Badge>
					{extractedData.yearsOfExperience > 0 && (
						<span className="ml-2 text-xs text-muted-foreground">
							{extractedData.yearsOfExperience} năm KN
						</span>
					)}
				</InfoRow>
				<InfoRow icon={GraduationCap} label="Học vấn">
					<span className="text-sm text-foreground">
						{extractedData.education || "—"}
					</span>
				</InfoRow>
				<InfoRow icon={MapPin} label="Địa điểm mong muốn">
					<div className="flex flex-wrap gap-1">
						{extractedData.preferredLocations.length === 0 ? (
							<span className="text-sm text-muted-foreground">—</span>
						) : (
							extractedData.preferredLocations.map((l) => (
								<Badge key={l} variant="outline" className="font-normal">
									{l}
								</Badge>
							))
						)}
					</div>
				</InfoRow>
				<InfoRow
					icon={Building2}
					label="Phân tích lúc"
					valueClass="text-sm text-foreground"
				>
					{format(new Date(analysis.analyzedAt), "HH:mm dd/MM/yyyy")}
				</InfoRow>
			</div>

			<Separator className="my-3 bg-blue-200/60" />

			<div>
				<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
					Kỹ năng ({extractedData.skills.length})
				</p>
				{extractedData.skills.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Chưa trích xuất được kỹ năng nào
					</p>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{extractedData.skills.map((s) => (
							<Badge
								key={s}
								variant="outline"
								className="border-blue-200 bg-white font-normal text-blue-700"
							>
								{s}
							</Badge>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function InfoRow({
	icon: Icon,
	label,
	children,
	valueClass,
}: {
	icon: typeof Target;
	label: string;
	children: React.ReactNode;
	valueClass?: string;
}) {
	return (
		<div className="rounded-lg border border-blue-100 bg-white/70 p-3">
			<div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
				<Icon className="h-3.5 w-3.5" />
				{label}
			</div>
			<div className={valueClass ?? "flex items-center"}>{children}</div>
		</div>
	);
}
