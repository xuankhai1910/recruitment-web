import { SavedJobsTab } from "@/components/common/tab";

export function SavedJobsPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					Việc đã lưu
				</h1>
				<p className="text-sm text-muted-foreground">
					Danh sách việc làm bạn quan tâm
				</p>
			</div>
			<SavedJobsTab />
		</div>
	);
}
