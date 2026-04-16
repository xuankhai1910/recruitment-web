import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/api/auth.api";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import CompanyPage from "@/pages/admin/CompanyPage";
import UserPage from "@/pages/admin/UserPage";
import JobPage from "@/pages/admin/JobPage";
import JobUpsert from "@/components/admin/job/JobUpsert";
import ResumePage from "@/pages/admin/ResumePage";
import PermissionPage from "@/pages/admin/PermissionPage";
import RolePage from "@/pages/admin/RolePage";

export default function App() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    authApi
      .refreshToken()
      .then(({ data }) => {
        const { access_token, user } = data.data;
        setAuth(user, access_token);
      })
      .catch(() => {
        clearAuth();
      });
  }, [setAuth, clearAuth]);

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
      </Route>

      {/* Admin (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/company" element={<CompanyPage />} />
          <Route path="/admin/user" element={<UserPage />} />
          <Route path="/admin/job" element={<JobPage />} />
          <Route path="/admin/job/upsert" element={<JobUpsert />} />
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
