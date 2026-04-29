import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { Role, CreateRoleDto } from "@/types/role";

export const rolesApi = {
  getList: (params: PaginationParams) =>
    api.get<PaginatedResponse<Role>>("/roles", { params }),

  getById: (id: string) => api.get<ApiResponse<Role>>(`/roles/${id}`),

  getListForRegister: () => api.post<ApiResponse<Role[]>>("/roles/public"),

  create: (data: CreateRoleDto) => api.post<ApiResponse<Role>>("/roles", data),

  update: (id: string, data: Partial<CreateRoleDto>) =>
    api.patch<ApiResponse<Role>>(`/roles/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<Role>>(`/roles/${id}`),
};
