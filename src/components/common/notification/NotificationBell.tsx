import { useState } from "react";
import { Bell } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification.store";
import { useUnreadCount } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const unread = useNotificationStore((s) => s.unread);

	// Sync initial unread count + polling fallback when offline.
	useUnreadCount();

	const badge = unread > 99 ? "99+" : unread;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Thông báo${unread > 0 ? ` (${unread} chưa đọc)` : ""}`}
					className="relative h-9 w-9 cursor-pointer rounded-full transition-colors duration-200 hover:bg-accent"
				>
					<Bell className="h-5 w-5 text-foreground/80" />
					{unread > 0 && (
						<span
							className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card"
							aria-hidden
						>
							{badge}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-auto overflow-hidden rounded-xl border border-border/60 bg-card p-0 shadow-lg"
			>
				<NotificationDropdown onItemNavigate={() => setOpen(false)} />
			</PopoverContent>
		</Popover>
	);
}
