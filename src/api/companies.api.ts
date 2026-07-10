import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  Company,
  CreateCompanyDto,
  TopCompany,
  UpdateCompanyDto,
} from '@/types/company';

export interface CompanyQueryParams extends PaginationParams {
  name?: string;
}

export const companiesApi = {
  getList: (params: CompanyQueryParams) =>
    api.get<PaginatedResponse<Company>>('/companies', { params }),

  /** Companies ranked by number of currently-recruiting jobs. */
  getTop: (limit: number) =>
    api.get<ApiResponse<TopCompany[]>>('/companies/top', { params: { limit } }),

  getById: (id: string) =>
    api.get<ApiResponse<Company>>(`/companies/${id}`),

  create: (data: CreateCompanyDto) =>
    api.post<ApiResponse<Company>>('/companies', data),

  update: (id: string, data: UpdateCompanyDto) =>
    api.patch<ApiResponse<Company>>(`/companies/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<Company>>(`/companies/${id}`),
};
