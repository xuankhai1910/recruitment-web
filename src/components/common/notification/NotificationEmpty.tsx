import { Bell } from "lucide-react";

interface NotificationEmptyProps {
	title?: string;
	description?: string;
}

export function NotificationEmpty({
	title = "Bạn chưa có thông báo nào",
	description = "Thông báo về đơn ứng tuyển và phản hồi từ nhà tuyển dụng sẽ xuất hiện ở đây.",
}: NotificationEmptyProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
				<Bell className="h-6 w-6 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<p className="font-heading text-sm font-semibold text-foreground">
					{title}
				</p>
				<p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}
