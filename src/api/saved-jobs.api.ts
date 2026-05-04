import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { Job } from "@/types/job";

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: Job;
  createdAt: string;
}

export interface SavedJobsQueryParams extends PaginationParams {
  name?: string;
  location?: string;
}

export interface ToggleSaveResponse {
  saved: boolean;
}

export const savedJobsApi = {
  toggleSave: (jobId: string) =>
    api.post<ApiResponse<ToggleSaveResponse>>("/saved-jobs", { jobId }),

  getSavedJobs: (params: SavedJobsQueryParams) =>
    api.get<PaginatedResponse<SavedJob>>("/saved-jobs", { params }),

  checkSaved: (jobId: string) =>
    api.get<ApiResponse<{ saved: boolean }>>(`/saved-jobs/check/${jobId}`),
};
