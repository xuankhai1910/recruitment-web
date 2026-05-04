import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { ManageAccountModal } from "@/components/common/ManageAccountModal";
import { NotificationBell } from "@/components/common/notification";
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
	Briefcase,
	ChevronDown,
	LayoutDashboard,
	LogOut,
	Settings,
} from "lucide-react";

export function Header() {
	const { isAuthenticated, user } = useAuthStore();
	const navigate = useNavigate();
	const logout = useLogout();
	const [manageOpen, setManageOpen] = useState(false);

	const isAdmin = user?.role?.name && user.role.name !== "NORMAL_USER";

	const initials = user?.name
		?.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-card">
			<ManageAccountModal open={manageOpen} onOpenChange={setManageOpen} />
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link
					to="/"
					className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
						<Briefcase className="h-4 w-4 text-primary-foreground" />
					</div>
					<span className="font-heading text-lg font-bold tracking-tight text-foreground">
						Job<span className="text-primary">Finder</span>
					</span>
				</Link>

				{/* Nav */}
				<nav className="hidden items-center gap-1 md:flex">
					{[
						{ to: "/", label: "Trang chủ" },
						{ to: "/jobs", label: "Việc làm" },
						{ to: "/companies", label: "Công ty" },
					].map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors duration-150 hover:text-primary"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Auth */}
				<div className="flex items-center gap-1.5">
					{isAuthenticated && user ? (
						<>
							<NotificationBell />
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-1.5 transition-colors duration-150 hover:bg-muted"
									>
										<Avatar className="h-7 w-7">
											<AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
												{initials}
											</AvatarFallback>
										</Avatar>
										<span className="hidden text-sm font-medium text-foreground sm:inline">
											{user.name}
										</span>
										<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
											setManageOpen(true);
										}}
									>
										<Settings className="h-4 w-4" />
										Quản lý tài khoản
									</DropdownMenuItem>
									{isAdmin && (
										<DropdownMenuItem
											className="cursor-pointer gap-2 transition-colors duration-150"
											onClick={() => {
												navigate("/admin");
											}}
										>
											<LayoutDashboard className="h-4 w-4" />
											Trang quản trị
										</DropdownMenuItem>
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
						<>
							<Button
								variant="ghost"
								className="h-9 cursor-pointer px-3 text-sm font-medium text-foreground/80 hover:text-primary"
								onClick={() => {
									navigate("/login");
								}}
							>
								Đăng nhập
							</Button>
							<Button
								className="h-9 cursor-pointer bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
								onClick={() => {
									navigate("/register");
								}}
							>
								Đăng ký
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
