import { NavLink, Outlet } from "react-router-dom";
import {
	Bell,
	Bookmark,
	Brain,
	FileEdit,
	FileText,
	Settings,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
	to: string;
	label: string;
	icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
	{ to: "/account/cv-builder", label: "Tạo CV", icon: FileEdit },
	{ to: "/account/recommendation", label: "CV gợi ý", icon: Brain },
	{ to: "/account/resumes", label: "CV đã nộp", icon: FileText },
	{ to: "/account/saved-jobs", label: "Việc đã lưu", icon: Bookmark },
	{ to: "/account/subscriber", label: "Nhận việc", icon: Bell },
	{ to: "/account/settings", label: "Cài đặt", icon: Settings },
];

export function AccountLayout() {
	return (
		<div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl flex-col lg:flex-row">
			{/* Mobile horizontal nav */}
			<nav className="sticky top-14 z-30 flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							cn(
								"flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer",
								isActive
									? "bg-blue-50 text-blue-600 font-medium"
									: "text-foreground/70 hover:bg-accent hover:text-foreground",
							)
						}
					>
						<item.icon className="h-3.5 w-3.5" />
						{item.label}
					</NavLink>
				))}
			</nav>

			{/* Desktop sidebar */}
			<aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
				<div className="sticky top-14">
					<h2 className="font-heading text-sm font-semibold text-foreground px-4 py-3">
						Tài khoản
					</h2>
					<nav className="flex flex-col gap-0.5 px-2 pb-4">
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-150 cursor-pointer",
										isActive
											? "bg-blue-50 text-blue-600 font-medium"
											: "text-foreground/70 hover:bg-accent hover:text-foreground",
									)
								}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</NavLink>
						))}
					</nav>
				</div>
			</aside>

			{/* Content */}
			<main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
				<Outlet />
			</main>
		</div>
	);
}
