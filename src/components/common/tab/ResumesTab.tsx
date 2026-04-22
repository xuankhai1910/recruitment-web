import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyResumes } from "@/hooks/useResumes";
import { resumeFileUrl } from "@/lib/format";

const RESUME_STATUS_STYLE: Record<string, string> = {
	PENDING: "bg-amber-50 text-amber-700 border-amber-200",
	REVIEWING: "bg-blue-50 text-blue-700 border-blue-200",
	APPROVED: "bg-green-50 text-green-700 border-green-200",
	REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export function ResumesTab() {
	const { data, isLoading } = useMyResumes();
	const resumes = data ?? [];

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={`resume-sk-${i}`} className="h-20 rounded-lg" />
				))}
			</div>
		);
	}

	if (resumes.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12">
				<FileText className="h-10 w-10 text-muted-foreground/40" />
				<p className="text-sm text-muted-foreground">Bạn chưa rải CV nào</p>
			</div>
		);
	}

	return (
		<div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3">
			{resumes.map((r) => {
				const job =
					typeof r.jobId === "object" ? r.jobId : { _id: r.jobId, name: "—" };
				const company =
					typeof r.companyId === "object"
						? r.companyId
						: { _id: r.companyId, name: "—" };
				return (
					<div
						key={r._id}
						className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
							<FileText className="h-5 w-5 text-primary" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="line-clamp-1 text-sm font-semibold text-foreground">
								{job.name}
							</p>
							<p className="line-clamp-1 text-xs text-muted-foreground">
								{company.name} · {format(new Date(r.createdAt), "dd/MM/yyyy")}
							</p>
						</div>
						<Badge
							variant="outline"
							className={`shrink-0 font-normal ${RESUME_STATUS_STYLE[r.status] ?? ""}`}
						>
							{r.status}
						</Badge>
						<a
							href={resumeFileUrl(r.url)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 cursor-pointer"
							>
								<ExternalLink className="h-4 w-4" />
							</Button>
						</a>
					</div>
				);
			})}
		</div>
	);
}
