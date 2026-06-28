import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  PasswordActionResponse,
  RegisterRequest,
  ResetPasswordRequest,
  RefreshResponse,
  AccountResponse,
} from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  googleLogin: (data: GoogleLoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/google', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<{ _id: string; createdAt: string }>>('/auth/register', data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<ApiResponse<PasswordActionResponse>>('/auth/change-password', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<PasswordActionResponse>>('/auth/reset-password', data),

  refreshToken: () =>
    api.get<ApiResponse<RefreshResponse>>('/auth/refresh'),

  getAccount: () =>
    api.get<ApiResponse<AccountResponse>>('/auth/account'),

  logout: () =>
    api.post<ApiResponse<string>>('/auth/logout'),
};
