import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
	Bell,
	Bookmark,
	Brain,
	FileEdit,
	FileText,
	Mail,
	Settings,
	UserCircle,
	type LucideIcon,
} from "lucide-react";
import { AccountErrorBoundary } from "@/components/common/account/AccountErrorBoundary";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { brandShort } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface NavItem {
	to: string;
	label: string;
	icon: LucideIcon;
	badge?: number;
}

export function AccountLayout() {
	const { user } = useAuthStore();
	const { pathname } = useLocation();
	const unread = useNotificationStore((s) => s.unread);

	const sections: { title: string; items: NavItem[] }[] = [
		{
			title: "Hồ sơ ứng tuyển",
			items: [
				{ to: "/account/cv-builder", label: "Tạo CV", icon: FileEdit },
				{ to: "/account/recommendation", label: "CV gợi ý", icon: Brain },
				{ to: "/account/resumes", label: "Đơn ứng tuyển", icon: FileText },
				{ to: "/account/saved-jobs", label: "Việc đã lưu", icon: Bookmark },
			],
		},
		{
			title: "Tài khoản",
			items: [
				{ to: "/profile", label: "Hồ sơ cá nhân", icon: UserCircle },
				{ to: "/notifications", label: "Thông báo", icon: Bell, badge: unread },
				{ to: "/account/subscriber", label: "Nhận việc qua email", icon: Mail },
				{ to: "/account/settings", label: "Cài đặt", icon: Settings },
			],
		},
	];

	const allItems = sections.flatMap((s) => s.items);

	const linkCls = ({ isActive }: { isActive: boolean }) =>
		cn(
			"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [&_svg]:h-4 [&_svg]:w-4",
			isActive
				? "bg-ink text-white [&_svg]:text-teal-400"
				: "text-slate-600 hover:bg-line-soft hover:text-ink",
		);

	return (
		<div className="py-12">
			<div className="mx-auto max-w-[1280px] px-7">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
					<aside className="hidden self-start rounded-xl border border-line bg-white p-4 lg:sticky lg:top-24 lg:block">
						<div className="mb-3 flex items-center gap-3 rounded-lg bg-cream p-3">
							<div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-500 text-[15px] font-semibold text-ink">
								{brandShort(user?.name)}
							</div>
							<div className="min-w-0">
								<div className="truncate font-display text-[15px] font-semibold text-ink">
									{user?.name}
								</div>
								<div className="truncate text-xs text-slate-600">{user?.email}</div>
							</div>
						</div>
						<nav className="flex flex-col gap-0.5">
							{sections.map((section) => (
								<div key={section.title}>
									<div className="px-3 pb-1.5 pt-3 font-mono-jb text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
										{section.title}
									</div>
									{section.items.map((item) => (
										<NavLink key={item.to} to={item.to} end className={linkCls}>
											<item.icon />
											<span className="flex-1">{item.label}</span>
											{item.badge ? (
												<span className="rounded-full bg-rose-400 px-1.5 font-mono-jb text-[10px] font-bold text-white">
													{item.badge > 99 ? "99+" : item.badge}
												</span>
											) : null}
										</NavLink>
									))}
								</div>
							))}
						</nav>
					</aside>

					{/* Mobile nav */}
					<nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden">
						{allItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								end
								className={({ isActive }) =>
									cn(
										"flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium [&_svg]:h-3.5 [&_svg]:w-3.5",
										isActive
											? "border-ink bg-ink text-white"
											: "border-line bg-white text-slate-600",
									)
								}
							>
								<item.icon />
								{item.label}
							</NavLink>
						))}
					</nav>

					<main className="min-w-0">
						<AccountErrorBoundary resetKey={pathname}>
							<Outlet />
						</AccountErrorBoundary>
					</main>
				</div>
			</div>
		</div>
	);
}
