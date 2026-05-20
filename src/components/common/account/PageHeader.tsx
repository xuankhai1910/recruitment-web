import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	/** Optional right-aligned action (button/link/badge). */
	action?: React.ReactNode;
	/** Optional accent color for the icon tile. Defaults to soft blue. */
	tone?: "blue" | "rose" | "amber" | "emerald";
}

const TONE_STYLES: Record<NonNullable<PageHeaderProps["tone"]>, string> = {
	blue: "bg-blue-50 text-blue-500 ring-1 ring-blue-100",
	rose: "bg-rose-50 text-rose-500 ring-1 ring-rose-100",
	amber: "bg-amber-50 text-amber-500 ring-1 ring-amber-100",
	emerald: "bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100",
};

/**
 * Consistent header for /account/* pages. Icon tile + title + optional
 * description + optional right-aligned action area. Bottom border ties it
 * to the page content visually.
 */
export function PageHeader({
	icon: Icon,
	title,
	description,
	action,
	tone = "blue",
}: PageHeaderProps) {
	return (
		<div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
			<div className="flex min-w-0 items-start gap-3">
				<div
					className={cn(
						"grid h-11 w-11 shrink-0 place-items-center rounded-xl",
						TONE_STYLES[tone],
					)}
				>
					<Icon className="h-5 w-5" />
				</div>
				<div className="min-w-0">
					<h1 className="font-heading text-lg font-semibold leading-tight text-slate-900">
						{title}
					</h1>
					{description && (
						<p className="mt-1 text-sm text-slate-500">{description}</p>
					)}
				</div>
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}
