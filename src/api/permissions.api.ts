import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { Permission, CreatePermissionDto } from '@/types/permission';

export const permissionsApi = {
  getList: (params: PaginationParams) =>
    api.get<PaginatedResponse<Permission>>('/permissions', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Permission>>(`/permissions/${id}`),

  create: (data: CreatePermissionDto) =>
    api.post<ApiResponse<Permission>>('/permissions', data),

  update: (id: string, data: Partial<CreatePermissionDto>) =>
    api.patch<ApiResponse<Permission>>(`/permissions/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<Permission>>(`/permissions/${id}`),
};
