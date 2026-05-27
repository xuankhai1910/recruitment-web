import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/common/notification";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
	Briefcase,
	ChevronDown,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	UserCircle,
} from "lucide-react";

const NAV_LINKS = [
	{ to: "/jobs", label: "Việc làm", matchPath: "/jobs" },
	{ to: "/companies", label: "Công ty", matchPath: "/companies" },
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

	const initials = user?.name
		?.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const isLinkActive = (matchPath: string) =>
		matchPath === "/jobs"
			? pathname === "/jobs"
			: pathname.startsWith(matchPath);

	return (
		<header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8 pointer-events-none">
			<div className="pointer-events-auto mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-md supports-backdrop-filter:bg-white/80 dark:border-slate-800 dark:bg-slate-950/90 dark:supports-backdrop-filter:bg-slate-950/80">
			<div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: Logo + Nav */}
				<div className="flex items-center gap-8">
					<Link
						to="/"
						className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
					>
						<span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
							<Briefcase className="h-4 w-4" />
						</span>
						<span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
							Job<span className="text-blue-500">Finder</span>
						</span>
					</Link>

					<nav className="hidden items-center gap-1 md:flex">
						{NAV_LINKS.map((link) => {
							const active = isLinkActive(link.matchPath);
							return (
								<Link
									key={link.label}
									to={link.to}
									className={cn(
										"relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors duration-150",
										active
											? "text-blue-600"
											: "text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400",
									)}
								>
									{link.label}
									{active && (
										<span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />
									)}
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Right: Auth */}
				<div className="flex items-center gap-2">
					{isAuthenticated && user ? (
						<>
							<ThemeToggle />
							<NotificationBell />
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex h-9 cursor-pointer items-center gap-2 rounded-full px-1.5 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
									>
										<Avatar className="h-8 w-8">
											<AvatarFallback className="bg-blue-50 text-xs font-semibold text-blue-600">
												{initials}
											</AvatarFallback>
										</Avatar>
										<span className="hidden text-sm font-medium text-slate-700 sm:inline dark:text-slate-200">
											{user.name}
										</span>
										<ChevronDown className="h-3.5 w-3.5 text-slate-500" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-52">
									<div className="px-3 py-2.5">
										<p className="text-sm font-semibold text-foreground">
											{user.name}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{user.email}
										</p>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="cursor-pointer gap-2 transition-colors duration-150"
										onClick={() => {
											navigate("/profile");
										}}
									>
										<UserCircle className="h-4 w-4" />
										Hồ sơ cá nhân
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer gap-2 transition-colors duration-150"
										onClick={() => {
											navigate("/account");
										}}
									>
										<Settings className="h-4 w-4" />
										Quản lý tài khoản
									</DropdownMenuItem>
									{isAdmin && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer gap-2 transition-colors duration-150"
												onClick={() => {
													navigate(portalPath);
												}}
											>
												<LayoutDashboard className="h-4 w-4" />
												{portalLabel}
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="cursor-pointer gap-2 text-destructive transition-colors duration-150 focus:text-destructive"
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
							<Button
								variant="outline"
								className="h-9 cursor-pointer rounded-full border-blue-200 px-5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
								onClick={() => {
									navigate("/login");
								}}
							>
								Đăng nhập
							</Button>
							<Button
								className="h-9 cursor-pointer rounded-full bg-blue-600 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
								onClick={() => {
									navigate("/register");
								}}
							>
								Đăng ký
							</Button>
						</div>
					)}

					{/* Mobile menu trigger */}
					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 cursor-pointer md:hidden"
								aria-label="Mở menu"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-72">
							<SheetHeader>
								<SheetTitle className="text-left">Menu</SheetTitle>
							</SheetHeader>
							<nav className="mt-6 flex flex-col gap-1 px-2">
								{NAV_LINKS.map((link) => {
									const active = isLinkActive(link.matchPath);
									return (
										<Link
											key={link.label}
											to={link.to}
											onClick={() => setMobileOpen(false)}
											className={cn(
												"rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
												active
													? "bg-blue-50 text-blue-600"
													: "text-slate-700 hover:bg-slate-50",
											)}
										>
											{link.label}
										</Link>
									);
								})}
							</nav>
							{!isAuthenticated && (
								<div className="mt-6 flex flex-col gap-2 px-2">
									<Button
										variant="outline"
										className="w-full rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
										onClick={() => {
											setMobileOpen(false);
											navigate("/login");
										}}
									>
										Đăng nhập
									</Button>
									<Button
										className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
										onClick={() => {
											setMobileOpen(false);
											navigate("/register");
										}}
									>
										Đăng ký
									</Button>
								</div>
							)}
						</SheetContent>
					</Sheet>
				</div>
			</div>
			</div>
		</header>
	);
}
