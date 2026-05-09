import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { Job, CreateJobDto } from "@/types/job";

export interface JobQueryParams extends PaginationParams {
  name?: string;
  location?: string;
  "salary[$gte]"?: number;
  "salary[$lte]"?: number;
  level?: string;
  skills?: string;
  isActive?: boolean;
  "company._id"?: string;
  /** Free-text search across job name, skills and company name (BE handles OR + alnum-tolerant matching). */
  keyword?: string;
}

export const jobsApi = {
  // Public — dùng cho guest pages, không filter theo user
  getList: (params: JobQueryParams) =>
    api.get<PaginatedResponse<Job>>("/jobs", { params }),

  // Protected — dùng cho admin panel, auto filter theo company nếu user là HR
  getListByAdmin: (params: JobQueryParams) =>
    api.post<PaginatedResponse<Job>>("/jobs/by-admin", null, { params }),

  getById: (id: string) => api.get<ApiResponse<Job>>(`/jobs/${id}`),

  getSimilar: (id: string) =>
    api.get<ApiResponse<Job[]>>(`/jobs/${id}/similar`),

  create: (data: CreateJobDto) => api.post<ApiResponse<Job>>("/jobs", data),

  update: (id: string, data: Partial<CreateJobDto>) =>
    api.patch<ApiResponse<Job>>(`/jobs/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<Job>>(`/jobs/${id}`),
};
