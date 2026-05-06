import { SubscriberTab } from "@/components/common/tab";

export function SubscriberPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					Nhận gợi ý việc làm
				</h1>
				<p className="text-sm text-muted-foreground">
					Cài đặt email thông báo việc mới theo kỹ năng
				</p>
			</div>
			<SubscriberTab />
		</div>
	);
}
