import { Link } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNotificationStore } from "@/stores/notification.store";
import {
	useMarkAllNotificationsRead,
	useNotificationList,
} from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationEmpty } from "./NotificationEmpty";
import { NotificationListSkeleton } from "./NotificationItemSkeleton";

interface NotificationDropdownProps {
	onItemNavigate?: () => void;
}

export function NotificationDropdown({
	onItemNavigate,
}: NotificationDropdownProps) {
	const unread = useNotificationStore((s) => s.unread);
	const isOnline = useNotificationStore((s) => s.isOnline);

	const { data, isLoading, isFetching } = useNotificationList({
		current: 1,
		pageSize: 10,
		sort: "-createdAt",
	});
	const markAll = useMarkAllNotificationsRead();

	const items = data?.result ?? [];
	// Show skeleton only on the very first load (no cached data yet).
	const showSkeleton = isLoading && items.length === 0;

	return (
		<div className="flex w-[380px] flex-col" role="menu">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 px-4 py-3">
				<div className="flex items-center gap-2">
					<h3 className="font-heading text-sm font-semibold text-foreground">
						Thông báo
					</h3>
					{unread > 0 && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
							{unread} mới
						</span>
					)}
					{!isOnline && (
						<span
							className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
							title="Đang dùng kênh dự phòng (REST polling)"
						>
							offline
						</span>
					)}
					{isFetching && !showSkeleton && (
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
					)}
				</div>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={unread === 0 || markAll.isPending}
					onClick={() => markAll.mutate()}
					className="h-7 cursor-pointer gap-1 text-xs"
				>
					<CheckCheck className="h-3.5 w-3.5" />
					Đọc tất cả
				</Button>
			</div>

			<Separator />

			{/* List */}
			<div className="max-h-[420px] overflow-y-auto p-1">
				{showSkeleton ? (
					<NotificationListSkeleton />
				) : items.length === 0 ? (
					<NotificationEmpty />
				) : (
					<div className="flex flex-col gap-0.5">
						{items.map((n) => (
							<NotificationItem
								key={n._id}
								notification={n}
								onNavigate={onItemNavigate}
							/>
						))}
					</div>
				)}
			</div>

			<Separator />

			{/* Footer */}
			<div className="px-4 py-2.5">
				<Link
					to="/notifications"
					onClick={onItemNavigate}
					className="block w-full rounded-md py-1.5 text-center text-xs font-semibold text-primary transition-colors duration-150 hover:bg-primary/5"
				>
					Xem tất cả thông báo
				</Link>
			</div>
		</div>
	);
}
