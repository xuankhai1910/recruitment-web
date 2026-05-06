import { ResumesTab } from "@/components/common/tab";

export function ResumesPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					CV đã nộp
				</h1>
				<p className="text-sm text-muted-foreground">
					Theo dõi trạng thái các hồ sơ ứng tuyển
				</p>
			</div>
			<ResumesTab />
		</div>
	);
}
