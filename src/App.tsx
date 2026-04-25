import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/api/auth.api";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { JobsPage } from "@/pages/JobsPage";
import { JobDetailPage } from "@/pages/JobDetailPage";
import { RecommendedJobsPage } from "@/pages/RecommendedJobsPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import CompanyPage from "@/pages/admin/CompanyPage";
import UserPage from "@/pages/admin/UserPage";
import JobPage from "@/pages/admin/JobPage";
import ResumePage from "@/pages/admin/ResumePage";
import PermissionPage from "@/pages/admin/PermissionPage";
import RolePage from "@/pages/admin/RolePage";

export default function App() {
	const { setAuth, clearAuth, setLoading, isLoading } = useAuthStore();

	useEffect(() => {
		setLoading(true);
		authApi
			.refreshToken()
			.then(({ data }) => {
				const { access_token, user } = data.data;
				setAuth(user, access_token);
			})
			.catch(() => {
				clearAuth();
			})
			.finally(() => setLoading(false));
	}, [setAuth, clearAuth, setLoading]);

	// Chặn render đến khi bootstrap auth xong -> hết flicker login/logout
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
			</div>
		);
	}

	return (
		<Routes>
			{/* Auth */}
			<Route element={<AuthLayout />}>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
			</Route>

			{/* Public */}
			<Route element={<MainLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/jobs" element={<JobsPage />} />
				<Route path="/jobs/recommended" element={<RecommendedJobsPage />} />
				<Route path="/jobs/:id" element={<JobDetailPage />} />
				<Route path="/companies" element={<CompaniesPage />} />
				<Route path="/companies/:id" element={<CompanyDetailPage />} />
			</Route>

			{/* Admin (protected) */}
			<Route element={<ProtectedRoute />}>
				<Route element={<AdminLayout />}>
					<Route path="/admin" element={<DashboardPage />} />
					<Route path="/admin/company" element={<CompanyPage />} />
					<Route path="/admin/user" element={<UserPage />} />
					<Route path="/admin/job" element={<JobPage />} />
					<Route path="/admin/resume" element={<ResumePage />} />
					<Route path="/admin/permission" element={<PermissionPage />} />
					<Route path="/admin/role" element={<RolePage />} />
				</Route>
			</Route>

			{/* Error pages */}
			<Route path="/403" element={<ForbiddenPage />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}
