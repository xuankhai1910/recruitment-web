import { FileText } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { ResumesTab } from "@/components/common/tab";

export function ResumesPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				icon={FileText}
				title="Đơn ứng tuyển"
				description="Theo dõi trạng thái các vị trí bạn đã ứng tuyển"
				tone="blue"
			/>
			<ResumesTab />
		</div>
	);
}
