import { useMemo, useState } from "react";
import { CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useNotificationStore } from "@/stores/notification.store";
import {
	useMarkAllNotificationsRead,
	useNotificationList,
} from "@/hooks/useNotifications";
import {
	NotificationItem,
	NotificationEmpty,
	NotificationListSkeleton,
} from "@/components/common/notification";
import { NOTIFICATION_TYPE_LABEL } from "@/components/common/notification/notificationConfig";
import type { NotificationType } from "@/types/notification";

type TabValue = "all" | "unread";

const TYPE_OPTIONS: Array<{ value: NotificationType | "ALL"; label: string }> =
	[
		{ value: "ALL", label: "Tất cả loại" },
		{
			value: "NEW_RESUME_RECEIVED",
			label: NOTIFICATION_TYPE_LABEL.NEW_RESUME_RECEIVED,
		},
		{
			value: "RESUME_SUBMITTED",
			label: NOTIFICATION_TYPE_LABEL.RESUME_SUBMITTED,
		},
		{
			value: "RESUME_STATUS_CHANGED",
			label: NOTIFICATION_TYPE_LABEL.RESUME_STATUS_CHANGED,
		},
	];

const PAGE_SIZE = 12;

export function NotificationsPage() {
	const [tab, setTab] = useState<TabValue>("all");
	const [type, setType] = useState<NotificationType | "ALL">("ALL");
	const [page, setPage] = useState(1);

	const params = useMemo(
		() => ({
			current: page,
			pageSize: PAGE_SIZE,
			sort: "-createdAt",
			...(tab === "unread" ? { isRead: false } : {}),
			...(type !== "ALL" ? { type } : {}),
		}),
		[page, tab, type],
	);

	const { data, isLoading } = useNotificationList(params);
	const unread = useNotificationStore((s) => s.unread);
	const markAll = useMarkAllNotificationsRead();

	const items = data?.result ?? [];
	const meta = data?.meta;
	const totalPages = meta?.pages ?? 1;
	const showSkeleton = isLoading && items.length === 0;

	const handleTabChange = (v: string) => {
		setTab(v as TabValue);
		setPage(1);
	};

	const handleTypeChange = (v: string) => {
		setType(v as NotificationType | "ALL");
		setPage(1);
	};

	return (
		<section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
			{/* Header */}
			<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Inbox className="h-5 w-5 text-muted-foreground" />
						<h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
							Thông báo
						</h1>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						{unread > 0
							? `Bạn có ${unread} thông báo chưa đọc.`
							: "Bạn đã xem tất cả các thông báo gần đây."}
					</p>
				</div>

				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={unread === 0 || markAll.isPending}
					onClick={() => markAll.mutate()}
					className="cursor-pointer gap-1.5"
				>
					<CheckCheck className="h-4 w-4" />
					Đánh dấu đã đọc tất cả
				</Button>
			</header>

			{/* Filters */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Tabs value={tab} onValueChange={handleTabChange}>
					<TabsList>
						<TabsTrigger value="all" className="cursor-pointer">
							Tất cả
						</TabsTrigger>
						<TabsTrigger value="unread" className="cursor-pointer">
							Chưa đọc
							{unread > 0 && (
								<span className="ml-1.5 rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700">
									{unread}
								</span>
							)}
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Select value={type} onValueChange={handleTypeChange}>
					<SelectTrigger className="h-9 w-full cursor-pointer sm:w-50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TYPE_OPTIONS.map((opt) => (
							<SelectItem
								key={opt.value}
								value={opt.value}
								className="cursor-pointer"
							>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* List */}
			<div className="overflow-hidden rounded-lg border border-border bg-card">
				{showSkeleton ? (
					<NotificationListSkeleton count={6} />
				) : items.length === 0 ? (
					<NotificationEmpty
						title={tab === "unread" ? "Không có thông báo chưa đọc" : undefined}
					/>
				) : (
					<ul className="divide-y divide-border">
						{items.map((n) => (
							<li key={n._id}>
								<NotificationItem
									notification={n}
									className="rounded-none px-4 py-4"
								/>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination className="mt-6">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								aria-disabled={page === 1}
								className={
									page === 1
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
						{Array.from({ length: totalPages }).map((_, i) => {
							const p = i + 1;
							return (
								<PaginationItem key={p}>
									<PaginationLink
										isActive={p === page}
										onClick={() => setPage(p)}
										className="cursor-pointer"
									>
										{p}
									</PaginationLink>
								</PaginationItem>
							);
						})}
						<PaginationItem>
							<PaginationNext
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								aria-disabled={page >= totalPages}
								className={
									page >= totalPages
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</section>
	);
}
