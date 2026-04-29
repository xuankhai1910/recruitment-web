import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	getNotificationAccent,
	renderNotificationIcon,
	resolveCtaUrl,
} from "@/components/common/notification/notificationConfig";
import {
	useDeleteNotification,
	useMarkNotificationRead,
} from "@/hooks/useNotifications";
import type { AppNotification } from "@/types/notification";

interface NotificationItemProps {
	notification: AppNotification;
	onNavigate?: () => void;
	showDelete?: boolean;
	className?: string;
}

export function NotificationItem({
	notification,
	onNavigate,
	showDelete = true,
	className,
}: NotificationItemProps) {
	const navigate = useNavigate();
	const markRead = useMarkNotificationRead();
	const remove = useDeleteNotification();

	const handleClick = () => {
		if (!notification.isRead) markRead.mutate(notification._id);
		onNavigate?.();
		navigate(resolveCtaUrl(notification));
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		remove.mutate(notification._id);
	};

	const accent = getNotificationAccent(notification);
	const relative = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: vi,
	});

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"group flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150",
				"hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
				!notification.isRead && "bg-primary/[0.04]",
				className,
			)}
			aria-label={notification.title}
		>
			<div
				className={cn(
					"mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
					accent,
				)}
				aria-hidden
			>
				{renderNotificationIcon(notification)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<p
						className={cn(
							"line-clamp-1 text-sm text-foreground",
							!notification.isRead ? "font-semibold" : "font-medium",
						)}
					>
						{notification.title}
					</p>
					{!notification.isRead && (
						<span
							className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
							role="status"
							aria-label="Chưa đọc"
						/>
					)}
				</div>
				<p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
					{notification.message}
				</p>
				<div className="mt-1.5 flex items-center justify-between gap-2">
					<span className="text-[11px] font-medium text-muted-foreground">
						{relative}
					</span>
					{showDelete && (
						<Button
							variant="ghost"
							size="icon"
							type="button"
							onClick={handleDelete}
							aria-label="Xoá thông báo"
							className="h-7 w-7 cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
						>
							<Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
						</Button>
					)}
				</div>
			</div>
		</button>
	);
}
