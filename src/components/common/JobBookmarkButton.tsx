import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface JobBookmarkButtonProps {
	jobId: string;
	className?: string;
}

export function JobBookmarkButton({
	jobId,
	className,
}: JobBookmarkButtonProps) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const { data: savedCheck } = useCheckSaved(isAuthenticated ? jobId : "");
	const toggle = useToggleSaveJob();
	const saved = savedCheck ?? false;

	const handleBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) {
			toast.error("Đăng nhập để lưu việc làm");
			return;
		}
		toggle.mutate(jobId);
	};

	return (
		<button
			type="button"
			onClick={handleBookmark}
			disabled={toggle.isPending}
			aria-label={saved ? "Bỏ lưu" : "Lưu việc làm"}
			className={cn(
				"inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70",
				className,
				saved && "border-blue-400 bg-blue-50 text-blue-600",
			)}
		>
			{saved ? (
				<BookmarkCheck className="h-4 w-4" />
			) : (
				<Bookmark className="h-4 w-4" />
			)}
		</button>
	);
}
