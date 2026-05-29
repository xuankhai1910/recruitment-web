import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	tone?: "blue" | "rose" | "amber" | "emerald";
}

/** Header for /account/* pages — display title + optional description + action. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="mb-7 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 className="font-display text-[32px] font-bold tracking-tight text-ink">
					{title}
				</h1>
				{description && (
					<p className="mt-1.5 text-sm text-slate-600">{description}</p>
				)}
			</div>
			{action && <div className="flex items-center gap-2">{action}</div>}
		</div>
	);
}
