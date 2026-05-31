import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/common/notification";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { brandShort } from "@/lib/brand";
import {
	ArrowRight,
	Bookmark,
	Briefcase,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	UserCircle,
} from "lucide-react";

const NAV_LINKS = [
	{ to: "/jobs", label: "Việc làm", match: "/jobs" },
	{ to: "/companies", label: "Công ty", match: "/companies" },
	{ to: "/account/cv-builder", label: "Tạo CV", match: "/account/cv-builder" },
] as const;

export function Header() {
	const { isAuthenticated, user } = useAuthStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const logout = useLogout();
	const [mobileOpen, setMobileOpen] = useState(false);

	const isAdmin = user?.role?.name && user.role.name !== "NORMAL_USER";
	const isHr = user?.role?.name === "HR";
	const portalPath = isHr ? "/hr" : "/admin";
	const portalLabel = isHr ? "Trang nhà tuyển dụng" : "Trang quản trị";
	const initials = brandShort(user?.name);

	const isLinkActive = (match: string) =>
		match === "/jobs"
			? pathname === "/jobs" || pathname.startsWith("/jobs/")
			: pathname.startsWith(match);

	return (
		<header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur-[14px]">
			<div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between px-7">
				<div className="flex items-center gap-9">
					<Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
						<span className="relative grid h-9 w-9 place-items-center rounded-lg bg-ink text-teal-500">
							<Briefcase className="h-[18px] w-[18px]" />
							<span className="absolute -right-[3px] -top-[3px] h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-cream" />
						</span>
						<span className="font-display text-[19px] font-bold tracking-tight text-ink">
							JobFinder
						</span>
					</Link>
					<nav className="hidden items-center gap-1 md:flex">
						{NAV_LINKS.map((link) => {
							const active = isLinkActive(link.match);
							return (
								<Link
									key={link.to}
									to={link.to}
									className={cn(
										"relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
										active
											? "text-ink after:absolute after:-bottom-7 after:left-1/2 after:h-[3px] after:w-6 after:-translate-x-1/2 after:rounded-sm after:bg-teal-500"
											: "text-slate-600 hover:bg-line-soft hover:text-ink",
									)}
								>
									{link.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className="flex items-center gap-3">
					{isAuthenticated && user ? (
						<>
							<NotificationBell />
							<Link
								to="/account/saved-jobs"
								aria-label="Việc đã lưu"
								className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-slate-600 transition-colors hover:border-ink hover:text-ink"
							>
								<Bookmark className="h-4 w-4" />
							</Link>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-teal-500 text-[13px] font-semibold text-ink ring-2 ring-transparent ring-offset-2 ring-offset-cream transition hover:ring-teal-500/40 focus-visible:outline-none focus-visible:ring-teal-500/60"
										title="Tài khoản"
										aria-label="Tài khoản"
									>
										{initials}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56 rounded-xl border border-line bg-cream p-1.5 shadow-lg ring-0"
								>
									<div className="px-2.5 py-2">
										<p className="text-sm font-semibold text-ink">
											{user.name}
										</p>
										<p className="truncate text-xs text-slate-500">
											{user.email}
										</p>
									</div>
									<DropdownMenuSeparator className="bg-line" />
									<DropdownMenuItem
										className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 focus:bg-line-soft focus:text-ink"
										onClick={() => navigate("/profile")}
									>
										<UserCircle className="h-4 w-4" />
										Hồ sơ cá nhân
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 focus:bg-line-soft focus:text-ink"
										onClick={() => navigate("/account")}
									>
										<Settings className="h-4 w-4" />
										Quản lý tài khoản
									</DropdownMenuItem>
									{isAdmin && (
										<>
											<DropdownMenuSeparator className="bg-line" />
											<DropdownMenuItem
												className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 focus:bg-line-soft focus:text-ink"
												onClick={() => navigate(portalPath)}
											>
												<LayoutDashboard className="h-4 w-4" />
												{portalLabel}
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator className="bg-line" />
									<DropdownMenuItem
										className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
										onClick={() => {
											logout.mutate();
											navigate("/");
										}}
									>
										<LogOut className="h-4 w-4" />
										Đăng xuất
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<div className="hidden items-center gap-2 md:flex">
							<button
								className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
								onClick={() => navigate("/login")}
							>
								Đăng nhập
							</button>
							<button
								className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
								onClick={() => navigate("/register")}
							>
								Đăng ký
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					)}

					{/* Mobile menu */}
					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger asChild>
							<button
								className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-slate-600 md:hidden"
								aria-label="Mở menu"
							>
								<Menu className="h-5 w-5" />
							</button>
						</SheetTrigger>
						<SheetContent side="right" className="w-72">
							<SheetHeader>
								<SheetTitle className="text-left">Menu</SheetTitle>
							</SheetHeader>
							<nav className="mt-6 flex flex-col gap-1 px-2">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.to}
										to={link.to}
										onClick={() => setMobileOpen(false)}
										className={cn(
											"rounded-lg px-3 py-2.5 text-sm font-medium",
											isLinkActive(link.match)
												? "bg-teal-50 text-teal-700"
												: "text-slate-700 hover:bg-slate-50",
										)}
									>
										{link.label}
									</Link>
								))}
							</nav>
							{!isAuthenticated && (
								<div className="mt-6 flex flex-col gap-2 px-2">
									<button
										className="inline-flex h-10 items-center justify-center rounded-lg border border-ink text-sm font-semibold text-ink"
										onClick={() => {
											setMobileOpen(false);
											navigate("/login");
										}}
									>
										Đăng nhập
									</button>
									<button
										className="inline-flex h-10 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white"
										onClick={() => {
											setMobileOpen(false);
											navigate("/register");
										}}
									>
										Đăng ký
									</button>
								</div>
							)}
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
