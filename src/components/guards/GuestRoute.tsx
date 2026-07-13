import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { getHomeRouteForRole } from "@/lib/roles";

/**
 * Guard cho các trang auth (/login, /register, /hr/login, ...).
 * Nếu đã đăng nhập -> đá thẳng về trang chủ tương ứng theo role,
 * kể cả khi user bấm back/forward hoặc gõ thẳng URL /login.
 */
export function GuestRoute() {
	const { isAuthenticated, isLoading, user } = useAuthStore();

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isAuthenticated && user) {
		return <Navigate to={getHomeRouteForRole(user.role?.name)} replace />;
	}

	return <Outlet />;
}
