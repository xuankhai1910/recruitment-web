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
	const isUnread = !notification.isRead;
	const relative = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: vi,
	});
	const iconClass = isUnread ? accent : "bg-[#F4F4EF] text-[#0F172A]";

	return (
		<div
			className={cn(
				"group relative flex w-full cursor-pointer items-start gap-4 border-b border-[#EFEFE9] px-5 py-[18px] text-left transition-colors",
				"last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/35 focus-visible:ring-offset-0",
				isUnread
					? "bg-[#F0FDFA] hover:bg-[#CCFBF1] before:absolute before:left-2 before:top-[26px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#14B8A6] before:content-['']"
					: "bg-white hover:bg-[#FAFAF7]",
				className,
			)}
		>
			<button
				type="button"
				onClick={handleClick}
				className="flex min-w-0 flex-1 cursor-pointer items-start gap-4 text-left focus-visible:outline-none"
				aria-label={notification.title}
			>
				<div
					className={cn(
						"grid h-10 w-10 shrink-0 place-items-center rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px]",
						iconClass,
					)}
					aria-hidden
				>
					{renderNotificationIcon(notification)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="line-clamp-2 text-sm leading-[1.5] text-[#0F172A]">
						<span>{notification.title}</span>
						{notification.message && (
							<span className="font-semibold text-[#0A0F1A]">
								{" "}
								&middot; {notification.message}
							</span>
						)}
					</div>
					<div className="mt-1 font-mono text-xs text-[#94A3B8]">
						{relative}
					</div>
				</div>

				{isUnread && (
					<span
						className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#14B8A6]"
						role="status"
						aria-label="Chua doc"
					/>
				)}
			</button>

			<div className="h-7 w-7 shrink-0">
				{showDelete && (
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={handleDelete}
						aria-label="Xoa thong bao"
						className="h-7 w-7 cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
					>
						<Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
					</Button>
				)}
			</div>
		</div>
	);
}
