import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { ALL_PERMISSIONS } from "@/lib/permissions";
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
	Briefcase,
	Building2,
	ChevronDown,
	FileText,
	Home,
	Key,
	LayoutDashboard,
	LogOut,
	Shield,
	Users,
} from "lucide-react";
import type { PermissionDef } from "@/lib/permissions";
import type { ReactNode } from "react";

interface MenuItem {
	label: string;
	path: string;
	icon: ReactNode;
	permission?: PermissionDef;
}

const MENU_ITEMS: MenuItem[] = [
	{
		label: "Dashboard",
		path: "/admin",
		icon: <LayoutDashboard className="h-4 w-4" />,
	},
	{
		label: "Company",
		path: "/admin/company",
		icon: <Building2 className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.COMPANIES.GET_PAGINATE,
	},
	{
		label: "User",
		path: "/admin/user",
		icon: <Users className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.USERS.GET_PAGINATE,
	},
	{
		label: "Job",
		path: "/admin/job",
		icon: <Briefcase className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.JOBS.GET_PAGINATE,
	},
	{
		label: "Resume",
		path: "/admin/resume",
		icon: <FileText className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.RESUMES.GET_PAGINATE,
	},
	{
		label: "Permission",
		path: "/admin/permission",
		icon: <Key className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE,
	},
	{
		label: "Role",
		path: "/admin/role",
		icon: <Shield className="h-4 w-4" />,
		permission: ALL_PERMISSIONS.ROLES.GET_PAGINATE,
	},
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const logout = useLogout();

	const hasPermission = (perm?: PermissionDef) => {
		if (!perm || !user) return true;
		if (user.role.name === "SUPER_ADMIN") return true;
		return user.permissions.some(
			(p) =>
				p.apiPath === perm.apiPath &&
				p.method === perm.method &&
				p.module === perm.module,
		);
	};

	const visibleItems = MENU_ITEMS.filter((item) =>
		hasPermission(item.permission),
	);

	const isActive = (path: string) => {
		if (path === "/admin") return pathname === "/admin";
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
				<span className="font-heading text-base font-bold text-foreground">
					Job<span className="text-primary">Finder</span>
				</span>
			</Link>

			<Separator />

			{/* Nav */}
			<nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
				{visibleItems.map((item) => (
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
						{item.label}
					</Link>
				))}
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
								navigate("/login");
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
