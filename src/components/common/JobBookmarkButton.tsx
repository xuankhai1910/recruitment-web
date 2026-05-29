import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface JobBookmarkButtonProps {
	jobId: string;
	variant?: "light" | "dark";
	size?: "sm" | "md";
	className?: string;
}

export function JobBookmarkButton({
	jobId,
	variant = "light",
	size = "md",
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
				"inline-flex shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-50",
				size === "md" ? "h-9 w-9" : "h-7 w-7",
				variant === "light"
					? saved
						? "border-ink bg-ink text-teal-400"
						: "border-line bg-transparent text-slate-400 hover:border-ink hover:text-ink"
					: saved
						? "border-teal-500 bg-teal-500 text-ink"
						: "border-white/15 bg-white/5 text-white/70 hover:border-teal-500 hover:bg-teal-500 hover:text-ink",
				className,
			)}
		>
			<Bookmark
				className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5", saved && "fill-current")}
			/>
		</button>
	);
}
