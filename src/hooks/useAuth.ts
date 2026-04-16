import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { toast } from "sonner";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      authApi.login(data).then((r) => r.data.data),
    onSuccess: ({ access_token, user }) => {
      setAuth(user, access_token);
      toast.success("Đăng nhập thành công");
    },
    onError: () => {
      toast.error("Email hoặc mật khẩu không đúng");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      authApi.register(data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success("Đăng ký thành công");
    },
    onError: () => {
      toast.error("Đăng ký thất bại");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Đã đăng xuất");
    },
  });
}
