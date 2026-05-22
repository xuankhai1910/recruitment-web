import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
	Bell,
	Bookmark,
	Brain,
	FileEdit,
	FileText,
	Settings,
	type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AccountErrorBoundary } from "@/components/common/account/AccountErrorBoundary";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface NavItem {
	to: string;
	label: string;
	icon: LucideIcon;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
	{
		title: "Hồ sơ ứng tuyển",
		items: [
			{ to: "/account/cv-builder", label: "Tạo CV", icon: FileEdit },
			{ to: "/account/recommendation", label: "CV gợi ý", icon: Brain },
			{ to: "/account/resumes", label: "CV đã nộp", icon: FileText },
			{ to: "/account/saved-jobs", label: "Việc đã lưu", icon: Bookmark },
		],
	},
	{
		title: "Tài khoản",
		items: [
			{ to: "/account/subscriber", label: "Nhận việc qua email", icon: Bell },
			{ to: "/account/settings", label: "Cài đặt", icon: Settings },
		],
	},
];

function getInitials(name?: string) {
	if (!name) return "";
	return name
		.split(" ")
		.map((w) => w[0])
		.filter(Boolean)
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function AccountLayout() {
	const { user } = useAuthStore();
	const { pathname } = useLocation();
	const allItems = NAV_SECTIONS.flatMap((s) => s.items);

	return (
		<div className="min-h-[calc(100vh-6rem)] bg-slate-50/50">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
				{/* Mobile horizontal nav */}
				<nav className="sticky top-24 z-30 -mx-4 flex gap-1 overflow-x-auto border-b border-slate-200/70 bg-white/80 px-4 py-2.5 backdrop-blur lg:hidden">
					{allItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								cn(
									"flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors duration-150",
									isActive
										? "bg-blue-50 font-medium text-blue-600"
										: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
								)
							}
						>
							<item.icon className="h-3.5 w-3.5" />
							{item.label}
						</NavLink>
					))}
				</nav>

				{/* Desktop sidebar */}
				<aside className="hidden w-64 shrink-0 lg:block">
					<div className="sticky top-24 space-y-4">
						{/* User mini-card */}
						{user && (
							<div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-100">
								<div className="flex items-center gap-3">
									<Avatar className="h-11 w-11 ring-2 ring-blue-50">
										<AvatarFallback className="bg-blue-50 text-sm font-semibold text-blue-600">
											{getInitials(user.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="truncate font-heading text-sm font-semibold text-slate-900">
											{user.name}
										</p>
										<p className="truncate text-xs text-slate-500">
											{user.email}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Nav sections */}
						<nav className="rounded-2xl border border-slate-200/70 bg-white p-2 shadow-sm shadow-slate-100">
							{NAV_SECTIONS.map((section, idx) => (
								<div key={section.title} className={cn(idx > 0 && "mt-3")}>
									<p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
										{section.title}
									</p>
									<div className="flex flex-col gap-0.5">
										{section.items.map((item) => (
											<NavLink
												key={item.to}
												to={item.to}
												end
												className={({ isActive }) =>
													cn(
														"group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
														isActive
															? "bg-blue-50 font-medium text-blue-600"
															: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
													)
												}
											>
												{({ isActive }) => (
													<>
														{isActive && (
															<span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-blue-500" />
														)}
														<item.icon
															className={cn(
																"h-4 w-4 shrink-0 transition-colors",
																isActive
																	? "text-blue-500"
																	: "text-slate-400 group-hover:text-slate-600",
															)}
														/>
														{item.label}
													</>
												)}
											</NavLink>
										))}
									</div>
								</div>
							))}
						</nav>
					</div>
				</aside>

				{/* Content */}
				<main className="min-w-0 flex-1">
					<AccountErrorBoundary resetKey={pathname}>
						<Outlet />
					</AccountErrorBoundary>
				</main>
			</div>
		</div>
	);
}
