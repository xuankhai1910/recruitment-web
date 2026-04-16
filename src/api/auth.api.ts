import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshResponse,
  AccountResponse,
} from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<{ _id: string; createdAt: string }>>('/auth/register', data),

  refreshToken: () =>
    api.get<ApiResponse<RefreshResponse>>('/auth/refresh'),

  getAccount: () =>
    api.get<ApiResponse<AccountResponse>>('/auth/account'),

  logout: () =>
    api.post<ApiResponse<string>>('/auth/logout'),
};
