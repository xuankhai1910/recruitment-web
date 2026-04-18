import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { Resume, CreateResumeDto, UpdateResumeStatusDto } from '@/types/resume';

export interface ResumeQueryParams extends PaginationParams {
  status?: string;
  email?: string;
  populate?: string;
  fields?: string;
}

export const resumesApi = {
  getList: (params: ResumeQueryParams) =>
    api.get<PaginatedResponse<Resume>>('/resumes', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Resume>>(`/resumes/${id}`),

  create: (data: CreateResumeDto) =>
    api.post<ApiResponse<Resume>>('/resumes', data),

  getByUser: () =>
    api.post<ApiResponse<Resume[]>>('/resumes/by-user'),

  updateStatus: (id: string, data: UpdateResumeStatusDto) =>
    api.patch<ApiResponse<Resume>>(`/resumes/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<Resume>>(`/resumes/${id}`),
};
