import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { SavedJobsTab } from "@/components/common/tab";

export function SavedJobsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				icon={Bookmark}
				title="Việc đã lưu"
				description="Danh sách việc làm bạn quan tâm và muốn xem lại"
				tone="rose"
			/>
			<SavedJobsTab />
		</div>
	);
}
