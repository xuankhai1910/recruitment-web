import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Block NORMAL_USER from admin
  if (user?.role.name === "NORMAL_USER") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
