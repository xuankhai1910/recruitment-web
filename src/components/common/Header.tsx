import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/common/notification";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import {
	pushRecentSearch,
	SearchAutocomplete,
} from "@/components/common/SearchAutocomplete";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
	Briefcase,
	ChevronDown,
	Flame,
	LayoutDashboard,
	LogOut,
	Search,
	Settings,
	Sparkles,
	UserCircle,
	X,
} from "lucide-react";

const SUB_NAV = [
	{ to: "/jobs?sort=-createdAt", label: "Việc làm hot", icon: Flame, exactMatch: false, matchPath: "/jobs" },
	{ to: "/jobs", label: "Việc làm", icon: null, matchPath: "/jobs" },
	{ to: "/companies", label: "Công ty", icon: null, matchPath: "/companies" },
	{ to: "/tools/salary-calculator", label: "Công cụ", icon: null, matchPath: "/tools" },
	{ to: "/account/recommendations", label: "Gợi ý cho bạn", icon: Sparkles, matchPath: "/account/recommendations" },
] as const;

export function Header() {
	const { isAuthenticated, user } = useAuthStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const logout = useLogout();
	const [keyword, setKeyword] = useState("");
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

	const isAdmin = user?.role?.name && user.role.name !== "NORMAL_USER";
	const isHr = user?.role?.name === "HR";
	const portalPath = isHr ? "/hr" : "/admin";
	const portalLabel = isHr ? "Trang nhà tuyển dụng" : "Trang quản trị";
	const isJobsListPage = pathname === "/jobs";
	const showHeaderSearch = !isJobsListPage;

	const initials = user?.name
		?.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const handleSearchSubmit = (term = keyword) => {
		const trimmed = term.trim();
		if (!trimmed) return;

		pushRecentSearch(trimmed);
		setMobileSearchOpen(false);

		const params = new URLSearchParams({
			keyword: trimmed,
			current: "1",
			pageSize: "5",
		});
		navigate(`/jobs?${params.toString()}`);
	};

	const onSearchFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		handleSearchSubmit();
	};

	const renderSearchInput = () => (
		<SearchAutocomplete
			value={keyword}
			onChange={setKeyword}
			onSelect={handleSearchSubmit}
			placeholder="Tìm công việc, kỹ năng, công ty..."
			className="w-full"
			inputClassName="h-9 rounded-full border border-slate-200 bg-white text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder:text-slate-500"
		/>
	);

	const isLinkActive = (matchPath: string) =>
		matchPath === "/jobs"
			? pathname === "/jobs"
			: pathname.startsWith(matchPath);

	return (
		<header className="sticky top-0 z-50 bg-white dark:bg-slate-950">
			{/* Top tier: logo · search · user */}
			<div className="border-b border-slate-100 dark:border-slate-800">
				<div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
					{/* Logo */}
					<Link
						to="/"
						className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
					>
						<span className="grid h-7 w-7 place-items-center rounded-md bg-blue-500/10 text-blue-500">
							<Briefcase className="h-4 w-4" />
						</span>
						<span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
							Job<span className="text-blue-500">Finder</span>
						</span>
					</Link>

					{showHeaderSearch ? (
						<form
							onSubmit={onSearchFormSubmit}
							className="hidden w-full justify-center md:flex"
						>
							<div className="w-full max-w-xl">{renderSearchInput()}</div>
						</form>
					) : (
						<div />
					)}

					<div className="flex items-center gap-2">
						{showHeaderSearch && (
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 cursor-pointer rounded-full text-slate-600 hover:bg-slate-100 hover:text-blue-500 md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
								aria-label={mobileSearchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
								onClick={() => {
									setMobileSearchOpen((open) => !open);
								}}
							>
								{mobileSearchOpen ? (
									<X className="h-4 w-4" />
								) : (
									<Search className="h-4 w-4" />
								)}
							</Button>
						)}

						{/* Auth */}
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
											<p className="font-heading text-sm font-semibold text-foreground">
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
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									className="h-8 cursor-pointer px-2 text-sm font-medium text-slate-600 hover:bg-transparent hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
									onClick={() => {
										navigate("/login");
									}}
								>
									Đăng nhập
								</Button>
								<Button
									className="h-8 cursor-pointer rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600"
									onClick={() => {
										navigate("/register");
									}}
								>
									Đăng ký
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bottom tier: sub-nav links (hidden on mobile to save space) */}
			<div className="hidden border-b border-slate-100 md:block dark:border-slate-800">
				<nav className="mx-auto flex h-10 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
					{SUB_NAV.map((link) => {
						const active = isLinkActive(link.matchPath);
						const Icon = link.icon;
						return (
							<Link
								key={link.label}
								to={link.to}
								className={cn(
									"relative inline-flex h-10 cursor-pointer items-center gap-1.5 px-3 text-sm font-medium transition-colors duration-150",
									active
										? "text-blue-600"
										: "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400",
								)}
							>
								{Icon && (
									<Icon
										className={cn(
											"h-3.5 w-3.5",
											link.label === "Việc làm hot" && "text-orange-500",
										)}
									/>
								)}
								{link.label}
								{active && (
									<span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-blue-500" />
								)}
							</Link>
						);
					})}
				</nav>
			</div>

			{showHeaderSearch && mobileSearchOpen && (
				<div className="border-t border-slate-100 px-4 py-2 md:hidden dark:border-slate-800">
					<form onSubmit={onSearchFormSubmit} className="mx-auto max-w-7xl">
						{renderSearchInput()}
					</form>
				</div>
			)}
		</header>
	);
}
