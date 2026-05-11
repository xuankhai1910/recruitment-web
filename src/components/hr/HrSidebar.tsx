import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Bell,
	Building2,
	ChevronDown,
	FileText,
	Home,
	LayoutDashboard,
	LogOut,
	Briefcase,
	Users2,
} from "lucide-react";
import type { ReactNode } from "react";

interface MenuItem {
	label: string;
	path: string;
	icon: ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
	{
		label: "Tổng quan",
		path: "/hr",
		icon: <LayoutDashboard className="h-4 w-4" />,
	},
	{
		label: "Tin tuyển dụng",
		path: "/hr/jobs",
		icon: <Briefcase className="h-4 w-4" />,
	},
	{
		label: "Hồ sơ ứng tuyển",
		path: "/hr/resumes",
		icon: <FileText className="h-4 w-4" />,
	},
	{
		label: "Ứng viên",
		path: "/hr/candidates",
		icon: <Users2 className="h-4 w-4" />,
	},
	{
		label: "Thông báo",
		path: "/hr/notifications",
		icon: <Bell className="h-4 w-4" />,
	},
	{
		label: "Hồ sơ công ty",
		path: "/hr/company",
		icon: <Building2 className="h-4 w-4" />,
	},
];

export function HrSidebar({ onNavigate }: { onNavigate?: () => void }) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const unread = useNotificationStore((s) => s.unread);
	const logout = useLogout();

	const isActive = (path: string) => {
		if (path === "/hr") return pathname === "/hr" || pathname === "/hr/";
		return pathname.startsWith(path);
	};

	const initials = user?.name
		?.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="flex h-full flex-col">
			{/* Logo */}
			<Link to="/" className="flex h-14 items-center gap-2 px-4">
				<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
					<Briefcase className="h-3.5 w-3.5 text-primary-foreground" />
				</div>
				<div className="flex flex-col leading-none">
					<span className="font-heading text-base font-bold text-foreground">
						Job<span className="text-primary">Finder</span>
					</span>
					<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Nhà tuyển dụng
					</span>
				</div>
			</Link>

			<Separator />

			{/* Company badge */}
			{user?.company?.name && (
				<div className="mx-2 mt-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2">
					<p className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Công ty
					</p>
					<p className="truncate text-xs font-semibold text-foreground">
						{user.company.name}
					</p>
				</div>
			)}

			{/* Nav */}
			<nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto p-2">
				{MENU_ITEMS.map((item) => {
					const showBadge = item.path === "/hr/notifications" && unread > 0;
					return (
						<Link
							key={item.path}
							to={item.path}
							onClick={onNavigate}
							className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
								isActive(item.path)
									? "bg-primary/10 text-primary"
									: "text-foreground/70 hover:bg-accent hover:text-foreground"
							}`}
						>
							{item.icon}
							<span className="flex-1">{item.label}</span>
							{showBadge && (
								<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-none text-white tabular-nums">
									{unread > 99 ? "99+" : unread}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			<Separator />

			{/* User */}
			<div className="p-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-auto w-full cursor-pointer justify-start gap-2.5 px-2 py-2"
						>
							<Avatar className="h-7 w-7">
								<AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 overflow-hidden text-left">
								<p className="truncate text-xs font-medium leading-none">
									{user?.name}
								</p>
								<p className="mt-0.5 truncate text-[11px] text-muted-foreground">
									{user?.role.name}
								</p>
							</div>
							<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem
							className="cursor-pointer gap-2"
							onClick={() => {
								navigate("/");
								onNavigate?.();
							}}
						>
							<Home className="h-4 w-4" />
							Trang chủ
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer gap-2 text-destructive focus:text-destructive"
							onClick={() => {
								logout.mutate();
								navigate("/hr/login");
							}}
						>
							<LogOut className="h-4 w-4" />
							Đăng xuất
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
