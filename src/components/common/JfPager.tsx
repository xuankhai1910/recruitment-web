import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JfPagerProps {
	page: number;
	totalPages: number;
	onChange: (next: number) => void;
}

const btn =
	"grid h-10 min-w-10 place-items-center rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-slate-700 transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40";

export function JfPager({ page, totalPages, onChange }: JfPagerProps) {
	if (totalPages <= 1) return null;

	const nums: (number | "…")[] = [1];
	const start = Math.max(2, page - 1);
	const end = Math.min(totalPages - 1, page + 1);
	if (start > 2) nums.push("…");
	for (let i = start; i <= end; i++) nums.push(i);
	if (end < totalPages - 1) nums.push("…");
	if (totalPages > 1) nums.push(totalPages);

	return (
		<div className="mt-10 flex items-center justify-center gap-1.5">
			<button
				className={btn}
				disabled={page <= 1}
				onClick={() => onChange(page - 1)}
				aria-label="Trang trước"
			>
				<ChevronLeft className="h-3.5 w-3.5" />
			</button>
			{nums.map((n, i) =>
				n === "…" ? (
					<span key={`el-${i}`} className="px-1 text-slate-400">
						…
					</span>
				) : (
					<button
						key={n}
						className={cn(btn, n === page && "border-ink bg-ink text-white")}
						onClick={() => onChange(n)}
					>
						{n}
					</button>
				),
			)}
			<button
				className={btn}
				disabled={page >= totalPages}
				onClick={() => onChange(page + 1)}
				aria-label="Trang sau"
			>
				<ChevronRight className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}
