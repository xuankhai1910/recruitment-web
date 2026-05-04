import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user";

export interface UserQueryParams extends PaginationParams {
  name?: string;
  email?: string;
}

export const usersApi = {
  getList: (params: UserQueryParams) =>
    api.get<PaginatedResponse<User>>("/users", { params }),

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserDto) => api.post<ApiResponse<User>>("/users", data),

  update: (id: string, data: UpdateUserDto) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<User>>(`/users/${id}`),

  updateJobSeeking: (data: { isJobSeeking: boolean }) =>
    api.patch<ApiResponse<User>>("/users/job-seeking", data),
};
