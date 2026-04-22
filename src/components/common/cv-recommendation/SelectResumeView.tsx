import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyResumes } from "@/hooks/useResumes";
import type { Resume } from "@/types/resume";

import { BackButton } from "./BackButton";

interface SelectResumeViewProps {
	onBack: () => void;
	onSelect: (r: Resume) => void;
}

export function SelectResumeView({ onBack, onSelect }: SelectResumeViewProps) {
	const { data, isLoading } = useMyResumes();
	const resumes = useMemo(
		() => (data ?? []).filter((r) => r.url.toLowerCase().endsWith(".pdf")),
		[data],
	);
	const [selected, setSelected] = useState<string>("");

	const selectedResume = resumes.find((r) => r._id === selected);

	return (
		<div className="space-y-4">
			<BackButton onClick={onBack} />
			<div>
				<h3 className="font-heading text-sm font-semibold text-foreground">
					Chọn từ CV đã ứng tuyển
				</h3>
				<p className="mt-0.5 text-xs text-muted-foreground">
					Chỉ hiển thị CV định dạng PDF.
				</p>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={`sel-sk-${i}`} className="h-16 rounded-lg" />
					))}
				</div>
			) : resumes.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12 text-center">
					<FileText className="h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">
						Bạn chưa rải CV PDF nào
					</p>
				</div>
			) : (
				<div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
					{resumes.map((r) => (
						<ResumeRow
							key={r._id}
							resume={r}
							selected={selected === r._id}
							onSelect={() => {
								setSelected(r._id);
							}}
						/>
					))}
				</div>
			)}

			<div className="flex justify-end gap-2 border-t border-border/60 pt-3">
				<Button variant="outline" onClick={onBack} className="cursor-pointer">
					Hủy
				</Button>
				<Button
					onClick={() => {
						if (selectedResume) onSelect(selectedResume);
					}}
					disabled={!selectedResume}
					className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-opacity duration-150 hover:opacity-90"
				>
					<Sparkles className="mr-2 h-4 w-4" />
					Phân tích & thiết lập
				</Button>
			</div>
		</div>
	);
}

function ResumeRow({
	resume,
	selected,
	onSelect,
}: {
	resume: Resume;
	selected: boolean;
	onSelect: () => void;
}) {
	const job =
		typeof resume.jobId === "object"
			? resume.jobId
			: { _id: resume.jobId, name: "—" };
	const company =
		typeof resume.companyId === "object"
			? resume.companyId
			: { _id: resume.companyId, name: "—" };

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150 ${
				selected
					? "border-primary bg-primary/5 ring-2 ring-primary/20"
					: "border-border/60 bg-card hover:border-primary/30 hover:bg-accent/30"
			}`}
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<FileText className="h-5 w-5 text-primary" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">
					{job.name}
				</p>
				<p className="truncate text-xs text-muted-foreground">
					{company.name} · {format(new Date(resume.createdAt), "dd/MM/yyyy")}
				</p>
			</div>
			{selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
		</button>
	);
}
