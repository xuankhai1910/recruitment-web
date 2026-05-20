import { Bell } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { SubscriberTab } from "@/components/common/tab";

export function SubscriberPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				icon={Bell}
				title="Nhận gợi ý việc làm qua email"
				description="Cài đặt kỹ năng quan tâm để nhận thông báo việc mới phù hợp"
				tone="amber"
			/>
			<SubscriberTab />
		</div>
	);
}
