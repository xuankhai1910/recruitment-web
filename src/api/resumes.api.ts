import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  Resume,
  CreateResumeDto,
  UpdateResumeStatusDto,
  ResumeMatchResult,
  MatchBatchQuota,
  MatchBatchStart,
} from '@/types/resume';

export interface ResumeQueryParams extends PaginationParams {
  status?: string;
  email?: string;
  userId?: string;
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

  // HR: chấm độ phù hợp CV ứng viên với tin tuyển dụng đã ứng tuyển.
  analyzeMatch: (id: string) =>
    api.post<ApiResponse<ResumeMatchResult>>(
      `/cv-analysis/resumes/${id}/match`,
    ),

  // HR: hạn mức phân tích hàng loạt còn lại trong tháng (theo công ty).
  getMatchBatchQuota: () =>
    api.get<ApiResponse<MatchBatchQuota>>(
      '/cv-analysis/resumes/match-batch/quota',
    ),

  // HR: bắt đầu 1 lượt "phân tích tất cả" → trả danh sách resumeIds cần chấm.
  startMatchBatch: () =>
    api.post<ApiResponse<MatchBatchStart>>(
      '/cv-analysis/resumes/match-batch/start',
    ),

  delete: (id: string) =>
    api.delete<ApiResponse<Resume>>(`/resumes/${id}`),
};
