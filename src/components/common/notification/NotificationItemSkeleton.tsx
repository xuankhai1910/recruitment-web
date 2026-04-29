import { Skeleton } from "@/components/ui/skeleton";

export function NotificationItemSkeleton() {
	return (
		<div className="flex items-start gap-3 rounded-lg px-3 py-3">
			<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-3.5 w-3/4" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-1/4" />
			</div>
		</div>
	);
}

export function NotificationListSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="flex flex-col gap-1 p-1">
			{Array.from({ length: count }).map((_, i) => (
				<NotificationItemSkeleton key={i} />
			))}
		</div>
	);
}
