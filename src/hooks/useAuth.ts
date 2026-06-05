import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  const message = (error.response?.data as { message?: string | string[] })
    ?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message || fallback;
}

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

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authApi.changePassword(data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại"));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authApi.forgotPassword(data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success(
        "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Không thể gửi email đặt lại mật khẩu"));
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      authApi.resetPassword(data).then((r) => r.data.data),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đặt lại mật khẩu thất bại"));
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
