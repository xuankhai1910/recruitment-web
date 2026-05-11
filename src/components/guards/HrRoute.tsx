import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Guard for the HR portal (`/hr/*`).
 *
 * Allowed roles:
 *  - HR (chính): truy cập đầy đủ.
 *  - SUPER_ADMIN: cho phép vào để xem/hỗ trợ — vẫn dùng được mọi action.
 *
 * Mọi role khác (NORMAL_USER, ...) bị redirect về /403.
 * Chưa đăng nhập → redirect /hr/login.
 */
export function HrRoute() {
	const { isAuthenticated, isLoading, user } = useAuthStore();

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		return <Navigate to="/hr/login" replace />;
	}

	const role = user.role?.name;
	if (role !== "HR" && role !== "SUPER_ADMIN") {
		return <Navigate to="/403" replace />;
	}

	// HR cần có company gắn vào tài khoản — nếu thiếu (do data sai), chặn lại.
	if (role === "HR" && !user.company?._id) {
		return <Navigate to="/403" replace />;
	}

	return <Outlet />;
}
